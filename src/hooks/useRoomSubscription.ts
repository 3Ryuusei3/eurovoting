import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getRoomData } from '@/services/rooms'
import { RoomData } from '@/types/Room'

type RoomDataCallback = (data: RoomData) => void

interface RoomSubscriptionProps {
  roomId: string | null
  onRoomDataUpdate: RoomDataCallback
}

export function useRoomSubscription({ roomId, onRoomDataUpdate }: RoomSubscriptionProps) {
  useEffect(() => {
    if (!roomId) return

    // Create a channel for user_rooms changes
    const userRoomsChannel = supabase
      .channel('room_users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_rooms',
          filter: `room_id=eq.${roomId}`
        },
        async () => {
          try {
            const data = await getRoomData(roomId)
            onRoomDataUpdate(data)
          } catch (err) {
            console.error('Error reloading room data:', err)
          }
        }
      )
      .subscribe()

    // Create a channel for rooms changes
    const roomsChannel = supabase
      .channel('rooms_state')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`
        },
        async () => {
          try {
            const data = await getRoomData(roomId)
            onRoomDataUpdate(data)
          } catch (err) {
            console.error('Error reloading room data after state change:', err)
          }
        }
      )
      .subscribe()

    return () => {
      userRoomsChannel.unsubscribe()
      roomsChannel.unsubscribe()
    }
  }, [roomId, onRoomDataUpdate])
}
