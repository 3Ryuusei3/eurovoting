import { supabase } from '@/lib/supabase';

import { Poll } from '@/types/Poll';

export async function getPolls(): Promise<Poll[]> {
  const { data, error } = await supabase
    .from("polls")
    .select()
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching polls:", error.message);
    throw error;
  }

  return data as Poll[];
}
