"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, RefreshCw, Cpu, Wifi, Radio, AlertTriangle, CheckCircle, Terminal, Play } from 'lucide-react';

export default function TelemetryMap() {
    const [selectedNode, setSelectedNode] = useState(null);
    const [isSweeping, setIsSweeping] = useState(false);
    const [terminalLogs, setTerminalLogs] = useState([
        { time: '15:48:22', text: 'Telemetry server initialized on node :8088', type: 'info' },
        { time: '15:49:05', text: 'BLE Gateway CSE-Lobby broadcast pulse active.', type: 'info' },
        { time: '15:50:00', text: '4/4 RF Node links reported stable mesh network state.', type: 'success' }
    ]);

    const initialNodes = [
        { id: 'gate-1', name: 'Main Entry RFID Gate', type: 'RFID Scanner', location: 'Campus Main Entrance', status: 'online', latency: 12, ip: '10.12.105.41', rssi: -58 },
        { id: 'library-rfid', name: 'Library Entry RFID Turnstile', type: 'RFID Scanner', location: 'Central Library Ground Floor', status: 'online', latency: 15, ip: '10.12.105.45', rssi: -62 },
        { id: 'cse-ble', name: 'Science Block BLE Beacon', type: 'BLE Proximity', location: 'CSE Dept corridor 3rd Floor', status: 'online', latency: 28, ip: '10.12.108.12', rssi: -45 },
        { id: 'solar-inv', name: 'Solar Grid Inverter Node', type: 'Modbus Telemetry', location: 'Green Solar Park Array 2', status: 'warning', latency: 145, ip: '10.12.110.8', rssi: -78 }
    ];

    const [nodes, setNodes] = useState(initialNodes);

    useEffect(() => {
        if (!selectedNode) {
            setSelectedNode(nodes[0]);
        }
    }, [nodes, selectedNode]);

    // Live fluctuate latency and RSSI
    useEffect(() => {
        const interval = setInterval(() => {
            setNodes(prevNodes => 
                prevNodes.map(node => {
                    if (node.status === 'offline') return node;
                    const latencyDiff = (Math.random() - 0.5) * 4;
                    const rssiDiff = (Math.random() - 0.5) * 2;
                    return {
                        ...node,
                        latency: Math.max(5, Math.min(300, Math.round(node.latency + latencyDiff))),
                        rssi: Math.max(-95, Math.min(-30, Math.round(node.rssi + rssiDiff)))
                    };
                })
            );
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Update selectedNode detail live
    const activeNodeDetails = useMemo(() => {
        if (!selectedNode) return null;
        return nodes.find(n => n.id === selectedNode.id) || selectedNode;
    }, [nodes, selectedNode]);

    const handleNodeClick = (node) => {
        setSelectedNode(node);
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        setTerminalLogs(prev => [
            { time: timeStr, text: `Queried status for ${node.name} [IP: ${node.ip}]`, type: 'info' },
            ...prev
        ]);
    };

    const runPingDiagnostic = (node) => {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        setTerminalLogs(prev => [
            { time: timeStr, text: `PING ${node.ip} with 32 bytes of telemetry payload...`, type: 'info' },
            ...prev
        ]);

        setTimeout(() => {
            const success = Math.random() > 0.05; // 95% success
            const pingLatency = success ? node.latency : 'Timeout';
            const logTime = new Date().toTimeString().split(' ')[0];
            
            if (success) {
                setTerminalLogs(prev => [
                    { time: logTime, text: `Reply from ${node.ip}: bytes=32 time=${pingLatency}ms TTL=64 (RSSI: ${node.rssi}dBm)`, type: 'success' },
                    ...prev
                ]);
            } else {
                setTerminalLogs(prev => [
                    { time: logTime, text: `Request timed out. Node ${node.name} failed handshake.`, type: 'error' },
                    ...prev
                ]);
            }
        }, 800);
    };

    const triggerNetworkSweep = () => {
        setIsSweeping(true);
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        setTerminalLogs(prev => [
            { time: timeStr, text: 'INITIATING DYNAMIC MESH NETWORK SCAN...', type: 'warning' },
            ...prev
        ]);

        setTimeout(() => {
            setIsSweeping(false);
            const finishedTime = new Date().toTimeString().split(' ')[0];
            
            // Randomly resolve the solar warning or trigger a temporary warning change
            setNodes(prev => prev.map(node => {
                if (node.id === 'solar-inv') {
                    return { ...node, status: 'online', latency: 45 };
                }
                return node;
            }));

            setTerminalLogs(prev => [
                { time: finishedTime, text: 'Sweep complete. Re-routed Solar Grid Inverter through Secondary BLE mesh bridge. Status resolved to stable.', type: 'success' },
                { time: finishedTime, text: 'Scan results: 4/4 nodes active, 0 packet loss.', type: 'info' },
                ...prev
            ]);
        }, 2000);
    };

    return (
        <div className="telemetry-container animate-enter" style={{ color: 'var(--text-primary)', padding: '1.5rem 0.5rem', backgroundColor: 'var(--bg-app-background)' }}>
            
            {/* Header Banner */}
            <div className="lms-title-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <span>Real-Time Telemetry & Campus Map</span>
                <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 500, color: 'var(--accent-primary)' }}>
                    Active hardware nodes & antenna health telemetry
                </span>
            </div>

            {/* Network Sweep Command Panel */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', border: '2px solid var(--border-color)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Institutional Mesh Status</h3>
                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                        Scan and monitor 4 distributed RFID and BLE telemetry modules across VVCE.
                    </p>
                </div>
                <button 
                    onClick={triggerNetworkSweep} 
                    disabled={isSweeping}
                    style={{
                        background: 'rgba(124, 58, 237, 0.15)',
                        border: '1px solid #7c3aed',
                        color: '#7c3aed',
                        padding: '10px 18px',
                        borderRadius: '6px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textTransform: 'uppercase',
                        transition: 'all 0.2s'
                    }}
                >
                    <RefreshCw size={16} className={isSweeping ? 'animate-spin' : ''} />
                    {isSweeping ? 'Sweeping Grid...' : 'Run Network Sweep'}
                </button>
            </div>

            {/* Core Map & Console Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr', gap: '1.5rem', alignItems: 'start' }}>
                
                {/* SVG interactive Campus Map */}
                <div style={panelCardStyle}>
                    <h3 style={panelHeaderStyle}>Interactive RFID & Sensor Placement Blueprint</h3>
                    <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '1.25rem' }}>
                        Click glowing hardware anchors to view real-time diagnostics and coordinate ping triggers.
                    </p>

                    <div style={{ position: 'relative', width: '100%', height: '340px', background: 'var(--bg-secondary)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 600 350" style={{ width: '100%', height: '100%', padding: '20px' }}>
                            {/* Grid Backdrop */}
                            <defs>
                                <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#mapGrid)" />

                            {/* Road Network Paths */}
                            <path d="M 0 175 L 600 175" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="24" fill="none" strokeLinecap="round" />
                            <path d="M 200 0 L 200 350" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="16" fill="none" strokeLinecap="round" />

                            {/* Building 1: Administrative Block */}
                            <rect x="30" y="30" width="120" height="90" rx="6" fill="var(--bg-primary)" stroke="var(--border-color)" strokeWidth="2" />
                            <text x="90" y="80" fill="var(--text-secondary)" fontSize="10" fontWeight="bold" textAnchor="middle">ADMIN BLOCK</text>

                            {/* Building 2: Science Block (CSE/ECE) */}
                            <rect x="250" y="30" width="180" height="100" rx="6" fill="var(--bg-primary)" stroke="var(--border-color)" strokeWidth="2" />
                            <text x="340" y="85" fill="var(--text-secondary)" fontSize="10" fontWeight="bold" textAnchor="middle">SCIENCE BLOCK (CSE/ECE)</text>

                            {/* Building 3: Central Library */}
                            <rect x="30" y="220" width="130" height="100" rx="6" fill="var(--bg-primary)" stroke="var(--border-color)" strokeWidth="2" />
                            <text x="95" y="275" fill="var(--text-secondary)" fontSize="10" fontWeight="bold" textAnchor="middle">CENTRAL LIBRARY</text>

                            {/* Building 4: Solar Park Array */}
                            <rect x="440" y="210" width="130" height="100" rx="6" fill="#0d1f14" stroke="#14532d" strokeWidth="2" />
                            <text x="505" y="265" fill="#15803d" fontSize="9" fontWeight="bold" textAnchor="middle">SOLAR GREEN ARRAY</text>

                            {/* Dynamic Anchors */}

                            {/* Node 1: Main Entrance Gate (IP: 10.12.105.41) */}
                            <g style={{ cursor: 'pointer' }} onClick={() => handleNodeClick(nodes[0])}>
                                <circle cx="200" cy="175" r="16" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" />
                                <circle cx="200" cy="175" r="7" fill={activeNodeDetails?.id === 'gate-1' ? '#10b981' : '#059669'} className={activeNodeDetails?.id === 'gate-1' ? 'pulse-active' : ''} />
                                <text x="200" y="152" fill="#10b981" fontSize="9" textAnchor="middle" fontWeight="bold">Main Gate RFID</text>
                            </g>

                            {/* Node 2: Library Turnstile */}
                            <g style={{ cursor: 'pointer' }} onClick={() => handleNodeClick(nodes[1])}>
                                <circle cx="120" cy="270" r="16" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" />
                                <circle cx="120" cy="270" r="7" fill={activeNodeDetails?.id === 'library-rfid' ? '#10b981' : '#059669'} />
                                <text x="120" y="248" fill="#10b981" fontSize="9" textAnchor="middle" fontWeight="bold">Library RFID</text>
                            </g>

                            {/* Node 3: Science Block BLE */}
                            <g style={{ cursor: 'pointer' }} onClick={() => handleNodeClick(nodes[2])}>
                                <circle cx="340" cy="80" r="16" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" />
                                <circle cx="340" cy="80" r="7" fill={activeNodeDetails?.id === 'cse-ble' ? '#10b981' : '#059669'} />
                                <text x="340" y="58" fill="#10b981" fontSize="9" textAnchor="middle" fontWeight="bold">CSE BLE</text>
                            </g>

                            {/* Node 4: Solar Grid Inverter */}
                            <g style={{ cursor: 'pointer' }} onClick={() => handleNodeClick(nodes[3])}>
                                <circle cx="505" cy="260" r="16" fill={nodes[3].status === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'} stroke={nodes[3].status === 'warning' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'} strokeWidth="1" />
                                <circle cx="505" cy="260" r="7" fill={nodes[3].status === 'warning' ? '#f59e0b' : '#10b981'} className={nodes[3].status === 'warning' ? 'pulse-warning' : ''} />
                                <text x="505" y="238" fill={nodes[3].status === 'warning' ? '#f59e0b' : '#10b981'} fontSize="9" textAnchor="middle" fontWeight="bold">Solar Inverter</text>
                            </g>
                        </svg>

                        {/* Pulse Styles */}
                        <style>{`
                            @keyframes pulseGlow {
                                0% { transform: scale(1); opacity: 1; }
                                50% { transform: scale(1.4); opacity: 0.4; }
                                100% { transform: scale(1); opacity: 1; }
                            }
                            .pulse-active {
                                animation: pulseGlow 1.8s infinite ease-in-out;
                            }
                            .pulse-warning {
                                animation: pulseGlow 1.2s infinite ease-in-out;
                            }
                        `}</style>
                    </div>
                </div>

                {/* Diagnostics and Action side panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Node details */}
                    {activeNodeDetails && (
                        <div style={panelCardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h3 style={panelHeaderStyle}>Hardware Node Audit</h3>
                                <span style={statusBadgeStyle(activeNodeDetails.status)}>
                                    {activeNodeDetails.status.toUpperCase()}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#888' }}>Node Name:</span>
                                    <span style={{ fontWeight: '700' }}>{activeNodeDetails.name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#888' }}>Access Type:</span>
                                    <span>{activeNodeDetails.type}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#888' }}>Zone:</span>
                                    <span>{activeNodeDetails.location}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#888' }}>IP Address:</span>
                                    <span style={{ fontFamily: 'monospace', color: '#10b981' }}>{activeNodeDetails.ip}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#888' }}>RF Signal (RSSI):</span>
                                    <span style={{ fontWeight: '700', color: activeNodeDetails.rssi > -60 ? '#10b981' : activeNodeDetails.rssi > -80 ? '#f59e0b' : '#ef4444' }}>
                                        {activeNodeDetails.rssi} dBm
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#888' }}>Mesh Latency:</span>
                                    <span>{activeNodeDetails.latency} ms</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '12px' }}>
                                <button 
                                    onClick={() => runPingDiagnostic(activeNodeDetails)}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        border: '1px solid #10b981',
                                        color: '#10b981',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        fontSize: '0.8rem',
                                        textTransform: 'uppercase',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Play size={14} /> Ping Diagnostician
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Integrated Diagnostics Console */}
                    <div style={panelCardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <Terminal size={18} color="#10b981" />
                            <h3 style={panelHeaderStyle}>Diagnostics Handshake Terminal</h3>
                        </div>

                        <div style={{ 
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            padding: '10px', 
                            fontSize: '0.7rem', 
                            fontFamily: 'monospace', 
                            color: 'var(--text-primary)',
                            height: '140px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                        }}>
                            {terminalLogs.map((line, i) => (
                                <div key={i}>
                                    <span style={{ color: 'var(--text-secondary)' }}>[{line.time}]</span>{' '}
                                    <span style={{ color: line.type === 'error' ? 'var(--error)' : line.type === 'warning' ? 'var(--accent-action)' : line.type === 'success' ? 'var(--success)' : 'var(--accent-primary)' }}>
                                        {line.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Inline component style classes
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

const statusBadgeStyle = (status) => {
    const isOnline = status === 'online';
    const isWarning = status === 'warning';
    return {
        background: isOnline ? 'rgba(16, 185, 129, 0.1)' : isWarning ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        border: isOnline ? '1px solid #10b981' : isWarning ? '1px solid #f59e0b' : '1px solid #ef4444',
        color: isOnline ? '#10b981' : isWarning ? '#f59e0b' : '#ef4444',
        fontSize: '0.65rem',
        fontWeight: '800',
        padding: '3px 8px',
        borderRadius: '20px',
        letterSpacing: '0.5px'
    };
};
