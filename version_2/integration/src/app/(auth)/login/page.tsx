'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button, Input, Card } from '@/components/ui/base';
import { Logo } from '@/components/ui/Logo';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Email State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            router.push('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuth = async (provider: 'google') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            console.error(err);
            if (err.message && err.message.includes('Unsupported provider')) {
                setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} auth is not enabled in Supabase settings.`);
            } else {
                setError(err.message || 'Authentication failed');
            }
        }
    };

    return (
        <>
            <div className="text-center lg:text-left">
                <Logo className="mb-6 lg:mx-0 mx-auto" />
                <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-2">
                    Enter your credentials to access your skincare dashboard.
                </p>
            </div>

            <Card className="glass p-6">
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="email">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium" htmlFor="password">Password</label>
                                <Link href="/forgot-password" className="text-sm text-[hsl(var(--primary))] hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm font-medium text-red-600 bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-in fade-in">
                            {error}
                        </p>
                    )}
                    {successMsg && (
                        <p className="text-sm font-medium text-emerald-600 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 animate-in fade-in">
                            {successMsg}
                        </p>
                    )}

                    <Button type="submit" className="w-full" isLoading={loading}>
                        Sign In
                    </Button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-[hsl(var(--border))]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest">
                        <span className="bg-[hsl(var(--card))] px-3 text-[hsl(var(--muted-foreground))]">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" onClick={() => handleOAuth('google')} className="gap-2 w-full">
                        <Chrome className="w-4 h-4" /> Continue with Google
                    </Button>
                </div>
            </Card>

            <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-[hsl(var(--primary))] font-semibold hover:underline">
                    Create one now
                </Link>
            </p>
        </>
    );
}
