import { NextRequest, NextResponse } from 'next/server';
import { createClient, getSecureUser } from '../../../../utils/supabase/server';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

export const POST = withCors(async (request: NextRequest) => {
  try {
    const { amount, location } = await request.json();
    if (typeof amount !== 'number' || !location) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }
    const user = await getSecureUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();
    const { error } = await supabase.rpc('process_rfid_payment', {
      p_student_id: user.id,
      p_amount: amount,
      p_location: location,
    });
    if (error) {
      console.error('RFID payment error:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Payment processed' }, { status: 200 });
  } catch (e) {
    console.error('Payment route exception:', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
});
