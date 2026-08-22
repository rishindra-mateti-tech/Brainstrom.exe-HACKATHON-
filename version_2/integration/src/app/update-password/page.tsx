'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button, Input, Card } from '@/components/ui/base';
import { Logo } from '@/components/ui/Logo';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UpdatePasswordPage() {
    const router = useRouter();

    const [checkingSession, setCheckingSession] = useState(true);
    const [hasSession, setHasSession] = useState(false);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setHasSession(!!session);
            setCheckingSession(false);
        };
        checkSession();
    }, []);

    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => {
            router.push('/login');
        }, 2500);
        return () => clearTimeout(timer);
    }, [success, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
            if (updateError) throw updateError;

            // Deliberately do not keep the recovery session logged in — sign the user
            // out and require them to re-authenticate with the new password.
            await supabase.auth.signOut();
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[hsl(var(--primary))] mx-auto mb-4"></div>
                    <p className="text-[hsl(var(--muted-foreground))]">Verifying reset link...</p>
                </div>
            </div>
        );
    }

    if (!hasSession) {
        return (
            <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <Logo className="mx-auto mb-6" />
                        <h1 className="text-2xl font-bold tracking-tight">Invalid Reset Link</h1>
                    </div>

                    <Card className="border shadow-lg p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                            <AlertCircle size={24} />
                        </div>
                        <p className="text-[hsl(var(--muted-foreground))] text-sm">
                            This reset link is invalid or has expired. Please request a new one.
                        </p>
                        <Link href="/forgot-password">
                            <Button className="w-full mt-2">Request a new link</Button>
                        </Link>
                    </Card>

                    <p className="text-center text-sm">
                        <Link href="/login" className="text-[hsl(var(--primary))] font-medium hover:underline flex items-center justify-center gap-2">
                            <ArrowLeft size={14} /> Back to Login
                        </Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Logo className="mx-auto mb-6" />
                    <h1 className="text-2xl font-bold tracking-tight">Set a New Password</h1>
                    <p className="text-[hsl(var(--muted-foreground))] mt-2">
                        Choose a new password for your account.
                    </p>
                </div>

                <Card className="border shadow-lg p-6">
                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="newPassword">New Password</label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <p className="text-[10px] text-[hsl(var(--muted-foreground))] px-1">
                                    At least 8 characters, with letters and numbers recommended.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm Password</label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                                    {error}
                                </p>
                            )}

                            <Button type="submit" className="w-full" isLoading={loading}>
                                <Lock className="mr-2 h-4 w-4" /> Update Password
                            </Button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-4 py-4"
                        >
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Password updated</h3>
                                <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
                                    Redirecting you to sign in with your new password...
                                </p>
                            </div>
                        </motion.div>
                    )}
                </Card>

                {!success && (
                    <p className="text-center text-sm">
                        <Link href="/login" className="text-[hsl(var(--primary))] font-medium hover:underline flex items-center justify-center gap-2">
                            <ArrowLeft size={14} /> Back to Login
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}
