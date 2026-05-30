'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const SupabaseAuthContext = createContext<AuthContextType | null>(null);

export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        // Fetch active session securely using getUser() (not getSession) on mount
        const initSession = async () => {
            try {
                const { data: { user: activeUser }, error } = await supabase.auth.getUser();
                if (!error && activeUser) {
                    setUser(activeUser);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("Auth session initialization error:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initSession();

        // Register listener for authentication lifecycle events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[Supabase Auth Event] Event: ${event}`);

            switch (event) {
                case 'SIGNED_IN':
                case 'TOKEN_REFRESHED':
                    if (session?.user) {
                        setUser(session.user);
                    }
                    break;
                case 'SIGNED_OUT':
                    setUser(null);
                    // Clear state and force redirect to login
                    router.refresh();
                    router.push('/login');
                    break;
                case 'USER_UPDATED':
                    if (session?.user) {
                        setUser(session.user);
                    }
                    break;
                default:
                    break;
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, router]);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            router.refresh();
            router.push('/login');
        } catch (error) {
            console.error("Sign out execution failed:", error);
            setUser(null);
            router.push('/login');
        }
    };

    return (
        <SupabaseAuthContext.Provider value={{ user, loading, signOut }}>
            {!loading && children}
        </SupabaseAuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(SupabaseAuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a SupabaseAuthProvider');
    }
    return context;
};
