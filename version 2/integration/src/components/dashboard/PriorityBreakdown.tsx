'use client';

import React from 'react';
import { GoalEffectiveness } from '@/lib/analysis/enhanced-analyzer';
import { Target, TrendingUp, Award, Zap, CheckCircle2, Sparkles } from 'lucide-react';

interface PriorityBreakdownProps {
    goalEffectiveness: GoalEffectiveness[];
    priorityMode: boolean;
}

export function PriorityBreakdown({ goalEffectiveness, priorityMode }: PriorityBreakdownProps) {
    if (!goalEffectiveness || goalEffectiveness.length === 0) {
        return (
            <div className="p-8 rounded-2xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">No Priorities Selected</h3>
                <p className="text-sm text-slate-500 mt-2">Select priorities to view "Priority-Based Effectiveness"</p>
            </div>
        );
    }

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 1: return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', badge: 'bg-teal-600' };
            case 2: return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-600' };
            case 3: return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-600' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', badge: 'bg-gray-600' };
        }
    };

    const getPriorityIcon = (priority: number) => {
        switch (priority) {
            case 1: return <Award size={18} />;
            case 2: return <TrendingUp size={18} />;
            case 3: return <Zap size={18} />;
            default: return <Target size={18} />;
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-green-600';
        if (score >= 70) return 'text-blue-600';
        if (score >= 50) return 'text-amber-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Target size={20} className="text-[hsl(var(--primary))]" />
                {priorityMode ? 'Priority-Based Effectiveness' : 'Goal Effectiveness'}
            </h3>

            {goalEffectiveness.map((ge, index) => {
                const colors = getPriorityColor(ge.priority);

                return (
                    <div key={index} className={`p-5 rounded-xl border-2 ${colors.border} ${colors.bg}`}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full ${colors.badge} text-white flex items-center justify-center font-bold text-sm`}>
                                    {ge.priority}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{ge.goal}</h4>
                                    {priorityMode && (
                                        <p className="text-xs text-gray-600">
                                            {(() => {
                                                const prioritiesPresent = [...new Set(goalEffectiveness.map(g => g.priority))].sort();
                                                const count = prioritiesPresent.length;
                                                const currentPIndex = prioritiesPresent.indexOf(ge.priority);

                                                if (count === 3) {
                                                    return ge.priority === 1 ? 'Weight: 50% (Primary)' :
                                                        ge.priority === 2 ? 'Weight: 37% (Secondary)' :
                                                            'Weight: 13% (Additional)';
                                                } else if (count === 2) {
                                                    // Top priority present gets 60%, bottom gets 40%
                                                    return currentPIndex === 0 ? 'Weight: 60% (Main Focus)' : 'Weight: 40% (Secondary Focus)';
                                                } else {
                                                    return 'Weight: 100% (Single Focus)';
                                                }
                                            })()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Score Display */}
                            <div className="text-right">
                                <div className={`text-3xl font-bold ${getScoreColor(ge.score)}`}>
                                    {ge.score}
                                </div>
                                <div className="text-xs text-gray-600">Effectiveness</div>
                            </div>
                        </div>

                        {/* Matching Ingredients */}
                        {ge.matchingIngredients.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-300/50">
                                <p className="text-sm font-medium text-gray-700 mb-2">Active Ingredients:</p>
                                <div className="space-y-2">
                                    {ge.matchingIngredients.slice(0, 3).map((ing, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm">
                                            <span className="text-green-600">✓</span>
                                            <div>
                                                <span className="font-medium text-gray-900">{ing.name}</span>
                                                <span className="text-gray-600"> ({ing.effectiveness}%)</span>
                                                {ing.source && ing.source !== 'ml-classifier' && (
                                                    ing.source === 'verified' ? (
                                                        <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-200">
                                                            <CheckCircle2 size={10} /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
                                                            <Sparkles size={10} /> AI Estimate
                                                        </span>
                                                    )
                                                )}
                                                <p className="text-xs text-gray-600 mt-0.5">{ing.reason}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
