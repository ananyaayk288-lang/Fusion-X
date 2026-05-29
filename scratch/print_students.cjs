const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
            value = value.substring(1, value.length - 1);
        }
        env[key] = value;
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Signing in as Bhavana (Teacher)...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'bhav@vvce',
        password: 'bhav'
    });

    if (authError) {
        console.error("Sign in failed:", authError.message);
        return;
    }

    console.log("Sign in successful! Fetching student profiles...");
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, college')
        .eq('role', 'student');

    if (profileError) {
        console.error("Error fetching profiles:", profileError);
        return;
    }

    // Static display name mappings defined in the application source
    const studentNamesMap = {
        '00000000-0000-0000-0000-000000000001': 'Bharath Kumar A (bk@vvce)',
        '00000000-0000-0000-0000-000000000002': 'Ananya (ananya@vvce) / Bharath P (bp@vvce)',
        '00000000-0000-0000-0000-000000000003': 'Riddhi (riddhi@vvce)',
        '00000000-0000-0000-0000-000000000007': 'Rishith (rishith@vvce)'
    };

    console.log("\nRegistered Students in Database profiles table:");
    profiles.forEach((p, index) => {
        const displayName = studentNamesMap[p.id] || "Unknown Name";
        console.log(`${index + 1}. Name: ${displayName} | UUID: ${p.id} | College Domain: ${p.college}`);
    });
}

run();
