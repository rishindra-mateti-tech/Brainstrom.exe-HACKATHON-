'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button, Input, Card } from '@/components/ui/base';
import { Logo } from '@/components/ui/Logo';
import {
    User,
    CloudSun,
    ShieldAlert,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    MapPin,
    Thermometer,
    Search,
    RefreshCw,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
    { id: 'basic', title: 'Basic Info', icon: User },
    { id: 'climate', title: 'Environment', icon: CloudSun },
    { id: 'health', title: 'Health & Safety', icon: ShieldAlert },
    { id: 'allergies', title: 'Allergies', icon: Activity },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [detecting, setDetecting] = useState(false);

    // Form State
    const [profile, setProfile] = useState({
        name: '',
        age_range: '',
        skin_type: '',
        location_city: '',
        location_country: '',
        climate_type: '',
        current_season: '',
    });

    const [realWeather, setRealWeather] = useState<{ temp: number, condition: string } | null>(null);

    const [healthFlags, setHealthFlags] = useState({
        is_pregnant: false,
        is_breastfeeding: false,
        recent_procedure: false,
        major_surgery_last_6m: false,
    });

    const [allergies, setAllergies] = useState<string[]>([]);
    const [customAllergy, setCustomAllergy] = useState('');

    // Session Check
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.log('No session found in onboarding, redirecting to login');
                router.push('/login');
            }
        };
        checkSession();
    }, [router]);

    // Auto-detect on step entry
    useEffect(() => {
        if (currentStep === 1 && !profile.location_city && !detecting) {
            handleAutoDetect();
        }
    }, [currentStep]);

    // --- Weather & Location Logic ---

    const handleAutoDetect = async () => {
        setDetecting(true);
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data && data.city) {
                await fetchWeatherData(data.city, data.latitude, data.longitude, data.country_name);
            }
        } catch (e) {
            console.error("Auto-detect failed", e);
        } finally {
            setDetecting(false);
        }
    };

    const handleManualLocation = async () => {
        if (!profile.location_city) return;
        setDetecting(true);
        try {
            // 1. Geocoding
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${profile.location_city}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();

            if (!geoData.results || geoData.results.length === 0) {
                alert("City not found. Please check spelling.");
                return;
            }

            const { latitude, longitude, name, country } = geoData.results[0];
            await fetchWeatherData(name, latitude, longitude, country);

        } catch (e) {
            console.error("Manual fetch failed", e);
            alert("Could not fetch weather data. Please try again.");
        } finally {
            setDetecting(false);
        }
    };

    const fetchWeatherData = async (city: string, lat: number, lon: number, country: string) => {
        // 2. Weather Data (Open-Meteo)
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const weatherData = await weatherRes.json();

        const temp = weatherData.current.temperature_2m;
        const code = weatherData.current.weather_code;
        const season = determineSeason(lat);
        const climate = determineClimate(lat, temp, code);

        setProfile(prev => ({
            ...prev,
            location_city: city,
            location_country: country,
            climate_type: climate,
            current_season: season,
        }));

        setRealWeather({
            temp: temp,
            condition: getWeatherCondition(code)
        });
    };

    const determineSeason = (lat: number) => {
        const month = new Date().getMonth();
        const isNorth = lat > 0;
        if (month >= 2 && month <= 4) return isNorth ? 'Spring' : 'Autumn';
        if (month >= 5 && month <= 7) return isNorth ? 'Summer' : 'Winter';
        if (month >= 8 && month <= 10) return isNorth ? 'Autumn' : 'Spring';
        return isNorth ? 'Winter' : 'Summer';
    };

    const determineClimate = (lat: number, temp: number, code: number) => {
        // Simple heuristic combining lat + current temp
        if (temp > 28) return 'Tropical'; // Very hot
        if (temp < 5) return 'Cold';     // Very cold
        if (Math.abs(lat) < 23.5) return 'Tropical'; // Geographic fallback

        // If weather code implies dry/desert
        if (code === 0 && temp > 20) return 'Dry';

        return 'Temperate'; // Default
    };

    const getWeatherCondition = (code: number) => {
        if (code === 0) return 'Clear Sky';
        if (code <= 3) return 'Partly Cloudy';
        if (code <= 48) return 'Foggy';
        if (code <= 67) return 'Rainy';
        if (code <= 77) return 'Snowy';
        if (code <= 82) return 'Rain Showers';
        if (code <= 86) return 'Snow Showers';
        return 'Stormy';
    };

    // --- Navigation & Submit ---

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error("No user found during submit");
                router.push('/login');
                return;
            }

            // Update profile (upsert to be safe if trigger failed)
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({ id: user.id, ...profile });

            if (profileError) {
                console.error("Profile update failed", profileError);
                alert(`Profile Save Error: ${profileError.message}. Details: ${profileError.details || 'None'}`);
                return; // Stop execution
            }

            // Insert health flags
            await supabase.from('health_flags').upsert({ profile_id: user.id, ...healthFlags });

            // Insert allergies
            if (allergies.length > 0) {
                const allergyData = allergies.map(a => ({
                    profile_id: user.id,
                    allergen_name: a,
                    is_custom: false
                }));
                await supabase.from('allergies').insert(allergyData);
            }

            // SUCCESS
            router.push('/dashboard');
            router.refresh();

        } catch (error) {
            console.error("Submit error", error);
        } finally {
            setLoading(false);
        }
    };

    const commonAllergies = [
        'Fragrance', 'Parabens', 'Sulfates', 'Formaldehyde', 'Phthalates', 'Mineral Oil'
    ];

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] py-12 px-6">
            <div className="max-w-2xl mx-auto space-y-12">
                <div className="flex justify-between items-center">
                    <Logo />
                    <div className="flex gap-2">
                        {STEPS.map((step, idx) => (
                            <div
                                key={step.id}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${idx <= currentStep ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                                    }`}
                            >
                                <step.icon size={18} />
                            </div>
                        ))}
                    </div>
                </div>

                <Card className="border shadow-xl min-h-[500px] flex flex-col justify-between overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8 flex-grow"
                        >
                            {/* STEP 0: Basic Info */}
                            {currentStep === 0 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">Tell us about yourself</h2>
                                        <p className="text-[hsl(var(--muted-foreground))]">Help us personalize your skincare intelligence.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Age Range</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['Under 18', '18-24', '25-34', '35-44', '45-54', '55+'].map(age => (
                                                    <button
                                                        key={age}
                                                        onClick={() => setProfile({ ...profile, age_range: age })}
                                                        className={`px-4 py-3 rounded-xl border text-sm transition-all ${profile.age_range === age ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]'}`}
                                                    >
                                                        {age}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Skin Type</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'].map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setProfile({ ...profile, skin_type: type.toLowerCase() })}
                                                        className={`px-4 py-3 rounded-xl border text-sm transition-all ${profile.skin_type === type.toLowerCase() ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]'}`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 1: Environment & Climate (UPDATED) */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">Environment & Climate</h2>
                                        <p className="text-[hsl(var(--muted-foreground))]">Skincare needs vary by location and season.</p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Manual Location Input */}
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <MapPin className="absolute left-3 top-3 text-[hsl(var(--muted-foreground))]" size={18} />
                                                <Input
                                                    className="pl-10"
                                                    placeholder="Enter your city (e.g. Dayton)"
                                                    value={profile.location_city}
                                                    onChange={(e) => setProfile({ ...profile, location_city: e.target.value })}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleManualLocation()}
                                                />
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={handleManualLocation}
                                                isLoading={detecting}
                                                disabled={!profile.location_city}
                                            >
                                                {detecting ? 'Checking...' : 'Check'}
                                            </Button>
                                        </div>

                                        {/* Result Card */}
                                        <div className="p-6 rounded-2xl bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.1)] space-y-6 relative overflow-hidden transition-all">

                                            <div className="grid grid-cols-2 gap-6 relative z-10">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Location</p>
                                                    <p className="font-bold text-lg">
                                                        {profile.location_city || '---'}, {profile.location_country || '---'}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Season</p>
                                                    <p className="font-bold text-lg">{profile.current_season || '---'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Real-Time Weather</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-lg">
                                                            {realWeather ? `${realWeather.temp}°C` : '--'}
                                                        </span>
                                                        <span className="text-sm opacity-70">
                                                            {realWeather?.condition || ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Derived Climate</p>
                                                    <p className="font-bold text-lg text-[hsl(var(--primary))]">{profile.climate_type || '---'}</p>
                                                </div>
                                            </div>

                                            <motion.div
                                                className="absolute -right-8 -bottom-8 opacity-[0.05]"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <CloudSun size={180} />
                                            </motion.div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-[hsl(var(--muted-foreground))] italic px-2">
                                        * We fetched real-time weather history for <strong>{profile.location_city || 'your location'}</strong> to customize your analysis.
                                    </p>
                                </div>
                            )}

                            {/* STEP 2: Health */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">Health & Safety</h2>
                                        <p className="text-[hsl(var(--muted-foreground))]">Optional checks for specific skin sensitivities.</p>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'is_pregnant', label: 'Currently pregnant or breastfeeding', icon: Activity },
                                            { id: 'recent_procedure', label: 'Recently underwent skin procedures', icon: ShieldAlert },
                                            { id: 'major_surgery_last_6m', label: 'Major surgery in last 6 months', icon: Activity },
                                        ].map(flag => (
                                            <label
                                                key={flag.id}
                                                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${healthFlags[flag.id as keyof typeof healthFlags] ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]' : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)]'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={healthFlags[flag.id as keyof typeof healthFlags]}
                                                    onChange={(e) => setHealthFlags({ ...healthFlags, [flag.id]: e.target.checked })}
                                                />
                                                <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${healthFlags[flag.id as keyof typeof healthFlags] ? 'bg-[hsl(var(--primary))] border-[hsl(var(--primary))] text-white' : 'border-[hsl(var(--border))] bg-white'}`}>
                                                    {healthFlags[flag.id as keyof typeof healthFlags] && <CheckCircle2 size={16} />}
                                                </div>
                                                <span className="text-sm font-medium">{flag.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Allergies */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">Allergies & Sensitivities</h2>
                                        <p className="text-[hsl(var(--muted-foreground))]">Which ingredients should we watch out for?</p>
                                    </div>

                                    {allergies.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Selected</label>
                                            <div className="flex flex-wrap gap-2">
                                                {allergies.map(allergy => (
                                                    <button
                                                        key={allergy}
                                                        onClick={() => setAllergies(allergies.filter((a) => a !== allergy))}
                                                        className="px-3 py-1 rounded-full bg-[hsl(var(--primary))] text-white text-sm flex items-center gap-2"
                                                    >
                                                        {allergy} <span className="opacity-75 hover:opacity-100">×</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Common Suggestions</label>
                                        <div className="flex flex-wrap gap-2">
                                            {commonAllergies.filter(a => !allergies.includes(a)).map(allergy => (
                                                <button
                                                    key={allergy}
                                                    onClick={() => setAllergies([...allergies, allergy])}
                                                    className="px-4 py-2 rounded-full border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))]"
                                                >
                                                    {allergy}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <label className="text-sm font-medium">Add Custom Ingredient</label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="e.g. Alcohol, Lanolin..."
                                                value={customAllergy}
                                                onChange={(e) => setCustomAllergy(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (customAllergy && !allergies.includes(customAllergy)) {
                                                            setAllergies([...allergies, customAllergy]);
                                                            setCustomAllergy('');
                                                        }
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    if (customAllergy && !allergies.includes(customAllergy)) {
                                                        setAllergies([...allergies, customAllergy]);
                                                        setCustomAllergy('');
                                                    }
                                                }}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                    <div className="flex justify-between items-center pt-8 border-t border-[hsl(var(--border))] mt-8">
                        <Button variant="ghost" onClick={handleBack} className={currentStep === 0 ? 'invisible' : ''}>
                            <ChevronLeft className="mr-2 w-4 h-4" /> Back
                        </Button>
                        <Button onClick={handleNext} isLoading={loading}>
                            {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
