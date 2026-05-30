-- =========================================================================
-- PHASE 11: MISSING FEATURES RESTORATION (WALLET, LIBRARY, TRACKER)
-- =========================================================================
-- This script creates the missing tables for the RFID Wallet, 
-- Campus Tracker, and Library Borrowing features.

-- 1. Wallet Balances
CREATE TABLE IF NOT EXISTS public.wallet (
    student_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Wallet Transactions
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Library Books Inventory
CREATE TABLE IF NOT EXISTS public.library_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT,
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Library Borrowing Ledger
CREATE TABLE IF NOT EXISTS public.library_borrowing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
    borrow_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue'))
);

-- 5. Campus Tracker (Live Location Pings)
CREATE TABLE IF NOT EXISTS public.tracking_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_borrowing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_data ENABLE ROW LEVEL SECURITY;

-- For demo purposes, we will grant full access to authenticated users
-- so the dashboard charts and widgets load flawlessly.

CREATE POLICY wallet_access ON public.wallet 
    FOR ALL TO authenticated USING (true);

CREATE POLICY wallet_tx_access ON public.wallet_transactions 
    FOR ALL TO authenticated USING (true);

CREATE POLICY library_books_access ON public.library_books 
    FOR ALL TO authenticated USING (true);

CREATE POLICY library_borrowing_access ON public.library_borrowing 
    FOR ALL TO authenticated USING (true);

CREATE POLICY tracking_data_access ON public.tracking_data 
    FOR ALL TO authenticated USING (true);

-- Enable Realtime Replication for the wallet so UI updates instantly
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
    
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_data;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;
