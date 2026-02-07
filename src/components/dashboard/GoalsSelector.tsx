'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Target, ChevronDown, Plus, X } from 'lucide-react';

interface Goal {
    id?: string;
    goal_name: string;
    priority: number;
}

interface GoalsSelectorProps {
    profileId: string;
    onGoalsChange?: (goals: Goal[], priorityMode: boolean) => void;
}

const PREDEFINED_GOALS = [
    'Reduce Acne',
    'Skin Brightening',
    'Anti-Aging',
    'Reduce Scars',
    'Hydration',
    'Oil Control',
];

export function GoalsSelector({ profileId, onGoalsChange }: GoalsSelectorProps) {
    const [priorityMode, setPriorityMode] = useState(true);
    const [priority1Goal, setPriority1Goal] = useState('');
    const [priority2Goal, setPriority2Goal] = useState('');
    const [priority3Goals, setPriority3Goals] = useState<string[]>([]);
    const [customGoal, setCustomGoal] = useState('');
    const [loading, setLoading] = useState(true);

    // Load existing goals
    useEffect(() => {
        loadGoals();
    }, [profileId]);

    const loadGoals = async () => {
        const { data, error } = await supabase
            .from('skincare_goals')
            .select('*')
            .eq('profile_id', profileId);

        if (data && data.length > 0) {
            // Check if priority mode is enabled
            setPriorityMode(data[0].priority_mode_enabled ?? true);

            const p1 = data.find(g => g.priority === 1);
            const p2 = data.find(g => g.priority === 2);
            const p3 = data.filter(g => g.priority === 3);

            if (p1) setPriority1Goal(p1.goal_name);
            if (p2) setPriority2Goal(p2.goal_name);
            if (p3.length > 0) setPriority3Goals(p3.map(g => g.goal_name));
        }
        setLoading(false);
    };

    const saveGoals = async (goals: Goal[], mode: boolean) => {
        // Delete existing goals
        await supabase
            .from('skincare_goals')
            .delete()
            .eq('profile_id', profileId);

        // Insert new goals
        if (goals.length > 0) {
            const goalsToInsert = goals.map(g => ({
                profile_id: profileId,
                goal_name: g.goal_name,
                priority: g.priority,
                priority_mode_enabled: mode,
            }));

            await supabase
                .from('skincare_goals')
                .insert(goalsToInsert);
        }

        if (onGoalsChange) {
            onGoalsChange(goals, mode);
        }
    };

    const handleToggleChange = async (enabled: boolean) => {
        setPriorityMode(enabled);

        // Clear goals when switching modes
        if (!enabled) {
            setPriority2Goal('');
            setPriority3Goals([]);
        }

        const goals = enabled
            ? buildPriorityGoals()
            : priority1Goal ? [{ goal_name: priority1Goal, priority: 1 }] : [];

        await saveGoals(goals, enabled);
    };

    const buildPriorityGoals = (): Goal[] => {
        const goals: Goal[] = [];
        if (priority1Goal) goals.push({ goal_name: priority1Goal, priority: 1 });
        if (priority2Goal) goals.push({ goal_name: priority2Goal, priority: 2 });
        priority3Goals.forEach(g => goals.push({ goal_name: g, priority: 3 }));
        return goals;
    };

    const handlePriority1Change = async (value: string) => {
        setPriority1Goal(value);
        const goals = priorityMode ? buildPriorityGoals() : [{ goal_name: value, priority: 1 }];
        await saveGoals([...goals.filter(g => g.priority !== 1), { goal_name: value, priority: 1 }], priorityMode);
    };

    const handlePriority2Change = async (value: string) => {
        setPriority2Goal(value);
        const goals = buildPriorityGoals();
        await saveGoals(goals, priorityMode);
    };

    const addPriority3Goal = async (goal: string) => {
        if (priority3Goals.length >= 5 || !goal) return;
        const newGoals = [...priority3Goals, goal];
        setPriority3Goals(newGoals);
        setCustomGoal('');

        const goals = buildPriorityGoals();
        await saveGoals([...goals, { goal_name: goal, priority: 3 }], priorityMode);
    };

    const removePriority3Goal = async (goal: string) => {
        const newGoals = priority3Goals.filter(g => g !== goal);
        setPriority3Goals(newGoals);

        const goals = buildPriorityGoals().filter(g => !(g.priority === 3 && g.goal_name === goal));
        await saveGoals(goals, priorityMode);
    };

    if (loading) return <div className="text-sm text-gray-500">Loading goals...</div>;

    return (
        <div className="space-y-6">
            {/* Priority Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gradient-to-r dark:from-slate-800 dark:to-blue-900/50 rounded-xl border border-gray-200 dark:border-cyan-900 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 dark:from-cyan-600 dark:to-blue-700 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform duration-300">
                        <Target size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-cyan-200">Priority-Based Goals</h3>
                        <p className="text-xs text-gray-600 dark:text-cyan-400">Enable for advanced 3-tier goal prioritization</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={priorityMode}
                        onChange={(e) => handleToggleChange(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-200 dark:peer-focus:ring-cyan-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-pink-500 dark:peer-checked:bg-cyan-600 transition-colors duration-300"></div>
                </label>
            </div>

            {/* Priority Sections */}
            {priorityMode ? (
                <div className="space-y-4">
                    {/* Priority 1 */}
                    <div className="p-5 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-blue-950 border border-gray-200 dark:border-cyan-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 dark:from-cyan-500 dark:to-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-md">1</span>
                            <h4 className="font-semibold text-slate-900 dark:text-cyan-200">Primary Goal</h4>
                            <span className="text-xs text-gray-600 dark:text-cyan-400">(Most Important)</span>
                        </div>
                        <div className="space-y-2">
                            <select
                                value={priority1Goal}
                                onChange={(e) => handlePriority1Change(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-cyan-800 bg-white dark:bg-cyan-950/50 text-slate-900 dark:text-cyan-100 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-100 dark:focus:ring-cyan-900 transition-all shadow-sm"
                            >
                                <option value="">Select your primary goal...</option>
                                {PREDEFINED_GOALS.map(goal => (
                                    <option key={goal} value={goal}>{goal}</option>
                                ))}
                            </select>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 dark:text-cyan-500">or</span>
                                <input
                                    type="text"
                                    placeholder="Type a custom goal..."
                                    value={priority1Goal && !PREDEFINED_GOALS.includes(priority1Goal) ? priority1Goal : ''}
                                    onChange={(e) => handlePriority1Change(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-cyan-800 bg-white dark:bg-cyan-950/50 text-slate-900 dark:text-cyan-100 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-100 dark:focus:ring-cyan-900 transition-all text-sm placeholder-slate-400 dark:placeholder-cyan-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Priority 2 */}
                    <div className="p-5 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-blue-950 border border-gray-200 dark:border-cyan-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 dark:from-cyan-500 dark:to-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-md">2</span>
                            <h4 className="font-semibold text-slate-900 dark:text-cyan-200">Secondary Goal</h4>
                            <span className="text-xs text-gray-600 dark:text-cyan-400">(Secondary)</span>
                        </div>
                        <div className="space-y-2">
                            <select
                                value={priority2Goal}
                                onChange={(e) => handlePriority2Change(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-cyan-800 bg-white dark:bg-cyan-950/50 text-slate-900 dark:text-cyan-100 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-100 dark:focus:ring-cyan-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!priority1Goal}
                            >
                                <option value="">Select your secondary goal...</option>
                                {PREDEFINED_GOALS.filter(g => g !== priority1Goal).map(goal => (
                                    <option key={goal} value={goal}>{goal}</option>
                                ))}
                            </select>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 dark:text-cyan-500">or</span>
                                <input
                                    type="text"
                                    placeholder="Type a custom goal..."
                                    value={priority2Goal && !PREDEFINED_GOALS.includes(priority2Goal) ? priority2Goal : ''}
                                    onChange={(e) => handlePriority2Change(e.target.value)}
                                    disabled={!priority1Goal}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-cyan-800 bg-white dark:bg-cyan-950/50 text-slate-900 dark:text-cyan-100 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-100 dark:focus:ring-cyan-900 transition-all text-sm disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:opacity-50 placeholder-slate-400 dark:placeholder-cyan-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Priority 3 */}
                    <div className="p-5 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-blue-950 border border-gray-200 dark:border-cyan-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 dark:from-cyan-400 dark:to-blue-500 text-white text-xs font-bold flex items-center justify-center shadow-md">3</span>
                            <h4 className="font-semibold text-slate-900 dark:text-cyan-200">Additional Goals</h4>
                            <span className="text-xs text-gray-600 dark:text-cyan-400">(Nice-to-have - up to 5)</span>
                        </div>

                        {/* Display selected P3 goals */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {priority3Goals.map(goal => (
                                <div key={goal} className="px-3 py-1.5 bg-pink-100 dark:bg-cyan-900/50 text-pink-800 dark:text-cyan-200 rounded-full text-sm flex items-center gap-2 hover:bg-pink-200 dark:hover:bg-cyan-800/50 transition-colors duration-200">
                                    {goal}
                                    <button onClick={() => removePriority3Goal(goal)} className="hover:bg-pink-300 dark:hover:bg-cyan-700 rounded-full p-0.5 transition-colors duration-200">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add new P3 goal */}
                        {priority3Goals.length < 5 && (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <select
                                        value={customGoal}
                                        onChange={(e) => setCustomGoal(e.target.value)}
                                        className="flex-1 px-4 py-2 border-2 border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-green-900/30 transition-all text-sm"
                                    >
                                        <option value="">Select from common goals...</option>
                                        {PREDEFINED_GOALS.filter(g => g !== priority1Goal && g !== priority2Goal && !priority3Goals.includes(g)).map(goal => (
                                            <option key={goal} value={goal}>{goal}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => addPriority3Goal(customGoal)}
                                        disabled={!customGoal}
                                        className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                    >
                                        <Plus size={16} /> Add
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">or</span>
                                    <input
                                        type="text"
                                        placeholder="Type a custom goal and press Add..."
                                        value={customGoal && !PREDEFINED_GOALS.includes(customGoal) ? customGoal : ''}
                                        onChange={(e) => setCustomGoal(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && customGoal) {
                                                addPriority3Goal(customGoal);
                                            }
                                        }}
                                        className="flex-1 px-4 py-2 border-2 border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-green-900/30 transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Simple Mode - Single Goal with custom input */
                <div className="p-5 bg-gradient-to-br from-white to-teal-50/30 dark:bg-slate-900 border-2 border-teal-100 dark:border-cyan-900/30 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <Target size={20} className="text-teal-600 dark:text-purple-400" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Your Skincare Goal</h4>
                    </div>
                    <div className="space-y-2">
                        <select
                            value={priority1Goal}
                            onChange={(e) => handlePriority1Change(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-cyan-900/30 transition-all"
                        >
                            <option value="">Select your goal...</option>
                            {PREDEFINED_GOALS.map(goal => (
                                <option key={goal} value={goal}>{goal}</option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">or</span>
                            <input
                                type="text"
                                placeholder="Type a custom goal..."
                                value={priority1Goal && !PREDEFINED_GOALS.includes(priority1Goal) ? priority1Goal : ''}
                                onChange={(e) => handlePriority1Change(e.target.value)}
                                className="flex-1 px-4 py-2 border-2 border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-cyan-900/30 transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
