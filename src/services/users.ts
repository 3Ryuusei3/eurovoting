import { supabase } from '@/lib/supabase';

import { User } from '@/types/User';


export const createUser = async (name: string, role_id: number, room_id: string, color: string, text_color: string): Promise<User> => {
  try {
    // First create the user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          name,
          color,
          text_color
        }
      ])
      .select()
      .single();

    if (userError) throw userError;

    // Then create the user_room relationship in a separate table
    const { error: userRoomError } = await supabase
      .from('user_rooms')
      .insert([
        {
          user_id: userData.id,
          room_id,
          role_id: role_id
        }
      ]);

    if (userRoomError) throw userRoomError;

    return userData;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

export const updateUser = async (user: User): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .update({
      name: user.name,
      color: user.color,
      text_color: user.text_color
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export const checkUserRoleAndExistence = async (userId: string | null, roomId: string | null) => {
  if (!userId || !roomId) {
    return { isDisplayRole: false, userExists: false }
  }

  // First check if user exists in users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()

  if (userError || !userData) {
    // If user doesn't exist, just return false without clearing store
    return { isDisplayRole: false, userExists: false }
  }

  // Then check user role in the room
  const { data: roleData, error: roleError } = await supabase
    .from('user_rooms')
    .select('role_id')
    .eq('user_id', userId)
    .eq('room_id', roomId)
    .single()

  return {
    isDisplayRole: !roleError && roleData ? parseInt(roleData.role_id) === 2 : false,
    userExists: true
  }
}

export const getUserRoleForRoom = async (userId: string, roomId: string): Promise<number | null> => {
  if (!userId || !roomId) return null;

  try {
    const { data, error } = await supabase
      .from('user_rooms')
      .select('role_id')
      .eq('user_id', userId)
      .eq('room_id', roomId)
      .single()

    if (error || !data) return null;

    return parseInt(data.role_id);
  } catch (err) {
    console.error('Error getting user role for room:', err);
    return null;
  }
}

export const joinRoom = async (userName: string, roomCode: string, color: string, textColor: string, roleId: number): Promise<User> => {
  try {
    const { data, error } = await supabase
      .rpc('join_room', {
        user_name: userName,
        room_code: roomCode,
        user_color: color,
        user_text_color: textColor,
        role_id: roleId
      });

    if (error) {
      console.error('Error joining room:', error);
      throw error;
    }

    return data as User;
  } catch (error) {
    console.error('Error in joinRoom:', error);
    throw error;
  }
}
