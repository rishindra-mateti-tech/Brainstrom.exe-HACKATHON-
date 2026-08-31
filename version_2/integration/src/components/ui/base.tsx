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
        primary: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-premium hover:brightness-110 hover:-translate-y-0.5 hover:shadow-premium-lg',
        secondary: 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] shadow-premium hover:brightness-105 hover:-translate-y-0.5',
        outline: 'border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--muted))] hover:border-[hsl(var(--primary)/0.4)]',
        ghost: 'bg-transparent hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]',
    };

    const sizes = {
        sm: 'px-3.5 py-1.5 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg font-semibold',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-[var(--radius)] font-semibold transition-all duration-200 ease-out active:scale-[0.97] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0',
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
                    'flex w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-base text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.5)] focus-visible:border-[hsl(var(--primary))] disabled:cursor-not-allowed disabled:opacity-50 transition-standard',
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <select
                className={cn(
                    'flex w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-base text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.5)] focus-visible:border-[hsl(var(--primary))] disabled:cursor-not-allowed disabled:opacity-50 transition-standard',
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </select>
        );
    }
);
Select.displayName = 'Select';

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('rounded-[var(--radius)] p-6 bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-premium', className)} {...props}>
        {children}
    </div>
);
