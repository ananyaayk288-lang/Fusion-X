const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Fetching student profiles from Supabase...");
    const { data, error } = await supabase
        .from('profiles')
        .select('id, role, college')
        .eq('role', 'student');

    if (error) {
        console.error("Error fetching profiles:", error);
        return;
    }

    console.log("Database Students:", data);

    const studentNamesMap = {
        '00000000-0000-0000-0000-000000000001': 'Bharath Kumar A (bk@vvce)',
        '00000000-0000-0000-0000-000000000002': 'Bharath P / Ananya (ananya@vvce)',
        '00000000-0000-0000-0000-000000000003': 'Riddhi (riddhi@vvce)',
        '00000000-0000-0000-0000-000000000007': 'Rishith (rishith@vvce)'
    };

    console.log("\nResolved Names for Seed IDs:");
    data.forEach(p => {
        const name = studentNamesMap[p.id] || "Unknown Student";
        console.log(`- UUID: ${p.id} -> Name: ${name} (College: ${p.college})`);
    });
}

run();
