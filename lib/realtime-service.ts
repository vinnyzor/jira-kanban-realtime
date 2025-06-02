interface User {
  id: string
  name: string
  avatar: string
  initials: string
}

interface RealtimeEvent {
  type: "task_moved" | "task_created" | "task_updated" | "task_deleted" | "user_joined" | "user_left"
  data: any
  userId: string
  userName: string
  timestamp: string
}

interface OnlineUser {
  id: string
  name: string
  avatar: string
  initials: string
  lastSeen: string
}

export class RealtimeService {
  private currentUser: User
  private isConnected = false
  private onlineUsers: OnlineUser[] = []
  private eventListeners: ((event: RealtimeEvent) => void)[] = []
  private connectionListeners: ((connected: boolean) => void)[] = []
  private usersListeners: ((users: OnlineUser[]) => void)[] = []
  private simulatedUsers: OnlineUser[] = []
  private eventQueue: RealtimeEvent[] = []

  constructor(user: User) {
    this.currentUser = user
    this.initializeSimulatedUsers()
  }

  private initializeSimulatedUsers() {
    this.simulatedUsers = [
      {
        id: "user-1",
        name: "João Silva",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "JS",
        lastSeen: new Date().toISOString(),
      },
      {
        id: "user-2",
        name: "Maria Santos",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "MS",
        lastSeen: new Date().toISOString(),
      },
      {
        id: "user-3",
        name: "Pedro Costa",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "PC",
        lastSeen: new Date().toISOString(),
      },
    ]
  }

  connect() {
    // Simular conexão WebSocket
    setTimeout(() => {
      this.isConnected = true
      this.onlineUsers = [...this.simulatedUsers]
      this.notifyConnectionChange()
      this.notifyUsersUpdate()

      // Simular atividade de outros usuários
      this.startSimulatedActivity()
    }, 1000)
  }

  disconnect() {
    this.isConnected = false
    this.onlineUsers = []
    this.notifyConnectionChange()
    this.notifyUsersUpdate()
  }

  sendEvent(event: Omit<RealtimeEvent, "userId" | "userName" | "timestamp">) {
    if (!this.isConnected) {
      // Adicionar à fila para enviar quando reconectar
      this.eventQueue.push({
        ...event,
        userId: this.currentUser.id,
        userName: this.currentUser.name,
        timestamp: new Date().toISOString(),
      })
      return
    }

    const fullEvent: RealtimeEvent = {
      ...event,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      timestamp: new Date().toISOString(),
    }

    // Simular broadcast para outros usuários
    // Em uma implementação real, isso seria enviado via WebSocket
    console.log("Enviando evento:", fullEvent)
  }

  onRealtimeEvent(callback: (event: RealtimeEvent) => void) {
    this.eventListeners.push(callback)
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionListeners.push(callback)
  }

  onUsersUpdate(callback: (users: OnlineUser[]) => void) {
    this.usersListeners.push(callback)
  }

  private notifyConnectionChange() {
    this.connectionListeners.forEach((callback) => callback(this.isConnected))
  }

  private notifyUsersUpdate() {
    this.usersListeners.forEach((callback) => callback(this.onlineUsers))
  }

  private notifyEvent(event: RealtimeEvent) {
    this.eventListeners.forEach((callback) => callback(event))
  }

  private startSimulatedActivity() {
    // Simular atividade de outros usuários a cada 10-30 segundos
    const simulateActivity = () => {
      if (!this.isConnected) return

      const randomUser = this.simulatedUsers[Math.floor(Math.random() * this.simulatedUsers.length)]
      const activities = [
        {
          type: "task_moved" as const,
          data: {
            taskId: `task-${Math.floor(Math.random() * 8) + 1}`,
            sourceColumnId: "todo",
            destinationColumnId: "inprogress",
            destinationIndex: 0,
          },
        },
        {
          type: "task_updated" as const,
          data: {
            task: {
              id: `task-${Math.floor(Math.random() * 8) + 1}`,
              title: "Tarefa atualizada por " + randomUser.name,
              description: "Descrição atualizada",
              priority: "high",
              type: "task",
            },
          },
        },
      ]

      const randomActivity = activities[Math.floor(Math.random() * activities.length)]

      // 30% de chance de simular atividade
      if (Math.random() < 0.3) {
        const event: RealtimeEvent = {
          ...randomActivity,
          userId: randomUser.id,
          userName: randomUser.name,
          timestamp: new Date().toISOString(),
        }

        this.notifyEvent(event)
      }

      // Simular usuários entrando e saindo
      if (Math.random() < 0.1) {
        this.simulateUserActivity()
      }

      // Agendar próxima atividade
      setTimeout(simulateActivity, Math.random() * 20000 + 10000) // 10-30 segundos
    }

    setTimeout(simulateActivity, 5000) // Começar após 5 segundos
  }

  private simulateUserActivity() {
    const shouldAddUser = Math.random() < 0.5 && this.onlineUsers.length < this.simulatedUsers.length
    const shouldRemoveUser = Math.random() < 0.5 && this.onlineUsers.length > 1

    if (shouldAddUser) {
      const offlineUsers = this.simulatedUsers.filter(
        (user) => !this.onlineUsers.find((online) => online.id === user.id),
      )
      if (offlineUsers.length > 0) {
        const userToAdd = offlineUsers[Math.floor(Math.random() * offlineUsers.length)]
        this.onlineUsers.push({
          ...userToAdd,
          lastSeen: new Date().toISOString(),
        })
        this.notifyUsersUpdate()

        this.notifyEvent({
          type: "user_joined",
          data: { user: userToAdd },
          userId: userToAdd.id,
          userName: userToAdd.name,
          timestamp: new Date().toISOString(),
        })
      }
    } else if (shouldRemoveUser) {
      const userToRemove = this.onlineUsers[Math.floor(Math.random() * this.onlineUsers.length)]
      this.onlineUsers = this.onlineUsers.filter((user) => user.id !== userToRemove.id)
      this.notifyUsersUpdate()

      this.notifyEvent({
        type: "user_left",
        data: { user: userToRemove },
        userId: userToRemove.id,
        userName: userToRemove.name,
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Simular perda de conexão ocasional
  simulateConnectionIssues() {
    if (Math.random() < 0.05) {
      // 5% de chance de perder conexão
      this.isConnected = false
      this.notifyConnectionChange()

      // Reconectar após 2-5 segundos
      setTimeout(
        () => {
          this.connect()
        },
        Math.random() * 3000 + 2000,
      )
    }
  }
}
