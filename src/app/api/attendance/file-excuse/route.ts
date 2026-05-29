import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

export const POST = withCors(async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { ledger_id, reason } = body;

        if (!ledger_id || !reason) {
            return NextResponse.json({ message: 'Missing ledger_id or reason' }, { status: 400 });
        }

        const supabase = await createClient();

        // Update ledger row with reason
        const { data, error } = await supabase
            .from('attendance_session_ledger')
            .update({
                absence_reason: reason,
                reason_status: 'PENDING',
                updated_at: new Date().toISOString()
            })
            .eq('ledger_id', ledger_id)
            .select();

        if (error) {
            console.error('Error filing excuse:', error);
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Absence reason filed successfully', data }, { status: 200 });

    } catch (err: any) {
        console.error('File excuse API execution failed:', err);
        return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
    }
});
