import { supabase } from '@/lib/supabase';

import { User } from '@/types/User';

export async function createUser(name: string, role_id: string, room_id: string, color?: string, text_color?: string): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert({ name, role_id, room_id, color, text_color })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
