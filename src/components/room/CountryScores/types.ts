export interface CountryScore {
  entry_id: number
  country_name: string
  country_flag: string
  running_order: number
  points: number
}

export interface UserScore {
  user_id: string
  user_name: string
  color?: string
  text_color?: string
  points: {
    [key: string]: {
      entry_id: number
      country_name: string
      country_flag: string
      score: number
    } | null
  }
}
