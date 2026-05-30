import { NextRequest, NextResponse } from 'next/server';
import { createClient, getSecureUser } from '../../../../utils/supabase/server';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

// POST — Borrow a book or equipment via RFID scan
export const POST = withCors(async (request: NextRequest) => {
  try {
    const { item_id, item_type, due_date } = await request.json();
    if (!item_id || !item_type || !due_date) {
      return NextResponse.json({ message: 'item_id, item_type, and due_date are required' }, { status: 400 });
    }
    if (!['book', 'equipment'].includes(item_type)) {
      return NextResponse.json({ message: 'item_type must be "book" or "equipment"' }, { status: 400 });
    }
    const user = await getSecureUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();
    const { error } = await supabase.rpc('borrow_item', {
      p_student_id: user.id,
      p_item_id: item_id,
      p_item_type: item_type,
      p_due_date: due_date,
    });
    if (error) {
      console.error('Borrow item error:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    // Also log a location scan for tracking
    await supabase.from('rfid_scans').insert({
      student_id: user.id,
      location: item_type === 'book' ? 'Library' : 'Equipment Lab',
      event_type: 'location',
      metadata: { action: 'borrow', item_id, item_type },
    });
    return NextResponse.json({ message: `${item_type} borrowed successfully` }, { status: 201 });
  } catch (e) {
    console.error('Borrow route exception:', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
});

// GET — Fetch borrowed items for the current user
export const GET = withCors(async (request: NextRequest) => {
  try {
    const user = await getSecureUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('borrowed_items')
      .select('*')
      .eq('student_id', user.id)
      .order('borrowed_at', { ascending: false });
    if (error) {
      console.error('Fetch borrowed items error:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ items: data }, { status: 200 });
  } catch (e) {
    console.error('Borrow GET exception:', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
});
