'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockBackend } from '../../../services/mockBackend';
import { useAuth } from '../../../context/AuthContext';
import { 
    Calendar, MapPin, Users, Target, CheckCircle2, 
    Share2, Download, Send, Clock, BookOpen, AlertCircle, CheckCircle, Award
} from 'lucide-react';
import '../FeatureStyles.css';

export default function EventDetails({ eventId }) {
    const { user } = useAuth();
    const router = useRouter();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Registration State
    const [registration, setRegistration] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    
    // Authorization Modal State
    const [showTimetableModal, setShowTimetableModal] = useState(false);
    const [timetable, setTimetable] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [isSendingAuth, setIsSendingAuth] = useState(false);

    useEffect(() => {
        if (!eventId) return;
        fetchEventDetails();
    }, [eventId]);

    const fetchEventDetails = async () => {
        setLoading(true);
        try {
            const data = await mockBackend.getEventById(eventId);
            setEvent(data);
            
            // Check if already registered
            if (user) {
                const regData = await mockBackend.checkRegistration(eventId, user.id);
                setRegistration(regData);
            }
        } catch (err) {
            console.error("Error:", err);
            setError("Event not found or failed to load.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!user) return alert("Please log in to register.");
        setIsRegistering(true);
        try {
            const reg = await mockBackend.registerForEvent(eventId, user.id);
            setRegistration(reg);
            // On success, the UI will automatically switch to the Authorization Document view
        } catch (err) {
            alert(err.message);
        } finally {
            setIsRegistering(false);
        }
    };

    const handleOpenTimetable = () => {
        // Fetch timetable to find overlapping classes
        // For simulation, just grabbing the first day of the timetable
        setTimetable(mockBackend.timetable.schedule[0].slots);
        setShowTimetableModal(true);
    };

    const handleToggleSlot = (slot) => {
        if (selectedSlots.includes(slot)) {
            setSelectedSlots(selectedSlots.filter(s => s !== slot));
        } else {
            setSelectedSlots([...selectedSlots, slot]);
        }
    };

    const handleSendAuthorization = async () => {
        if (selectedSlots.length === 0) return alert("Select at least one class.");
        setIsSendingAuth(true);
        try {
            await mockBackend.requestAttendanceAuthorization(eventId, user.id, selectedSlots);
            alert("Authorization Document successfully sent to selected faculty.");
            setShowTimetableModal(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSendingAuth(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([600, 400]);
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

            // Draw Header
            page.drawText('OneCampus', { x: 50, y: 350, size: 24, font, color: rgb(0, 0.4, 0.8) });
            page.drawText('Participation Authorization Document', { x: 50, y: 320, size: 16, font, color: rgb(0, 0, 0) });
            
            // Draw Divider
            page.drawLine({ start: { x: 50, y: 300 }, end: { x: 550, y: 300 }, thickness: 2, color: rgb(0.8, 0.8, 0.8) });

            // Draw Details
            page.drawText(`Student Name: ${user.name}`, { x: 50, y: 260, size: 12, font: fontReg });
            page.drawText(`Registration ID: ${registration.qrToken}`, { x: 50, y: 240, size: 12, font: fontReg });
            page.drawText(`Event: ${event.title}`, { x: 50, y: 200, size: 12, font: fontReg });
            page.drawText(`Date: ${event.start_date}`, { x: 50, y: 180, size: 12, font: fontReg });
            page.drawText(`Venue: ${event.venue}`, { x: 50, y: 160, size: 12, font: fontReg });
            page.drawText(`Status: Officially Registered & Approved`, { x: 50, y: 140, size: 12, font: fontReg, color: rgb(0, 0.6, 0) });

            // Draw Footer
            page.drawText(`Generated on: ${new Date().toLocaleString()}`, { x: 50, y: 50, size: 10, font: fontReg, color: rgb(0.5, 0.5, 0.5) });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Auth_Document_${event.title.replace(/\s+/g, '_')}.pdf`;
            link.click();
        } catch (err) {
            console.error(err);
            alert("Failed to generate PDF");
        }
    };

    if (loading) return <div className="feature-container" style={{ padding: '2rem' }}>Loading event details...</div>;
    if (error) return <div className="feature-container" style={{ padding: '2rem', color: 'var(--error)' }}>{error}</div>;
    if (!event) return null;

    return (
        <div className="feature-container" style={{ padding: '2rem' }}>
            
            {/* Header / Navigation */}
            <div style={{ marginBottom: '2rem' }}>
                <button 
                    onClick={() => router.push('/dashboard/events')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1rem' }}
                >
                    &larr; Back to Events
                </button>
                <div className="tags-row" style={{ marginBottom: '1rem' }}>
                    <span className="tag" style={{ background: 'var(--accent-primary)', color: '#000' }}>{event.category}</span>
                    <span className="tag" style={{ background: 'rgba(255,255,255,0.1)' }}>{event.type}</span>
                    <span className={`tag ${event.status === 'Upcoming' ? 'success' : 'warning'}`}>{event.status}</span>
                </div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{event.title}</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>{event.tagline}</p>
            </div>

            <div className="grid-container" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                
                {/* LEFT COLUMN: Event Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Banner Image Placeholder */}
                    <div style={{ 
                        width: '100%', height: '300px', backgroundColor: 'var(--bg-secondary)', 
                        border: '2px solid var(--border-color)', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundImage: event.poster_url ? `url(${event.poster_url})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center'
                    }}>
                        {!event.poster_url && <Target size={64} style={{ opacity: 0.2 }} />}
                    </div>

                    <div className="card">
                        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '1rem' }}>About this Event</h3>
                        <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{event.description}</p>
                    </div>

                    <div className="card">
                        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '1rem' }}>Rules & Criteria</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <strong style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: '5px' }}>Judging Criteria</strong>
                                <p>{event.judging_criteria || 'Not specified.'}</p>
                            </div>
                            <div>
                                <strong style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: '5px' }}>Certification Criteria</strong>
                                <p>{event.certification_criteria || 'Not specified.'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Actions & Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Post-Event Report Card */}
                    {event.status === 'Completed' && event.report && (
                        <div className="card" style={{ background: 'var(--bg-secondary)', border: '2px solid var(--accent-primary)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                <Award size={20} color="var(--accent-primary)" /> Post-Event Report
                            </h3>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Attendees</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{event.report.totalAttendees}</div>
                                </div>
                                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Feedback Score</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{event.report.feedbackScore}</div>
                                </div>
                            </div>
                            
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Highlights</h4>
                                <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                                    {event.report.highlights.map((h, i) => <li key={i}>{h}</li>)}
                                </ul>
                            </div>
                            
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Winners</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {event.report.winners.map((w, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                                            <span>{w.name}</span>
                                            <strong style={{ color: 'var(--success)' }}>{w.prize}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                "{event.report.summary}"
                            </p>
                        </div>
                    )}

                    {/* Registration / Authorization Card */}
                    {event.status !== 'Completed' && (
                    <div className="card" style={{ 
                        background: registration ? 'var(--bg-secondary)' : 'var(--bg-card)', 
                        border: registration ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)' 
                    }}>
                        
                        {!registration ? (
                            <>
                                <h3 style={{ marginBottom: '1rem' }}>Registration</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                    Deadline: {event.registration_deadline ? new Date(event.registration_deadline).toLocaleDateString() : 'None'}
                                </p>
                                <button 
                                    className="login-btn" 
                                    style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem', padding: '1rem' }}
                                    onClick={() => {
                                        if (!user) return alert("Please log in to register.");
                                        setShowRegistrationForm(true);
                                    }}
                                    disabled={isRegistering || event.status !== 'Upcoming'}
                                >
                                    {isRegistering ? 'Registering...' : 'Register Now'}
                                </button>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="view-btn" style={{ flex: 1, justifyContent: 'center' }}><CheckCircle2 size={16}/> Save</button>
                                    <button className="view-btn" style={{ flex: 1, justifyContent: 'center' }}><Share2 size={16}/> Share</button>
                                </div>
                            </>
                        ) : (
                            // AUTHORIZATION DOCUMENT UI
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ 
                                    width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' 
                                }}>
                                    <CheckCircle size={32} color="var(--success)" />
                                </div>
                                
                                <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Registration Confirmed</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                    Verification ID: <br/><strong style={{ color: 'var(--text-primary)' }}>{registration.qrToken}</strong>
                                </p>

                                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--border-color)', marginBottom: '1.5rem', textAlign: 'left' }}>
                                    <h4 style={{ fontSize: '0.85rem', marginBottom: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Participation Document Actions</h4>
                                    
                                    <button 
                                        className="login-btn" 
                                        style={{ width: '100%', marginBottom: '10px', fontSize: '0.9rem' }}
                                        onClick={handleOpenTimetable}
                                    >
                                        <Send size={16} /> Share Through Timetable
                                    </button>
                                    
                                    <button 
                                        className="view-btn" 
                                        onClick={handleDownloadPDF}
                                        style={{ width: '100%', marginBottom: '10px', background: 'transparent', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                                    >
                                        <Download size={16} /> Download PDF
                                    </button>
                                    
                                    <button 
                                        className="view-btn" 
                                        onClick={handleOpenTimetable}
                                        style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                                    >
                                        <Share2 size={16} /> Manual Share
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    )}

                    {/* Quick Info Card */}
                    <div className="paper-card">
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>At a Glance</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <Calendar size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>Date & Time</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        {event.start_date} to {event.end_date}<br/>
                                        {event.timings}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <MapPin size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>Venue ({event.mode})</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{event.venue}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <Users size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>Participation</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        Team Size: {event.team_size}<br/>
                                        Limit: {event.participation_limit} Participants
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <BookOpen size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>Department</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{event.department}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* REGISTRATION FORM MODAL */}
            {showRegistrationForm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckCircle2 color="var(--accent-primary)" /> Confirm Registration
                        </h2>
                        
                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</label>
                                <input type="text" className="filter-select" style={{ width: '100%' }} defaultValue={user?.name || ''} readOnly />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>USN / Roll No</label>
                                    <input type="text" className="filter-select" style={{ width: '100%' }} defaultValue={user?.usn || ''} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Department</label>
                                    <input type="text" className="filter-select" style={{ width: '100%' }} defaultValue="Computer Science" />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Contact Email</label>
                                <input type="email" className="filter-select" style={{ width: '100%' }} defaultValue={user?.email || ''} readOnly />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="view-btn" onClick={() => setShowRegistrationForm(false)}>Cancel</button>
                            <button 
                                className="login-btn" 
                                onClick={() => {
                                    setShowRegistrationForm(false);
                                    handleRegister();
                                }}
                                disabled={isRegistering}
                            >
                                Submit Registration
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TIMETABLE SHARE MODAL */}
            {showTimetableModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Send color="var(--accent-primary)" /> Share Authorization
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            We detected the following classes overlapping with the event date ({event.start_date}). 
                            Select the classes to send an Attendance Authorization Request to the respective faculty.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                            {timetable?.map((slot, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => handleToggleSlot(slot)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px',
                                        border: selectedSlots.includes(slot) ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, color: selectedSlots.includes(slot) ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{slot.subject}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Period {slot.period} ({slot.type})</div>
                                    </div>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid', 
                                        borderColor: selectedSlots.includes(slot) ? 'var(--accent-primary)' : 'var(--border-color)',
                                        background: selectedSlots.includes(slot) ? 'var(--accent-primary)' : 'transparent'
                                    }} />
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="view-btn" onClick={() => setShowTimetableModal(false)}>Cancel</button>
                            <button 
                                className="login-btn" 
                                onClick={handleSendAuthorization}
                                disabled={isSendingAuth || selectedSlots.length === 0}
                            >
                                {isSendingAuth ? 'Sending...' : 'Send Requests'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
