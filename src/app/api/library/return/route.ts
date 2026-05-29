import { NextRequest, NextResponse } from 'next/server';
import { createClient, getSecureUser } from '../../../../utils/supabase/server';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

// POST — Return a previously borrowed item
export const POST = withCors(async (request: NextRequest) => {
  try {
    const { borrow_id } = await request.json();
    if (!borrow_id) {
      return NextResponse.json({ message: 'borrow_id is required' }, { status: 400 });
    }
    const user = await getSecureUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();
    const { error } = await supabase.rpc('return_borrowed_item', {
      p_borrow_id: borrow_id,
      p_student_id: user.id,
    });
    if (error) {
      console.error('Return item error:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Item returned successfully' }, { status: 200 });
  } catch (e) {
    console.error('Return route exception:', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
});
