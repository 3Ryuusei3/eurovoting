export type Room = {
  id: string;
  created_at: string;
  code: string;
  poll_id: string;
}

export type RoomUser = {
  id: string;
  name: string;
  role_id: string;
  room_id: string;
  color?: string;
  text_color?: string;
}

export type RoomEntry = {
  id: string;
  song: string;
  artist: string;
  youtube: string;
  year: number;
  country_id: string;
  running_order: number;
  country: {
    name_es: string;
    flag: string;
  }
}

export type RoomData = {
  room: Room;
  users: RoomUser[];
  entries: RoomEntry[];
}
