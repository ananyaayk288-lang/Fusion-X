import { NextRequest, NextResponse } from 'next/server';
import { createClient, getSecureUser } from '../../../../utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getSecureUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { amount, upiId } = await request.json();

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ message: 'Amount must be a positive number' }, { status: 400 });
    }

    // Basic UPI validation regex (e.g. name@bank)
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiId || !upiRegex.test(upiId)) {
      return NextResponse.json({ message: 'Invalid UPI ID format' }, { status: 400 });
    }

    const supabase = await createClient();

    // Call the stored procedure to safely deduct balance and log request
    const { data: requestId, error } = await supabase.rpc('request_withdrawal', {
      p_student_id: user.id,
      p_amount: amount,
      p_upi_id: upiId,
    });

    if (error) {
      console.error('Withdrawal error:', error.message);
      // Supabase RPC will return the custom exception if insufficient balance
      if (error.message.includes('Insufficient balance')) {
         return NextResponse.json({ message: 'Insufficient wallet balance' }, { status: 400 });
      }
      return NextResponse.json({ message: 'Failed to process withdrawal request' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Withdrawal requested successfully. Admin will process it shortly.',
      requestId 
    }, { status: 200 });

  } catch (err: any) {
    console.error('Withdraw API exception:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
