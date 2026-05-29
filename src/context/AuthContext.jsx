'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setAccessToken } from '../services/api';
import { mockBackend } from '../services/mockBackend';
import { createClient } from '../utils/supabase/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        // Check active session using refresh token cookie or mock cookie on mount
        const checkAuth = async () => {
            try {
                // Check if mock user cookie is active
                const getCookie = (name) => {
                    if (typeof document === 'undefined') return null;
                    const value = `; ${document.cookie}`;
                    const parts = value.split(`; ${name}=`);
                    if (parts.length === 2) return parts.pop().split(';').shift();
                    return null;
                };

                const mockCookie = getCookie('mock-user');
                if (mockCookie) {
                    try {
                        const parsed = JSON.parse(decodeURIComponent(mockCookie));
                        setUser(parsed);
                        setLoading(false);
                        return;
                    } catch (e) {
                        // ignore malformed cookie
                    }
                }

                const data = await authAPI.refresh();
                if (data && data.accessToken) {
                    setAccessToken(data.accessToken);
                    setUser(data.user);
                }
            } catch (error) {
                console.log("No active session detected.");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Helper to run background Supabase login/signup
    const handleSupabaseBackgroundAuth = async (email, password, role) => {
        try {
            let supabaseEmail = email;
            let supabasePassword = password;

            // Map mock users to college.edu domains for trigger validation
            if (email === '1') {
                supabaseEmail = 'student@college.edu';
                supabasePassword = 'Password123!';
            } else if (email === '2') {
                supabaseEmail = 'teacher@college.edu';
                supabasePassword = 'Password123!';
            } else if (email === '3') {
                supabaseEmail = 'parent@college.edu';
                supabasePassword = 'Password123!';
            } else if (email === '4' || email === 'admin') {
                supabaseEmail = 'admin@college.edu';
                supabasePassword = 'Password123!';
            } else {
                supabaseEmail = email;
                supabasePassword = password;
            }

            // Attempt to login to Supabase
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: supabaseEmail,
                password: supabasePassword
            });

            if (signInError) {
                // If login fails (user doesn't exist), attempt auto-signup
                if (signInError.message.includes('Invalid login credentials') || signInError.message.includes('User not found')) {
                    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                        email: supabaseEmail,
                        password: supabasePassword,
                        options: {
                            data: {
                                role: role || 'student'
                            }
                        }
                    });

                    if (!signUpError && signUpData?.user) {
                        // Auto login after signup
                        await supabase.auth.signInWithPassword({
                            email: supabaseEmail,
                            password: supabasePassword
                        });
                    }
                }
            }
        } catch (err) {
            console.warn("Background Supabase auth sync warning:", err);
        }
    };

    const login = async (rawEmail, rawPassword) => {
        const email = (rawEmail || '').trim();
        const password = (rawPassword || '').trim();

        // Helper to set mock cookie
        const setMockCookie = (userData) => {
            if (typeof document !== 'undefined') {
                const isSecure = window.location.protocol === 'https:';
                document.cookie = `mock-user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=3600; SameSite=Lax${isSecure ? '; Secure' : ''}`;
            }
        };

        const cleanEmail = typeof email === 'string' ? email.trim() : email;
        const cleanPassword = typeof password === 'string' ? password.trim() : password;

        // NEW VVCE Accounts Bypasses
        if (cleanEmail === 'bk@vvce' && cleanPassword === 'bk') {
            const mockUser = {
                _id: '00000000-0000-0000-0000-000000000001',
                id: '00000000-0000-0000-0000-000000000001',
                name: 'bharath kumar a',
                email: 'bk@vvce',
                role: 'student',
                usn: '4VV25EC001'
            };
            setMockCookie(mockUser);
            setAccessToken('mock-token-bk');
            setUser(mockUser);
            handleSupabaseBackgroundAuth(cleanEmail, cleanPassword, 'student').catch(() => {});
            return { success: true, user: mockUser };
        }

        if (cleanEmail === 'bp@vvce' && cleanPassword === 'bp') {
            const mockUser = {
                _id: '00000000-0000-0000-0000-000000000008',
                id: '00000000-0000-0000-0000-000000000008',
                name: 'bharath p',
                email: 'bp@vvce',
                role: 'student',
                usn: '4VV25EC008'
            };
            setMockCookie(mockUser);
            setAccessToken('mock-token-bp');
            setUser(mockUser);
            handleSupabaseBackgroundAuth(cleanEmail, cleanPassword, 'student').catch(() => {});
            return { success: true, user: mockUser };
        }

        if (cleanEmail === 'ananya@vvce' && cleanPassword === 'ananya') {
            const mockUser = {
                _id: '00000000-0000-0000-0000-000000000002',
                id: '00000000-0000-0000-0000-000000000002',
                name: 'ananya yk',
                email: 'ananya@vvce',
                role: 'student',
                usn: '4VV25EC012'
            };
            setMockCookie(mockUser);
            setAccessToken('mock-token-ananya');
            setUser(mockUser);
            handleSupabaseBackgroundAuth(cleanEmail, cleanPassword, 'student').catch(() => {});
            return { success: true, user: mockUser };
        }

        if (cleanEmail === 'anagha@vvce' && cleanPassword === 'anagha') {
            const mockUser = {
                _id: '00000000-0000-0000-0000-000000000009',
                id: '00000000-0000-0000-0000-000000000009',
                name: 'anagha',
                email: 'anagha@vvce',
                role: 'student',
                usn: '4VV25EC003'
            };
            setMockCookie(mockUser);
            setAccessToken('mock-token-anagha');
            setUser(mockUser);
            handleSupabaseBackgroundAuth(cleanEmail, cleanPassword, 'student').catch(() => {});
            return { success: true, user: mockUser };
        }

        if (cleanEmail === 'riddhi@vvce' && cleanPassword === 'riddhi') {
            const mockUser = {
                _id: '00000000-0000-0000-0000-000000000003',
                id: '00000000-0000-0000-0000-000000000003',
                name: 'riddhi',
                email: 'riddhi@vvce',
                role: 'student',
                usn: '4VV25EC099'
            };
            setMockCookie(mockUser);
            setAccessToken('mock-token-riddhi');
            setUser(mockUser);
            handleSupabaseBackgroundAuth(cleanEmail, cleanPassword, 'student').catch(() => {});
            return { success: true, user: mockUser };
        }

        if (cleanEmail === 'bhav@vvce' && cleanPassword === 'bhav') {
            const mockUser = {
                _id: '00000000-0000-0000-0000-000000000004',
                id: '00000000-0000-0000-0000-000000000004',
                name: 'bhavana',
                email: 'bhav@vvce',
                role: 'teacher',
                isClassTeacher: true,
                assignedSection: 'ECE-2A'
            };
            setMockCookie(mockUser);
            setAccessToken('mock-token-bhav');
            setUser(mockUser);
            handleSupabaseBackgroundAuth(cleanEmail, cleanPassword, 'teacher').catch(() => {});
            return { success: true, user: mockUser };
        }

        if (cleanEmail === 'abhi@vvce' && cleanPassword === 'abhi') {
            const mockUser = {
                _id: '00000000-0000-0000-0000-000000000005',
                id: '00000000-0000-0000-0000-000000000005',
                name: 'abhi',
                email: 'abhi@vvce',
                role: 'parent',
                childEmail: 'ananya@vvce',
                childId: '00000000-0000-0000-0000-000000000002'
            };
            setMockCookie(mockUser);
            setAccessToken('mock-token-abhi');
            setUser(mockUser);
            handleSupabaseBackgroundAuth(cleanEmail, cleanPassword, 'parent').catch(() => {});
            return { success: true, user: mockUser };
        }

        if (cleanEmail === 'preksha@vvce' && cleanPassword === 'preksha') {
            const mockUser = {
                _id: '00000000-0000-0000-0000-000000000006',
                id: '00000000-0000-0000-0000-000000000006',
                name: 'preksha',
                email: 'preksha@vvce',
                role: 'parent',
                childEmail: 'ananya@vvce',
                childId: '00000000-0000-0000-0000-000000000002'
            };
            setMockCookie(mockUser);
            setAccessToken('mock-token-preksha');
            setUser(mockUser);
            handleSupabaseBackgroundAuth(cleanEmail, cleanPassword, 'parent').catch(() => {});
            return { success: true, user: mockUser };
        }

        // Simplified Login for Demo/Testing
        if (cleanEmail === '1' && cleanPassword === '1') {
            const mockStudent = {
                _id: 'mock-student-id',
                name: 'Demo Student',
                email: 'student@college.edu',
                role: 'student',
                usn: '4VV25EC001'
            };
            setMockCookie(mockStudent);
            setAccessToken('mock-token-student');
            setUser(mockStudent);
            handleSupabaseBackgroundAuth(cleanEmail, cleanPassword, 'student').catch(() => {});
            return { success: true, user: mockStudent };
        }

        if (cleanEmail === '2' && cleanPassword === '2') {
            const mockTeacher = {
                _id: 'mock-teacher-id',
                name: 'Demo Teacher',
                email: 'teacher@college.edu',
                role: 'teacher',
                isClassTeacher: true,
                assignedSection: 'ECE-2A'
            };
            setMockCookie(mockTeacher);
            setAccessToken('mock-token-teacher');
            setUser(mockTeacher);
            handleSupabaseBackgroundAuth(cleanEmail, cleanPassword, 'teacher').catch(() => {});
            return { success: true, user: mockTeacher };
        }

        if (cleanEmail === '3' && cleanPassword === '3') {
            const mockParent = {
                _id: 'mock-parent-id',
                name: 'Demo Parent',
                email: 'parent@college.edu',
                role: 'parent',
                childEmail: 'student@college.edu', // default mock student child
                childId: 'mock-student-id'
            };
            setMockCookie(mockParent);
            setAccessToken('mock-token-parent');
            setUser(mockParent);
            handleSupabaseBackgroundAuth(cleanEmail, cleanPassword, 'parent').catch(() => {});
            return { success: true, user: mockParent };
        }

        if ((email === 'admin@vvce' && password === 'admin') || (email === 'admin' && password === 'admin') || (email === '4' && password === '4')) {
            const mockAdmin = {
                _id: '00000000-0000-0000-0000-000000000007',
                id: '00000000-0000-0000-0000-000000000007',
                name: 'Dean Admin',
                email: 'admin@vvce',
                role: 'admin'
            };
            setMockCookie(mockAdmin);
            setAccessToken('mock-token-admin');
            setUser(mockAdmin);
            await handleSupabaseBackgroundAuth(email, password, 'admin');
            return { success: true };
        }

        try {
            // Try Real API first
            const data = await authAPI.login(cleanEmail, cleanPassword);
            const userData = {
                _id: data.user._id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                usn: data.user.usn || '4VV25EC032'
            };
            setAccessToken(data.accessToken);
            setUser(userData);
            handleSupabaseBackgroundAuth(cleanEmail, cleanPassword, data.user.role).catch(() => {});
            return { success: true, user: userData };
        } catch (error) {
            // Fallback to Mock Backend for Demo
            console.warn("API Login failed, using Mock Backend fallback", error.message);
            try {
                const mockResult = await mockBackend.login(cleanEmail, cleanPassword);
                const userData = {
                    _id: mockResult.user.id,
                    name: mockResult.user.name,
                    email: mockResult.user.email,
                    role: mockResult.user.role,
                    usn: '4VV25EC032',
                    isClassTeacher: mockResult.user.isClassTeacher || false,
                    assignedSection: mockResult.user.assignedSection || null
                };
                setMockCookie(userData);
                setAccessToken(mockResult.token);
                setUser(userData);
                handleSupabaseBackgroundAuth(cleanEmail, cleanPassword, mockResult.user.role).catch(() => {});
                return { success: true, user: userData };
            } catch (mockError) {
                return { success: false, error: mockError.message };
            }
        }
    };

    const register = async (userData) => {
        try {
            const data = await authAPI.register(userData);
            setAccessToken(data.accessToken);
            const registeredUser = {
                _id: data.user._id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role
            };
            setUser(registeredUser);
            await handleSupabaseBackgroundAuth(userData.email, userData.password, userData.role);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            // Clear mock cookie
            if (typeof document !== 'undefined') {
                const isSecure = window.location.protocol === 'https:';
                document.cookie = `mock-user=; path=/; max-age=0; SameSite=Lax${isSecure ? '; Secure' : ''}`;
            }
            await supabase.auth.signOut();
            await authAPI.logout();
        } catch (error) {
            console.warn("API logout handled or bypassed:", error.message || error);
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
