"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

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

interface DeleteTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onConfirm: () => void
}

export function DeleteTaskDialog({ open, onOpenChange, task, onConfirm }: DeleteTaskDialogProps) {
  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <DialogTitle>Excluir Tarefa</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Tem certeza que deseja excluir a tarefa <strong>"{task.title}"</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita. Todos os comentários e anexos associados a esta tarefa também serão
            removidos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Excluir Tarefa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
