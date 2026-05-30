"use client";
import React, { useState, useEffect } from 'react';
import {
    BookOpen, Package, Clock, CheckCircle2, AlertTriangle,
    RefreshCw, Search, ArrowRight, Calendar, Tag
} from 'lucide-react';
import './FeatureStyles.css';

const LibraryBorrowing = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [returning, setReturning] = useState(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/library/borrow');
            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
            }
        } catch (err) {
            console.error('Failed to fetch borrowed items:', err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchItems(); }, []);

    const handleReturn = async (borrowId) => {
        setReturning(borrowId);
        try {
            const res = await fetch('/api/library/return', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ borrow_id: borrowId }),
            });
            if (res.ok) fetchItems();
        } catch (err) {
            console.error('Return failed:', err);
        }
        setReturning(null);
    };

    const activeItems = items.filter(i => i.status === 'borrowed');
    const returnedItems = items.filter(i => i.status === 'returned');
    const overdueItems = activeItems.filter(i => new Date(i.due_date) < new Date());
    const displayItems = activeTab === 'active' ? activeItems : returnedItems;

    return (
        <div className="feature-container" style={{ padding: '2rem' }}>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Active Borrows', value: activeItems.length, icon: BookOpen, color: '#6366f1' },
                    { label: 'Overdue', value: overdueItems.length, icon: AlertTriangle, color: '#ef4444' },
                    { label: 'Returned', value: returnedItems.length, icon: CheckCircle2, color: '#22c55e' },
                    { label: 'Total', value: items.length, icon: Package, color: '#8b5cf6' },
                ].map(stat => (
                    <div key={stat.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 42, height: 42, borderRadius: '50%', background: stat.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <stat.icon size={20} color={stat.color} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Overdue Warning */}
            {overdueItems.length > 0 && (
                <div className="card" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <AlertTriangle size={24} color="#ef4444" />
                    <div>
                        <p style={{ fontWeight: 700, color: '#ef4444' }}>You have {overdueItems.length} overdue item(s)!</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Please return them immediately to avoid penalty fines.</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { key: 'active', label: `Active (${activeItems.length})` },
                    { key: 'returned', label: `History (${returnedItems.length})` },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                        padding: '8px 20px', borderRadius: 'var(--radius-md)', border: '2px solid',
                        borderColor: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--border-color)',
                        background: activeTab === tab.key ? 'rgba(99,102,241,0.1)' : 'transparent',
                        color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                    }}>{tab.label}</button>
                ))}
            </div>

            {/* Items List */}
            <div className="card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <RefreshCw size={24} className="spin-icon" style={{ opacity: 0.5 }} />
                    </div>
                ) : displayItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <BookOpen size={40} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {activeTab === 'active' ? 'No items currently borrowed. Scan your RFID at the library to borrow.' : 'No return history yet.'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {displayItems.map(item => {
                            const isOverdue = item.status === 'borrowed' && new Date(item.due_date) < new Date();
                            const daysLeft = Math.ceil((new Date(item.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={item.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '1rem', borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-primary)',
                                    border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.4)' : 'var(--border-color)'}`,
                                    flexWrap: 'wrap', gap: '0.75rem',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 200px' }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 'var(--radius-md)',
                                            background: item.item_type === 'book' ? 'rgba(99,102,241,0.12)' : 'rgba(245,158,11,0.12)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {item.item_type === 'book' ? <BookOpen size={18} color="#6366f1" /> : <Package size={18} color="#f59e0b" />}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Item #{item.item_id?.slice(0, 8)}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                                <Tag size={10} color="var(--text-secondary)" />
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{item.item_type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={12} color="var(--text-secondary)" />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            Due: {new Date(item.due_date).toLocaleDateString('en-IN')}
                                        </span>
                                    </div>
                                    {item.status === 'borrowed' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{
                                                fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px',
                                                borderRadius: '999px',
                                                background: isOverdue ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                                                color: isOverdue ? '#ef4444' : '#22c55e',
                                            }}>
                                                {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                                            </span>
                                            <button
                                                className="view-btn"
                                                style={{ width: 'auto', padding: '6px 16px', fontSize: '0.8rem' }}
                                                onClick={() => handleReturn(item.id)}
                                                disabled={returning === item.id}
                                            >
                                                {returning === item.id ? <RefreshCw size={14} className="spin-icon" /> : <CheckCircle2 size={14} />}
                                                Return
                                            </button>
                                        </div>
                                    )}
                                    {item.status === 'returned' && (
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', background: 'rgba(107,114,128,0.15)', color: '#6b7280' }}>
                                            Returned {item.returned_at ? new Date(item.returned_at).toLocaleDateString('en-IN') : ''}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryBorrowing;
