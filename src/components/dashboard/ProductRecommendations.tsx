'use client';

import React, { useState } from 'react';
import { ProductRecommendation } from '@/lib/analysis/enhanced-analyzer';
import { ChevronDown, ChevronUp, Sparkles, Lightbulb, AlertTriangle } from 'lucide-react';

interface ProductRecommendationsProps {
    recommendations: ProductRecommendation[];
}

export function ProductRecommendations({ recommendations }: ProductRecommendationsProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!recommendations || recommendations.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'great': return <Sparkles size={20} className="text-green-600" />;
            case 'consider': return <Lightbulb size={20} className="text-cyan-600" />;
            case 'missing': return <AlertTriangle size={20} className="text-orange-600" />;
            default: return <Lightbulb size={20} />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'great': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' };
            case 'consider': return { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-900' };
            case 'missing': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900' };
            default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-900' };
        }
    };

    return (
        <div className="mt-6">
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-100 hover:border-teal-200 transition-all flex items-center justify-between group shadow-sm"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white">
                        <Sparkles size={20} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-900">💡 AI Product Recommendations</h3>
                        <p className="text-xs text-gray-600">
                            {isExpanded ? 'Click to collapse' : 'Click to see personalized suggestions'}
                        </p>
                    </div>
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {recommendations.map((rec, index) => {
                        const colors = getColor(rec.type);

                        return (
                            <div
                                key={index}
                                className={`p-5 rounded-xl border-2 ${colors.border} ${colors.bg}`}
                            >
                                <div className="flex items-start gap-3">
                                    {getIcon(rec.type)}
                                    <div className="flex-1">
                                        <h4 className={`font-semibold ${colors.text} mb-2`}>
                                            {rec.title}
                                        </h4>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {rec.description}
                                        </p>

                                        {rec.ingredients && rec.ingredients.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {rec.ingredients.map((ing, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200"
                                                    >
                                                        {ing}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
