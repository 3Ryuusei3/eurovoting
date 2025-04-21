import { supabase } from '@/lib/supabase';

import { Room, RoomData, RoomWithPollName } from '@/types/Room';

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
