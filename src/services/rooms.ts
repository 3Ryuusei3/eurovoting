import { supabase } from '@/lib/supabase';

import { Room, RoomData, RoomWithPollName, Points } from '@/types/Room';

export async function createRoom(code: string, poll_id: string): Promise<Room> {
  const { data, error } = await supabase
    .from("rooms")
    .insert({ code, poll_id })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getRoomData(roomId: string): Promise<RoomData> {
  const { data, error } = await supabase
    .rpc('get_room_data', { room_id_param: parseInt(roomId, 10) });

  if (error) {
    console.error('Error calling get_room_data function:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Room not found');
  }

  return data as RoomData;
}

export async function getRoomByCode(code: string): Promise<Room> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", code)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getRoomsWithPollNamesForUser(userId: string): Promise<Room[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .rpc('get_rooms_with_polls', { user_id_param: parseInt(userId, 10) });

    if (error) {
      console.error('Error fetching rooms with polls:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform the data to match the Room interface
    return data.map((room: RoomWithPollName) => ({
      id: room.id.toString(),
      code: room.code,
      poll_id: room.poll_id.toString(),
      polls: {
        name: room.poll_name
      }
    }));
  } catch (error) {
    console.error('Error in getRoomsWithPollNamesForUser:', error);
    throw error;
  }
}

/**
 * Save votes to the database
 * @param userId - The user ID
 * @param pollId - The poll ID
 * @param points - The points object containing votes for each entry
 */
/**
 * Check if a user has already voted in a poll
 * @param userId - The user ID
 * @param pollId - The poll ID
 * @returns A boolean indicating if the user has already voted
 */
export async function hasUserVoted(userId: string, pollId: string): Promise<boolean> {
  if (!userId || !pollId) {
    return false;
  }

  try {
    const { error, count } = await supabase
      .from('votes')
      .select('id', { count: 'exact' })
      .eq('user_id', parseInt(userId, 10))
      .eq('poll_id', parseInt(pollId, 10))
      .limit(1);

    if (error) {
      console.error('Error checking if user has voted:', error);
      return false;
    }

    return count !== null && count > 0;
  } catch (error) {
    console.error('Error in hasUserVoted:', error);
    return false;
  }
}

/**
 * Save votes to the database
 * @param userId - The user ID
 * @param pollId - The poll ID
 * @param points - The points object containing votes for each entry
 */
export async function saveVotesToDatabase(userId: string, pollId: string, points: Points): Promise<void> {
  if (!userId || !pollId) {
    throw new Error('User ID and Poll ID are required');
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
    }));

    // Call the save_votes function
    const { error } = await supabase
      .rpc('save_votes', {
        user_id_param: parseInt(userId, 10),
        poll_id_param: parseInt(pollId, 10),
        votes_data: votesData // Send the array directly, not as a string
      });

    if (error) {
      console.error('Error saving votes:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in saveVotesToDatabase:', error);
    throw error;
  }
}
