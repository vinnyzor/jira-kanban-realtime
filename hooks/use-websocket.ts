"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { io, type Socket } from "socket.io-client"

interface User {
  id: string
  name: string
  avatar: string
  initials: string
}

interface UseWebSocketReturn {
  socket: Socket | null
  isConnected: boolean
  emit: (event: string, data: any) => Promise<any>
}

export function useWebSocket(user: User): UseWebSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    // Conectar ao servidor WebSocket
    const socketInstance = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3001", {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 20000,
    })

    // Event listeners
    socketInstance.on("connect", () => {
      console.log("Conectado ao WebSocket")
      setIsConnected(true)
      reconnectAttempts.current = 0

      // Registrar usuário no servidor
      socketInstance.emit("user_join", user)
    })

    socketInstance.on("disconnect", (reason) => {
      console.log("Desconectado do WebSocket:", reason)
      setIsConnected(false)
    })

    socketInstance.on("connect_error", (error) => {
      console.error("Erro de conexão WebSocket:", error)
      setIsConnected(false)
      reconnectAttempts.current++

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error("Máximo de tentativas de reconexão atingido")
      }
    })

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log(`Reconectado após ${attemptNumber} tentativas`)
      setIsConnected(true)
      reconnectAttempts.current = 0
    })

    socketInstance.on("reconnect_error", (error) => {
      console.error("Erro na reconexão:", error)
    })

    socketInstance.on("reconnect_failed", () => {
      console.error("Falha na reconexão após todas as tentativas")
      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user])

  const emit = useCallback(
    (event: string, data: any): Promise<any> => {
      return new Promise((resolve, reject) => {
        if (!socket || !isConnected) {
          reject(new Error("WebSocket não conectado"))
          return
        }

        // Timeout para a resposta
        const timeout = setTimeout(() => {
          reject(new Error("Timeout na resposta do servidor"))
        }, 10000)

        socket.emit(event, data, (response: any) => {
          clearTimeout(timeout)
          if (response.error) {
            reject(new Error(response.error))
          } else {
            resolve(response)
          }
        })
      })
    },
    [socket, isConnected],
  )

  return {
    socket,
    isConnected,
    emit,
  }
}
