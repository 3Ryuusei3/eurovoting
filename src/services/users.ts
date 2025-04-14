import { supabase } from '@/lib/supabase';

import { User } from '@/types/User';

export const createUser = async (name: string, role_id: number, room_id: string, color: string, text_color: string): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        name,
        role_id: role_id.toString(),
        room_id,
        color,
        text_color
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}
