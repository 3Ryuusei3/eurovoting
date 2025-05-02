export interface BingoCell {
  id: number
  cell: string
  created_at: string
}

export interface BingoCard {
  id: number
  user_id: number
  room_id: number
  checked: boolean
  created_at: string
  position: number
}

export interface BingoCellWithStatus extends BingoCell {
  checked: boolean
  card_id?: number
  position: number
}
