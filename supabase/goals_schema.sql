-- CUTIeS-IQ Goals & Recommendations System
-- Run this SQL in Supabase SQL Editor after the main schema

-- Skincare Goals Table
CREATE TABLE IF NOT EXISTS skincare_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  priority INTEGER CHECK (priority IN (1, 2, 3)),
  priority_mode_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE skincare_goals ENABLE ROW LEVEL SECURITY;

-- Policies (Allow users to manage their own goals)
CREATE POLICY "Users manage own goals" ON skincare_goals FOR ALL USING (auth.uid() = profile_id);

-- Index for faster queries
CREATE INDEX idx_goals_profile ON skincare_goals(profile_id);
CREATE INDEX idx_goals_priority ON skincare_goals(profile_id, priority);
