-- =========================================================================
-- CONNECT & PREP - CLASS ADVISOR PORTAL & SECTION REMARKS SCHEMA
-- =========================================================================
-- This setup establishes database structures in Supabase for batch advisors, 
-- multi-subject course timelines, and direct warning signature locks.

-- 1. Class Sections Allocation Directory
CREATE TABLE IF NOT EXISTS public.class_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_code VARCHAR(20) UNIQUE NOT NULL, -- e.g. "ECE-2A"
    department VARCHAR(100) NOT NULL,        -- e.g. "Electronics & Communication"
    semester INT NOT NULL,
    class_advisor_id UUID NOT NULL,          -- References auth.users or profiles
    academic_year VARCHAR(20) DEFAULT '2025-2026',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Class Sections
ALTER TABLE public.class_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read on class sections"
    ON public.class_sections FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow admins full operations on class sections"
    ON public.class_sections FOR ALL
    TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM public.profiles WHERE role = 'admin'
    ));

-- 2. Course Syllabus Synchronization Tracking
CREATE TABLE IF NOT EXISTS public.section_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES public.class_sections(id) ON DELETE CASCADE NOT NULL,
    subject_code VARCHAR(50) NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    faculty_name VARCHAR(150) NOT NULL,
    syllabus_covered_pct INT DEFAULT 0 CHECK (syllabus_covered_pct >= 0 AND syllabus_covered_pct <= 100),
    expected_covered_pct INT DEFAULT 75 CHECK (expected_covered_pct >= 0 AND expected_covered_pct <= 100),
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Section Subjects
ALTER TABLE public.section_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read on section subjects"
    ON public.section_subjects FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow section faculties to update progress"
    ON public.section_subjects FOR UPDATE
    TO authenticated
    USING (true); -- Allow simple inline updates from assigned staff

-- 3. Compulsory Parent Remarks & Signature Verification Logs
CREATE TABLE IF NOT EXISTS public.compulsory_remarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,               -- Student user UUID
    student_name VARCHAR(150) NOT NULL,
    parent_id UUID NOT NULL,                -- Parent user UUID
    teacher_name VARCHAR(150) NOT NULL,
    section_code VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'critical', -- 'critical' or 'standard'
    is_acknowledged BOOLEAN DEFAULT false NOT NULL,
    acknowledged_by VARCHAR(150),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_compulsory_remarks_student ON public.compulsory_remarks(student_id);
CREATE INDEX IF NOT EXISTS idx_compulsory_remarks_parent ON public.compulsory_remarks(parent_id);

-- Enable RLS for Compulsory Remarks
ALTER TABLE public.compulsory_remarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read related remarks"
    ON public.compulsory_remarks FOR SELECT
    TO authenticated
    USING (
        auth.uid() = student_id OR 
        auth.uid() = parent_id OR 
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'teacher' OR role = 'admin')
    );

CREATE POLICY "Allow teachers to insert remarks"
    ON public.compulsory_remarks FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow parents to sign off remarks"
    ON public.compulsory_remarks FOR UPDATE
    TO authenticated
    USING (auth.uid() = parent_id);
