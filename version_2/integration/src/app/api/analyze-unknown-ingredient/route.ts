import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase/serverClient';
import { decryptApiKey } from '@/lib/crypto/apiKeyCrypto';

// Same pattern as src/lib/ml-api.ts's ML_API_BASE_URL.
const ML_API_BASE_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000';

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

async function resolveGeminiApiKey(userId: string): Promise<string | null> {
    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase
        .from('user_api_keys')
        .select('encrypted_key')
        .eq('user_id', userId)
        .eq('provider', 'gemini')
        .maybeSingle();

    if (!error && data?.encrypted_key) {
        try {
            return decryptApiKey(data.encrypted_key);
        } catch (err) {
            console.error('Failed to decrypt stored Gemini key, falling back to project key:', err);
        }
    }

    // Fall back to the project-level key supplied by the project owner.
    return process.env.GEMINI_API_KEY || null;
}

export async function POST(req: NextRequest) {
    const userId = await getVerifiedUserId(req);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: {
        inci_name?: string;
        description?: string;
        user_context?: {
            skin_type?: string | null;
            goals?: Array<{ goal_name: string; priority: number }>;
            allergies?: string[];
            history?: Array<{ ingredient_name: string; reaction: string }>;
        };
    };

    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { inci_name, description, user_context } = body;

    if (!inci_name) {
        return NextResponse.json({ error: 'inci_name is required' }, { status: 400 });
    }

    const geminiApiKey = await resolveGeminiApiKey(userId);
    if (!geminiApiKey) {
        return NextResponse.json(
            { error: 'No Gemini API key available — add one in Settings.' },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(`${ML_API_BASE_URL}/api/ml/analyze-unknown-ingredient`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inci_name,
                description: description || '',
                user_context: {
                    skin_type: user_context?.skin_type ?? null,
                    goals: user_context?.goals ?? [],
                    allergies: user_context?.allergies ?? [],
                    history: user_context?.history ?? [],
                },
                gemini_api_key: geminiApiKey,
            }),
        });

        if (!response.ok) {
            throw new Error(`ML API error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (err) {
        console.error(`Failed to analyze unknown ingredient ${inci_name} via ML service:`, err);
        // Graceful failure, matching the analyzeIngredientML graceful-null pattern.
        return NextResponse.json({ error: 'Failed to analyze ingredient' }, { status: 502 });
    }
}
