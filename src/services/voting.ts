import { supabase } from '@/lib/supabase'
import { Points } from '@/types/Room'
import { toast } from 'sonner'

/**
 * Check if a user has already voted in a poll
 */
export async function checkUserVoted(userId: string, pollId: string): Promise<boolean> {
  if (!userId || !pollId) {
    return false
  }

  try {
    const { error, count } = await supabase
      .from('votes')
      .select('id', { count: 'exact' })
      .eq('user_id', parseInt(userId, 10))
      .eq('poll_id', parseInt(pollId, 10))
      .limit(1)

    if (error) {
      console.error('Error checking if user has voted:', error)
      return false
    }

    return count !== null && count > 0
  } catch (error) {
    console.error('Error in checkUserVoted:', error)
    return false
  }
}

/**
 * Save votes to the database
 */
export async function saveVotes(userId: string, pollId: string, points: Points): Promise<boolean> {
  if (!userId || !pollId) {
    toast.error('Error al guardar los votos: Faltan datos de usuario o encuesta')
    return false
  }

  try {
    // Transform the points object into the format expected by the save_votes function
    const votesData = Object.entries(points).map(([entryId, entryPoints]) => ({
      entry_id: parseInt(entryId, 10),
      score: entryPoints.main || 0,
      song: entryPoints.song || null,
      singing: entryPoints.singing || null,
      performance: entryPoints.performance || null,
      staging: entryPoints.staging || null
    }))

    const userIdInt = parseInt(userId, 10)
    const pollIdInt = parseInt(pollId, 10)

    // Call the save_votes function
    const { error } = await supabase
      .rpc('save_votes', {
        user_id_param: userIdInt,
        poll_id_param: pollIdInt,
        votes_data: votesData
      })

    if (error) {
      console.error('Error saving votes:', error)
      toast.error('Error al guardar los votos en la base de datos')
      return false
    }

    toast.success('Votos guardados correctamente')
    return true
  } catch (error) {
    console.error('Error in saveVotes:', error)
    toast.error('Error al guardar los votos')
    return false
  }
}

/**
 * Reset all votes for a user in a poll to 0
 */
export async function resetVotes(userId: string, pollId: string, entries: { id: number }[]): Promise<boolean> {
  if (!userId || !pollId) {
    toast.error('Error al reiniciar las puntuaciones: Faltan datos de usuario o encuesta')
    return false
  }

  try {
    const userIdInt = parseInt(userId, 10)
    const pollIdInt = parseInt(pollId, 10)

    // Create an array of vote objects with all scores set to 0
    const votesData = entries.map(entry => ({
      entry_id: entry.id,
      score: 0,
      song: null,
      singing: null,
      performance: null,
      staging: null
    }))

    // Call the save_votes function with the reset votes
    const { error } = await supabase
      .rpc('save_votes', {
        user_id_param: userIdInt,
        poll_id_param: pollIdInt,
        votes_data: votesData
      })

    if (error) {
      console.error('Error resetting votes:', error)
      toast.error('Error al reiniciar las puntuaciones')
      return false
    }

    toast.success('Puntuaciones reiniciadas correctamente')
    return true
  } catch (error) {
    console.error('Error in resetVotes:', error)
    toast.error('Error al reiniciar las puntuaciones')
    return false
  }
}
