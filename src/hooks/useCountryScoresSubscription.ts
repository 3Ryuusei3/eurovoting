import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Entry } from '@/types/Room'
import { points } from '@/constants'

interface CountryScore {
  entry_id: number
  country_name: string
  country_flag: string
  running_order: number
  points: number
}

interface UserScore {
  user_id: string
  user_name: string
  color?: string
  text_color?: string
  points: {
    [key: string]: {
      entry_id: number
      country_name: string
      country_flag: string
      score: number
    } | null
  }
}

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

    setLoading(true)
    try {
      console.log(`Loading votes matrix for poll_id=${roomId}...`)

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
      const data = matrixData ? matrixData.map((userVote: any) => ({
        ...userVote,
        color: userColors[userVote.user_id]?.color,
        text_color: userColors[userVote.user_id]?.text_color
      })) : []

      // Error check already done above

      console.log(`Votes matrix data received:`, data)

      // Initialize country scores with entries data
      const initialCountryScores: CountryScore[] = entries.map(entry => ({
        entry_id: entry.id,
        country_name: entry.country.name_es,
        country_flag: entry.country.flag,
        running_order: entry.running_order,
        points: 0
      }))

      setCountryScores(initialCountryScores)
      setUserScores(data || [])
    } catch (error) {
      console.error('Error in loadVotes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Function to reveal a user's scores
  const revealUserScore = (userId: string, pointsFilter?: number[]) => {
    console.log(`Revealing scores for user ${userId} with filter:`, pointsFilter);

    // Find the user's scores
    const userVote = userScores.find(u => u.user_id === userId)
    if (!userVote) {
      console.log('User vote not found');
      return;
    }

    // For the first reveal or when resetting, initialize scores from entries
    if (countryScores.length === 0) {
      console.log('Initializing country scores');
      const initialScores = entries.map(entry => ({
        entry_id: entry.id,
        country_name: entry.country.name_es,
        country_flag: entry.country.flag,
        running_order: entry.running_order,
        points: 0
      }));
      setCountryScores(initialScores);
    }

    // IMPORTANT: We'll completely recalculate the scores for all revealed users
    // This ensures we don't have any duplicate points issues

    // First, update the revealed users and points tracking
    let newRevealedUsers = [...revealedUsers];
    let newRevealedPoints = {...revealedPoints};

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

    console.log('Updated revealed points:', newRevealedPoints);

    // Update state with new tracking information
    setRevealedUsers(newRevealedUsers);
    setRevealedPoints(newRevealedPoints);

    // Now recalculate ALL scores from scratch based on revealed users and points
    // This prevents any double-counting issues
    const recalculatedScores = entries.map(entry => ({
      entry_id: entry.id,
      country_name: entry.country.name_es,
      country_flag: entry.country.flag,
      running_order: entry.running_order,
      points: 0 // Start with zero points
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

    console.log('Setting recalculated scores:', sortedScores);
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
    console.log(`Creating new channel: ${channelName} for poll_id=${roomId}`)

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
          (payload) => {
            console.log('Votes changed, payload:', payload)
            console.log('Reloading votes data...')
            loadVotes()
            // Reset revealed users when votes change
            setRevealedUsers([])
            setRevealedPoints({})
            resetScores()
          }
        )
        .subscribe((status) => {
          console.log(`Subscription status for ${channelName}:`, status)
        })

      // Store the channel reference
      channelRef.current = votesChannel

      console.log(`Successfully subscribed to channel: ${channelName}`)
    } catch (error) {
      console.error(`Error subscribing to channel ${channelName}:`, error)
    }

    return () => {
      console.log(`Unsubscribing from channel: ${channelName}`)
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [roomId, entries])

  return { countryScores, userScores, loading, revealUserScore, resetScores, revealedPoints }
}
