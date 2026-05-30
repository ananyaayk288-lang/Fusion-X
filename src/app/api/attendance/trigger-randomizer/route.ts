import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

export const POST = withCors(async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { slot_id, duration, teacher_id } = body;

        if (!slot_id) {
            return NextResponse.json({ message: 'Missing slot_id' }, { status: 400 });
        }

        const workspaceRoot = process.cwd();
        const scriptPath = path.join(workspaceRoot, 'Facerecognition', 'attendance_randomizer.py');
        const pythonVenvPath = path.join(workspaceRoot, 'Facerecognition', 'venv', 'bin', 'python');

        // Check if venv python exists, fallback to standard python3 or python
        let pythonExecutable = 'python3';
        if (fs.existsSync(pythonVenvPath)) {
            pythonExecutable = pythonVenvPath;
        }

        const args = [scriptPath, '--slot', slot_id];
        if (duration) {
            args.push('--duration', String(duration));
        }
        if (teacher_id) {
            args.push('--teacher', String(teacher_id));
        }

        console.log(`[API Trigger] Spawning Python process: ${pythonExecutable} ${args.join(' ')}`);

        // Run the process in the background, detached, so Next.js doesn't wait for it
        const child = spawn(pythonExecutable, args, {
            cwd: path.join(workspaceRoot, 'Facerecognition'),
            detached: true,
            stdio: 'ignore'
        });

        child.unref();

        return NextResponse.json({ message: 'Randomized face validation system triggered!' }, { status: 200 });
    } catch (err: any) {
        console.error('Trigger randomizer API execution failed:', err);
        return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
    }
});
