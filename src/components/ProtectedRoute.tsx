import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useStore } from '@/store/useStore'
import { getRoomData } from '@/services/rooms'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, rooms, setRooms } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const [roomExists, setRoomExists] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const roomId = searchParams.get('id')

    if (!roomId) {
      toast.error('No se ha proporcionado un ID de sala')
      navigate('/')
      return
    }

    if (!user) {
      navigate(`/join?code=${roomId}`)
      return
    }

    const checkRoomExists = async () => {
      try {
        const roomData = await getRoomData(roomId)

        if (!roomData || !roomData.room || !roomData.poll || !roomData.users || !roomData.entries) {
          throw new Error('Datos de sala incorrector o incompletos')
        }

        setRoomExists(true)
      } catch (error) {
        console.error('Room not found or invalid:', error)
        setRoomExists(false)
        setError('La sala no existe o no tienes acceso a ella')
        toast.error('La sala no existe o no tienes acceso a ella')
        if (rooms.find(room => room.id === roomId)) {
          setRooms(rooms.filter(room => room.id !== roomId))
        }
        navigate('/')
      } finally {
        setIsLoading(false)
      }
    }

    checkRoomExists()
  }, [user, navigate, searchParams])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!roomExists) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-10">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>{error || 'La sala no existe o no tienes acceso a ella'}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
