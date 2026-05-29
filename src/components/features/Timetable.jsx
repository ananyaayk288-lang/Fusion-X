"use client";
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Calendar, Clock } from 'lucide-react';
import './FeatureStyles.css';

// Subject → color mapping (matching branch-wise colors)
const subjectColors = {
    'CSE': '#2563eb',  // Blue
    'ECE': '#16a34a',  // Green
    'AIML': '#7c3aed', // Purple
    'EEE': '#ea580c',  // Orange
    'ME': '#dc2626',   // Red
    'CV': '#0d9488',   // Teal
};

// BREAK and LUNCH letters
const breakLetters = ['B', 'R', 'E', 'A', 'K'];
const lunchLetters = ['L', 'U', 'N', 'C', 'H'];

const Timetable = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('SCHOOL');
    const isTeacher = user?.role === 'teacher';
    const timetable = isTeacher ? mockBackend.teacherTimetable : mockBackend.timetable;
    const { personalNotes } = mockBackend;
    const [todos, setTodos] = useState(mockBackend.todos);
    const [currentTime, setCurrentTime] = useState(new Date());

    const toggleTodo = (id) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Get current day
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[new Date().getDay()];

    // Build lookup for each day: period → slot
    const dayLookup = {};
    timetable.schedule.forEach(dayObj => {
        const map = {};
        dayObj.slots.forEach(slot => {
            map[slot.period] = slot;
        });
        dayLookup[dayObj.day] = map;
    });

    // Determine which periods are "consumed" by a spanning slot
    const getConsumedPeriods = (dayObj) => {
        const consumed = new Set();
        dayObj.slots.forEach(slot => {
            for (let p = slot.period + 1; p < slot.period + slot.span; p++) {
                consumed.add(p);
            }
        });
        return consumed;
    };

    return (
        <div className="timetable-container animate-enter" style={{ padding: '2rem 1rem', maxWidth: '100%', height: 'auto', overflow: 'visible' }}>
            {/* Tab Launcher Bar */}
            <div className="tt-tab-bar" style={{
                display: 'flex',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                marginBottom: '2rem',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                {['SCHOOL', 'PERSONAL', 'TODO'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            padding: '12px 0',
                            border: 'none',
                            background: activeTab === tab ? '#ff9800' : 'transparent',
                            color: activeTab === tab ? '#000' : 'var(--text-secondary)',
                            fontWeight: '800',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            letterSpacing: '1px',
                            transition: 'all 0.2s',
                            borderRight: tab !== 'TODO' ? '1px solid var(--border-color)' : 'none',
                            textTransform: 'uppercase'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <div className="current-time" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--bg-card)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                }}>
                    <Clock size={16} color="var(--accent-primary)" />
                    <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                </div>
            </div>

            {activeTab === 'SCHOOL' && (
                <>
                    <h3 style={{ marginBottom: '1.25rem', color: '#ff9800', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {isTeacher ? `Dr. Bhavana's Work Schedule` : 'Second Semester Student Timetable'}
                    </h3>
                    {/* Excel-like Table */}
                    <div className="tt-table-wrapper">
                        <table className="tt-excel-table">
                            <thead>
                                <tr>
                                    {/* Corner */}
                                    <th className="tt-corner-header">DAY</th>
                                    {/* Period 1, 2 */}
                                    <th className="tt-period-header">1</th>
                                    <th className="tt-period-header">2</th>
                                    {/* Break */}
                                    <th className="tt-separator-header"></th>
                                    {/* Period 3, 4 */}
                                    <th className="tt-period-header">3</th>
                                    <th className="tt-period-header">4</th>
                                    {/* Lunch */}
                                    <th className="tt-separator-header"></th>
                                    {/* Period 5, 6 */}
                                    <th className="tt-period-header">5</th>
                                    <th className="tt-period-header">6</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timetable.schedule.map((dayObj, rowIdx) => {
                                    const isToday = dayObj.day === todayName;
                                    const consumed = getConsumedPeriods(dayObj);
                                    const lookup = dayLookup[dayObj.day];

                                    const renderPeriodCells = (periodList) => {
                                        const cells = [];
                                        for (const p of periodList) {
                                            if (consumed.has(p)) continue; // skip, already merged
                                            const slot = lookup[p];
                                            if (!slot) {
                                                cells.push(
                                                    <td key={p} className="tt-cell tt-empty">
                                                        <span className="tt-empty-dash">—</span>
                                                    </td>
                                                );
                                            } else {
                                                let bgColor = '#666';
                                                const subName = slot.subject.toUpperCase();
                                                const matchedKey = Object.keys(subjectColors).find(key => subName.includes(key));
                                                if (matchedKey) {
                                                    bgColor = subjectColors[matchedKey];
                                                } else {
                                                    bgColor = subjectColors[slot.subject] || '#666';
                                                }

                                                const textColor = '#fff';
                                                cells.push(
                                                    <td
                                                        key={p}
                                                        className="tt-cell tt-filled"
                                                        colSpan={slot.span}
                                                    >
                                                        <div
                                                            className="tt-subject-cell"
                                                            style={{
                                                                background: bgColor,
                                                                color: textColor,
                                                            }}
                                                        >
                                                            <span className="tt-subject-name">{slot.subject}</span>
                                                        </div>
                                                    </td>
                                                );
                                            }
                                        }
                                        return cells;
                                    };

                                    return (
                                        <tr key={dayObj.day} className={`tt-row ${isToday ? 'tt-today-row' : ''}`} style={{ animationDelay: `${rowIdx * 80}ms` }}>
                                            {/* Day label */}
                                            <td className={`tt-day-cell ${isToday ? 'tt-today' : ''}`}>
                                                <span className="tt-day-label">{dayObj.day.toUpperCase()}</span>
                                                {isToday && <span className="tt-today-badge">TODAY</span>}
                                            </td>

                                            {/* Periods 1-2 */}
                                            {renderPeriodCells([1, 2])}

                                            {/* BREAK separator */}
                                            <td className="tt-separator-cell tt-break">
                                                <span>{breakLetters[rowIdx] || ''}</span>
                                            </td>

                                            {/* Periods 3-4 */}
                                            {renderPeriodCells([3, 4])}

                                            {/* LUNCH separator */}
                                            <td className="tt-separator-cell tt-lunch">
                                                <span>{lunchLetters[rowIdx] || ''}</span>
                                            </td>

                                            {/* Periods 5-6 */}
                                            {renderPeriodCells([5, 6])}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <style>{`
                        .timetable-container {
                            width: 100%;
                            padding: 0.5rem 0 !important;
                            max-width: none !important;
                            height: auto !important;
                            overflow: visible !important;
                            display: block !important;
                        }
                        .tt-table-wrapper {
                            margin: 0;
                            width: 100%;
                            background: var(--bg-app-background);
                            border: 2px solid var(--border-color);
                            box-shadow: 10px 10px 0px var(--shadow-hard);
                        }
                        .tt-excel-table {
                            width: 100%;
                            border-collapse: collapse;
                            table-layout: fixed;
                        }
                        .tt-corner-header, .tt-period-header, .tt-day-cell {
                            background: var(--bg-card) !important;
                            color: var(--text-primary) !important;
                            border: 1px solid var(--border-color) !important;
                        .tt-corner-header, .tt-period-header {
                            background: #111 !important;
                            color: #fff !important;
                            border: 1px solid #333 !important;
                            padding: 6px 2px !important;
                            font-size: 0.75rem;
                        }
                        .tt-day-cell {
                            background: #111 !important;
                            color: #fff !important;
                            border: 1px solid #333 !important;
                            padding: 6px 2px !important;
                            font-size: 0.85rem;
                            vertical-align: middle !important;
                            text-align: center !important;
                            height: 50px;
                        }
                        .tt-period-header {
                            background: #fbbf24 !important;
                            color: #000 !important;
                            font-weight: 900 !important;
                            font-size: 0.9rem;
                        }
                        .tt-cell {
                            height: 48px; /* Ultra-compact for single page */
                            border: 1px solid var(--border-color) !important;
                            height: 50px; /* Vertically small cells */
                            border: 1px solid #333 !important;
                        }
                        .tt-subject-cell {
                            height: 100%;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            text-align: center;
                            padding: 4px;
                            font-weight: 800;
                        }
                        .tt-subject-name {
                            font-size: 1.1rem; /* Compact font size for small cell */
                            letter-spacing: 0.5px;
                            line-height: 1.2;
                        }
                        .tt-empty {
                            vertical-align: middle !important;
                            text-align: center !important;
                        }
                        .tt-empty-dash {
                            font-size: 1.1rem;
                            color: #444;
                        }
                        .tt-separator-cell {
                            background: var(--bg-secondary) !important;
                            color: #fbbf24 !important;
                            font-weight: 900 !important;
                            width: 20px;
                            border: 1px solid var(--border-color) !important;
                            font-size: 0.65rem;
                            border: 1px solid #333 !important;
                            font-size: 0.85rem;
                            vertical-align: middle !important;
                            text-align: center !important;
                        }
                        .tt-legend {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 4px 12px;
                            margin-top: 1rem;
                            padding: 0.5rem;
                            background: var(--bg-card);
                            border: 1px solid var(--border-color);
                        }
                        .tt-legend-item {
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            font-size: 0.6rem;
                            font-weight: 700;
                            color: var(--text-secondary);
                            text-transform: uppercase;
                        }
                        .tt-legend-dot {
                            width: 8px;
                            height: 8px;
                            border-radius: 1px;
                        }
                        .exams-section {
                            margin-top: 1.5rem !important;
                        }
                        .exams-grid {
                            gap: 1rem !important;
                        }
                        .exam-card {
                            padding: 10px !important;
                        }
                    `}</style>

                    {/* Upcoming Exams */}
                    <div className="exams-section" style={{ marginTop: '3rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle size={24} color="var(--error)" /> Upcoming Exams
                        </h2>
                        <div className="exams-grid">
                            {timetable.exams.map((exam, i) => (
                                <div key={i} className="exam-card">
                                    <Calendar size={20} />
                                    <div>
                                        <h4>{exam.subject}</h4>
                                        <p>{exam.type} — {exam.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'PERSONAL' && (
                <div className="personal-notes-grid animate-enter" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {personalNotes.map(note => (
                        <div key={note.id} className="note-card card" style={{ borderLeft: `8px solid ${note.color}` }}>
                            <h4 style={{ marginBottom: '10px' }}>{note.title}</h4>
                            <p style={{ fontSize: '0.9rem', color: '#ccc', whiteSpace: 'pre-line' }}>{note.content}</p>
                            <small style={{ marginTop: '15px', display: 'block', color: '#666' }}>Updated {note.updatedAt}</small>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'TODO' && (
                <div className="todo-list-container animate-enter" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    {todos.map(todo => (
                        <div key={todo.id} className="todo-item card" 
                            onClick={() => toggleTodo(todo.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '1rem',
                                opacity: todo.done ? 0.6 : 1,
                                textDecoration: todo.done ? 'line-through' : 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                width: '24px',
                                height: '24px',
                                border: '2px solid var(--border-color)',
                                borderRadius: '4px',
                                background: todo.done ? 'var(--accent-primary)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {todo.done && <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>✓</span>}
                            </div>
                            <span style={{ fontSize: '1.1rem', flex: 1 }}>{todo.text}</span>
                            <span className={`priority-tag ${todo.priority}`} style={{
                                fontSize: '0.7rem',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: todo.priority === 'high' ? 'var(--error)' : '#555',
                                color: todo.priority === 'high' ? '#000' : '#fff'
                            }}>{todo.priority.toUpperCase()}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Timetable;
