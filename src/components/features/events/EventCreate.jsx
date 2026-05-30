'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockBackend } from '../../../services/mockBackend';
import { useAuth } from '../../../context/AuthContext';
import { 
    Calendar, MapPin, Users, Target, CheckCircle2, 
    Upload, Globe, Briefcase, FileText, Settings, ShieldAlert,
    Save, Eye
} from 'lucide-react';
import '../FeatureStyles.css';

export default function EventCreate() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        tagline: '',
        description: '',
        category: 'Hackathon',
        department: 'General',
        type: 'Technical',
        
        start_date: '',
        end_date: '',
        timings: '',
        registration_deadline: '',
        
        venue: '',
        mode: 'Offline',
        team_size: 1,
        participation_limit: 100,
        
        faculty_coordinators: '',
        student_coordinators: '',
        contact_info: '',
        
        poster_url: '',
        status: 'Draft',
        visibility: 'Public',
        judging_criteria: '',
        certification_criteria: 'Participation Certificate for all attendees.'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (statusOverride = null) => {
        if (!user) return;
        setLoading(true);
        setError(null);
        setSuccess(false);

        const finalStatus = statusOverride || formData.status;

        try {
            await mockBackend.createEvent({
                title: formData.title,
                tagline: formData.tagline,
                description: formData.description,
                category: formData.category,
                department: formData.department,
                type: formData.type,
                start_date: formData.start_date,
                end_date: formData.end_date,
                timings: formData.timings,
                registration_deadline: formData.registration_deadline || null,
                venue: formData.venue,
                mode: formData.mode,
                team_size: parseInt(formData.team_size),
                participation_limit: parseInt(formData.participation_limit),
                organizer_id: user.id,
                faculty_coordinators: formData.faculty_coordinators.split(','),
                student_coordinators: formData.student_coordinators.split(','),
                contact_info: formData.contact_info,
                poster_url: formData.poster_url,
                status: finalStatus,
                visibility: formData.visibility,
                judging_criteria: formData.judging_criteria,
                certification_criteria: formData.certification_criteria
            });

            setSuccess(true);
            setTimeout(() => router.push('/dashboard/events'), 2000);
        } catch (err) {
            console.error("Error creating event:", err);
            setError("Failed to create event.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="feature-container" style={{ padding: '2rem' }}>
            <div className="feature-header" style={{ marginBottom: '2rem' }}>
                <h1>Host Institutional Event</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Create, configure, and publish campus events to the student ecosystem.</p>
            </div>

            {error && (
                <div className="card warning" style={{ marginBottom: '2rem', background: 'rgba(255, 77, 77, 0.1)', borderColor: 'var(--error)' }}>
                    <h3 style={{ color: 'var(--error)' }}>Creation Failed</h3>
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="card success" style={{ marginBottom: '2rem', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success)' }}>
                    <h3 style={{ color: 'var(--success)' }}>Success!</h3>
                    <p>Event has been successfully recorded in the system. Redirecting...</p>
                </div>
            )}

            <div className="grid-container" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                
                {/* LEFT COLUMN - MAIN DETAILS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Basic Details */}
                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <FileText size={20} color="var(--accent-primary)" /> Basic Details
                        </h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Event Title</label>
                                <input type="text" name="title" className="filter-select" style={{ width: '100%' }} value={formData.title} onChange={handleChange} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tagline</label>
                                <input type="text" name="tagline" className="filter-select" style={{ width: '100%' }} value={formData.tagline} onChange={handleChange} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Description</label>
                                <textarea name="description" className="filter-select" rows="4" style={{ width: '100%', resize: 'vertical' }} value={formData.description} onChange={handleChange} required></textarea>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category</label>
                                    <select name="category" className="filter-select" style={{ width: '100%' }} value={formData.category} onChange={handleChange}>
                                        <option>Hackathon</option>
                                        <option>Workshop</option>
                                        <option>Seminar</option>
                                        <option>Competition</option>
                                        <option>Volunteer</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Department</label>
                                    <input type="text" name="department" className="filter-select" style={{ width: '100%' }} value={formData.department} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <Calendar size={20} color="var(--accent-primary)" /> Schedule
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Start Date</label>
                                <input type="date" name="start_date" className="filter-select" style={{ width: '100%' }} value={formData.start_date} onChange={handleChange} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>End Date</label>
                                <input type="date" name="end_date" className="filter-select" style={{ width: '100%' }} value={formData.end_date} onChange={handleChange} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Timings</label>
                                <input type="text" name="timings" placeholder="e.g. 9:00 AM - 5:00 PM" className="filter-select" style={{ width: '100%' }} value={formData.timings} onChange={handleChange} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Registration Deadline</label>
                                <input type="datetime-local" name="registration_deadline" className="filter-select" style={{ width: '100%' }} value={formData.registration_deadline} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Venue & Participation */}
                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <MapPin size={20} color="var(--accent-primary)" /> Venue & Participation
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Venue</label>
                                <input type="text" name="venue" className="filter-select" style={{ width: '100%' }} value={formData.venue} onChange={handleChange} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mode</label>
                                <select name="mode" className="filter-select" style={{ width: '100%' }} value={formData.mode} onChange={handleChange}>
                                    <option>Offline</option>
                                    <option>Online</option>
                                    <option>Hybrid</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Team Size</label>
                                <input type="number" name="team_size" min="1" className="filter-select" style={{ width: '100%' }} value={formData.team_size} onChange={handleChange} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Participation Limit</label>
                                <input type="number" name="participation_limit" className="filter-select" style={{ width: '100%' }} value={formData.participation_limit} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - SETTINGS & PUBLICATION */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Organizers */}
                    <div className="paper-card">
                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>Organizers</h3>
                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Faculty Coordinators (Comma separated)</label>
                            <input type="text" name="faculty_coordinators" className="filter-select" style={{ width: '100%', marginBottom: '1rem' }} value={formData.faculty_coordinators} onChange={handleChange} />
                            
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Student Coordinators</label>
                            <input type="text" name="student_coordinators" className="filter-select" style={{ width: '100%', marginBottom: '1rem' }} value={formData.student_coordinators} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Assets */}
                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <Upload size={20} color="var(--accent-primary)" /> Assets
                        </h3>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Poster URL</label>
                            <input type="url" name="poster_url" placeholder="https://..." className="filter-select" style={{ width: '100%', marginBottom: '1rem' }} value={formData.poster_url} onChange={handleChange} />
                            <div style={{ background: 'var(--bg-secondary)', border: '2px dashed var(--border-color)', padding: '2rem', textAlign: 'center', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                                <Upload size={24} style={{ margin: '0 auto 10px' }} />
                                <p style={{ fontSize: '0.85rem' }}>File upload simulation placeholder.</p>
                            </div>
                        </div>
                    </div>

                    {/* Publication Controls */}
                    <div className="card" style={{ background: 'var(--bg-secondary)', border: '2px solid var(--accent-primary)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <Settings size={20} color="var(--accent-primary)" /> Publication Controls
                        </h3>
                        
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Visibility</label>
                            <select name="visibility" className="filter-select" style={{ width: '100%' }} value={formData.visibility} onChange={handleChange}>
                                <option>Public</option>
                                <option>Private (Invite Only)</option>
                                <option>Inter-College</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                            <button 
                                className="login-btn" 
                                style={{ width: '100%', justifyContent: 'center' }} 
                                onClick={() => handleSave('Upcoming')}
                                disabled={loading}
                            >
                                <Globe size={18} /> {loading ? 'Processing...' : 'Publish Event Now'}
                            </button>
                            <button 
                                className="view-btn" 
                                style={{ width: '100%', background: 'transparent', border: '2px solid var(--border-color)', color: 'var(--text-primary)' }} 
                                onClick={() => handleSave('Draft')}
                                disabled={loading}
                            >
                                <Save size={18} /> Save as Draft
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
