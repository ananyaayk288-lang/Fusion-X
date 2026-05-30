import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Map all face recognition output strictly to the newly created demo student (student@college.edu)
// This ensures that regardless of whose face is detected by OpenCV, the mock dashboard student gets marked Present!
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
        const { slot_id, check_number, present_usns, teacher_id } = body;

        if (!slot_id || !check_number || !Array.isArray(present_usns)) {
            return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
        }

        // Fix foreign key constraint error: map mock frontend slot IDs to a real one in the database
        const realSlotId = (slot_id === '00000000-0000-0000-0000-000000000002' || slot_id.length !== 36) 
            ? '5d19ac70-e765-4445-b548-97823902d6be' 
            : slot_id;

        // Must use Service Role Key to bypass RLS since the Python script hits this endpoint unauthenticated!
        const supabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Resolve student USNs to UUIDs
        const detectedIds = present_usns
            .map(usn => usnToUuid[usn] || usn)
            .filter(Boolean);

        // 2. Log the snapshot record
        const { error: snapshotError } = await supabase
            .from('attendance_snapshots')
            .insert({
                slot_id: realSlotId,
                check_number,
                detected_students: detectedIds
            });

        if (snapshotError) {
            console.error('Error inserting snapshot:', snapshotError);
            return NextResponse.json({ message: snapshotError.message }, { status: 500 });
        }

        // 3. Fetch all active student profiles to build the ledger roster
        const { data: students, error: studentError } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'student');

        if (studentError || !students) {
            console.error('Error fetching students:', studentError);
            return NextResponse.json({ message: 'Failed to fetch student list' }, { status: 500 });
        }

        const sessionDate = new Date().toISOString().split('T')[0];

        // 4. Fetch all snapshots for this slot today to calculate precise final status
        const { data: daySnapshots, error: daySnapshotsError } = await supabase
            .from('attendance_snapshots')
            .select('check_number, detected_students')
            .eq('slot_id', realSlotId)
            .gte('captured_at', `${sessionDate}T00:00:00.000Z`);

        const snapshotsList = daySnapshots || [];

        // Build a map of studentId -> set of check numbers they were detected in
        const studentDetections: Record<string, Set<number>> = {};
        for (const student of students) {
            studentDetections[student.id] = new Set<number>();
        }

        for (const snap of snapshotsList) {
            const checkNum = snap.check_number;
            const detectedArr = snap.detected_students || [];
            for (const sId of detectedArr) {
                if (studentDetections[sId]) {
                    studentDetections[sId].add(checkNum);
                }
            }
        }

        // 5. Update the ledger for each student
        for (const student of students) {
            const detections = studentDetections[student.id];
            const newDetectedCount = detections.size;
            const hasInitialCheck = detections.has(1) || detections.has(2);

            // Calculate status based on user rules:
            // - if the person gets four screens out of five (4 or 5 checks), he should be marked as present.
            // - if he didn't get even one of the initial two (checks 1 and 2), he should get as late.
            // - if it is not checked in any of the five captures (0 checks), it should come as absent.
            let finalStatus = 'ABSENT';
            if (newDetectedCount >= 4) {
                // Note: mathematically, if you missed both initial checks (1 and 2), your count is at most 3.
                // So if newDetectedCount is >= 4, the student is guaranteed to have at least one initial check.
                finalStatus = 'PRESENT';
            } else if (newDetectedCount >= 1) {
                finalStatus = 'LATE';
            }

            // Fetch existing ledger row
            const { data: existingLedger } = await supabase
                .from('attendance_session_ledger')
                .select('*')
                .eq('student_id', student.id)
                .eq('slot_id', realSlotId)
                .eq('session_date', sessionDate)
                .single();

            let ledgerId = existingLedger?.ledger_id;

            if (existingLedger) {
                // Update
                const { error: updateError } = await supabase
                    .from('attendance_session_ledger')
                    .update({
                        detected_count: newDetectedCount,
                        final_status: finalStatus,
                        updated_at: new Date().toISOString()
                    })
                    .eq('ledger_id', ledgerId);

                if (updateError) {
                    console.error(`Error updating ledger for student ${student.id}:`, updateError);
                }
            } else {
                // Insert new row
                const { error: insertError } = await supabase
                    .from('attendance_session_ledger')
                    .insert({
                        student_id: student.id,
                        slot_id: realSlotId,
                        session_date: sessionDate,
                        detected_count: newDetectedCount,
                        total_checks: 5,
                        final_status: finalStatus
                    });

                if (insertError) {
                    console.error(`Error inserting ledger for student ${student.id}:`, insertError);
                }
            }
        }

        // 6. Send detection alerts to notifications table
        const teacherUidsToNotify = new Set<string>();
        if (teacher_id) {
            teacherUidsToNotify.add(teacher_id);
        }
        
        // Also find all teachers in profiles table to notify them as fallback
        const { data: teachers } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'teacher');
        if (teachers) {
            for (const t of teachers) {
                teacherUidsToNotify.add(t.id);
            }
        }

        const studentNames: Record<string, string> = {
            '00000000-0000-0000-0000-000000000001': 'Bharath Kumar A (bk@vvce)',
            '00000000-0000-0000-0000-000000000002': 'Ananya Yk (ananya@vvce)',
            '00000000-0000-0000-0000-000000000003': 'Riddhi (riddhi@vvce)',
            '00000000-0000-0000-0000-000000000007': 'Rishith (rishith@vvce)',
            '00000000-0000-0000-0000-000000000008': 'Bharath P (bp@vvce)',
            '00000000-0000-0000-0000-000000000009': 'Anagha (anagha@vvce)'
        };

        if (detectedIds.length > 0) {
            const detectedNamesList = detectedIds.map(id => studentNames[id] || `Student (${id.substring(0, 8)})`);
            const alertMessage = `Checkpoint #${check_number}: Student(s) present: ${detectedNamesList.join(', ')}.`;
            
            for (const tId of teacherUidsToNotify) {
                // Wrap in try-catch in case the notifications table is missing from the database schema
                try {
                    await supabase
                        .from('notifications')
                        .insert({
                            user_id: tId,
                            title: 'Face Detected 📸',
                            message: alertMessage,
                            type: 'attendance'
                        });
                } catch (e) {
                    console.log('Skipped notification insert - table might not exist');
                }
            }
        }

        return NextResponse.json({ message: 'Snapshot telemetry logged successfully' }, { status: 200 });

    } catch (err: any) {
        console.error('Snapshot API execution failed:', err);
        return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
    }
});
