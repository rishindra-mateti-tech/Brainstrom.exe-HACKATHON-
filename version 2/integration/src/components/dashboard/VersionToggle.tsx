import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain } from 'lucide-react';

interface VersionToggleProps {
    isV2: boolean;
    onToggle: (v2: boolean) => void;
}

export function VersionToggle({ isV2, onToggle }: VersionToggleProps) {
    return (
        <div className="flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-full p-1 flex items-center shadow-lg border border-white/20">
                <button
                    onClick={() => onToggle(false)}
                    className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${!isV2 ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                >
                    {!isV2 && (
                        <motion.div
                            layoutId="toggle-bg"
                            className="absolute inset-0 bg-blue-500 rounded-full shadow-md"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        V1 (Rules)
                    </span>
                </button>

                <button
                    onClick={() => onToggle(true)}
                    className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isV2 ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                >
                    {isV2 && (
                        <motion.div
                            layoutId="toggle-bg"
                            className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-md"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        V2 (ML Powered)
                    </span>
                </button>
            </div>
        </div>
    );
}
