export interface BetOption {
  id: number
  running_order: number
  artist: string
  song: string
  country_name: string
  country_flag: string
  country_squared: string
}

export interface Bet {
  id: number
  user_id: number
  room_id: number
  entry_id: number
  amount: number
  created_at: string
}

export interface BetSummary {
  entry_id: number
  country_name: string
  country_flag: string
  country_squared: string
  song: string
  artist: string
  total_bets: number
  total_points: number
}
