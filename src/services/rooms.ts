import { supabase } from '@/lib/supabase';

import { Room, RoomData, RoomWithPollName, Points, RoomState } from '@/types/Room';

// Types for votes data
export interface Vote {
  id: number;
  user_id: string;
  user_name?: string;
  entry_id: number;
  country_name?: string;
  country_flag?: string;
  score: number;
  song?: number | null;
  singing?: number | null;
  performance?: number | null;
  staging?: number | null;
  updated_at: string;
}

export interface VoteMatrixEntry {
  entry_id: number;
  country_name: string;
  country_flag: string;
  country_squared: string;
  song?: number | null;
  singing?: number | null;
  performance?: number | null;
  staging?: number | null;
}

export interface UserVoteMatrix {
  user_id: string;
  user_name: string;
  points: {
    [key: string]: VoteMatrixEntry | null;
  };
}

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

  // Ensure the room state is included
  if (data.room && !data.room.state) {
    // If the state is missing, fetch it directly from the rooms table
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('state')
      .eq('id', parseInt(roomId, 10))
      .single();

    if (!roomError && roomData) {
      data.room.state = roomData.state;
    } else if (roomError) {
      console.error('Error fetching room state directly:', roomError);
    }
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
/**
 * Get all votes for a specific poll
 * @param pollId - The poll ID
 * @returns An array of votes
 */
/**
 * Get votes in a matrix format (users as rows, points as columns)
 * @param pollId - The poll ID
 * @returns A matrix of votes
 */
export async function getVotesMatrix(roomId: string): Promise<UserVoteMatrix[]> {
  if (!roomId) {
    return [];
  }

  try {
    // In this application, roomId is used as poll_id in some contexts
    const pollId = parseInt(roomId, 10);

    const { data, error } = await supabase
      .rpc('get_votes_matrix', { poll_id_param: pollId });

    if (error) {
      console.error('Error fetching votes matrix:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getVotesMatrix:', error);
    throw error;
  }
}

/**
 * Get all votes for a specific poll
 * @param pollId - The poll ID
 * @returns An array of votes
 */
export async function getUserVotes(roomId: string): Promise<Vote[]> {
  if (!roomId) {
    return [];
  }

  try {
    // Query votes without trying to use relationships
    const { data, error } = await supabase
      .from('votes')
      .select(`
        id,
        user_id,
        entry_id,
        score,
        song,
        singing,
        performance,
        staging,
        updated_at,
        poll_id
      `)
      .eq('poll_id', parseInt(roomId, 10))
      .gt('score', 0) // Only get votes with score > 0
      .order('user_id', { ascending: true })
      .order('score', { ascending: false });

    if (error) {
      console.error('Error fetching votes:', error);
      throw error;
    }

    // Get users and entries separately to add names
    const userIds = [...new Set((data || []).map(vote => vote.user_id))];
    const entryIds = [...new Set((data || []).map(vote => vote.entry_id))];

    // Get user names
    const { data: usersData } = await supabase
      .from('users')
      .select('id, name')
      .in('id', userIds);

    // Get entries with country_id
    const { data: entriesData, error: entriesError } = await supabase
      .from('entries')
      .select('id, country_id')
      .in('id', entryIds);

    if (entriesError) {
      console.error('Error fetching entries:', entriesError);
    }

    // Create maps for quick lookup
    const userMap = new Map();
    (usersData || []).forEach(user => userMap.set(user.id, user.name));

    const entryMap = new Map();

    // Get all country_ids from entries
    const countryIds = entriesData
      ?.filter(entry => entry.country_id)
      .map(entry => entry.country_id) || [];

    // Fetch all countries directly
    if (countryIds.length > 0) {

      const { data: countriesData, error: countriesError } = await supabase
        .from('countries')
        .select('id, name_es, flag')
        .in('id', countryIds);

      if (countriesError) {
        console.error('Error fetching countries:', countriesError);
      } else if (countriesData) {
        // Create a map of country_id to country data
        const countryMap = new Map();
        countriesData.forEach(country => {
          countryMap.set(country.id, {
            country_name: country.name_es,
            country_flag: country.flag
          });
        });

        // Add entries with their country data to the entry map
        entriesData?.forEach(entry => {
          if (entry.country_id) {
            const countryData = countryMap.get(entry.country_id);
            if (countryData) {
              entryMap.set(entry.id, countryData);
            }
          }
        });
      }
    }

    // Format the data to include user_name, country_name and country_flag
    const formattedData = (data || []).map(vote => {
      const userName = userMap.get(vote.user_id) || 'Unknown User';
      const entryInfo = entryMap.get(vote.entry_id) || { country_name: 'Unknown Country', country_flag: '' };

      // Create a clean vote object
      return {
        ...vote,
        user_id: vote.user_id.toString(),
        user_name: userName,
        country_name: entryInfo.country_name,
        country_flag: entryInfo.country_flag
      };
    });
    return formattedData;
  } catch (error) {
    console.error('Error in getUserVotes:', error);
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
 * Update the state of a room
 * @param roomId - The room ID
 * @param state - The new state
 */
export async function updateRoomState(roomId: string, state: RoomState): Promise<void> {
  if (!roomId) {
    throw new Error('Room ID is required');
  }

  try {
    const { error } = await supabase
      .from('rooms')
      .update({ state })
      .eq('id', parseInt(roomId, 10));

    if (error) {
      console.error('Error updating room state:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateRoomState:', error);
    throw error;
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

    const userIdInt = parseInt(userId, 10);
    const pollIdInt = parseInt(pollId, 10);

    // Call the save_votes function
    const { error } = await supabase
      .rpc('save_votes', {
        user_id_param: userIdInt,
        poll_id_param: pollIdInt,
        votes_data: votesData
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

/**
 * Delete all votes for a user in a poll
 * @param userId - The user ID
 * @param pollId - The poll ID
 */
export async function deleteUserVotes(userId: string, pollId: string): Promise<void> {
  if (!userId || !pollId) {
    throw new Error('User ID and Poll ID are required');
  }

  try {
    const userIdInt = parseInt(userId, 10);
    const pollIdInt = parseInt(pollId, 10);

    // Call the save_votes function with an empty array to delete all votes
    // This works because the save_votes function will update existing votes with the new data
    // and since we're not providing any votes, it will effectively reset all votes to 0
    const { error } = await supabase
      .rpc('save_votes', {
        user_id_param: userIdInt,
        poll_id_param: pollIdInt,
        votes_data: [] // Empty array to delete all votes
      });

    if (error) {
      console.error('Error deleting votes:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error in deleteUserVotes:', error);
    throw error;
  }
}

/**
 * Reset all votes for a user in a poll to 0
 * @param userId - The user ID
 * @param pollId - The poll ID
 * @param entries - The entries to reset votes for
 */
export async function resetUserVotes(userId: string, pollId: string, entries: { id: number }[]): Promise<void> {
  if (!userId || !pollId) {
    throw new Error('User ID and Poll ID are required');
  }

  try {
    const userIdInt = parseInt(userId, 10);
    const pollIdInt = parseInt(pollId, 10);

    // Create an array of vote objects with all scores set to 0
    const votesData = entries.map(entry => ({
      entry_id: entry.id,
      score: 0,
      song: null,
      singing: null,
      performance: null,
      staging: null
    }));

    // Call the save_votes function with the reset votes
    const { error } = await supabase
      .rpc('save_votes', {
        user_id_param: userIdInt,
        poll_id_param: pollIdInt,
        votes_data: votesData
      });

    if (error) {
      console.error('Error resetting votes:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error in resetUserVotes:', error);
    throw error;
  }
}
