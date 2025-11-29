-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  pin TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_question_index INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_score INTEGER DEFAULT 0
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_order INTEGER NOT NULL,
  round_type TEXT NOT NULL CHECK (round_type IN ('text', 'photo', 'music')),
  clue TEXT NOT NULL,
  answer TEXT NOT NULL,
  hint_1 TEXT,
  hint_2 TEXT,
  hint_3 TEXT,
  max_points INTEGER DEFAULT 100,
  hint_1_penalty INTEGER DEFAULT 20,
  hint_2_penalty INTEGER DEFAULT 20,
  hint_3_penalty INTEGER DEFAULT 20,
  image_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team progress tracking
CREATE TABLE IF NOT EXISTS team_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  hints_used INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_taken_seconds INTEGER,
  UNIQUE(team_id, question_id)
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_progress ENABLE ROW LEVEL SECURITY;

-- Public read/write for teams (no auth needed for this game)
CREATE POLICY "Allow public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update teams" ON teams FOR UPDATE USING (true);

-- Public read for questions
CREATE POLICY "Allow public read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert questions" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update questions" ON questions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete questions" ON questions FOR DELETE USING (true);

-- Public access for team_progress
CREATE POLICY "Allow public read team_progress" ON team_progress FOR SELECT USING (true);
CREATE POLICY "Allow public insert team_progress" ON team_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update team_progress" ON team_progress FOR UPDATE USING (true);
