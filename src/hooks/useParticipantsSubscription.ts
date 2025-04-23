import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RoomUser } from '@/types/Room'

interface ParticipantsSubscriptionProps {
  roomId: string | null
  initialUsers: RoomUser[]
}

export function useParticipantsSubscription({ roomId, initialUsers }: ParticipantsSubscriptionProps) {
  // Filter out users with role_id = 2 (display role) from initial users
  // We do this only once when initializing the state
  const filteredInitialUsers = initialUsers.filter(user => user.role_id !== 2)
  const [users, setUsers] = useState<RoomUser[]>(filteredInitialUsers)

  useEffect(() => {
    // Update users when initialUsers prop changes, but filter out display users
    const filtered = initialUsers.filter(user => user.role_id !== 2)
    setUsers(filtered)
  }, [initialUsers])

  useEffect(() => {
    if (!roomId) return

    const fetchRoomUsers = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_room_users', { room_id_param: parseInt(roomId, 10) })

        if (error) throw error
        if (data) {
          // The get_room_users function already filters out users with role_id = 2,
          // but we'll double-check here just to be safe
          const filteredData = (data as RoomUser[]).filter(user => user.role_id !== 2)
          setUsers(filteredData)
        }
      } catch (err) {
        console.error('Error fetching updated participants:', err)
      }
    }

    // Subscribe to changes in the user_rooms table for this room
    const userRoomsChannel = supabase
      .channel('participants_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'user_rooms',
          filter: `room_id=eq.${roomId}`
        },
        () => fetchRoomUsers()
      )
      .subscribe()

    // Also subscribe to changes in the users table
    const usersChannel = supabase
      .channel('users_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'users'
        },
        () => fetchRoomUsers()
      )
      .subscribe()

    return () => {
      userRoomsChannel.unsubscribe()
      usersChannel.unsubscribe()
    }
  }, [roomId])

  return users
}
