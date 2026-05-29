"use client";
import React, { useState } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { BookOpen, CheckCircle, Clock, TrendingUp, Calendar, AlertCircle, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './DashboardHome.css'; // We'll create this CSS file next

const DashboardHome = () => {
    const { user } = useAuth();
    const role = user?.role || 'student';

    // Mock Data - In a real app, this would come from an API
    const attendanceData = [
        { name: 'Present', value: 85, color: '#4caf50' }, // Green
        { name: 'Absent', value: 15, color: '#f44336' }  // Red
    ];

    const taskData = [
        { name: 'Completed', value: 12, color: '#ff9800' }, // Orange
        { name: 'Pending', value: 5, color: '#000000' }    // Black
    ];

    const studyHoursData = [
        { day: 'Mon', hours: 3 },
        { day: 'Tue', hours: 5 },
        { day: 'Wed', hours: 2 },
        { day: 'Thu', hours: 4 },
        { day: 'Fri', hours: 6 },
        { day: 'Sat', hours: 3 },
        { day: 'Sun', hours: 1 },
    ];

    return (
        <div className="dashboard-home-container">
            <div className="welcome-banner">
                <div>
                    <h2>Welcome back, {role === 'teacher' ? `Professor ${user?.name || 'Teacher'}` : (user?.name || 'Student')}!</h2>
                    <p>{role === 'teacher' ? 'Your centralized portal for class management and resource sharing.' : 'Your centralized hub for academic excellence.'}</p>
                </div>
                <div className="date-badge">
                    <Calendar size={16} />
                    <span>{new Date().toLocaleDateString('en-GB')}</span>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="stats-grid">
                {role === 'teacher' ? (
                    <>
                        <div className="stat-card streak-card">
                            <div className="stat-icon-wrapper">
                                <TrendingUp size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>Today's Classes</h3>
                                <div className="stat-value">3 Lectures</div>
                                <p className="stat-subtitle">Next: CSE at 9:00 AM</p>
                            </div>
                        </div>

                        <div className="stat-card pending-card">
                            <div className="stat-icon-wrapper">
                                <AlertCircle size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>Grading Queue</h3>
                                <div className="stat-value">15 Papers</div>
                                <p className="stat-subtitle">Assignment 2</p>
                            </div>
                        </div>

                        <div className="stat-card event-card">
                            <div className="stat-icon-wrapper">
                                <Clock size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>Active Doubts</h3>
                                <div className="stat-value event-name">8 Pending</div>
                                <p className="stat-subtitle">From CSE & ECE Stream</p>
                            </div>
                        </div>

                        <div className="stat-card xp-card">
                            <div className="stat-icon-wrapper">
                                <BookOpen size={24} color="var(--accent-action)" />
                            </div>
                            <div className="stat-content">
                                <h3>Shared Notes</h3>
                                <div className="stat-value">6 Documents</div>
                                <p className="stat-subtitle">Verified by HOD</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="stat-card streak-card">
                            <div className="stat-icon-wrapper">
                                <TrendingUp size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>Study Streak</h3>
                                <div className="stat-value">12 Days <span className="fire-emoji">🔥</span></div>
                                <p className="stat-subtitle">Keep it up!</p>
                            </div>
                        </div>

                        <div className="stat-card pending-card">
                            <div className="stat-icon-wrapper">
                                <AlertCircle size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>Tasks Pending</h3>
                                <div className="stat-value">5</div>
                                <p className="stat-subtitle">High Priority</p>
                            </div>
                        </div>

                        <div className="stat-card event-card">
                            <div className="stat-icon-wrapper">
                                <Clock size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>Next Event</h3>
                                <div className="stat-value event-name">Math Marathon</div>
                                <p className="stat-subtitle">Today, 2:00 PM</p>
                            </div>
                        </div>

                        <div className="stat-card xp-card">
                            <div className="stat-icon-wrapper">
                                <TrendingUp size={24} color="var(--accent-action)" />
                            </div>
                            <div className="stat-content">
                                <h3>Current XP</h3>
                                <div className="stat-value">4,500 <span className="rank-badge">#2</span></div>
                                <p className="stat-subtitle">Scholar Rank</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* AI Roadmap Teaser */}
            <div className="roadmap-teaser animate-enter">
                <div className="teaser-content">
                    <div className="icon-box">
                        <Target size={32} color="var(--accent-primary)" />
                    </div>
                    <div>
                        {role === 'teacher' ? (
                            <>
                                <h3>Active Course: Introduction to Computer Science</h3>
                                <p>Next assessment prediction generated. 82% of students are ready for the internal exam.</p>
                            </>
                        ) : (
                            <>
                                <h3>AI Study Goal: Mastering Calculus</h3>
                                <p>You have 2 topics left to revise for your upcoming 2024 Exam.</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">

                {/* Attendance Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>{role === 'teacher' ? 'Class Attendance Average' : 'Overall Attendance'}</h3>
                        <button className="chart-action-btn">{role === 'teacher' ? 'View Roll' : 'View Details'}</button>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={attendanceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {attendanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-center-text">
                            <span className="percentage">85%</span>
                            <span className="label">{role === 'teacher' ? 'Average' : 'Present'}</span>
                        </div>
                    </div>
                </div>

                {/* Task Progress Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>{role === 'teacher' ? 'Assignment Submission Rate' : 'Task Progress'}</h3>
                        <button className="chart-action-btn">{role === 'teacher' ? 'Grade All' : 'Manage'}</button>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={taskData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {taskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-center-text">
                            <span className="percentage">{role === 'teacher' ? '70%' : '12/17'}</span>
                            <span className="label">{role === 'teacher' ? 'Turned In' : 'Done'}</span>
                        </div>
                    </div>
                </div>

                {/* Study Hours Chart - Spans Full Width on smaller screens, or large on desktop */}
                <div className="chart-card wide-chart">
                    <div className="chart-header">
                        <h3>{role === 'teacher' ? 'Teaching & Consultation Hours' : 'Study Hours This Week'}</h3>
                        <div className="chart-legend-custom">
                            <span className="dot" style={{ background: '#4F46E5' }}></span> Hours
                        </div>
                    </div>
                    <div className="chart-wrapper bar-chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={studyHoursData}
                                margin={{
                                    top: 10, right: 10, left: 0, bottom: 0,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis
                                    dataKey="day"
                                    tick={{ fill: '#888' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fill: '#888' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1e1e1e', borderRadius: '8px', border: '1px solid #333' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="hours" fill="#8884d8" radius={[6, 6, 0, 0]} barSize={40}>
                                    {studyHoursData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F46E5' : '#4F46E5'} opacity={index % 2 === 0 ? 1 : 0.6} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
