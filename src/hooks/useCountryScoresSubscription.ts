import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Entry } from '@/types/Room'
import { CountryScore, UserScore } from '@/components/room/CountryScores/types'

interface CountryScoresSubscriptionProps {
  roomId: string | null
  entries: Entry[]
}

export function useCountryScoresSubscription({ roomId, entries }: CountryScoresSubscriptionProps) {
  const [countryScores, setCountryScores] = useState<CountryScore[]>([])
  const [userScores, setUserScores] = useState<UserScore[]>([])
  const [loading, setLoading] = useState(true)
  const [revealedUsers, setRevealedUsers] = useState<string[]>([])

  // Track which point values have been revealed for each user
  const [revealedPoints, setRevealedPoints] = useState<{[userId: string]: number[]}>({})

  // Use a ref to track the channel
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Function to load votes data
  const loadVotes = async () => {
    if (!roomId) return

    if (isCompletedState && countryScores.length > 0 && countryScores.some(score => score.points > 0)) {
      return;
    }

    setLoading(true)
    try {
      // Get votes matrix from Supabase
      const { data: matrixData, error: matrixError } = await supabase
        .rpc('get_votes_matrix', { poll_id_param: parseInt(roomId, 10) })

      // Get user colors from users table
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, color, text_color')

      if (matrixError) {
        console.error('Error fetching votes matrix:', matrixError)
        throw matrixError
      }

      if (usersError) {
        console.error('Error fetching users:', usersError)
        // Continue without colors if there's an error
      }

      // Create a map of user IDs to colors
      const userColors = usersData ? usersData.reduce((acc, user) => {
        acc[user.id] = { color: user.color, text_color: user.text_color }
        return acc
      }, {} as Record<string, { color: string, text_color: string }>) : {}

      // Add colors to the votes matrix data
      const data = matrixData ? matrixData.map((userVote: { user_id: string; user_name: string; points: Record<string, any> }) => ({
        ...userVote,
        color: userColors[userVote.user_id]?.color,
        text_color: userColors[userVote.user_id]?.text_color
      })) : []

      // Initialize country scores with entries data
      // Only reset scores if we're not in completed state or if scores are empty
      if (!isCompletedState || countryScores.length === 0) {
        const initialCountryScores: CountryScore[] = entries.map(entry => ({
          entry_id: entry.id,
          country_name: entry.country.name_es,
          country_flag: entry.country.flag,
          flag_square: entry.country.flag_square,
          running_order: entry.running_order,
          points: 0
        }))

        setCountryScores(initialCountryScores)
      }

      setUserScores(data || [])
    } catch (error) {
      console.error('Error in loadVotes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Function to reveal a user's scores
  const revealUserScore = (userId: string, pointsFilter?: number[]) => {
    // Find the user's scores
    const userVote = userScores.find(u => u.user_id === userId)
    if (!userVote) {
      return;
    }

    // For the first reveal or when resetting, initialize scores from entries
    if (countryScores.length === 0) {
      const initialScores = entries.map(entry => ({
        entry_id: entry.id,
        country_name: entry.country.name_es,
        country_flag: entry.country.flag,
        flag_square: entry.country.flag_square,
        running_order: entry.running_order,
        points: 0
      }));
      setCountryScores(initialScores);
    }

    // First, update the revealed users and points tracking
    const newRevealedUsers = [...revealedUsers];
    const newRevealedPoints = {...revealedPoints};

    // If this is a new user being revealed, add them to the list
    if (!newRevealedUsers.includes(userId)) {
      newRevealedUsers.push(userId);
    }

    // Update the points that have been revealed for this user
    if (!newRevealedPoints[userId]) {
      newRevealedPoints[userId] = [];
    }

    if (pointsFilter) {
      // Add any new points from the filter that aren't already tracked
      pointsFilter.forEach(point => {
        if (!newRevealedPoints[userId].includes(point)) {
          newRevealedPoints[userId].push(point);
        }
      });
    }

    // Update state with new tracking information
    setRevealedUsers(newRevealedUsers);
    setRevealedPoints(newRevealedPoints);

    // Now recalculate ALL scores from scratch based on revealed users and points
    // This prevents any double-counting issues
    const recalculatedScores = entries.map(entry => ({
      entry_id: entry.id,
      country_name: entry.country.name_es,
      country_flag: entry.country.flag,
      flag_square: entry.country.flag_square,
      running_order: entry.running_order,
      points: 0
    }));

    // For each revealed user, add their revealed points to the appropriate countries
    newRevealedUsers.forEach(revealedUserId => {
      const userVoteData = userScores.find(u => u.user_id === revealedUserId);
      if (!userVoteData) return;

      const userRevealedPointValues = newRevealedPoints[revealedUserId] || [];

      // Add points for each revealed point value
      userRevealedPointValues.forEach(point => {
        const vote = userVoteData.points[point.toString()];
        if (!vote) return;

        // Find the country in our recalculated scores array
        const countryIndex = recalculatedScores.findIndex(c => c.entry_id === vote.entry_id);
        if (countryIndex === -1) return;

        // Add the points to the country's score
        recalculatedScores[countryIndex].points += point;
      });
    });

    // Sort by points (highest first)
    const sortedScores = recalculatedScores.sort((a, b) => {
      if (b.points === a.points) {
        // If points are equal, sort by running order
        return a.running_order - b.running_order;
      }
      return b.points - a.points;
    });

    setCountryScores(sortedScores);
  }

  // Function to reset scores
  const resetScores = () => {
    // Clear all revealed users and points tracking
    setRevealedUsers([])
    setRevealedPoints({})

    // Reset all country scores to 0 and sort by running order
    setCountryScores(prev =>
      prev.map(score => ({
        ...score,
        points: 0
      })).sort((a, b) => a.running_order - b.running_order)
    )
  }

  // Function to reveal all scores at once
  const revealAllScores = () => {
    if (userScores.length === 0) return

    // Mark all users as revealed
    const allUserIds = userScores.map(user => user.user_id)
    setRevealedUsers(allUserIds)

    // Mark all points as revealed for all users
    const allRevealedPoints: {[userId: string]: number[]} = {}
    userScores.forEach(user => {
      // Get all point values (1, 2, 3, 4, 5, 6, 7, 8, 10, 12)
      const pointValues = Object.keys(user.points)
        .filter(key => user.points[key] !== null)
        .map(key => parseInt(key, 10))

      allRevealedPoints[user.user_id] = pointValues
    })

    setRevealedPoints(allRevealedPoints)

    // Calculate final scores
    const finalScores = entries.map(entry => ({
      entry_id: entry.id,
      country_name: entry.country.name_es,
      country_flag: entry.country.flag,
      flag_square: entry.country.flag_square,
      running_order: entry.running_order,
      points: 0
    }))

    // Add up all points from all users
    userScores.forEach(user => {
      Object.entries(user.points).forEach(([pointValue, vote]) => {
        if (!vote) return

        const pointsNum = parseInt(pointValue, 10)
        const countryIndex = finalScores.findIndex(c => c.entry_id === vote.entry_id)

        if (countryIndex !== -1) {
          finalScores[countryIndex].points += pointsNum
        }
      })
    })

    // Sort by points (highest first)
    const sortedScores = finalScores.sort((a, b) => {
      if (b.points === a.points) {
        // If points are equal, sort by running order
        return a.running_order - b.running_order
      }
      return b.points - a.points
    })

    setCountryScores(sortedScores)
  }

  // Track if we're in completed state to avoid resetting scores
  const [isCompletedState, setIsCompletedState] = useState(false)

  // Check room state
  useEffect(() => {
    if (!roomId) return

    const checkRoomState = async () => {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('state')
          .eq('id', parseInt(roomId, 10))
          .single()

        if (error) throw error
        setIsCompletedState(data?.state === 'completed')
      } catch (error) {
        console.error('Error checking room state:', error)
      }
    }

    checkRoomState()

    // Subscribe to room state changes
    const roomStateChannel = supabase
      .channel(`room_state_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`
        },
        (payload: any) => {
          setIsCompletedState(payload.new?.state === 'completed')
        }
      )
      .subscribe()

    return () => {
      roomStateChannel.unsubscribe()
    }
  }, [roomId])

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
    const channelName = `country_scores_${roomId}_${Date.now()}`
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
            // Load votes but don't automatically reset scores
            loadVotes()
          }
        )
        .subscribe(() => {})

      // Store the channel reference
      channelRef.current = votesChannel

    } catch (error) {
      console.error(`Error subscribing to channel ${channelName}:`, error)
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [roomId, entries, isCompletedState])

  return { countryScores, userScores, loading, revealUserScore, resetScores, revealedPoints, revealAllScores }
}
