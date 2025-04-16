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
    .single()

  if (error) throw error
  return data
}
