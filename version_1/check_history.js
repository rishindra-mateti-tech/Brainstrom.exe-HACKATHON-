const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_SUPABASE_ANON_KEY'
);

async function checkSchema() {
    const { data, error } = await supabase
        .from('product_history')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Sample Data:', data);
        if (data.length > 0) {
            console.log('Columns:', Object.keys(data[0]));
        } else {
            console.log('No data found, cannot infer columns.');
        }
    }
}

checkSchema();
