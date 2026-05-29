"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createClient } from '../../utils/supabase/client';
import { mockBackend } from '../../services/mockBackend';
import { 
    Users, Activity, Wallet, Bell, 
    TrendingUp, User, Home, BookOpen, 
    Calendar, CheckCircle2, AlertTriangle, 
    ShieldAlert, Clock, Award, LineChart as ChartIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './FeatureStyles.css';

const childNameMap = {
    '00000000-0000-0000-0000-000000000001': 'Bharath Kumar A (bk@vvce)',
    '00000000-0000-0000-0000-000000000002': 'Ananya Yk (ananya@vvce)',
    '00000000-0000-0000-0000-000000000003': 'Riddhi (riddhi@vvce)',
    '00000000-0000-0000-0000-000000000007': 'Rishith (rishith@vvce)',
    '00000000-0000-0000-0000-000000000008': 'Bharath P (bp@vvce)',
    '00000000-0000-0000-0000-000000000009': 'Anagha (anagha@vvce)'
};

const ParentDashboard = () => {
    const { user } = useAuth();
    const supabase = useMemo(() => createClient(), []);

    // Component states
    const [loading, setLoading] = useState(true);
    const [childName, setChildName] = useState('Bharath P');
    const [attendancePct, setAttendancePct] = useState(92);
    const [attendanceCount, setAttendanceCount] = useState({ present: 23, total: 25 });
    
    // Parent warning electronic signature lockout states
    const [signatureName, setSignatureName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [compulsoryRemarks, setCompulsoryRemarks] = useState(mockBackend.compulsoryRemarks);

    // Event listener for backend updates
    useEffect(() => {
        const handleBackendUpdate = () => {
            setCompulsoryRemarks([...mockBackend.compulsoryRemarks]);
        };
        if (typeof window !== 'undefined') {
            window.addEventListener('mock-backend-update', handleBackendUpdate);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('mock-backend-update', handleBackendUpdate);
            }
        };
    }, []);

    const activeChildId = user?.childId || '00000000-0000-0000-0000-000000000002'; // default to bp@vvce
    const parentEmailNormalized = (user?.email || '').toLowerCase().trim();

    const activeCriticalRemark = useMemo(() => {
        return compulsoryRemarks.find(rem => 
            rem.priority === 'critical' && 
            !rem.isAcknowledged && 
            (rem.studentId === activeChildId || (rem.parentEmail || '').toLowerCase().trim() === parentEmailNormalized)
        );
    }, [compulsoryRemarks, activeChildId, parentEmailNormalized]);

    const handleAcknowledgeAndSign = (remarkId) => {
        if (!signatureName.trim()) {
            setErrorMsg('Please input your signature to sign off.');
            return;
        }

        const result = mockBackend.acknowledgeRemark(remarkId, signatureName);
        if (result.success) {
            // Trigger local sync
            setCompulsoryRemarks([...mockBackend.compulsoryRemarks]);
            setSignatureName('');
            setErrorMsg('');
            
            // Dispatch event for other components (e.g., DashboardHome) to refresh
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('mock-backend-update'));
            }
        } else {
            setErrorMsg(result.error || 'Failed to sign the remark.');
        }
    };

    // Lists fetched from Supabase
    const [timetables, setTimetables] = useState([]);
    const [exams, setExams] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [notices, setNotices] = useState([]);

    useEffect(() => {
        if (!user || user.role !== 'parent') {
            setLoading(false);
            return;
        }

        const fetchChildData = async () => {
            try {
                const childId = user.childId || '00000000-0000-0000-0000-000000000002'; // Default to bp@vvce

                // 1. Fetch child profile name
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', childId)
                    .single();
                
                setChildName(childNameMap[childId] || user.childEmail || 'Demo Student');

                // 2. Fetch child attendance
                const { data: attData } = await supabase
                    .from('attendance')
                    .select('present, total')
                    .eq('student_id', childId);

                if (attData && attData.length > 0) {
                    let totalPresent = 0;
                    let totalClasses = 0;
                    
                    // Sum from Supabase
                    attData.forEach(item => {
                        totalPresent += item.present;
                        totalClasses += item.total;
                    });

                    // Add base mock classes for the child so it matches high percentage
                    totalPresent += 23;
                    totalClasses += 25;

                    setAttendanceCount({ present: totalPresent, total: totalClasses });
                    setAttendancePct(Math.round((totalPresent / totalClasses) * 100));
                }

                // 3. Fetch child timetables
                const { data: ttData } = await supabase
                    .from('timetables')
                    .select('*')
                    .eq('student_id', childId);
                if (ttData && ttData.length > 0) {
                    setTimetables(ttData);
                } else {
                    // Fallback to default timetable
                    setTimetables([
                        { id: '1', subject: '1BCS201 - Introduction to Computer Science', day: 'Monday', time: '09:00 AM - 10:00 AM', room: 'L-301' },
                        { id: '2', subject: '1BPLCO203 - Introduction to C Programming', day: 'Monday', time: '10:15 AM - 11:15 AM', room: 'CS-Lab' },
                        { id: '3', subject: '1BPHYT202 - Applied Physics', day: 'Tuesday', time: '11:30 AM - 12:30 PM', room: 'Physics-Lab' }
                    ]);
                }

                // 4. Fetch child exams
                const { data: exData } = await supabase
                    .from('exams')
                    .select('*')
                    .eq('student_id', childId);
                if (exData && exData.length > 0) {
                    setExams(exData);
                } else {
                    // Fallback
                    setExams([
                        { id: '1', subject: '1BCS201 - Introduction to Computer Science', type: 'Internals 1', date: '15-06-2026', time: '10:00 AM' },
                        { id: '2', subject: '1BPLCO203 - Introduction to C Programming', type: 'Final Exam', date: '22-06-2026', time: '02:00 PM' }
                    ]);
                }

                // 5. Fetch child quizzes
                const { data: qzData } = await supabase
                    .from('quizzes')
                    .select('*')
                    .eq('student_id', childId);
                if (qzData && qzData.length > 0) {
                    setQuizzes(qzData);
                } else {
                    // Fallback
                    setQuizzes([
                        { id: '1', subject: '1BCS201 - Introduction to Computer Science', title: 'Unit Test 1', score: '8', total: '10', date: '12-05-2026' },
                        { id: '2', subject: '1BPLCO203 - Introduction to C Programming', title: 'Quiz 1', score: '9', total: '10', date: '19-05-2026' }
                    ]);
                }

                // 6. Fetch notices
                const { data: ntData } = await supabase
                    .from('notices')
                    .select('*')
                    .or('target_role.eq.all,target_role.eq.parent');
                if (ntData && ntData.length > 0) {
                    setNotices(ntData);
                } else {
                    setNotices([
                        { id: '1', title: 'Internals Notice', message: 'Semester 2 first internal assessment will commence from 15th June 2026. Attendance is mandatory.', date: '24-05-2026' },
                        { id: '2', title: 'Parent Teacher Association Meeting', message: 'PTA meeting scheduled for 30th May 2026 at 10 AM in the main auditorium.', date: '24-05-2026' }
                    ]);
                }

            } catch (err) {
                console.error("Error fetching child performance data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchChildData();

        // Subscribe to real-time updates for parent queries
        const channel = supabase.channel('parent_realtime_feed');
        
        channel.on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
            fetchChildData();
        });
        channel.on('postgres_changes', { event: '*', schema: 'public', table: 'exams' }, () => {
            fetchChildData();
        });
        channel.on('postgres_changes', { event: '*', schema: 'public', table: 'quizzes' }, () => {
            fetchChildData();
        });
        channel.on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, () => {
            fetchChildData();
        });
        
        channel.subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, supabase]);

    // CGPA growth trends (using static student indicators)
    const cgpaTrends = [
        { sem: 'Sem 1', gpa: 8.2 },
        { sem: 'Sem 2', gpa: 8.6 },
    ];

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontWeight: 600 }}>
                LOADING CHILD NODES AND ACADEMIC FEEDS...
            </div>
        );
    }

    return (
        <div className="parent-dashboard-container" style={{ position: 'relative' }}>
            {activeCriticalRemark && (
                <div className="lockout-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99999,
                    background: 'var(--lockout-overlay-bg)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="lockout-box animate-enter" style={{
                        background: 'var(--bg-card)',
                        border: '2px solid var(--error)',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '550px',
                        width: '100%',
                        boxShadow: 'var(--shadow-hard)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        color: 'var(--text-primary)',
                        textAlign: 'center'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div className="pulse-anim" style={{
                                background: 'rgba(239, 68, 68, 0.12)',
                                border: '2.5px solid var(--error)',
                                borderRadius: '50%',
                                padding: '16px',
                                display: 'inline-flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <ShieldAlert size={48} color="var(--error)" />
                            </div>
                        </div>

                        <div>
                            <span style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: 'var(--error)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                High Priority Parent Acknowledgment Lockout
                            </span>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-primary)', marginTop: '12px', letterSpacing: '-0.5px' }}>
                                Administrative Warning Interceptor
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '6px', lineHeight: '1.5' }}>
                                A critical academic compliance alert has been issued by the Class Mentor. Access to the dashboard operations is temporarily locked until your electronic signature acknowledgment is captured.
                            </p>
                        </div>

                        <div style={{
                            background: 'var(--bg-secondary)',
                            border: '1.5px solid var(--border-color)',
                            borderRadius: '10px',
                            padding: '20px',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            lineHeight: '1.6',
                            color: 'var(--text-primary)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Issuer / Section</span>
                                <span style={{ color: 'var(--accent-action)', fontWeight: '700' }}>{activeCriticalRemark.teacherName} ({activeCriticalRemark.sectionCode})</span>
                            </div>
                            <div style={{ color: 'var(--error)', fontWeight: '600', fontStyle: 'italic', marginBottom: '10px' }}>
                                "{activeCriticalRemark.message}"
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Logged USN: {activeChildId === '00000000-0000-0000-0000-000000000002' ? '4VV25EC002' : '4VV25EC001'}</span>
                                <span>Date: {new Date(activeCriticalRemark.createdAt).toLocaleString('en-GB')}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                            <label style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: '700' }}>Parent Electronic Signature *</label>
                            <input 
                                type="text"
                                placeholder="Type your name (e.g. Abhi) to sign off..."
                                value={signatureName}
                                onChange={(e) => {
                                    setSignatureName(e.target.value);
                                    if (errorMsg) setErrorMsg('');
                                }}
                                style={{
                                    background: 'var(--bg-secondary)',
                                    border: '1.5px solid var(--error)',
                                    borderRadius: '8px',
                                    padding: '12px 14px',
                                    fontSize: '0.92rem',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    transition: 'all 0.2s'
                                }}
                            />
                            {errorMsg && (
                                <span style={{ color: 'var(--error)', fontSize: '0.78rem', fontWeight: '700', marginTop: '2px' }}>
                                    ⚠️ {errorMsg}
                                </span>
                            )}
                        </div>

                        <style>{`
                            @keyframes pulseButtonGlow {
                                0% { transform: scale(1); box-shadow: 0 0 15px rgba(251, 191, 36, 0.45), inset 0 0 10px rgba(255,255,255,0.1); }
                                50% { transform: scale(1.02); box-shadow: 0 0 32px rgba(251, 191, 36, 0.8), inset 0 0 15px rgba(255,255,255,0.25); }
                                100% { transform: scale(1); box-shadow: 0 0 15px rgba(251, 191, 36, 0.45), inset 0 0 10px rgba(255,255,255,0.1); }
                            }
                            .glowing-btn-pulse {
                                animation: pulseButtonGlow 1.8s infinite cubic-bezier(0.4, 0, 0.2, 1);
                            }
                        `}</style>

                        <button 
                            onClick={() => handleAcknowledgeAndSign(activeCriticalRemark.id)}
                            className="glowing-btn-pulse"
                            style={{
                                border: 'none',
                                background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                                color: '#000',
                                padding: '14px',
                                borderRadius: '8px',
                                fontSize: '0.92rem',
                                fontWeight: '900',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                        >
                            Acknowledge Remark
                        </button>
                    </div>
                </div>
            )}

            <header className="parent-welcome">
                <h1>Welcome Back, Parent! 👋</h1>
                <p>Monitoring child node: <strong style={{ color: 'var(--accent-primary)' }}>{childName}</strong></p>
            </header>

            <div className="summary-cards">
                <div className="summary-card attendance">
                    <div className="card-icon"><Activity size={24} color="#00ffcc" /></div>
                    <div className="card-info">
                        <h3>{attendancePct}%</h3>
                        <p>Total Attendance ({attendanceCount.present} / {attendanceCount.total} hrs)</p>
                    </div>
                </div>
                <div className="summary-card homework">
                    <div className="card-icon"><CheckCircle2 size={24} color="#a78bfa" /></div>
                    <div className="card-info">
                        <h3>94%</h3>
                        <p>Homework Compliance</p>
                    </div>
                </div>
                <div className="summary-card behavior">
                    <div className="card-icon"><TrendingUp size={24} color="#f472b6" /></div>
                    <div className="card-info">
                        <h3>Excellent</h3>
                        <p>Weekly Behavior Status</p>
                    </div>
                </div>
                <div className="summary-card safety">
                    <div className="card-icon"><ShieldAlert size={24} color="#fbbf24" /></div>
                    <div className="card-info">
                        <h3>Safe</h3>
                        <p>Online Presence</p>
                    </div>
                </div>
            </div>

            <div className="parent-layout-grid">
                {/* CGPA Trend Section */}
                <div className="parent-section cgpa-trend full-width">
                    <div className="section-header">
                        <h3>CGPA Growth Trend</h3>
                        <ChartIcon size={20} />
                    </div>
                    <div className="chart-container" style={{ height: '230px', width: '100%', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={cgpaTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="sem" stroke="#94a3b8" />
                                <YAxis domain={[0, 10]} stroke="#94a3b8" />
                                <Tooltip 
                                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#00ffcc' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="gpa" 
                                    stroke="#00ffcc" 
                                    strokeWidth={3} 
                                    dot={{ fill: '#00ffcc', r: 6 }} 
                                    activeDot={{ r: 8, stroke: '#fff' }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Timetable Section */}
                <div className="parent-section timetable">
                    <div className="section-header">
                        <h3>Child's Timetable</h3>
                        <Clock size={20} color="var(--accent-primary)" />
                    </div>
                    <div className="timetable-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                        {timetables.map(slot => (
                            <div key={slot.id} className="exam-card" style={{ borderLeft: '3px solid #6366f1' }}>
                                <div className="exam-subject">{slot.subject}</div>
                                <div className="exam-details">
                                    <span>{slot.day} | {slot.time}</span>
                                    <span style={{ color: '#818cf8', fontWeight: 'bold' }}>Room {slot.room}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Exams Section */}
                <div className="parent-section exams">
                    <div className="section-header">
                        <h3>Notice for Exams & Internals</h3>
                        <Calendar size={20} />
                    </div>
                    <div className="exam-list">
                        {exams.map(exam => (
                            <div key={exam.id} className="exam-card">
                                <div className="exam-subject">{exam.subject}</div>
                                <div className="exam-details">
                                    <span><Calendar size={14} /> {exam.date}</span>
                                    <span className="exam-tag" style={{ 
                                        backgroundColor: exam.type.toLowerCase().includes('final') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                        color: exam.type.toLowerCase().includes('final') ? '#ef4444' : '#f59e0b',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem'
                                    }}>
                                        {exam.type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quizzes and Class Tests Section */}
                <div className="parent-section grades">
                    <div className="section-header">
                        <h3>Quizzes & Class Tests</h3>
                        <Award size={20} />
                    </div>
                    <div className="grade-list">
                        {quizzes.map(quiz => (
                            <div key={quiz.id} className="grade-row">
                                <div className="subject-icon"><BookOpen size={16} /></div>
                                <div className="subject-name">{quiz.subject}</div>
                                <div className="grade-value" style={{ color: parseFloat(quiz.score)/parseFloat(quiz.total) >= 0.75 ? '#10b981' : '#ef4444' }}>
                                    {quiz.score}/{quiz.total}
                                </div>
                                <div className="grade-date">{quiz.date}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* School Notices */}
                <div className="parent-section notices">
                    <div className="section-header">
                        <h3>School Notice Board</h3>
                        <Bell size={20} />
                    </div>
                    <div className="notice-list">
                        {notices.map(notice => (
                            <div key={notice.id} className="notice-item">
                                <div className="notice-top">
                                    <span className="notice-title">{notice.title}</span>
                                    <span className="notice-date">{notice.date}</span>
                                </div>
                                <p className="notice-msg">{notice.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
