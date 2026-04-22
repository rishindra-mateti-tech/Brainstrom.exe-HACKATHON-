const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_SUPABASE_ANON_KEY'
);

async function createDemoUser() {
    try {
        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
            email: 'demo@cutiesiq.com',
            password: 'Demo123!',
        });

        if (error) {
            console.log('Signup error:', error.message);
        } else {
            console.log('✅ User created successfully!');
            console.log('Email: demo@cutiesiq.com');
            console.log('Password: Demo123!');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

createDemoUser();
