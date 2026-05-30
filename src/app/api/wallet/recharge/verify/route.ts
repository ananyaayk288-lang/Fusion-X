import { NextRequest, NextResponse } from 'next/server';
import { createClient, getSecureUser } from '../../../../../utils/supabase/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getSecureUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await request.json();

    const isMockMode = !process.env.RAZORPAY_KEY_SECRET;

    if (!isMockMode) {
      // Verify signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return NextResponse.json({ message: 'Invalid payment signature' }, { status: 400 });
      }
    }

    // Payment is authentic, add to wallet using the existing RPC
    const supabase = await createClient();
    const { error } = await supabase.rpc('recharge_wallet', {
      p_student_id: user.id,
      p_amount: amount,
      p_source: 'Razorpay UPI/Card',
    });

    if (error) {
      console.error('Wallet recharge error after payment:', error.message);
      return NextResponse.json({ message: 'Failed to update wallet balance' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Payment verified and wallet recharged' }, { status: 200 });
  } catch (err: any) {
    console.error('Error verifying Razorpay payment:', err);
    return NextResponse.json({ message: 'Server error during verification' }, { status: 500 });
  }
}
