require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Must provide SERVICE ROLE KEY to bypass RLS for seeding
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseKey === 'placeholder_service_role_key_value') {
  console.error('ERROR: Valid SUPABASE_SERVICE_ROLE_KEY is required in .env.local to seed data.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  console.log('Starting seed process...');

  try {
    const { data: users, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    let targetUser = users.users[0];
    
    if (!targetUser) {
        console.log('No users found in database. Creating student@college.edu...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: 'student@college.edu',
            password: 'password123',
            email_confirm: true,
            user_metadata: { role: 'student', full_name: 'Test Student' }
        });
        if (createError) throw createError;
        targetUser = newUser.user;
        console.log('Created user:', targetUser.email);
        
        // Wait 2 seconds for triggers to create profile
        await new Promise(r => setTimeout(r, 2000));
    }

    const studentId = targetUser.id;
    console.log(`Seeding mock data for ${targetUser.email} (ID: ${studentId})`);
    console.log(`Seeding data for User ID: ${studentId}`);

    // 2. Seed Wallet & Transactions
    await supabase.from('wallets').upsert({
        student_id: studentId,
        balance: 1450,
        updated_at: new Date().toISOString()
    });
    console.log('Wallet seeded.');

    await supabase.from('wallet_transactions').delete().eq('student_id', studentId);
    
    const transactions = [
        { student_id: studentId, amount: 500, transaction_type: 'credit', description: 'Wallet Recharge via UPI', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
        { student_id: studentId, amount: 65, transaction_type: 'debit', description: 'Canteen A Payment', created_at: new Date(Date.now() - 86400000 * 1).toISOString() },
        { student_id: studentId, amount: 120, transaction_type: 'debit', description: 'Stationary Purchase', created_at: new Date(Date.now() - 43200000).toISOString() },
        { student_id: studentId, amount: 25, transaction_type: 'debit', description: 'Library Fine', created_at: new Date().toISOString() },
    ];
    await supabase.from('wallet_transactions').insert(transactions);
    console.log('Transactions seeded.');

    // 3. Seed Campus Location Scans
    await supabase.from('rfid_scans').delete().eq('student_id', studentId);
    
    const locations = [
        { student_id: studentId, location: 'Main Gate', event_type: 'location', scanned_at: new Date(Date.now() - 10000000).toISOString() },
        { student_id: studentId, location: 'Library', event_type: 'location', scanned_at: new Date(Date.now() - 5000000).toISOString() },
        { student_id: studentId, location: 'Canteen A', event_type: 'location', scanned_at: new Date().toISOString() }
    ];
    await supabase.from('rfid_scans').insert(locations);
    console.log('Location scans seeded.');

    // 4. Seed Library Borrowing
    await supabase.from('borrowed_items').delete().eq('student_id', studentId);

    const borrowed = [
        { student_id: studentId, item_id: 'b1', item_type: 'book', due_date: new Date(Date.now() + 86400000 * 5).toISOString(), status: 'borrowed' },
        { student_id: studentId, item_id: 'b2', item_type: 'book', due_date: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'borrowed' }, // Overdue
        { student_id: studentId, item_id: 'e1', item_type: 'equipment', due_date: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'returned', returned_at: new Date().toISOString() },
    ];
    await supabase.from('borrowed_items').insert(borrowed);
    console.log('Borrowed items seeded.');

    console.log('\n✅ Successfully seeded database with real-looking mock data!');
  } catch (error) {
    console.error('Seed failed:', error);
  }
}

seedData();
