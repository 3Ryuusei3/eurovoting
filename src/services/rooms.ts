import { supabase } from '@/lib/supabase';

import { Room, RoomData, RoomWithPollName, Points } from '@/types/Room';

// Types for votes data
export interface Vote {
  id: number;
  user_id: string;
  user_name?: string; // Added user_name
  entry_id: number;
  country_name?: string; // Added country_name
  country_flag?: string; // Added country_flag
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
    const { data, error } = await supabase
      .rpc('get_votes_matrix', { poll_id_param: parseInt(roomId, 10) });

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

  console.log('Fetching votes for poll ID:', roomId);

  try {
    // Log the poll_id we're querying for
    console.log('Querying votes with poll_id:', parseInt(roomId, 10));

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

    console.log('Raw votes data with joins:', data);
    console.log('Query error:', error);

    // Try a direct query to see all votes in the table
    const { data: allVotes, error: allVotesError } = await supabase
      .from('votes')
      .select('*')
      .eq('poll_id', parseInt(roomId, 10))
      .limit(20);

    console.log('Sample of all votes in the table for this poll:', allVotes);
    console.log('Error fetching all votes:', allVotesError);

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

    console.log('Users data:', usersData);
    console.log('Entries data:', entriesData);
    console.log('Entry IDs from votes:', entryIds);

    // Create maps for quick lookup
    const userMap = new Map();
    (usersData || []).forEach(user => userMap.set(user.id, user.name));

    const entryMap = new Map();

    // Get all country_ids from entries
    const countryIds = entriesData
      ?.filter(entry => entry.country_id)
      .map(entry => entry.country_id) || [];

    console.log('Country IDs from entries:', countryIds);

    // Fetch all countries directly
    if (countryIds.length > 0) {
      console.log('Fetching countries with IDs:', countryIds);

      const { data: countriesData, error: countriesError } = await supabase
        .from('countries')
        .select('id, name_es, flag')
        .in('id', countryIds);

      if (countriesError) {
        console.error('Error fetching countries:', countriesError);
      } else if (countriesData) {
        console.log('Countries data:', countriesData);

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

    console.log('Final entry map:', [...entryMap.entries()]);

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

    console.log('Formatted votes data:', formattedData);
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
