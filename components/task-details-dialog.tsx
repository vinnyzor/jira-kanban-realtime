"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, MessageSquare, Paperclip, Trash2, Edit3, Send } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

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
}

interface Column {
  id: string
  title: string
  tasks: Task[]
  color: string
}

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
  avatar: string
  initials: string
}

interface TaskDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onUpdate: (task: Task) => void
  onDelete: () => void
  columns: Column[]
}

const mockUsers = [
  { name: "João Silva", initials: "JS", avatar: "/placeholder.svg?height=32&width=32" },
  { name: "Maria Santos", initials: "MS", avatar: "/placeholder.svg?height=32&width=32" },
  { name: "Pedro Costa", initials: "PC", avatar: "/placeholder.svg?height=32&width=32" },
  { name: "Ana Oliveira", initials: "AO", avatar: "/placeholder.svg?height=32&width=32" },
  { name: "Carlos Lima", initials: "CL", avatar: "/placeholder.svg?height=32&width=32" },
]

const mockComments: Comment[] = [
  {
    id: "1",
    author: "João Silva",
    content: "Iniciando o desenvolvimento desta funcionalidade. Vou começar pela estrutura básica.",
    timestamp: "2024-01-10T10:30:00Z",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "JS",
  },
  {
    id: "2",
    author: "Maria Santos",
    content: "Ótimo! Lembre-se de seguir os padrões de código estabelecidos no projeto.",
    timestamp: "2024-01-10T14:15:00Z",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "MS",
  },
]

export function TaskDetailsDialog({ open, onOpenChange, task, onUpdate, onDelete, columns }: TaskDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium")
  const [type, setType] = useState<"story" | "bug" | "task" | "epic">("task")
  const [assignee, setAssignee] = useState(mockUsers[0])
  const [dueDate, setDueDate] = useState<Date>()
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<Comment[]>(mockComments)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setPriority(task.priority)
      setType(task.type)
      setAssignee(task.assignee)
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
    }
  }, [task])

  if (!task) return null

  const handleSave = () => {
    onUpdate({
      ...task,
      title,
      description,
      priority,
      type,
      assignee,
      dueDate: dueDate?.toISOString(),
    })
    setIsEditing(false)
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: "Usuário Atual",
      content: newComment.trim(),
      timestamp: new Date().toISOString(),
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "UC",
    }

    setComments([...comments, comment])
    setNewComment("")
  }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${typeColors[task.type]}`} />
              <DialogTitle className="text-lg">{task.title}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                <Edit3 className="h-4 w-4 mr-1" />
                {isEditing ? "Cancelar" : "Editar"}
              </Button>
              <Button variant="outline" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                {isEditing ? (
                  <Select value={type} onValueChange={(value: "story" | "bug" | "task" | "epic") => setType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="story">📖 Story</SelectItem>
                      <SelectItem value="bug">🐛 Bug</SelectItem>
                      <SelectItem value="task">✅ Task</SelectItem>
                      <SelectItem value="epic">🚀 Epic</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="w-fit">
                    {type.toUpperCase()}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label>Prioridade</Label>
                {isEditing ? (
                  <Select
                    value={priority}
                    onValueChange={(value: "low" | "medium" | "high" | "urgent") => setPriority(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Baixa</SelectItem>
                      <SelectItem value="medium">🟡 Média</SelectItem>
                      <SelectItem value="high">🟠 Alta</SelectItem>
                      <SelectItem value="urgent">🔴 Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`} />
                    <span className="capitalize">{task.priority}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label>Título</Label>
              {isEditing ? (
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              ) : (
                <p className="text-sm">{task.title}</p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              {isEditing ? (
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              ) : (
                <p className="text-sm text-gray-600">{task.description || "Nenhuma descrição fornecida"}</p>
              )}
            </div>

            {/* Responsável e Data */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Responsável</Label>
                {isEditing ? (
                  <Select
                    value={assignee.name}
                    onValueChange={(value) => {
                      const user = mockUsers.find((u) => u.name === value)
                      if (user) setAssignee(user)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={assignee.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{assignee.initials}</AvatarFallback>
                          </Avatar>
                          {assignee.name}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.name} value={user.name}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{task.assignee.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Data de Vencimento</Label>
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {task.dueDate ? format(new Date(task.dueDate), "PPP", { locale: ptBR }) : "Não definida"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{comments.length} comentários</span>
              </div>
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{task.attachments} anexos</span>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>Salvar Alterações</Button>
              </div>
            )}

            <Separator />

            {/* Comentários */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Comentários</h3>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{comment.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comment.author}</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(comment.timestamp), "PPp", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Adicionar Comentário */}
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="text-xs">UC</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Adicione um comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4 mr-1" />
                    Comentar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
