-- =========================================================================
-- CONNECT & PREP - CLUBS & CAMPUS EVENTS PORTAL SETUP
-- =========================================================================
-- This script sets up tables, RLS policies, indexing, and seeds data
-- for the Centralized Club Directory Hub.

-- -------------------------------------------------------------------------
-- PHASE 1: CREATE TABLES
-- -------------------------------------------------------------------------

-- 1.1 Clubs Table
CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo TEXT NOT NULL, -- Icon symbol or URL path
    batch_year TEXT NOT NULL DEFAULT '2025-2026',
    department TEXT NOT NULL, -- e.g., 'strictly technical execution', 'cultural synchronization'
    type TEXT NOT NULL CHECK (type IN ('technical', 'cultural', 'sports')),
    description TEXT NOT NULL,
    avg_attendance_rate INTEGER NOT NULL DEFAULT 85, -- AI footfall metric (RFID derived)
    event_frequency INTEGER NOT NULL DEFAULT 4, -- average events per month
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.2 Campus Events Table
CREATE TABLE IF NOT EXISTS public.campus_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL, -- Format DD/MM/YYYY
    time TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('live', 'upcoming', 'completed')),
    venue TEXT NOT NULL,
    attendance_rate INTEGER, -- RFID recorded percentage for past events
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- PHASE 2: ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------------------

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_events ENABLE ROW LEVEL SECURITY;

-- 2.1 Public Read for Institutional Clubs & Events (Open to all students/parents)
DROP POLICY IF EXISTS select_public_clubs ON public.clubs;
CREATE POLICY select_public_clubs ON public.clubs
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS select_public_events ON public.campus_events;
CREATE POLICY select_public_events ON public.campus_events
    FOR SELECT TO authenticated
    USING (true);

-- 2.2 Manage Policies (Strictly Admin / Faculty Level operations)
DROP POLICY IF EXISTS manage_clubs_admin ON public.clubs;
CREATE POLICY manage_clubs_admin ON public.clubs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS manage_events_admin ON public.campus_events;
CREATE POLICY manage_events_admin ON public.campus_events
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'teacher')
        )
    );

-- -------------------------------------------------------------------------
-- PHASE 3: INDEXING FOR PERFORMANCE
-- -------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_events_club_status ON public.campus_events (club_id, status);
CREATE INDEX IF NOT EXISTS idx_clubs_type ON public.clubs (type);

-- -------------------------------------------------------------------------
-- PHASE 4: INSTANT SEED DATA
-- -------------------------------------------------------------------------

-- 4.1 Seed Clubs
INSERT INTO public.clubs (id, name, logo, batch_year, department, type, description, avg_attendance_rate, event_frequency)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Innovators & Visionaries Club (IVC)',
    'Cpu',
    '2025-2026',
    'Strictly Technical Execution & Innovation',
    'technical',
    'Driving cutting-edge breakthroughs in IoT, aerospace tech, hardware automation, and deep embedded systems.',
    94,
    5
),
(
    '22222222-2222-2222-2222-222222222222',
    'Binary Beasts coding Club',
    'Code2',
    '2025-2026',
    'Advanced Competitive Programming & Algorithmic Excellence',
    'technical',
    'Empowering developers with web3 architectures, data structure execution, and top-tier algorithmic training.',
    89,
    6
),
(
    '33333333-3333-3333-3333-333333333333',
    'Zenith Cultural Crew',
    'Music',
    '2025-2026',
    'Creative & Performing Arts Synchronization',
    'cultural',
    'Integrating cultural rhythm and theatrical expression across regional, national, and international stages.',
    97,
    4
),
(
    '44444444-4444-4444-4444-444444444444',
    'Strikers Football Club',
    'Trophy',
    '2025-2026',
    'Institutional Athletics & Varsity Sports',
    'sports',
    'Cultivating relentless athletic discipline, strategy, and tournament-winning football coordination.',
    91,
    3
)
ON CONFLICT (id) DO NOTHING;

-- 4.2 Seed Campus Events
INSERT INTO public.campus_events (id, club_id, title, description, date, time, status, venue, attendance_rate)
VALUES
-- IVC Events
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'IoT & Edge Computing Hackathon', 'A 36-hour physical build marathon crafting edge solutions.', '30/05/2026', '09:00 AM', 'live', 'Embedded Labs A & B', NULL),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Drone Dynamics Workshop', 'Practical autonomous flight path scheduling using AI algorithms.', '04/06/2026', '11:00 AM', 'upcoming', 'Open Grounds / Seminar Hall 2', NULL),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'RFID Access Systems Panel', 'Analysis of hardware-level RFID tap validation systems.', '15/05/2026', '02:00 PM', 'completed', 'Auditorium 1', 94),

-- Binary Beasts Events
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Introduction to Web3', 'Exploring Ethereum Virtual Machine and decentralized web client sync.', '29/05/2026', '03:00 PM', 'live', 'Computer Center 3', NULL),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Algorithmic CodeQuest 2026', 'High-speed data structures and dynamic programming competition.', '10/06/2026', '10:00 AM', 'upcoming', 'Coding Labs A & B', NULL),

-- Zenith Cultural Events
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Symphony of Lights Prep', 'Auditions and practices for the upcoming Annual Cultural Fest.', '02/06/2026', '04:30 PM', 'upcoming', 'Open Air Theatre', NULL),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Street Play Marathon', 'A dramatic presentation focusing on social engineering issues.', '12/05/2026', '01:30 PM', 'completed', 'Quadrangle Dome', 97),

-- Strikers Events
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Inter-Department Football Selections', 'Physical selection trials for the upcoming VTU state tournament.', '29/05/2026', '07:00 AM', 'live', 'Sports Arena Field 1', NULL),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Athletic Endurance Training', 'Synchronized strength & sprint marathon for varsity recruits.', '05/06/2026', '06:00 AM', 'upcoming', 'Campus Running Track', NULL)
ON CONFLICT (id) DO NOTHING;
