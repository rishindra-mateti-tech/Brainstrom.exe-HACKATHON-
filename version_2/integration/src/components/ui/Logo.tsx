import React from 'react';
import { Droplet } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="bg-[hsl(var(--primary))] p-2 rounded-xl">
                <Droplet className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                CUTIeS<span className="text-[hsl(var(--primary))]">-IQ</span>
            </span>
        </div>
    );
};
