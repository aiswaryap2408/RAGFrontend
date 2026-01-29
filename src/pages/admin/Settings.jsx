import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const [paymentEnabled, setPaymentEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('http://localhost:8088/admin/settings');
            if (res.ok) {
                const data = await res.json();
                setPaymentEnabled(data.payment_enabled);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const togglePayment = async () => {
        try {
            const newValue = !paymentEnabled;
            const res = await fetch('http://localhost:8088/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'payment_enabled', value: newValue })
            });
            if (res.ok) {
                setPaymentEnabled(newValue);
                setMsg(`Payments ${newValue ? 'Enabled' : 'Disabled'}`);
                setTimeout(() => setMsg(''), 3000);
            }
        } catch (error) {
            console.error("Error updating settings:", error);
        }
    };

    return (
        <div className="flex h-screen bg-black font-sans text-slate-100 overflow-hidden">
            <div className="flex-1 flex flex-col">
                <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                    </button>
                    <h1 className="text-xl font-black tracking-tight text-white">System Settings</h1>
                </header>

                <div className="dashboard-content flex-1 overflow-y-auto p-8">
                    {loading ? <p>Loading settings...</p> : (
                        <div className="settings-card" style={{
                            background: 'rgba(20, 20, 30, 0.8)',
                            padding: '20px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 215, 0, 0.1)',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            <div className="setting-item" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <h3 style={{ color: '#FFD700', marginBottom: '0.5rem' }}>Payment Gateway</h3>
                                    <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
                                        Enable or disable global payment processing. When disabled, users cannot recharge wallet.
                                    </p>
                                </div>
                                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                                    <input
                                        type="checkbox"
                                        checked={paymentEnabled}
                                        onChange={togglePayment}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <span className="slider round" style={{
                                        position: 'absolute',
                                        cursor: 'pointer',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: paymentEnabled ? '#FFD700' : '#ccc',
                                        transition: '.4s',
                                        borderRadius: '34px'
                                    }}>
                                        <span style={{
                                            position: 'absolute',
                                            content: "",
                                            height: '18px',
                                            width: '18px',
                                            left: paymentEnabled ? '26px' : '4px',
                                            bottom: '4px',
                                            backgroundColor: 'white',
                                            transition: '.4s',
                                            borderRadius: '50%'
                                        }} />
                                    </span>
                                </label>
                            </div>
                            {msg && <p style={{ color: '#4caf50', textAlign: 'center' }}>{msg}</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
