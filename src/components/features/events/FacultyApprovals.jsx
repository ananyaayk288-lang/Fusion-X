'use client';

import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../../services/mockBackend';
import { useAuth } from '../../../context/AuthContext';
import { CheckCircle, XCircle, Clock, FileText, User } from 'lucide-react';
import '../FeatureStyles.css';

export default function FacultyApprovals() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await mockBackend.getPendingAuthorizations();
            setRequests(data || []);
        } catch (err) {
            console.error("Error fetching requests:", err);
            setError("Unable to load authorization requests.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await mockBackend.approveAuthorization(id);
            // Refresh list
            fetchRequests();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleReject = async (id) => {
        // Mock rejection logic (we just remove it from pending view)
        setRequests(requests.filter(r => r.id !== id));
    };

    if (loading) return <div className="feature-container" style={{ padding: '2rem' }}>Loading requests...</div>;

    if (user?.role !== 'teacher' && user?.role !== 'admin') {
        return (
            <div className="feature-container" style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="card warning">
                    <h3>Access Denied</h3>
                    <p>Only faculty members can access the Attendance Approval Dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="feature-container" style={{ padding: '2rem' }}>
            <div className="feature-header" style={{ marginBottom: '2rem' }}>
                <h1>Attendance Authorization Requests</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Review and approve institutional activity participation to grant attendance.</p>
            </div>

            {error && (
                <div className="card warning" style={{ marginBottom: '2rem' }}>
                    <p>{error}</p>
                </div>
            )}

            {requests.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <CheckCircle size={48} style={{ opacity: 0.3, margin: '0 auto 1rem', color: 'var(--success)' }} />
                    <h3>All Caught Up</h3>
                    <p>There are no pending attendance authorization requests at this time.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {requests.map(req => (
                        <div key={req.id} className="paper-card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }}>
                            
                            {/* Request Details */}
                            <div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                    <span className="tag" style={{ background: 'var(--accent-primary)', color: '#000' }}>Event Duty</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Requested: {new Date(req.requestedAt).toLocaleString()}</span>
                                </div>
                                
                                <h3 style={{ marginBottom: '10px' }}>{req.eventTitle}</h3>
                                
                                <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Student</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                                            <User size={16} color="var(--accent-primary)" /> {req.studentName} ({req.usn})
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Affected Classes</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                                            <Clock size={16} color="var(--accent-primary)" /> {req.affectedSlots?.length || 0} Slots
                                        </div>
                                    </div>
                                </div>

                                {/* List of slots */}
                                {req.affectedSlots?.length > 0 && (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        <strong>Classes to excuse:</strong> {req.affectedSlots.map(s => s.subject).join(', ')}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '150px' }}>
                                <button 
                                    className="login-btn" 
                                    style={{ justifyContent: 'center', background: 'var(--success)' }}
                                    onClick={() => handleApprove(req.id)}
                                >
                                    <CheckCircle size={18} /> Approve
                                </button>
                                <button 
                                    className="view-btn" 
                                    style={{ justifyContent: 'center', background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)' }}
                                    onClick={() => handleReject(req.id)}
                                >
                                    <XCircle size={18} /> Reject
                                </button>
                                <button 
                                    className="view-btn" 
                                    style={{ justifyContent: 'center', background: 'transparent', border: '1px solid var(--border-color)' }}
                                >
                                    <FileText size={18} /> Review Document
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
