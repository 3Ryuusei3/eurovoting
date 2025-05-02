import { BingoCellWithStatus } from '@/types/Bingo'

export interface UserBingo {
  user_id: string
  user_name: string
  color?: string
  text_color?: string
  cells: BingoCellWithStatus[]
  completedCount: number
}
