export interface Country {
  id: number
  name_es: string
  flag: string
  name_en: string
}

export interface Entry {
  id: number
  song: string
  artist: string
  year: number
  running_order: number
  youtube: string
  country: Country
}

export interface RoomUser {
  id: string
  name: string
  color?: string
  text_color?: string
  role_id: number
}

export type RoomState = 'voting' | 'finished' | 'completed'

export interface Room {
  id: string
  code: string
  poll_id: string
  state: RoomState
  polls?: {
    name: string
  }
}

export interface Poll {
  id: string
  name: string
  description: string
}

export interface RoomData {
  room: Room
  poll: Poll
  users: RoomUser[]
  entries: Entry[]
}

export interface RoomWithPollName {
  id: number;
  code: string;
  poll_id: number;
  poll_name: string;
}

export type SortMethod = 'running_order' | 'points'

export type Points = Record<string, Record<string, number>>
