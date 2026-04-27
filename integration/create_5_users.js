const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_SUPABASE_ANON_KEY'
);

const users = [
    { email: 'user1@demo.com', password: 'Demo123!' },
    { email: 'user2@demo.com', password: 'Demo123!' },
    { email: 'user3@demo.com', password: 'Demo123!' },
    { email: 'user4@demo.com', password: 'Demo123!' },
    { email: 'user5@demo.com', password: 'Demo123!' },
];

async function createUsers() {
    console.log('Creating 5 demo users...\n');

    for (const user of users) {
        try {
            const { data, error } = await supabase.auth.signUp(user);
            if (error) {
                console.log(`❌ ${user.email}: ${error.message}`);
            } else {
                console.log(`✅ ${user.email} created!`);
            }
        } catch (err) {
            console.error(`Error with ${user.email}:`, err);
        }
    }

    console.log('\n📝 ALL CREDENTIALS:');
    console.log('Email: user1@demo.com | Password: Demo123!');
    console.log('Email: user2@demo.com | Password: Demo123!');
    console.log('Email: user3@demo.com | Password: Demo123!');
    console.log('Email: user4@demo.com | Password: Demo123!');
    console.log('Email: user5@demo.com | Password: Demo123!');
}

createUsers();
