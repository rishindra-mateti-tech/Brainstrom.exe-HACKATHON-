-- Copy and paste this into the Supabase SQL Editor

-- Create table for tracking ML predictions
CREATE TABLE IF NOT EXISTS public.ml_ingredient_predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inci_name TEXT NOT NULL,
    predicted_functions JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence_score FLOAT,
    is_prohibited BOOLEAN DEFAULT false,
    is_restricted BOOLEAN DEFAULT false,
    model_version TEXT DEFAULT 'v2.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.ml_ingredient_predictions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert (if your app logs every prediction on the fly)
-- For now, allowing all reading for demonstration purposes
CREATE POLICY "Allow read access to all users" 
ON public.ml_ingredient_predictions FOR SELECT
USING (true);

CREATE POLICY "Allow insert access to authenticated users" 
ON public.ml_ingredient_predictions FOR INSERT 
TO authenticated 
WITH CHECK (true);
