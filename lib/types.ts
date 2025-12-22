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
  answer_mode: "freetext" | "mcq" | "typeahead"
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

export interface Player {
  id: string
  name: string
  team_id: string | null
  created_at: string
}

export interface TeamWithPlayers extends Team {
  players: string[]
}

export interface QuestionOption {
  id: string
  question_id: string
  label: string
  normalized_label: string
  is_correct: boolean
  sort_order: number
  created_at: string
}

export interface PlayerAnswer {
  id: string
  player_id: string | null
  team_id: string
  question_id: string
  selected_option_id: string | null
  free_text_answer: string | null
  is_correct: boolean
  points_awarded: number
  hints_used: number
  submitted_at: string
}

export interface QuestionWithOptions extends Question {
  options: QuestionOption[]
}
