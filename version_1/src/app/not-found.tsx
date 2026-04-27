import Link from 'next/link';
import { Button } from '@/components/ui/base';
import { Logo } from '@/components/ui/Logo';
import { SearchX } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-[hsl(var(--muted))] rounded-full flex items-center justify-center text-[hsl(var(--muted-foreground))] mb-8">
                <SearchX size={48} />
            </div>

            <h1 className="text-4xl font-bold mb-4">Page not found</h1>
            <p className="text-[hsl(var(--muted-foreground))] max-w-md mb-8">
                We couldn't find the page you're looking for. It might have been moved or doesn't exist.
            </p>

            <div className="flex gap-4">
                <Link href="/">
                    <Button variant="outline">Go Home</Button>
                </Link>
                <Link href="/dashboard">
                    <Button>Go to Dashboard</Button>
                </Link>
            </div>

            <div className="mt-12 opacity-50">
                <Logo />
            </div>
        </div>
    );
}
