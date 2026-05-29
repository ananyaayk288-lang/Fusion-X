"use client";
import React, { useState } from 'react';
import { Sliders, Shield, AlertTriangle, Cpu, CheckCircle, RefreshCw, Info } from 'lucide-react';

export default function RulesConfig() {
    const [proxyWindow, setProxyWindow] = useState(3); // minutes
    const [minAttendance, setMinAttendance] = useState(75); // %
    const [bleProximity, setBleProximity] = useState(2.5); // meters
    const [antennaInterval, setAntennaInterval] = useState(15); // seconds

    const [isProxyEngineActive, setIsProxyEngineActive] = useState(true);
    const [isAiDropoutActive, setIsAiDropoutActive] = useState(true);
    const [isBleTriggersActive, setIsBleTriggersActive] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [saveProgress, setSaveProgress] = useState(0);
    const [syncLog, setSyncLog] = useState([]);

    const applyRulesToEdge = () => {
        setIsSaving(true);
        setSaveProgress(0);
        setSyncLog([
            'Connecting to master BLE Gateway broker...',
            'Acquiring Mutex Lock on Edge Node memory maps...'
        ]);

        const totalSteps = 5;
        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep += 1;
            setSaveProgress(Math.round((currentStep / totalSteps) * 100));

            if (currentStep === 1) {
                setSyncLog(prev => [...prev, `Pushed proxy detection time window: ${proxyWindow} minutes.`]);
            } else if (currentStep === 2) {
                setSyncLog(prev => [...prev, `Applied mandatory institutional attendance flag floor: <${minAttendance}%`]);
            } else if (currentStep === 3) {
                setSyncLog(prev => [...prev, `Updated beacon proximity filter criteria: ${bleProximity}m.`]);
            } else if (currentStep === 4) {
                setSyncLog(prev => [...prev, `Edge configuration integrity checksum: OK (0xAB4F2231).`]);
            } else if (currentStep === totalSteps) {
                clearInterval(interval);
                setIsSaving(false);
                setSyncLog(prev => [...prev, 'Edge Rules deployed successfully! 4/4 nodes synced.']);
            }
        }, 600);
    };

    return (
        <div className="rules-config-container animate-enter" style={{ color: 'var(--text-primary)', padding: '1.5rem 0.5rem', backgroundColor: 'var(--bg-app-background)' }}>
            
            {/* Header Banner */}
            <div className="lms-title-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <span>System Rules Configuration</span>
                <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 500, color: 'var(--accent-primary)' }}>
                    Tune fraud detection algorithms and edge telemetry constants
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                
                {/* Sliders Configuration Form */}
                <div style={panelCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <Sliders size={20} color="#7c3aed" />
                        <h3 style={panelHeaderStyle}>Hardware & Audit Thresholds</h3>
                    </div>

                    {/* Slider 1: Proxy Tap Window */}
                    <div style={sliderRowStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <label style={sliderLabelStyle}>RFID Proxy Tap Detection Window</label>
                            <span style={sliderValueStyle}>{proxyWindow} mins</span>
                        </div>
                        <p style={sliderDescStyle}>
                            Flags cards swiped within this time gap on adjacent gate readers as high probability of double tapping (proxy attendance).
                        </p>
                        <input 
                            type="range" 
                            min="1" 
                            max="15" 
                            value={proxyWindow} 
                            onChange={(e) => setProxyWindow(Number(e.target.value))} 
                            style={rangeInputStyle}
                        />
                    </div>

                    {/* Slider 2: Min Attendance Floor */}
                    <div style={sliderRowStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <label style={sliderLabelStyle}>Min Attendance Flag Defaulter Floor</label>
                            <span style={sliderValueStyle}>{minAttendance}%</span>
                        </div>
                        <p style={sliderDescStyle}>
                            Triggers warnings automatically inside teacher dashboards and schedules notification alerts to parents when student scores slip below this threshold.
                        </p>
                        <input 
                            type="range" 
                            min="50" 
                            max="90" 
                            value={minAttendance} 
                            onChange={(e) => setMinAttendance(Number(e.target.value))} 
                            style={rangeInputStyle}
                        />
                    </div>

                    {/* Slider 3: BLE Proximity Proximity */}
                    <div style={sliderRowStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <label style={sliderLabelStyle}>BLE Beacon Proximity Threshold</label>
                            <span style={sliderValueStyle}>{bleProximity} meters</span>
                        </div>
                        <p style={sliderDescStyle}>
                            Maximum distance allowed between a student's mobile app BLE receiver and the physical classroom gateway to confirm active session check-in.
                        </p>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="8" 
                            step="0.1"
                            value={bleProximity} 
                            onChange={(e) => setBleProximity(Number(e.target.value))} 
                            style={rangeInputStyle}
                        />
                    </div>

                    {/* Slider 4: Antenna Sweep Interval */}
                    <div style={sliderRowStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <label style={sliderLabelStyle}>Antenna Sweep Query Interval</label>
                            <span style={sliderValueStyle}>{antennaInterval} secs</span>
                        </div>
                        <p style={sliderDescStyle}>
                            Wait window duration between hardware RFID microgrid diagnostic pings before flagging network warning status.
                        </p>
                        <input 
                            type="range" 
                            min="5" 
                            max="60" 
                            value={antennaInterval} 
                            onChange={(e) => setAntennaInterval(Number(e.target.value))} 
                            style={rangeInputStyle}
                        />
                    </div>
                </div>

                {/* Engines Toggle & Deploy Controller */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Active Engines */}
                    <div style={panelCardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                            <Shield size={18} color="#10b981" />
                            <h3 style={panelHeaderStyle}>Active Security Engines</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            
                            {/* Toggle 1 */}
                            <div style={toggleRowStyle}>
                                <div>
                                    <h4 style={toggleTitleStyle}>RFID Anti-Fraud Engine</h4>
                                    <p style={toggleDescStyle}>Uses correlation rules to block multiple access logs targeting single user identity.</p>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={isProxyEngineActive} 
                                    onChange={(e) => setIsProxyEngineActive(e.target.checked)}
                                    style={checkboxStyle}
                                />
                            </div>

                            {/* Toggle 2 */}
                            <div style={toggleRowStyle}>
                                <div>
                                    <h4 style={toggleTitleStyle}>AI Academic Failure Predictor</h4>
                                    <p style={toggleDescStyle}>Runs background regression modeling over student performance charts to flag drop-out likelihood.</p>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={isAiDropoutActive} 
                                    onChange={(e) => setIsAiDropoutActive(e.target.checked)}
                                    style={checkboxStyle}
                                />
                            </div>

                            {/* Toggle 3 */}
                            <div style={toggleRowStyle}>
                                <div>
                                    <h4 style={toggleTitleStyle}>Micro-location Checkin Triggers</h4>
                                    <p style={toggleDescStyle}>Enables raw coordinates check-ins using secondary GPS arrays in high congestion labs.</p>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={isBleTriggersActive} 
                                    onChange={(e) => setIsBleTriggersActive(e.target.checked)}
                                    style={checkboxStyle}
                                />
                            </div>

                        </div>
                    </div>

                    {/* Deploy controller */}
                    <div style={panelCardStyle}>
                        <h3 style={panelHeaderStyle}>Deploy Edge Configuration</h3>
                        <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                            Compile values and dispatch them directly to localized institutional BLE/RFID microprocessor units across VVCE.
                        </p>

                        {isSaving && (
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                    <span style={{ color: '#888' }}>Compiling & Syncing Edge Memory Maps...</span>
                                    <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>{saveProgress}%</span>
                                </div>
                                <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${saveProgress}%`, background: '#7c3aed', transition: 'width 0.2s' }} />
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={applyRulesToEdge}
                            disabled={isSaving}
                            style={{
                                width: '100%',
                                background: isSaving ? 'rgba(31, 41, 55, 0.4)' : 'rgba(124, 58, 237, 0.15)',
                                border: isSaving ? '1px solid #374151' : '1px solid #7c3aed',
                                color: isSaving ? '#4b5563' : '#7c3aed',
                                padding: '10px',
                                borderRadius: '6px',
                                fontWeight: '800',
                                cursor: isSaving ? 'default' : 'pointer',
                                textTransform: 'uppercase',
                                fontSize: '0.8rem',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : 'Apply to Edge Nodes'}
                        </button>

                        {syncLog.length > 0 && (
                            <div style={{ 
                                marginTop: '1rem', 
                                borderTop: '1px solid var(--border-color)', 
                                paddingTop: '10px' 
                            }}>
                                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                                    Configuration Sync Log
                                </span>
                                <div style={{ 
                                    background: 'var(--bg-secondary)', 
                                    padding: '8px', 
                                    borderRadius: '6px', 
                                    fontFamily: 'monospace', 
                                    fontSize: '0.65rem', 
                                    color: 'var(--accent-secondary)',
                                    maxHeight: '110px',
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                }}>
                                    {syncLog.map((log, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '6px' }}>
                                            <span style={{ color: '#4b5563' }}>&gt;</span>
                                            <span>{log}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>

            </div>

        </div>
    );
}

// Styles
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

const sliderRowStyle = {
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1.25rem'
};

const sliderLabelStyle = {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)'
};

const sliderValueStyle = {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: '#7c3aed'
};

const sliderDescStyle = {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
    marginBottom: '8px',
    marginTop: '2px'
};

const rangeInputStyle = {
    width: '100%',
    accentColor: 'var(--accent-secondary)',
    background: 'var(--border-color)',
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    cursor: 'pointer'
};

const toggleRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    padding: '10px',
    borderRadius: '8px'
};

const toggleTitleStyle = {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-primary)'
};

const toggleDescStyle = {
    fontSize: '0.68rem',
    color: 'var(--text-secondary)',
    marginTop: '2px',
    lineHeight: 1.3
};

const checkboxStyle = {
    width: '18px',
    height: '18px',
    accentColor: '#10b981',
    cursor: 'pointer'
};
