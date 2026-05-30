"use client";
import React, { useState, useEffect } from 'react';
import {
    MapPin, Users, Search, RefreshCw, Radio,
    GraduationCap, UserCheck, Shield, Clock
} from 'lucide-react';
import { createClient } from '../../utils/supabase/client';
import './FeatureStyles.css';

const ROLE_CONFIG = {
    student: { color: '#3b82f6', icon: GraduationCap, label: 'Student' },
    teacher: { color: '#f59e0b', icon: UserCheck, label: 'Teacher' },
    admin: { color: '#ef4444', icon: Shield, label: 'Admin' },
};

// Campus building coordinates (simulated positions for demo)
const CAMPUS_ZONES = [
    { id: 'canteen-a', name: 'Canteen A', x: 20, y: 30 },
    { id: 'canteen-b', name: 'Canteen B', x: 65, y: 70 },
    { id: 'library', name: 'Library', x: 45, y: 20 },
    { id: 'lab-1', name: 'Lab 1', x: 15, y: 65 },
    { id: 'lab-2', name: 'Lab 2', x: 30, y: 65 },
    { id: 'lab-3', name: 'Lab 3', x: 45, y: 65 },
    { id: 'classroom-a', name: 'Classroom Block A', x: 70, y: 25 },
    { id: 'classroom-b', name: 'Classroom Block B', x: 85, y: 25 },
    { id: 'admin-block', name: 'Admin Block', x: 50, y: 45 },
    { id: 'sports', name: 'Sports Ground', x: 80, y: 60 },
    { id: 'main-gate', name: 'Main Gate', x: 50, y: 90 },
    { id: 'parking', name: 'Parking', x: 85, y: 85 },
];

function getZonePosition(locationName) {
    const zone = CAMPUS_ZONES.find(z =>
        locationName?.toLowerCase().includes(z.name.toLowerCase()) ||
        z.name.toLowerCase().includes(locationName?.toLowerCase() || '')
    );
    // Add slight random offset so markers don't overlap
    const jitterX = (Math.random() - 0.5) * 6;
    const jitterY = (Math.random() - 0.5) * 6;
    return zone
        ? { x: zone.x + jitterX, y: zone.y + jitterY }
        : { x: 50 + jitterX, y: 50 + jitterY };
}

const CampusTracker = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [hoveredMarker, setHoveredMarker] = useState(null);

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/rfid/location');
            if (res.ok) {
                const data = await res.json();
                setLocations(data.locations || []);
            }
        } catch (err) {
            console.error('Failed to fetch locations:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLocations();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchLocations, 30000);

        // Real-time subscription
        const supabase = createClient();
        const channel = supabase
            .channel('location_realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'rfid_scans',
            }, () => {
                fetchLocations();
            })
            .subscribe();

        return () => {
            clearInterval(interval);
            supabase.removeChannel(channel);
        };
    }, []);

    const filtered = locations.filter(loc => {
        const matchesSearch = loc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loc.location?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' || loc.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const roleCounts = {
        all: locations.length,
        student: locations.filter(l => l.role === 'student').length,
        teacher: locations.filter(l => l.role === 'teacher').length,
    };

    return (
        <div className="feature-container" style={{ padding: '2rem' }}>
            {/* Header Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={20} color="#6366f1" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Tracked</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace" }}>{roleCounts.all}</p>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GraduationCap size={20} color="#3b82f6" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Students</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace" }}>{roleCounts.student}</p>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserCheck size={20} color="#f59e0b" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Teachers</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace" }}>{roleCounts.teacher}</p>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 250px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search by name or location..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ width: '100%', paddingLeft: '36px' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'student', 'teacher'].map(role => (
                        <button
                            key={role}
                            onClick={() => setFilterRole(role)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-md)',
                                border: '2px solid',
                                borderColor: filterRole === role ? 'var(--accent-primary)' : 'var(--border-color)',
                                background: filterRole === role ? 'rgba(99,102,241,0.1)' : 'transparent',
                                color: filterRole === role ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                textTransform: 'capitalize',
                                cursor: 'pointer',
                            }}
                        >
                            {role} ({roleCounts[role] ?? 0})
                        </button>
                    ))}
                </div>
                <button
                    onClick={fetchLocations}
                    className="view-btn"
                    style={{ width: 'auto', padding: '8px 16px', gap: '6px' }}
                    disabled={loading}
                >
                    <RefreshCw size={14} className={loading ? 'spin-icon' : ''} /> Refresh
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
                {/* Campus Map */}
                <div className="card" style={{ padding: '1rem', position: 'relative', minHeight: '500px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Radio size={16} color="#22c55e" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Campus View</span>
                    </div>

                    {/* SVG Campus Map */}
                    <div style={{ position: 'relative', width: '100%', paddingBottom: '70%', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                        <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                            {/* Campus zone labels */}
                            {CAMPUS_ZONES.map(zone => (
                                <g key={zone.id}>
                                    <rect
                                        x={zone.x - 8} y={zone.y - 6}
                                        width={16} height={12}
                                        rx={2}
                                        fill="rgba(255,255,255,0.04)"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="0.3"
                                    />
                                    <text
                                        x={zone.x} y={zone.y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="rgba(255,255,255,0.3)"
                                        fontSize="1.8"
                                        fontWeight="700"
                                    >
                                        {zone.name}
                                    </text>
                                </g>
                            ))}

                            {/* Person markers */}
                            {filtered.map((loc, i) => {
                                const pos = getZonePosition(loc.location);
                                const cfg = ROLE_CONFIG[loc.role] || ROLE_CONFIG.student;
                                const isHovered = hoveredMarker === loc.user_id;
                                const isSelected = selectedPerson?.user_id === loc.user_id;
                                return (
                                    <g
                                        key={loc.user_id}
                                        style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                        onMouseEnter={() => setHoveredMarker(loc.user_id)}
                                        onMouseLeave={() => setHoveredMarker(null)}
                                        onClick={() => setSelectedPerson(loc)}
                                    >
                                        {/* Ping animation ring */}
                                        <circle cx={pos.x} cy={pos.y} r={isHovered ? 3.5 : 2.5} fill="none" stroke={cfg.color} strokeWidth="0.3" opacity={0.4}>
                                            <animate attributeName="r" from="2" to="5" dur="2s" repeatCount="indefinite" />
                                            <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                                        </circle>
                                        {/* Marker dot */}
                                        <circle
                                            cx={pos.x} cy={pos.y}
                                            r={isHovered || isSelected ? 2.2 : 1.6}
                                            fill={cfg.color}
                                            stroke="#000"
                                            strokeWidth="0.4"
                                        />
                                        {/* Hover tooltip */}
                                        {isHovered && (
                                            <g>
                                                <rect x={pos.x + 3} y={pos.y - 5} width={22} height={7} rx={1} fill="rgba(0,0,0,0.85)" />
                                                <text x={pos.x + 4} y={pos.y - 2} fill="#fff" fontSize="2" fontWeight="600">
                                                    {loc.name}
                                                </text>
                                                <text x={pos.x + 4} y={pos.y + 0.5} fill="#aaa" fontSize="1.4">
                                                    {loc.location}
                                                </text>
                                            </g>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>
                    </div>

                    {/* Map Legend */}
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', justifyContent: 'center' }}>
                        {Object.entries(ROLE_CONFIG).filter(([k]) => k !== 'admin').map(([key, cfg]) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color }} />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{cfg.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* People List Sidebar */}
                <div className="card" style={{ padding: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>
                        People on Campus ({filtered.length})
                    </h3>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <RefreshCw size={20} className="spin-icon" style={{ opacity: 0.5 }} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
                            No one found. Try adjusting your filters.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {filtered.map(loc => {
                                const cfg = ROLE_CONFIG[loc.role] || ROLE_CONFIG.student;
                                const isSelected = selectedPerson?.user_id === loc.user_id;
                                return (
                                    <div
                                        key={loc.user_id}
                                        onClick={() => setSelectedPerson(isSelected ? null : loc)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-md)',
                                            background: isSelected ? 'rgba(99,102,241,0.08)' : 'var(--bg-primary)',
                                            border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            background: cfg.color + '22',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <cfg.icon size={16} color={cfg.color} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {loc.name}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <MapPin size={10} color="var(--text-secondary)" />
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{loc.location}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={10} color="var(--text-secondary)" />
                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                                {loc.last_seen ? new Date(loc.last_seen).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampusTracker;
