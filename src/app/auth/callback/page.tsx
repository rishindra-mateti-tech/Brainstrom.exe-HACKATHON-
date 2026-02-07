'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
    const router = useRouter();

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
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Completing sign in...</p>
            </div>
        </div>
    );
}
