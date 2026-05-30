import { NextRequest, NextResponse } from 'next/server';
import { createClient, getSecureUser } from '../../../../utils/supabase/server';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

export const POST = withCors(async (request: NextRequest) => {
  try {
    const { amount, source } = await request.json();
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ message: 'Amount must be a positive number' }, { status: 400 });
    }
    const user = await getSecureUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();
    const { error } = await supabase.rpc('recharge_wallet', {
      p_student_id: user.id,
      p_amount: amount,
      p_source: source || 'online',
    });
    if (error) {
      console.error('Wallet recharge error:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    // Fetch updated balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('student_id', user.id)
      .single();
    return NextResponse.json({ message: 'Wallet recharged', balance: wallet?.balance ?? null }, { status: 200 });
  } catch (e) {
    console.error('Recharge route exception:', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
});
