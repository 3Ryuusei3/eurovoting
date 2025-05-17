export interface Question {
  id: number
  title: string
  created_at: string
  answers?: Answer[]
}

export interface Answer {
  id: number
  name: string
  is_correct: boolean
  question_id: number
  created_at: string
}

export type QuestionState = 'ready' | 'sent' | 'answered'

export interface RoomQuestion {
  id: number
  room_id: number
  question_id: number
  state: QuestionState
  created_at: string
  updated_at: string
  question?: Question
}

export interface UserAnswer {
  id: number
  user_id: number
  room_id: number
  question_id: number
  answer_id: number
  created_at: string
  // User information
  user_name?: string
  color?: string
  text_color?: string
  // Additional properties from database functions
  is_correct?: boolean
  answer_name?: string
}

export interface QuestionWithAnswers extends Question {
  answers: Answer[]
}

export interface RoomQuestionWithDetails extends RoomQuestion {
  question: QuestionWithAnswers
}
