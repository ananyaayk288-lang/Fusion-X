import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

const DEMO_STUDENT_ID = '07d78f63-881c-41f3-b281-a893a31735e4';

const usnToUuid: Record<string, string> = {
    '032': DEMO_STUDENT_ID,
    '012': DEMO_STUDENT_ID,
    '099': DEMO_STUDENT_ID,
    '089': DEMO_STUDENT_ID,
    '008': DEMO_STUDENT_ID,
    '003': DEMO_STUDENT_ID,
    '4VV25EC032': DEMO_STUDENT_ID,
    '4VV25EC012': DEMO_STUDENT_ID,
    '4VV25EC099': DEMO_STUDENT_ID,
    '4VV25EC089': DEMO_STUDENT_ID,
    '4VV25EC008': DEMO_STUDENT_ID,
    '4VV25EC003': DEMO_STUDENT_ID,
};

export const POST = withCors(async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { present_usns, amount, description } = body;

        if (!present_usns || !Array.isArray(present_usns) || present_usns.length === 0) {
            return NextResponse.json({ message: 'No face detected or missing present_usns' }, { status: 400 });
        }

        if (!amount || amount <= 0) {
            return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
        }

        // Must use Service Role Key to bypass RLS since the Python script hits this endpoint unauthenticated!
        const supabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Resolve first detected student
        const detectedId = usnToUuid[present_usns[0]] || present_usns[0];

        // Verify balance
        const { data: walletData, error: walletError } = await supabase
            .from('wallet')
            .select('*')
            .eq('student_id', detectedId)
            .single();

        if (walletError || !walletData) {
            return NextResponse.json({ message: 'Wallet not found' }, { status: 404 });
        }

        if (walletData.balance < amount) {
            return NextResponse.json({ message: 'Insufficient funds' }, { status: 400 });
        }

        const newBalance = walletData.balance - amount;

        // Deduct balance
        const { error: updateError } = await supabase
            .from('wallet')
            .update({ balance: newBalance })
            .eq('student_id', detectedId);

        if (updateError) {
            return NextResponse.json({ message: 'Error updating balance' }, { status: 500 });
        }

        // Log transaction
        const { error: txError } = await supabase
            .from('wallet_transactions')
            .insert({
                student_id: detectedId,
                amount: amount,
                transaction_type: 'debit',
                description: description || 'Face Pay Checkout'
            });

        if (txError) {
            console.error('Error logging transaction:', txError);
            return NextResponse.json({ message: 'Transaction logged failed' }, { status: 500 });
        }

        return NextResponse.json({ message: `Successfully charged ₹${amount}. New balance: ₹${newBalance}` }, { status: 200 });
    } catch (err: any) {
        console.error('Wallet checkout error:', err);
        return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
    }
});
