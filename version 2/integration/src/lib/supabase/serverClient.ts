// Server-only Supabase client. Uses the service-role key to bypass RLS.
//
// IMPORTANT: Only use this inside Route Handlers (or other server-only code),
// never in a 'use client' component. Never trust a client-supplied user_id
// when using this client — always derive the user_id from a verified
// access token via `serverClient.auth.getUser(token)` first, then use that
// verified id in any query.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getServerSupabaseClient(): SupabaseClient {
    if (cachedClient) return cachedClient;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
        throw new Error('Missing or invalid NEXT_PUBLIC_SUPABASE_URL for server Supabase client.');
    }

    if (!serviceRoleKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. This is required for server-side Supabase access.');
    }

    cachedClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return cachedClient;
}
