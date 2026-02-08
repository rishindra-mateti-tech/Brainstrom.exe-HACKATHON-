'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button, Input, Card } from '@/components/ui/base';
import { Logo } from '@/components/ui/Logo';
import { Mail, Facebook, Apple } from 'lucide-react';

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

    const handleOAuth = async (provider: 'google' | 'facebook' | 'apple' | 'azure') => {
        if (provider !== 'google') {
            setError(`${provider === 'azure' ? 'Microsoft' : provider.charAt(0).toUpperCase() + provider.slice(1)} login is coming soon! Please continue with Google for now.`);
            return;
        }

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

            <Card className="border shadow-lg overflow-hidden p-6">
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
                        <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in">
                            {error}
                        </p>
                    )}
                    {successMsg && (
                        <p className="text-sm font-medium text-green-500 bg-green-50 p-3 rounded-lg border border-green-100 animate-in fade-in">
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
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-[hsl(var(--muted-foreground))]">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => handleOAuth('google')} className="gap-2">
                        <Mail className="w-4 h-4" /> Google
                    </Button>
                    <Button variant="outline" onClick={() => handleOAuth('facebook')} className="gap-2">
                        <Facebook className="w-4 h-4" /> Facebook
                    </Button>
                    <Button variant="outline" onClick={() => handleOAuth('apple')} className="gap-2">
                        <Apple className="w-4 h-4" /> Apple
                    </Button>
                    <Button variant="outline" onClick={() => handleOAuth('azure')} className="gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 23 23" fill="currentColor">
                            <path d="M0 0h10.931v10.931H0zm12.069 0H23v10.931H12.069zM0 12.069h10.931V23H0zm12.069 0H23V23H12.069z" />
                        </svg>
                        Microsoft
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
