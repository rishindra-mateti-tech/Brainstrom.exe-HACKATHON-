import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-[hsl(var(--background))]">
            <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--secondary)/0.1)] relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[hsl(var(--primary)/0.05)] rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-[hsl(var(--secondary)/0.05)] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                <div className="relative z-10">
                    <h2 className="text-4xl font-bold mb-4">Intelligent Skincare for <br /><span className="text-[hsl(var(--primary))] italic underline decoration-wavy decoration-2 underline-offset-8">Your</span> Unique Skin.</h2>
                    <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-md">
                        The decision-support platform that learns from your environment, your reactions, and your history.
                    </p>

                    <div className="mt-12 space-y-4">
                        {['OCR Analysis', 'Climate Intelligence', 'Reaction Memory'].map(feature => (
                            <div key={feature} className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))]" />
                                <span className="text-sm font-medium uppercase tracking-wider opacity-60">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center p-6">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </div>
            </div>
        </div>
    );
}
