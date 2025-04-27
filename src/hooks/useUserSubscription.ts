import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/store/useStore'
import { User } from '@/types/User'

export function useUserSubscription() {
  const { user, setUser, removeUser, removeRooms, removePoints } = useStore()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('user_changes')
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`
        },
        () => {
          removeUser()
          removeRooms()
          removePoints()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          // Update the user in the store with the new data
          const updatedUser = payload.new as User
          setUser(updatedUser)
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user, setUser, removeUser, removeRooms, removePoints])
}
