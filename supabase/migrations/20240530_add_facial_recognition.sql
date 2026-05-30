-- Migration: Replace RFID with Facial Recognition

-- 1. Drop old RFID objects
DROP TABLE IF EXISTS public.rfid_scans CASCADE;
DROP FUNCTION IF EXISTS public.process_rfid_payment(UUID, NUMERIC, TEXT);

-- 2. Create face embeddings / profiles table
CREATE TABLE IF NOT EXISTS public.face_profiles (
    student_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    descriptor JSONB NOT NULL, -- Will store the Float32Array from face-api.js as JSON array
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Camera scans table (replaces rfid_scans)
CREATE TABLE IF NOT EXISTS public.camera_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('payment', 'attendance', 'location', 'library')),
    metadata JSONB
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_camera_scans_student ON public.camera_scans(student_id);

-- 5. RLS Policies
ALTER TABLE public.face_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camera_scans ENABLE ROW LEVEL SECURITY;

-- Face Profiles Policies
DROP POLICY IF EXISTS select_all_faces ON public.face_profiles;
CREATE POLICY select_all_faces ON public.face_profiles FOR SELECT USING (true); -- everyone needs to read for matching
DROP POLICY IF EXISTS insert_own_face ON public.face_profiles;
CREATE POLICY insert_own_face ON public.face_profiles FOR INSERT WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS update_own_face ON public.face_profiles;
CREATE POLICY update_own_face ON public.face_profiles FOR UPDATE USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Camera scans policies
DROP POLICY IF EXISTS select_own_cam_scan ON public.camera_scans;
CREATE POLICY select_own_cam_scan ON public.camera_scans FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS insert_own_cam_scan ON public.camera_scans;
CREATE POLICY insert_own_cam_scan ON public.camera_scans FOR INSERT WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS teacher_read_all_cam_scans ON public.camera_scans;
CREATE POLICY teacher_read_all_cam_scans ON public.camera_scans FOR SELECT USING (public.is_teacher() OR public.is_admin());

-- 6. Stored Procedures

-- Process Face Payment
CREATE OR REPLACE FUNCTION public.process_face_payment(p_student_id UUID, p_amount NUMERIC, p_location TEXT) RETURNS VOID AS $$
DECLARE
    v_balance NUMERIC;
BEGIN
    SELECT balance INTO v_balance FROM public.wallets WHERE student_id = p_student_id FOR UPDATE;
    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'Wallet not found for student %', p_student_id;
    END IF;
    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance (%.2f) for payment of %.2f', v_balance, p_amount;
    END IF;
    
    UPDATE public.wallets SET balance = balance - p_amount, updated_at = timezone('utc'::text, now()) WHERE student_id = p_student_id;
    
    INSERT INTO public.wallet_transactions(student_id, amount, transaction_type, description)
    VALUES (p_student_id, p_amount, 'debit', CONCAT('Facial recognition payment at ', p_location));
    
    INSERT INTO public.camera_scans(student_id, location, event_type, metadata)
    VALUES (p_student_id, p_location, 'payment', jsonb_build_object('amount', p_amount));
END;
$$ LANGUAGE plpgsql;
