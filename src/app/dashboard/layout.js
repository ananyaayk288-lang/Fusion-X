'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { mockBackend } from '../../services/mockBackend';
import {
    BookOpen, BarChart2, FileText, Users, MessageSquare, Award,
    LogOut, Menu, X, Layout, Library, GraduationCap, Calendar,
    UserCheck, Timer, Bell, Sun, Moon, Target, Trophy, Briefcase,
    Pencil, Clock, Hash, BrainCircuit, Calculator, Activity,
    Flame, StickyNote, CheckCircle2, Shield, GitBranch, ClipboardList,
    Home, Wallet, ShieldAlert, TrendingUp, BookOpenCheck, Search, Sparkles, Sliders,
    Zap, MapPin, Radio
} from 'lucide-react';
import '../../components/layout/DashboardLayout.css';
import AIChatWidget from '../../components/layout/AIChatWidget';

import { createClient } from '../../utils/supabase/client';
import { requestNotificationPermission, registerServiceWorker, showLocalNotification } from '../../utils/notifications';

const DashboardLayout = ({ children }) => {
    const { user, logout, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [liveUnreadCount, setLiveUnreadCount] = useState(0);

    const currentView = searchParams ? searchParams.get('view') : null;

    React.useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    React.useEffect(() => {
        if (loading || !user) return;

        const initNotifications = async () => {
            // Request permissions and register service worker on mobile/desktop browsers
            await requestNotificationPermission();
            await registerServiceWorker();

            const supabase = createClient();
            
            // Get active Supabase User matching current session
            const activeUserRes = await supabase.auth.getUser();
            const actualUid = activeUserRes.data.user?.id;
            if (!actualUid) return;

            // 1. Fetch current unread notifications count
            const fetchUnread = async () => {
                const { count, error } = await supabase
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', actualUid)
                    .eq('read', false);
                if (!error && count !== null) {
                    setLiveUnreadCount(count);
                }
            };
            fetchUnread();

            // 2. Listen to real-time notification inserts targeting this user
            const channel = supabase
                .channel(`realtime_notifications_${actualUid}`)
                .on(
                    'postgres_changes',
                    { 
                        event: 'INSERT', 
                        schema: 'public', 
                        table: 'notifications',
                        filter: `user_id=eq.${actualUid}`
                    },
                    (payload) => {
                        console.log('[Realtime Notification Received]:', payload.new);
                        // Trigger native device push notification alert
                        showLocalNotification(payload.new.title, {
                            body: payload.new.message,
                            data: { url: '/dashboard/notifications' }
                        });
                        // Update unread count
                        setLiveUnreadCount(prev => prev + 1);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        const cleanupPromise = initNotifications();
        return () => {
            cleanupPromise.then(cleanup => cleanup && cleanup());
        };
    }, [user, loading]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>INITIALIZING NODE...</div>;
    }

    if (!user) {
        return null;
    }

    const studentNav = [
        { label: 'Dashboard', icon: <Layout size={20} />, path: '/dashboard' },
        { label: 'Assignment Hub', icon: <BookOpenCheck size={20} />, path: '/dashboard/assignments' },
        { label: 'Attendance List', icon: <Calendar size={20} />, path: '/dashboard/attendance' },
        { label: 'Timetable', icon: <Clock size={20} />, path: '/dashboard/timetable' },
        { label: 'Notes & PYQs', icon: <BookOpen size={20} />, path: '/dashboard/notes' },
        { type: 'divider' },
        { label: 'Doubt Solving', icon: <MessageSquare size={20} />, path: '/dashboard/doubts' },
        { label: 'Study Zone', icon: <Users size={20} />, path: '/dashboard/studyzone' },
        { label: 'Discussion Forum', icon: <Hash size={20} />, path: '/dashboard/chat' },
        { label: 'Answer Analysis', icon: <BarChart2 size={20} />, path: '/dashboard/analysis' },
        { label: 'Project Hub', icon: <GitBranch size={20} />, path: '/dashboard/projects' },
        { label: 'Prepcare', icon: <Sparkles size={20} />, path: '/dashboard/ai-bot' },
        { label: 'Clubs Hub', icon: <Trophy size={20} />, path: '/dashboard/clubs' },
        { type: 'divider' },
        { label: 'Leaderboard & XP', icon: <Trophy size={20} />, path: '/dashboard/leaderboard' },
        { label: 'Activity Feed', icon: <Activity size={20} />, path: '/dashboard/feed' },
        { label: 'CGPA Calculator', icon: <Calculator size={20} />, path: '/dashboard/cgpa' },
        { label: 'Weekly Challenges', icon: <Flame size={20} />, path: '/dashboard/challenges' },
        { label: 'Smart Exam Predictor', icon: <BrainCircuit size={20} />, path: '/dashboard/predictor' },
        { label: 'Placements & Interns', icon: <Briefcase size={20} />, path: '/dashboard/placements' },
        { label: 'Complaint Box', icon: <Shield size={20} />, path: '/dashboard/complaints' },
        { label: 'Paper Generator', icon: <ClipboardList size={20} />, path: '/dashboard/paper-generator' },
    ];

    const parentNav = [
        { label: 'Parent Dashboard', icon: <Home size={20} />, path: '/dashboard/parent-dashboard' },
        { label: 'Child Performance', icon: <TrendingUp size={20} />, path: '/dashboard/parent-dashboard' },
        { label: 'Attendance & Class', icon: <Calendar size={20} />, path: '/dashboard/attendance' },
        { type: 'divider' },
        { label: 'Finance Portal', icon: <Wallet size={20} />, path: '/dashboard/finance' },
        { label: 'Safety Monitor', icon: <ShieldAlert size={20} />, path: '/dashboard/safety' },
        { label: 'Teacher\'s Diary', icon: <BookOpenCheck size={20} />, path: '/dashboard/teachers-diary' },
        { label: 'Smart Exam Predictor', icon: <BrainCircuit size={20} />, path: '/dashboard/predictor' },
        { label: 'Clubs Hub', icon: <Trophy size={20} />, path: '/dashboard/clubs' },
    ];

    const teacherNav = [
        { label: 'Subject Portal', icon: <Layout size={20} />, path: '/dashboard?view=subject' },
        ...(user?.isClassTeacher ? [
            { label: 'Class Advisor Tower', icon: <Sliders size={20} />, path: '/dashboard?view=advisor' }
        ] : []),
        { label: 'Assignment Hub', icon: <BookOpenCheck size={20} />, path: '/dashboard/assignments' },
        { label: 'Attendance List', icon: <Calendar size={20} />, path: '/dashboard/attendance' },
        { label: 'Timetable', icon: <Clock size={20} />, path: '/dashboard/timetable' },
        { label: 'Notes & PYQs', icon: <BookOpen size={20} />, path: '/dashboard/notes' },
        { type: 'divider' },
        { label: 'Doubt Solving', icon: <MessageSquare size={20} />, path: '/dashboard/doubts' },
        { label: 'Discussion Forum', icon: <Hash size={20} />, path: '/dashboard/chat' },
        { label: 'Answer Analysis', icon: <BarChart2 size={20} />, path: '/dashboard/analysis' },
        { label: 'Project Hub', icon: <GitBranch size={20} />, path: '/dashboard/projects' },
        { label: 'Clubs Hub', icon: <Trophy size={20} />, path: '/dashboard/clubs' },
        { type: 'divider' },
        { label: 'Teacher\'s Diary', icon: <BookOpenCheck size={20} />, path: '/dashboard/teachers-diary' },
        { label: 'Paper Generator', icon: <ClipboardList size={20} />, path: '/dashboard/paper-generator' },
        { label: 'Complaint Box', icon: <Shield size={20} />, path: '/dashboard/complaints' },
    ];

    const adminNav = [
        { label: 'System Control Tower', icon: <Layout size={20} />, path: '/dashboard' },
        { label: 'AI Footfall & Proxy-Risk Audit', icon: <Calendar size={20} />, path: '/dashboard/attendance' },
        { label: 'Tech & Innovation Registry', icon: <GitBranch size={20} />, path: '/dashboard/projects' },
        { label: 'Escalation Desk', icon: <Shield size={20} />, path: '/dashboard/complaints' },
        { type: 'divider' },
        { label: 'VVCE Microgrid Optimizer', icon: <Zap size={20} />, path: '/dashboard/microgrid' },
        { label: 'Telemetry & Sensor Map', icon: <MapPin size={20} />, path: '/dashboard/telemetry' },
        { label: 'System Rules Configuration', icon: <Sliders size={20} />, path: '/dashboard/rules-config' },
        { label: 'Global Broadcast Tower', icon: <Radio size={20} />, path: '/dashboard/broadcast' },
    ];

    const navItems = user?.role === 'parent' 
        ? parentNav 
        : user?.role === 'admin'
            ? adminNav
            : user?.role === 'teacher' 
                ? teacherNav 
                : studentNav;

    const activeItem = navItems
        .filter(i => i.path)
        .find(i => {
            if (i.path.includes('?view=advisor')) {
                return pathname === '/dashboard' && currentView === 'advisor';
            }
            if (i.path.includes('?view=subject')) {
                return pathname === '/dashboard' && currentView !== 'advisor';
            }
            return pathname === i.path;
        });
    const currentLabel = activeItem?.label || 'Dashboard';

    const notifications = mockBackend.notifications || [];
    const unreadCount = (notifications.filter(n => !n.read).length) + liveUnreadCount;

    return (
        <div className="dashboard-container">
            {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

            <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-area">
                        <GraduationCap size={32} />
                        <span className="sidebar-text">Connect & Prep</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item, idx) => {
                        const isCurrentActive = (() => {
                            if (item.path?.includes('?view=advisor')) {
                                return pathname === '/dashboard' && currentView === 'advisor';
                            }
                            if (item.path?.includes('?view=subject')) {
                                return pathname === '/dashboard' && currentView !== 'advisor';
                            }
                            return pathname === item.path;
                        })();

                        return item.type === 'divider' ? (
                            <div key={`divider-${idx}`} className="nav-divider" />
                        ) : (
                            <div
                                key={`${item.path}-${idx}`}
                                className={`nav-item ${isCurrentActive ? 'active' : ''}`}
                                onClick={() => { router.push(item.path); setSidebarOpen(false); }}
                            >
                                <div className="icon-container">{item.icon}</div>
                                <span className="sidebar-text">{item.label}</span>
                            </div>
                        );
                    })}
                </nav>
            </aside>

            <main className="main-content">
                <header className="top-bar">
                    <div className="top-bar-left">
                        <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <h2 className="top-bar-title">{currentLabel}</h2>
                    </div>

                    <div className="header-right-section" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div className="search-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
                            <input 
                                type="text" 
                                placeholder="Search courses, notes..." 
                                style={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '8px 12px 8px 40px',
                                    fontSize: '0.85rem',
                                    width: '280px',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <button className="notification-btn-header" onClick={toggleTheme}>
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="notif-wrapper">
                            <button className="notification-btn-header" onClick={() => router.push('/dashboard/notifications')}>
                                <Bell size={20} />
                                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                            </button>
                        </div>

                        <div className="profile-dropdown-container">
                            <ProfileMenu user={user} logout={handleLogout} />
                        </div>
                    </div>
                </header>

                <div className="content-area">
                    {children}
                </div>
                <AIChatWidget />
            </main>
        </div>
    );
};

const ProfileMenu = ({ user, logout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    return (
        <div className="profile-menu-wrapper">
            <button className="profile-btn" onClick={() => setIsOpen(!isOpen)}>
                <div className="avatar-circle">{user?.name?.charAt(0) || 'U'}</div>
                <div className="user-text">
                    <span className="name">{user?.name || 'User'}</span>
                    <span className="role">{user?.role || 'Student'}</span>
                </div>
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-header">
                        <p className="d-name">Name: {user?.name}</p>
                        <p className="d-usn">USN: 4VV25EC032</p>
                    </div>
                    <div className="dropdown-item" onClick={() => { router.push('/dashboard/profile'); setIsOpen(false); }}>Profile</div>
                    <div className="dropdown-item logout" onClick={logout}>
                        <LogOut size={16} /> Logout
                    </div>
                </div>
            )}
            {isOpen && <div className="backdrop" onClick={() => setIsOpen(false)} />}
        </div>
    );
};

export default DashboardLayout;
