import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getVotesMatrix, UserVoteMatrix } from '@/services/rooms'

interface VotesSubscriptionProps {
  roomId: string | null
}

export function useVotesSubscription({ roomId }: VotesSubscriptionProps) {
  const [votes, setVotes] = useState<UserVoteMatrix[]>([])
  const [loading, setLoading] = useState(true)

  // Function to load votes data
  const loadVotes = async () => {
    if (!roomId) return

    setLoading(true)
    try {
      const votesData = await getVotesMatrix(roomId)
      setVotes(votesData)
    } catch (error) {
      console.error('Error loading votes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Use a ref to track the channel
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Initial load and setup realtime subscription
  useEffect(() => {
    if (!roomId) return

    // Load votes initially
    loadVotes()

    // Clean up previous subscription if it exists
    if (channelRef.current) {
      channelRef.current.unsubscribe()
    }

    // Create a unique channel name to avoid conflicts
    const channelName = `votes_changes_${roomId}_${Date.now()}`

    // Subscribe to changes in the votes table for this room/poll
    try {
      const votesChannel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'votes',
            filter: `poll_id=eq.${roomId}`
          },
          () => {
            loadVotes()
          }
        )
        .subscribe(() => {})

      // Store the channel reference
      channelRef.current = votesChannel

    } catch (error) {
      console.error(`Error subscribing to channel ${channelName}:`, error)
    }

    // Channel reference is already stored in the try block

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [roomId])

  return { votes, loading }
}
