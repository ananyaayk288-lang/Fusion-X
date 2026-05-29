"use client";
import React, { useState, useEffect } from 'react';
import { Zap, Sun, BatteryCharging, ArrowUpRight, ArrowDownRight, RefreshCw, Cpu, Award } from 'lucide-react';

export default function MicrogridOptimizer() {
    const [solarOutput, setSolarOutput] = useState(245);
    const [batteryLevel, setBatteryLevel] = useState(88);
    const [campusLoad, setCampusLoad] = useState(180);
    const [sheddedLoad, setSheddedLoad] = useState(0);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [log, setLog] = useState([
        { time: '15:48:22', text: 'Auto-balanced battery bank cells. Charging stable.', type: 'info' },
        { time: '15:45:10', text: 'Solar Array 4 optimized tilt tracking updated (+15 kW efficiency).', type: 'success' },
        { time: '15:40:00', text: 'Microgrid master controller reports 100% telemetry synched.', type: 'info' }
    ]);

    // Live fluctuate values slightly to look alive and awesome!
    useEffect(() => {
        const interval = setInterval(() => {
            setSolarOutput(prev => {
                const diff = (Math.random() - 0.5) * 4;
                return Math.max(100, Math.min(400, Math.round(prev + diff)));
            });
            setCampusLoad(prev => {
                const diff = (Math.random() - 0.5) * 2;
                return Math.max(100, Math.min(300, Math.round(prev + diff)));
            });
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const netExport = solarOutput - (campusLoad - sheddedLoad);

    const triggerOptimization = () => {
        setIsOptimizing(true);
        setTimeout(() => {
            setIsOptimizing(false);
            setSheddedLoad(35);
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            setLog(prev => [
                { time: timeStr, text: 'Smart load shedding algorithm successful: Shed 35 kW of secondary building HVAC loads.', type: 'success' },
                ...prev
            ]);
        }, 1500);
    };

    const restoreAllLoads = () => {
        setSheddedLoad(0);
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        setLog(prev => [
            { time: timeStr, text: 'Full secondary loads restored to campus grid.', type: 'info' },
            ...prev
        ]);
    };

    return (
        <div className="microgrid-container animate-enter" style={{ color: 'var(--text-primary)', padding: '1.5rem 0.5rem', backgroundColor: 'var(--bg-app-background)' }}>
            {/* Header Banner */}
            <div className="lms-title-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <span>VVCE Microgrid Optimizer</span>
                <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 500, color: 'var(--accent-primary)' }}>
                    Active solar integration array & battery telemetry
                </span>
            </div>

            {/* Macro Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                
                {/* Solar Gen */}
                <div style={cardStyle} className="kpi-card">
                    <div style={iconBoxStyle('#f59e0b')}>
                        <Sun size={24} color="#f59e0b" />
                    </div>
                    <div>
                        <h3 style={kpiLabelStyle}>Solar Array Gen</h3>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>{solarOutput} kW</div>
                        <span style={kpiSubStyle}>Active panel tracking</span>
                    </div>
                </div>

                {/* Battery Bank */}
                <div style={cardStyle} className="kpi-card">
                    <div style={iconBoxStyle('#10b981')}>
                        <BatteryCharging size={24} color="#10b981" />
                    </div>
                    <div>
                        <h3 style={kpiLabelStyle}>Battery Storage</h3>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>{batteryLevel}%</div>
                        <span style={kpiSubStyle}>LiFePO4 high capacity</span>
                    </div>
                </div>

                {/* Campus Demand */}
                <div style={cardStyle} className="kpi-card">
                    <div style={iconBoxStyle('#ef4444')}>
                        <Cpu size={24} color="#ef4444" />
                    </div>
                    <div>
                        <h3 style={kpiLabelStyle}>Campus Active Load</h3>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444' }}>
                            {campusLoad - sheddedLoad} kW {sheddedLoad > 0 && <span style={{ fontSize: '0.9rem', color: '#ff8c00' }}>(-{sheddedLoad} kW)</span>}
                        </div>
                        <span style={kpiSubStyle}>Real-time sensor telemetry</span>
                    </div>
                </div>

                {/* Net Export */}
                <div style={cardStyle} className="kpi-card">
                    <div style={iconBoxStyle(netExport >= 0 ? '#10b981' : '#ef4444')}>
                        {netExport >= 0 ? <ArrowUpRight size={24} color="#10b981" /> : <ArrowDownRight size={24} color="#ef4444" />}
                    </div>
                    <div>
                        <h3 style={kpiLabelStyle}>Net Grid Export</h3>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: netExport >= 0 ? '#10b981' : '#ef4444' }}>
                            {netExport >= 0 ? `+${netExport}` : netExport} kW
                        </div>
                        <span style={kpiSubStyle}>{netExport >= 0 ? 'Exporting excess' : 'Drawing from grid'}</span>
                    </div>
                </div>
            </div>

            {/* Core Section: SVG Graph & Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                
                {/* SVG Visual Representation */}
                <div style={sectionCardStyle}>
                    <h3 style={sectionHeaderStyle}>Solar Output vs Campus Demand (24h Trend)</h3>
                    <div style={{ position: 'relative', height: '260px', marginTop: '1rem' }}>
                        <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                            {/* Grid Lines */}
                            <line x1="0" y1="50" x2="500" y2="50" stroke="#222" strokeDasharray="4" />
                            <line x1="0" y1="100" x2="500" y2="100" stroke="#222" strokeDasharray="4" />
                            <line x1="0" y1="150" x2="500" y2="150" stroke="#222" strokeDasharray="4" />

                            {/* Solar Generation Curve Area */}
                            <path 
                                d="M 0 190 Q 125 180 180 80 T 320 80 Q 375 180 500 190 L 500 200 L 0 200 Z" 
                                fill="rgba(245, 158, 11, 0.08)" 
                            />
                            <path 
                                d="M 0 190 Q 125 180 180 80 T 320 80 Q 375 180 500 190" 
                                fill="none" 
                                stroke="#f59e0b" 
                                strokeWidth="3" 
                            />

                            {/* Campus Load Line */}
                            <path 
                                d="M 0 130 C 50 140 100 120 150 145 C 200 170 250 110 300 130 C 350 150 400 140 500 120" 
                                fill="none" 
                                stroke="#ef4444" 
                                strokeWidth="3" 
                                strokeDasharray={sheddedLoad > 0 ? "5, 5" : "none"} 
                            />

                            {/* Dynamic Indicator Dots */}
                            <circle cx="245" cy="85" r="5" fill="#f59e0b" />
                            <circle cx="245" cy="130" r="5" fill="#ef4444" />
                        </svg>

                        {/* Custom Legend overlay */}
                        <div style={{ display: 'flex', gap: '15px', position: 'absolute', bottom: 10, left: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#f59e0b' }}>
                                <span style={{ width: '12px', height: '3px', background: '#f59e0b', borderRadius: '2px' }} />
                                Solar Output kW
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#ef4444' }}>
                                <span style={{ width: '12px', height: '3px', background: '#ef4444', borderRadius: '2px' }} />
                                Campus Active Load kW {sheddedLoad > 0 && '(Opt Shedded)'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Optimizers controls and telemetry logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Load shed controls */}
                    <div style={sectionCardStyle}>
                        <h3 style={sectionHeaderStyle}>Load Reduction Controller</h3>
                        <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '6px', lineHeight: 1.4 }}>
                            Instruct master system controllers to shed secondary building HVAC units or non-critical laboratory nodes dynamically.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1.25rem' }}>
                            <button 
                                onClick={triggerOptimization} 
                                disabled={isOptimizing || sheddedLoad > 0}
                                style={{
                                    width: '100%',
                                    background: sheddedLoad > 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255, 140, 0, 0.15)',
                                    border: sheddedLoad > 0 ? '1px solid #444' : '1px solid #ff8c00',
                                    color: sheddedLoad > 0 ? '#666' : '#ff8c00',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    fontWeight: '800',
                                    cursor: sheddedLoad > 0 ? 'default' : 'pointer',
                                    textTransform: 'uppercase',
                                    fontSize: '0.8rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isOptimizing ? 'Running AI shedding...' : sheddedLoad > 0 ? 'Shedding Complete (35 kW Active)' : 'Optimize Smart Shedding'}
                            </button>

                            {sheddedLoad > 0 && (
                                <button 
                                    onClick={restoreAllLoads} 
                                    style={{
                                        width: '100%',
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        border: '1px solid #10b981',
                                        color: '#10b981',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        fontSize: '0.8rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Restore Campus Loads
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Telemetry log list */}
                    <div style={{ ...sectionCardStyle, flex: 1 }}>
                        <h3 style={sectionHeaderStyle}>Microgrid Telemetry Logs</h3>
                        <div style={{ 
                            marginTop: '10px', 
                            fontSize: '0.7rem', 
                            fontFamily: 'monospace', 
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            padding: '10px',
                            color: 'var(--text-primary)',
                            maxHeight: '120px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                        }}>
                            {log.map((line, i) => (
                                <div key={i}>
                                    <span style={{ color: 'var(--text-secondary)' }}>[{line.time}]</span> {line.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Styling definitions
const cardStyle = {
    background: 'var(--bg-card)',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    border: '2px solid var(--border-color)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
};

const iconBoxStyle = (color) => ({
    backgroundColor: `${color}1A`,
    padding: '10px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
});

const kpiLabelStyle = {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    marginBottom: '2px'
};

const kpiSubStyle = {
    fontSize: '0.65rem',
    color: '#666',
    display: 'block',
    marginTop: '2px'
};

const sectionCardStyle = {
    background: 'var(--bg-card)',
    border: '2px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
};

const sectionHeaderStyle = {
    fontSize: '1rem',
    fontWeight: '800',
    color: 'var(--text-primary)'
};
