import { createBrowserClient } from '@supabase/ssr';

// CRITICAL SECURITY ASSERTION: Stop execution if service_role key leaks to the client bundle
if (typeof window !== 'undefined' && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)) {
    throw new Error(
        "CRITICAL SECURITY CRISIS: The sensitive SUPABASE_SERVICE_ROLE_KEY has leaked to the client browser bundle! " +
        "Ensure it is strictly placed in your server environment and does not carry the NEXT_PUBLIC_ prefix."
    );
}

// Custom cookie-based storage for the browser client to avoid using localStorage
const customSecureStorage = {
    getItem: (key: string): string | null => {
        if (typeof document === 'undefined') return null;
        const value = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${key}=`))
            ?.split('=')[1];
        return value ? decodeURIComponent(value) : null;
    },
    setItem: (key: string, value: string): void => {
        if (typeof document === 'undefined') return;
        const isSecure = window.location.protocol === 'https:';
        // Securely write cookie with SameSite=Lax and optional Secure attribute
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax${isSecure ? '; Secure' : ''}`;
    },
    removeItem: (key: string): void => {
        if (typeof document === 'undefined') return;
        const isSecure = window.location.protocol === 'https:';
        document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax${isSecure ? '; Secure' : ''}`;
    }
};

/**
 * Creates a robust mock Supabase client to prevent "Failed to Fetch" errors 
 * and support elegant, full-featured offline demonstration mode.
 */
const createMockClient = () => {
    const mockUser = {
        id: 'mock-supabase-user-id',
        email: 'student@college.edu',
        user_metadata: { role: 'student' },
        aud: 'authenticated',
        role: 'authenticated',
    };

    const mockClubs = [
        {
            id: '11111111-1111-1111-1111-111111111111',
            name: 'Innovators & Visionaries Club (IVC)',
            logo: 'Cpu',
            batch_year: '2025-2026',
            department: 'Strictly Technical Execution & Innovation',
            type: 'technical',
            description: 'Driving cutting-edge breakthroughs in IoT, aerospace tech, hardware automation, and deep embedded systems.',
            avg_attendance_rate: 94,
            event_frequency: 5
        },
        {
            id: '22222222-2222-2222-2222-222222222222',
            name: 'Binary Beasts Coding Club',
            logo: 'Code2',
            batch_year: '2025-2026',
            department: 'Advanced Competitive Programming & Algorithmic Excellence',
            type: 'technical',
            description: 'Empowering developers with web3 architectures, data structure execution, and top-tier algorithmic training.',
            avg_attendance_rate: 89,
            event_frequency: 6
        },
        {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'Zenith Cultural Crew',
            logo: 'Music',
            batch_year: '2025-2026',
            department: 'Creative & Performing Arts Synchronization',
            type: 'cultural',
            description: 'Integrating cultural rhythm and theatrical expression across regional, national, and international stages.',
            avg_attendance_rate: 97,
            event_frequency: 4
        },
        {
            id: '44444444-4444-4444-4444-444444444444',
            name: 'Strikers Football Club',
            logo: 'Trophy',
            batch_year: '2025-2026',
            department: 'Institutional Athletics & Varsity Sports',
            type: 'sports',
            description: 'Cultivating relentless athletic discipline, strategy, and tournament-winning football coordination.',
            avg_attendance_rate: 91,
            event_frequency: 3
        }
    ];

    const mockEvents = [
        { id: 'e1', club_id: '11111111-1111-1111-1111-111111111111', title: 'IoT & Edge Computing Hackathon', description: 'A 36-hour physical build marathon crafting edge solutions.', date: '30/05/2026', time: '09:00 AM', status: 'live', venue: 'Embedded Labs A & B', attendance_rate: null },
        { id: 'e2', club_id: '11111111-1111-1111-1111-111111111111', title: 'Drone Dynamics Workshop', description: 'Practical autonomous flight path scheduling using AI algorithms.', date: '04/06/2026', time: '11:00 AM', status: 'upcoming', venue: 'Open Grounds / Seminar Hall 2', attendance_rate: null },
        { id: 'e3', club_id: '11111111-1111-1111-1111-111111111111', title: 'RFID Access Systems Panel', description: 'Analysis of hardware-level RFID tap validation systems.', date: '15/05/2026', time: '02:00 PM', status: 'completed', venue: 'Auditorium 1', attendance_rate: 94 },

        { id: 'e4', club_id: '22222222-2222-2222-2222-222222222222', title: 'Introduction to Web3', description: 'Exploring Ethereum Virtual Machine and decentralized web client sync.', date: '29/05/2026', time: '03:00 PM', status: 'live', venue: 'Computer Center 3', attendance_rate: null },
        { id: 'e5', club_id: '22222222-2222-2222-2222-222222222222', title: 'Algorithmic CodeQuest 2026', description: 'High-speed data structures and dynamic programming competition.', date: '10/06/2026', time: '10:00 AM', status: 'upcoming', venue: 'Coding Labs A & B', attendance_rate: null },

        { id: 'e6', club_id: '33333333-3333-3333-3333-333333333333', title: 'Symphony of Lights Prep', description: 'Auditions and practices for the upcoming Annual Cultural Fest.', date: '02/06/2026', time: '04:30 PM', status: 'upcoming', venue: 'Open Air Theatre', attendance_rate: null },
        { id: 'e7', club_id: '33333333-3333-3333-3333-333333333333', title: 'Street Play Marathon', description: 'A dramatic presentation focusing on social engineering issues.', date: '12/05/2026', time: '01:30 PM', status: 'completed', venue: 'Quadrangle Dome', attendance_rate: 97 },

        { id: 'e8', club_id: '44444444-4444-4444-4444-444444444444', title: 'Inter-Department Football Selections', description: 'Physical selection trials for the upcoming VTU state tournament.', date: '29/05/2026', time: '07:00 AM', status: 'live', venue: 'Sports Arena Field 1', attendance_rate: null },
        { id: 'e9', club_id: '44444444-4444-4444-4444-444444444444', title: 'Athletic Endurance Training', description: 'Synchronized strength & sprint marathon for varsity recruits.', date: '05/06/2026', time: '06:00 AM', status: 'upcoming', venue: 'Campus Running Track', attendance_rate: null }
    ];

    return {
        auth: {
            signInWithPassword: async ({ email, password }: any) => {
                console.log("%c[Supabase Mock Client] signInWithPassword called", "color: #818cf8; font-weight: bold;", { email });
                return { data: { user: { ...mockUser, email } }, error: null };
            },
            signUp: async ({ email, password, options }: any) => {
                console.log("%c[Supabase Mock Client] signUp called", "color: #818cf8; font-weight: bold;", { email, options });
                return { data: { user: { ...mockUser, email, user_metadata: options?.data || {} } }, error: null };
            },
            signOut: async () => {
                console.log("%c[Supabase Mock Client] signOut called", "color: #818cf8; font-weight: bold;");
                return { error: null };
            },
            getUser: async () => {
                return { data: { user: mockUser }, error: null };
            },
            onAuthStateChange: (callback: any) => {
                console.log("%c[Supabase Mock Client] Registered auth state listener", "color: #818cf8;");
                // Invoke callback asynchronously to mock normal session verification
                setTimeout(() => {
                    callback('SIGNED_IN', { user: mockUser });
                }, 10);
                return {
                    data: {
                        subscription: {
                            unsubscribe: () => {
                                console.log("%c[Supabase Mock Client] Unsubscribed from auth changes", "color: #818cf8;");
                            }
                        }
                    }
                };
            },
            mfa: {
                getAuthenticatorAssuranceLevel: async () => {
                    return { data: { currentLevel: 'aal1', nextLevel: 'aal1' }, error: null };
                }
            }
        },
        from: (table: string) => {
            console.log(`%c[Supabase Mock Client] DB Query -> Table: ${table}`, "color: #34d399;");
            let filterField: string | null = null;
            let filterValue: any = null;

            const mockQueryBuilder = {
                select: () => mockQueryBuilder,
                insert: () => mockQueryBuilder,
                update: () => mockQueryBuilder,
                delete: () => mockQueryBuilder,
                eq: (field: string, val: any) => {
                    filterField = field;
                    filterValue = val;
                    return mockQueryBuilder;
                },
                order: () => mockQueryBuilder,
                or: () => mockQueryBuilder,
                limit: () => mockQueryBuilder,
                range: () => mockQueryBuilder,
                single: async () => {
                    let result: any = {};
                    if (table === 'clubs') {
                        result = mockClubs[0];
                    } else if (table === 'profiles') {
                        result = { id: 'mock-supabase-user-id', role: 'student', college: 'college.edu' };
                    }
                    return { data: result, error: null };
                },
                then: (onfulfilled: any) => {
                    let result: any[] = [];
                    if (table === 'clubs') {
                        result = mockClubs;
                    } else if (table === 'campus_events') {
                        result = mockEvents;
                        if (filterField === 'club_id' && filterValue) {
                            result = mockEvents.filter(e => e.club_id === filterValue);
                        }
                    }
                    return Promise.resolve({ data: result, error: null }).then(onfulfilled);
                }
            };
            return mockQueryBuilder;
        },
        channel: (name: string) => {
            console.log(`%c[Supabase Mock Client] Channel Subscription -> ${name}`, "color: #fb7185;");
            return {
                on: () => { return { subscribe: () => {} }; },
                subscribe: () => {}
            };
        },
        removeChannel: (channel: any) => {
            console.log("%c[Supabase Mock Client] Removed subscription channel", "color: #fb7185;");
        },
        storage: {
            from: (bucket: string) => {
                return {
                    upload: async (path: string, file: any) => {
                        console.log(`%c[Supabase Mock Client] Upload to bucket: ${bucket}, path: ${path}`, "color: #fbbf24;");
                        return { data: { path }, error: null };
                    },
                    getPublicUrl: (path: string) => {
                        return { data: { publicUrl: `https://mockproject.supabase.co/storage/v1/object/public/${bucket}/${path}` } };
                    }
                };
            }
        }
    } as any;
};

export const createClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_SUPABASE === 'true';
    if (useMock || url.includes('mockproject.supabase.co') || !url) {
        return createMockClient();
    }

    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: false, // Prevents default auto-saving to localStorage
                storage: customSecureStorage,
                detectSessionInUrl: true
            }
        }
    );
};

