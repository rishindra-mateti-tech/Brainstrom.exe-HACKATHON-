'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button, Card, Input } from '@/components/ui/base';
import { ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            const user = data.user;
            if (!user) throw new Error('Sign-in failed.');

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (profileError || !profileData?.is_admin) {
                await supabase.auth.signOut();
                setError('Not authorized.');
                setLoading(false);
                return;
            }

            router.push('/admin/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Invalid administration credentials');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-[hsl(var(--primary)/20%)] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[hsl(var(--secondary)/20%)] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card className="glass p-8 border-t-4 border-[hsl(var(--primary))]">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(var(--primary)/10%)] text-[hsl(var(--primary))] mb-4">
                            <ShieldCheck size={32} />
                        </div>
                        <h1 className="text-2xl font-bold">Admin Portal</h1>
                        <p className="text-[hsl(var(--muted-foreground))]">Authorized personnel only</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 font-medium text-center bg-red-50 py-2 rounded">
                                {error}
                            </p>
                        )}

                        <Button type="submit" className="w-full" isLoading={loading}>
                            <Lock size={16} className="mr-2" /> Access Dashboard
                        </Button>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
