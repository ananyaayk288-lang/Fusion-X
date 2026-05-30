'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Cpu, Zap, Lock, Globe, ArrowRight, GraduationCap, BarChart2 } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('bp@vvce');
    const [password, setPassword] = useState('bp');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginRole, setLoginRole] = useState('STUDENT'); // Roles: STUDENT, FACULTY, ADVISOR

    const { login } = useAuth();
    const router = useRouter();

    const handleRoleSelect = (selectedRole) => {
        setLoginRole(selectedRole);
        setError('');
        if (selectedRole === 'STUDENT') {
            setEmail('bp@vvce');
            setPassword('bp');
        } else if (selectedRole === 'PARENT') {
            setEmail('abhi@vvce');
            setPassword('abhi');
        } else if (selectedRole === 'FACULTY') {
            setEmail('bhav@vvce');
            setPassword('bhav');
        } else if (selectedRole === 'ADVISOR') {
            setEmail('bhav@vvce');
            setPassword('bhav');
        } else if (selectedRole === 'ADMIN') {
            setEmail('admin@vvce');
            setPassword('admin');
        } else if (selectedRole === 'CANTEEN') {
            setEmail('canteen@vvce');
            setPassword('canteen');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            if (result.user?.role === 'parent') {
                router.push('/dashboard/parent-dashboard');
            } else {
                router.push('/dashboard');
            }
        } else {
            setError(result.error || 'Invalid credentials');
        }
        setLoading(false);
    };

    return (
        <div className="login-wrapper">
            <div className="login-dual-panel">
                {/* Left Sidebar - System Info */}
                <div className="login-sidebar">
                    <div className="sidebar-logo">
                        <GraduationCap size={40} color="var(--accent-primary)" />
                        <span className="logo-text">CONNECT & PREP</span>
                    </div>

                    <div className="sidebar-content">
                        <h2 className="system-title">Engineering Portal</h2>
                        <p className="system-sub">Access verified resources, collaborate with peers, and track your progress.</p>
                    </div>

                    <div className="sidebar-footer">
                        <div className="version-info">
                            <span> </span>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form Area */}
                <div className="login-main">
                    <div className="form-container">
                        <div className="sync-header">
                            <span className="platform-label">Institutional Log In</span>
                            <h1> Sign In</h1>
                            <p> </p>
                        </div>

                        {/* Premium Interactive Portal Selector */}
                        <div className="role-selector" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '2.5rem' }}>
                            <button 
                                type="button"
                                className={`role-pill ${loginRole === 'STUDENT' ? 'active' : ''}`}
                                onClick={() => handleRoleSelect('STUDENT')}
                                style={{ fontSize: '0.62rem', letterSpacing: '0px', whiteSpace: 'nowrap', padding: '8px 2px' }}
                            >
                                Student
                            </button>
                            <button 
                                type="button"
                                className={`role-pill ${loginRole === 'PARENT' ? 'active' : ''}`}
                                onClick={() => handleRoleSelect('PARENT')}
                                style={{ fontSize: '0.62rem', letterSpacing: '0px', whiteSpace: 'nowrap', padding: '8px 2px' }}
                            >
                                Parent
                            </button>
                            <button 
                                type="button"
                                className={`role-pill ${loginRole === 'FACULTY' ? 'active' : ''}`}
                                onClick={() => handleRoleSelect('FACULTY')}
                                style={{ fontSize: '0.62rem', letterSpacing: '0px', whiteSpace: 'nowrap', padding: '8px 2px' }}
                            >
                                Faculty
                            </button>
                            <button 
                                type="button"
                                className={`role-pill ${loginRole === 'ADVISOR' ? 'active' : ''}`}
                                onClick={() => handleRoleSelect('ADVISOR')}
                                style={{ fontSize: '0.62rem', letterSpacing: '0px', whiteSpace: 'nowrap', padding: '8px 2px' }}
                            >
                                Advisor
                            </button>
                            <button 
                                type="button"
                                className={`role-pill ${loginRole === 'ADMIN' ? 'active' : ''}`}
                                onClick={() => handleRoleSelect('ADMIN')}
                                style={{ fontSize: '0.62rem', letterSpacing: '0px', whiteSpace: 'nowrap', padding: '8px 2px' }}
                            >
                                Admin
                            </button>
                            <button 
                                type="button"
                                className={`role-pill ${loginRole === 'CANTEEN' ? 'active' : ''}`}
                                onClick={() => handleRoleSelect('CANTEEN')}
                                style={{ fontSize: '0.62rem', letterSpacing: '0px', whiteSpace: 'nowrap', padding: '8px 2px' }}
                            >
                                Canteen
                            </button>
                        </div>

                        <form onSubmit={handleLogin} className="sync-form">
                            <div className="input-group">
                                <label>Institutional Email</label>
                                <div className="input-field-wrap">
                                    <Globe size={18} className="field-icon" />
                                    <input
                                        type="text"
                                        placeholder="authorized@institution.edu"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Security Key</label>
                                <div className="input-field-wrap">
                                    <Lock size={18} className="field-icon" />
                                    <input
                                        type="password"
                                        placeholder="Your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {error && <div className="sync-error-msg">{error}</div>}

                            <button type="submit" className="establish-link-btn" disabled={loading}>
                                {loading ? 'Logging in...' : (
                                    <>
                                        Sign In <ArrowRight size={20} />
                                    </>
                                )}
                            </button>

                            <div className="form-alt-footer">
                                <span>Don't have an account?</span>
                                <Link href="/register" className="register-link">Register Now</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
