// ML API Service Integration

import { supabase } from './supabase';

// The FastAPI service URL
const ML_API_BASE_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000';

export interface MLAnalysisResult {
    inci_name: string;
    predicted_functions: string[];
    confidence_score: number;
    is_restricted: boolean;
    restriction_details?: string;
    is_prohibited: boolean;
    prohibited_details?: string;
    safety_score: number;
    source?: 'verified' | 'ai_estimate' | 'ml-classifier';
}

export interface UnknownIngredientUserContext {
    skin_type: string | null;
    goals: Array<{ goal_name: string; priority: number }>;
    allergies: string[];
    history: Array<{ ingredient_name: string; reaction: string }>;
}

export interface UnknownIngredientAnalysisResult {
    inci_name: string;
    effectiveness: number;
    reason: string;
    compatibility: {
        oily: number;
        dry: number;
        combination: number;
        sensitive: number;
        normal: number;
    } | null;
    source: 'verified' | 'ai_estimate';
    source_url: string | null;
}

export async function checkMLServiceHealth(): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

        const response = await fetch(`${ML_API_BASE_URL}/health`, {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            return data.status === 'ok' && data.models_loaded;
        }
        return false;
    } catch (error) {
        console.warn('ML Service health check failed:', error);
        return false;
    }
}

export async function analyzeIngredientML(inciName: string, description: string = ''): Promise<MLAnalysisResult | null> {
    try {
        const response = await fetch(`${ML_API_BASE_URL}/api/ml/analyze-ingredient`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inci_name: inciName,
                description: description
            }),
        });

        if (!response.ok) {
            throw new Error(`ML API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data as MLAnalysisResult;
    } catch (error) {
        console.error(`Failed to analyze ingredient ${inciName} via ML:`, error);
        return null; // Graceful fallback
    }
}

export async function analyzeProductML(ingredients: string[]): Promise<MLAnalysisResult[]> {
    // We run predictions in parallel to save time
    const promises = ingredients.map(ing => analyzeIngredientML(ing));
    const results = await Promise.all(promises);

    // Filter out any failed analysis (nulls)
    return results.filter((r): r is MLAnalysisResult => r !== null);
}

// Calls our own Next.js API route (NOT the FastAPI service directly) so the
// Gemini API key can be resolved server-side from the authenticated user's
// session (or the project-level fallback key). The browser never sees the
// actual key.
export async function analyzeUnknownIngredientML(
    inciName: string,
    description: string,
    userContext: UnknownIngredientUserContext
): Promise<UnknownIngredientAnalysisResult | null> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        if (!accessToken) {
            console.warn('No active session; cannot resolve API key for unknown ingredient analysis.');
            return null;
        }

        const response = await fetch(`/api/analyze-unknown-ingredient`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                inci_name: inciName,
                description,
                user_context: userContext,
            }),
        });

        if (!response.ok) {
            throw new Error(`Unknown ingredient analysis error: ${response.statusText}`);
        }

        const data = await response.json();
        return data as UnknownIngredientAnalysisResult;
    } catch (error) {
        console.error(`Failed to analyze unknown ingredient ${inciName}:`, error);
        return null; // Graceful fallback
    }
}

// Utility to suggest alternatives if an ingredient is restricted/prohibited
// In a full implementation, this could call another ML endpoint using cosine similarity
// For now, we return some standard safe alternatives based on the predicted function
export function getSafeAlternatives(functions: string[]): string[] {
    const alternatives = new Set<string>();

    functions.forEach(func => {
        func = func.toUpperCase();
        if (func.includes('MOISTURIZING') || func.includes('HUMECTANT') || func.includes('SKIN CONDITIONING')) {
            alternatives.add('Hyaluronic Acid');
            alternatives.add('Glycerin');
            alternatives.add('Ceramides');
            alternatives.add('Squalane');
        }
        if (func.includes('ANTIOXIDANT')) {
            alternatives.add('Vitamin C (Ascorbic Acid)');
            alternatives.add('Niacinamide');
            alternatives.add('Green Tea Extract');
        }
        if (func.includes('PRESERVATIVE')) {
            alternatives.add('Phenoxyethanol (Safe within limits)');
            alternatives.add('Sodium Benzoate');
        }
        if (func.includes('EMOLLIENT')) {
            alternatives.add('Jojoba Oil');
            alternatives.add('Shea Butter');
            alternatives.add('Caprylic/Capric Triglyceride');
        }
    });

    return Array.from(alternatives);
}
