import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

const studentNameMap: Record<string, string> = {
    '00000000-0000-0000-0000-000000000001': 'Bharath Kumar A (bk@vvce)',
    '00000000-0000-0000-0000-000000000002': 'Ananya Yk (ananya@vvce)',
    '00000000-0000-0000-0000-000000000003': 'Riddhi (riddhi@vvce)',
    '00000000-0000-0000-0000-000000000007': 'Rishith (rishith@vvce)',
    '00000000-0000-0000-0000-000000000008': 'Bharath P (bp@vvce)',
    '00000000-0000-0000-0000-000000000009': 'Anagha (anagha@vvce)',
};

export const GET = withCors(async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const slot_id = searchParams.get('slot_id');

        if (!slot_id) {
            return NextResponse.json({ message: 'Missing slot_id' }, { status: 400 });
        }

        const supabase = await createClient();
        const sessionDate = new Date().toISOString().split('T')[0];

        // 1. Fetch all student profiles
        const { data: students, error: studentError } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'student');

        if (studentError || !students) {
            console.error('Error fetching student profiles:', studentError);
            return NextResponse.json({ message: 'Failed to fetch student list' }, { status: 500 });
        }

        const roster = [];

        for (const student of students) {
            // 2. Fetch or create ledger entry for today
            let { data: ledger, error: ledgerError } = await supabase
                .from('attendance_session_ledger')
                .select('*')
                .eq('student_id', student.id)
                .eq('slot_id', slot_id)
                .eq('session_date', sessionDate)
                .single();

            if (!ledger && !ledgerError) {
                // Auto-create default ABSENT row for today's session
                const { data: newLedger, error: insertError } = await supabase
                    .from('attendance_session_ledger')
                    .insert({
                        student_id: student.id,
                        slot_id,
                        session_date: sessionDate,
                        detected_count: 0,
                        total_checks: 5,
                        final_status: 'ABSENT'
                    })
                    .select()
                    .single();

                if (!insertError && newLedger) {
                    ledger = newLedger;
                }
            }

            // 3. Compute cumulative attendance percentage
            let cumulativePercentage = 100;
            const { data: legacyStats } = await supabase
                .from('attendance')
                .select('present, total')
                .eq('student_id', student.id);

            if (legacyStats && legacyStats.length > 0) {
                const presentSum = legacyStats.reduce((sum, row) => sum + (row.present || 0), 0);
                const totalSum = legacyStats.reduce((sum, row) => sum + (row.total || 0), 0);
                if (totalSum > 0) {
                    cumulativePercentage = Math.round((presentSum / totalSum) * 100);
                }
            } else {
                // Consistent mock fallbacks
                if (student.id === '00000000-0000-0000-0000-000000000002') {
                    cumulativePercentage = 64; // Under 75%
                } else if (student.id === '00000000-0000-0000-0000-000000000001') {
                    cumulativePercentage = 84;
                } else if (student.id === '00000000-0000-0000-0000-000000000003') {
                    cumulativePercentage = 71; // Under 75%
                } else if (student.id === '00000000-0000-0000-0000-000000000007') {
                    cumulativePercentage = 97;
                } else if (student.id === '00000000-0000-0000-0000-000000000008') {
                    cumulativePercentage = 92;
                } else if (student.id === '00000000-0000-0000-0000-000000000009') {
                    cumulativePercentage = 78;
                }
            }

            roster.push({
                student_id: student.id,
                full_name: studentNameMap[student.id] || `Student (${student.id.substring(0, 8)})`,
                ledger_id: ledger?.ledger_id || null,
                final_status: ledger?.final_status || 'ABSENT',
                detected_count: ledger?.detected_count ?? 0,
                total_checks: ledger?.total_checks ?? 5,
                is_finalised: ledger?.is_finalised_by_teacher ?? false,
                absence_reason: ledger?.absence_reason || null,
                reason_status: ledger?.reason_status || 'PENDING',
                cumulative_percentage: cumulativePercentage
            });
        }

        // 4. Sort: PRESENT first, LATE second, ABSENT last
        roster.sort((a, b) => {
            const priority: Record<string, number> = { 'PRESENT': 3, 'LATE': 2, 'ABSENT': 1 };
            return (priority[b.final_status] || 0) - (priority[a.final_status] || 0);
        });

        return NextResponse.json(roster, { status: 200 });

    } catch (err: any) {
        console.error('List API execution failed:', err);
        return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
    }
});
