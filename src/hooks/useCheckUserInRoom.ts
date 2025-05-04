import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useStore } from '@/store/useStore'
import { RoomData } from '@/types/Room'

interface UseCheckUserInRoomProps {
  roomData: RoomData | null
  loading: boolean
  userRole: number | null
}

/**
 * Hook to check if the current user is still in the participants list
 * If not, redirects to home page and shows a notification
 */
export function useCheckUserInRoom({ roomData, loading, userRole }: UseCheckUserInRoomProps) {
  const navigate = useNavigate()
  const { user, removeUser } = useStore()

  useEffect(() => {
    // Skip if we're still loading, or if there's no user or roomData
    if (loading || !user || !roomData || !roomData.users) return

    // Skip for admin users (role_id = 2)
    if (userRole === 2) return

    // Check if the current user is in the participants list
    const isUserInParticipants = roomData.users.some(u => u.id === user.id)

    // If the user is not in the participants list, redirect to home
    if (!isUserInParticipants) {
      toast.error('Has sido eliminado de la sala')
      navigate('/')
    }
  }, [roomData, user, userRole, loading, navigate, removeUser])
}
