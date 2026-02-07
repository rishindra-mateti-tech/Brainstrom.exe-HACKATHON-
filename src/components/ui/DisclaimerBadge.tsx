'use client';

import React, { useState } from 'react';
import { Info, AlertTriangle } from 'lucide-react';

interface DisclaimerBadgeProps {
    variant?: 'info' | 'warning';
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function DisclaimerBadge({
    variant = 'info',
    position = 'bottom-right'
}: DisclaimerBadgeProps) {
    const [isOpen, setIsOpen] = useState(false);

    const positionClasses = {
        'top-left': 'top-4 left-4',
        'top-right': 'top-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-right': 'bottom-4 right-4',
    };

    const Icon = variant === 'warning' ? AlertTriangle : Info;
    const iconColor = variant === 'warning' ? 'text-amber-600' : 'text-blue-600';
    const bgColor = variant === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200';

    return (
        <div className={`fixed ${positionClasses[position]} z-30`}>
            {/* Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                className={`w-10 h-10 rounded-full ${bgColor} border-2 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200`}
                aria-label="View disclaimer"
            >
                <Icon size={20} className={iconColor} />
            </button>

            {/* Tooltip/Popup */}
            {isOpen && (
                <div
                    className={`absolute ${position.includes('right') ? 'right-0' : 'left-0'} ${position.includes('bottom') ? 'bottom-12' : 'top-12'} w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-2 duration-200`}
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                            <Icon size={20} className={iconColor} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">Ingredient-Based Analysis</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Our analysis evaluates products using a curated database of common skincare ingredients and their effects on different skin types and concerns, compiled from publicly available skincare science information.
                            </p>
                        </div>
                    </div>

                    {/* Important Considerations */}
                    <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <AlertTriangle size={16} className="text-amber-600" />
                            Important to Know
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                            Our recommendations are based on general ingredient knowledge. Individual results vary due to:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 ml-4">
                            <li>• Individual genetics and skin biology</li>
                            <li>• Dietary habits and nutrition</li>
                            <li>• Lifestyle factors (sleep, stress, exercise)</li>
                            <li>• Environmental pollution and climate</li>
                            <li>• Underlying health conditions</li>
                        </ul>
                    </div>

                    {/* Medical Disclaimer */}
                    <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">🏥 Medical Disclaimer</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            This tool provides educational information only and cannot replace professional medical advice.
                            For persistent skin concerns, severe reactions, or medical conditions, please consult a board-certified dermatologist.
                        </p>
                        <p className="text-xs text-gray-700 mt-3 font-medium">
                            Use this as a helpful starting point for understanding ingredients, but always consult a skincare professional for personalized medical advice.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
