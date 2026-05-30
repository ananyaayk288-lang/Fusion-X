"use client";
import React, { useState, useEffect } from 'react';
import { 
    Wallet, TrendingUp, History, UserCheck, 
    CheckCircle, Zap, Calendar, Activity, ArrowUpRight
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { createClient } from '../../utils/supabase/client';
import './FeatureStyles.css';

const CanteenDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [metrics, setMetrics] = useState({ today: 0, week: 0, count: 0, average: 0 });
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    const fetchAnalytics = async () => {
        setLoading(true);
        // Fetch up to 100 recent canteen transactions to build analytics
        const { data } = await supabase
            .from('wallet_transactions')
            .select('id, amount, description, created_at, student_id')
            .ilike('description', '%Canteen%')
            .order('created_at', { ascending: false })
            .limit(100);
        
        if (data) {
            setTransactions(data);
            
            // Process data for metrics
            const todayStr = new Date().toISOString().split('T')[0];
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            let todayTotal = 0;
            let weekTotal = 0;
            let txCount = 0;

            // Group by day for chart
            const daysMap = {};
            // Initialize last 7 days
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
                daysMap[dateStr] = 0;
            }

            data.forEach(tx => {
                const txDate = new Date(tx.created_at);
                const amt = Number(tx.amount);
                
                if (tx.created_at.startsWith(todayStr)) {
                    todayTotal += amt;
                }
                if (txDate >= sevenDaysAgo) {
                    weekTotal += amt;
                    txCount++;
                    const dayKey = txDate.toLocaleDateString('en-US', { weekday: 'short' });
                    if (daysMap[dayKey] !== undefined) {
                        daysMap[dayKey] += amt;
                    }
                }
            });

            const formattedChartData = Object.keys(daysMap).map(key => ({
                day: key,
                revenue: daysMap[key]
            }));

            setChartData(formattedChartData);
            setMetrics({
                today: todayTotal,
                week: weekTotal,
                count: txCount,
                average: txCount > 0 ? (weekTotal / txCount) : 0
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAnalytics();

        const txSub = supabase.channel('canteen_dash_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wallet_transactions' }, (payload) => {
                if (payload.new.description && payload.new.description.includes('Canteen')) {
                    fetchAnalytics();
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(txSub);
        };
    }, []);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'white' }}>Loading Analytics...</div>;
    }

    return (
        <div className="feature-container animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="feature-header">
                <div className="header-text">
                    <h1>Canteen Analytics 📊</h1>
                    <p>Live revenue tracking and transaction history.</p>
                </div>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: '600' }}>Today's Revenue</span>
                        <Zap size={20} color="#10b981" />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>₹{metrics.today.toFixed(2)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.9rem' }}>
                        <ArrowUpRight size={16} /> Live Sync Active
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: '600' }}>7-Day Revenue</span>
                        <Calendar size={20} color="#8b5cf6" />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>₹{metrics.week.toFixed(2)}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Over {metrics.count} transactions
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: '600' }}>Avg Order Value</span>
                        <Activity size={20} color="#f59e0b" />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>₹{metrics.average.toFixed(2)}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Based on 7-day data
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}>
                    <h3 style={{ margin: '0 0 24px 0', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={20} color="#10b981" /> Revenue Trend (Last 7 Days)
                    </h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <History size={20} color="#60a5fa" /> Payment Ledger
                    </h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-card-alt)' }}>
                                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Transaction ID</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Date & Time</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Student UUID</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Status</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No recent transactions found.</td>
                                </tr>
                            ) : transactions.map(tx => (
                                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '16px 24px', fontFamily: 'monospace', color: '#94a3b8' }}>{tx.id.substring(0, 8)}...</td>
                                    <td style={{ padding: '16px 24px', color: 'var(--text-primary)' }}>{new Date(tx.created_at).toLocaleString()}</td>
                                    <td style={{ padding: '16px 24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <UserCheck size={14} color="#8b5cf6" />
                                        <span style={{ fontFamily: 'monospace' }}>{tx.student_id.substring(0, 12)}...</span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                            <CheckCircle size={12} /> Success
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>
                                        +₹{Number(tx.amount).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CanteenDashboard;
