-- Migration: Add Withdrawal Requests for Smart Campus RFID Ecosystem

-- 1. Withdrawal Requests table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.wallets(student_id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    upi_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_student ON public.withdrawal_requests(student_id);

-- 3. RLS Policies
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_own_withdrawal ON public.withdrawal_requests;
CREATE POLICY select_own_withdrawal ON public.withdrawal_requests FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS admin_manage_withdrawals ON public.withdrawal_requests;
CREATE POLICY admin_manage_withdrawals ON public.withdrawal_requests FOR ALL USING (public.is_admin());

-- 4. Stored Procedure to safely request a withdrawal
CREATE OR REPLACE FUNCTION public.request_withdrawal(p_student_id UUID, p_amount NUMERIC, p_upi_id TEXT) RETURNS UUID AS $$
DECLARE
    v_balance NUMERIC;
    v_request_id UUID;
BEGIN
    -- Acquire row lock on wallet
    SELECT balance INTO v_balance FROM public.wallets WHERE student_id = p_student_id FOR UPDATE;
    
    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'Wallet not found for student %', p_student_id;
    END IF;
    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance (%.2f) for withdrawal of %.2f', v_balance, p_amount;
    END IF;
    
    -- Update wallet balance (deduct instantly)
    UPDATE public.wallets 
    SET balance = balance - p_amount, updated_at = timezone('utc'::text, now()) 
    WHERE student_id = p_student_id;
    
    -- Log transaction
    INSERT INTO public.wallet_transactions(student_id, amount, transaction_type, description)
    VALUES (p_student_id, p_amount, 'debit', CONCAT('Withdrawal request to UPI: ', p_upi_id));
    
    -- Log withdrawal request
    INSERT INTO public.withdrawal_requests(student_id, amount, upi_id, status)
    VALUES (p_student_id, p_amount, p_upi_id, 'pending')
    RETURNING id INTO v_request_id;
    
    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql;
