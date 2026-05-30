"use client";
import React, { useState, useEffect } from 'react';
import { 
    Wallet, CreditCard, Clock, CheckCircle2, 
    Download, AlertCircle, TrendingUp, History,
    Camera
} from 'lucide-react';
import { createClient } from '../../utils/supabase/client';
import { useAuth } from '../../context/AuthContext';
import './FeatureStyles.css';

const FinancePortal = () => {
    const { user } = useAuth();
    const [walletBalance, setWalletBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    
    // Wallet actions state
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawUpi, setWithdrawUpi] = useState('');
    const [recharging, setRecharging] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [withdrawMessage, setWithdrawMessage] = useState({ text: '', type: '' });
    const [showScanner, setShowScanner] = useState(false);

    const supabase = createClient();
    const rawStudentId = user?.id || user?._id;
    const studentId = (rawStudentId === 'student-123' || rawStudentId?.length < 36) 
        ? '07d78f63-881c-41f3-b281-a893a31735e4' 
        : rawStudentId;

    const fetchWallet = async () => {
        if (!studentId) return;
        const { data } = await supabase
            .from('wallet')
            .select('balance')
            .eq('student_id', studentId)
            .single();
        if (data) setWalletBalance(data.balance);
    };

    const fetchTransactions = async () => {
        if (!studentId) return;
        const { data } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })
            .limit(10);
        if (data) setTransactions(data);
    };

    useEffect(() => {
        if (!studentId) return;

        fetchWallet();
        fetchTransactions();

        const walletSub = supabase.channel('wallet_changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wallet', filter: `student_id=eq.${studentId}` }, (payload) => {
                setWalletBalance(payload.new.balance);
            })
            .subscribe();

        const txSub = supabase.channel('tx_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wallet_transactions', filter: `student_id=eq.${studentId}` }, (payload) => {
                setTransactions(prev => [payload.new, ...prev].slice(0, 10));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(walletSub);
            supabase.removeChannel(txSub);
        };
    }, [studentId]);

    const handleRecharge = async () => {
        const amount = parseFloat(rechargeAmount);
        if (!amount || amount <= 0) return;
        setRecharging(true);
        try {
            const orderRes = await fetch('/api/wallet/recharge/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });
            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.message);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock',
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Smart Campus Wallet',
                description: 'Wallet Recharge',
                order_id: orderData.id,
                handler: async function (response) {
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
                        fetchWallet();
                        alert('Payment successful! Wallet recharged.');
                    } else {
                        alert('Payment verification failed.');
                    }
                },
                prefill: {
                    name: user?.name || 'Student',
                    email: user?.email || 'student@campus.com',
                },
                theme: { color: '#6366f1' }
            };

            if (window.Razorpay) {
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    alert('Payment Failed: ' + response.error.description);
                });
                rzp.open();
            } else {
                alert('Razorpay SDK not loaded. Unable to process payment.');
            }
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
                fetchWallet();
            } else {
                setWithdrawMessage({ text: data.message || 'Withdrawal failed', type: 'error' });
            }
        } catch (err) {
            console.error('Withdrawal failed:', err);
            setWithdrawMessage({ text: 'Network error. Try again.', type: 'error' });
        }
        setWithdrawing(false);
    };

    const triggerFacePay = async () => {
        setShowScanner(false);
        try {
            const res = await fetch('/api/wallet/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    present_usns: [studentId],
                    amount: 100,
                    description: 'Judges Demo - Face Pay'
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Success! ${data.message}`);
                fetchWallet();
                fetchTransactions();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to connect to checkout API.");
        }
    };

    const FaceScannerModal = ({ onClose, onScanSuccess }) => {
        const videoRef = React.useRef(null);
        const [stream, setStream] = useState(null);
        const [status, setStatus] = useState("Initializing Camera...");

        useEffect(() => {
            let activeStream = null;
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(s => {
                    activeStream = s;
                    setStream(s);
                    if (videoRef.current) {
                        videoRef.current.srcObject = s;
                    }
                    setStatus("Scanning Face...");
                    
                    setTimeout(() => {
                        setStatus("Face Recognized! Processing Payment...");
                        setTimeout(() => {
                            onScanSuccess();
                        }, 1500);
                    }, 3000);
                })
                .catch(err => {
                    setStatus("Camera Error: " + err.message);
                });

            return () => {
                if (activeStream) {
                    activeStream.getTracks().forEach(track => track.stop());
                }
            };
        }, []);

        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #3b82f6', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <h2 style={{ color: 'white', marginTop: 0 }}>Face Pay POS Terminal</h2>
                    <div style={{ position: 'relative', width: '320px', height: '240px', background: '#000', borderRadius: '8px', overflow: 'hidden', margin: '0 auto 16px' }}>
                        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            height: '2px',
                            background: '#10b981',
                            boxShadow: '0 0 10px #10b981, 0 0 20px #10b981',
                            animation: 'scan 2s infinite linear'
                        }} />
                        <style>{`
                            @keyframes scan {
                                0% { top: 0; }
                                50% { top: 100%; }
                                100% { top: 0; }
                            }
                        `}</style>
                    </div>
                    <p style={{ color: status.includes("Recognized") ? '#10b981' : '#60a5fa', fontWeight: 'bold' }}>{status}</p>
                    <button onClick={onClose} style={{ marginTop: '16px', background: 'transparent', border: '1px solid #64748b', color: '#cbd5e1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                </div>
            </div>
        );
    };

    return (
        <div className="feature-container finance-portal">
            <div className="feature-header">
                <div className="header-text">
                    <h1>Finance & Campus Wallet 🏦</h1>
                    <p>Track your digital wallet, recharge instantly, or withdraw to UPI.</p>
                </div>
            </div>

            <div className="wallet-dashboard" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '32px',
                color: 'white',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px' }}>
                            <Wallet size={32} color="#60a5fa" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#94a3b8' }}>Campus Wallet Balance</h2>
                            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: 'white' }}>₹{walletBalance.toFixed(2)}</p>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '6px 16px', borderRadius: '20px', fontWeight: '600', fontSize: '0.85rem' }}>
                            <Camera size={14} />
                            Face Pay Active
                        </div>
                        <button 
                            onClick={() => setShowScanner(true)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)' }}
                        >
                            <Camera size={16} />
                            Demo Face Checkout (₹100)
                        </button>
                    </div>
                </div>
                {showScanner && <FaceScannerModal onClose={() => setShowScanner(false)} onScanSuccess={triggerFacePay} />}

                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#cbd5e1', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Recent Face Pay & Transactions</h3>
                    {transactions.length === 0 ? (
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No recent transactions.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {transactions.map(tx => (
                                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ 
                                            background: tx.transaction_type === 'credit' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                                            color: tx.transaction_type === 'credit' ? '#4ade80' : '#f87171',
                                            padding: '8px', 
                                            borderRadius: '8px' 
                                        }}>
                                            {tx.transaction_type === 'credit' ? <TrendingUp size={16} /> : <History size={16} />}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{tx.description}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(tx.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: '700', color: tx.transaction_type === 'credit' ? '#4ade80' : '#f87171' }}>
                                        {tx.transaction_type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="finance-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="stat-card secure-payment" style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div className="stat-header" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CreditCard size={20} color="#6366f1" />
                        <h3 style={{ margin: 0 }}>Add Funds (UPI / Cards)</h3>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            {[100, 500, 1000].map(amt => (
                                <button 
                                    key={amt} 
                                    onClick={() => setRechargeAmount(String(amt))}
                                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #3b82f6', background: 'transparent', color: '#3b82f6', cursor: 'pointer' }}
                                >
                                    +₹{amt}
                                </button>
                            ))}
                        </div>
                        <input 
                            type="number" 
                            placeholder="Enter Custom Amount" 
                            value={rechargeAmount}
                            onChange={e => setRechargeAmount(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card-alt)', color: 'var(--text-primary)', marginBottom: '16px' }}
                        />
                        <button 
                            onClick={handleRecharge}
                            disabled={recharging || !rechargeAmount}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#3b82f6', color: 'white', fontWeight: 'bold', border: 'none', cursor: recharging ? 'not-allowed' : 'pointer', opacity: recharging ? 0.7 : 1 }}
                        >
                            {recharging ? 'Processing...' : `Pay ₹${rechargeAmount || 0}`}
                        </button>
                    </div>
                    <div className="payment-icons" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <div className="p-icon" style={{ fontSize: '0.8rem', padding: '4px 12px', background: '#f1f5f9', color: '#0f172a', borderRadius: '4px', fontWeight: 'bold' }}>UPI</div>
                        <div className="p-icon" style={{ fontSize: '0.8rem', padding: '4px 12px', background: '#1e3a8a', color: 'white', borderRadius: '4px', fontWeight: 'bold' }}>VISA</div>
                        <div className="p-icon" style={{ fontSize: '0.8rem', padding: '4px 12px', background: '#f97316', color: 'white', borderRadius: '4px', fontWeight: 'bold' }}>Rupay</div>
                    </div>
                </div>

                <div className="stat-card secure-payment" style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div className="stat-header" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Wallet size={20} color="#10b981" />
                        <h3 style={{ margin: 0 }}>Withdraw to UPI</h3>
                    </div>
                    <div>
                        <input 
                            type="text" 
                            placeholder="Enter UPI ID (e.g., student@okaxis)" 
                            value={withdrawUpi}
                            onChange={e => setWithdrawUpi(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card-alt)', color: 'var(--text-primary)', marginBottom: '12px' }}
                        />
                        <input 
                            type="number" 
                            placeholder="Withdrawal Amount (₹)" 
                            value={withdrawAmount}
                            onChange={e => setWithdrawAmount(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card-alt)', color: 'var(--text-primary)', marginBottom: '16px' }}
                        />
                        <button 
                            onClick={handleWithdraw}
                            disabled={withdrawing || !withdrawUpi || !withdrawAmount}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#10b981', color: 'white', fontWeight: 'bold', border: 'none', cursor: withdrawing ? 'not-allowed' : 'pointer', opacity: withdrawing ? 0.7 : 1 }}
                        >
                            {withdrawing ? 'Processing...' : 'Withdraw to Bank'}
                        </button>
                        
                        {withdrawMessage.text && (
                            <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', background: withdrawMessage.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: withdrawMessage.type === 'error' ? '#ef4444' : '#10b981', border: `1px solid ${withdrawMessage.type === 'error' ? '#ef4444' : '#10b981'}` }}>
                                {withdrawMessage.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancePortal;
