'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockBackend } from '../../../services/mockBackend';
import { useAuth } from '../../../context/AuthContext';
import { 
    Calendar, MapPin, Users, Target, CheckCircle2, 
    Upload, Globe, Briefcase, FileText, Settings, ShieldAlert,
    Save, Eye, Award, Image as ImageIcon, BarChart3, TrendingUp, Presentation
} from 'lucide-react';
import '../FeatureStyles.css';

export default function EventReportCreate({ eventId }) {
    const { user } = useAuth();
    const router = useRouter();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        totalAttendees: '',
        revenueGenerated: '',
        feedbackScore: '',
        summary: '',
        highlights: ['', '', ''],
        winners: [
            { name: '', prize: '' },
            { name: '', prize: '' }
        ],
        facultyRemarks: '',
        futureRecommendations: ''
    });

    useEffect(() => {
        if (!eventId) return;
        const fetchEvent = async () => {
            try {
                const data = await mockBackend.getEventById(eventId);
                setEvent(data);
                
                // Pre-fill stats based on registrations if possible
                const regs = mockBackend.eventRegistrations.filter(r => r.eventId === eventId);
                setFormData(prev => ({
                    ...prev,
                    totalAttendees: regs.length.toString(),
                    summary: `The event ${data.title} was successfully conducted by the ${data.department} department.`
                }));
                
            } catch (err) {
                setError("Failed to load event details.");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleHighlightChange = (index, value) => {
        const newHighlights = [...formData.highlights];
        newHighlights[index] = value;
        setFormData({ ...formData, highlights: newHighlights });
    };

    const handleWinnerChange = (index, field, value) => {
        const newWinners = [...formData.winners];
        newWinners[index][field] = value;
        setFormData({ ...formData, winners: newWinners });
    };

    const addWinnerRow = () => {
        setFormData({
            ...formData,
            winners: [...formData.winners, { name: '', prize: '' }]
        });
    };

    const handleSave = async () => {
        setSubmitting(true);
        setError(null);

        // Clean up empty fields
        const cleanedHighlights = formData.highlights.filter(h => h.trim() !== '');
        const cleanedWinners = formData.winners.filter(w => w.name.trim() !== '');

        try {
            await mockBackend.submitEventReport(eventId, {
                totalAttendees: parseInt(formData.totalAttendees) || 0,
                revenueGenerated: formData.revenueGenerated,
                feedbackScore: formData.feedbackScore,
                summary: formData.summary,
                highlights: cleanedHighlights,
                winners: cleanedWinners,
                facultyRemarks: formData.facultyRemarks,
                futureRecommendations: formData.futureRecommendations
            });

            setSuccess(true);
            setTimeout(() => router.push(`/dashboard/events/${eventId}/report`), 2000);
        } catch (err) {
            console.error(err);
            setError("Failed to submit report.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="feature-container" style={{ padding: '2rem' }}>Loading event details...</div>;
    if (error) return <div className="feature-container" style={{ padding: '2rem', color: 'var(--error)' }}>{error}</div>;
    if (!event) return null;

    return (
        <div className="feature-container" style={{ padding: '2rem' }}>
            <div className="feature-header" style={{ marginBottom: '2rem' }}>
                <h1>Submit Event Report</h1>
                <p style={{ color: 'var(--text-secondary)' }}>File the official post-event report for: <strong>{event.title}</strong></p>
            </div>

            {success && (
                <div className="card success" style={{ marginBottom: '2rem', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success)' }}>
                    <h3 style={{ color: 'var(--success)' }}>Report Submitted!</h3>
                    <p>The event report has been saved to the accreditation archive and is now public. Redirecting...</p>
                </div>
            )}

            <div className="grid-container" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                
                {/* LEFT COLUMN - MAIN DETAILS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Executive Summary */}
                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <FileText size={20} color="var(--accent-primary)" /> Executive Summary
                        </h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Overview / Objectives Achieved</label>
                                <textarea name="summary" className="filter-select" rows="4" style={{ width: '100%', resize: 'vertical' }} value={formData.summary} onChange={handleChange} required></textarea>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Key Highlights & Outcomes</label>
                                {formData.highlights.map((highlight, idx) => (
                                    <input 
                                        key={idx}
                                        type="text" 
                                        placeholder={`Highlight ${idx + 1}`} 
                                        className="filter-select" 
                                        style={{ width: '100%', marginBottom: '10px' }} 
                                        value={highlight} 
                                        onChange={(e) => handleHighlightChange(idx, e.target.value)} 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Winners & Achievements */}
                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <Award size={20} color="var(--accent-primary)" /> Winners & Achievements
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {formData.winners.map((winner, idx) => (
                                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Winner / Team Name</label>
                                        <input type="text" className="filter-select" style={{ width: '100%' }} value={winner.name} onChange={(e) => handleWinnerChange(idx, 'name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Prize / Position</label>
                                        <input type="text" className="filter-select" style={{ width: '100%' }} value={winner.prize} placeholder="e.g. 1st Place - ₹5000" onChange={(e) => handleWinnerChange(idx, 'prize', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                            
                            <button className="view-btn" onClick={addWinnerRow} style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                                + Add Another Winner
                            </button>
                        </div>
                    </div>

                    {/* Faculty Remarks */}
                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <Target size={20} color="var(--accent-primary)" /> Final Remarks & Impact
                        </h3>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Coordinator Notes</label>
                                <textarea name="facultyRemarks" className="filter-select" rows="3" style={{ width: '100%', resize: 'vertical' }} value={formData.facultyRemarks} onChange={handleChange}></textarea>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Future Recommendations</label>
                                <textarea name="futureRecommendations" className="filter-select" rows="3" style={{ width: '100%', resize: 'vertical' }} value={formData.futureRecommendations} onChange={handleChange}></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - STATS & UPLOADS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Statistics */}
                    <div className="card" style={{ background: 'var(--bg-secondary)', border: '2px solid var(--accent-primary)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <BarChart3 size={20} color="var(--accent-primary)" /> Analytics
                        </h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Participants</label>
                                <input type="number" name="totalAttendees" className="filter-select" style={{ width: '100%' }} value={formData.totalAttendees} onChange={handleChange} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Revenue / Sponsorships Generated</label>
                                <input type="text" name="revenueGenerated" placeholder="₹0" className="filter-select" style={{ width: '100%' }} value={formData.revenueGenerated} onChange={handleChange} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Average Feedback Score (out of 5)</label>
                                <input type="text" name="feedbackScore" placeholder="4.5/5" className="filter-select" style={{ width: '100%' }} value={formData.feedbackScore} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Gallery & Attachments */}
                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <ImageIcon size={20} color="var(--accent-primary)" /> Event Media
                        </h3>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Upload Photos & Assets</label>
                            <div style={{ background: 'var(--bg-secondary)', border: '2px dashed var(--border-color)', padding: '2rem', textAlign: 'center', borderRadius: '8px', color: 'var(--text-secondary)', marginBottom: '1rem', cursor: 'pointer' }}>
                                <Upload size={24} style={{ margin: '0 auto 10px' }} />
                                <p style={{ fontSize: '0.85rem', marginBottom: '5px' }}>Click to upload event photos</p>
                                <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>(Supports PNG, JPG up to 10MB)</p>
                            </div>
                            
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Attach Official Document</label>
                            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1rem', textAlign: 'center', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <Presentation size={18} />
                                <span style={{ fontSize: '0.85rem' }}>Upload Presentation / PDF</span>
                            </div>
                        </div>
                    </div>

                    {/* Final Submission */}
                    <button 
                        className="login-btn" 
                        style={{ width: '100%', justifyContent: 'center', padding: '1.2rem', fontSize: '1.1rem' }} 
                        onClick={handleSave}
                        disabled={submitting}
                    >
                        <CheckCircle2 size={20} /> {submitting ? 'Archiving Event...' : 'Submit Final Report'}
                    </button>
                </div>
            </div>
        </div>
    );
}
