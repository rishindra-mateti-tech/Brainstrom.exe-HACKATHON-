import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { MouseEvent } from 'react';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Tracks the cursor position into --spot-x/--spot-y for the .spotlight-border CSS effect. */
export function trackSpotlight(e: MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
}
