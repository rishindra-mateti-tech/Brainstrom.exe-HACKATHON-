import { createClient } from '@supabase/supabase-js';

// Robust initialization to prevent crash if env vars are missing
const getSupabaseUrl = () => {
    let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url || !url.startsWith('http')) {
        console.warn('Missing or invalid NEXT_PUBLIC_SUPABASE_URL. Using placeholder.');
        return 'https://placeholder.supabase.co';
    }
    return url;
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
