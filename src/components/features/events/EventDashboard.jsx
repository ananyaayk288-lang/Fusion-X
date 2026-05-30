'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockBackend } from '../../../services/mockBackend';
import { Calendar, MapPin, Users, Award, ExternalLink, Plus, Filter, Search, Target } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import '../FeatureStyles.css';

export default function EventDashboard() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Upcoming');
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        fetchEvents();
    }, [activeTab]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            let data = [];
            if (activeTab === 'My Events' && user) {
                data = await mockBackend.getMyEvents(user.id);
            } else {
                const statusFilter = activeTab === 'Event Reports' ? 'Completed' : activeTab;
                data = await mockBackend.getEvents(statusFilter === 'My Events' ? null : statusFilter);
            }
            setEvents(data || []);
        } catch (err) {
            console.error("Error fetching events:", err);
            setError("Failed to fetch events");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="feature-container" style={{ padding: '2rem' }}>
            <div className="feature-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Event Ecosystem</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Discover, register, and track institutional events.</p>
                </div>
                {user && (user.role === 'teacher' || user.role === 'admin') && (
                    <button className="login-btn" onClick={() => router.push('/dashboard/events/create')}>
                        <Plus size={18} /> Host Event
                    </button>
                )}
            </div>

            {/* Neo-brutalist Filters & Search */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '300px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input 
                            type="text" 
                            placeholder="Search events, hackathons, seminars..." 
                            className="filter-select"
                            style={{ width: '100%', paddingLeft: '40px' }}
                        />
                    </div>
                    <button className="icon-btn"><Filter size={20} /></button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['Upcoming', 'Ongoing', 'Event Reports', 'My Events'].map(tab => (
                        <button
                            key={tab}
                            className={`filter-select ${activeTab === tab ? 'active' : ''}`}
                            style={{
                                background: activeTab === tab ? 'var(--accent-primary)' : 'var(--bg-card)',
                                color: activeTab === tab ? '#000' : 'var(--text-primary)',
                                fontWeight: activeTab === tab ? '800' : '600',
                                border: activeTab === tab ? '2px solid #000' : '1px solid var(--border-color)',
                                cursor: 'pointer'
                            }}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error / Empty State */}
            {error && (
                <div className="card warning" style={{ marginBottom: '2rem', background: 'rgba(255, 77, 77, 0.1)', borderColor: 'var(--error)' }}>
                    <h3 style={{ color: 'var(--error)' }}>Database Connection Issue</h3>
                    <p>{error}</p>
                    <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                        Please run the provided SQL script in your Supabase SQL Editor to create the events tables.
                    </p>
                </div>
            )}

            {/* Events Grid */}
            <div className="grid-container">
                {loading ? (
                    <div style={{ color: 'var(--text-secondary)', padding: '2rem 0' }}>Loading events...</div>
                ) : events.length === 0 && !error ? (
                    <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
                        <Target size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                        <h3>No {activeTab} Events Found</h3>
                        <p>There are currently no events matching this status.</p>
                    </div>
                ) : (
                    events.map(event => (
                        <div key={event.id} className="paper-card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="tags-row" style={{ marginBottom: '1rem' }}>
                                <span className="tag" style={{ background: 'var(--accent-primary)', color: '#000' }}>{event.type}</span>
                                {event.is_inter_college && <span className="tag" style={{ background: '#10b981', color: '#000' }}>Inter-College</span>}
                                {activeTab === 'My Events' && (
                                    <span className="tag" style={{ background: 'var(--success)', color: '#000' }}>Registered</span>
                                )}
                            </div>
                            
                            {/* For regular events */}
                            {event.status !== 'Completed' && (
                                <>
                                    <h3>{event.title}</h3>
                                    <p style={{ flex: 1, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {event.description}
                                    </p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#ddd', fontWeight: 600 }}>
                                            <Calendar size={16} color="var(--accent-primary)" />
                                            {event.event_date ? new Date(event.event_date).toLocaleString() : 'TBD'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#ddd', fontWeight: 600 }}>
                                            <MapPin size={16} color="var(--accent-primary)" />
                                            {event.venue || 'TBD'}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        className="view-btn" 
                                        onClick={() => router.push(`/dashboard/events/${event.id}`)}
                                    >
                                        View Details <ExternalLink size={18} />
                                    </button>
                                </>
                            )}

                            {/* For Archived/Completed events (Event Report Card) */}
                            {event.status === 'Completed' && (
                                <>
                                    <h3>{event.title}</h3>
                                    
                                    {event.report ? (
                                        <div style={{ flex: 1, marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{event.report.summary}"</p>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Attendees</span>
                                                <strong style={{ color: 'var(--accent-primary)' }}>{event.report.totalAttendees}</strong>
                                            </div>
                                            
                                            {event.report.winners && event.report.winners[0] && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>Top Winner</span>
                                                    <strong style={{ color: 'var(--success)' }}>{event.report.winners[0].name}</strong>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p style={{ flex: 1, color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                            This event has concluded. Awaiting official event report.
                                        </p>
                                    )}

                                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                                        {event.report ? (
                                            <button 
                                                className="view-btn" 
                                                style={{ flex: 1, justifyContent: 'center' }}
                                                onClick={() => router.push(`/dashboard/events/${event.id}/report`)}
                                            >
                                                View Full Report
                                            </button>
                                        ) : (
                                            user && (
                                                <button 
                                                    className="login-btn" 
                                                    style={{ flex: 1, justifyContent: 'center' }}
                                                    onClick={() => router.push(`/dashboard/events/${event.id}/report/create`)}
                                                >
                                                    Submit Report
                                                </button>
                                            )
                                        )}
                                        <button 
                                            className="view-btn" 
                                            style={{ padding: '0 0.8rem', background: 'transparent', border: '1px solid var(--border-color)' }}
                                            onClick={() => router.push(`/dashboard/events/${event.id}`)}
                                            title="View Original Event Details"
                                        >
                                            <ExternalLink size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
