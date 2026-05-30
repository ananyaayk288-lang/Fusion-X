'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockBackend } from '../../../services/mockBackend';
import { useAuth } from '../../../context/AuthContext';
import { 
    FileText, Download, Target, Users, MapPin, 
    Calendar, Briefcase, Settings, ArrowRight, ShieldCheck, PieChart, Activity
} from 'lucide-react';
import '../FeatureStyles.css'; // Reuse existing styles

export default function AccreditationArchive() {
    const { user } = useAuth();
    const router = useRouter();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await mockBackend.getAllReports();
                setReports(data || []);
            } catch (err) {
                console.error("Failed to load accreditation data");
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchReports();
    }, [user, router]);

    if (loading) return <div className="feature-container" style={{ padding: '2rem' }}>Loading Accreditation Systems...</div>;

    // Aggregate statistics
    const totalEvents = reports.length;
    const totalParticipants = reports.reduce((acc, curr) => acc + (parseInt(curr.report?.totalAttendees) || 0), 0);
    const avgFeedback = totalEvents > 0 
        ? reports.reduce((acc, curr) => acc + (parseFloat(curr.report?.feedbackScore) || 0), 0) / totalEvents
        : 0;

    return (
        <div className="feature-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            
            <div className="feature-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <span className="tag" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', marginBottom: '10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <ShieldCheck size={14} /> ADMINISTRATIVE SYSTEM
                    </span>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Accreditation Archive</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Automated central repository for NAAC, NBA, and Academic Audit compliance.</p>
                </div>
                <button className="login-btn">
                    <Download size={18} /> Export Full NAAC Report
                </button>
            </div>

            {/* Aggregated Analytics Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Documented Events</div>
                        <FileText size={20} color="var(--accent-primary)" />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{totalEvents}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Activity size={14} /> Official Reports Filed
                    </div>
                </div>
                
                <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Total Participation</div>
                        <Users size={20} color="var(--accent-primary)" />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{totalParticipants}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Verified unique students</div>
                </div>

                <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Quality Score</div>
                        <Target size={20} color="var(--accent-primary)" />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{avgFeedback.toFixed(1)}/5</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Average Student Feedback</div>
                </div>
                
                <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Compliance Status</div>
                        <ShieldCheck size={20} color="var(--success)" />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--success)' }}>100% Ready</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>All reports properly formatted</div>
                </div>
            </div>

            {/* List of Filed Reports */}
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Filed Event Reports</h2>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.2)', textAlign: 'left' }}>
                            <th style={{ padding: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>EVENT NAME</th>
                            <th style={{ padding: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>DEPARTMENT</th>
                            <th style={{ padding: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>DATE CONDUCTED</th>
                            <th style={{ padding: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>PARTICIPANTS</th>
                            <th style={{ padding: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No event reports have been filed into the archive yet.
                                </td>
                            </tr>
                        ) : (
                            reports.map(event => (
                                <tr key={event.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                                    <td style={{ padding: '1.2rem', fontWeight: 600 }}>{event.title}</td>
                                    <td style={{ padding: '1.2rem', color: 'var(--text-secondary)' }}>{event.department}</td>
                                    <td style={{ padding: '1.2rem', color: 'var(--text-secondary)' }}>{event.end_date}</td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{ background: 'var(--bg-secondary)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                                            {event.report.totalAttendees}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                                className="view-btn" 
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                                onClick={() => router.push(`/dashboard/events/${event.id}/report`)}
                                            >
                                                View Complete PDF
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
