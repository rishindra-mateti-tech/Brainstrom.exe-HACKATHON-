'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button, Input, Card } from '@/components/ui/base';
import { Logo } from '@/components/ui/Logo';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
            });

            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Logo className="mx-auto mb-6" />
                    <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
                    <p className="text-[hsl(var(--muted-foreground))] mt-2">
                        Enter your email to receive password reset instructions.
                    </p>
                </div>

                <Card className="border shadow-lg p-6">
                    {!success ? (
                        <form onSubmit={handleReset} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="email">Email Address</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                                    {error}
                                </p>
                            )}

                            <Button type="submit" className="w-full" isLoading={loading}>
                                <Mail className="mr-2 h-4 w-4" /> Send Reset Link
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
                                <h3 className="text-lg font-semibold">Check your email</h3>
                                <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
                                    We sent a password reset link to <br />
                                    <span className="font-medium text-[hsl(var(--foreground))]">{email}</span>
                                </p>
                            </div>
                        </motion.div>
                    )}
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
