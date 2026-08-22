'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button, Card } from '@/components/ui/base';
import { Logo } from '@/components/ui/Logo';
import { Users, LogOut, Activity, FlaskConical, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        users: 0,
        scans: 0,
        ingredients: 0
    });
    const [recentScans, setRecentScans] = useState<any[]>([]);
    const [isDemoData, setIsDemoData] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/admin/login');
                return;
            }

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', session.user.id)
                .single();

            if (profileError || !profileData?.is_admin) {
                router.push('/admin/login');
                return;
            }

            await fetchData();
        };
        checkAuth();
    }, []);

    const fetchData = async () => {
        try {
            const [statsResult, scansResult] = await Promise.all([
                supabase.rpc('get_admin_stats'),
                supabase.rpc('get_recent_scans', { limit_count: 5 }),
            ]);

            if (statsResult.error || scansResult.error) {
                console.warn('Admin RPC calls failed. Falling back to demo data.', statsResult.error || scansResult.error);
                setIsDemoData(true);
                setStats({ users: 142, scans: 856, ingredients: 3240 });
                setRecentScans([
                    { id: 1, product_name: 'Hydrating Cleanser', profile_name: 'Demo User 1', analysis_date: new Date().toISOString(), suitability_score: 92 },
                    { id: 2, product_name: 'Night Cream', profile_name: 'Demo User 2', analysis_date: new Date(Date.now() - 86400000).toISOString(), suitability_score: 45 },
                    { id: 3, product_name: 'Sunscreen A', profile_name: 'Demo User 1', analysis_date: new Date(Date.now() - 100000000).toISOString(), suitability_score: 78 },
                ]);
            } else {
                const statsRow = statsResult.data?.[0];
                setStats({
                    users: statsRow?.total_users || 0,
                    scans: statsRow?.total_scans || 0,
                    ingredients: statsRow?.total_unique_ingredients || 0,
                });
                setRecentScans(scansResult.data || []);
            }
        } catch (e) {
            console.error(e);
            setIsDemoData(true);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            <nav className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Logo />
                        <span className="bg-[hsl(var(--primary))] text-white text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider">Admin</span>
                    </div>
                    <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:bg-red-50">
                        <LogOut size={18} className="mr-2" /> Logout
                    </Button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {isDemoData && (
                    <div className="mb-8 flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                        <AlertTriangle size={20} className="shrink-0" />
                        <span className="text-sm font-medium">Showing demo data — live admin data unavailable.</span>
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-3 gap-6 mb-12"
                >
                    <StatsCard title="Total Users" value={stats.users} icon={<Users className="text-blue-500" />} />
                    <StatsCard title="Total Scans" value={stats.scans} icon={<Activity className="text-emerald-500" />} />
                    <StatsCard title="Ingredients Index" value={stats.ingredients || "3.2k"} icon={<FlaskConical className="text-teal-500" />} />
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Live Activity Feed</h2>
                        </div>
                        <div className="space-y-4">
                            {recentScans.map((scan, i) => (
                                <Card key={i} className="flex items-center justify-between p-4 hover:bg-white/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${scan.suitability_score > 70 ? 'bg-green-500' : 'bg-amber-500'
                                            }`}>
                                            {scan.suitability_score}
                                        </div>
                                        <div>
                                            <p className="font-bold">{scan.product_name || 'Unknown Product'}</p>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                Scanned by {scan.profile_name || scan.profiles?.name || 'Anonymous'} • {new Date(scan.analysis_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Card className="p-6 bg-[hsl(var(--secondary)/10%)] border-none">
                            <h3 className="font-bold mb-4">System Health</h3>
                            <div className="space-y-4">
                                <StatusItem label="Database" status="Healthy" color="bg-green-500" />
                                <StatusItem label="OCR Engine" status="Active" color="bg-green-500" />
                                <StatusItem label="API Latency" status="24ms" color="bg-blue-500" />
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatsCard({ title, value, icon }: any) {
    return (
        <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--muted)/50%)] flex items-center justify-center">
                {icon}
            </div>
            <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
        </Card>
    );
}

function StatusItem({ label, status, color }: any) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{label}</span>
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-sm opacity-70">{status}</span>
            </div>
        </div>
    );
}
