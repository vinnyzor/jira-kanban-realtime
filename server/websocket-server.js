const { createServer } = require("http")
const { Server } = require("socket.io")

// Estado global do servidor
const onlineUsers = new Map()
const boardState = [
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

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-app.vercel.app", "https://*.vercel.app"]
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
})

io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`)

  // Usuário se junta ao projeto
  socket.on("user_join", (user) => {
    const fullUser = {
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

const PORT = process.env.PORT || process.env.WEBSOCKET_PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor WebSocket rodando na porta ${PORT}`)
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || "development"}`)
  console.log(`🌐 Pronto para conexões`)
})

// Health check endpoint
httpServer.on("request", (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(
      JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
        connections: onlineUsers.size,
      }),
    )
  }
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Encerrando servidor WebSocket...")
  httpServer.close(() => {
    console.log("Servidor WebSocket encerrado")
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  console.log("Encerrando servidor WebSocket...")
  httpServer.close(() => {
    console.log("Servidor WebSocket encerrado")
    process.exit(0)
  })
})
