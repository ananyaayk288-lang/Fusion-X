"use client";
import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Plus, Trash2, Printer, Download, Shuffle, ChevronDown } from 'lucide-react';

const SUBJECTS = [
    'Applied Mathematics - I', 'Applied Mathematics - II', 'Applied Physics', 'Applied Chemistry',
    'Elements of Electronics Engineering', 'Introduction to C Programming', 'Data Structures',
    'Computer Networks', 'Digital Electronics', 'Signals & Systems', 'Microcontrollers',
    'VLSI Design', 'Embedded Systems', 'Control Systems', 'Communication Systems',
    'Power Electronics', 'Machine Learning', 'Artificial Intelligence',
];
const UNITS = ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];
const DIFFICULTY = ['Easy', 'Medium', 'Hard'];
const BLOOMS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
const QUESTION_TYPES = ['Short Answer (2 marks)', 'Descriptive (5 marks)', 'Long Answer (10 marks)', 'MCQ (1 mark)', 'Numerical (5 marks)'];
const EXAM_TYPES = ['Internal Assessment 1', 'Internal Assessment 2', 'Internal Assessment 3', 'Semester End Exam', 'Assignment', 'Quiz'];

const QuestionPaperGenerator = () => {
    const { user } = useAuth();
    const printRef = useRef();
    const [collegeName, setCollegeName] = useState('Vidyavardhaka College of Engineering');
    const [subject, setSubject] = useState(SUBJECTS[0]);
    const [examType, setExamType] = useState(EXAM_TYPES[0]);
    const [semester, setSemester] = useState('2');
    const [duration, setDuration] = useState('1.5 Hours');
    const [maxMarks, setMaxMarks] = useState('30');
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [questions, setQuestions] = useState([]);
    const [showPreview, setShowPreview] = useState(false);

    // New question form
    const [qText, setQText] = useState('');
    const [qUnit, setQUnit] = useState(UNITS[0]);
    const [qDifficulty, setQDifficulty] = useState(DIFFICULTY[1]);
    const [qBlooms, setQBlooms] = useState(BLOOMS[2]);
    const [qType, setQType] = useState(QUESTION_TYPES[1]);
    const [qMarks, setQMarks] = useState(5);

    const addQuestion = () => {
        if (!qText.trim()) return;
        setQuestions(prev => [...prev, {
            id: Date.now(), text: qText, unit: qUnit, difficulty: qDifficulty,
            blooms: qBlooms, type: qType, marks: qMarks,
        }]);
        setQText('');
    };

    const removeQuestion = (id) => setQuestions(prev => prev.filter(q => q.id !== id));

    const shuffleQuestions = () => {
        setQuestions(prev => {
            const arr = [...prev];
            for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
            return arr;
        });
    };

    const totalMarks = questions.reduce((s, q) => s + Number(q.marks), 0);

    const handlePrint = () => {
        setShowPreview(true);
        setTimeout(() => window.print(), 400);
    };

    const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
    if (!isTeacher) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>
                <FileText size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <h2>Teacher Access Only</h2>
                <p>This tool is available exclusively for teachers and administrators.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
            <div className="yellow-title-box" style={{ marginBottom: '2rem' }}><h1>QUESTION PAPER GENERATOR</h1></div>

            {/* Paper Metadata */}
            <div style={cardBase}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#fbbf24' }}>Paper Configuration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div><label style={lbl}>College / Institution</label><input value={collegeName} onChange={e => setCollegeName(e.target.value)} style={inp} /></div>
                    <div><label style={lbl}>Subject</label><select value={subject} onChange={e => setSubject(e.target.value)} style={inp}>{SUBJECTS.map(s => <option key={s}>{s}</option>)}</select></div>
                    <div><label style={lbl}>Exam Type</label><select value={examType} onChange={e => setExamType(e.target.value)} style={inp}>{EXAM_TYPES.map(e => <option key={e}>{e}</option>)}</select></div>
                    <div><label style={lbl}>Semester</label><input value={semester} onChange={e => setSemester(e.target.value)} style={inp} /></div>
                    <div><label style={lbl}>Duration</label><input value={duration} onChange={e => setDuration(e.target.value)} style={inp} /></div>
                    <div><label style={lbl}>Max Marks</label><input value={maxMarks} onChange={e => setMaxMarks(e.target.value)} style={inp} /></div>
                    <div><label style={lbl}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} /></div>
                </div>
            </div>

            {/* Add Question Form */}
            <div style={{ ...cardBase, marginTop: '1rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#a78bfa' }}>Add Question</h3>
                <textarea value={qText} onChange={e => setQText(e.target.value)} rows={2} placeholder="Type the question text here..." style={{ ...inp, resize: 'vertical', marginBottom: '0.75rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                    <div><label style={lbl}>Unit</label><select value={qUnit} onChange={e => setQUnit(e.target.value)} style={inp}>{UNITS.map(u => <option key={u}>{u}</option>)}</select></div>
                    <div><label style={lbl}>Difficulty</label><select value={qDifficulty} onChange={e => setQDifficulty(e.target.value)} style={inp}>{DIFFICULTY.map(d => <option key={d}>{d}</option>)}</select></div>
                    <div><label style={lbl}>Bloom's Level</label><select value={qBlooms} onChange={e => setQBlooms(e.target.value)} style={inp}>{BLOOMS.map(b => <option key={b}>{b}</option>)}</select></div>
                    <div><label style={lbl}>Type</label><select value={qType} onChange={e => setQType(e.target.value)} style={inp}>{QUESTION_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                    <div><label style={lbl}>Marks</label><input type="number" min={1} max={20} value={qMarks} onChange={e => setQMarks(parseInt(e.target.value) || 1)} style={inp} /></div>
                </div>
                <button onClick={addQuestion} style={{ ...btn, marginTop: '1rem' }}><Plus size={16} /> Add Question</button>
            </div>

            {/* Question List */}
            {questions.length > 0 && (
                <div style={{ ...cardBase, marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Questions ({questions.length}) — Total: {totalMarks} marks</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={shuffleQuestions} style={{ ...btn, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}><Shuffle size={14} /> Shuffle</button>
                            <button onClick={handlePrint} style={btn}><Printer size={14} /> Print / PDF</button>
                        </div>
                    </div>
                    {questions.map((q, i) => (
                        <div key={q.id} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-color)', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                            <span style={{ fontWeight: 900, color: '#fbbf24', minWidth: 28 }}>Q{i + 1}.</span>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>{q.text}</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                    <span style={tag}>{q.unit}</span>
                                    <span style={{ ...tag, background: q.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.15)' : q.difficulty === 'Hard' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: q.difficulty === 'Easy' ? 'var(--success)' : q.difficulty === 'Hard' ? 'var(--error)' : 'var(--accent-action)' }}>{q.difficulty}</span>
                                    <span style={{ ...tag, background: 'rgba(124, 58, 237, 0.15)', color: 'var(--accent-secondary)' }}>{q.blooms}</span>
                                    <span style={tag}>{q.marks} marks</span>
                                </div>
                            </div>
                            <button onClick={() => removeQuestion(q.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            )}

            {/* Print Preview (hidden until print) */}
            <div ref={printRef} className="print-paper-preview" style={{ display: 'none' }}>
                <style>{`@media print { .print-paper-preview { display: block !important; } body > *:not(.print-paper-preview) { display: none !important; } }`}</style>
                <div style={{ fontFamily: 'Times New Roman, serif', color: '#000', padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'uppercase' }}>{collegeName}</h2>
                        <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>Department of Electronics & Communication Engineering</p>
                        <h3 style={{ margin: '8px 0 4px', fontSize: '1rem' }}>{examType}</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem' }}>Subject: <strong>{subject}</strong> | Semester: <strong>{semester}</strong></p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.8rem' }}>
                            <span>Date: {date}</span><span>Duration: {duration}</span><span>Max Marks: {maxMarks}</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '1rem' }}>Note: Answer all questions. Figures to the right indicate marks.</p>
                    {questions.map((q, i) => (
                        <div key={q.id} style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, minWidth: 30 }}>{i + 1}.</span>
                            <span style={{ flex: 1 }}>{q.text}</span>
                            <span style={{ fontWeight: 700, minWidth: 40, textAlign: 'right' }}>[{q.marks}]</span>
                        </div>
                    ))}
                    <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: '#666' }}>*** End of Question Paper ***</div>
                </div>
            </div>
        </div>
    );
};

const btn = { background: '#fbbf24', color: '#000', border: 'none', padding: '8px 18px', fontWeight: 800, borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' };
const cardBase = { background: 'var(--bg-card)', border: '2px solid var(--border-color)', borderRadius: 12, padding: '1.5rem', color: 'var(--text-primary)' };
const lbl = { display: 'block', marginBottom: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' };
const inp = { width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.6rem 0.7rem', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' };
const tag = { padding: '2px 8px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700, background: 'var(--bg-secondary)', color: 'var(--text-secondary)' };

export default QuestionPaperGenerator;
