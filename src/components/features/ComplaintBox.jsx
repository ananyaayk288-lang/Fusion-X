"use client";
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, ShieldAlert, CheckCircle, RefreshCw, AlertTriangle, Filter, Eye } from 'lucide-react';
import './FeatureStyles.css';

export default function ComplaintBox() {
    const { user } = useAuth();
    
    // Regular complaint box states
    const [complaint, setComplaint] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Admin Escalation Desk states
    const [filterCategory, setFilterCategory] = useState('All');
    const [incidents, setIncidents] = useState([
        { id: 'inc-1', title: 'Power Grid Load Surge in Mech Lab', category: 'High Risk', time: '15:40:02', status: 'Unresolved', reporter: 'RFID Telemetry System' },
        { id: 'inc-2', title: 'Water leakage in CSE Block Restrooms (3rd Floor)', category: 'Operational', time: '15:20:10', status: 'Unresolved', reporter: 'Anonymous Staff member' },
        { id: 'inc-3', title: 'BLE Beacon CSE-Lab-3 disconnect alert', category: 'High Risk', time: '14:55:00', status: 'Resolved', reporter: 'Telemetry Monitor' },
        { id: 'inc-4', title: 'Smart Exam Predictor scheduler conflict', category: 'Operational', time: '13:12:05', status: 'Unresolved', reporter: 'Prof. alan' }
    ]);
    const [escalationMsg, setEscalationMsg] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!complaint.trim()) return;
        setSubmitted(true);
        setComplaint('');
        setTimeout(() => setSubmitted(false), 3000);
    };

    const handleResolve = (id, title) => {
        setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'Resolved' } : inc));
        setEscalationMsg(`Incident RESOLVED: ${title}`);
        setTimeout(() => setEscalationMsg(''), 4000);
    };

    const handleEscalate = (id, title) => {
        setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'Escalated to Dean' } : inc));
        setEscalationMsg(`DISPATCHED: Escalation alert sent to Campus Warden & Operational Dean for incident: ${title}`);
        setTimeout(() => setEscalationMsg(''), 5000);
    };

    const filteredIncidents = incidents.filter(inc => {
        if (filterCategory === 'All') return true;
        return inc.category === filterCategory;
    });

    // Admin view
    if (user?.role === 'admin') {
        return (
            <div className="telemetry-container animate-enter" style={{ color: 'var(--text-primary)', padding: '1.5rem 0.5rem', backgroundColor: '#030712' }}>
                {/* Title */}
                <div className="lms-title-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <span>Escalation Desk</span>
                    <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 500, color: 'var(--accent-primary)' }}>
                        Institutional Action-filtered incidents & campus operations tickets
                    </span>
                </div>

                {/* Macro metrics */}
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

                {/* Alert feedback toast */}
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

                {/* Filtering header */}
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

                {/* Incidents Table Panel */}
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
                                                            onClick={() => handleResolve(inc.id, inc.title)}
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
                                                            onClick={() => handleEscalate(inc.id, inc.title)}
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

    // Default student anonymous view
    return (
        <div className="feature-container animate-enter">
            <div className="feature-header">
                <h1 className="feature-title">🛡️ Anonymous Complaint Box</h1>
                <p className="feature-subtitle">Voice your concerns freely. No identity attached.</p>
            </div>

            <div className="form-interface card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Your Complaint / Feedback (Anonymous)</label>
                    <textarea 
                        value={complaint}
                        onChange={(e) => setComplaint(e.target.value)}
                        placeholder="State your concern here..."
                        style={{ width: '100%', height: '150px', padding: '15px', background: 'var(--bg-primary)', border: '2px solid var(--border-color)', color: 'white', marginBottom: '20px' }}
                    />
                    <button type="submit" className="action-button" style={{ width: '100%', padding: '15px 0' }}>Submit Complaint</button>
                </form>

                {submitted && (
                    <div style={{ marginTop: '20px', padding: '15px', background: 'var(--success)', color: 'black', fontWeight: 'bold', textAlign: 'center' }}>
                        Your feedback has been submitted anonymously!
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
