const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://moktnzyyuurdpspzcumz.supabase.co';
const supabaseKey = 'sb_publishable_woXLno4QSM-aLtbdH7O2Tg_I4e3R4tv';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const email = 'cuties_demo@test.com';
    const password = 'testuser123';

    console.log(`Attempting to handle user: ${email}`);

    // 1. Try Signing In
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (!signInError && signInData.session) {
        console.log('SUCCESS: User already exists and signed in!');
        return;
    }

    console.log('User not signed in, attempting to sign up...');

    // 2. Try Signing Up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (signUpError) {
        console.error('ERROR creating user:', signUpError.message);
    } else {
        console.log('SUCCESS: User created.');
        if (signUpData.session || signInData.session) {
            console.log('Session active. Checking PROFILES table...');
            const { data: profiles, error: profileError } = await supabase.from('profiles').select('*').limit(1);
            if (profileError) {
                console.error("PROFILE ERROR:", profileError.message);
            } else {
                console.log("PROFILES TABLE EXISTS. Rows found:", profiles.length);
            }
        }
    }
}

main();
