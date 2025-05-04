import { supabase } from '@/lib/supabase'
/**
 * Delete a user from a room and all their related data
 * @param userId - The user ID to delete
 * @param roomId - The room ID
 */
export async function deleteUserFromRoom(userId: string, roomId: string): Promise<void> {
  if (!userId || !roomId) {
    throw new Error('User ID and Room ID are required')
  }

  try {
    // Get the poll_id for the room to delete votes
    const { error: roomError } = await supabase
      .from('rooms')
      .select('poll_id')
      .eq('id', roomId)
      .single()

    if (roomError) {
      console.error('Error getting room data:', roomError)
      throw roomError
    }

    // Start a transaction to delete all related data
    // 1. Delete user's bingo cards for this room
    const { error: bingoError } = await supabase
      .from('bingo_cards')
      .delete()
      .eq('user_id', userId)
      .eq('room_id', roomId)

    if (bingoError) {
      console.error('Error deleting bingo cards:', bingoError)
      throw bingoError
    }

    // 2. Delete user's votes for this room's poll
    const { error: votesError } = await supabase
      .from('votes')
      .delete()
      .eq('user_id', parseInt(userId, 10))
      .eq('poll_id', roomId)

    if (votesError) {
      console.error('Error deleting votes:', votesError)
      throw votesError
    }

    // 3. Finally, delete the user_room relationship
    const { error: userRoomError } = await supabase
      .from('user_rooms')
      .delete()
      .eq('user_id', userId)
      .eq('room_id', roomId)

    if (userRoomError) {
      console.error('Error deleting user from room:', userRoomError)
      throw userRoomError
    }

  } catch (error) {
    console.error('Error in deleteUserFromRoom:', error)
    throw error
  }
}
