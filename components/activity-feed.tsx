"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, ArrowRight, Plus, Edit3, Trash2, UserPlus, UserMinus } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface RealtimeEvent {
  type: "task_moved" | "task_created" | "task_updated" | "task_deleted" | "user_joined" | "user_left"
  data: any
  userId: string
  userName: string
  timestamp: string
}

interface ActivityFeedProps {
  activities: RealtimeEvent[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_moved":
        return <ArrowRight className="h-4 w-4 text-blue-500" />
      case "task_created":
        return <Plus className="h-4 w-4 text-green-500" />
      case "task_updated":
        return <Edit3 className="h-4 w-4 text-orange-500" />
      case "task_deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />
      case "user_joined":
        return <UserPlus className="h-4 w-4 text-green-500" />
      case "user_left":
        return <UserMinus className="h-4 w-4 text-gray-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityDescription = (activity: RealtimeEvent) => {
    switch (activity.type) {
      case "task_moved":
        return `moveu uma tarefa para ${activity.data.destinationColumnId}`
      case "task_created":
        return `criou a tarefa "${activity.data.task.title}"`
      case "task_updated":
        return `atualizou a tarefa "${activity.data.task.title}"`
      case "task_deleted":
        return "excluiu uma tarefa"
      case "user_joined":
        return "entrou no projeto"
      case "user_left":
        return "saiu do projeto"
      default:
        return "fez uma ação"
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "task_moved":
        return "bg-blue-50 border-blue-200"
      case "task_created":
        return "bg-green-50 border-green-200"
      case "task_updated":
        return "bg-orange-50 border-orange-200"
      case "task_deleted":
        return "bg-red-50 border-red-200"
      case "user_joined":
        return "bg-green-50 border-green-200"
      case "user_left":
        return "bg-gray-50 border-gray-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="space-y-3 p-4">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <div
                  key={`${activity.userId}-${activity.timestamp}-${index}`}
                  className={`p-3 rounded-lg border ${getActivityColor(activity.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/placeholder.svg?height=24&width=24" />
                          <AvatarFallback className="text-xs">
                            {activity.userName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-gray-900">{activity.userName}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{getActivityDescription(activity)}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {activity.type.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {format(new Date(activity.timestamp), "HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
