"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Users } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface OnlineUser {
  id: string
  name: string
  avatar: string
  initials: string
  lastSeen: string
}

interface OnlineUsersProps {
  users: OnlineUser[]
}

export function OnlineUsers({ users }: OnlineUsersProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors">
          <Users className="h-4 w-4 text-gray-600" />
          <Badge variant="secondary" className="text-xs">
            {users.length} online
          </Badge>
          <div className="flex -space-x-2">
            {users.slice(0, 3).map((user) => (
              <Avatar key={user.id} className="h-6 w-6 border-2 border-white">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
              </Avatar>
            ))}
            {users.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                <span className="text-xs text-gray-600">+{users.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Usuários Online ({users.length})</h3>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">
                    Ativo há {format(new Date(user.lastSeen), "HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {users.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Nenhum usuário online</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
