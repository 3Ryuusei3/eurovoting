import { supabase } from '@/lib/supabase';

import { Room, RoomData } from '@/types/Room';

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

  // First, get all the rooms for the user
  const { data: roomsData, error: roomsError } = await supabase
    .from('user_rooms')
    .select('room_id')
    .eq('user_id', userId);

  console.log(roomsData);
  if (roomsError) {
    console.error('Error fetching rooms:', roomsError);
    throw roomsError;
  }

  if (!roomsData || roomsData.length === 0) {
    return [];
  }


  // Next, get the rooms with the poll names
  const { data: roomsWithPollNames, error: roomsWithPollNamesError } = await supabase
    .from('rooms')
    .select('id, code, poll_id, polls(name)')
    .in('id', roomsData.map(room => room.room_id));

  if (roomsWithPollNamesError) {
    console.error('Error fetching rooms with poll names:', roomsWithPollNamesError);
    throw roomsWithPollNamesError;
  }

  return roomsWithPollNames;
}
