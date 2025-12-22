-- Migration to add answer options support (MCQ and typeahead)

-- Add answer_mode column to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS answer_mode TEXT DEFAULT 'freetext' CHECK (answer_mode IN ('freetext', 'mcq', 'typeahead'));

-- Create question_options table
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  normalized_label TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create player_answers table (replaces free-text tracking)
CREATE TABLE IF NOT EXISTS player_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
  free_text_answer TEXT, -- fallback for freetext mode
  is_correct BOOLEAN NOT NULL,
  points_awarded INTEGER NOT NULL,
  hints_used INTEGER DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, question_id)
);

-- Enable RLS
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_answers ENABLE ROW LEVEL SECURITY;

-- Public access policies for question_options
CREATE POLICY "Allow public read question_options" ON question_options FOR SELECT USING (true);
CREATE POLICY "Allow public insert question_options" ON question_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update question_options" ON question_options FOR UPDATE USING (true);
CREATE POLICY "Allow public delete question_options" ON question_options FOR DELETE USING (true);

-- Public access policies for player_answers
CREATE POLICY "Allow public read player_answers" ON player_answers FOR SELECT USING (true);
CREATE POLICY "Allow public insert player_answers" ON player_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update player_answers" ON player_answers FOR UPDATE USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_player_answers_team_question ON player_answers(team_id, question_id);
