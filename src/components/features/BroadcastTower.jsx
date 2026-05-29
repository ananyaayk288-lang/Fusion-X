"use client";
import React, { useState } from 'react';
import { Radio, Send, Bell, ShieldAlert, Users, MessageSquare, RefreshCw, CheckCircle } from 'lucide-react';

export default function BroadcastTower() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('Emergency Broadcast');
    const [priority, setPriority] = useState('CRITICAL (IMMEDIATE)');
    
    const [recipients, setRecipients] = useState({
        students: true,
        faculty: false,
        parents: true
    });

    const [channels, setChannels] = useState({
        banner: true,
        push: true,
        sms: false
    });

    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [broadcastLogs, setBroadcastLogs] = useState([]);
    const [pulseWaves, setPulseWaves] = useState(false);

    const handleRecipientToggle = (key) => {
        setRecipients(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChannelToggle = (key) => {
        setChannels(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const executeGlobalBroadcast = () => {
        if (!title || !message) {
            alert('Please compose alert title and body message before broadcasting!');
            return;
        }

        setIsBroadcasting(true);
        setPulseWaves(true);
        setBroadcastLogs([
            'Authenticating system broadcast token...',
            'Initializing bulk messaging pools...'
        ]);

        setTimeout(() => {
            setBroadcastLogs(prev => [...prev, `Targeting Recipient Vectors: ${Object.keys(recipients).filter(k => recipients[k]).join(', ').toUpperCase()}`]);
        }, 500);

        setTimeout(() => {
            setBroadcastLogs(prev => [...prev, `Active alert delivery channels optimized: ${Object.keys(channels).filter(c => channels[c]).join(', ').toUpperCase()}`]);
        }, 1000);

        setTimeout(() => {
            setBroadcastLogs(prev => [...prev, `Broadcasting packet: "${title.substring(0, 30)}..." [Priority: ${priority}]`]);
        }, 1500);

        setTimeout(() => {
            setIsBroadcasting(false);
            setBroadcastLogs(prev => [...prev, 'System Broadcast Dispatched! 3,850 SMS/Push packets successfully routed through gateway.']);
            setTitle('');
            setMessage('');
            setTimeout(() => {
                setPulseWaves(false);
            }, 3000);
        }, 2200);
    };

    return (
        <div className="broadcast-container animate-enter" style={{ color: 'var(--text-primary)', padding: '1.5rem 0.5rem', backgroundColor: 'var(--bg-app-background)' }}>
            
            {/* Header Banner */}
            <div className="lms-title-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <span>Global Broadcast Tower</span>
                <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 500, color: 'var(--accent-primary)' }}>
                    Bulk instant alerts, SMS, and service worker push dispatcher
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                
                {/* Alert Composer Form */}
                <div style={panelCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <Radio size={20} color="#ef4444" />
                        <h3 style={panelHeaderStyle}>Broadcast Signal Composer</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Title input */}
                        <div>
                            <label style={labelStyle}>Alert Title / Heading</label>
                            <input 
                                type="text" 
                                placeholder="e.g. VVCE Power grid maintenance - HVAC system reduced loads" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        {/* Category & Priority Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Broadcast Category</label>
                                <select 
                                    value={category} 
                                    onChange={(e) => setCategory(e.target.value)} 
                                    style={inputStyle}
                                >
                                    <option value="Emergency Broadcast">Emergency Broadcast</option>
                                    <option value="Operational Notice">Operational Notice</option>
                                    <option value="RFID Audit Notification">RFID Audit Notification</option>
                                    <option value="Syllabus Warning Alert">Syllabus Warning Alert</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Priority Level</label>
                                <select 
                                    value={priority} 
                                    onChange={(e) => setPriority(e.target.value)} 
                                    style={inputStyle}
                                >
                                    <option value="CRITICAL (IMMEDIATE)">CRITICAL (IMMEDIATE)</option>
                                    <option value="Standard Operations">Standard Operations</option>
                                    <option value="Low Advisory">Low Advisory</option>
                                </select>
                            </div>
                        </div>

                        {/* Textarea description */}
                        <div>
                            <label style={labelStyle}>Alert Body Message</label>
                            <textarea 
                                placeholder="Type the broadcast message to dispatch. Keep it clear, direct, and actionable." 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                style={{ ...inputStyle, height: '110px', resize: 'none' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Filters, Animation, Send Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Targeting Matrices */}
                    <div style={panelCardStyle}>
                        <h3 style={{ ...panelHeaderStyle, marginBottom: '10px' }}>Target Matrices</h3>
                        
                        {/* Recipients */}
                        <div style={{ marginBottom: '12px' }}>
                            <span style={matrixLabelStyle}>Recipient Nodes</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                                <button 
                                    onClick={() => handleRecipientToggle('students')}
                                    style={badgeBtnStyle(recipients.students)}
                                >
                                    Students (3,400+)
                                </button>
                                <button 
                                    onClick={() => handleRecipientToggle('faculty')}
                                    style={badgeBtnStyle(recipients.faculty)}
                                >
                                    Faculty (150+)
                                </button>
                                <button 
                                    onClick={() => handleRecipientToggle('parents')}
                                    style={badgeBtnStyle(recipients.parents)}
                                >
                                    Parents Defaulters (450+)
                                </button>
                            </div>
                        </div>

                        {/* Channels */}
                        <div>
                            <span style={matrixLabelStyle}>Active Delivery Channels</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                                <button 
                                    onClick={() => handleChannelToggle('banner')}
                                    style={badgeBtnStyle(channels.banner)}
                                >
                                    Dashboard Alert Banner
                                </button>
                                <button 
                                    onClick={() => handleChannelToggle('push')}
                                    style={badgeBtnStyle(channels.push)}
                                >
                                    Browser Push (PWA)
                                </button>
                                <button 
                                    onClick={() => handleChannelToggle('sms')}
                                    style={badgeBtnStyle(channels.sms)}
                                >
                                    Bulk SMS Gateway
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Ripple animation visualizer & Dispatch button */}
                    <div style={panelCardStyle}>
                        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
                            {pulseWaves && (
                                <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.08)', animation: 'rippleGlow 1.5s infinite linear' }} />
                            )}
                            <Radio size={40} color={pulseWaves ? 'var(--error)' : 'var(--text-secondary)'} style={{ zIndex: 2, transform: pulseWaves ? 'scale(1.15)' : 'none', transition: 'all 0.3s' }} />
                            <span style={{ fontSize: '0.7rem', color: pulseWaves ? 'var(--error)' : 'var(--text-secondary)', fontWeight: 'bold', zIndex: 2, marginTop: '8px', textTransform: 'uppercase' }}>
                                {pulseWaves ? 'TRANSMITTING SIGNAL...' : 'TOWER IDLE'}
                            </span>

                            <style>{`
                                @keyframes rippleGlow {
                                    0% { transform: scale(0.2); opacity: 0.8; }
                                    100% { transform: scale(1.5); opacity: 0; }
                                }
                            `}</style>
                        </div>

                        <button 
                            onClick={executeGlobalBroadcast}
                            disabled={isBroadcasting}
                            style={{
                                width: '100%',
                                background: isBroadcasting ? 'rgba(31, 41, 55, 0.4)' : 'rgba(239, 68, 68, 0.15)',
                                border: isBroadcasting ? '1px solid #374151' : '1px solid #ef4444',
                                color: isBroadcasting ? '#4b5563' : '#ef4444',
                                padding: '12px',
                                borderRadius: '6px',
                                fontWeight: '800',
                                cursor: isBroadcasting ? 'default' : 'pointer',
                                textTransform: 'uppercase',
                                fontSize: '0.8rem',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {isBroadcasting ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                            {isBroadcasting ? 'Broadcasting...' : 'Dispatch Broadcast Signal'}
                        </button>
                    </div>

                </div>

            </div>

            {/* Live broadcast logging feedback console */}
            {broadcastLogs.length > 0 && (
                <div style={{ ...panelCardStyle, marginTop: '1.5rem' }}>
                    <h3 style={panelHeaderStyle}>Transmission Signal Stream</h3>
                    <div style={{ 
                        marginTop: '10px', 
                        background: 'var(--bg-secondary)', 
                        border: '1px solid var(--border-color)',
                        padding: '12px', 
                        borderRadius: '6px', 
                        fontFamily: 'monospace', 
                        fontSize: '0.72rem', 
                        color: 'var(--error)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                    }}>
                        {broadcastLogs.map((log, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>[TOWER] &gt;&gt;</span>
                                <span>{log}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}

// Styling definitions
const panelCardStyle = {
    background: 'var(--bg-card)',
    border: '2px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
};

const panelHeaderStyle = {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: 'var(--text-primary)'
};

const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    display: 'block',
    marginBottom: '6px'
};

const inputStyle = {
    width: '100%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '10px 12px',
    fontSize: '0.82rem',
    color: 'var(--text-primary)',
    outline: 'none',
    boxSizing: 'border-box'
};

const matrixLabelStyle = {
    fontSize: '0.7rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#555',
    display: 'block'
};

const badgeBtnStyle = (isActive) => ({
    background: isActive ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-primary)',
    border: isActive ? '1px solid var(--error)' : '1px solid var(--border-color)',
    color: isActive ? 'var(--error)' : 'var(--text-secondary)',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s'
});
