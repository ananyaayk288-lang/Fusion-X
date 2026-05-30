'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import { 
    Cpu, Music, Trophy, Users, Calendar, MapPin, 
    Clock, ArrowLeft, Activity, Sparkles, ShieldAlert, 
    GraduationCap, TrendingUp, Search
} from 'lucide-react';
import './ClubsHub.css';
// Default Club Members & Committee Roster Database
const CLUB_ROSTER = {
    '11111111-1111-1111-1111-111111111111': {
        faculty: { name: 'Dr. Chandrashekar M.', role: 'Faculty Coordinator', initial: 'C' },
        committee: [
            { name: 'Bharath Kumar A.', role: 'President', initial: 'B', branch: 'ECE', year: '3', sem: '6', section: 'A' },
            { name: 'Anagha S. R.', role: 'Vice President', initial: 'A', branch: 'CSE', year: '3', sem: '6', section: 'B' },
            { name: 'Prajwal K. S.', role: 'Secretary', initial: 'P', branch: 'ISE', year: '2', sem: '4', section: 'A' },
            { name: 'Tarun Gowda', role: 'Technical Lead', initial: 'T', branch: 'ECE', year: '3', sem: '6', section: 'C' }
        ],
        members: [
            { name: 'Sahana R.', role: 'Active Member', initial: 'S', branch: 'ECE', year: '2', sem: '4', section: 'B' },
            { name: 'Varun S.', role: 'Active Member', initial: 'V', branch: 'ME', year: '2', sem: '4', section: 'A' },
            { name: 'Harshitha K.', role: 'Active Member', initial: 'H', branch: 'CSE', year: '1', sem: '2', section: 'C' }
        ]
    },
    '22222222-2222-2222-2222-222222222222': {
        faculty: { name: 'Prof. Raghavendra B.', role: 'Faculty Coordinator', initial: 'R' },
        committee: [
            { name: 'Bharath P.', role: 'President', initial: 'B', branch: 'CSE', year: '3', sem: '6', section: 'B' },
            { name: 'Neha S.', role: 'Vice President', initial: 'N', branch: 'ISE', year: '3', sem: '6', section: 'A' },
            { name: 'Abhijith K.', role: 'Secretary', initial: 'A', branch: 'CSE', year: '2', sem: '4', section: 'C' },
            { name: 'Nikhil Gowda', role: 'Competitive Lead', initial: 'N', branch: 'CSE', year: '3', sem: '6', section: 'A' }
        ],
        members: [
            { name: 'Rohan Das', role: 'Active Member', initial: 'R', branch: 'ISE', year: '2', sem: '4', section: 'B' },
            { name: 'Preeti M.', role: 'Active Member', initial: 'P', branch: 'CSE', year: '1', sem: '2', section: 'A' },
            { name: 'Shravan Gowda', role: 'Active Member', initial: 'S', branch: 'ECE', year: '2', sem: '4', section: 'C' }
        ]
    },
    '33333333-3333-3333-3333-333333333333': {
        faculty: { name: 'Prof. Hemalatha R.', role: 'Faculty Coordinator', initial: 'H' },
        committee: [
            { name: 'Ananya Y. K.', role: 'President', initial: 'A', branch: 'ISE', year: '3', sem: '6', section: 'A' },
            { name: 'Sneha R.', role: 'Vice President', initial: 'S', branch: 'ECE', year: '3', sem: '6', section: 'B' },
            { name: 'Rohit Sharma', role: 'Secretary', initial: 'R', branch: 'ME', year: '3', sem: '6', section: 'C' },
            { name: 'Priya M.', role: 'Creative Director', initial: 'P', branch: 'Art', year: '2', sem: '4', section: 'A' }
        ],
        members: [
            { name: 'Kiran V.', role: 'Active Member', initial: 'K', branch: 'CSE', year: '2', sem: '4', section: 'B' },
            { name: 'Anjali S.', role: 'Active Member', initial: 'A', branch: 'ECE', year: '1', sem: '2', section: 'C' }
        ]
    },
    '44444444-4444-4444-4444-444444444444': {
        faculty: { name: 'Dr. Ramesh Kumar', role: 'Faculty Coordinator / PED', initial: 'R' },
        committee: [
            { name: 'Praveen S.', role: 'President / Captain', initial: 'P', branch: 'ME', year: '3', sem: '6', section: 'A' },
            { name: 'Karan Singh', role: 'Vice President', initial: 'K', branch: 'ECE', year: '3', sem: '6', section: 'B' },
            { name: 'Sanjay D.', role: 'Secretary', initial: 'S', branch: 'ISE', year: '2', sem: '4', section: 'C' }
        ],
        members: [
            { name: 'Chethan K.', role: 'Active Member', initial: 'C', branch: 'CSE', year: '2', sem: '4', section: 'A' },
            { name: 'Vikram R.', role: 'Active Member', initial: 'V', branch: 'ME', year: '1', sem: '2', section: 'B' }
        ]
    }
};

export default function ClubsHub() {
    const supabase = createClient();
    const [clubs, setClubs] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedClub, setSelectedClub] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [activeEventTab, setActiveEventTab] = useState('all'); // all, live, upcoming
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchClubsAndEvents = async () => {
            try {
                setLoading(true);
                // 1. Fetch Clubs
                const { data: clubsData, error: clubsError } = await supabase
                    .from('clubs')
                    .select('*');

                if (clubsError) throw clubsError;
                setClubs(clubsData || []);

                // 2. Fetch all Events
                const { data: eventsData, error: eventsError } = await supabase
                    .from('campus_events')
                    .select('*');

                if (eventsError) throw eventsError;
                setEvents(eventsData || []);

            } catch (err) {
                console.warn("[ClubsHub UI] DB query warning, falling back to local model:", err);
                // In case Supabase client is not fully bound yet, use local high-fidelity seeds
                const localClubs = [
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
                        name: 'Binary Beasts coding Club',
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
                setClubs(localClubs);

                const localEvents = [
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
                setEvents(localEvents);
            } finally {
                setLoading(false);
            }
        };

        fetchClubsAndEvents();
    }, []);

    // Helpers to render type icons
    const renderClubLogo = (logoName) => {
        switch (logoName?.toLowerCase()) {
            case 'cpu':
                return <Cpu size={24} />;
            case 'music':
                return <Music size={24} />;
            case 'trophy':
                return <Trophy size={24} />;
            default:
                return <GraduationCap size={24} />;
        }
    };

    // Filter logic
    const filteredClubs = clubs.filter(club => {
        const matchesCategory = activeFilter === 'all' || club.type === activeFilter;
        const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              club.department.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const activeClubEvents = events.filter(event => event.club_id === selectedClub?.id);

    const filteredEvents = activeClubEvents.filter(event => {
        if (activeEventTab === 'all') return event.status !== 'completed'; // only live/upcoming
        return event.status === activeEventTab;
    });

    if (loading) {
        return (
            <div style={{ height: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <Activity size={32} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }} />
                <span>SYNCHRONIZING DYNAMIC CORE DIRECTORY...</span>
            </div>
        );
    }

    // Circular RFID Attendance Gauge Geometry
    const radius = 54;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="club-hub-container">
            {!selectedClub ? (
                // --- GRID DIRECTORY CATALOG ---
                <>
                    <div className="clubs-header-section">
                        <div className="clubs-header-left">
                            <h1>Institutional Clubs Hub</h1>
                            <p>Centralized PR Directory & Live Pipelines for Campus Student Organizations</p>
                        </div>
                        <div className="club-filters">
                            <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
                                <Activity size={14} /> All
                            </button>
                            <button className={`filter-btn ${activeFilter === 'technical' ? 'active' : ''}`} onClick={() => setActiveFilter('technical')}>
                                <Cpu size={14} /> Technical
                            </button>
                            <button className={`filter-btn ${activeFilter === 'cultural' ? 'active' : ''}`} onClick={() => setActiveFilter('cultural')}>
                                <Music size={14} /> Cultural
                            </button>
                            <button className={`filter-btn ${activeFilter === 'sports' ? 'active' : ''}`} onClick={() => setActiveFilter('sports')}>
                                <Trophy size={14} /> Sports
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
                            <input 
                                type="text" 
                                placeholder="Search clubs by name, specialty, or keywords..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    background: 'var(--bg-secondary)',
                                    border: '1.5px solid var(--border-color)',
                                    borderRadius: '12px',
                                    padding: '12px 12px 12px 42px',
                                    fontSize: '0.9rem',
                                    width: '100%',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>
                    </div>

                    <div className="clubs-grid">
                        {filteredClubs.map(club => {
                            const upcomingCount = events.filter(e => e.club_id === club.id && e.status !== 'completed').length;
                            return (
                                <div 
                                    key={club.id} 
                                    className={`club-card ${club.type}`} 
                                    onClick={() => { setSelectedClub(club); setActiveEventTab('all'); }}
                                >
                                    <div className="club-card-header">
                                        <div className="club-logo-box">
                                            {renderClubLogo(club.logo)}
                                        </div>
                                        <span className="club-badge">{club.type}</span>
                                    </div>
                                    <div className="club-card-content">
                                        <h3>{club.name}</h3>
                                        <p>{club.description}</p>
                                    </div>
                                    <div className="club-card-footer">
                                        <div className="metric-mini">
                                            <span>RFID Footfall:</span> {club.avg_attendance_rate}%
                                        </div>
                                        <div className="metric-mini">
                                            <span>Live Pipeline:</span> {upcomingCount} Active
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                // --- SINGLE CLUB PROFILE VIEW ---
                <>
                    <button className="back-btn" onClick={() => setSelectedClub(null)}>
                        <ArrowLeft size={16} /> Back to Directory
                    </button>

                    <div className={`club-profile-header-card ${selectedClub.type}`}>
                        <div className="profile-header-main">
                            <div className="profile-logo-wrapper">
                                {renderClubLogo(selectedClub.logo)}
                            </div>
                            <div className="profile-meta-details">
                                <h2>{selectedClub.name}</h2>
                                <p className="profile-dept-line">{selectedClub.department}</p>
                                <div className="profile-badge-row">
                                    <span className="meta-badge active-batch">
                                        <Sparkles size={12} /> Active Batch: {selectedClub.batch_year}
                                    </span>
                                    <span className="meta-badge">
                                        Category: {selectedClub.type.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-grid-layout">
                        {/* LEFT COLUMN: AI analytics and event pipeline */}
                        <div className="profile-left-column">
                            {/* RFID Footfall Efficiency Metric */}
                            <div className="efficiency-dashboard-card">
                                <div className="efficiency-card-header">
                                    <TrendingUp size={20} style={{ color: '#10b981' }} />
                                    <h3>RFID Footfall & Efficiency Analytics</h3>
                                    <span className="ai-glow-badge">AI Derived</span>
                                </div>
                                <div className="efficiency-visuals">
                                    <div className="gauge-container">
                                        <svg className="gauge-svg" width="140" height="140" viewBox="0 0 140 140">
                                            <circle className="gauge-bg" cx="70" cy="70" r={radius} />
                                            <circle 
                                                className="gauge-fill" 
                                                cx="70" 
                                                cy="70" 
                                                r={radius} 
                                                strokeDasharray={circumference}
                                                strokeDashoffset={circumference - (selectedClub.avg_attendance_rate / 100) * circumference}
                                            />
                                        </svg>
                                        <div className="gauge-center-text">
                                            <span className="gauge-val">{selectedClub.avg_attendance_rate}%</span>
                                            <span className="gauge-lbl">Attendance</span>
                                        </div>
                                    </div>
                                    <div className="frequency-card-details">
                                        <div className="freq-row">
                                            <span className="freq-label">Event Frequency</span>
                                            <span className="freq-value">{selectedClub.event_frequency} / month</span>
                                        </div>
                                        <div className="freq-row">
                                            <span className="freq-label">Engagement Level</span>
                                            <span className="freq-value" style={{ color: '#10b981', fontWeight: 800 }}>EXCELLENT</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Pipeline Tab */}
                            <div className="events-pipeline-section">
                                <div className="events-section-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar size={20} />
                                        <h3>Active Events Pipeline</h3>
                                    </div>
                                    <div className="events-tabs">
                                        <button className={`tab-btn ${activeEventTab === 'all' ? 'active' : ''}`} onClick={() => setActiveEventTab('all')}>
                                            All Live & Upcoming
                                        </button>
                                        <button className={`tab-btn ${activeEventTab === 'live' ? 'active' : ''}`} onClick={() => setActiveEventTab('live')}>
                                            Live Now
                                        </button>
                                        <button className={`tab-btn ${activeEventTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveEventTab('upcoming')}>
                                            Upcoming
                                        </button>
                                    </div>
                                </div>

                                <div className="events-pipeline-list">
                                    {filteredEvents.length > 0 ? (
                                        filteredEvents.map(event => (
                                            <div key={event.id} className="event-pipeline-item">
                                                <div className="event-details">
                                                    <h4>{event.title}</h4>
                                                    <p>{event.description}</p>
                                                    <div className="event-tags">
                                                        <span className="event-tag">
                                                            <MapPin size={12} /> {event.venue}
                                                        </span>
                                                        <span className="event-tag">
                                                            <Clock size={12} /> {event.time}
                                                        </span>
                                                        <span className="event-tag">
                                                            <Calendar size={12} /> {event.date}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`event-status-badge ${event.status}`}>
                                                    {event.status === 'live' && <span className="live-dot" />}
                                                    {event.status}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-events-state">
                                            <ShieldAlert size={24} style={{ marginBottom: '8px', color: 'var(--text-secondary)' }} />
                                            <p>No active events matching the selected pipeline filter.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Roster & Members Directory */}
                        <div className="profile-right-column">
                            <div className="roster-card">
                                <h3>Committee & Members</h3>
                                <div className="roster-list">
                                    {/* Faculty Coordinator */}
                                    {CLUB_ROSTER[selectedClub.id]?.faculty && (
                                        <>
                                            <div className="roster-section-divider">Faculty In-Charge</div>
                                            <div className="committee-member-card">
                                                <div className="member-avatar">
                                                    {CLUB_ROSTER[selectedClub.id].faculty.initial}
                                                </div>
                                                <div className="member-info">
                                                    <h4>{CLUB_ROSTER[selectedClub.id].faculty.name}</h4>
                                                    <p>{CLUB_ROSTER[selectedClub.id].faculty.role}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Core Committee */}
                                    {CLUB_ROSTER[selectedClub.id]?.committee && (
                                        <>
                                            <div className="roster-section-divider">Core Committee</div>
                                            {CLUB_ROSTER[selectedClub.id].committee.map((member, index) => (
                                                <div key={`comm-${index}`} className="committee-member-card">
                                                    <div className="member-avatar">
                                                        {member.initial}
                                                    </div>
                                                    <div className="member-info" style={{ width: '100%' }}>
                                                        <h4>{member.name}</h4>
                                                        <p>{member.role}</p>
                                                        <div className="member-metadata">
                                                            <span className="member-meta-tag">{member.branch}</span>
                                                            <span className="member-meta-tag">Yr {member.year}</span>
                                                            <span className="member-meta-tag">Sem {member.sem}</span>
                                                            <span className="member-meta-tag">Sec {member.section}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {/* General Members */}
                                    {CLUB_ROSTER[selectedClub.id]?.members && (
                                        <>
                                            <div className="roster-section-divider">Club Members</div>
                                            {CLUB_ROSTER[selectedClub.id].members.map((member, index) => (
                                                <div key={`mem-${index}`} className="committee-member-card">
                                                    <div className="member-avatar">
                                                        {member.initial}
                                                    </div>
                                                    <div className="member-info" style={{ width: '100%' }}>
                                                        <h4>{member.name}</h4>
                                                        <p>{member.role}</p>
                                                        <div className="member-metadata">
                                                            <span className="member-meta-tag">{member.branch}</span>
                                                            <span className="member-meta-tag">Yr {member.year}</span>
                                                            <span className="member-meta-tag">Sem {member.sem}</span>
                                                            <span className="member-meta-tag">Sec {member.section}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
