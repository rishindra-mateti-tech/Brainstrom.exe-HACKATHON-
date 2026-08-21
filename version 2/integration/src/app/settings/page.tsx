'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button, Card, Input, Select } from '@/components/ui/base';
import { Logo } from '@/components/ui/Logo';
import { KeyRound, CheckCircle2, ArrowLeft, BookOpen } from 'lucide-react';

type Provider = 'gemini' | 'openai' | 'anthropic';

const PROVIDER_LABELS: Record<Provider, string> = {
    gemini: 'Gemini',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
};

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [provider, setProvider] = useState<Provider>('gemini');
    const [apiKey, setApiKey] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [savedProviders, setSavedProviders] = useState<Record<Provider, boolean>>({
        gemini: false,
        openai: false,
        anthropic: false,
    });
    const [replacing, setReplacing] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            await fetchSavedProviders();
            setLoading(false);
        };
        init();
    }, []);

    const fetchSavedProviders = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) return;

            const res = await fetch('/api/user-api-keys', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) return;
            const data = await res.json();
            if (data?.providers) {
                setSavedProviders(data.providers);
            }
        } catch (err) {
            console.error('Failed to fetch saved API key status:', err);
        }
    };

    const isCurrentProviderSaved = savedProviders[provider] && !replacing;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (!apiKey.trim()) {
            setError('Please enter an API key.');
            return;
        }

        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error('Not authenticated');

            const res = await fetch('/api/user-api-keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ provider, apiKey }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to save API key');
            }

            setApiKey('');
            setReplacing(false);
            setSuccessMsg(`${PROVIDER_LABELS[provider]} key saved.`);
            await fetchSavedProviders();
        } catch (err: any) {
            setError(err.message || 'Failed to save API key');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            <nav className="border-b border-gray-200 bg-white/95 sticky top-0 z-20 backdrop-blur-xl px-6 py-4 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <Logo />
                    <span className="text-lg font-semibold text-[hsl(var(--primary))]">Settings</span>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
                <div>
                    <Link href="/dashboard" className="text-sm text-[hsl(var(--primary))] hover:underline flex items-center gap-2 mb-6 w-fit">
                        <ArrowLeft size={14} /> Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <KeyRound size={24} className="text-[hsl(var(--primary))]" />
                        Bring Your Own API Key
                    </h1>
                    <p className="text-[hsl(var(--muted-foreground))] mt-2">
                        Add your own provider API key so CUTiS-IQ can analyze ingredients our
                        local database doesn't recognize. Keys are encrypted before storage and
                        are never shown again after saving.
                    </p>
                </div>

                <Card className="border shadow-lg p-6">
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="provider">Provider</label>
                            <Select
                                id="provider"
                                value={provider}
                                onChange={(e) => {
                                    setProvider(e.target.value as Provider);
                                    setReplacing(false);
                                    setApiKey('');
                                    setError(null);
                                    setSuccessMsg(null);
                                }}
                            >
                                <option value="gemini">Gemini</option>
                                <option value="openai">OpenAI</option>
                                <option value="anthropic">Anthropic</option>
                            </Select>
                        </div>

                        {isCurrentProviderSaved ? (
                            <div className="flex items-center justify-between p-4 rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))]">
                                <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))]">
                                    <CheckCircle2 size={16} className="text-green-600" />
                                    •••• saved
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setReplacing(true)}
                                >
                                    Replace
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="apiKey">
                                    {PROVIDER_LABELS[provider]} API Key
                                </label>
                                <Input
                                    id="apiKey"
                                    type="password"
                                    placeholder="Paste your API key"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {error && (
                            <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                                {error}
                            </p>
                        )}
                        {successMsg && (
                            <p className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                                {successMsg}
                            </p>
                        )}

                        {!isCurrentProviderSaved && (
                            <Button type="submit" className="w-full" isLoading={saving}>
                                Save Key
                            </Button>
                        )}
                    </form>
                </Card>

                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    <Link href="/legal/data-sources" className="text-[hsl(var(--primary))] hover:underline inline-flex items-center gap-2">
                        <BookOpen size={14} /> Learn about our data sources and AI estimates
                    </Link>
                </p>
            </main>
        </div>
    );
}
