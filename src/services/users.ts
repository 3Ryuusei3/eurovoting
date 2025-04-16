import { supabase } from '@/lib/supabase';

import { User } from '@/types/User';

export const createUser = async (name: string, role_id: number, room_id: string, color: string, text_color: string): Promise<User> => {
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

  // Then create the user_room relationship
  const { error: userRoomError } = await supabase
    .from('user_rooms')
    .insert([
      {
        user_id: userData.id,
        room_id,
        role_id: role_id.toString()
      }
    ]);

  if (userRoomError) throw userRoomError;

  return userData;
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
