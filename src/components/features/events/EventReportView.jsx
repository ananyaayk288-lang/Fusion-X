'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockBackend } from '../../../services/mockBackend';
import { 
    Calendar, MapPin, Users, Target, CheckCircle2, 
    Download, Image as ImageIcon, BarChart3, Award, ExternalLink, ArrowLeft, Presentation, Globe
} from 'lucide-react';
import '../FeatureStyles.css';

export default function EventReportView({ eventId }) {
    const router = useRouter();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!eventId) return;
        const fetchEvent = async () => {
            try {
                const data = await mockBackend.getEventById(eventId);
                setEvent(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId]);

    if (loading) return <div className="feature-container" style={{ padding: '2rem' }}>Loading report...</div>;
    if (!event || !event.report) return <div className="feature-container" style={{ padding: '2rem', color: 'var(--error)' }}>Report not found or not yet submitted.</div>;

    const report = event.report;

    return (
        <div className="feature-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <button 
                className="view-btn" 
                style={{ marginBottom: '2rem', background: 'transparent', border: '1px solid var(--border-color)' }}
                onClick={() => router.push('/dashboard/events')}
            >
                <ArrowLeft size={16} /> Back to Archives
            </button>

            <div className="feature-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <span className="tag" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', marginBottom: '10px', display: 'inline-block' }}>OFFICIAL EVENT REPORT</span>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{event.title}</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Conducted by {event.department}</p>
                    </div>
                    <button className="login-btn">
                        <Download size={18} /> Download PDF
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <Users size={24} color="var(--accent-primary)" style={{ margin: '0 auto 10px' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{report.totalAttendees}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Attendees</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <CheckCircle2 size={24} color="var(--success)" style={{ margin: '0 auto 10px' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{report.feedbackScore || 'N/A'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Avg Feedback Score</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <Globe size={24} color="var(--accent-primary)" style={{ margin: '0 auto 10px' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{event.is_inter_college ? 'Yes' : 'No'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Inter-College</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <BarChart3 size={24} color="var(--accent-primary)" style={{ margin: '0 auto 10px' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{report.revenueGenerated || 'N/A'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Revenue / Sponsorship</div>
                </div>
            </div>

            <div className="grid-container" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                
                {/* LEFT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <Target size={20} color="var(--accent-primary)" /> Executive Summary
                        </h3>
                        <p style={{ lineHeight: '1.8', color: 'var(--text-primary)', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                            {report.summary}
                        </p>
                    </div>

                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <Award size={20} color="var(--accent-primary)" /> Key Highlights & Outcomes
                        </h3>
                        <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '1rem', lineHeight: '1.8', color: 'var(--text-primary)' }}>
                            {report.highlights.map((h, i) => <li key={i}>{h}</li>)}
                        </ul>
                    </div>

                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <Award size={20} color="var(--accent-primary)" /> Winners & Achievements
                        </h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {report.winners && report.winners.map((w, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{w.name}</div>
                                    <div style={{ color: 'var(--success)', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '0.4rem 1rem', borderRadius: '4px' }}>{w.prize}</div>
                                </div>
                            ))}
                            {(!report.winners || report.winners.length === 0) && <p style={{ color: 'var(--text-secondary)' }}>No winners recorded.</p>}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Event Details Reference */}
                    <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Event Details</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Date</div>
                                <div style={{ fontWeight: 500 }}>{event.start_date} to {event.end_date}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Venue</div>
                                <div style={{ fontWeight: 500 }}>{event.venue}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category</div>
                                <div style={{ fontWeight: 500 }}>{event.category}</div>
                            </div>
                        </div>
                    </div>

                    {/* Faculty Remarks */}
                    {(report.facultyRemarks || report.futureRecommendations) && (
                        <div className="card">
                            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Coordinator Remarks</h3>
                            {report.facultyRemarks && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Faculty Feedback</div>
                                    <p style={{ fontSize: '0.9rem', fontStyle: 'italic', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '4px', borderLeft: '3px solid var(--accent-primary)' }}>"{report.facultyRemarks}"</p>
                                </div>
                            )}
                            {report.futureRecommendations && (
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Future Recommendations</div>
                                    <p style={{ fontSize: '0.9rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '4px' }}>{report.futureRecommendations}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Attachments */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Attachments & Media</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <button className="view-btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                                <ImageIcon size={18} /> View Photo Gallery
                            </button>
                            <button className="view-btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                                <Presentation size={18} /> Download Presentation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
