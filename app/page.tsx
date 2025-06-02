"use client"

import { useState, useEffect, useRef } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Calendar, MessageSquare, Paperclip, Loader2, Wifi, WifiOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { TaskDialog } from "@/components/task-dialog"
import { TaskDetailsDialog } from "@/components/task-details-dialog"
import { DeleteTaskDialog } from "@/components/delete-task-dialog"
import { useWebSocket } from "@/hooks/use-websocket"
import { OnlineUsers } from "@/components/online-users"
import { ActivityFeed } from "@/components/activity-feed"

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
  isLoading?: boolean
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

interface OnlineUser {
  id: string
  name: string
  avatar: string
  initials: string
  lastSeen: string
}

const initialData: Column[] = [
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
      {
        id: "task-2",
        title: "Corrigir bug no formulário de contato",
        description: "Validação não está funcionando corretamente",
        assignee: {
          name: "Maria Santos",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "MS",
        },
        priority: "urgent",
        type: "bug",
        comments: 1,
        attachments: 0,
      },
      {
        id: "task-3",
        title: "Criar documentação da API",
        description: "Documentar todos os endpoints disponíveis",
        assignee: {
          name: "Pedro Costa",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "PC",
        },
        priority: "medium",
        type: "task",
        comments: 0,
        attachments: 1,
      },
    ],
  },
  {
    id: "inprogress",
    title: "In Progress",
    color: "bg-blue-50",
    tasks: [
      {
        id: "task-4",
        title: "Desenvolver dashboard principal",
        description: "Interface principal com métricas e gráficos",
        assignee: {
          name: "Ana Oliveira",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "AO",
        },
        priority: "high",
        type: "story",
        comments: 5,
        attachments: 3,
        dueDate: "2024-01-20",
      },
      {
        id: "task-5",
        title: "Otimizar performance do banco",
        description: "Melhorar queries e índices",
        assignee: {
          name: "Carlos Lima",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "CL",
        },
        priority: "medium",
        type: "task",
        comments: 2,
        attachments: 0,
      },
    ],
  },
  {
    id: "review",
    title: "Code Review",
    color: "bg-yellow-50",
    tasks: [
      {
        id: "task-6",
        title: "Implementar sistema de notificações",
        description: "Push notifications e email",
        assignee: {
          name: "Lucia Ferreira",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "LF",
        },
        priority: "medium",
        type: "story",
        comments: 4,
        attachments: 1,
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    color: "bg-green-50",
    tasks: [
      {
        id: "task-7",
        title: "Configurar CI/CD pipeline",
        description: "Deploy automático para produção",
        assignee: {
          name: "Roberto Alves",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "RA",
        },
        priority: "high",
        type: "epic",
        comments: 8,
        attachments: 5,
      },
      {
        id: "task-8",
        title: "Criar testes unitários",
        description: "Cobertura de 80% do código",
        assignee: {
          name: "Sofia Mendes",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "SM",
        },
        priority: "medium",
        type: "task",
        comments: 2,
        attachments: 0,
      },
    ],
  },
]

const priorityColors = {
  low: "bg-gray-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
}

const typeColors = {
  story: "bg-green-500",
  bug: "bg-red-500",
  task: "bg-blue-500",
  epic: "bg-purple-500",
}

// Usuário atual (em uma aplicação real, viria da autenticação)
const currentUser = {
  id: `user-${Math.random().toString(36).substr(2, 9)}`,
  name: `Usuário ${Math.floor(Math.random() * 1000)}`,
  avatar: "/placeholder.svg?height=32&width=32",
  initials: "U" + Math.floor(Math.random() * 100),
}

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(initialData)
  const [previousState, setPreviousState] = useState<Column[]>(initialData)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [recentActivities, setRecentActivities] = useState<RealtimeEvent[]>([])
  const { toast } = useToast()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedColumnId, setSelectedColumnId] = useState<string>("")

  const pendingOperations = useRef<Map<string, any>>(new Map())

  // Hook personalizado para WebSocket
  const { socket, isConnected, emit } = useWebSocket(currentUser)

  useEffect(() => {
    if (!socket) return

    // Listener para atualizações de usuários online
    socket.on("users_update", (users: OnlineUser[]) => {
      setOnlineUsers(users.filter((user) => user.id !== currentUser.id))
    })

    // Listener para eventos em tempo real
    socket.on("realtime_event", (event: RealtimeEvent) => {
      handleRealtimeEvent(event)
    })

    // Listener para sincronização inicial do estado
    socket.on("board_state", (boardState: Column[]) => {
      setColumns(boardState)
    })

    // Listener para conflitos
    socket.on("conflict_resolved", (data: { taskId: string; resolution: any }) => {
      toast({
        title: "Conflito resolvido",
        description: `A tarefa foi atualizada por outro usuário. Aplicando a versão mais recente.`,
        variant: "destructive",
      })
    })

    return () => {
      socket.off("users_update")
      socket.off("realtime_event")
      socket.off("board_state")
      socket.off("conflict_resolved")
    }
  }, [socket])

  const handleRealtimeEvent = (event: RealtimeEvent) => {
    // Ignorar eventos do próprio usuário
    if (event.userId === currentUser.id) return

    // Adicionar à lista de atividades recentes
    setRecentActivities((prev) => [event, ...prev.slice(0, 9)])

    // Processar evento baseado no tipo
    switch (event.type) {
      case "task_moved":
        handleRemoteTaskMove(event)
        break
      case "task_created":
        handleRemoteTaskCreate(event)
        break
      case "task_updated":
        handleRemoteTaskUpdate(event)
        break
      case "task_deleted":
        handleRemoteTaskDelete(event)
        break
    }

    // Mostrar notificação da atividade
    toast({
      title: `${event.userName} ${getActionDescription(event.type)}`,
      description: getEventDescription(event),
    })
  }

  const handleRemoteTaskMove = (event: RealtimeEvent) => {
    const { taskId, sourceColumnId, destinationColumnId, destinationIndex } = event.data

    // Verificar se temos uma operação pendente para esta tarefa
    if (pendingOperations.current.has(taskId)) {
      const pendingOp = pendingOperations.current.get(taskId)
      if (new Date(event.timestamp) > new Date(pendingOp.timestamp)) {
        pendingOperations.current.delete(taskId)
        toast({
          title: "Conflito detectado",
          description: `${event.userName} moveu a tarefa mais recentemente. Aplicando a mudança.`,
          variant: "destructive",
        })
      } else {
        return
      }
    }

    setColumns((prevColumns) => {
      const newColumns = [...prevColumns]
      const sourceColumn = newColumns.find((col) => col.id === sourceColumnId)
      const destColumn = newColumns.find((col) => col.id === destinationColumnId)

      if (!sourceColumn || !destColumn) return prevColumns

      const taskIndex = sourceColumn.tasks.findIndex((task) => task.id === taskId)
      if (taskIndex === -1) return prevColumns

      const task = sourceColumn.tasks[taskIndex]

      sourceColumn.tasks.splice(taskIndex, 1)
      destColumn.tasks.splice(destinationIndex, 0, {
        ...task,
        lastModified: event.timestamp,
        modifiedBy: event.userName,
      })

      return newColumns
    })
  }

  const handleRemoteTaskCreate = (event: RealtimeEvent) => {
    const { task, columnId } = event.data

    setColumns((prevColumns) =>
      prevColumns.map((column) => {
        if (column.id === columnId) {
          return {
            ...column,
            tasks: [
              {
                ...task,
                lastModified: event.timestamp,
                modifiedBy: event.userName,
              },
              ...column.tasks,
            ],
          }
        }
        return column
      }),
    )
  }

  const handleRemoteTaskUpdate = (event: RealtimeEvent) => {
    const { task } = event.data

    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        tasks: column.tasks.map((t) =>
          t.id === task.id
            ? {
                ...task,
                lastModified: event.timestamp,
                modifiedBy: event.userName,
              }
            : t,
        ),
      })),
    )
  }

  const handleRemoteTaskDelete = (event: RealtimeEvent) => {
    const { taskId } = event.data

    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      })),
    )
  }

  const getActionDescription = (type: string) => {
    switch (type) {
      case "task_moved":
        return "moveu uma tarefa"
      case "task_created":
        return "criou uma tarefa"
      case "task_updated":
        return "atualizou uma tarefa"
      case "task_deleted":
        return "excluiu uma tarefa"
      default:
        return "fez uma ação"
    }
  }

  const getEventDescription = (event: RealtimeEvent) => {
    switch (event.type) {
      case "task_moved":
        return `Tarefa movida para ${event.data.destinationColumnId}`
      case "task_created":
        return `"${event.data.task.title}"`
      case "task_updated":
        return `"${event.data.task.title}"`
      case "task_deleted":
        return `Tarefa removida`
      default:
        return ""
    }
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) {
      return
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    setPreviousState([...columns])

    const sourceColumn = columns.find((col) => col.id === source.droppableId)
    const destColumn = columns.find((col) => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) {
      return
    }

    const sourceTask = sourceColumn.tasks.find((task) => task.id === draggableId)

    if (!sourceTask) {
      return
    }

    // Registrar operação pendente
    const operationId = `${draggableId}-${Date.now()}`
    pendingOperations.current.set(draggableId, {
      id: operationId,
      type: "move",
      timestamp: new Date().toISOString(),
      data: { taskId: draggableId, sourceColumnId: source.droppableId, destinationColumnId: destination.droppableId },
    })

    const updatedTask = { ...sourceTask, isLoading: true }

    let newColumns = [...columns]

    if (source.droppableId === destination.droppableId) {
      newColumns = columns.map((column) => {
        if (column.id === source.droppableId) {
          const newTasks = [...column.tasks]
          newTasks.splice(source.index, 1)
          newTasks.splice(destination.index, 0, updatedTask)
          return { ...column, tasks: newTasks }
        }
        return column
      })
    } else {
      newColumns = columns.map((column) => {
        if (column.id === source.droppableId) {
          const newTasks = [...column.tasks]
          newTasks.splice(source.index, 1)
          return { ...column, tasks: newTasks }
        }
        if (column.id === destination.droppableId) {
          const newTasks = [...column.tasks]
          newTasks.splice(destination.index, 0, updatedTask)
          return { ...column, tasks: newTasks }
        }
        return column
      })
    }

    setColumns(newColumns)

    try {
      // Enviar para o servidor via WebSocket
      const response = await emit("move_task", {
        taskId: draggableId,
        sourceColumnId: source.droppableId,
        destinationColumnId: destination.droppableId,
        destinationIndex: destination.index,
        timestamp: new Date().toISOString(),
      })

      pendingOperations.current.delete(draggableId)

      const finalColumns = newColumns.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) => (task.id === draggableId ? { ...task, isLoading: false } : task)),
      }))

      setColumns(finalColumns)

      toast({
        title: "Tarefa movida com sucesso",
        description: `A tarefa foi movida para ${destColumn.title}`,
        variant: "default",
      })
    } catch (error) {
      pendingOperations.current.delete(draggableId)
      setColumns(previousState)

      toast({
        title: "Erro ao mover tarefa",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      })
    }
  }

  const handleCreateTask = async (taskData: Omit<Task, "id" | "isLoading">) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isLoading: true,
    }

    const newColumns = columns.map((column) => {
      if (column.id === selectedColumnId) {
        return { ...column, tasks: [newTask, ...column.tasks] }
      }
      return column
    })

    setColumns(newColumns)
    setIsCreateDialogOpen(false)

    try {
      await emit("create_task", {
        task: newTask,
        columnId: selectedColumnId,
        timestamp: new Date().toISOString(),
      })

      const finalColumns = newColumns.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) => (task.id === newTask.id ? { ...task, isLoading: false } : task)),
      }))

      setColumns(finalColumns)

      toast({
        title: "Tarefa criada com sucesso",
        description: `A tarefa "${newTask.title}" foi adicionada à coluna ${columns.find((c) => c.id === selectedColumnId)?.title}`,
      })
    } catch (error) {
      setColumns(columns)
      toast({
        title: "Erro ao criar tarefa",
        description: "Não foi possível criar a tarefa. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTask = async (updatedTask: Task) => {
    const previousState = [...columns]

    const newColumns = columns.map((column) => ({
      ...column,
      tasks: column.tasks.map((task) => (task.id === updatedTask.id ? { ...updatedTask, isLoading: true } : task)),
    }))

    setColumns(newColumns)
    setIsDetailsDialogOpen(false)

    try {
      await emit("update_task", {
        task: updatedTask,
        timestamp: new Date().toISOString(),
      })

      const finalColumns = newColumns.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) => (task.id === updatedTask.id ? { ...task, isLoading: false } : task)),
      }))

      setColumns(finalColumns)

      toast({
        title: "Tarefa atualizada",
        description: `A tarefa "${updatedTask.title}" foi atualizada com sucesso`,
      })
    } catch (error) {
      setColumns(previousState)
      toast({
        title: "Erro ao atualizar tarefa",
        description: "Não foi possível atualizar a tarefa. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    const previousState = [...columns]

    const newColumns = columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) => task.id !== taskId),
    }))

    setColumns(newColumns)
    setIsDeleteDialogOpen(false)

    try {
      await emit("delete_task", {
        taskId,
        timestamp: new Date().toISOString(),
      })

      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida com sucesso",
      })
    } catch (error) {
      setColumns(previousState)
      toast({
        title: "Erro ao excluir tarefa",
        description: "Não foi possível excluir a tarefa. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const openCreateDialog = (columnId: string) => {
    setSelectedColumnId(columnId)
    setIsCreateDialogOpen(true)
  }

  const openTaskDetails = (task: Task) => {
    setSelectedTask(task)
    setIsDetailsDialogOpen(true)
  }

  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Board</h1>
              <p className="text-gray-600">Colaboração em tempo real com WebSockets</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-gray-600">{isConnected ? "Online" : "Offline"}</span>
              </div>
              <OnlineUsers users={onlineUsers} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map((column) => (
                  <div key={column.id} className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-gray-900">{column.title}</h2>
                        <Badge variant="secondary" className="text-xs">
                          {column.tasks.length}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => openCreateDialog(column.id)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 min-h-[200px] p-2 rounded-lg transition-colors ${
                            snapshot.isDraggingOver ? column.color : "bg-transparent"
                          }`}
                        >
                          <div className="space-y-3">
                            {column.tasks.map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`cursor-grab active:cursor-grabbing transition-all duration-200 ${
                                      snapshot.isDragging ? "shadow-lg rotate-2 scale-105" : "hover:shadow-md"
                                    } ${task.isLoading ? "opacity-70" : ""}`}
                                    onClick={() => openTaskDetails(task)}
                                  >
                                    <div className="bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${typeColors[task.type]}`} />
                                          <Badge variant="outline" className="text-xs">
                                            {task.type.toUpperCase()}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center">
                                          {task.isLoading && (
                                            <Loader2 className="h-3 w-3 text-blue-500 animate-spin mr-2" />
                                          )}
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              openDeleteDialog(task)
                                            }}
                                          >
                                            <MoreHorizontal className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>

                                      <h3 className="text-sm font-medium leading-tight mb-2">{task.title}</h3>
                                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>

                                      {task.modifiedBy && task.modifiedBy !== currentUser.name && (
                                        <div className="text-xs text-blue-600 mb-2">
                                          Modificado por {task.modifiedBy}
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
                                          <span className="text-xs text-gray-500 capitalize">{task.priority}</span>
                                        </div>

                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} />
                                          <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                                        </Avatar>
                                      </div>

                                      <div className="flex items-center justify-between pt-2 border-t">
                                        <div className="flex items-center gap-3">
                                          {task.comments > 0 && (
                                            <div className="flex items-center gap-1">
                                              <MessageSquare className="h-3 w-3 text-gray-400" />
                                              <span className="text-xs text-gray-500">{task.comments}</span>
                                            </div>
                                          )}
                                          {task.attachments > 0 && (
                                            <div className="flex items-center gap-1">
                                              <Paperclip className="h-3 w-3 text-gray-400" />
                                              <span className="text-xs text-gray-500">{task.attachments}</span>
                                            </div>
                                          )}
                                        </div>

                                        {task.dueDate && (
                                          <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-gray-400" />
                                            <span className="text-xs text-gray-500">
                                              {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </div>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </div>

          <div className="lg:col-span-1">
            <ActivityFeed activities={recentActivities} />
          </div>
        </div>
      </div>

      <TaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateTask}
        columnId={selectedColumnId}
        columns={columns}
      />

      <TaskDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        task={selectedTask}
        onUpdate={handleUpdateTask}
        onDelete={() => selectedTask && openDeleteDialog(selectedTask)}
        columns={columns}
      />

      <DeleteTaskDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        task={selectedTask}
        onConfirm={() => selectedTask && handleDeleteTask(selectedTask.id)}
      />
      <Toaster />
    </div>
  )
}
