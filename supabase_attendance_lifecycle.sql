-- =========================================================================
-- CONNECT & PREP - RANDOMIZED ATTENDANCE LIFECYCLE SCHEMA
-- =========================================================================

-- 1. Create the attendance snapshots table
CREATE TABLE IF NOT EXISTS public.attendance_snapshots (
    snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID REFERENCES public.timetables(id) ON DELETE CASCADE,
    check_number INT NOT NULL,              -- 1 to 5 tracking index
    detected_students UUID[],               -- Array of student UUIDs detected in this check
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the core session ledger table
CREATE TABLE IF NOT EXISTS public.attendance_session_ledger (
    ledger_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slot_id UUID NOT NULL REFERENCES public.timetables(id) ON DELETE CASCADE,
    session_date DATE DEFAULT CURRENT_DATE,
    detected_count INT DEFAULT 0,               -- number of times student was detected in snapshots
    total_checks INT DEFAULT 5,                 -- total checks run in this session
    final_status VARCHAR(10) DEFAULT 'ABSENT',  -- 'PRESENT', 'ABSENT', 'LATE'
    is_finalised_by_teacher BOOLEAN DEFAULT FALSE,
    absence_reason TEXT,                        -- Filed by student if absent
    reason_status VARCHAR(15) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (student_id, slot_id, session_date)
);

-- 3. Create optimized indices for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_ledger_sorting 
ON public.attendance_session_ledger (slot_id, session_date, final_status DESC);

CREATE INDEX IF NOT EXISTS idx_ledger_student_date
ON public.attendance_session_ledger (student_id, session_date);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.attendance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_session_ledger ENABLE ROW LEVEL SECURITY;

-- 5. Helper function wrappers if is_admin() or is_teacher() don't exist
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'teacher'
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Define RLS Policies for snapshots
DROP POLICY IF EXISTS select_snapshots ON public.attendance_snapshots;
CREATE POLICY select_snapshots ON public.attendance_snapshots
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS insert_snapshots ON public.attendance_snapshots;
CREATE POLICY insert_snapshots ON public.attendance_snapshots
    FOR INSERT TO authenticated WITH CHECK (public.is_teacher() OR public.is_admin());

-- 7. Define RLS Policies for ledger
DROP POLICY IF EXISTS select_ledger ON public.attendance_session_ledger;
CREATE POLICY select_ledger ON public.attendance_session_ledger
    FOR SELECT TO authenticated 
    USING (auth.uid() = student_id OR public.is_teacher() OR public.is_admin());

DROP POLICY IF EXISTS insert_ledger ON public.attendance_session_ledger;
CREATE POLICY insert_ledger ON public.attendance_session_ledger
    FOR INSERT TO authenticated 
    WITH CHECK (public.is_teacher() OR public.is_admin());

DROP POLICY IF EXISTS update_ledger ON public.attendance_session_ledger;
CREATE POLICY update_ledger ON public.attendance_session_ledger
    FOR UPDATE TO authenticated 
    USING (auth.uid() = student_id OR public.is_teacher() OR public.is_admin())
    WITH CHECK (auth.uid() = student_id OR public.is_teacher() OR public.is_admin());

-- 8. Enable Realtime Replication for ledger and snapshots
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
    
    ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_snapshots;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_session_ledger;
EXCEPTION
    WHEN duplicate_object THEN
        -- Safely ignore if table is already added to publication
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;
