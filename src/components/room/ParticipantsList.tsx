import { useEffect, useRef, useState } from "react"
import { RoomUser } from '@/types/Room'
import { getInitial } from '@/utils'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useParticipantsSubscription } from "@/hooks/useParticipantsSubscription"

interface ParticipantsListProps {
  users: RoomUser[]
  currentUserId?: string
  roomId?: string
}

export function ParticipantsList({ users: initialUsers, currentUserId, roomId }: ParticipantsListProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Use the participants subscription hook to get real-time updates
  const users = useParticipantsSubscription({
    roomId,
    initialUsers
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (!isMobile || openTooltipId === null) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenTooltipId(null)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [isMobile, openTooltipId])

  const toggleTooltip = (userId: string) => {
    setOpenTooltipId(prev => (prev === userId ? null : userId))
  }

  return (
    <Card className="mb-6 gap-3">
      <CardHeader>
        <CardTitle>Participantes</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="flex flex-wrap gap-2">
          {users.length > 0 ? (
            <TooltipProvider>
              {users.map(u => {
                const isCurrentUser = u.id === currentUserId
                const isOpen = openTooltipId === u.id

                return (
                  <Tooltip key={u.id} open={isMobile ? isOpen : undefined}>
                    <TooltipTrigger asChild>
                      <div
                        tabIndex={0}
                        onClick={() => isMobile && toggleTooltip(u.id)}
                        onBlur={() => isMobile && setOpenTooltipId(null)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition cursor-default
                          ${isCurrentUser ? 'outline-2 outline-black dark:outline-white shadow-lg' : ''}`}
                        style={{
                          backgroundColor: u.color || '#cccccc',
                          color: u.text_color || '#000000'
                        }}
                      >
                        {getInitial(u.name)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{u.name}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </TooltipProvider>
          ) : (
            <p className="text-center text-sm text-muted-foreground">No hay participantes todavía</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
