'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button, Card, Input } from '@/components/ui/base';
import { Logo } from '@/components/ui/Logo';
import { MeshBackground } from '@/components/ui/MeshBackground';
import { trackSpotlight } from '@/lib/utils';
import { extractIngredients } from '@/lib/analysis/ocr';
import { analyzeIngredients, AnalysisResult } from '@/lib/analysis/analyzer';
import {
    LayoutDashboard,
    History,
    User,
    Settings,
    LogOut,
    ChevronRight,
    Loader2,
    Clock,
    ChevronDown,
    AlertCircle,
    CheckCircle,
    Target as TargetIcon,
    Sun,
    Moon,
    Cloud,
    FlaskConical,
    Database,
    Leaf,
    Droplet,
    Fingerprint,
    Upload,
    ClipboardPaste,
    Camera
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GoalsSelector } from '@/components/dashboard/GoalsSelector';
import { DisclaimerBadge } from '@/components/ui/DisclaimerBadge';
import { PersonalizedInsights } from '@/components/dashboard/PersonalizedInsights';
import { PriorityBreakdown } from '@/components/dashboard/PriorityBreakdown';
import { ProductRecommendations } from '@/components/dashboard/ProductRecommendations';
import { analyzeIngredientsWithGoals, EnhancedAnalysisResult } from '@/lib/analysis/enhanced-analyzer';

export default function Dashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [reactions, setReactions] = useState<any[]>([]);
    const [allergies, setAllergies] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [userGoals, setUserGoals] = useState<any[]>([]);
    const [priorityMode, setPriorityMode] = useState(true);

    // Analysis state
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<EnhancedAnalysisResult | null>(null);
    const [productName, setProductName] = useState('');
    const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [pastedIngredients, setPastedIngredients] = useState('');

    // Theme state
    const [isDark, setIsDark] = useState(false);

    // Expanded history item state
    const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
    const [resetToken, setResetToken] = useState(0);

    useEffect(() => {
        fetchData();
        // Check initial theme
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            setIsDark(true);
            document.documentElement.setAttribute('data-theme', 'dark');
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark ? 'dark' : 'light';
        setIsDark(!isDark);
        document.documentElement.setAttribute('data-theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', newTheme);
    };

    // Extract clean username from email
    const getCleanUsername = (email: string) => {
        const username = email.split('@')[0]; // Get part before @
        const cleanName = username.replace(/[0-9]/g, ''); // Remove all numbers
        return cleanName.charAt(0).toUpperCase() + cleanName.slice(1); // Capitalize first letter
    };

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Set username from email
        if (user.email) {
            setUserName(getCleanUsername(user.email));
        }

        const [p, h, r, a] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('product_history').select('*').eq('profile_id', user.id).order('analysis_date', { ascending: false }),
            supabase.from('ingredient_feedback').select('*').eq('profile_id', user.id),
            supabase.from('allergies').select('allergen_name').eq('profile_id', user.id)
        ]);

        if (!p.data) {
            // Profile doesn't exist? Force onboarding.
            window.location.href = '/onboarding';
            return;
        }

        setProfile(p.data);
        setHistory(h.data || []);
        setReactions(r.data || []);
        setAllergies(a.data?.map(i => i.allergen_name) || []);
        setLoading(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // Reset previous results
        setResult(null);
        setError(null);
    };

    const handleStartAnalysis = async () => {
        if (inputMode === 'upload' && !selectedFile) return;
        if (inputMode === 'paste' && !pastedIngredients.trim()) return;

        setAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const ingredientText = inputMode === 'paste'
                ? pastedIngredients.trim()
                : await extractIngredients(selectedFile!);
            console.log("Extracted Text:", ingredientText);

            if (!ingredientText) {
                setError('Could not extract ingredients from image. Please try a clearer photo.');
                setAnalyzing(false);
                return;
            }

            // Use enhanced analyzer with goals
            const analysis = await analyzeIngredientsWithGoals(
                ingredientText,
                profile,
                allergies,
                reactions,
                userGoals,
                priorityMode
            );

            setResult(analysis);
            setProductName('');

            // Save to history
            await supabase.from('product_history').insert({
                profile_id: profile.id,
                product_name: productName || 'Unknown Product',
                ingredients: ingredientText,
                suitability_score: analysis.suitabilityScore,
                goal_score: analysis.goalScore,
                explanation: analysis.explanation
            });

            // RESET GOALS after analysis
            await supabase.from('skincare_goals').delete().eq('profile_id', profile.id);
            setUserGoals([]);
            setResetToken(t => t + 1);

            fetchData(); // Refresh history
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to analyze image');
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen transition-colors duration-300">
            <MeshBackground />
            {/* Header */}
            <nav className="glass sticky top-0 z-20 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Logo />
                        {userName && (
                            <span className="text-lg font-semibold text-[hsl(var(--primary))]">
                                Welcome {userName}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
                        >
                            {isDark ? <Sun className="text-amber-500" size={20} /> : <Moon className="text-slate-500" size={20} />}
                        </button>
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--muted)/0.5)]">
                            <Cloud size={16} className="text-[hsl(var(--primary))]" />
                            <span className="text-sm font-medium">{profile?.location_city} • {profile?.current_season}</span>
                        </div>
                        <Link
                            href="/settings"
                            className="p-2 rounded-full hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
                            title="Settings"
                        >
                            <Settings size={20} className="text-slate-500 dark:text-slate-400" />
                        </Link>
                        <button
                            onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
                            className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-6 grid lg:grid-cols-3 gap-8">
                {/* Left: Analysis Tool */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Goals Selector */}
                    <Card onMouseMove={trackSpotlight} className="glass spotlight-border p-8 hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-300">
                        <GoalsSelector
                            key={resetToken}
                            profileId={profile?.id}
                            onGoalsChange={(goals, mode) => {
                                setUserGoals(goals);
                                setPriorityMode(mode);
                            }}
                        />
                    </Card>

                    {/* Product Analysis */}
                    <Card onMouseMove={trackSpotlight} className="glass spotlight-border p-8 hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 dark:from-cyan-600 dark:to-blue-700 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform duration-300">
                                <FlaskConical />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-cyan-200">New Product Analysis</h2>
                                <p className="text-sm text-gray-600 dark:text-cyan-400">Upload a photo of the ingredient label, or paste the list directly.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Input
                                placeholder="Product Name (optional)"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                className="max-w-md"
                            />

                            {/* Error Display */}
                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Upload / Paste Mode Tabs */}
                            <div className="inline-flex rounded-full bg-[hsl(var(--muted)/0.5)] p-1">
                                <button
                                    onClick={() => setInputMode('upload')}
                                    disabled={analyzing}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${inputMode === 'upload' ? 'bg-white dark:bg-slate-800 shadow-sm text-pink-600 dark:text-cyan-300' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    <Upload size={14} /> Upload Photo
                                </button>
                                <button
                                    onClick={() => setInputMode('paste')}
                                    disabled={analyzing}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${inputMode === 'paste' ? 'bg-white dark:bg-slate-800 shadow-sm text-pink-600 dark:text-cyan-300' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    <ClipboardPaste size={14} /> Paste Text
                                </button>
                            </div>

                            {inputMode === 'paste' ? (
                                <div className="space-y-4">
                                    <textarea
                                        value={pastedIngredients}
                                        onChange={(e) => setPastedIngredients(e.target.value)}
                                        disabled={analyzing}
                                        placeholder="Paste the ingredient list here, e.g. Aqua, Glycerin, Niacinamide, ..."
                                        className="w-full min-h-[160px] rounded-2xl border border-gray-300 dark:border-cyan-800 bg-white dark:bg-slate-900 p-4 text-sm text-slate-800 dark:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:focus:ring-cyan-500"
                                    />
                                    <Button
                                        className="w-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:brightness-110 text-white shadow-premium border-0"
                                        onClick={handleStartAnalysis}
                                        disabled={analyzing || !pastedIngredients.trim()}
                                    >
                                        {analyzing ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="animate-spin w-4 h-4" />
                                                Analyzing...
                                            </div>
                                        ) : (
                                            'Start Analyzing'
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative group">
                                    {!selectedFile ? (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                disabled={analyzing}
                                            />
                                            <div className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${analyzing
                                                ? 'bg-pink-50/50 border-pink-300 dark:bg-cyan-950/20 dark:border-cyan-800'
                                                : 'border-gray-300 dark:border-cyan-800 hover:border-pink-400 hover:bg-pink-50/30 dark:hover:bg-cyan-900/20 hover:scale-[1.02]'
                                                }`}>
                                                <div className="space-y-4">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-cyan-900 dark:to-blue-900 rounded-2xl flex items-center justify-center mx-auto text-pink-600 dark:text-cyan-300 group-hover:from-pink-200 group-hover:to-pink-300 dark:group-hover:from-cyan-800 dark:group-hover:to-blue-800 group-hover:scale-110 transition-all duration-300 shadow-lg">
                                                        <Camera size={32} />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-semibold text-gray-900 dark:text-cyan-100">Drop image or click to upload</p>
                                                        <p className="text-sm text-gray-600 dark:text-cyan-300">PNG, JPG up to 10MB</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="border border-gray-200 dark:border-cyan-800 rounded-3xl p-6 text-center space-y-6">
                                            {previewUrl ? (
                                                <div className="relative w-full h-48 mx-auto rounded-xl overflow-hidden border border-gray-200 dark:border-cyan-800 shadow-inner">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-full h-48 bg-gray-100 dark:bg-cyan-900/20 rounded-xl flex items-center justify-center shadow-inner text-gray-400">
                                                    <Camera size={32} />
                                                </div>
                                            )}
                                            <div className="flex gap-4">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 border-pink-200 text-pink-700 dark:border-cyan-800 dark:text-cyan-400"
                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                        setPreviewUrl(null);
                                                    }}
                                                    disabled={analyzing}
                                                >
                                                    Change Photo
                                                </Button>
                                                <Button
                                                    className="flex-1 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:brightness-110 text-white shadow-premium border-0"
                                                    onClick={handleStartAnalysis}
                                                    disabled={analyzing}
                                                >
                                                    {analyzing ? (
                                                        <div className="flex items-center gap-2">
                                                            <Loader2 className="animate-spin w-4 h-4" />
                                                            Reading Label...
                                                        </div>
                                                    ) : (
                                                        'Start Analyzing'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Analysis Result */}
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-white via-teal-50/20 to-cyan-50/20 dark:bg-gradient-to-br dark:from-slate-900 dark:to-blue-950 border-2 border-teal-100 dark:border-cyan-900/30 shadow-xl"
                            >
                                {(
                                    <div className="space-y-12">
                                        {/* ML Base Ingredient Analysis */}
                                        <div className="pt-2">
                                            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-[hsl(var(--secondary))] uppercase tracking-tighter">
                                                <Database size={28} />
                                                Ingredient Analysis (Database)
                                            </h3>
                                            <div className="flex flex-col gap-4">
                                                {result.mlPredictions?.map((pred, i) => {
                                                    const statusColor = pred.is_prohibited ? 'text-red-700 bg-red-100 border-red-200' : pred.is_restricted ? 'text-amber-700 bg-amber-100 border-amber-200' : 'text-green-700 bg-green-100 border-green-200';
                                                    const statusText = pred.is_prohibited ? 'Prohibited' : pred.is_restricted ? 'Restricted' : 'Safe';
                                                    return (
                                                        <div key={i} className="p-5 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] flex flex-col md:flex-row gap-6 shadow-premium hover:shadow-premium-lg transition-shadow">
                                                            <div className="flex-1 space-y-4">
                                                                <div className="flex items-center flex-wrap gap-3">
                                                                    <h4 className="font-black text-lg text-slate-800 dark:text-slate-200 tracking-tight">{pred.inci_name}</h4>
                                                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${statusColor}`}>Regulatory Status: {statusText}</span>
                                                                </div>
                                                                <div className="space-y-1.5 pt-1 border-t border-[hsl(var(--border))]">
                                                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Function</p>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {pred.predicted_functions.map((f, j) => (
                                                                            <span key={j} className="text-[11px] font-mono bg-[hsl(var(--secondary)/0.12)] text-[hsl(var(--secondary))] px-2 py-1 rounded border border-[hsl(var(--secondary)/0.25)]">{f}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                {(pred.is_restricted || pred.is_prohibited) && (
                                                                    <div className="space-y-1.5">
                                                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-red-400">Safety Restrictions</p>
                                                                        <p className="text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30 leading-relaxed">
                                                                            {pred.prohibited_details || pred.restriction_details}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center justify-center min-w-[140px] p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                                <div className={`text-5xl font-black tracking-tighter drop-shadow-sm ${pred.safety_score >= 80 ? 'text-green-500' : pred.safety_score >= 50 ? 'text-amber-500' : 'text-red-600'}`}>
                                                                    {pred.safety_score}
                                                                </div>
                                                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] mt-2 text-center leading-tight">Safety<br />Score</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Holistic Verdict */}
                                        <div className="pt-12 border-t-2 border-dashed border-teal-100/50">
                                            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-[hsl(var(--primary))] uppercase tracking-tighter">
                                                <TargetIcon size={28} />
                                                Holistic Verdict
                                            </h3>
                                            <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                                                <div className="flex-1 bg-white dark:bg-slate-900 border-2 border-[hsl(var(--primary)/0.2)] dark:border-cyan-900/50 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                                                        <Leaf size={160} className="text-[hsl(var(--primary))]" />
                                                    </div>
                                                    <div className="text-[1.1rem] leading-loose font-medium relative z-10 text-slate-800 dark:text-slate-200 space-y-6">
                                                        <p>
                                                            Our database predictions indicate this product functions primarily as <span className="font-bold text-[hsl(var(--secondary))] bg-[hsl(var(--secondary)/0.1)] px-2 py-1 rounded-md">{(() => {
                                                                const counts = result.mlPredictions?.flatMap(p => p.predicted_functions).reduce((acc, fn) => {
                                                                    const name = fn.toLowerCase();
                                                                    if (name !== 'unknown') {
                                                                        acc[name] = (acc[name] || 0) + 1;
                                                                    }
                                                                    return acc;
                                                                }, {} as Record<string, number>) || {};

                                                                const sortedFuncs = Object.entries(counts)
                                                                    .sort((a, b) => b[1] - a[1]) // sort by frequency descending
                                                                    .slice(0, 3)
                                                                    .map(([fn]) => fn);

                                                                return sortedFuncs.length > 0 ? sortedFuncs.join(', ') : 'general skincare';
                                                            })()}</span>.
                                                        </p>
                                                        <p>
                                                            Your profile highlights that you have <span className="font-bold text-[hsl(var(--primary))] capitalize bg-[hsl(var(--primary)/0.1)] px-2 py-1 rounded-md">{profile?.skin_type} skin</span> and live in a <span className="font-bold text-[hsl(var(--primary))] capitalize bg-[hsl(var(--primary)/0.1)] px-2 py-1 rounded-md">{profile?.climate_type} climate</span>.
                                                        </p>
                                                        <div className="p-5 rounded-2xl bg-teal-50/50 dark:bg-cyan-900/10 border border-teal-100 dark:border-cyan-900/30">
                                                            <p className="font-black text-xl mb-2 text-slate-900 dark:text-slate-100">
                                                                Therefore, this product <span className={result.suitabilityScore >= 60 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{result.suitabilityScore >= 80 ? 'suits you perfectly.' : result.suitabilityScore >= 60 ? 'suits you moderately well.' : 'does not suit you well.'}</span>
                                                            </p>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                                                                {result.suitabilityExplanation}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 pt-6 relative z-10">
                                                        {result.warnings.map((w, i) => (
                                                            <div key={i} className="flex-1 min-w-[240px] flex items-center gap-3 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 font-bold shadow-sm">
                                                                <AlertCircle size={16} className="shrink-0" />
                                                                {w}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-cyan-950/20 rounded-3xl border border-teal-100/50 min-w-[320px] shadow-lg relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.05)] to-transparent pointer-events-none" />
                                                    <div className={`w-56 h-56 rounded-full border-[18px] flex flex-col items-center justify-center font-black relative z-10 bg-white dark:bg-slate-900 shadow-inner ${result.suitabilityScore >= 80 ? 'border-green-500 text-green-600' :
                                                        result.suitabilityScore >= 50 ? 'border-amber-500 text-amber-600' : 'border-red-500 text-red-600'
                                                        }`}>
                                                        <span className="text-[5.5rem] tracking-tighter leading-none">{result.suitabilityScore}</span>
                                                        <span className="text-[11px] uppercase tracking-[0.3em] mt-3 opacity-60 font-black">Score</span>
                                                    </div>
                                                    <span className="mt-8 text-[15px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400 relative z-10">Final Suitability</span>
                                                </div>
                                            </div>

                                            <div className="mt-8">
                                                {result.recommendations && result.recommendations.filter(r => r.type === 'warning' || r.type === 'ml-insight').length > 0 && (
                                                    <ProductRecommendations recommendations={result.recommendations.filter(r => r.type === 'warning' || r.type === 'ml-insight')} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </Card>

                    {/* History */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-cyan-200">
                            <History size={20} className="text-pink-500 dark:text-cyan-400" /> Analysis History
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {history.map((item) => {
                                const isExpanded = expandedHistoryId === item.id;
                                return (
                                    <Card key={item.id} className="hover:shadow-premium-lg hover:border-[hsl(var(--primary)/0.4)] transition-all duration-300 group">
                                        {/* Header - Always Visible */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-cyan-100">{item.product_name}</p>
                                                <p className="text-xs text-gray-600 dark:text-cyan-400">{new Date(item.analysis_date).toLocaleDateString()}</p>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-bold ${item.suitability_score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                                item.suitability_score >= 60 ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300' :
                                                    item.suitability_score >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                                                        'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                                }`}>
                                                {item.suitability_score}
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 pt-4 border-t space-y-3"
                                            >
                                                {/* Analysis Explanation */}
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-cyan-200 mb-1">Analysis</h4>
                                                    <p className="text-sm text-gray-600 dark:text-cyan-100">{item.explanation}</p>
                                                </div>

                                                {/* Ingredients */}
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-cyan-200 mb-1">Ingredients</h4>
                                                    <p className="text-xs text-gray-600 dark:text-cyan-100 leading-relaxed">{item.ingredients}</p>
                                                </div>

                                                {/* Overall Score Badge */}
                                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                                    <div className={`px-4 py-2 rounded-xl font-bold text-xs ${item.suitability_score >= 80
                                                        ? 'bg-green-100 text-green-700'
                                                        : item.suitability_score >= 50
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        Suitability: {item.suitability_score}/100
                                                    </div>
                                                    {item.goal_score !== undefined && (
                                                        <div className={`px-4 py-2 rounded-xl font-bold text-xs bg-pink-100 text-pink-700`}>
                                                            Goal Match: {item.goal_score}/100
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Toggle Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full mt-4 justify-between hover:bg-gray-100 dark:hover:bg-cyan-900/30 transition-all duration-300"
                                            onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                                        >
                                            {isExpanded ? 'Hide Details' : 'View Details'}
                                            <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        </Button>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Skin Profile Summary */}
                <div className="space-y-8">
                    {/* Profile Card */}
                    <Card onMouseMove={trackSpotlight} className="glass spotlight-border p-8 overflow-hidden relative hover:shadow-premium-lg transition-all duration-300">
                        <Droplet className="absolute -right-4 -top-4 w-24 h-24 opacity-10 text-pink-300 dark:text-cyan-600" />
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 dark:from-cyan-600 dark:to-blue-700 flex items-center justify-center text-3xl font-bold text-white shadow-lg hover:scale-110 transition-transform duration-300">
                                    {profile?.name?.[0]}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-cyan-200">{profile?.name}</h3>
                                    <p className="text-pink-600 dark:text-cyan-400 font-bold capitalize">{profile?.skin_type} Skin</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-cyan-900 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 dark:text-cyan-400 font-medium">Age Range</span>
                                    <span className="font-bold text-slate-900 dark:text-cyan-100">{profile?.age_range}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 dark:text-cyan-400 font-medium">Climate</span>
                                    <span className="font-bold text-slate-900 dark:text-cyan-100">{profile?.climate_type}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Memory Card */}
                    <Card onMouseMove={trackSpotlight} className="glass spotlight-border p-6 hover:shadow-premium-lg transition-all duration-300">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-cyan-200">
                            <Fingerprint size={18} className="text-pink-500 dark:text-cyan-400" /> Ingredient Memory
                        </h3>
                        <div className="space-y-3">
                            {reactions.length === 0 ? (
                                <p className="text-sm text-gray-900 dark:text-cyan-200 italic">No ingredients learned yet.</p>
                            ) : (
                                reactions.map((r, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-cyan-950 shadow-sm border border-gray-200 dark:border-cyan-900 hover:dark:bg-cyan-900/70 transition-colors duration-200">
                                        <span className="text-sm font-medium text-gray-900 dark:text-cyan-100">{r.ingredient_name}</span>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${r.reaction === 'irritation' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200'
                                            }`}>
                                            {r.reaction.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </main>

            {/* Disclaimer Badge */}
            <DisclaimerBadge variant="info" position="bottom-right" />
        </div>
    );
}
