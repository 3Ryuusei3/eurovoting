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

export async function getRoomsWithPollNames(roomIds: string[]): Promise<Room[]> {
  if (!roomIds.length) return [];

  // First, get all the rooms
  const { data: roomsData, error: roomsError } = await supabase
    .from('rooms')
    .select('id, code, poll_id')
    .in('id', roomIds);

  if (roomsError) {
    console.error('Error fetching rooms:', roomsError);
    throw roomsError;
  }

  if (!roomsData || roomsData.length === 0) {
    return [];
  }

  // Extract all unique poll IDs
  const pollIds = [...new Set(roomsData.map(room => room.poll_id))];

  // Then, get all the polls
  const { data: pollsData, error: pollsError } = await supabase
    .from('polls')
    .select('id, name')
    .in('id', pollIds);

  if (pollsError) {
    console.error('Error fetching polls:', pollsError);
    throw pollsError;
  }

  // Create a map of poll IDs to poll names
  const pollMap = new Map();
  if (pollsData) {
    pollsData.forEach(poll => {
      pollMap.set(poll.id, poll.name);
    });
  }

  // Combine the data
  return roomsData.map(room => ({
    id: room.id,
    code: room.code,
    poll_id: room.poll_id,
    poll_name: pollMap.get(room.poll_id)
  }));
}
