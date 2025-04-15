export interface User {
  id: string;
  name: string;
  role_id: number;
  room_id: string;
  color: string;
  text_color: string;
  created_at: string;
}

export type Theme = 'light' | 'dark'
