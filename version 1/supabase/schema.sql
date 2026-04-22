-- CUTIeS-IQ Database Schema

-- Enable RLS
-- Users table is handled by Supabase Auth

-- Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age_range TEXT, -- e.g., '18-24', '25-34', etc.
  gender TEXT,
  skin_type TEXT CHECK (skin_type IN ('dry', 'oily', 'combination', 'sensitive', 'normal')),
  location_city TEXT,
  location_country TEXT,
  climate_type TEXT, -- e.g., 'tropical', 'arid', 'temperate', 'continental', 'polar'
  current_season TEXT,
  climate_duration TEXT, -- How long they've been in this climate
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Flags Table (Boolean only)
CREATE TABLE health_flags (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_pregnant BOOLEAN DEFAULT FALSE,
  is_breastfeeding BOOLEAN DEFAULT FALSE,
  recent_procedure BOOLEAN DEFAULT FALSE,
  major_surgery_last_6m BOOLEAN DEFAULT FALSE
);

-- Allergies Table
CREATE TABLE allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  allergen_name TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product History Table
CREATE TABLE product_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  brand TEXT,
  ingredients TEXT NOT NULL, -- Normalized INCI list
  suitability_score INTEGER, -- 0-100
  explanation TEXT,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredient Feedback (Memory)
CREATE TABLE ingredient_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  reaction TEXT CHECK (reaction IN ('worked_well', 'irritation', 'neutral')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, ingredient_name)
);

-- Row Level Security (RLS) Policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE health_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own health flags" ON health_flags FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can update their own health flags" ON health_flags FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert their own health flags" ON health_flags FOR INSERT WITH CHECK (auth.uid() = profile_id);

ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own allergies" ON allergies FOR ALL USING (auth.uid() = profile_id);

ALTER TABLE product_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own history" ON product_history FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert into their own history" ON product_history FOR INSERT WITH CHECK (auth.uid() = profile_id);

ALTER TABLE ingredient_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own feedback" ON ingredient_feedback FOR ALL USING (auth.uid() = profile_id);
