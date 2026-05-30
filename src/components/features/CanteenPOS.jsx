"use client";
import React, { useState, useEffect } from 'react';
import { 
    Wallet, Camera, TrendingUp, History, CreditCard, UserCheck, 
    X, CheckCircle, RefreshCw, Zap
} from 'lucide-react';
import { createClient } from '../../utils/supabase/client';
import { useAuth } from '../../context/AuthContext';
import './FeatureStyles.css';

const FaceScannerModal = ({ amount, onClose, onScanSuccess }) => {
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
                setStatus("Scanning for Student Face...");
                
                // Simulate scan duration
                setTimeout(() => {
                    setStatus("Match Found! Processing Payment...");
                    setTimeout(() => {
                        // Assuming the Demo Student UUID for the demonstration
                        onScanSuccess('07d78f63-881c-41f3-b281-a893a31735e4');
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #10b981', textAlign: 'center', position: 'relative', overflow: 'hidden', minWidth: '400px' }}>
                <h2 style={{ color: 'white', marginTop: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Camera size={24} color="#10b981" /> Authorizing ₹{amount}
                </h2>
                <div style={{ position: 'relative', width: '100%', height: '280px', background: '#000', borderRadius: '12px', overflow: 'hidden', margin: '24px auto', border: '2px solid #334155' }}>
                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0,
                        height: '2px',
                        background: '#10b981',
                        boxShadow: '0 0 10px #10b981, 0 0 30px #10b981',
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
                <p style={{ color: status.includes("Match") ? '#10b981' : '#60a5fa', fontWeight: 'bold', fontSize: '1.1rem' }}>{status}</p>
                <button onClick={onClose} style={{ marginTop: '24px', background: 'transparent', border: '1px solid #64748b', color: '#cbd5e1', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>Cancel Transaction</button>
            </div>
        </div>
    );
};

const CanteenPOS = () => {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [showScanner, setShowScanner] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [lastPaidAmount, setLastPaidAmount] = useState(0);
    const [dailyTotal, setDailyTotal] = useState(0);

    const supabase = createClient();

    const fetchTransactions = async () => {
        const { data } = await supabase
            .from('wallet_transactions')
            .select('id, amount, description, created_at, student_id')
            .ilike('description', '%Canteen%')
            .order('created_at', { ascending: false })
            .limit(15);
        
        if (data) {
            setTransactions(data);
            
            // Calculate daily total
            const today = new Date().toISOString().split('T')[0];
            const total = data
                .filter(tx => tx.created_at.startsWith(today))
                .reduce((sum, tx) => sum + Number(tx.amount), 0);
            setDailyTotal(total);
        }
    };

    useEffect(() => {
        fetchTransactions();

        const txSub = supabase.channel('canteen_tx_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wallet_transactions' }, (payload) => {
                if (payload.new.description && payload.new.description.includes('Canteen')) {
                    fetchTransactions();
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(txSub);
        };
    }, []);

    const appendNumber = (num) => {
        if (amount === '0' && num !== '.') {
            setAmount(num);
        } else if (amount.includes('.') && num === '.') {
            return;
        } else {
            setAmount(prev => prev + num);
        }
    };

    const deleteNumber = () => {
        setAmount(prev => prev.slice(0, -1));
    };

    const processPayment = async (studentUuid) => {
        setShowScanner(false);
        setProcessing(true);
        const chargeAmount = parseFloat(amount);
        
        if (!chargeAmount || chargeAmount <= 0) {
            alert('Invalid amount');
            setProcessing(false);
            return;
        }

        try {
            const res = await fetch('/api/wallet/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    present_usns: [studentUuid],
                    amount: chargeAmount,
                    description: 'Canteen POS - Face Pay'
                })
            });
            const data = await res.json();
            
            if (res.ok) {
                setLastPaidAmount(chargeAmount);
                setPaymentSuccess(true);
                setAmount('');
                setTimeout(() => {
                    setPaymentSuccess(false);
                }, 3000);
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to connect to checkout API.");
        }
        setProcessing(false);
    };

    return (
        <div className="feature-container" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px', height: 'calc(100vh - 40px)' }}>
            {/* POS Terminal Panel */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="feature-header" style={{ marginBottom: '24px' }}>
                    <div className="header-text">
                        <h1>Canteen POS Terminal 🍔</h1>
                        <p>Face Pay verification and instant settlement system.</p>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    
                    {paymentSuccess && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(16, 185, 129, 0.95)', borderRadius: '16px', zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', animation: 'fadeIn 0.3s' }}>
                            <CheckCircle size={80} style={{ marginBottom: '24px' }} />
                            <h2 style={{ fontSize: '2.5rem', margin: '0 0 16px 0' }}>Payment Successful!</h2>
                            <p style={{ fontSize: '1.5rem', opacity: 0.9, margin: 0 }}>₹{lastPaidAmount.toFixed(2)} added to today's earnings.</p>
                            <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
                        </div>
                    )}
                    {/* Amount Display */}
                    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid #334155', textAlign: 'right' }}>
                        <p style={{ color: '#94a3b8', margin: '0 0 8px 0', fontSize: '1.2rem' }}>Total Due</p>
                        <p style={{ color: 'white', margin: 0, fontSize: '4rem', fontWeight: '800', fontFamily: 'monospace' }}>
                            ₹{amount || '0'}
                        </p>
                    </div>

                    {/* Number Pad */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px', flex: 1 }}>
                        {['1','2','3','4','5','6','7','8','9','.', '0'].map(num => (
                            <button 
                                key={num}
                                onClick={() => appendNumber(num)}
                                style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 'bold', padding: '24px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                {num}
                            </button>
                        ))}
                        <button 
                            onClick={deleteNumber}
                            style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)', color: '#ef4444', fontSize: '1.5rem', fontWeight: 'bold', padding: '24px', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <X size={32} />
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <button 
                            onClick={() => setAmount('')}
                            style={{ padding: '20px', borderRadius: '16px', border: '1px solid #64748b', background: 'transparent', color: '#cbd5e1', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Clear
                        </button>
                        <button 
                            onClick={() => {
                                if(parseFloat(amount) > 0) setShowScanner(true);
                            }}
                            disabled={!amount || parseFloat(amount) <= 0 || processing}
                            style={{ padding: '20px', borderRadius: '16px', border: 'none', background: '#10b981', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', cursor: (!amount || parseFloat(amount) <= 0) ? 'not-allowed' : 'pointer', opacity: (!amount || parseFloat(amount) <= 0) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <Camera size={24} /> 
                            {processing ? 'Processing...' : 'Scan Face'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar Feed */}
            <div style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                    <p style={{ margin: '0 0 8px 0', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={18}/> Today's Revenue</p>
                    <h3 style={{ margin: 0, fontSize: '2.5rem', color: 'white' }}>₹{dailyTotal.toFixed(2)}</h3>
                </div>

                <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <History size={20} /> Recent Approvals
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {transactions.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No transactions yet.</p>
                    ) : transactions.map(tx => (
                        <div key={tx.id} style={{ background: 'var(--bg-card-alt)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle size={16} color="#10b981" />
                                    <span style={{ fontWeight: 'bold' }}>Success</span>
                                </div>
                                <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.2rem' }}>+₹{tx.amount.toFixed(2)}</span>
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <p style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}><UserCheck size={14}/> Student: {tx.student_id.substring(0,8)}...</p>
                                <p style={{ margin: 0 }}>{new Date(tx.created_at).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showScanner && <FaceScannerModal amount={amount} onClose={() => setShowScanner(false)} onScanSuccess={processPayment} />}
        </div>
    );
};

export default CanteenPOS;
