import React from 'react';
import { MeshBackground } from '@/components/ui/MeshBackground';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <MeshBackground />
            <div className="grain hidden lg:flex flex-col justify-center p-14 relative overflow-hidden bg-[hsl(var(--accent))]">
                <div className="absolute top-[-15%] right-[-10%] w-[520px] h-[520px] bg-[radial-gradient(circle,hsl(var(--primary)/0.35),transparent_70%)]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[420px] h-[420px] bg-[radial-gradient(circle,hsl(var(--secondary)/0.3),transparent_70%)]" />

                <div className="relative z-10 text-[hsl(var(--accent-foreground))]">
                    <h2 className="text-4xl font-bold mb-4 leading-[1.15]">
                        Intelligent skincare for <span className="text-[hsl(var(--secondary))]">your</span> unique skin.
                    </h2>
                    <p className="text-lg opacity-80 max-w-md leading-relaxed">
                        The decision-support platform that learns from your environment, your reactions, and your history.
                    </p>

                    <div className="mt-12 space-y-4">
                        {['OCR Analysis', 'Climate Intelligence', 'Reaction Memory'].map(feature => (
                            <div key={feature} className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--secondary))]" />
                                <span className="text-sm font-medium uppercase tracking-wider opacity-70">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative flex items-center justify-center p-6">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </div>
            </div>
        </div>
    );
}
