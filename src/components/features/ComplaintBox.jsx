"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockBackend } from '../../services/mockBackend';
import { 
    Shield, ShieldAlert, CheckCircle, RefreshCw, 
    AlertTriangle, Filter, Eye, MessageSquare, 
    Send, Clock, User, Check 
} from 'lucide-react';
import './FeatureStyles.css';

export default function ComplaintBox() {
    const { user } = useAuth();
    
    // =========================================================================
    // STUDENT VIEW STATES & HANDLERS
    // =========================================================================
    const [complaint, setComplaint] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [activeTab, setActiveTab] = useState('anonymous'); // 'anonymous' or 'counseling'
    const [counselingTopic, setCounselingTopic] = useState('Academic');
    const [counselingMsg, setCounselingMsg] = useState('');
    const [isAnonymousCounseling, setIsAnonymousCounseling] = useState(false);
    const [counselingSubmitted, setCounselingSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!complaint.trim()) return;
        
        mockBackend.addAnonymousSuggestion('Student Suggestion', complaint);
        setSubmitted(true);
        setComplaint('');
        setTimeout(() => setSubmitted(false), 3000);
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('mock-backend-update'));
        }
    };

    const handleCounselingSubmit = (e) => {
        e.preventDefault();
        if (!counselingMsg.trim()) return;

        const ticket = {
            studentName: isAnonymousCounseling ? 'Anonymous Student' : (user?.name || 'Bharath Kumar A'),
            usn: isAnonymousCounseling ? 'ECE-2A' : (user?.usn || '4VV25EC001'),
            topic: `${counselingTopic} issue`,
            message: counselingMsg
        };

        mockBackend.addCounselingTicket(ticket);
        setCounselingMsg('');
        setCounselingSubmitted(true);
        setTimeout(() => setCounselingSubmitted(false), 3000);

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('mock-backend-update'));
        }
    };

    // =========================================================================
    // ADVISOR / TEACHER VIEW STATES & HANDLERS
    // =========================================================================
    const [advisorTab, setAdvisorTab] = useState('suggestions'); // 'suggestions' or 'counseling'
    const [suggestions, setSuggestions] = useState(mockBackend.anonymousSuggestions || []);
    const [counselingTickets, setCounselingTickets] = useState(mockBackend.counselingTickets || []);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessageText, setNewMessageText] = useState('');
    const [isStudentTyping, setIsStudentTyping] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    // Cross-tab synchronization
    useEffect(() => {
        const handleSync = () => {
            setSuggestions([...mockBackend.anonymousSuggestions]);
            setCounselingTickets([...mockBackend.counselingTickets]);
            if (selectedTicket) {
                setChatMessages([...(mockBackend.counselingChats[selectedTicket.id] || [])]);
            }
        };
        if (typeof window !== 'undefined') {
            window.addEventListener('mock-backend-update', handleSync);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('mock-backend-update', handleSync);
            }
        };
    }, [selectedTicket]);

    const triggerToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 4500);
    };

    const handleResolveSuggestion = (id) => {
        const res = mockBackend.resolveAnonymousSuggestion(id);
        if (res.success) {
            setSuggestions([...mockBackend.anonymousSuggestions]);
            triggerToast('Suggestion successfully acknowledged & resolved!');
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('mock-backend-update'));
            }
        }
    };

    const handleEscalateSuggestion = (id) => {
        const res = mockBackend.escalateAnonymousSuggestion(id);
        if (res.success) {
            setSuggestions([...mockBackend.anonymousSuggestions]);
            triggerToast('Suggestion escalated directly to HOD & Academic Dean!');
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('mock-backend-update'));
            }
        }
    };

    const handleSelectTicket = (ticket) => {
        setSelectedTicket(ticket);
        setChatMessages([...(mockBackend.counselingChats[ticket.id] || [])]);
        setNewMessageText('');
        setIsStudentTyping(false);
    };

    const handleSendChatMessage = (e) => {
        e.preventDefault();
        if (!selectedTicket || !newMessageText.trim()) return;

        const ticketId = selectedTicket.id;
        const msgText = newMessageText.trim();

        // 1. Add advisor reply to backend & update local list
        mockBackend.addCounselingChatMessage(ticketId, 'advisor', msgText);
        setChatMessages([...(mockBackend.counselingChats[ticketId] || [])]);
        setNewMessageText('');

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('mock-backend-update'));
        }

        // 2. Trigger student simulated active reply
        setIsStudentTyping(true);

        setTimeout(() => {
            let studentReply = "Okay, professor. I will make sure to work on this and meet you at the cabin.";
            const topicLower = (selectedTicket.topic || '').toLowerCase();
            
            if (topicLower.includes('acad')) {
                studentReply = "Thanks for the feedback, Dr. Bhavana. I will fetch the math tutorial guidelines tomorrow. See you at 10 AM!";
            } else if (topicLower.includes('hostel')) {
                studentReply = "Thank you so much! I really appreciate you coordinating library hour permissions with the hostel warden.";
            } else if (topicLower.includes('person')) {
                studentReply = "Thanks for the guidance, professor. It feels much lighter speaking to you. I will keep you posted.";
            }

            mockBackend.addCounselingChatMessage(ticketId, 'student', studentReply);
            setChatMessages([...(mockBackend.counselingChats[ticketId] || [])]);
            setIsStudentTyping(false);

            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('mock-backend-update'));
            }
            triggerToast(`New message received from ${selectedTicket.studentName}!`);
        }, 1200);
    };

    const handleResolveTicket = (ticketId) => {
        const res = mockBackend.resolveCounselingTicket(ticketId);
        if (res.success) {
            setCounselingTickets([...mockBackend.counselingTickets]);
            if (selectedTicket && selectedTicket.id === ticketId) {
                setSelectedTicket({ ...selectedTicket, status: 'Resolved' });
            }
            triggerToast('Counseling ticket marked as RESOLVED successfully!');
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('mock-backend-update'));
            }
        }
    };

    // =========================================================================
    // DEAN ADMIN DESK STATES & HANDLERS
    // =========================================================================
    const [filterCategory, setFilterCategory] = useState('All');
    const [incidents, setIncidents] = useState([
        { id: 'inc-1', title: 'Power Grid Load Surge in Mech Lab', category: 'High Risk', time: '15:40:02', status: 'Unresolved', reporter: 'RFID Telemetry System' },
        { id: 'inc-2', title: 'Water leakage in CSE Block Restrooms (3rd Floor)', category: 'Operational', time: '15:20:10', status: 'Unresolved', reporter: 'Anonymous Staff member' },
        { id: 'inc-3', title: 'BLE Beacon CSE-Lab-3 disconnect alert', category: 'High Risk', time: '14:55:00', status: 'Resolved', reporter: 'Telemetry Monitor' },
        { id: 'inc-4', title: 'Smart Exam Predictor scheduler conflict', category: 'Operational', time: '13:12:05', status: 'Unresolved', reporter: 'Prof. alan' }
    ]);
    const [escalationMsg, setEscalationMsg] = useState('');

    const handleResolveIncident = (id, title) => {
        setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'Resolved' } : inc));
        setEscalationMsg(`Incident RESOLVED: ${title}`);
        setTimeout(() => setEscalationMsg(''), 4000);
    };

    const handleEscalateIncident = (id, title) => {
        setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'Escalated to Dean' } : inc));
        setEscalationMsg(`DISPATCHED: Escalation alert sent to Campus Warden & Operational Dean for incident: ${title}`);
        setTimeout(() => setEscalationMsg(''), 5000);
    };

    const filteredIncidents = incidents.filter(inc => {
        if (filterCategory === 'All') return true;
        return inc.category === filterCategory;
    });

    // =========================================================================
    // RENDERING DECISIONS BY USER ROLES
    // =========================================================================
    
    // Dean Admin View
    if (user?.role === 'admin') {
        return (
            <div className="telemetry-container animate-enter" style={{ color: 'var(--text-primary)', padding: '1.5rem 0.5rem', backgroundColor: '#030712' }}>
                <div className="lms-title-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <span>Escalation Desk</span>
                    <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 500, color: 'var(--accent-primary)' }}>
                        Institutional Action-filtered incidents & campus operations tickets
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={escCardStyle}>
                        <h4 style={escLabelStyle}>Active Incidents</h4>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>
                            {incidents.filter(i => i.status === 'Unresolved').length} Tickets
                        </div>
                        <span style={escSubStyle}>Requires review</span>
                    </div>
                    <div style={escCardStyle}>
                        <h4 style={escLabelStyle}>Average Resolution Time</h4>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>18 mins</div>
                        <span style={escSubStyle}>R&D maintenance SLA</span>
                    </div>
                    <div style={escCardStyle}>
                        <h4 style={escLabelStyle}>Critical Alerts</h4>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>
                            {incidents.filter(i => i.category === 'High Risk' && i.status !== 'Resolved').length} Active
                        </div>
                        <span style={escSubStyle}>High energy or safety locks</span>
                    </div>
                    <div style={escCardStyle}>
                        <h4 style={escLabelStyle}>Total Reports Today</h4>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa' }}>12 Incidents</div>
                        <span style={escSubStyle}>9 resolved successfully</span>
                    </div>
                </div>

                {escalationMsg && (
                    <div style={{
                        padding: '12px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid #6366f1',
                        color: '#c7d2fe',
                        fontSize: '0.82rem',
                        fontWeight: '500',
                        marginBottom: '1.5rem'
                    }}>
                        {escalationMsg}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(31, 41, 55, 0.3)', border: '2px solid var(--border-color)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={18} color="#6366f1" />
                        <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>Filter Incidents Category:</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['All', 'High Risk', 'Operational'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                style={{
                                    background: filterCategory === cat ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                                    border: filterCategory === cat ? '1px solid #6366f1' : '1px solid #374151',
                                    color: filterCategory === cat ? '#a5b4fc' : '#9ca3af',
                                    padding: '6px 14px',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    fontSize: '0.72rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {cat.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={escPanelStyle}>
                    <h3 style={escPanelTitleStyle}>Campus Escalation Desk & Incident Pipeline</h3>
                    <p style={{ fontSize: '0.72rem', color: '#888', marginBottom: '1rem' }}>
                        Track and resolve critical telemetry network locks and student welfare complaints.
                    </p>

                    <div className="lms-table-container" style={{ margin: 0 }}>
                        <table className="lms-table">
                            <thead>
                                <tr>
                                    <th>Incident Title</th>
                                    <th>Category</th>
                                    <th>Log Time</th>
                                    <th>Source / Reporter</th>
                                    <th>Status Badge</th>
                                    <th>Action Panel</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIncidents.map(inc => (
                                    <tr key={inc.id}>
                                        <td style={{ fontWeight: '700' }}>{inc.title}</td>
                                        <td>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 'bold',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: inc.category === 'High Risk' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                border: inc.category === 'High Risk' ? '1px solid #ef4444' : '1px solid #f59e0b',
                                                color: inc.category === 'High Risk' ? '#ef4444' : '#f59e0b'
                                            }}>
                                                {inc.category}
                                            </span>
                                        </td>
                                        <td style={{ fontFamily: 'monospace' }}>{inc.time}</td>
                                        <td>{inc.reporter}</td>
                                        <td style={{ fontWeight: 'bold', color: inc.status === 'Resolved' ? '#10b981' : inc.status === 'Unresolved' ? '#ef4444' : '#60a5fa' }}>
                                            {inc.status}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {inc.status === 'Unresolved' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleResolveIncident(inc.id, inc.title)}
                                                            style={{
                                                                background: 'rgba(16, 185, 129, 0.15)',
                                                                border: '1px solid #10b981',
                                                                color: '#10b981',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 'bold',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Resolve
                                                        </button>
                                                        <button
                                                            onClick={() => handleEscalateIncident(inc.id, inc.title)}
                                                            style={{
                                                                background: 'rgba(99, 102, 241, 0.15)',
                                                                border: '1px solid #6366f1',
                                                                color: '#6366f1',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 'bold',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Escalate
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>
                                                        ✓ Action Stamped
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // Class Advisor / Teacher Intake & Direct Chat View
    if (user?.role === 'teacher') {
        return (
            <div className="telemetry-container animate-enter" style={{ color: 'var(--text-primary)', padding: '1.5rem 0.5rem', backgroundColor: 'var(--bg-app-background)' }}>
                <style>{`
                    .advisor-complaints-layout {
                        display: flex;
                        flex-direction: column;
                        gap: 1.5rem;
                        margin-top: 1rem;
                    }
                    .advisor-split-pane {
                        display: grid;
                        grid-template-columns: 340px 1fr;
                        gap: 0;
                        background: rgba(17, 24, 39, 0.45);
                        border: 1.5px solid rgba(255, 255, 255, 0.08);
                        border-radius: 12px;
                        height: 560px;
                        overflow: hidden;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.4);
                    }
                    .chat-left-list {
                        border-right: 1.5px solid rgba(255, 255, 255, 0.08);
                        overflow-y: auto;
                        display: flex;
                        flex-direction: column;
                        background: rgba(10, 15, 30, 0.4);
                    }
                    .chat-ticket-card {
                        padding: 16px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        cursor: pointer;
                        transition: all 0.2s ease;
                        text-align: left;
                    }
                    .chat-ticket-card:hover {
                        background: rgba(255, 255, 255, 0.02);
                    }
                    .chat-ticket-card.active {
                        background: rgba(251, 191, 36, 0.06);
                        border-left: 4px solid #fbbf24;
                    }
                    .chat-right-panel {
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                        background: #040612;
                    }
                    .chat-header-bar {
                        padding: 16px 20px;
                        border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: rgba(17, 24, 39, 0.85);
                    }
                    .chat-messages-area {
                        flex-grow: 1;
                        overflow-y: auto;
                        padding: 20px;
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    }
                    .chat-bubble {
                        max-width: 65%;
                        padding: 10px 14px;
                        border-radius: 10px;
                        font-size: 0.85rem;
                        line-height: 1.45;
                        text-align: left;
                    }
                    .chat-bubble.student {
                        background: rgba(255, 255, 255, 0.04);
                        border: 1.5px solid rgba(255, 255, 255, 0.06);
                        color: #e5e7eb;
                        align-self: flex-start;
                        border-bottom-left-radius: 2px;
                    }
                    .chat-bubble.advisor {
                        background: linear-gradient(135deg, #fbbf24, #d97706);
                        color: #000;
                        align-self: flex-end;
                        font-weight: 700;
                        border-bottom-right-radius: 2px;
                    }
                    .chat-input-bar {
                        padding: 14px 16px;
                        border-top: 1px solid rgba(255, 255, 255, 0.08);
                        display: flex;
                        gap: 10px;
                        background: rgba(17, 24, 39, 0.65);
                    }
                    .chat-input-field {
                        flex-grow: 1;
                        background: #090d16;
                        border: 1.5px solid rgba(255,255,255,0.08);
                        border-radius: 6px;
                        padding: 10px 14px;
                        color: white;
                        font-size: 0.85rem;
                        outline: none;
                        transition: border-color 0.2s;
                    }
                    .chat-input-field:focus {
                        border-color: #fbbf24;
                    }
                    .typing-indicator {
                        align-self: flex-start;
                        font-size: 0.75rem;
                        font-style: italic;
                        color: #9ca3af;
                        margin-left: 8px;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    .suggestions-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                        gap: 1.25rem;
                        margin-top: 1rem;
                    }
                    .suggestion-card {
                        background: rgba(17, 24, 39, 0.45);
                        border: 1.5px solid rgba(255, 255, 255, 0.08);
                        border-radius: 12px;
                        padding: 1.25rem;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        text-align: left;
                    }
                    .live-complaints-toast {
                        position: fixed;
                        bottom: 24px;
                        right: 24px;
                        background: #111827;
                        border: 1.5px solid #fbbf24;
                        box-shadow: 0 0 15px rgba(251,191,36,0.3);
                        padding: 12px 24px;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        color: #fff;
                        font-size: 0.9rem;
                        z-index: 10000;
                    }
                    /* ==================== LIGHT THEME OVERRIDES ==================== */
                    html[data-theme="light"] .advisor-split-pane,
                    :root[data-theme="light"] .advisor-split-pane {
                        background: #ffffff !important;
                        border-color: #cbd5e1 !important;
                        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05) !important;
                    }
                    html[data-theme="light"] .chat-left-list,
                    :root[data-theme="light"] .chat-left-list {
                        border-right-color: #cbd5e1 !important;
                        background: #f9fafb !important;
                    }
                    html[data-theme="light"] .chat-ticket-card,
                    :root[data-theme="light"] .chat-ticket-card {
                        border-bottom-color: #e5e7eb !important;
                    }
                    html[data-theme="light"] .chat-ticket-card:hover,
                    :root[data-theme="light"] .chat-ticket-card:hover {
                        background: #f3f4f6 !important;
                    }
                    html[data-theme="light"] .chat-ticket-card.active,
                    :root[data-theme="light"] .chat-ticket-card.active {
                        background: rgba(251, 191, 36, 0.08) !important;
                    }
                    html[data-theme="light"] .chat-right-panel,
                    :root[data-theme="light"] .chat-right-panel {
                        background: #ffffff !important;
                    }
                    html[data-theme="light"] .chat-header-bar,
                    :root[data-theme="light"] .chat-header-bar {
                        border-bottom-color: #cbd5e1 !important;
                        background: #f3f4f6 !important;
                    }
                    html[data-theme="light"] .chat-bubble.student,
                    :root[data-theme="light"] .chat-bubble.student {
                        background: #f3f4f6 !important;
                        border-color: #e5e7eb !important;
                        color: #111827 !important;
                    }
                    html[data-theme="light"] .chat-input-bar,
                    :root[data-theme="light"] .chat-input-bar {
                        border-top-color: #cbd5e1 !important;
                        background: #f3f4f6 !important;
                    }
                    html[data-theme="light"] .chat-input-field,
                    :root[data-theme="light"] .chat-input-field {
                        background: #ffffff !important;
                        border-color: #cbd5e1 !important;
                        color: #111827 !important;
                    }
                    html[data-theme="light"] .suggestion-card,
                    :root[data-theme="light"] .suggestion-card {
                        background: #ffffff !important;
                        border-color: #e5e7eb !important;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
                    }
                    html[data-theme="light"] .live-complaints-toast,
                    :root[data-theme="light"] .live-complaints-toast {
                        background: #ffffff !important;
                        color: #111827 !important;
                        border-color: #fbbf24 !important;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
                    }
                `}</style>

                {/* Toast Notification */}
                {toastMsg && (
                    <div className="live-complaints-toast animate-enter">
                        <CheckCircle size={18} color="#fbbf24" />
                        <span>{toastMsg}</span>
                    </div>
                )}

                {/* Header Title */}
                <div className="lms-title-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                            Dr. Bhavana — ECE Intake Desk 🛡️
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.85rem' }}>
                            Acknowledge anonymous student complaints & secure private counseling chat sessions
                        </p>
                    </div>
                </div>

                {/* Tab switcher */}
                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '30px', border: '1px solid var(--border-color)', width: 'fit-content', margin: '0 auto 2rem auto' }}>
                    <button 
                        onClick={() => { setAdvisorTab('suggestions'); setSelectedTicket(null); }}
                        style={{
                            border: 'none',
                            background: advisorTab === 'suggestions' ? 'linear-gradient(135deg, #fbbf24, #d97706)' : 'transparent',
                            color: advisorTab === 'suggestions' ? '#000' : '#9ca3af',
                            padding: '8px 20px',
                            borderRadius: '20px',
                            fontSize: '0.82rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <ShieldAlert size={14} />
                        Anonymous Suggestion Intake
                    </button>
                    <button 
                        onClick={() => setAdvisorTab('counseling')}
                        style={{
                            border: 'none',
                            background: advisorTab === 'counseling' ? 'linear-gradient(135deg, #fbbf24, #d97706)' : 'transparent',
                            color: advisorTab === 'counseling' ? '#000' : '#9ca3af',
                            padding: '8px 20px',
                            borderRadius: '20px',
                            fontSize: '0.82rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <MessageSquare size={14} />
                        Private Counseling & Chats
                    </button>
                </div>

                <div className="advisor-complaints-layout">
                    {advisorTab === 'suggestions' ? (
                        <div className="suggestions-grid">
                            {suggestions.map(sug => (
                                <div key={sug.id} className="suggestion-card animate-enter">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.68rem', fontWeight: '800', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                            Anonymous ECE-2A Suggestion
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {new Date(sug.date).toLocaleDateString('en-GB')}
                                        </span>
                                    </div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Category: {sug.topic || 'General'}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.45', margin: 0 }}>
                                        "{sug.message}"
                                    </p>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                                        <span style={{ 
                                            fontSize: '0.78rem', 
                                            fontWeight: '700',
                                            color: sug.status === 'Resolved' ? '#34d399' : sug.status.includes('Esca') ? '#fbbf24' : '#f87171' 
                                        }}>
                                            ● Status: {sug.status}
                                        </span>
                                        {sug.status === 'Unresolved' && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button 
                                                    onClick={() => handleResolveSuggestion(sug.id)}
                                                    style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid #34d399', color: '#34d399', fontSize: '0.72rem', fontWeight: '800', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    Resolve
                                                </button>
                                                <button 
                                                    onClick={() => handleEscalateSuggestion(sug.id)}
                                                    style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid #fbbf24', color: '#fbbf24', fontSize: '0.72rem', fontWeight: '800', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    Escalate
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="advisor-split-pane animate-enter">
                            {/* Left List Pane */}
                            <div className="chat-left-list">
                                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <MessageSquare size={16} /> Active Counseling Chats ({counselingTickets.length})
                                </div>
                                {counselingTickets.map(ticket => {
                                    const isActive = selectedTicket?.id === ticket.id;
                                    return (
                                        <div 
                                            key={ticket.id} 
                                            onClick={() => handleSelectTicket(ticket)}
                                            className={`chat-ticket-card ${isActive ? 'active' : ''}`}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)' }}>{ticket.studentName}</span>
                                                <span style={{ 
                                                    fontSize: '0.65rem', 
                                                    background: ticket.status === 'Resolved' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(251,191,36,0.12)',
                                                    color: ticket.status === 'Resolved' ? '#34d399' : '#fbbf24',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontWeight: '700'
                                                }}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '6px' }}>Topic: {ticket.topic}</div>
                                            <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {ticket.message}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right Message Pane */}
                            <div className="chat-right-panel">
                                {selectedTicket ? (
                                    <>
                                        {/* Header */}
                                        <div className="chat-header-bar">
                                            <div style={{ textAlign: 'left' }}>
                                                <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                                                    Secure Line: {selectedTicket.studentName} ({selectedTicket.usn})
                                                </h4>
                                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Issue: {selectedTicket.topic}</span>
                                            </div>
                                            {selectedTicket.status !== 'Resolved' && (
                                                <button 
                                                    onClick={() => handleResolveTicket(selectedTicket.id)}
                                                    style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', color: '#34d399', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <CheckCircle size={14} /> Resolve Ticket
                                                </button>
                                            )}
                                        </div>

                                        {/* Message area */}
                                        <div className="chat-messages-area">
                                            {chatMessages.map((msg, i) => (
                                                <div 
                                                    key={msg.id || i}
                                                    className={`chat-bubble ${msg.sender === 'student' ? 'student' : 'advisor'}`}
                                                >
                                                    <div>{msg.message}</div>
                                                    <div style={{ fontSize: '0.62rem', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                                                        {msg.time}
                                                    </div>
                                                </div>
                                            ))}
                                            {isStudentTyping && (
                                                <div className="typing-indicator animate-enter">
                                                    <div className="pulse-anim" style={{ animation: 'pulseGlow 1.2s infinite' }}>●</div> Student typing secure response...
                                                </div>
                                            )}
                                        </div>

                                        {/* Chat input */}
                                        <form onSubmit={handleSendChatMessage} className="chat-input-bar">
                                            <input 
                                                type="text"
                                                placeholder={selectedTicket.status === 'Resolved' ? "This ticket has been resolved." : "Type secure response to student..."}
                                                disabled={selectedTicket.status === 'Resolved'}
                                                value={newMessageText}
                                                onChange={(e) => setNewMessageText(e.target.value)}
                                                className="chat-input-field"
                                            />
                                            <button 
                                                type="submit"
                                                disabled={!newMessageText.trim() || selectedTicket.status === 'Resolved'}
                                                style={{
                                                    border: 'none',
                                                    background: newMessageText.trim() && selectedTicket.status !== 'Resolved' ? 'linear-gradient(135deg, #fbbf24, #d97706)' : '#1f2937',
                                                    color: newMessageText.trim() && selectedTicket.status !== 'Resolved' ? '#000' : '#4b5563',
                                                    padding: '10px 16px',
                                                    borderRadius: '6px',
                                                    cursor: newMessageText.trim() && selectedTicket.status !== 'Resolved' ? 'pointer' : 'default',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Send size={16} />
                                            </button>
                                        </form>
                                    </>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '12px', color: '#475569' }}>
                                        <MessageSquare size={48} />
                                        <div>
                                            <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: '800' }}>No active chat selected</h4>
                                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '280px' }}>
                                                Select a student private counseling ticket on the left list to engage in a secure direct conversation.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Default Student submission view
    return (
        <div className="feature-container animate-enter" style={{ color: 'var(--text-primary)', padding: '1.5rem 0.5rem' }}>
            <div className="feature-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 className="feature-title" style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {activeTab === 'anonymous' ? '🛡️ Anonymous Suggestion Box' : '💬 Private Counseling Desk'}
                </h1>
                <p className="feature-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px' }}>
                    {activeTab === 'anonymous' 
                        ? 'Voice your general campus concerns freely. Your identity is 100% hidden.' 
                        : 'Secure intake channel directly to your Section Advisor Bhavana for academic, hostel, or personal issues.'}
                </p>
            </div>

            {/* Tab switchers */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '30px', border: '1px solid var(--border-color)', width: 'fit-content', margin: '0 auto 2.5rem auto' }}>
                <button 
                    onClick={() => setActiveTab('anonymous')}
                    style={{
                        border: 'none',
                        background: activeTab === 'anonymous' ? 'linear-gradient(135deg, #fbbf24, #d97706)' : 'transparent',
                        color: activeTab === 'anonymous' ? '#000' : 'var(--text-secondary)',
                        padding: '8px 20px',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease'
                    }}
                >
                    Anonymous Suggestion Box
                </button>
                <button 
                    onClick={() => setActiveTab('counseling')}
                    style={{
                        border: 'none',
                        background: activeTab === 'counseling' ? 'linear-gradient(135deg, #fbbf24, #d97706)' : 'transparent',
                        color: activeTab === 'counseling' ? '#000' : 'var(--text-secondary)',
                        padding: '8px 20px',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease'
                    }}
                >
                    Private Counseling Line
                </button>
            </div>

            <div className="form-interface card" style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--bg-card)', border: '2px solid var(--border-color)', borderRadius: '12px', padding: '30px', boxShadow: 'var(--shadow-hard)' }}>
                {activeTab === 'anonymous' ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '700' }}>Your Complaint / Feedback (Anonymous) *</label>
                            <textarea 
                                value={complaint}
                                onChange={(e) => setComplaint(e.target.value)}
                                placeholder="State your concern here (e.g. library seating, hostel water availability)..."
                                style={{ width: '100%', height: '150px', padding: '15px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', resize: 'none' }}
                                required
                            />
                        </div>
                        <button type="submit" className="action-button" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #fbbf24, #d97706)', border: 'none', color: '#000', fontWeight: '900', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Submit Suggestion
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleCounselingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '700' }}>Select Issue Category *</label>
                            <select 
                                value={counselingTopic}
                                onChange={(e) => setCounselingTopic(e.target.value)}
                                style={{ width: '100%', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                            >
                                <option value="Academic">Academic stress / performance</option>
                                <option value="Hostel">Hostel permissions / issues</option>
                                <option value="Personal">Personal / mental wellbeing</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '700' }}>Detail your issue *</label>
                            <textarea 
                                value={counselingMsg}
                                onChange={(e) => setCounselingMsg(e.target.value)}
                                placeholder="Explain your situation in detail. This goes directly to Class Advisor Bhavana's command center..."
                                style={{ width: '100%', height: '140px', padding: '15px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', resize: 'none' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(251,191,36,0.04)', border: '1.5px dashed rgba(251,191,36,0.2)', padding: '12px', borderRadius: '8px', textAlign: 'left' }}>
                            <input 
                                type="checkbox" 
                                id="anonymous-counseling-check"
                                checked={isAnonymousCounseling}
                                onChange={(e) => setIsAnonymousCounseling(e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="anonymous-counseling-check" style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: '700', cursor: 'pointer' }}>
                                Keep My Submission Anonymous
                            </label>
                        </div>

                        <button type="submit" className="action-button" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #fbbf24, #d97706)', border: 'none', color: '#000', fontWeight: '900', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Submit Counseling Request
                        </button>
                    </form>
                )}

                {submitted && (
                    <div className="animate-enter" style={{ marginTop: '20px', padding: '15px', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid #34d399', borderRadius: '8px', color: '#34d399', fontWeight: '700', textAlign: 'center', fontSize: '0.85rem' }}>
                        ✓ Suggestion submitted anonymously in school records!
                    </div>
                )}

                {counselingSubmitted && (
                    <div className="animate-enter" style={{ marginTop: '20px', padding: '15px', background: 'rgba(167, 139, 250, 0.12)', border: '1px solid #a78bfa', borderRadius: '8px', color: '#c084fc', fontWeight: '700', textAlign: 'center', fontSize: '0.85rem' }}>
                        🎉 Direct counseling ticket securely dispatched to Class Advisor Bhavana!
                    </div>
                )}
            </div>
        </div>
    );
}

// Styling definitions
const escCardStyle = {
    background: 'var(--bg-card)',
    border: '2px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
};

const escLabelStyle = {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    marginBottom: '4px'
};

const escSubStyle = {
    fontSize: '0.65rem',
    color: '#666',
    display: 'block',
    marginTop: '2px'
};

const escPanelStyle = {
    background: 'var(--bg-card)',
    border: '2px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
};

const escPanelTitleStyle = {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: 'var(--text-primary)'
};
