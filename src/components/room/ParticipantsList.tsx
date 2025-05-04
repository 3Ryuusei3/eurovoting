import { useEffect, useRef, useState } from "react"
import { RoomUser } from '@/types/Room'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useParticipantsSubscription } from "@/hooks/useParticipantsSubscription"
import { UserAvatarWithTooltip } from './UserAvatarWithTooltip'
import { DeleteUserDialog } from './DeleteUserDialog'
import { deleteUserFromRoom } from '@/services/userRooms'
import { toast } from 'sonner'

interface ParticipantsListProps {
  users: RoomUser[]
  currentUserId?: string
  roomId?: string
  isAdmin?: boolean
}

export function ParticipantsList({ users: initialUsers, currentUserId, roomId, isAdmin = false }: ParticipantsListProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null)
  const [userToDelete, setUserToDelete] = useState<RoomUser | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Use the participants subscription hook to get real-time updates
  // The filtering of users with role_id = 2 is already done in the get_room_users function
  const users = useParticipantsSubscription({
    roomId,
    initialUsers: initialUsers
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

  const handleAdminClick = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user && user.id !== currentUserId) {
      setUserToDelete(user)
      setIsDeleteDialogOpen(true)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete || !roomId) return

    try {
      await deleteUserFromRoom(userToDelete.id, roomId)
      toast.success(`Usuario ${userToDelete.name} eliminado de la sala`)
    } catch (error) {
      console.error('Error deleting user from room:', error)
      toast.error('Error al eliminar el usuario de la sala')
    }
  }

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle>Participantes</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="flex flex-wrap justify-center gap-2">
          {users.length > 0 ? (
            <TooltipProvider>
              {users.filter(u => u.role_id !== 2).map(u => {
                const isCurrentUser = u.id === currentUserId

                return (
                  <UserAvatarWithTooltip
                    key={u.id}
                    id={u.id}
                    name={u.name}
                    color={u.color || '#cccccc'}
                    textColor={u.text_color || '#000000'}
                    isCurrentUser={isCurrentUser}
                    isMobile={isMobile}
                    openTooltipId={openTooltipId}
                    toggleTooltip={toggleTooltip}
                    setOpenTooltipId={setOpenTooltipId}
                    isAdmin={isAdmin}
                    onAdminClick={handleAdminClick}
                  />
                )
              })}
            </TooltipProvider>
          ) : (
            <p className="text-center text-sm text-muted-foreground">No hay participantes todavía</p>
          )}
        </div>
      </CardContent>

      {/* Delete user confirmation dialog */}
      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        user={userToDelete}
      />
    </Card>
  )
}
