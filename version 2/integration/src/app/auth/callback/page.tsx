'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackInner() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Supabase automatically handles the OAuth callback and sets the session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Auth callback error:', error);
                    router.push('/login?error=auth_failed');
                    return;
                }

                if (session) {
                    const next = searchParams.get('next');
                    if (next) {
                        // A password-recovery (or other) flow explicitly asked to land here
                        // instead of being routed through normal login-completion logic.
                        router.push(next);
                        return;
                    }

                    // Check if user has completed onboarding
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profile && profile.skin_type) {
                        // User has completed onboarding, go to dashboard
                        router.push('/dashboard');
                    } else {
                        // New user or incomplete profile, go to onboarding
                        router.push('/onboarding');
                    }
                } else {
                    // No session, redirect to login
                    router.push('/login');
                }
            } catch (err) {
                console.error('Unexpected error in auth callback:', err);
                router.push('/login?error=unexpected_error');
            }
        };

        handleCallback();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Completing sign in...</p>
            </div>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Completing sign in...</p>
                </div>
            </div>
        }>
            <AuthCallbackInner />
        </Suspense>
    );
}
