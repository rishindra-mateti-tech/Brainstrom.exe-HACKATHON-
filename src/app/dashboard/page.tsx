'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button, Card, Input } from '@/components/ui/base';
import { Logo } from '@/components/ui/Logo';
import { extractIngredients } from '@/lib/analysis/ocr';
import { analyzeIngredients, AnalysisResult } from '@/lib/analysis/analyzer';
import {
    LayoutDashboard,
    History,
    User,
    Settings,
    LogOut,
    Sparkles,
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
    Brain,
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const ingredientText = await extractIngredients(file);
            console.log("Extracted Text:", ingredientText);

            if (!ingredientText) {
                setError('Could not extract ingredients from image. Please try a clearer photo.');
                setAnalyzing(false);
                return;
            }

            // Use enhanced analyzer with goals
            const analysis = analyzeIngredientsWithGoals(
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
        <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-900 to-blue-950' : 'bg-gray-50'} transition-colors duration-300`}>
            {/* Header */}
            <nav className="border-b border-gray-200 dark:border-cyan-900 bg-white dark:bg-slate-900/95 sticky top-0 z-20 backdrop-blur-xl px-6 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Logo />
                        <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse">DEBUG: V2</span>
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
                        <button
                            onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
                            className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-8">
                {/* Left: Analysis Tool */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Goals Selector */}
                    <Card className="border border-gray-200 dark:border-cyan-900 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-blue-950 p-8 shadow-md dark:shadow-none hover:shadow-lg transition-all duration-300">
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
                    <Card className="border border-gray-200 dark:border-cyan-900 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-blue-950 p-8 shadow-md dark:shadow-none hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 dark:from-cyan-600 dark:to-blue-700 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform duration-300">
                                <Brain />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-cyan-200">New Product Analysis</h2>
                                <p className="text-sm text-gray-600 dark:text-cyan-400">Upload a photo of the ingredient label.</p>
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

                            <div className="relative group">
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
                                    {analyzing ? (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto" />
                                            <p className="font-medium animate-pulse">AI is reading ingredients...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-cyan-900 dark:to-blue-900 rounded-2xl flex items-center justify-center mx-auto text-pink-600 dark:text-cyan-300 group-hover:from-pink-200 group-hover:to-pink-300 dark:group-hover:from-cyan-800 dark:group-hover:to-blue-800 group-hover:scale-110 transition-all duration-300 shadow-lg">
                                                <Camera size={32} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-cyan-100">Drop image or click to upload</p>
                                                <p className="text-sm text-gray-600 dark:text-cyan-300">PNG, JPG up to 10MB</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Analysis Result */}
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-white via-teal-50/20 to-cyan-50/20 dark:bg-gradient-to-br dark:from-slate-900 dark:to-blue-950 border-2 border-teal-100 dark:border-cyan-900/30 shadow-xl"
                            >
                                <div className="space-y-12">
                                    {/* Top Section: Suitability & Ingredients */}
                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        {/* Suitability Gauge */}
                                        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-cyan-950/20 rounded-2xl border border-teal-100/50 min-w-[200px] shadow-inner">
                                            <div className={`w-36 h-36 rounded-full border-[12px] flex flex-col items-center justify-center font-black ${result.suitabilityScore >= 80 ? 'border-green-500 text-green-600' :
                                                result.suitabilityScore >= 50 ? 'border-amber-500 text-amber-600' : 'border-red-500 text-red-600'
                                                }`}>
                                                <span className="text-5xl">{result.suitabilityScore}</span>
                                                <span className="text-xs uppercase tracking-widest mt-1 opacity-60">Base</span>
                                            </div>
                                            <span className="mt-3 text-[12px] font-black uppercase tracking-[0.4em] text-gray-500">Suitability</span>
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            {/* Detected Ingredients - Reusing same component pattern */}
                                            <div className="p-6 rounded-2xl bg-teal-50/50 dark:bg-cyan-900/20 border border-teal-100 dark:border-cyan-900/30">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-xl">🧬</span>
                                                    <h3 className="font-bold text-slate-800 dark:text-cyan-200">Ingredients Detected</h3>
                                                </div>
                                                <p className="text-sm font-mono text-slate-600 dark:text-cyan-400 break-words leading-relaxed">
                                                    {result.extractedIngredients.join(', ')}
                                                </p>
                                            </div>

                                            {/* Personalized Highlights for Skin Type */}
                                            {result.personalizedInsights && result.personalizedInsights.length > 0 && (
                                                <PersonalizedInsights
                                                    insights={result.personalizedInsights}
                                                    extractedIngredients={result.extractedIngredients || []}
                                                    skinType={profile?.skin_type}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Mid Section: Priority Breakdown & Goal Score */}
                                    <div className="pt-12 border-t border-teal-100/30">
                                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                                            <div className="flex-1 w-full">
                                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[hsl(var(--primary))] uppercase tracking-tighter">
                                                    <Brain size={24} />
                                                    Personalized Goal Impact
                                                </h3>
                                                <PriorityBreakdown
                                                    goalEffectiveness={result.goalEffectiveness || []}
                                                    priorityMode={priorityMode}
                                                />
                                            </div>

                                            {/* Overall Goal Gauge */}
                                            <div className="flex flex-col items-center justify-center p-8 bg-[hsl(var(--primary)/0.03)] border-4 border-[hsl(var(--primary)/0.2)] rounded-3xl min-w-[240px] shadow-lg">
                                                <div className={`w-40 h-40 rounded-full border-[14px] flex flex-col items-center justify-center font-black ${result.goalScore >= 80 ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]' :
                                                    result.goalScore >= 50 ? 'border-amber-500 text-amber-600' : 'border-red-500 text-red-600'
                                                    }`}>
                                                    <span className="text-6xl">{result.goalScore}</span>
                                                    <span className="text-xs uppercase tracking-widest mt-1 opacity-60">Result</span>
                                                </div>
                                                <span className="mt-4 text-[14px] font-black uppercase tracking-[0.5em] text-[hsl(var(--primary))]">Overall Match</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Section: Holistic Verdict & Recommendations */}
                                    <div className="pt-12 border-t-4 border-double border-teal-100/50">
                                        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                                <Sparkles size={120} />
                                            </div>
                                            <h3 className="text-2xl font-black mb-4 relative z-10 text-cyan-400">Holistic Verdict</h3>
                                            <p className="text-xl leading-relaxed font-medium relative z-10 text-slate-100">
                                                {result.explanation}
                                            </p>
                                        </div>

                                        <div className="mt-8 grid gap-4">
                                            {result.recommendations && result.recommendations.length > 0 && (
                                                <ProductRecommendations recommendations={result.recommendations} />
                                            )}
                                            {/* Warnings & Highlights */}
                                            <div className="flex flex-wrap gap-2">
                                                {result.warnings.map((w, i) => (
                                                    <div key={i} className="flex-1 min-w-[280px] flex gap-3 p-4 rounded-2xl bg-red-50 text-red-700 text-sm border border-red-100 font-medium">
                                                        <AlertCircle size={20} className="shrink-0" />
                                                        {w}
                                                    </div>
                                                ))}
                                                {result.highlights.map((h, i) => (
                                                    <div key={i} className="flex-1 min-w-[280px] flex gap-3 p-4 rounded-2xl bg-green-50 text-green-700 text-sm border border-green-100 font-medium">
                                                        <CheckCircle size={20} className="shrink-0" />
                                                        {h}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Ingredient Breakdown Visualizer */}
                                        <div className="mt-8 pt-8 border-t border-[hsl(var(--border))]">
                                            <h4 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4">Ingredient Breakdown</h4>
                                            <div className="flex flex-wrap gap-4">
                                                {result.categories.map((cat, i) => (
                                                    <div key={i} className={`p-4 rounded-2xl border ${cat.color} flex flex-col gap-2 min-w-[150px]`}>
                                                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">{cat.name}</span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {cat.ingredients.map((ing, j) => (
                                                                <span key={j} className="text-[10px] bg-white/50 px-1.5 py-0.5 rounded uppercase font-bold">{ing}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
                                    <Card key={item.id} className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-sm hover:shadow-md dark:hover:shadow-cyan-500/20 dark:hover:border-cyan-500/60 transition-all duration-300 group border border-gray-200 dark:border-cyan-700/40 shadow-sm dark:shadow-cyan-500/10">
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
                    <Card className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-blue-950 p-8 overflow-hidden relative shadow-md dark:shadow-none border border-gray-200 dark:border-cyan-900 hover:shadow-lg transition-all duration-300">
                        <Sparkles className="absolute -right-4 -top-4 w-24 h-24 opacity-10 text-pink-300 dark:text-cyan-600" />
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
                    <Card className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-blue-950 p-6 border border-gray-200 dark:border-cyan-900 shadow-md dark:shadow-none hover:shadow-lg transition-all duration-300">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-cyan-200">
                            <Brain size={18} className="text-pink-500 dark:text-cyan-400" /> Ingredient Memory
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
