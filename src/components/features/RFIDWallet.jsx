"use client";
import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    Wallet, TrendingUp, TrendingDown, CreditCard, ArrowUpRight,
    ArrowDownRight, RefreshCw, AlertTriangle, Zap, Send
} from 'lucide-react';
import { createClient } from '../../utils/supabase/client';
import './FeatureStyles.css';

const CATEGORY_COLORS = {
    Canteen: '#f59e0b',
    Stationary: '#8b5cf6',
    Library: '#06b6d4',
    Other: '#6b7280',
};

const RFIDWallet = () => {
    const [walletData, setWalletData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawUpi, setWithdrawUpi] = useState('');
    const [recharging, setRecharging] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [withdrawMessage, setWithdrawMessage] = useState({ text: '', type: '' });

    const fetchWalletData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/wallet/info');
            if (res.ok) {
                const data = await res.json();
                setWalletData(data);
            }
        } catch (err) {
            console.error('Failed to fetch wallet data:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchWalletData();
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        // Real-time subscription for transaction updates
        const supabase = createClient();
        const channel = supabase
            .channel('wallet_realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'wallet_transactions',
            }, () => {
                fetchWalletData();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleRecharge = async () => {
        const amount = parseFloat(rechargeAmount);
        if (!amount || amount <= 0) return;
        setRecharging(true);
        try {
            // 1. Create order
            const orderRes = await fetch('/api/wallet/recharge/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });
            const orderData = await orderRes.json();

            if (!orderRes.ok) throw new Error(orderData.message);

            // 2. Configure Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock',
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Smart Campus Wallet',
                description: 'Wallet Recharge',
                order_id: orderData.id,
                handler: async function (response) {
                    // 3. Verify payment
                    const verifyRes = await fetch('/api/wallet/recharge/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: amount
                        })
                    });
                    
                    if (verifyRes.ok) {
                        setRechargeAmount('');
                        fetchWalletData();
                        alert('Payment successful! Wallet recharged.');
                    } else {
                        alert('Payment verification failed.');
                    }
                },
                prefill: {
                    name: 'Student',
                    email: 'student@campus.com',
                },
                theme: { color: '#6366f1' }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert('Payment Failed: ' + response.error.description);
            });
            rzp.open();
        } catch (err) {
            console.error('Recharge flow failed:', err);
            alert('Failed to initiate payment.');
        }
        setRecharging(false);
    };

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0 || !withdrawUpi) return;
        setWithdrawing(true);
        setWithdrawMessage({ text: '', type: '' });
        
        try {
            const res = await fetch('/api/wallet/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, upiId: withdrawUpi }),
            });
            const data = await res.json();
            
            if (res.ok) {
                setWithdrawAmount('');
                setWithdrawUpi('');
                setWithdrawMessage({ text: data.message, type: 'success' });
                fetchWalletData();
            } else {
                setWithdrawMessage({ text: data.message || 'Withdrawal failed', type: 'error' });
            }
        } catch (err) {
            console.error('Withdrawal failed:', err);
            setWithdrawMessage({ text: 'Network error. Try again.', type: 'error' });
        }
        setWithdrawing(false);
    };

    const categoryData = walletData?.insights?.categories
        ? Object.entries(walletData.insights.categories).map(([name, value]) => ({
            name,
            value: Number(value),
            color: CATEGORY_COLORS[name] || '#6b7280',
        }))
        : [];

    const weekChange = walletData?.insights?.week_over_week_change ?? 0;

    if (loading) {
        return (
            <div className="feature-container" style={{ padding: '2rem' }}>
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <RefreshCw size={32} className="spin-icon" style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Loading wallet...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="feature-container" style={{ padding: '2rem' }}>
            {/* Balance Hero Card */}
            <div className="card" style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.1) 100%)',
                borderColor: 'rgba(99,102,241,0.3)',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Wallet size={20} style={{ color: 'var(--accent-primary)' }} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Campus Wallet Balance
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                            ₹{walletData?.balance?.toLocaleString('en-IN') ?? '0'}
                        </span>
                        <span style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: weekChange >= 0 ? '#ef4444' : '#22c55e',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                        }}>
                            {weekChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(weekChange)}% this week
                        </span>
                    </div>

                    {/* Quick Recharge */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {[100, 200, 500].map(amt => (
                            <button
                                key={amt}
                                className="view-btn"
                                style={{ width: 'auto', padding: '8px 20px', fontSize: '0.85rem' }}
                                onClick={() => setRechargeAmount(String(amt))}
                            >
                                +₹{amt}
                            </button>
                        ))}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="number"
                                placeholder="Custom ₹"
                                value={rechargeAmount}
                                onChange={e => setRechargeAmount(e.target.value)}
                                style={{
                                    width: '120px',
                                    padding: '8px 12px',
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                }}
                            />
                            <button
                                className="view-btn"
                                style={{ width: 'auto', padding: '8px 24px', background: '#22c55e' }}
                                onClick={handleRecharge}
                                disabled={recharging}
                            >
                                {recharging ? <RefreshCw size={16} className="spin-icon" /> : <Zap size={16} />}
                                Pay via Razorpay
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
                {/* Withdraw Section */}
                <div className="card" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Send size={20} color="#f59e0b" />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Withdraw to UPI</h3>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Transfer your wallet balance instantly to any UPI ID.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <input
                            type="text"
                            placeholder="Enter UPI ID (e.g. name@okhdfc)"
                            value={withdrawUpi}
                            onChange={e => setWithdrawUpi(e.target.value)}
                            style={{ flex: 1, minWidth: '200px' }}
                        />
                        <input
                            type="number"
                            placeholder="Amount ₹"
                            value={withdrawAmount}
                            onChange={e => setWithdrawAmount(e.target.value)}
                            style={{ width: '120px' }}
                            max={walletData?.balance || 0}
                        />
                        <button
                            className="view-btn"
                            style={{ width: 'auto', padding: '12px 24px', background: '#f59e0b', color: '#000' }}
                            onClick={handleWithdraw}
                            disabled={withdrawing || !withdrawUpi || !withdrawAmount}
                        >
                            {withdrawing ? <RefreshCw size={16} className="spin-icon" /> : 'Withdraw Funds'}
                        </button>
                    </div>
                    {withdrawMessage.text && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '10px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            background: withdrawMessage.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            color: withdrawMessage.type === 'success' ? '#22c55e' : '#ef4444',
                            border: `1px solid ${withdrawMessage.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
                        }}>
                            {withdrawMessage.text}
                        </div>
                    )}
                </div>
            </div>

            {/* Budget Warning */}
            {walletData?.insights?.budget_warning && (
                <div className="card" style={{
                    background: 'rgba(239,68,68,0.08)',
                    borderColor: 'rgba(239,68,68,0.3)',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                }}>
                    <AlertTriangle size={24} color="#ef4444" />
                    <div>
                        <p style={{ fontWeight: 700, color: '#ef4444', marginBottom: '0.25rem' }}>Budget Warning</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{walletData.insights.budget_warning}</p>
                    </div>
                </div>
            )}

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {['overview', 'transactions'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: 'var(--radius-md)',
                            border: '2px solid',
                            borderColor: activeTab === tab ? 'var(--accent-primary)' : 'var(--border-color)',
                            background: activeTab === tab ? 'rgba(99,102,241,0.1)' : 'transparent',
                            color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            textTransform: 'capitalize',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {/* Spending by Category */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Spending by Category</h3>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', background: '#1a1a2e' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(val) => `₹${val}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No spending data yet</p>
                        )}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                            {categoryData.map(cat => (
                                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color }} />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        {cat.name}: ₹{cat.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weekly Comparison */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Weekly Comparison</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={[
                                { name: 'Last Week', amount: walletData?.insights?.last_week_total || 0 },
                                { name: 'This Week', amount: walletData?.insights?.this_week_total || 0 },
                            ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e1e1e', borderRadius: '8px', border: '1px solid #333' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(val) => `₹${val}`}
                                />
                                <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={60}>
                                    <Cell fill="#6366f1" />
                                    <Cell fill={weekChange > 20 ? '#ef4444' : '#8b5cf6'} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                            <span style={{
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: weekChange >= 0 ? '#ef4444' : '#22c55e',
                            }}>
                                {weekChange >= 0 ? '↑' : '↓'} {Math.abs(weekChange)}% compared to last week
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'transactions' && (
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 700 }}>Recent Transactions</h3>
                    {(walletData?.transactions || []).length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No transactions yet. Tap your RFID card to get started!</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {(walletData?.transactions || []).map(tx => (
                                <div key={tx.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    transition: 'all 0.15s ease',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: tx.transaction_type === 'credit'
                                                ? 'rgba(34,197,94,0.15)'
                                                : 'rgba(239,68,68,0.15)',
                                        }}>
                                            {tx.transaction_type === 'credit'
                                                ? <ArrowDownRight size={18} color="#22c55e" />
                                                : <ArrowUpRight size={18} color="#ef4444" />}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                                {tx.description || (tx.transaction_type === 'credit' ? 'Wallet Recharge' : 'Payment')}
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {new Date(tx.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                            </p>
                                        </div>
                                    </div>
                                    <span style={{
                                        fontWeight: 800,
                                        fontSize: '1rem',
                                        fontFamily: "'JetBrains Mono', monospace",
                                        color: tx.transaction_type === 'credit' ? '#22c55e' : '#ef4444',
                                    }}>
                                        {tx.transaction_type === 'credit' ? '+' : '-'}₹{Math.abs(tx.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RFIDWallet;
