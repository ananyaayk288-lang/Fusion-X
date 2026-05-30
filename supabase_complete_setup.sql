-- =========================================================================
-- CONNECT & PREP - MASTER DATABASE SETUP & HARDENING SCRIPT
-- =========================================================================
-- This script sets up all tables, indexes, triggers, helper functions,
-- and Row Level Security (RLS) policies for Connect & Prep.
--
-- EXECUTION ORDER:
-- 1. Enable Extensions
-- 2. Create Base Tables
-- 3. Create Helper Functions & Triggers
-- 4. Enable Row Level Security (RLS) on all tables
-- 5. Define Access Control Policies
-- 6. Configure Storage Buckets & Policies
-- =========================================================================

-- -------------------------------------------------------------------------
-- PHASE 1: ENABLE EXTENSIONS
-- -------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- -------------------------------------------------------------------------
-- PHASE 2: CREATE BASE TABLES (Foreign key dependency ordered)
-- -------------------------------------------------------------------------

-- 2.1 Profiles Table (Profiles sync automatically from auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin', 'parent')),
    college TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure the role check constraint is up-to-date even if the profiles table already existed
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'teacher', 'admin', 'parent'));

-- 2.2 Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    college TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.3 Feedback Table (Standard Authenticated Feedback)
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.4 Study Groups Table
CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.5 Group Members Table (Roster of study group participants)
CREATE TABLE IF NOT EXISTS public.group_members (
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, user_id)
);

-- 2.6 Chat Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast retrieval of group chats ordered by date
CREATE INDEX IF NOT EXISTS idx_messages_group_date 
ON public.messages (group_id, created_at DESC);

-- 2.7 Cryptographically Decoupled Anonymous Feedback Table
CREATE TABLE IF NOT EXISTS public.anonymous_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    daily_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index the daily_hash and created_at columns for quick rate-limit checking
CREATE INDEX IF NOT EXISTS idx_feedback_daily_hash_date 
ON public.anonymous_feedback (daily_hash, created_at);


-- -------------------------------------------------------------------------
-- PHASE 3: HELPER FUNCTIONS & TRIGGER BINDINGS
-- -------------------------------------------------------------------------

-- 3.1 Check User Admin Helper Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
        AND auth.uid() IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql;

-- 3.2 Automatic Profile Creation Trigger
-- Creates a profile row in public.profiles automatically when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, college)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', new.raw_app_meta_data->>'role', 'student'), -- Respect custom roles
    split_part(new.email, '@', 2) -- Extracts the college domain
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3.3 Email/OAuth Domain Restriction Trigger
CREATE OR REPLACE FUNCTION public.check_oauth_domain()
RETURNS TRIGGER AS $$
DECLARE
    user_email text;
BEGIN
    user_email := NEW.email;
    
    -- Reject signups/logins if they do not match college.edu or vvce
    IF user_email IS NOT NULL AND NOT (user_email LIKE '%@college.edu' OR user_email LIKE '%@vvce') THEN
        RAISE EXCEPTION 'Access denied. Account email must end with @college.edu or @vvce.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS restrict_domain_trigger ON auth.users;
CREATE TRIGGER restrict_domain_trigger
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.check_oauth_domain();

-- 3.4 Chat Message Rate Limiter (Max 1 message per 2 seconds per user)
CREATE OR REPLACE FUNCTION public.check_message_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.messages
        WHERE sender_id = NEW.sender_id
        AND created_at >= now() - INTERVAL '2 seconds'
    ) THEN
        RAISE EXCEPTION 'Rate limit exceeded: Please wait 2 seconds before sending another message.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_message_rate_limit ON public.messages;
CREATE TRIGGER trigger_message_rate_limit
BEFORE INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.check_message_rate_limit();

-- 3.5 Chat Message HTML Tag Stripping & Character Limiting
CREATE OR REPLACE FUNCTION public.sanitize_message_content()
RETURNS TRIGGER AS $$
BEGIN
    -- Strip HTML tags using regular expression replacement
    NEW.content := regexp_replace(NEW.content, '<[^>]*>', '', 'g');
    -- Hard limit text content to 1000 characters
    NEW.content := substring(NEW.content from 1 for 1000);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sanitize_message ON public.messages;
CREATE TRIGGER trigger_sanitize_message
BEFORE INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.sanitize_message_content();


-- -------------------------------------------------------------------------
-- PHASE 4: ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- -------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_feedback ENABLE ROW LEVEL SECURITY;


-- -------------------------------------------------------------------------
-- PHASE 5: DEFINE ACCESS CONTROL POLICIES
-- -------------------------------------------------------------------------

-- 5.1 Profiles Table Policies
DROP POLICY IF EXISTS select_own_profile ON public.profiles;
CREATE POLICY select_own_profile ON public.profiles
    FOR SELECT
    USING (auth.uid() IS NOT NULL AND auth.uid() = id);

DROP POLICY IF EXISTS update_own_profile ON public.profiles;
CREATE POLICY update_own_profile ON public.profiles
    FOR UPDATE
    USING (auth.uid() IS NOT NULL AND auth.uid() = id)
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

DROP POLICY IF EXISTS admin_select_all_profiles ON public.profiles;
CREATE POLICY admin_select_all_profiles ON public.profiles
    FOR SELECT
    USING (public.is_admin());

DROP POLICY IF EXISTS admin_update_all_profiles ON public.profiles;
CREATE POLICY admin_update_all_profiles ON public.profiles
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5.2 Notes Table Policies
DROP POLICY IF EXISTS insert_own_note ON public.notes;
CREATE POLICY insert_own_note ON public.notes
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

DROP POLICY IF EXISTS select_college_notes ON public.notes;
CREATE POLICY select_college_notes ON public.notes
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND college = (SELECT college FROM public.profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS delete_own_note ON public.notes;
CREATE POLICY delete_own_note ON public.notes
    FOR DELETE
    USING (auth.uid() IS NOT NULL AND author_id = auth.uid());

DROP POLICY IF EXISTS admin_manage_all_notes ON public.notes;
CREATE POLICY admin_manage_all_notes ON public.notes
    FOR ALL
    USING (public.is_admin());

-- 5.3 Feedback Table Policies (Authenticated Standard Feedback)
DROP POLICY IF EXISTS insert_authenticated_feedback ON public.feedback;
CREATE POLICY insert_authenticated_feedback ON public.feedback
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS admin_select_feedback ON public.feedback;
CREATE POLICY admin_select_feedback ON public.feedback
    FOR SELECT
    USING (public.is_admin());

-- 5.4 Study Groups Table Policies
DROP POLICY IF EXISTS select_member_groups ON public.study_groups;
CREATE POLICY select_member_groups ON public.study_groups
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND (
            creator_id = auth.uid() 
            OR EXISTS (
                SELECT 1 FROM public.group_members 
                WHERE group_id = id AND user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS modify_own_group ON public.study_groups;
CREATE POLICY modify_own_group ON public.study_groups
    FOR UPDATE
    USING (auth.uid() IS NOT NULL AND creator_id = auth.uid())
    WITH CHECK (auth.uid() IS NOT NULL AND creator_id = auth.uid());

DROP POLICY IF EXISTS delete_own_group ON public.study_groups;
CREATE POLICY delete_own_group ON public.study_groups
    FOR DELETE
    USING (auth.uid() IS NOT NULL AND creator_id = auth.uid());

DROP POLICY IF EXISTS admin_manage_all_groups ON public.study_groups;
CREATE POLICY admin_manage_all_groups ON public.study_groups
    FOR ALL
    USING (public.is_admin());

-- 5.5 Group Members Table Policies
DROP POLICY IF EXISTS select_visible_members ON public.group_members;
CREATE POLICY select_visible_members ON public.group_members
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM public.group_members AS self
            WHERE self.group_id = group_id AND self.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS join_group ON public.group_members;
CREATE POLICY join_group ON public.group_members
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS leave_group ON public.group_members;
CREATE POLICY leave_group ON public.group_members
    FOR DELETE
    USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS admin_manage_all_members ON public.group_members;
CREATE POLICY admin_manage_all_members ON public.group_members
    FOR ALL
    USING (public.is_admin());

-- 5.6 Messages Table Policies
DROP POLICY IF EXISTS select_group_messages ON public.messages;
CREATE POLICY select_group_messages ON public.messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = messages.group_id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS insert_group_messages ON public.messages;
CREATE POLICY insert_group_messages ON public.messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = messages.group_id 
            AND user_id = auth.uid()
        )
    );

-- 5.7 Anonymous Feedback Table Policies
DROP POLICY IF EXISTS insert_anonymous_feedback ON public.anonymous_feedback;
CREATE POLICY insert_anonymous_feedback ON public.anonymous_feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS select_admin_feedback ON public.anonymous_feedback;
CREATE POLICY select_admin_feedback ON public.anonymous_feedback
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );


-- -------------------------------------------------------------------------
-- PHASE 6: SUPABASE STORAGE BUCKETS & STORAGE OBJECTS RLS POLICIES
-- -------------------------------------------------------------------------

-- 6.1 Public Assets Bucket (Profile Pictures)
DROP POLICY IF EXISTS "Public read for profile pictures" ON storage.objects;
CREATE POLICY "Public read for profile pictures" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'public-assets');

DROP POLICY IF EXISTS "Authenticated upload of profile pictures" ON storage.objects;
CREATE POLICY "Authenticated upload of profile pictures" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'public-assets' 
        AND auth.uid() IS NOT NULL
    );

-- 6.2 Study Materials Bucket (Private)
-- INSERT POLICY: Users can only upload files to their own subfolders
DROP POLICY IF EXISTS "Upload only to user folder" ON storage.objects;
CREATE POLICY "Upload only to user folder" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'study-materials'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- SELECT POLICY: Users can download notes if they belong to the same college, 
-- or if they are registered as a 'teacher' in their profile.
DROP POLICY IF EXISTS "Download from same college or teacher bypass" ON storage.objects;
CREATE POLICY "Download from same college or teacher bypass" ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'study-materials'
        AND auth.uid() IS NOT NULL
        AND (
            -- Bypass: Teachers can download all notes
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'teacher'
            )
            OR
            -- Match: Downloader's college must match the college of the file owner (folder name)
            (
                SELECT college FROM public.profiles WHERE id = auth.uid()
            ) = (
                SELECT college FROM public.profiles WHERE id = (storage.foldername(name))[1]::uuid
            )
        )
    );

-- DELETE POLICY: Users can only delete their own notes
DROP POLICY IF EXISTS "Delete own study materials" ON storage.objects;
CREATE POLICY "Delete own study materials" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'study-materials'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );


-- -------------------------------------------------------------------------
-- PHASE 7: REALTIME STUDENT ATTENDANCE SYSTEM
-- -------------------------------------------------------------------------

-- Create the attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course TEXT NOT NULL,
    date TEXT NOT NULL, -- format DD-MM-YYYY
    day TEXT NOT NULL,
    present INTEGER NOT NULL DEFAULT 1,
    total INTEGER NOT NULL DEFAULT 1,
    doc TEXT,
    doc_status TEXT DEFAULT '',
    sem TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for fast lookups by student and semester
CREATE INDEX IF NOT EXISTS idx_attendance_student_sem 
ON public.attendance (student_id, sem);

-- Enable Row Level Security (RLS)
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if the current authenticated user is a teacher
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'teacher'
        AND auth.uid() IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql;

-- Define Access Control Rules (RLS Policies)
CREATE POLICY select_attendance_student ON public.attendance
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = student_id 
        OR public.is_teacher() 
        OR public.is_admin()
    );

CREATE POLICY insert_attendance_teacher ON public.attendance
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_teacher() 
        OR public.is_admin()
    );

CREATE POLICY update_attendance_allowed ON public.attendance
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = student_id 
        OR public.is_teacher() 
        OR public.is_admin()
    )
    WITH CHECK (
        auth.uid() = student_id 
        OR public.is_teacher() 
        OR public.is_admin()
    );

CREATE POLICY delete_attendance_teacher ON public.attendance
    FOR DELETE
    TO authenticated
    USING (
        public.is_teacher() 
        OR public.is_admin()
    );

-- Enable Realtime Replication for the attendance table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
    
    ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;


-- -------------------------------------------------------------------------
-- PHASE 8: PARENT-STUDENT PORTAL & CLASS ASSESSMENTS SCHEMA
-- -------------------------------------------------------------------------

-- 1. Parent-Student relation table
CREATE TABLE IF NOT EXISTS public.parent_student (
    parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_id, student_id)
);

-- 2. Timetables table
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    day TEXT NOT NULL,
    time TEXT NOT NULL,
    room TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Exams & Assessment Schedules table
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'Exam', 'Internal'
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Quizzes & Class Tests table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    score TEXT NOT NULL,
    total TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Notice board table
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    date TEXT NOT NULL,
    target_role TEXT NOT NULL DEFAULT 'all', -- 'parent', 'student', 'all'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.parent_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- 7. Policy Helper Function: Validate Parent Association
CREATE OR REPLACE FUNCTION public.parent_has_access_to_student(p_id UUID, s_id UUID)
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.parent_student
        WHERE parent_id = p_id AND student_id = s_id
    );
END;
$$ LANGUAGE plpgsql;

-- 8. Row Level Security Policies

-- parent_student: Select policy
DROP POLICY IF EXISTS select_parent_student ON public.parent_student;
CREATE POLICY select_parent_student ON public.parent_student
    FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = student_id);

-- timetables: Select/Insert/Update/Delete policies
DROP POLICY IF EXISTS select_timetable ON public.timetables;
CREATE POLICY select_timetable ON public.timetables
    FOR SELECT TO authenticated
    USING (auth.uid() = student_id OR public.parent_has_access_to_student(auth.uid(), student_id) OR public.is_teacher());

DROP POLICY IF EXISTS insert_timetable_teacher ON public.timetables;
CREATE POLICY insert_timetable_teacher ON public.timetables
    FOR INSERT WITH CHECK (public.is_teacher() OR public.is_admin());

DROP POLICY IF EXISTS update_timetable_teacher ON public.timetables;
CREATE POLICY update_timetable_teacher ON public.timetables
    FOR UPDATE USING (public.is_teacher() OR public.is_admin());

DROP POLICY IF EXISTS delete_timetable_teacher ON public.timetables;
CREATE POLICY delete_timetable_teacher ON public.timetables
    FOR DELETE USING (public.is_teacher() OR public.is_admin());

-- exams: Select/Insert/Update/Delete policies
DROP POLICY IF EXISTS select_exams ON public.exams;
CREATE POLICY select_exams ON public.exams
    FOR SELECT TO authenticated
    USING (auth.uid() = student_id OR public.parent_has_access_to_student(auth.uid(), student_id) OR public.is_teacher());

DROP POLICY IF EXISTS insert_exams_teacher ON public.exams;
CREATE POLICY insert_exams_teacher ON public.exams
    FOR INSERT WITH CHECK (public.is_teacher() OR public.is_admin());

DROP POLICY IF EXISTS update_exams_teacher ON public.exams;
CREATE POLICY update_exams_teacher ON public.exams
    FOR UPDATE USING (public.is_teacher() OR public.is_admin());

DROP POLICY IF EXISTS delete_exams_teacher ON public.exams;
CREATE POLICY delete_exams_teacher ON public.exams
    FOR DELETE USING (public.is_teacher() OR public.is_admin());

-- quizzes: Select/Insert/Update/Delete policies
DROP POLICY IF EXISTS select_quizzes ON public.quizzes;
CREATE POLICY select_quizzes ON public.quizzes
    FOR SELECT TO authenticated
    USING (auth.uid() = student_id OR public.parent_has_access_to_student(auth.uid(), student_id) OR public.is_teacher());

DROP POLICY IF EXISTS insert_quizzes_teacher ON public.quizzes;
CREATE POLICY insert_quizzes_teacher ON public.quizzes
    FOR INSERT WITH CHECK (public.is_teacher() OR public.is_admin());

DROP POLICY IF EXISTS update_quizzes_teacher ON public.quizzes;
CREATE POLICY update_quizzes_teacher ON public.quizzes
    FOR UPDATE USING (public.is_teacher() OR public.is_admin());

DROP POLICY IF EXISTS delete_quizzes_teacher ON public.quizzes;
CREATE POLICY delete_quizzes_teacher ON public.quizzes
    FOR DELETE USING (public.is_teacher() OR public.is_admin());

-- notices: Select/Insert/Update/Delete policies
DROP POLICY IF EXISTS select_notices ON public.notices;
CREATE POLICY select_notices ON public.notices
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS insert_notices_teacher ON public.notices;
CREATE POLICY insert_notices_teacher ON public.notices
    FOR INSERT WITH CHECK (public.is_teacher() OR public.is_admin());

DROP POLICY IF EXISTS update_notices_teacher ON public.notices;
CREATE POLICY update_notices_teacher ON public.notices
    FOR UPDATE USING (public.is_teacher() OR public.is_admin());

DROP POLICY IF EXISTS delete_notices_teacher ON public.notices;
CREATE POLICY delete_notices_teacher ON public.notices
    FOR DELETE USING (public.is_teacher() OR public.is_admin());


-- -------------------------------------------------------------------------
-- PHASE 9: INSTANT SEED ACCOUNTS AND MOCK DATA FOR VVCE COMMUNITY
-- -------------------------------------------------------------------------

-- 1. Create the accounts in auth.users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, confirmation_token)
VALUES 
-- bk@vvce (Student - bk)
('00000000-0000-0000-0000-000000000001', 'bk@vvce', '$2a$10$YeKwh0RXYyQ44KbWfOw4R.eRMX/kpopbaBz20YzxcgxaUBO7cng3W', now(), 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"bharath kumar a","role":"student"}', now(), now(), 'authenticated', ''),
-- ananya@vvce (Student - ananya)
('00000000-0000-0000-0000-000000000002', 'ananya@vvce', '$2a$10$Y4w6QA7w8.0HXxQGPY0i3OLrI6.14Ojw0D3wFUUzzx.d/ZLQD3g2u', now(), 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"ananya yk","role":"student"}', now(), now(), 'authenticated', ''),
-- riddhi@vvce (Student - riddhi)
('00000000-0000-0000-0000-000000000003', 'riddhi@vvce', '$2a$10$wx44a16VcC1QgvCvP.uwLemHBbWS4mi7rYI7bd0goJoqSWIxFq9Aa', now(), 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"riddhi","role":"student"}', now(), now(), 'authenticated', ''),
-- bhav@vvce (Maths Teacher - bhav)
('00000000-0000-0000-0000-000000000004', 'bhav@vvce', '$2a$10$lzLKX1OS/lBqqqGkjd9kEut/Ye7BFbHUldo91bj60BMBofZWHVDDq', now(), 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"bhavana","role":"teacher"}', now(), now(), 'authenticated', ''),
-- abhi@vvce (Parent - abhi)
('00000000-0000-0000-0000-000000000005', 'abhi@vvce', '$2a$10$EEIBm91s0h5pPZAjwabjpOhdJLyLezF6LDASyIMV/ex6shNMiIjR2', now(), 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"abhi","role":"parent"}', now(), now(), 'authenticated', ''),
-- preksha@vvce (Parent - preksha)
('00000000-0000-0000-0000-000000000006', 'preksha@vvce', '$2a$10$f8JIR6MBG71C5hVTYcsG0uTyPsWCZN0r.u5m2rdxCkI1T/aB2SN2q', now(), 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"preksha","role":"parent"}', now(), now(), 'authenticated', ''),
-- rishith@vvce (Student - rishith)
('00000000-0000-0000-0000-000000000007', 'rishith@vvce', '$2a$10$wx44a16VcC1QgvCvP.uwLemHBbWS4mi7rYI7bd0goJoqSWIxFq9Aa', now(), 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"rishith","role":"student"}', now(), now(), 'authenticated', ''),
-- bp@vvce (Student - bp)
('00000000-0000-0000-0000-000000000008', 'bp@vvce', crypt('bp', gen_salt('bf')), now(), 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"bharath p","role":"student"}', now(), now(), 'authenticated', ''),
-- anagha@vvce (Student - anagha)
('00000000-0000-0000-0000-000000000009', 'anagha@vvce', crypt('anagha', gen_salt('bf')), now(), 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"anagha","role":"student"}', now(), now(), 'authenticated', '')
ON CONFLICT (id) DO NOTHING;

-- 2. Explicitly override profiles roles to match exactly (overriding trigger's default 'student' value if needed)
UPDATE public.profiles SET role = 'student' WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000009');
UPDATE public.profiles SET role = 'teacher' WHERE id = '00000000-0000-0000-0000-000000000004';
UPDATE public.profiles SET role = 'parent' WHERE id IN ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006');

-- 3. Link parent-student relations
INSERT INTO public.parent_student (parent_id, student_id)
VALUES 
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002'), -- abhi -> ananya
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002')  -- preksha -> ananya
ON CONFLICT DO NOTHING;

-- 4. Seed initial attendance for student accounts
INSERT INTO public.attendance (student_id, course, date, day, present, total, sem)
VALUES 
('00000000-0000-0000-0000-000000000002', '1BMATE201 - Applied Mathematics - II for EE Stream', '20-05-2026', 'Wednesday', 1, 1, '2 - Semester'),
('00000000-0000-0000-0000-000000000002', '1BMATE201 - Applied Mathematics - II for EE Stream', '21-05-2026', 'Thursday', 1, 1, '2 - Semester'),
('00000000-0000-0000-0000-000000000002', '1BMATE201 - Applied Mathematics - II for EE Stream', '22-05-2026', 'Friday', 0, 1, '2 - Semester'),
('00000000-0000-0000-0000-000000000008', '1BMATE201 - Applied Mathematics - II for EE Stream', '20-05-2026', 'Wednesday', 1, 1, '2 - Semester'),
('00000000-0000-0000-0000-000000000008', '1BMATE201 - Applied Mathematics - II for EE Stream', '21-05-2026', 'Thursday', 1, 1, '2 - Semester'),
('00000000-0000-0000-0000-000000000008', '1BMATE201 - Applied Mathematics - II for EE Stream', '22-05-2026', 'Friday', 0, 1, '2 - Semester')
ON CONFLICT DO NOTHING;

-- 5. Seed timetables for student accounts
INSERT INTO public.timetables (student_id, subject, day, time, room)
VALUES
('00000000-0000-0000-0000-000000000002', '1BMATE201 - Applied Mathematics - II', 'Monday', '09:00 AM - 10:00 AM', 'L-301'),
('00000000-0000-0000-0000-000000000002', '1BPLCO203 - Introduction to C Programming', 'Monday', '10:15 AM - 11:15 AM', 'CS-Lab'),
('00000000-0000-0000-0000-000000000002', '1BPHYT202 - Applied Physics', 'Tuesday', '11:30 AM - 12:30 PM', 'Physics-Lab'),
('00000000-0000-0000-0000-000000000008', '1BMATE201 - Applied Mathematics - II', 'Monday', '09:00 AM - 10:00 AM', 'L-301'),
('00000000-0000-0000-0000-000000000008', '1BPLCO203 - Introduction to C Programming', 'Monday', '10:15 AM - 11:15 AM', 'CS-Lab'),
('00000000-0000-0000-0000-000000000008', '1BPHYT202 - Applied Physics', 'Tuesday', '11:30 AM - 12:30 PM', 'Physics-Lab'),
('00000000-0000-0000-0000-000000000003', '1BMATE201 - Applied Mathematics - II', 'Monday', '09:00 AM - 10:00 AM', 'L-301'),
('00000000-0000-0000-0000-000000000003', '1BPLCO203 - Introduction to C Programming', 'Monday', '10:15 AM - 11:15 AM', 'CS-Lab'),
('00000000-0000-0000-0000-000000000003', '1BPHYT202 - Applied Physics', 'Tuesday', '11:30 AM - 12:30 PM', 'Physics-Lab'),
('00000000-0000-0000-0000-000000000009', '1BMATE201 - Applied Mathematics - II', 'Monday', '09:00 AM - 10:00 AM', 'L-301'),
('00000000-0000-0000-0000-000000000009', '1BPLCO203 - Introduction to C Programming', 'Monday', '10:15 AM - 11:15 AM', 'CS-Lab'),
('00000000-0000-0000-0000-000000000009', '1BPHYT202 - Applied Physics', 'Tuesday', '11:30 AM - 12:30 PM', 'Physics-Lab')
ON CONFLICT DO NOTHING;

-- 6. Seed exams for student accounts
INSERT INTO public.exams (student_id, subject, type, date, time)
VALUES
('00000000-0000-0000-0000-000000000002', '1BMATE201 - Applied Mathematics - II', 'Internals 1', '15-06-2026', '10:00 AM'),
('00000000-0000-0000-0000-000000000002', '1BPLCO203 - Introduction to C Programming', 'Final Exam', '22-06-2026', '02:00 PM'),
('00000000-0000-0000-0000-000000000008', '1BMATE201 - Applied Mathematics - II', 'Internals 1', '15-06-2026', '10:00 AM'),
('00000000-0000-0000-0000-000000000008', '1BPLCO203 - Introduction to C Programming', 'Final Exam', '22-06-2026', '02:00 PM'),
('00000000-0000-0000-0000-000000000003', '1BMATE201 - Applied Mathematics - II', 'Internals 1', '15-06-2026', '10:00 AM'),
('00000000-0000-0000-0000-000000000003', '1BPLCO203 - Introduction to C Programming', 'Final Exam', '22-06-2026', '02:00 PM'),
('00000000-0000-0000-0000-000000000009', '1BMATE201 - Applied Mathematics - II', 'Internals 1', '15-06-2026', '10:00 AM'),
('00000000-0000-0000-0000-000000000009', '1BPLCO203 - Introduction to C Programming', 'Final Exam', '22-06-2026', '02:00 PM')
ON CONFLICT DO NOTHING;

-- 7. Seed quizzes for student accounts
INSERT INTO public.quizzes (student_id, subject, title, score, total, date)
VALUES
('00000000-0000-0000-0000-000000000002', '1BMATE201 - Applied Mathematics - II', 'Unit Test 1', '8', '10', '12-05-2026'),
('00000000-0000-0000-0000-000000000002', '1BPLCO203 - Introduction to C Programming', 'Quiz 1', '9', '10', '19-05-2026'),
('00000000-0000-0000-0000-000000000008', '1BMATE201 - Applied Mathematics - II', 'Unit Test 1', '8', '10', '12-05-2026'),
('00000000-0000-0000-0000-000000000008', '1BPLCO203 - Introduction to C Programming', 'Quiz 1', '9', '10', '19-05-2026'),
('00000000-0000-0000-0000-000000000003', '1BMATE201 - Applied Mathematics - II', 'Unit Test 1', '8', '10', '12-05-2026'),
('00000000-0000-0000-0000-000000000003', '1BPLCO203 - Introduction to C Programming', 'Quiz 1', '9', '10', '19-05-2026'),
('00000000-0000-0000-0000-000000000009', '1BMATE201 - Applied Mathematics - II', 'Unit Test 1', '8', '10', '12-05-2026'),
('00000000-0000-0000-0000-000000000009', '1BPLCO203 - Introduction to C Programming', 'Quiz 1', '9', '10', '19-05-2026')
ON CONFLICT DO NOTHING;

-- 8. Seed notices
INSERT INTO public.notices (title, message, date, target_role)
VALUES
('Internals Notice', 'Semester 2 first internal assessment will commence from 15th June 2026. Attendance is mandatory.', '24-05-2026', 'all'),
('Parent Teacher Association Meeting', 'PTA meeting scheduled for 30th May 2026 at 10 AM in the main auditorium.', '24-05-2026', 'parent')
ON CONFLICT DO NOTHING;


-- -------------------------------------------------------------------------
-- PHASE 10: RANDOMIZED CAMERA ATTENDANCE LIFECYCLE SCHEMA
-- -------------------------------------------------------------------------

-- 10.1 Create the attendance snapshots table
CREATE TABLE IF NOT EXISTS public.attendance_snapshots (
    snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID REFERENCES public.timetables(id) ON DELETE CASCADE,
    check_number INT NOT NULL,              -- 1 to 5 tracking index
    detected_students UUID[],               -- Array of student UUIDs detected in this check
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10.2 Create the core session ledger table
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

-- 10.3 Create optimized indices for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_ledger_sorting 
ON public.attendance_session_ledger (slot_id, session_date, final_status DESC);

CREATE INDEX IF NOT EXISTS idx_ledger_student_date
ON public.attendance_session_ledger (student_id, session_date);

-- 10.4 Enable Row Level Security (RLS)
ALTER TABLE public.attendance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_session_ledger ENABLE ROW LEVEL SECURITY;

-- 10.5 Define RLS Policies for snapshots
DROP POLICY IF EXISTS select_snapshots ON public.attendance_snapshots;
CREATE POLICY select_snapshots ON public.attendance_snapshots
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS insert_snapshots ON public.attendance_snapshots;
CREATE POLICY insert_snapshots ON public.attendance_snapshots
    FOR INSERT TO authenticated WITH CHECK (public.is_teacher() OR public.is_admin());

-- 10.6 Define RLS Policies for ledger
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

-- 10.7 Enable Realtime Replication for ledger and snapshots
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


