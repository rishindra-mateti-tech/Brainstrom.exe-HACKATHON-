import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase/serverClient';
import { encryptApiKey } from '@/lib/crypto/apiKeyCrypto';

const ALLOWED_PROVIDERS = ['gemini', 'openai', 'anthropic'] as const;
type Provider = (typeof ALLOWED_PROVIDERS)[number];

async function getVerifiedUserId(req: NextRequest): Promise<string | null> {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) return null;

    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) return null;
    return data.user.id;
}

export async function GET(req: NextRequest) {
    const userId = await getVerifiedUserId(req);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase
        .from('user_api_keys')
        .select('provider')
        .eq('user_id', userId);

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch API key status' }, { status: 500 });
    }

    const savedProviders = new Set((data || []).map((row: { provider: string }) => row.provider));

    return NextResponse.json({
        providers: {
            gemini: savedProviders.has('gemini'),
            openai: savedProviders.has('openai'),
            anthropic: savedProviders.has('anthropic'),
        },
    });
}

export async function POST(req: NextRequest) {
    const userId = await getVerifiedUserId(req);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { provider?: string; apiKey?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { provider, apiKey } = body;

    if (!provider || !ALLOWED_PROVIDERS.includes(provider as Provider)) {
        return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
        return NextResponse.json({ error: 'apiKey is required' }, { status: 400 });
    }

    let encryptedKey: string;
    try {
        encryptedKey = encryptApiKey(apiKey);
    } catch (err: any) {
        console.error('Failed to encrypt API key:', err);
        return NextResponse.json({ error: 'Server misconfiguration: unable to encrypt API key' }, { status: 500 });
    }

    const supabase = getServerSupabaseClient();
    const { error } = await supabase
        .from('user_api_keys')
        .upsert(
            {
                user_id: userId,
                provider,
                encrypted_key: encryptedKey,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,provider' }
        );

    if (error) {
        console.error('Failed to save API key:', error);
        return NextResponse.json({ error: 'Failed to save API key' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
