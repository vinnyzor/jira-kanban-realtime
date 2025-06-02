import type { NextRequest } from "next/server"
import { Server } from "socket.io"
import { createServer } from "http"

// Tipos
interface User {
  id: string
  name: string
  avatar: string
  initials: string
  socketId: string
  lastSeen: string
}

interface Task {
  id: string
  title: string
  description: string
  assignee: {
    name: string
    avatar: string
    initials: string
  }
  priority: "low" | "medium" | "high" | "urgent"
  type: "story" | "bug" | "task" | "epic"
  comments: number
  attachments: number
  dueDate?: string
  lastModified?: string
  modifiedBy?: string
}

interface Column {
  id: string
  title: string
  tasks: Task[]
  color: string
}

interface RealtimeEvent {
  type: "task_moved" | "task_created" | "task_updated" | "task_deleted" | "user_joined" | "user_left"
  data: any
  userId: string
  userName: string
  timestamp: string
}

// Estado global do servidor
const onlineUsers: Map<string, User> = new Map()
const boardState: Column[] = [
  {
    id: "todo",
    title: "To Do",
    color: "bg-gray-100",
    tasks: [
      {
        id: "task-1",
        title: "Implementar autenticação de usuário",
        description: "Criar sistema de login e registro com validação",
        assignee: {
          name: "João Silva",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "JS",
        },
        priority: "high",
        type: "story",
        comments: 3,
        attachments: 2,
        dueDate: "2024-01-15",
      },
    ],
  },
  {
    id: "inprogress",
    title: "In Progress",
    color: "bg-blue-50",
    tasks: [],
  },
  {
    id: "review",
    title: "Code Review",
    color: "bg-yellow-50",
    tasks: [],
  },
  {
    id: "done",
    title: "Done",
    color: "bg-green-50",
    tasks: [],
  },
]

let io: Server

// Função para inicializar o servidor WebSocket
function initializeWebSocketServer() {
  if (io) return io

  const httpServer = createServer()
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
  })

  io.on("connection", (socket) => {
    console.log(`Cliente conectado: ${socket.id}`)

    // Usuário se junta ao projeto
    socket.on("user_join", (user: Omit<User, "socketId" | "lastSeen">) => {
      const fullUser: User = {
        ...user,
        socketId: socket.id,
        lastSeen: new Date().toISOString(),
      }

      onlineUsers.set(socket.id, fullUser)

      // Enviar estado atual do board para o novo usuário
      socket.emit("board_state", boardState)

      // Notificar todos sobre o novo usuário
      io.emit("users_update", Array.from(onlineUsers.values()))

      // Broadcast evento de usuário entrando
      socket.broadcast.emit("realtime_event", {
        type: "user_joined",
        data: { user: fullUser },
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString(),
      })

      console.log(`Usuário ${user.name} entrou no projeto`)
    })

    // Mover tarefa
    socket.on("move_task", (data, callback) => {
      try {
        const { taskId, sourceColumnId, destinationColumnId, destinationIndex, timestamp } = data
        const user = onlineUsers.get(socket.id)

        if (!user) {
          callback({ error: "Usuário não encontrado" })
          return
        }

        // Encontrar e mover a tarefa no estado do servidor
        const sourceColumn = boardState.find((col) => col.id === sourceColumnId)
        const destColumn = boardState.find((col) => col.id === destinationColumnId)

        if (!sourceColumn || !destColumn) {
          callback({ error: "Coluna não encontrada" })
          return
        }

        const taskIndex = sourceColumn.tasks.findIndex((task) => task.id === taskId)
        if (taskIndex === -1) {
          callback({ error: "Tarefa não encontrada" })
          return
        }

        const task = sourceColumn.tasks[taskIndex]

        // Remover da coluna de origem
        sourceColumn.tasks.splice(taskIndex, 1)

        // Adicionar à coluna de destino
        destColumn.tasks.splice(destinationIndex, 0, {
          ...task,
          lastModified: timestamp,
          modifiedBy: user.name,
        })

        // Broadcast para todos os outros clientes
        socket.broadcast.emit("realtime_event", {
          type: "task_moved",
          data: {
            taskId,
            sourceColumnId,
            destinationColumnId,
            destinationIndex,
          },
          userId: user.id,
          userName: user.name,
          timestamp,
        })

        callback({ success: true })
        console.log(`${user.name} moveu tarefa ${taskId} de ${sourceColumnId} para ${destinationColumnId}`)
      } catch (error) {
        console.error("Erro ao mover tarefa:", error)
        callback({ error: "Erro interno do servidor" })
      }
    })

    // Criar tarefa
    socket.on("create_task", (data, callback) => {
      try {
        const { task, columnId, timestamp } = data
        const user = onlineUsers.get(socket.id)

        if (!user) {
          callback({ error: "Usuário não encontrado" })
          return
        }

        const column = boardState.find((col) => col.id === columnId)
        if (!column) {
          callback({ error: "Coluna não encontrada" })
          return
        }

        const newTask = {
          ...task,
          lastModified: timestamp,
          modifiedBy: user.name,
        }

        column.tasks.unshift(newTask)

        // Broadcast para todos os outros clientes
        socket.broadcast.emit("realtime_event", {
          type: "task_created",
          data: {
            task: newTask,
            columnId,
          },
          userId: user.id,
          userName: user.name,
          timestamp,
        })

        callback({ success: true })
        console.log(`${user.name} criou tarefa ${task.title}`)
      } catch (error) {
        console.error("Erro ao criar tarefa:", error)
        callback({ error: "Erro interno do servidor" })
      }
    })

    // Atualizar tarefa
    socket.on("update_task", (data, callback) => {
      try {
        const { task, timestamp } = data
        const user = onlineUsers.get(socket.id)

        if (!user) {
          callback({ error: "Usuário não encontrado" })
          return
        }

        // Encontrar e atualizar a tarefa
        let taskFound = false
        for (const column of boardState) {
          const taskIndex = column.tasks.findIndex((t) => t.id === task.id)
          if (taskIndex !== -1) {
            column.tasks[taskIndex] = {
              ...task,
              lastModified: timestamp,
              modifiedBy: user.name,
            }
            taskFound = true
            break
          }
        }

        if (!taskFound) {
          callback({ error: "Tarefa não encontrada" })
          return
        }

        // Broadcast para todos os outros clientes
        socket.broadcast.emit("realtime_event", {
          type: "task_updated",
          data: {
            task: {
              ...task,
              lastModified: timestamp,
              modifiedBy: user.name,
            },
          },
          userId: user.id,
          userName: user.name,
          timestamp,
        })

        callback({ success: true })
        console.log(`${user.name} atualizou tarefa ${task.title}`)
      } catch (error) {
        console.error("Erro ao atualizar tarefa:", error)
        callback({ error: "Erro interno do servidor" })
      }
    })

    // Excluir tarefa
    socket.on("delete_task", (data, callback) => {
      try {
        const { taskId, timestamp } = data
        const user = onlineUsers.get(socket.id)

        if (!user) {
          callback({ error: "Usuário não encontrado" })
          return
        }

        // Encontrar e remover a tarefa
        let taskFound = false
        for (const column of boardState) {
          const taskIndex = column.tasks.findIndex((t) => t.id === taskId)
          if (taskIndex !== -1) {
            column.tasks.splice(taskIndex, 1)
            taskFound = true
            break
          }
        }

        if (!taskFound) {
          callback({ error: "Tarefa não encontrada" })
          return
        }

        // Broadcast para todos os outros clientes
        socket.broadcast.emit("realtime_event", {
          type: "task_deleted",
          data: {
            taskId,
          },
          userId: user.id,
          userName: user.name,
          timestamp,
        })

        callback({ success: true })
        console.log(`${user.name} excluiu tarefa ${taskId}`)
      } catch (error) {
        console.error("Erro ao excluir tarefa:", error)
        callback({ error: "Erro interno do servidor" })
      }
    })

    // Desconexão
    socket.on("disconnect", (reason) => {
      const user = onlineUsers.get(socket.id)
      if (user) {
        onlineUsers.delete(socket.id)

        // Notificar todos sobre o usuário saindo
        io.emit("users_update", Array.from(onlineUsers.values()))

        // Broadcast evento de usuário saindo
        socket.broadcast.emit("realtime_event", {
          type: "user_left",
          data: { user },
          userId: user.id,
          userName: user.name,
          timestamp: new Date().toISOString(),
        })

        console.log(`Usuário ${user.name} saiu do projeto (${reason})`)
      }
    })
  })

  // Iniciar servidor na porta 3001
  httpServer.listen(3001, () => {
    console.log("Servidor WebSocket rodando na porta 3001")
  })

  return io
}

// Inicializar servidor quando o módulo for carregado
if (typeof window === "undefined") {
  initializeWebSocketServer()
}

export async function GET(request: NextRequest) {
  return new Response("WebSocket server is running on port 3001", {
    status: 200,
  })
}
