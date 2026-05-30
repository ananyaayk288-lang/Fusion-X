import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

const studentNameMap: Record<string, string> = {
    '00000000-0000-0000-0000-000000000001': 'Bharath Kumar A',
    '00000000-0000-0000-0000-000000000002': 'Ananya Yk',
    '00000000-0000-0000-0000-000000000003': 'Riddhi',
    '00000000-0000-0000-0000-000000000007': 'Rishith',
    '00000000-0000-0000-0000-000000000008': 'Bharath P',
    '00000000-0000-0000-0000-000000000009': 'Anagha',
};

const parentInfoMap: Record<string, { name: string; phone: string }> = {
    '00000000-0000-0000-0000-000000000005': { name: 'Abhi', phone: '+919999999999' },
    '00000000-0000-0000-0000-000000000006': { name: 'Preksha', phone: '+918888888888' },
};

export const POST = withCors(async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { slot_id, roster } = body;

        if (!slot_id || !Array.isArray(roster)) {
            return NextResponse.json({ message: 'Missing slot_id or roster' }, { status: 400 });
        }

        const supabase = await createClient();
        const sessionDate = new Date().toISOString().split('T')[0];

        // 1. Fetch subject name from timetable
        const { data: slotInfo } = await supabase
            .from('timetables')
            .select('subject')
            .eq('id', slot_id)
            .limit(1)
            .single();

        const courseName = slotInfo?.subject || '1BMATE201 - Applied Mathematics - II for EE Stream';

        // Get current day name
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[new Date().getDay()];

        // Format Date for legacy attendance table: DD-MM-YYYY
        const dateParts = sessionDate.split('-');
        const legacyDateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

        for (const student of roster) {
            const { student_id, final_status } = student;

            // 2. Lock & Finalise ledger entry
            const { error: ledgerError } = await supabase
                .from('attendance_session_ledger')
                .update({
                    is_finalised_by_teacher: true,
                    final_status,
                    updated_at: new Date().toISOString()
                })
                .eq('student_id', student_id)
                .eq('slot_id', slot_id)
                .eq('session_date', sessionDate);

            if (ledgerError) {
                console.error(`Ledger finalisation failed for student ${student_id}:`, ledgerError);
            }

            // 3. Write compiled summary back to legacy 'attendance' table
            // This enables the triggers notify_parent_on_attendance to fire natively!
            const isPresent = final_status === 'PRESENT' || final_status === 'LATE' ? 1 : 0;
            const { error: attendanceError } = await supabase
                .from('attendance')
                .insert({
                    student_id,
                    course: courseName,
                    date: legacyDateStr,
                    day: dayName,
                    present: isPresent,
                    total: 1,
                    sem: '2 - Semester'
                });

            if (attendanceError) {
                console.error(`Legacy attendance log failed for student ${student_id}:`, attendanceError);
            }

            // 4. Send Twilio Parent Warning if ABSENT
            if (final_status === 'ABSENT') {
                // Find parent(s) associated with this student
                const { data: parentProfiles } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('role', 'parent')
                    .eq('child_id', student_id);

                if (parentProfiles && parentProfiles.length > 0) {
                    for (const parent of parentProfiles) {
                        const parentInfo = parentInfoMap[parent.id] || { name: 'Parent', phone: '+919999999999' };
                        const studentName = studentNameMap[student_id] || `Student (${student_id.substring(0, 8)})`;
                        
                        const messageBody = `Dear ${parentInfo.name}, your ward ${studentName} has been marked ABSENT for their scheduled class ${courseName} on ${legacyDateStr}. Please review the active compliance dashboard inside the Connect & Prep platform.`;

                        const accountSid = process.env.TWILIO_ACCOUNT_SID;
                        const authToken = process.env.TWILIO_AUTH_TOKEN;

                        if (accountSid && authToken) {
                            try {
                                const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
                                const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
                                await fetch(url, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Basic ${authHeader}`,
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                    },
                                    body: new URLSearchParams({
                                        From: 'whatsapp:+14155238886',
                                        To: `whatsapp:${parentInfo.phone}`,
                                        Body: messageBody,
                                    })
                                });
                                console.log(`[Twilio Success] Dispatched WhatsApp alert to parent ${parentInfo.name}`);
                            } catch (err) {
                                console.error('[Twilio Error] Failed to send alert via SMS/WhatsApp:', err);
                            }
                        } else {
                            console.log(`[Twilio Mock Alert] Parent of USN: ${student_id} -> ${parentInfo.phone}: ${messageBody}`);
                        }
                    }
                }
            }
        }

        return NextResponse.json({ message: 'Session locked and notification alerts dispatched.' }, { status: 200 });

    } catch (err: any) {
        console.error('Finalise API execution failed:', err);
        return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
    }
});
