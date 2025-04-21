import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/store/useStore'

export function useUserSubscription() {
  const { user, removeUser, removeRooms, removePoints } = useStore()

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
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user, removeUser, removeRooms])
}
