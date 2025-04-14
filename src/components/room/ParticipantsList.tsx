import { RoomUser } from '@/types/Room'
import { getInitial } from '@/utils'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ParticipantsListProps {
  users: RoomUser[]
  currentUserId?: string
}

export function ParticipantsList({ users, currentUserId }: ParticipantsListProps) {
  return (
    <Card className="mb-6 gap-3">
      <CardHeader>
        <CardTitle>Participantes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {users.map(u => {
            const isCurrentUser = u.id === currentUserId;
            return (
              <div
                key={u.id}
                title={u.name}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition
                  ${isCurrentUser ? 'outline-2 outline-black dark:outline-white shadow-lg' : ''}`}
                style={{
                  backgroundColor: u.color || '#cccccc',
                  color: u.text_color || '#000000'
                }}
              >
                {getInitial(u.name)}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )
}
