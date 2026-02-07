import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    ...props
}: ButtonProps) => {
    const variants = {
        primary: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 shadow-sm',
        secondary: 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:opacity-90',
        outline: 'border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--muted))]',
        ghost: 'bg-transparent hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg font-semibold',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-[var(--radius)] font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {children}
        </button>
    );
};

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => {
        return (
            <input
                className={cn(
                    'flex w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-white dark:bg-slate-900/50 px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[hsl(var(--muted-foreground))] text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-standard',
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn('rounded-[var(--radius)] p-6 backdrop-blur-md bg-white dark:bg-slate-900/70 border border-gray-100 dark:border-slate-700/50 shadow-lg', className)}>
        {children}
    </div>
);
