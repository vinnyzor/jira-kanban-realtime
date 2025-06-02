"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
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

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (task: Omit<Task, "id" | "isLoading">) => void
  columnId: string
  columns: Column[]
}

const mockUsers = [
  { name: "João Silva", initials: "JS", avatar: "/placeholder.svg?height=32&width=32" },
  { name: "Maria Santos", initials: "MS", avatar: "/placeholder.svg?height=32&width=32" },
  { name: "Pedro Costa", initials: "PC", avatar: "/placeholder.svg?height=32&width=32" },
  { name: "Ana Oliveira", initials: "AO", avatar: "/placeholder.svg?height=32&width=32" },
  { name: "Carlos Lima", initials: "CL", avatar: "/placeholder.svg?height=32&width=32" },
]

export function TaskDialog({ open, onOpenChange, onSubmit, columnId, columns }: TaskDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium")
  const [type, setType] = useState<"story" | "bug" | "task" | "epic">("task")
  const [assignee, setAssignee] = useState(mockUsers[0])
  const [dueDate, setDueDate] = useState<Date>()

  const columnTitle = columns.find((col) => col.id === columnId)?.title || ""

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      type,
      assignee,
      comments: 0,
      attachments: 0,
      dueDate: dueDate?.toISOString(),
    })

    // Reset form
    setTitle("")
    setDescription("")
    setPriority("medium")
    setType("task")
    setAssignee(mockUsers[0])
    setDueDate(undefined)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Tarefa - {columnTitle}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
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
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da tarefa..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva os detalhes da tarefa..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Responsável</Label>
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
            </div>

            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
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
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Criar Tarefa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
