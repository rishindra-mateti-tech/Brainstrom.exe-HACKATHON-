'use client';

import React from 'react';
import { PersonalizedInsight } from '@/lib/analysis/enhanced-analyzer';
import { CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface PersonalizedInsightsProps {
    insights: PersonalizedInsight[];
    extractedIngredients: string[];
    skinType?: string;
}

export function PersonalizedInsights({ insights, extractedIngredients, skinType }: PersonalizedInsightsProps) {
    if (!insights || insights.length === 0) return null;

    return (
        <div className="space-y-4">

            {/* Personalized Insights */}
            {skinType && (
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                        💡 Personalized for Your {skinType.charAt(0).toUpperCase() + skinType.slice(1)} Skin
                    </h3>
                    <div className="space-y-2">
                        {insights.map((insight, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-3 p-3 rounded-xl border-2 ${insight.isPositive
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-amber-50 border-amber-200'
                                    }`}
                            >
                                {insight.isPositive ? (
                                    <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 text-sm">
                                    <span className="font-medium text-gray-900">{insight.ingredient}:</span>{' '}
                                    <span className="text-gray-700">{insight.benefit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
