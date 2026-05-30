"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { mockBackend } from '../../services/mockBackend';
import {
    BookOpen, CheckCircle, Clock, TrendingUp, Calendar, AlertCircle, Target,
    Users, ShieldAlert, Power, MessageSquare, Radio, Sparkles, Send,
    MapPin, RefreshCw, Trophy, FileText, ArrowRight, Bell, Zap, Play, Check, ShieldCheck,
    BookOpenCheck
} from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import CanteenPOS from './CanteenPOS';
import CanteenDashboard from './CanteenDashboard';
import './DashboardHome.css';
const DashboardHome = () => {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    
    if (user?.role === 'canteen') {
        const view = searchParams?.get('view');
        if (view === 'pos') {
            return <CanteenPOS />;
        }
        return <CanteenDashboard />;
    }
    // =========================================================================
    // ADMIN DASHBOARD STATES & HANDLERS
    // =========================================================================
    const [rfidActive, setRfidActive] = useState(true);
    const [rfidLogs, setRfidLogs] = useState([
        { time: '15:40:02', student: 'Bharath P (bp@vvce)', room: 'L-301 Math class', status: 'Success' },
        { time: '15:39:15', student: 'Anagha (anagha@vvce)', room: 'CS-Lab 1', status: 'Success' },
        { time: '15:37:44', student: 'Bharath Kumar (bk@vvce)', room: 'L-301 Math class', status: 'Success' }
    ]);
    const [selectedBranch, setSelectedBranch] = useState('All');
    const [selectedSem, setSelectedSem] = useState('All');
    const [selectedSection, setSelectedSection] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [activeModalTeacher, setActiveModalTeacher] = useState(null);
    const [reminderText, setReminderText] = useState('');
    // Defaulters List state (to allow dynamic "Send Warning" status updates)
    const [defaulters, setDefaulters] = useState([
        { usn: '4VV25EC002', name: 'Bharath P', branch: 'ECE', sem: '2 - Semester', section: 'A', attendance: 63.89, status: 'Active' },
        { usn: '4VV25EC015', name: 'Rohan Gowda', branch: 'ECE', sem: '2 - Semester', section: 'B', attendance: 58.20, status: 'Active' },
        { usn: '4VV25CS034', name: 'Divya R', branch: 'CSE', sem: '2 - Semester', section: 'A', attendance: 71.45, status: 'Active' },
        { usn: '4VV25ME008', name: 'Varun K', branch: 'ME', sem: '2 - Semester', section: 'B', attendance: 66.12, status: 'Active' },
        { usn: '4VV25EC003', name: 'Anagha', branch: 'ECE', sem: '1 - Semester', section: 'A', attendance: 60.00, status: 'Active' },
    ]);
    // Teacher Syllabus data state (allows active HOD actions)
    const [teachers, setTeachers] = useState([
        { id: 1, name: 'Dr. Bhavana', subject: 'Applied Mathematics II', syllabus: 85, resources: 14, grading: '2 Days', status: 'Good' },
        { id: 2, name: 'Dr. White', subject: 'Applied Physics', syllabus: 90, resources: 18, grading: '1 Day', status: 'Exemplary' },
        { id: 3, name: 'Prof. Alan', subject: 'C Programming Lab', syllabus: 65, resources: 6, grading: '5 Days', status: 'Delayed' },
        { id: 4, name: 'Prof. Jones', subject: 'Communication Skills - 2', syllabus: 80, resources: 12, grading: '3 Days', status: 'Good' },
    ]);
    // Teacher Leaderboard Rep state
    const [teacherXP, setTeacherXP] = useState([
        { id: 1, name: 'Dr. White', xp: 2450, rank: 1 },
        { id: 2, name: 'Dr. Bhavana', xp: 2100, rank: 2 },
        { id: 3, name: 'Prof. Jones', xp: 1850, rank: 3 },
        { id: 4, name: 'Prof. Alan', xp: 1200, rank: 4 }
    ]);
    // AI Academic Risk predictor state
    const [atRiskStudents, setAtRiskStudents] = useState([
        { id: 'rk1', name: 'Rohan Gowda (ECE)', risk: 87, reason: 'Low lab engagement & attendance drop', counselor: false },
        { id: 'rk2', name: 'Bharath P (ECE)', risk: 78, reason: 'Consecutive missed morning classes', counselor: false },
        { id: 'rk3', name: 'Varun K (ME)', risk: 72, reason: 'Missed 3 calculus assignments', counselor: false }
    ]);
    // Room scheduler optimization state
    const [roomConflicts, setRoomConflicts] = useState([
        { id: 'rc1', room: 'Room L-301', time: '10:15 AM Monday', classes: 'Math II & Electronics', status: 'Conflict' },
        { id: 'rc2', room: 'CS-Lab 2', time: '02:00 PM Wednesday', classes: 'C-Lab & Database Lab', status: 'Conflict' }
    ]);
    // Simulated tap generator
    const simulateRfidTap = () => {
        if (!rfidActive) {
            triggerToast('Cannot simulate tap: RFID gates are currently offline!');
            return;
        }
        const mockNames = ['Bharath P (bp@vvce)', 'Anagha (anagha@vvce)', 'Bharath Kumar (bk@vvce)', 'Vikram S (vik@vvce)'];
        const mockRooms = ['CS-Lab 1', 'L-301 Math class', 'Physics-Lab A', 'Audi-2 Seminar'];
        const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
        const randomRoom = mockRooms[Math.floor(Math.random() * mockRooms.length)];
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        setRfidLogs(prev => [
            { time: timeStr, student: randomName, room: randomRoom, status: 'Success' },
            ...prev.slice(0, 5)
        ]);
        triggerToast(`Simulated RFID Tap received: ${randomName}`);
    };
    const triggerToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 4500);
    };
    const handleSendWarning = (usn, studentName) => {
        setDefaulters(prev => prev.map(d => d.usn === usn ? { ...d, status: 'Warning Sent' } : d));
        triggerToast(`WhatsApp notification & official alert sent to ${studentName}'s parents!`);
    };
    const handleTeacherBonusXP = (id, name) => {
        setTeacherXP(prev => prev.map(t => t.id === id ? { ...t, xp: t.xp + 100 } : t).sort((a, b) => b.xp - a.xp));
        triggerToast(`Rewarded 100 bonus reputation XP to ${name} for stellar teaching contributions!`);
    };
    const handleAssignCounselor = (id, name) => {
        setAtRiskStudents(prev => prev.map(s => s.id === id ? { ...s, counselor: true } : s));
        triggerToast(`Assigned official student counselor to investigate and assist ${name}!`);
    };
    const handleResolveConflict = (id, room) => {
        setRoomConflicts(prev => prev.filter(rc => rc.id !== id));
        triggerToast(`AI Auto-Scheduler resolved ${room} conflict! Relocated backup class to Seminar Hall 2.`);
    };
    const handleOpenReminder = (teacher) => {
        setActiveModalTeacher(teacher);
        setReminderText(`Dear ${teacher.name}, our academic diagnostic scanner reports that syllabus completion for ${teacher.subject} is at ${teacher.syllabus}%. Please verify and speed up note upload sessions if necessary.`);
    };
    const handleSendReminder = () => {
        if (!activeModalTeacher) return;
        triggerToast(`Syllabus acceleration audit warning sent to ${activeModalTeacher.name}!`);
        setActiveModalTeacher(null);
    };
    // Filter Defaulters List
    const filteredDefaulters = defaulters.filter(d => {
        const matchesBranch = selectedBranch === 'All' || d.branch === selectedBranch;
        const matchesSem = selectedSem === 'All' || d.sem === selectedSem;
        const matchesSection = selectedSection === 'All' || d.section === selectedSection;
        const matchesQuery = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.usn.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesBranch && matchesSem && matchesSection && matchesQuery;
    });
    // =========================================================================
    // STUDENT & TEACHER MOCK DATA
    // =========================================================================
    const attendanceData = [
        { name: 'Present', value: 85, color: '#4caf50' },
        { name: 'Absent', value: 15, color: '#f44336' }
    ];
    const taskData = [
        { name: 'Completed', value: 12, color: '#ff9800' },
        { name: 'Pending', value: 5, color: '#000000' }
    ];
    const studyHoursData = [
        { day: 'Mon', hours: 3 },
        { day: 'Tue', hours: 5 },
        { day: 'Wed', hours: 2 },
        { day: 'Thu', hours: 4 },
        { day: 'Fri', hours: 6 },
        { day: 'Sat', hours: 3 },
        { day: 'Sun', hours: 1 },
    ];
    // Render logic by User Role
    const role = user?.role || 'student';
    const isAdmin = role === 'admin';
    const isTeacher = role === 'teacher';
    if (isAdmin) {
        return (
            <div className="dashboard-home-container admin-theme animate-enter">
                {/* Custom sliding notification toast */}
                {toastMessage && (
                    <div className="admin-live-toast">
                        <Zap size={18} className="live-toast-icon" />
                        <span>{toastMessage}</span>
                    </div>
                )}
                {/* Banner */}
                <div className="welcome-banner">
                    <div>
                        <h2>Welcome back, Dean Admin! 👋</h2>
                        <p>Institutional Diagnostic Control Desk — VVCE Dean Operations</p>
                    </div>
                    <div className="date-badge">
                        <Calendar size={16} />
                        <span>{new Date().toLocaleDateString('en-GB')}</span>
                    </div>
                </div>
                {/* KPI stats section */}
                <div className="stats-grid">
                    <div className="stat-card streak-card" style={{ borderLeft: '4px solid #10b981' }}>
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                            <Radio size={24} color="#10b981" className={rfidActive ? "pulse-anim" : ""} />
                        </div>
                        <div className="stat-content">
                            <h3>RFID Gate Sync</h3>
                            <div className="stat-value" style={{ fontSize: '1.25rem', color: '#10b981' }}>
                                {rfidActive ? 'LINK ACTIVE' : 'NODE OFFLINE'}
                            </div>
                            <button className="admin-quick-toggle-btn" onClick={() => setRfidActive(!rfidActive)}>
                                {rfidActive ? 'Disable Gates' : 'Restore Gates'}
                            </button>
                        </div>
                    </div>
                    <div className="stat-card pending-card" style={{ borderLeft: '4px solid #ef4444' }}>
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
                            <ShieldAlert size={24} color="#ef4444" />
                        </div>
                        <div className="stat-content">
                            <h3>Academic Risk</h3>
                            <div className="stat-value" style={{ color: '#ef4444' }}>
                                {atRiskStudents.filter(s => !s.counselor).length} Students
                            </div>
                            <p className="stat-subtitle">Auto-Calculated by AI</p>
                        </div>
                    </div>
                    <div className="stat-card event-card" style={{ borderLeft: '4px solid #fbbf24' }}>
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)' }}>
                            <Clock size={24} color="#fbbf24" />
                        </div>
                        <div className="stat-content">
                            <h3>Average Syllabus</h3>
                            <div className="stat-value" style={{ color: '#fbbf24' }}>78.7%</div>
                            <p className="stat-subtitle">CSE / ECE / ME streams</p>
                        </div>
                    </div>
                    <div className="stat-card xp-card" style={{ borderLeft: '4px solid #818cf8' }}>
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(129, 140, 248, 0.15)' }}>
                            <Trophy size={24} color="#818cf8" />
                        </div>
                        <div className="stat-content">
                            <h3>Teacher Rep Pool</h3>
                            <div className="stat-value" style={{ color: '#818cf8' }}>
                                {teacherXP.reduce((acc, t) => acc + t.xp, 0)} XP
                            </div>
                            <p className="stat-subtitle">Shared staff rewards</p>
                        </div>
                    </div>
                </div>
                {/* Grid Section 1: Defaulters & Teacher Audits */}
                <div className="admin-dashboard-two-col-grid">
                    
                    {/* Low Attendance Defaulter Panel */}
                    <div className="admin-section-card">
                        <div className="admin-section-header">
                            <div className="header-title-wrapper">
                                <Users size={20} color="#ff8c00" />
                                <h3>Low Attendance Defaulters Tracker (Attendance &lt; 75%)</h3>
                            </div>
                            <div className="defaulter-active-count">
                                {defaulters.length} Defaulters flagged
                            </div>
                        </div>
                        {/* Defaulter Filters */}
                        <div className="admin-defaulter-filters">
                            <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                                <option value="All">All Branches</option>
                                <option value="CSE">Computer Science</option>
                                <option value="ECE">Electronics</option>
                                <option value="ME">Mechanical</option>
                            </select>
                            <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)}>
                                <option value="All">All Semesters</option>
                                <option value="1 - Semester">1st Sem</option>
                                <option value="2 - Semester">2nd Sem</option>
                            </select>
                            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                                <option value="All">All Sections</option>
                                <option value="A">Section A</option>
                                <option value="B">Section B</option>
                            </select>
                            <input 
                                type="text" 
                                placeholder="Search by name or USN..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {/* Defaulters Table */}
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>USN</th>
                                        <th>Student Name</th>
                                        <th>Batch / Sec</th>
                                        <th>Attendance</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDefaulters.length > 0 ? (
                                        filteredDefaulters.map(student => (
                                            <tr key={student.usn}>
                                                <td className="bold-usn">{student.usn}</td>
                                                <td>{student.name}</td>
                                                <td>{student.branch} | {student.sem.charAt(0) === '1' ? '1st Sem' : '2nd Sem'} - Sec {student.section}</td>
                                                <td style={{ color: '#f87171', fontWeight: 800 }}>{student.attendance.toFixed(2)}%</td>
                                                <td>
                                                    <button 
                                                        className={`admin-action-table-btn ${student.status !== 'Active' ? 'disabled-btn' : ''}`}
                                                        onClick={() => handleSendWarning(student.usn, student.name)}
                                                        disabled={student.status !== 'Active'}
                                                    >
                                                        {student.status === 'Active' ? 'Send Warning' : 'Warning Sent ✓'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#666' }}>No student defaulters matches filters</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Teacher Work Completion Audit */}
                    <div className="admin-section-card">
                        <div className="admin-section-header">
                            <div className="header-title-wrapper">
                                <FileText size={20} color="#818cf8" />
                                <h3>Teacher Syllabus & Grading Audit Report</h3>
                            </div>
                        </div>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Lecturer</th>
                                        <th>Course Subject</th>
                                        <th>Syllabus</th>
                                        <th>Grading</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teachers.map(t => (
                                        <tr key={t.id}>
                                            <td className="bold-usn">{t.name}</td>
                                            <td style={{ fontSize: '0.8rem' }}>{t.subject}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div className="admin-progress-bar-bg">
                                                        <div className="admin-progress-bar-fill" style={{ 
                                                            width: `${t.syllabus}%`, 
                                                            backgroundColor: t.syllabus < 70 ? '#ef4444' : '#10b981' 
                                                        }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{t.syllabus}%</span>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '0.8rem', color: t.grading.includes('5') ? '#ef4444' : '#ccc' }}>{t.grading} avg</td>
                                            <td>
                                                <button 
                                                    className="admin-action-table-btn accent-purple"
                                                    onClick={() => handleOpenReminder(t)}
                                                >
                                                    Audit Warning
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* Grid Section 2: Outliers Diagnostic & RFID Simulator */}
                <div className="admin-dashboard-two-col-grid" style={{ marginTop: '2rem' }}>
                    
                    {/* Class & Course Diagnostics */}
                    <div className="admin-section-card">
                        <div className="admin-section-header">
                            <div className="header-title-wrapper">
                                <ShieldAlert size={20} color="#ef4444" />
                                <h3>Classroom & Course Diagnostic Warnings</h3>
                            </div>
                        </div>
                        <div className="admin-alert-list">
                            <div className="admin-diagnostic-alert-card danger">
                                <div className="alert-badge">SEVERE SECTOR ANOMALY</div>
                                <div className="alert-content">
                                    <h4>1BCEDT204 - Drawing Class Absenteeism</h4>
                                    <p>Friday morning session has a <strong>42% average absenteeism</strong>. This is a significant anomaly indicating either scheduler clashes or student exhaustion.</p>
                                </div>
                                <button className="admin-diagnostic-solve-btn" onClick={() => triggerToast('Relocated Friday drawing class to Thursday afternoon. Rescheduling notifications sent to all students!')}>
                                    Investigate & Remap Slot
                                </button>
                            </div>
                            <div className="admin-diagnostic-alert-card warning">
                                <div className="alert-badge">SYLLABUS GAP WARNING</div>
                                <div className="alert-content">
                                    <h4>Section B C-Programming lags Section A</h4>
                                    <p>Section B lags behind Section A by <strong>25% in syllabus progress</strong> and has 12% lower average quiz scores.</p>
                                </div>
                                <button className="admin-diagnostic-solve-btn warning-btn" onClick={() => triggerToast('Instruction dispatched to Prof. Alan to coordinate a joint makeup lecture for Section B.')}>
                                    Issue Sync Directives
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Hardware RFID Simulator Panel */}
                    <div className="admin-section-card">
                        <div className="admin-section-header">
                            <div className="header-title-wrapper">
                                <Radio size={20} color="#10b981" />
                                <h3>Live Hardware RFID Access Simulator (Hardware Console)</h3>
                            </div>
                            <button className="admin-simulator-btn" onClick={simulateRfidTap}>
                                Simulate Tap
                            </button>
                        </div>
                        <div className="admin-simulator-console">
                            <div className="console-header">
                                <div className="console-dot green" />
                                <span>LIVE HARDWARE TRANSMISSION STREAM</span>
                            </div>
                            <div className="console-body">
                                {rfidActive ? (
                                    rfidLogs.map((log, i) => (
                                        <div key={i} className="console-line">
                                            <span className="c-time">[{log.time}]</span>
                                            <span className="c-text"> Student {log.student} tapped card at <strong>{log.room}</strong>. Result:</span>
                                            <span className="c-status"> {log.status}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="console-offline-text">
                                        ACCESS TRANSMISSION PAUSED: HARDWARE STREAM DISCONNECTED.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Grid Section 3: AI risk predictor, Teacher XP, Room Optimizer */}
                <div className="admin-dashboard-three-col-grid" style={{ marginTop: '2rem' }}>
                    
                    {/* AI Drop-out Risk Predictor */}
                    <div className="admin-section-card">
                        <div className="admin-section-header">
                            <div className="header-title-wrapper">
                                <Sparkles size={18} color="#818cf8" />
                                <h3>AI Academic Failure Predictor</h3>
                            </div>
                        </div>
                        <div className="admin-column-item-list">
                            {atRiskStudents.map(student => (
                                <div key={student.id} className="admin-risk-student-card">
                                    <div className="risk-header">
                                        <span className="risk-name">{student.name}</span>
                                        <span className="risk-percentage" style={{ 
                                            color: student.risk > 80 ? '#ef4444' : '#fbbf24',
                                            backgroundColor: student.risk > 80 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)'
                                        }}>
                                            {student.risk}% Risk
                                        </span>
                                    </div>
                                    <p className="risk-reason">{student.reason}</p>
                                    <button 
                                        className={`admin-risk-action-btn ${student.counselor ? 'resolved' : ''}`}
                                        onClick={() => handleAssignCounselor(student.id, student.name)}
                                        disabled={student.counselor}
                                    >
                                        {student.counselor ? 'Counselor Assigned ✓' : 'Assign Official Counselor'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Teacher Reputation Pool */}
                    <div className="admin-section-card">
                        <div className="admin-section-header">
                            <div className="header-title-wrapper">
                                <Trophy size={18} color="#fbbf24" />
                                <h3>Teacher Reputation Leaderboard</h3>
                            </div>
                        </div>
                        <div className="admin-column-item-list">
                            {teacherXP.map((teacher, index) => (
                                <div key={teacher.id} className="admin-teacher-rep-row">
                                    <div className="rep-left">
                                        <span className="rep-rank">#{index + 1}</span>
                                        <span className="rep-name">{teacher.name}</span>
                                    </div>
                                    <div className="rep-right">
                                        <span className="rep-points">{teacher.xp} XP</span>
                                        <button className="admin-rep-award-btn" onClick={() => handleTeacherBonusXP(teacher.id, teacher.name)}>
                                            +100 XP
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Room Conflict Optimizer */}
                    <div className="admin-section-card">
                        <div className="admin-section-header">
                            <div className="header-title-wrapper">
                                <MapPin size={18} color="#10b981" />
                                <h3>AI Scheduler & Room Optimizer</h3>
                            </div>
                        </div>
                        <div className="admin-column-item-list">
                            {roomConflicts.length > 0 ? (
                                roomConflicts.map(rc => (
                                    <div key={rc.id} className="admin-conflict-card">
                                        <div className="conflict-badge">DOUBLE BOOKING DETECTED</div>
                                        <h4>{rc.room}</h4>
                                        <p>Time: <strong>{rc.time}</strong></p>
                                        <p>Classes: {rc.classes}</p>
                                        <button className="admin-conflict-resolve-btn" onClick={() => handleResolveConflict(rc.id, rc.room)}>
                                            Auto-Resolve Room Conflict
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="admin-all-clear-card">
                                    <ShieldCheck size={48} color="#10b981" />
                                    <h4>No active room conflicts</h4>
                                    <p>AI scheduler optimizer is monitoring connection blocks. Master calendar is completely conflict-free!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Audit Warning Modal Dialog */}
                {activeModalTeacher && (
                    <div className="admin-modal-backdrop">
                        <div className="admin-modal-dialog">
                            <div className="admin-modal-header">
                                <span>Audit Warning: Dispatch Syllabus Acceleration Directive</span>
                                <button className="modal-close" onClick={() => setActiveModalTeacher(null)}>×</button>
                            </div>
                            <div className="admin-modal-body">
                                <label style={{ fontSize: '0.9rem', color: '#ccc', display: 'block', marginBottom: '8px' }}>
                                    Confirm official diagnostic warning letter to <strong>{activeModalTeacher.name}</strong>:
                                </label>
                                <textarea 
                                    className="admin-modal-textarea"
                                    value={reminderText}
                                    onChange={(e) => setReminderText(e.target.value)}
                                    rows={5}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                                    <button className="admin-modal-btn cancel" onClick={() => setActiveModalTeacher(null)}>Cancel</button>
                                    <button className="admin-modal-btn confirm" onClick={handleSendReminder}>Dispatch Directive</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <style>{`
                    .admin-theme {
                        padding: 0;
                        background-color: #030712;
                        width: 100%;
                        max-width: 100%;
                    }
                    .admin-live-toast {
                        position: fixed;
                        top: 24px;
                        right: 24px;
                        background: #0f172a;
                        color: #c7d2fe;
                        border: 1px solid #4f46e5;
                        box-shadow: 0 10px 40px rgba(79, 70, 229, 0.3);
                        padding: 14px 28px;
                        border-radius: 10px;
                        z-index: 9999;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        font-weight: 700;
                        font-size: 0.92rem;
                        animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    @keyframes slideInRight {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    .admin-quick-toggle-btn {
                        background: rgba(255, 255, 255, 0.04);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        color: #9ca3af;
                        padding: 6px 12px;
                        border-radius: 6px;
                        font-size: 0.72rem;
                        font-weight: 800;
                        cursor: pointer;
                        margin-top: 8px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        transition: all 0.2s ease;
                    }
                    .admin-quick-toggle-btn:hover {
                        background: #ff8c00;
                        color: #000;
                        border-color: #ff8c00;
                        box-shadow: 0 0 10px rgba(255, 140, 0, 0.3);
                    }
                    .admin-dashboard-two-col-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1.5rem;
                        margin-top: 1.5rem;
                    }
                    .admin-dashboard-three-col-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 1.5rem;
                        margin-top: 1.5rem;
                    }
                    .admin-section-card {
                        background: rgba(17, 24, 39, 0.45);
                        backdrop-filter: blur(12px);
                        border: 1.5px solid rgba(255, 255, 255, 0.08);
                        border-radius: 16px;
                        padding: 1.25rem;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
                        display: flex;
                        flex-direction: column;
                        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .admin-section-card:hover {
                        border-color: rgba(255, 255, 255, 0.15);
                        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
                    }
                    .admin-section-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        padding-bottom: 14px;
                        margin-bottom: 20px;
                        flex-wrap: wrap;
                        gap: 12px;
                    }
                    .header-title-wrapper {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .header-title-wrapper h3 {
                        font-size: 1.15rem;
                        font-weight: 800;
                        color: var(--text-primary);
                        letter-spacing: 0.25px;
                    }
                    .defaulter-active-count {
                        background: rgba(239, 68, 68, 0.15);
                        color: #ef4444;
                        font-size: 0.72rem;
                        font-weight: 800;
                        padding: 4px 12px;
                        border-radius: 20px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        border: 1px solid rgba(239, 68, 68, 0.2);
                    }
                    .admin-defaulter-filters {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 10px;
                        margin-bottom: 16px;
                    }
                    .admin-defaulter-filters select, .admin-defaulter-filters input {
                        background: rgba(10, 15, 30, 0.6);
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        color: var(--text-primary);
                        border-radius: 8px;
                        padding: 8px 12px;
                        font-size: 0.82rem;
                        outline: none;
                        transition: all 0.2s;
                    }
                    .admin-defaulter-filters select:focus, .admin-defaulter-filters input:focus {
                        border-color: #6366f1;
                        box-shadow: 0 0 8px rgba(99, 102, 241, 0.2);
                    }
                    .admin-table-container {
                        overflow-x: auto;
                        flex: 1;
                    }
                    .admin-table {
                        width: 100%;
                        border-collapse: collapse;
                        text-align: left;
                    }
                    .admin-table th {
                        padding: 14px 16px;
                        font-size: 0.78rem;
                        font-weight: 700;
                        color: #9ca3af;
                        text-transform: uppercase;
                        letter-spacing: 0.8px;
                        border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
                    }
                    .admin-table td {
                        padding: 14px 16px;
                        font-size: 0.85rem;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        color: #cbd5e1;
                    }
                    .admin-table tbody tr {
                        transition: background-color 0.15s ease;
                    }
                    .admin-table tbody tr:hover {
                        background-color: rgba(255, 255, 255, 0.02);
                    }
                    .bold-usn {
                        font-weight: 700;
                        color: var(--text-primary);
                        font-family: monospace;
                    }
                    .admin-action-table-btn {
                        background: rgba(255, 140, 0, 0.15);
                        border: 1px solid #ff8c00;
                        color: #ff8c00;
                        font-weight: 800;
                        font-size: 0.75rem;
                        padding: 6px 14px;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        white-space: nowrap;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .admin-action-table-btn:hover:not(:disabled) {
                        background: #ff8c00;
                        color: #000;
                        box-shadow: 0 0 10px rgba(255, 140, 0, 0.2);
                    }
                    .disabled-btn {
                        background: rgba(255,255,255,0.03) !important;
                        border-color: rgba(255, 255, 255, 0.05) !important;
                        color: #4b5563 !important;
                        cursor: default !important;
                    }
                    .accent-purple {
                        background: rgba(129, 140, 248, 0.15);
                        border-color: #818cf8;
                        color: #818cf8;
                    }
                    .accent-purple:hover {
                        background: #818cf8 !important;
                        color: #000 !important;
                        box-shadow: 0 0 10px rgba(129, 140, 248, 0.2);
                    }
                    .admin-progress-bar-bg {
                        width: 90px;
                        height: 6px;
                        background: rgba(255, 255, 255, 0.08);
                        border-radius: 3px;
                        overflow: hidden;
                    }
                    .admin-progress-bar-fill {
                        height: 100%;
                        border-radius: 3px;
                    }
                    .admin-alert-list {
                        display: flex;
                        flex-direction: column;
                        gap: 14px;
                        flex: 1;
                        justify-content: center;
                    }
                    .admin-diagnostic-alert-card {
                        border-radius: 10px;
                        padding: 16px;
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        transition: transform 0.2s ease;
                    }
                    .admin-diagnostic-alert-card:hover {
                        transform: translateX(4px);
                    }
                    .admin-diagnostic-alert-card.danger {
                        background: rgba(239, 68, 68, 0.04);
                        border-left: 4px solid #ef4444;
                    }
                    .admin-diagnostic-alert-card.warning {
                        background: rgba(251, 191, 36, 0.04);
                        border-left: 4px solid #fbbf24;
                    }
                    .alert-badge {
                        font-size: 0.68rem;
                        font-weight: 800;
                        padding: 2px 8px;
                        border-radius: 4px;
                        width: fit-content;
                        margin-bottom: 8px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .danger .alert-badge {
                        background: rgba(239, 68, 68, 0.15);
                        color: #ef4444;
                        border: 1px solid rgba(239, 68, 68, 0.2);
                    }
                    .warning .alert-badge {
                        background: rgba(251, 191, 36, 0.15);
                        color: #fbbf24;
                        border: 1px solid rgba(251, 191, 36, 0.2);
                    }
                    .admin-diagnostic-alert-card h4 {
                        font-size: 0.9rem;
                        font-weight: 700;
                        color: var(--text-primary);
                        margin-bottom: 6px;
                    }
                    .admin-diagnostic-alert-card p {
                        font-size: 0.78rem;
                        color: var(--text-secondary);
                        margin-bottom: 12px;
                        line-height: 1.45;
                    }
                    .admin-diagnostic-solve-btn {
                        background: none;
                        border: 1px solid #ef4444;
                        color: #ef4444;
                        padding: 6px 14px;
                        font-size: 0.72rem;
                        font-weight: 800;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .admin-diagnostic-solve-btn:hover {
                        background: #ef4444;
                        color: #000;
                    }
                    .warning-btn {
                        border-color: #fbbf24;
                        color: #fbbf24;
                    }
                    .warning-btn:hover {
                        background: #fbbf24;
                        color: #000;
                    }
                    .admin-simulator-btn {
                        background: rgba(16, 185, 129, 0.15);
                        border: 1px solid #10b981;
                        color: #10b981;
                        font-weight: 800;
                        font-size: 0.75rem;
                        padding: 6px 14px;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .admin-simulator-btn:hover {
                        background: #10b981;
                        color: #000;
                        box-shadow: 0 0 10px rgba(16, 185, 129, 0.25);
                    }
                    .admin-simulator-console {
                        background: #040612;
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        border-radius: 10px;
                        font-family: monospace;
                        padding: 1.25rem;
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                    }
                    .console-header {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-size: 0.75rem;
                        font-weight: bold;
                        color: #475569;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        padding-bottom: 8px;
                        margin-bottom: 12px;
                    }
                    .console-dot {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                    }
                    .console-dot.green {
                        background-color: #10b981;
                    }
                    .pulse-anim {
                        animation: pulseGlow 1.5s infinite;
                    }
                    @keyframes pulseGlow {
                        0% { transform: scale(1); opacity: 0.5; }
                        50% { transform: scale(1.2); opacity: 1; }
                        100% { transform: scale(1); opacity: 0.5; }
                    }
                    .console-body {
                        font-size: 0.78rem;
                        line-height: 1.6;
                        color: #4ade80;
                        overflow-y: auto;
                        max-height: 180px;
                        flex: 1;
                    }
                    .console-line {
                        margin-bottom: 6px;
                    }
                    .c-time { color: #475569; }
                    .c-text { color: #cbd5e1; }
                    .c-status { color: #10b981; font-weight: bold; }
                    .console-offline-text {
                        color: #ef4444;
                        text-align: center;
                        padding: 2.5rem 0;
                        font-weight: bold;
                    }
                    .admin-column-item-list {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        margin-top: 12px;
                    }
                    .admin-risk-student-card {
                        background: rgba(255, 255, 255, 0.01);
                        border: 1px solid rgba(255, 255, 255, 0.04);
                        padding: 14px;
                        border-radius: 8px;
                        transition: all 0.2s;
                    }
                    .admin-risk-student-card:hover {
                        background: rgba(255, 255, 255, 0.02);
                        border-color: rgba(255, 255, 255, 0.08);
                    }
                    .risk-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 6px;
                    }
                    .risk-name {
                        font-size: 0.85rem;
                        font-weight: 700;
                        color: var(--text-primary);
                    }
                    .risk-percentage {
                        font-size: 0.68rem;
                        font-weight: 800;
                        padding: 2px 8px;
                        border-radius: 4px;
                        letter-spacing: 0.5px;
                    }
                    .risk-reason {
                        font-size: 0.72rem;
                        color: var(--text-secondary);
                        margin-bottom: 10px;
                    }
                    .admin-risk-action-btn {
                        width: 100%;
                        background: rgba(129, 140, 248, 0.12);
                        border: 1px solid #818cf8;
                        color: #818cf8;
                        font-weight: 800;
                        font-size: 0.72rem;
                        padding: 6px;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .admin-risk-action-btn:hover:not(:disabled) {
                        background: #818cf8;
                        color: #000;
                    }
                    .admin-risk-action-btn.resolved {
                        background: rgba(16, 185, 129, 0.1) !important;
                        border-color: #10b981 !important;
                        color: #10b981 !important;
                        cursor: default !important;
                    }
                    .admin-teacher-rep-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: rgba(255, 255, 255, 0.01);
                        padding: 14px;
                        border-radius: 8px;
                        border: 1px solid rgba(255, 255, 255, 0.04);
                        transition: all 0.2s;
                    }
                    .admin-teacher-rep-row:hover {
                        background: rgba(255, 255, 255, 0.02);
                    }
                    .rep-left {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .rep-rank {
                        font-size: 0.8rem;
                        font-weight: bold;
                        color: #ff8c00;
                    }
                    .rep-name {
                        font-size: 0.85rem;
                        font-weight: 700;
                        color: var(--text-primary);
                    }
                    .rep-right {
                        display: flex;
                        align-items: center;
                        gap: 14px;
                    }
                    .rep-points {
                        font-size: 0.85rem;
                        font-weight: bold;
                        color: #fbbf24;
                    }
                    .admin-rep-award-btn {
                        background: rgba(251, 191, 36, 0.15);
                        border: 1px solid #fbbf24;
                        color: #fbbf24;
                        padding: 4px 10px;
                        font-size: 0.68rem;
                        font-weight: 800;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s;
                        text-transform: uppercase;
                    }
                    .admin-rep-award-btn:hover {
                        background: #fbbf24;
                        color: #000;
                    }
                    .admin-conflict-card {
                        background: rgba(239, 68, 68, 0.02);
                        border: 1.5px dashed rgba(239, 68, 68, 0.25);
                        padding: 14px;
                        border-radius: 8px;
                    }
                    .conflict-badge {
                        background: rgba(239, 68, 68, 0.12);
                        color: #ef4444;
                        font-size: 0.65rem;
                        font-weight: 800;
                        padding: 2px 8px;
                        border-radius: 4px;
                        width: fit-content;
                        margin-bottom: 6px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        border: 1px solid rgba(239, 68, 68, 0.15);
                    }
                    .admin-conflict-card h4 {
                        font-size: 0.85rem;
                        font-weight: 700;
                        color: var(--text-primary);
                        margin-bottom: 6px;
                    }
                    .admin-conflict-card p {
                        font-size: 0.75rem;
                        color: var(--text-secondary);
                        margin-bottom: 6px;
                    }
                    .admin-conflict-resolve-btn {
                        width: 100%;
                        background: rgba(16, 185, 129, 0.12);
                        border: 1px solid #10b981;
                        color: #10b981;
                        font-weight: 800;
                        font-size: 0.72rem;
                        padding: 6px;
                        border-radius: 6px;
                        cursor: pointer;
                        margin-top: 8px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .admin-conflict-resolve-btn:hover {
                        background: #10b981;
                        color: #000;
                    }
                    .admin-all-clear-card {
                        text-align: center;
                        padding: 2rem;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: rgba(255, 255, 255, 0.01);
                        border-radius: 10px;
                        border: 1px solid rgba(255, 255, 255, 0.05);
                    }
                    .admin-all-clear-card h4 {
                        margin-top: 12px;
                        font-size: 0.9rem;
                        font-weight: bold;
                        color: var(--text-primary);
                    }
                    .admin-all-clear-card p {
                        margin-top: 6px;
                        font-size: 0.75rem;
                        color: var(--text-secondary);
                        line-height: 1.45;
                    }
                    .admin-modal-backdrop {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.85);
                        z-index: 10000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        backdrop-filter: blur(8px);
                    }
                    .admin-modal-dialog {
                        background: #090d16;
                        border: 1.5px solid rgba(255, 255, 255, 0.1);
                        width: 100%;
                        max-width: 500px;
                        border-radius: 16px;
                        box-shadow: 0 20px 50px rgba(0,0,0,0.6);
                        overflow: hidden;
                    }
                    .admin-modal-header {
                        background: #0f172a;
                        padding: 14px 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-weight: 700;
                        font-size: 0.95rem;
                        color: var(--text-primary);
                        border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
                    }
                    .modal-close {
                        background: none;
                        border: none;
                        color: #64748b;
                        font-size: 1.6rem;
                        cursor: pointer;
                        transition: color 0.15s ease;
                    }
                    .modal-close:hover { color: #fff; }
                    .admin-modal-body {
                        padding: 20px;
                    }
                    .admin-modal-textarea {
                        width: 100%;
                        background: #02040a;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        color: var(--text-primary);
                        border-radius: 8px;
                        padding: 12px;
                        font-family: inherit;
                        font-size: 0.85rem;
                        outline: none;
                        resize: none;
                        box-sizing: border-box;
                    }
                    .admin-modal-btn {
                        padding: 8px 20px;
                        border-radius: 8px;
                        font-weight: 800;
                        font-size: 0.82rem;
                        cursor: pointer;
                        border: none;
                        transition: all 0.2s ease;
                    }
                    .admin-modal-btn.cancel {
                        background: #1e293b;
                        color: #94a3b8;
                        border: 1px solid rgba(255,255,255,0.05);
                    }
                    .admin-modal-btn.cancel:hover {
                        background: #334155;
                        color: #fff;
                    }
                    .admin-modal-btn.confirm {
                        background: #6366f1;
                        color: #fff;
                    }
                    .admin-modal-btn.confirm:hover {
                        background: #4f46e5;
                        box-shadow: 0 0 10px rgba(99, 102, 241, 0.35);
                    }
                    /* ==================== LIGHT THEME OVERRIDES ==================== */
                    html[data-theme="light"] .admin-theme,
                    :root[data-theme="light"] .admin-theme {
                        background-color: #f9fafb !important;
                    }
                    html[data-theme="light"] .admin-section-card,
                    :root[data-theme="light"] .admin-section-card {
                        background: #ffffff !important;
                        border-color: #e5e7eb !important;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
                    }
                    html[data-theme="light"] .admin-section-card:hover,
                    :root[data-theme="light"] .admin-section-card:hover {
                        border-color: #d1d5db !important;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08) !important;
                    }
                    html[data-theme="light"] .admin-table th,
                    :root[data-theme="light"] .admin-table th {
                        color: #4b5563 !important;
                        border-bottom-color: #e5e7eb !important;
                    }
                    html[data-theme="light"] .admin-table td,
                    :root[data-theme="light"] .admin-table td {
                        color: #111827 !important;
                        border-bottom-color: #f3f4f6 !important;
                    }
                    html[data-theme="light"] .admin-table tbody tr:hover,
                    :root[data-theme="light"] .admin-table tbody tr:hover {
                        background-color: #f9fafb !important;
                    }
                    html[data-theme="light"] .admin-section-header,
                    :root[data-theme="light"] .admin-section-header {
                        border-bottom-color: #e5e7eb !important;
                    }
                    html[data-theme="light"] .admin-defaulter-filters select,
                    html[data-theme="light"] .admin-defaulter-filters input,
                    :root[data-theme="light"] .admin-defaulter-filters select,
                    :root[data-theme="light"] .admin-defaulter-filters input {
                        background: #ffffff !important;
                        border-color: #cbd5e1 !important;
                        color: #111827 !important;
                    }
                    html[data-theme="light"] .admin-progress-bar-bg,
                    :root[data-theme="light"] .admin-progress-bar-bg {
                        background: #e5e7eb !important;
                    }
                    html[data-theme="light"] .admin-diagnostic-alert-card,
                    :root[data-theme="light"] .admin-diagnostic-alert-card {
                        border-color: #e5e7eb !important;
                    }
                    html[data-theme="light"] .admin-diagnostic-alert-card.danger,
                    :root[data-theme="light"] .admin-diagnostic-alert-card.danger {
                        background: #fef2f2 !important;
                    }
                    html[data-theme="light"] .admin-diagnostic-alert-card.warning,
                    :root[data-theme="light"] .admin-diagnostic-alert-card.warning {
                        background: #fffbeb !important;
                    }
                    html[data-theme="light"] .admin-simulator-console,
                    :root[data-theme="light"] .admin-simulator-console {
                        background: #f3f4f6 !important;
                        border-color: #cbd5e1 !important;
                    }
                    html[data-theme="light"] .console-header,
                    :root[data-theme="light"] .console-header {
                        border-bottom-color: #cbd5e1 !important;
                        color: #4b5563 !important;
                    }
                    html[data-theme="light"] .console-body,
                    :root[data-theme="light"] .console-body {
                        color: #16a34a !important;
                    }
                    html[data-theme="light"] .c-text,
                    :root[data-theme="light"] .c-text {
                        color: #1f2937 !important;
                    }
                    html[data-theme="light"] .admin-risk-student-card,
                    :root[data-theme="light"] .admin-risk-student-card {
                        background: #f9fafb !important;
                        border-color: #e5e7eb !important;
                    }
                    html[data-theme="light"] .admin-risk-student-card:hover,
                    :root[data-theme="light"] .admin-risk-student-card:hover {
                        background: #f3f4f6 !important;
                        border-color: #cbd5e1 !important;
                    }
                    html[data-theme="light"] .admin-teacher-rep-row,
                    :root[data-theme="light"] .admin-teacher-rep-row {
                        background: #f9fafb !important;
                        border-color: #e5e7eb !important;
                    }
                    html[data-theme="light"] .admin-teacher-rep-row:hover,
                    :root[data-theme="light"] .admin-teacher-rep-row:hover {
                        background: #f3f4f6 !important;
                    }
                    html[data-theme="light"] .admin-conflict-card,
                    :root[data-theme="light"] .admin-conflict-card {
                        background: #fef2f2 !important;
                        border-color: #fca5a5 !important;
                    }
                    html[data-theme="light"] .admin-all-clear-card,
                    :root[data-theme="light"] .admin-all-clear-card {
                        background: #f9fafb !important;
                        border-color: #e5e7eb !important;
                    }
                    html[data-theme="light"] .admin-modal-dialog,
                    :root[data-theme="light"] .admin-modal-dialog {
                        background: #ffffff !important;
                        border-color: #e5e7eb !important;
                        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1) !important;
                    }
                    html[data-theme="light"] .admin-modal-header,
                    :root[data-theme="light"] .admin-modal-header {
                        background: #f3f4f6 !important;
                        border-bottom-color: #e5e7eb !important;
                        color: #111827 !important;
                    }
                    html[data-theme="light"] .admin-modal-textarea,
                    :root[data-theme="light"] .admin-modal-textarea {
                        background: #ffffff !important;
                        border-color: #cbd5e1 !important;
                        color: #111827 !important;
                    }
                    html[data-theme="light"] .admin-modal-btn.cancel,
                    :root[data-theme="light"] .admin-modal-btn.cancel {
                        background: #e5e7eb !important;
                        color: #4b5563 !important;
                        border-color: #cbd5e1 !important;
                    }
                    html[data-theme="light"] .admin-modal-btn.cancel:hover,
                    :root[data-theme="light"] .admin-modal-btn.cancel:hover {
                        background: #d1d5db !important;
                        color: #111827 !important;
                    }
                    html[data-theme="light"] .admin-quick-toggle-btn,
                    :root[data-theme="light"] .admin-quick-toggle-btn {
                        background: #f3f4f6 !important;
                        border-color: #cbd5e1 !important;
                        color: #4b5563 !important;
                    }
                    html[data-theme="light"] .admin-quick-toggle-btn:hover,
                    :root[data-theme="light"] .admin-quick-toggle-btn:hover {
                        background: #e5e7eb !important;
                        color: #111827 !important;
                    }
                `}</style>
            </div>
        );
    }
    if (isTeacher) {
        return (
            <div className="dashboard-home-container animate-enter">
                <div className="welcome-banner">
                    <div>
                        <h2>Welcome back, {user?.name || 'Teacher'}! 🍎</h2>
                        <p>Centralized Staff Portal — Course Work and Grading Audit Panel.</p>
                    </div>
                    <div className="date-badge">
                        <Calendar size={16} />
                        <span>{new Date().toLocaleDateString('en-GB')}</span>
                    </div>
                </div>
                <div className="stats-grid">
                    <div className="stat-card streak-card" style={{ borderLeft: '4px solid #818cf8' }}>
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(129, 140, 248, 0.15)' }}>
                            <BookOpenCheck size={24} color="#818cf8" />
                        </div>
                        <div className="stat-content">
                            <h3>Active Sections</h3>
                            <div className="stat-value">3 classes</div>
                            <p className="stat-subtitle">Applied Mathematics II</p>
                        </div>
                    </div>
                    <div className="stat-card pending-card" style={{ borderLeft: '4px solid #ff9800' }}>
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(255, 152, 0, 0.15)' }}>
                            <Clock size={24} color="#ff9800" />
                        </div>
                        <div className="stat-content">
                            <h3>Pending Grading</h3>
                            <div className="stat-value">12 Submissions</div>
                            <p className="stat-subtitle">Calculations assignment</p>
                        </div>
                    </div>
                    <div className="stat-card event-card" style={{ borderLeft: '4px solid #10b981' }}>
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                            <Calendar size={24} color="#10b981" />
                        </div>
                        <div className="stat-content">
                            <h3>Next Lecture</h3>
                            <div className="stat-value event-name" style={{ fontSize: '0.85rem' }}>Math Section B</div>
                            <p className="stat-subtitle">Today, 10:15 AM (Room L-301)</p>
                        </div>
                    </div>
                    <div className="stat-card xp-card" style={{ borderLeft: '4px solid #f472b6' }}>
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(244, 114, 182, 0.15)' }}>
                            <Trophy size={24} color="#f472b6" />
                        </div>
                        <div className="stat-content">
                            <h3>Reputation XP</h3>
                            <div className="stat-value">2,100 XP</div>
                            <p className="stat-subtitle">Level 5 Educator</p>
                        </div>
                    </div>
                </div>
                <div className="roadmap-teaser animate-enter">
                    <div className="teaser-content">
                        <div className="icon-box" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                            <CheckCircle size={32} color="#10b981" />
                        </div>
                        <div>
                            <h3>Academic Directives: Syllabus Target reached 85%!</h3>
                            <p>You have successfully kept your Applied Mathematics II course workload on track for Section A.</p>
                        </div>
                    </div>
                </div>
                {/* Simulated charts to ensure full aesthetic completeness */}
                <div className="charts-grid" style={{ marginTop: '2rem' }}>
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3>Section Attendance Rate</h3>
                        </div>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={attendanceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {attendanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="chart-center-text">
                                <span className="percentage">85%</span>
                                <span className="label">Present</span>
                            </div>
                        </div>
                    </div>
                    <div className="chart-card wide-chart">
                        <div className="chart-header">
                            <h3>Weekly Workload Hours</h3>
                        </div>
                        <div className="chart-wrapper bar-chart-wrapper">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={studyHoursData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                    <XAxis dataKey="day" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                                    <Bar dataKey="hours" fill="#818cf8" radius={[6, 6, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    // Default Student view
    return (
        <div className="dashboard-home-container animate-enter">
            <div className="welcome-banner">
                <div>
                    <h2>Welcome back, {isTeacher ? `Professor ${user?.name || 'Teacher'}` : (user?.name || 'Student')}!</h2>
                    <p>{isTeacher ? 'Your centralized portal for class management and resource sharing.' : 'Your centralized hub for academic excellence.'}</p>
                </div>
                <div className="date-badge">
                    <Calendar size={16} />
                    <span>{new Date().toLocaleDateString('en-GB')}</span>
                </div>
            </div>
            <div className="stats-grid">
                <div className="stat-card streak-card">
                    <div className="stat-icon-wrapper">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>Study Streak</h3>
                        <div className="stat-value">12 Days <span className="fire-emoji">🔥</span></div>
                        <p className="stat-subtitle">Keep it up!</p>
                    </div>
                </div>
                <div className="stat-card pending-card">
                    <div className="stat-icon-wrapper">
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>Tasks Pending</h3>
                        <div className="stat-value">5</div>
                        <p className="stat-subtitle">High Priority</p>
                    </div>
                </div>
                <div className="stat-card event-card">
                    <div className="stat-icon-wrapper">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>Next Event</h3>
                        <div className="stat-value event-name">Math Marathon</div>
                        <p className="stat-subtitle">Today, 2:00 PM</p>
                    </div>
                </div>
                <div className="stat-card xp-card">
                    <div className="stat-icon-wrapper">
                        <TrendingUp size={24} color="var(--accent-action)" />
                    </div>
                    <div className="stat-content">
                        <h3>Current XP</h3>
                        <div className="stat-value">4,500 <span className="rank-badge">#2</span></div>
                        <p className="stat-subtitle">Scholar Rank</p>
                    </div>
                </div>
                {role === 'teacher' ? (
                    <>
                        <div className="stat-card streak-card">
                            <div className="stat-icon-wrapper">
                                <TrendingUp size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>Today's Classes</h3>
                                <div className="stat-value">3 Lectures</div>
                                <p className="stat-subtitle">Next: CSE at 9:00 AM</p>
                            </div>
                        </div>

                        <div className="stat-card pending-card">
                            <div className="stat-icon-wrapper">
                                <AlertCircle size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>Grading Queue</h3>
                                <div className="stat-value">15 Papers</div>
                                <p className="stat-subtitle">Assignment 2</p>
                            </div>
                        </div>

                        <div className="stat-card event-card">
                            <div className="stat-icon-wrapper">
                                <Clock size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>Active Doubts</h3>
                                <div className="stat-value event-name">8 Pending</div>
                                <p className="stat-subtitle">From CSE & ECE Stream</p>
                            </div>
                        </div>

                        <div className="stat-card xp-card">
                            <div className="stat-icon-wrapper">
                                <BookOpen size={24} color="var(--accent-action)" />
                            </div>
                            <div className="stat-content">
                                <h3>Shared Notes</h3>
                                <div className="stat-value">6 Documents</div>
                                <p className="stat-subtitle">Verified by HOD</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="stat-card streak-card">
                            <div className="stat-icon-wrapper">
                                <TrendingUp size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>Study Streak</h3>
                                <div className="stat-value">12 Days <span className="fire-emoji">🔥</span></div>
                                <p className="stat-subtitle">Keep it up!</p>
                            </div>
                        </div>

                        <div className="stat-card pending-card">
                            <div className="stat-icon-wrapper">
                                <AlertCircle size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>Tasks Pending</h3>
                                <div className="stat-value">5</div>
                                <p className="stat-subtitle">High Priority</p>
                            </div>
                        </div>

                        <div className="stat-card event-card">
                            <div className="stat-icon-wrapper">
                                <Clock size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>Next Event</h3>
                                <div className="stat-value event-name">Math Marathon</div>
                                <p className="stat-subtitle">Today, 2:00 PM</p>
                            </div>
                        </div>

                        <div className="stat-card xp-card">
                            <div className="stat-icon-wrapper">
                                <TrendingUp size={24} color="var(--accent-action)" />
                            </div>
                            <div className="stat-content">
                                <h3>Current XP</h3>
                                <div className="stat-value">4,500 <span className="rank-badge">#2</span></div>
                                <p className="stat-subtitle">Scholar Rank</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className="roadmap-teaser animate-enter">
                <div className="teaser-content">
                    <div className="icon-box">
                        <Target size={32} color="var(--accent-primary)" />
                    </div>
                    <div>
                        {role === 'teacher' ? (
                            <>
                                <h3>Active Course: Introduction to Computer Science</h3>
                                <p>Next assessment prediction generated. 82% of students are ready for the internal exam.</p>
                            </>
                        ) : (
                            <>
                                <h3>AI Study Goal: Mastering Calculus</h3>
                                <p>You have 2 topics left to revise for your upcoming 2024 Exam.</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>{role === 'teacher' ? 'Class Attendance Average' : 'Overall Attendance'}</h3>
                        <button className="chart-action-btn">{role === 'teacher' ? 'View Roll' : 'View Details'}</button>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={attendanceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {attendanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-center-text">
                            <span className="percentage">85%</span>
                            <span className="label">{role === 'teacher' ? 'Average' : 'Present'}</span>
                        </div>
                    </div>
                </div>
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>{role === 'teacher' ? 'Assignment Submission Rate' : 'Task Progress'}</h3>
                        <button className="chart-action-btn">{role === 'teacher' ? 'Grade All' : 'Manage'}</button>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={taskData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {taskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-center-text">
                            <span className="percentage">{role === 'teacher' ? '70%' : '12/17'}</span>
                            <span className="label">{role === 'teacher' ? 'Turned In' : 'Done'}</span>
                        </div>
                    </div>
                </div>
                <div className="chart-card wide-chart">
                    <div className="chart-header">
                        <h3>{role === 'teacher' ? 'Teaching & Consultation Hours' : 'Study Hours This Week'}</h3>
                        <div className="chart-legend-custom">
                            <span className="dot" style={{ background: '#4F46E5' }}></span> Hours
                        </div>
                    </div>
                    <div className="chart-wrapper bar-chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={studyHoursData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis dataKey="day" tick={{ fill: '#888' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e1e1e', borderRadius: '8px' }} />
                                <Bar dataKey="hours" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={40}>
                                    {studyHoursData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#4F46E5" opacity={index % 2 === 0 ? 1 : 0.6} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default DashboardHome;
