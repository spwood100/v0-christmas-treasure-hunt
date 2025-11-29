export interface Team {
  id: string
  name: string
  pin: string
  created_at: string
  current_question_index: number
  completed_at: string | null
  total_score: number
}

export interface Question {
  id: string
  question_order: number
  round_type: "text" | "photo" | "music"
  clue: string
  answer: string
  hint_1: string | null
  hint_2: string | null
  hint_3: string | null
  max_points: number
  hint_1_penalty: number
  hint_2_penalty: number
  hint_3_penalty: number
  image_url: string | null
  audio_url: string | null
  created_at: string
}

export interface TeamProgress {
  id: string
  team_id: string
  question_id: string
  hints_used: number
  points_earned: number
  answered_at: string
  time_taken_seconds: number
}

export interface LeaderboardEntry {
  id: string
  name: string
  total_score: number
  completed_at: string | null
  questions_answered: number
}
