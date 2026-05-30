import { NextRequest, NextResponse } from 'next/server';
import { getSecureUser } from '../../../../../utils/supabase/server';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getSecureUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { amount } = await request.json();
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('Razorpay keys missing, falling back to mock mode.');
      // Return a mock order for development if keys aren't set
      return NextResponse.json({
        id: 'order_mock_' + Date.now(),
        amount: amount * 100,
        currency: 'INR',
      });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_${user.id}_${Date.now()}`.substring(0, 40),
    };

    const order = await instance.orders.create(options);
    return NextResponse.json(order);
  } catch (err: any) {
    console.error('Error creating Razorpay order:', err);
    return NextResponse.json({ message: 'Failed to create payment order' }, { status: 500 });
  }
}
