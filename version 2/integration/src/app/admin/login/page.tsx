'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from '@/components/ui/base';
import { Logo } from '@/components/ui/Logo';
import { ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (username === 'admin' && password === 'admin123') {
            // Secure enough for hackathon demo
            localStorage.setItem('isAdmin', 'true');
            document.cookie = "isAdmin=true; path=/";
            router.push('/admin/dashboard');
        } else {
            setError('Invalid administration credentials');
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
                            <label className="text-sm font-medium">Username</label>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="admin"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 font-medium text-center bg-red-50 py-2 rounded">
                                {error}
                            </p>
                        )}

                        <Button type="submit" className="w-full">
                            <Lock size={16} className="mr-2" /> Access Dashboard
                        </Button>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
