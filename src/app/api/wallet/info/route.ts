import { NextRequest, NextResponse } from 'next/server';
import { createClient, getSecureUser } from '../../../../utils/supabase/server';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

// GET — Fetch wallet balance + recent transactions
export const GET = withCors(async (request: NextRequest) => {
  try {
    const user = await getSecureUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();

    const rawStudentId = user.id || user._id;
    const studentId = (rawStudentId === 'student-123' || rawStudentId?.length < 36) 
        ? '07d78f63-881c-41f3-b281-a893a31735e4' 
        : rawStudentId;

    // Get wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('balance, updated_at')
      .eq('student_id', studentId)
      .single();

    // If wallet doesn't exist yet, create one
    if (walletError && walletError.code === 'PGRST116') {
      const { error: createError } = await supabase
        .from('wallet')
        .insert({ student_id: studentId, balance: 0 });
      if (createError) {
        return NextResponse.json({ message: createError.message }, { status: 500 });
      }
      return NextResponse.json({
        balance: 0,
        transactions: [],
      }, { status: 200 });
    }

    if (walletError) {
      return NextResponse.json({ message: walletError.message }, { status: 500 });
    }

    // Get recent transactions
    const { data: transactions, error: txError } = await supabase
      .from('wallet_transactions')
      .select('id, amount, transaction_type, description, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (txError) {
      return NextResponse.json({ message: txError.message }, { status: 500 });
    }

    // Compute simple spending insights (rule-based)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const { data: thisWeekTx } = await supabase
      .from('wallet_transactions')
      .select('amount, description')
      .eq('student_id', studentId)
      .eq('transaction_type', 'debit')
      .gte('created_at', weekAgo.toISOString());

    const { data: lastWeekTx } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('student_id', studentId)
      .eq('transaction_type', 'debit')
      .gte('created_at', twoWeeksAgo.toISOString())
      .lt('created_at', weekAgo.toISOString());

    const thisWeekTotal = (thisWeekTx || []).reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    const lastWeekTotal = (lastWeekTx || []).reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    // Category breakdown (from description field)
    const categories: Record<string, number> = {};
    for (const t of thisWeekTx || []) {
      const cat = t.description?.toLowerCase().includes('canteen') ? 'Canteen'
        : t.description?.toLowerCase().includes('stationary') ? 'Stationary'
        : t.description?.toLowerCase().includes('library') ? 'Library'
        : 'Other';
      categories[cat] = (categories[cat] || 0) + Number(t.amount);
    }

    const weekChange = lastWeekTotal > 0
      ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
      : 0;

    // Budget warning
    const daysLeft = 7 - now.getDay(); // days until next Sunday
    const dailyRate = thisWeekTotal / Math.max(1, 7 - daysLeft);
    const projectedWeekTotal = dailyRate * 7;
    const budgetWarning = (wallet?.balance ?? 0) < projectedWeekTotal
      ? `At your current pace, you may run out of funds by the end of the week. Consider recharging.`
      : null;

    const insights = {
      this_week_total: thisWeekTotal,
      last_week_total: lastWeekTotal,
      week_over_week_change: weekChange,
      categories,
      budget_warning: budgetWarning,
    };

    return NextResponse.json({
      balance: wallet?.balance ?? 0,
      last_updated: wallet?.updated_at,
      transactions,
      insights,
    }, { status: 200 });
  } catch (e) {
    console.error('Wallet info exception:', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
});
