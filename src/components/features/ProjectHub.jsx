"use client";
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Users, User, GitBranch, Star, MessageSquare, Trash2, ChevronDown, ChevronUp, ExternalLink, CheckCircle2, Clock, AlertCircle, Award, Coins, RefreshCw } from 'lucide-react';

const MOCK_PROJECTS = [
    {
        id: 'proj-1',
        title: 'Smart Campus IoT Network',
        description: 'An IoT mesh network for monitoring energy consumption across campus buildings using ESP32 and LoRa.',
        type: 'team',
        status: 'in-progress',
        githubUrl: 'https://github.com/team/smart-campus',
        createdBy: '4VV25EC032',
        members: [
            { usn: '4VV25EC032', name: 'Bharath Kumar', role: 'Lead' },
            { usn: '4VV25EC045', name: 'Rahul Sharma', role: 'Member' },
            { usn: '4VV25EC018', name: 'Ananya Rao', role: 'Member' },
        ],
        mentor: { name: 'Dr. Ramesh Babu', department: 'ECE' },
        milestones: [
            { title: 'Synopsis Submission', status: 'completed', date: '2026-02-15' },
            { title: 'Hardware Prototype', status: 'completed', date: '2026-03-20' },
            { title: 'Software Integration', status: 'in-progress', date: '2026-04-25' },
            { title: 'Final Demo & Viva', status: 'pending', date: '2026-05-30' },
        ],
        reviews: [
            { by: 'Dr. Ramesh Babu', date: '2026-03-22', text: 'Good progress on the hardware prototype. Ensure proper power management for LoRa modules.' },
        ],
        createdAt: '2026-01-10',
    },
    {
        id: 'proj-2',
        title: 'Personal Portfolio with AI Chatbot',
        description: 'A personal portfolio website with an integrated AI chatbot trained on my resume for recruiters.',
        type: 'personal',
        status: 'completed',
        githubUrl: 'https://github.com/bharath/portfolio-ai',
        createdBy: '4VV25EC032',
        members: [{ usn: '4VV25EC032', name: 'Bharath Kumar', role: 'Owner' }],
        mentor: null,
        milestones: [
            { title: 'UI Design', status: 'completed', date: '2026-01-20' },
            { title: 'Backend API', status: 'completed', date: '2026-02-10' },
            { title: 'AI Integration', status: 'completed', date: '2026-03-01' },
        ],
        reviews: [],
        createdAt: '2026-01-05',
    },
];

const AVAILABLE_TEACHERS = [
    { name: 'Dr. Ramesh Babu', department: 'ECE' },
    { name: 'Prof. Lakshmi Devi', department: 'CSE' },
    { name: 'Dr. Suresh Kumar', department: 'ME' },
    { name: 'Prof. Kavitha S', department: 'ISE' },
];

const statusConfig = {
    'completed': { label: 'Completed', color: '#10b981', icon: <CheckCircle2 size={14} /> },
    'in-progress': { label: 'In Progress', color: '#f59e0b', icon: <Clock size={14} /> },
    'pending': { label: 'Pending', color: '#6b7280', icon: <AlertCircle size={14} /> },
};

const rndCardStyle = {
    background: 'var(--bg-card)',
    border: '2px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
};

const rndLabelStyle = {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    marginBottom: '4px'
};

const rndSubStyle = {
    fontSize: '0.65rem',
    color: '#666',
    display: 'block',
    marginTop: '2px'
};

const rndPanelStyle = {
    background: 'var(--bg-card)',
    border: '2px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
};

const rndPanelTitleStyle = {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: 'var(--text-primary)'
};

const iprRowStyle = {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '6px',
    padding: '10px',
    position: 'relative'
};

const iprTitleStyle = {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 4px'
};

const iprDescStyle = {
    fontSize: '0.68rem',
    color: '#888',
    margin: 0,
    lineHeight: 1.3
};

const iprBadgeStyle = (status) => {
    const isReg = status === 'Registered';
    return {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: isReg ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        border: isReg ? '1px solid #10b981' : '1px solid #f59e0b',
        color: isReg ? '#10b981' : '#f59e0b',
        fontSize: '0.6rem',
        fontWeight: 'bold',
        padding: '2px 6px',
        borderRadius: '4px'
    };
};

const ProjectHub = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState(MOCK_PROJECTS);
    
    // Admin specific Tech & Innovation Registry states
    const [rndProjects, setRndProjects] = useState([
        { id: 'rnd-1', title: 'Solar Array Dual-Axis Smart Tilter', dept: 'ECE & Mechanical', lead: 'Dr. Ramesh Babu', budget: '2.5 Lakhs', sandbox: 'Lab-402 IoT Cell', status: 'Approved' },
        { id: 'rnd-2', title: 'BLE Proximity Anti-Fraud Check-In Gateway', dept: 'CSE & ISE', lead: 'Prof. Alan Turing', budget: '4.8 Lakhs', sandbox: 'Lab-205 Cyber Cell', status: 'Pending Approval' },
        { id: 'rnd-3', title: 'Campus Smart Microgrid HVAC Optimizer', dept: 'EE Stream', lead: 'Dr. Bhavana', budget: '6.2 Lakhs', sandbox: 'Green Energy Park A', status: 'Pending Approval' }
    ]);
    const [rndSuccessMsg, setRndSuccessMsg] = useState('');

    const [expandedProject, setExpandedProject] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(null);
    const [reviewText, setReviewText] = useState('');

    // Create project form state
    const [newProject, setNewProject] = useState({
        title: '', description: '', type: 'personal', githubUrl: '',
        memberUsn: '', members: [], mentorIdx: -1,
    });

    const handleAddMember = () => {
        const usn = newProject.memberUsn.trim().toUpperCase();
        if (!usn) return;
        if (newProject.members.find(m => m.usn === usn)) { alert('Member already added.'); return; }
        setNewProject(prev => ({
            ...prev,
            memberUsn: '',
            members: [...prev.members, { usn, name: `Student (${usn})`, role: 'Member' }],
        }));
    };

    const handleRemoveMember = (usn) => {
        setNewProject(prev => ({ ...prev, members: prev.members.filter(m => m.usn !== usn) }));
    };

    const handleCreateProject = (e) => {
        e.preventDefault();
        if (!newProject.title.trim()) return;
        const ownerUsn = user?.usn || '4VV25EC032';
        const proj = {
            id: `proj-${Date.now()}`,
            title: newProject.title,
            description: newProject.description,
            type: newProject.type,
            status: 'in-progress',
            githubUrl: newProject.githubUrl,
            createdBy: ownerUsn,
            members: [
                { usn: ownerUsn, name: user?.name || 'You', role: newProject.type === 'personal' ? 'Owner' : 'Lead' },
                ...(newProject.type === 'team' ? newProject.members : []),
            ],
            mentor: newProject.mentorIdx >= 0 ? AVAILABLE_TEACHERS[newProject.mentorIdx] : null,
            milestones: [],
            reviews: [],
            createdAt: new Date().toISOString().split('T')[0],
        };
        setProjects(prev => [proj, ...prev]);
        setNewProject({ title: '', description: '', type: 'personal', githubUrl: '', memberUsn: '', members: [], mentorIdx: -1 });
        setShowCreateModal(false);
    };

    const handleSubmitReview = (projectId) => {
        if (!reviewText.trim()) return;
        setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;
            return { ...p, reviews: [...p.reviews, { by: user?.name || 'Teacher', date: new Date().toISOString().split('T')[0], text: reviewText }] };
        }));
        setReviewText('');
        setShowReviewModal(null);
    };

    const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

    if (user?.role === 'admin') {
        const approveRndProject = (id, title) => {
            setRndProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'Approved', sandbox: 'Allocated (Lab-402)' } : p));
            setRndSuccessMsg(`Funding successfully authorized & BLE/Hardware Sandbox allocated for project: ${title}`);
            setTimeout(() => setRndSuccessMsg(''), 4500);
        };

        const rejectRndProject = (id) => {
            setRndProjects(prev => prev.filter(p => p.id !== id));
        };

        return (
            <div className="telemetry-container animate-enter" style={{ color: 'var(--text-primary)', padding: '1.5rem 0.5rem', backgroundColor: 'var(--bg-app-background)' }}>
                {/* Title */}
                <div className="lms-title-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <span>Tech & Innovation Registry</span>
                    <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 500, color: 'var(--accent-primary)' }}>
                        Institutional R&D Patents, funding pipelines & incubator tracking
                    </span>
                </div>

                {/* Macro Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={rndCardStyle}>
                        <h4 style={rndLabelStyle}>Institutional Patents</h4>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>14 Filed</div>
                        <span style={rndSubStyle}>4 under active review</span>
                    </div>
                    <div style={rndCardStyle}>
                        <h4 style={rndLabelStyle}>Total R&D Funding</h4>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa' }}>18.5 Lakhs</div>
                        <span style={rndSubStyle}>Authorized seed capital</span>
                    </div>
                    <div style={rndCardStyle}>
                        <h4 style={rndLabelStyle}>Incubator Sandboxes</h4>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>3 Active</div>
                        <span style={rndSubStyle}>BLE/IoT nodes allocation</span>
                    </div>
                    <div style={rndCardStyle}>
                        <h4 style={rndLabelStyle}>Pending Applications</h4>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a78bfa' }}>
                            {rndProjects.filter(p => p.status === 'Pending Approval').length} Projects
                        </div>
                        <span style={rndSubStyle}>Requires admin screening</span>
                    </div>
                </div>

                {/* Alert feedback toast */}
                {rndSuccessMsg && (
                    <div style={{
                        padding: '12px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid #10b981',
                        color: '#a7f3d0',
                        fontSize: '0.82rem',
                        fontWeight: '500',
                        marginBottom: '1.5rem'
                    }}>
                        {rndSuccessMsg}
                    </div>
                )}

                {/* Grid layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                    
                    {/* Funding Application table */}
                    <div style={rndPanelStyle}>
                        <h3 style={rndPanelTitleStyle}>Research Funding & Sandbox Application Pipeline</h3>
                        <p style={{ fontSize: '0.72rem', color: '#888', marginBottom: '1.25rem' }}>
                            Authorize institutional sponsorships and map hardware laboratories to active projects.
                        </p>

                        <div className="lms-table-container" style={{ margin: 0 }}>
                            <table className="lms-table">
                                <thead>
                                    <tr>
                                        <th>Project Title</th>
                                        <th>Department</th>
                                        <th>Lead Investigator</th>
                                        <th>Required Budget</th>
                                        <th>Sandbox Target</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rndProjects.map(proj => (
                                        <tr key={proj.id}>
                                            <td style={{ fontWeight: '700' }}>{proj.title}</td>
                                            <td>{proj.dept}</td>
                                            <td>{proj.lead}</td>
                                            <td style={{ color: '#60a5fa', fontWeight: 'bold' }}>{proj.budget}</td>
                                            <td>{proj.sandbox}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {proj.status === 'Pending Approval' ? (
                                                        <>
                                                            <button 
                                                                onClick={() => approveRndProject(proj.id, proj.title)}
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
                                                                Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => rejectRndProject(proj.id)}
                                                                style={{
                                                                    background: 'rgba(255,255,255,0.05)',
                                                                    border: '1px solid #444',
                                                                    color: '#9ca3af',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 'bold',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                Revise
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>
                                                            ✓ Authorized
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

                    {/* Intellectual Property and Patents registry list */}
                    <div style={rndPanelStyle}>
                        <h3 style={rndPanelTitleStyle}>Patent Registry & IPR Office</h3>
                        <p style={{ fontSize: '0.72rem', color: '#888', marginBottom: '1rem' }}>
                            Direct connection with the institutional intellectual property bureau.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={iprRowStyle}>
                                <h4 style={iprTitleStyle}>Dual Axis Solar Inverter controller</h4>
                                <span style={iprBadgeStyle('Registered')}>Registered</span>
                                <p style={iprDescStyle}>Official Patent Code: 4VV-ECE-2026-092. Sandbox allocated.</p>
                            </div>
                            <div style={iprRowStyle}>
                                <h4 style={iprTitleStyle}>Smart Campus RF Mesh Network Layer</h4>
                                <span style={iprBadgeStyle('Under Review')}>Under Review</span>
                                <p style={iprDescStyle}>Pending technical audit clearance from R&D Dean.</p>
                            </div>
                            <div style={iprRowStyle}>
                                <h4 style={iprTitleStyle}>ESP32 LoRa Grid Inverter Node</h4>
                                <span style={iprBadgeStyle('Registered')}>Registered</span>
                                <p style={iprDescStyle}>Design copyright published in Indian Patent Gazette.</p>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        );
    }



    return (
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div className="yellow-title-box"><h1>PROJECT HUB</h1></div>
                {!isTeacher && (
                    <button onClick={() => setShowCreateModal(true)} style={btnPrimary}>
                        <Plus size={18} /> New Project
                    </button>
                )}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Projects', value: projects.length, color: '#a78bfa' },
                    { label: 'Team Projects', value: projects.filter(p => p.type === 'team').length, color: '#60a5fa' },
                    { label: 'Personal', value: projects.filter(p => p.type === 'personal').length, color: '#34d399' },
                    { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: '#fbbf24' },
                ].map((s, i) => (
                    <div key={i} style={statCard}><span style={{ fontSize: '2rem', fontWeight: 900, color: s.color }}>{s.value}</span><span style={{ color: '#888', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</span></div>
                ))}
            </div>

            {/* Project List */}
            {projects.map(proj => (
                <div key={proj.id} style={{ ...cardBase, marginBottom: '1rem' }}>
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
                         onClick={() => setExpandedProject(expandedProject === proj.id ? null : proj.id)}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                {proj.type === 'team' ? <Users size={20} color="#60a5fa" /> : <User size={20} color="#34d399" />}
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{proj.title}</h3>
                                <span style={{ ...pill, background: proj.type === 'team' ? '#1e3a5f' : '#1a3a2a', color: proj.type === 'team' ? '#60a5fa' : '#34d399' }}>
                                    {proj.type === 'team' ? 'Team' : 'Personal'}
                                </span>
                                <span style={{ ...pill, background: statusConfig[proj.status].color + '22', color: statusConfig[proj.status].color }}>
                                    {statusConfig[proj.status].icon} {statusConfig[proj.status].label}
                                </span>
                            </div>
                            <p style={{ margin: 0, color: '#999', fontSize: '0.85rem', lineHeight: 1.5 }}>{proj.description}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#a78bfa' }}><GitBranch size={18} /></a>}
                            {expandedProject === proj.id ? <ChevronUp size={20} color="#888" /> : <ChevronDown size={20} color="#888" />}
                        </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedProject === proj.id && (
                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
                            {/* Team Members */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={sectionTitle}><Users size={16} /> Team Members ({proj.members.length})</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {proj.members.map(m => (
                                        <div key={m.usn} style={memberChip}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                                                {m.name.charAt(0)}
                                            </div>
                                            <div><div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{m.name}</div><div style={{ fontSize: '0.7rem', color: '#888' }}>{m.usn} · {m.role}</div></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mentor */}
                            {proj.mentor && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={sectionTitle}><Star size={16} /> Mentor</h4>
                                    <div style={memberChip}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fbbf2433', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                                            {proj.mentor.name.charAt(0)}
                                        </div>
                                        <div><div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{proj.mentor.name}</div><div style={{ fontSize: '0.7rem', color: '#888' }}>{proj.mentor.department}</div></div>
                                    </div>
                                </div>
                            )}

                            {/* Milestones */}
                            {proj.milestones.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={sectionTitle}><CheckCircle2 size={16} /> Milestones</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {proj.milestones.map((ms, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                                                <span style={{ color: statusConfig[ms.status].color }}>{statusConfig[ms.status].icon}</span>
                                                <span style={{ flex: 1, fontWeight: 600, fontSize: '0.85rem' }}>{ms.title}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#666' }}>{ms.date}</span>
                                                <span style={{ ...pill, fontSize: '0.65rem', background: statusConfig[ms.status].color + '22', color: statusConfig[ms.status].color }}>{statusConfig[ms.status].label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reviews */}
                            <div>
                                <h4 style={sectionTitle}><MessageSquare size={16} /> Mentor Reviews ({proj.reviews.length})</h4>
                                {proj.reviews.length > 0 ? proj.reviews.map((r, i) => (
                                    <div key={i} style={{ padding: '1rem', background: '#0d0d0d', borderRadius: 8, border: '1px solid #1a1a2e', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fbbf24' }}>{r.by}</span>
                                            <span style={{ fontSize: '0.7rem', color: '#666' }}>{r.date}</span>
                                        </div>
                                        <p style={{ margin: 0, color: '#ccc', fontSize: '0.85rem', lineHeight: 1.6 }}>{r.text}</p>
                                    </div>
                                )) : <p style={{ color: '#555', fontSize: '0.85rem' }}>No reviews yet.</p>}

                                {/* Teacher Review Input */}
                                {isTeacher && (
                                    <div style={{ marginTop: '1rem' }}>
                                        {showReviewModal === proj.id ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Write your review or feedback..." rows={3}
                                                    style={{ background: '#111', border: '1px solid #333', borderRadius: 8, padding: '0.75rem', color: '#fff', fontSize: '0.85rem', resize: 'vertical' }} />
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleSubmitReview(proj.id)} style={btnPrimary}>Submit Review</button>
                                                    <button onClick={() => { setShowReviewModal(null); setReviewText(''); }} style={{ ...btnPrimary, background: '#333', color: '#ccc' }}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => setShowReviewModal(proj.id)} style={{ ...btnPrimary, background: '#1a1a2e', color: '#a78bfa' }}>
                                                <MessageSquare size={14} /> Write Review
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {projects.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>
                    <GitBranch size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <h2>No Projects Yet</h2>
                    <p>Create your first project to get started!</p>
                </div>
            )}

            {/* Create Project Modal */}
            {showCreateModal && (
                <div style={modalOverlay} onClick={() => setShowCreateModal(false)}>
                    <div style={modalBox} onClick={e => e.stopPropagation()}>
                        <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem' }}>Create New Project</h2>
                        <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Project Title *</label>
                                <input value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} required style={inputStyle} placeholder="e.g. Smart Irrigation System" />
                            </div>
                            <div>
                                <label style={labelStyle}>Description</label>
                                <textarea value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Brief about your project..." />
                            </div>
                            <div>
                                <label style={labelStyle}>Project Type</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {['personal', 'team'].map(t => (
                                        <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input type="radio" name="ptype" checked={newProject.type === t} onChange={() => setNewProject(p => ({ ...p, type: t }))} />
                                            <span style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>{t}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>GitHub Repository URL</label>
                                <input value={newProject.githubUrl} onChange={e => setNewProject(p => ({ ...p, githubUrl: e.target.value }))} style={inputStyle} placeholder="https://github.com/user/repo" />
                            </div>

                            {/* Team Members (only for team type) */}
                            {newProject.type === 'team' && (
                                <div>
                                    <label style={labelStyle}>Add Team Members by USN</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input value={newProject.memberUsn} onChange={e => setNewProject(p => ({ ...p, memberUsn: e.target.value }))} style={{ ...inputStyle, flex: 1 }} placeholder="e.g. 4VV25EC045" />
                                        <button type="button" onClick={handleAddMember} style={btnPrimary}><Plus size={16} /> Add</button>
                                    </div>
                                    {newProject.members.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                                            {newProject.members.map(m => (
                                                <span key={m.usn} style={{ ...pill, background: '#1e3a5f', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    {m.usn}
                                                    <Trash2 size={12} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => handleRemoveMember(m.usn)} />
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Mentor Selection */}
                            <div>
                                <label style={labelStyle}>Assign Mentor (Optional)</label>
                                <select value={newProject.mentorIdx} onChange={e => setNewProject(p => ({ ...p, mentorIdx: parseInt(e.target.value) }))} style={inputStyle}>
                                    <option value={-1}>No Mentor</option>
                                    {AVAILABLE_TEACHERS.map((t, i) => (
                                        <option key={i} value={i}>{t.name} — {t.department}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button type="submit" style={btnPrimary}>Create Project</button>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ ...btnPrimary, background: '#333', color: '#ccc' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Inline Styles ---
const btnPrimary = { background: '#fbbf24', color: '#000', border: 'none', padding: '8px 20px', fontWeight: 800, borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' };
const cardBase = { background: 'var(--bg-card)', border: '2px solid var(--border-color)', borderRadius: 12, padding: '1.5rem', transition: 'border-color 0.2s', color: 'var(--text-primary)' };
const statCard = { background: 'var(--bg-card)', border: '2px solid var(--border-color)', padding: '1.25rem', borderRadius: 12, display: 'flex', flexDirection: 'column', color: 'var(--text-primary)' };
const pill = { padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' };
const sectionTitle = { margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' };
const memberChip = { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)', color: 'var(--text-primary)' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 };
const modalBox = { background: 'var(--bg-card)', border: '2px solid var(--border-color)', borderRadius: 16, padding: '2rem', width: '90%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto', color: 'var(--text-primary)' };
const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' };
const inputStyle = { width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.65rem 0.75rem', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' };

export default ProjectHub;
