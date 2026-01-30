import React, { useState, useEffect } from 'react';
import { getBalance, getTransactionHistory } from '../../api';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, IconButton, Button, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import Subheader from '../../components/subheader';
import PrimaryButton from '../../components/PrimaryButton';

const Wallet = () => {
    const [balance, setBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const mobile = localStorage.getItem('mobile');
    const navigate = useNavigate();

    useEffect(() => {
        if (!mobile) {
            navigate('/');
            return;
        }
        fetchWalletData();

        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, [mobile]);

    const fetchWalletData = async () => {
        try {
            const balanceRes = await getBalance(mobile);
            setBalance(balanceRes.data.balance || 0);

            const historyRes = await getTransactionHistory(mobile);
            setHistory(historyRes.data.history || []);
        } catch (error) {
            console.error("Error fetching wallet data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecharge = async (amount) => {
        setLoading(true);
        try {
            const { createPaymentOrder, verifyPayment } = await import('../../api');

            // 1. Create Order
            const orderRes = await createPaymentOrder(parseFloat(amount), mobile);
            const order = orderRes.data;

            // 2. Open Razorpay
            const options = {
                key: order.key,
                amount: order.amount,
                currency: order.currency,
                name: "Astrology Guruji",
                description: "Wallet Recharge",
                order_id: order.order_id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        alert("Recharge successful! Your balance has been updated.");
                        fetchWalletData();
                    } catch (err) {
                        console.error("Verification failed", err);
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    contact: mobile,
                },
                theme: {
                    color: "#F36A2F"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert("Payment Failed: " + response.error.description);
            });
            rzp.open();

        } catch (error) {
            console.error("Payment init failed:", error);
            alert("Failed to initiate payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const rechargeOptions = [
        { price: 99 },
        { price: 199 },
        { price: 499 },
    ];

    return (
        <Box sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FFF6EB',
            overflow: 'hidden'
        }}>
            <Box sx={{ position: 'relative', flexShrink: 0, zIndex: 100, bgcolor: '#FFF6EB' }}>
                <Subheader title="My Wallet" showBack />
            </Box>

            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                position: 'relative',
                zIndex: 10,
                mt: 2,
                px: 2,
                pb: 5,
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
            }}>
                <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontWeight: 700, color: '#eb3c34', fontSize: '1rem' }}>Current wallet balance:</Typography>
                    <Typography sx={{ fontWeight: 500, my: 1, color: '#53300e', fontSize: '2.5rem' }}>{balance.toLocaleString()}<span style={{ fontSize: '1.5rem', fontWeight: 400 }}> pts</span></Typography>
                </Box>

                {/* Recharge Section */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ color: '#eb3c34', fontWeight: 700, fontSize: '1rem' }}>Recharge:</Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                color: '#54a170',
                                '&:hover': { opacity: 0.8 }
                            }}
                            onClick={() => navigate('/wallet/recharge-history')}
                        >
                            <Typography sx={{ fontWeight: 700, textDecoration: 'underline', fontSize: '0.9rem', mr: 0.5 }}>
                                Show previous recharges
                            </Typography>
                            <Box component="span" sx={{ fontSize: '1.2rem', fontWeight: 800 }}>›</Box>
                        </Box>
                    </Box>

                    {/* Table Container */}
                    <Box sx={{ borderRadius: 1, overflow: 'hidden', bgcolor: '#fff' }}>
                        {/* Table Header */}
                        <Box sx={{ display: 'flex', bgcolor: '#54a170', p: 1.5 }}>
                            <Typography sx={{ flex: 1, color: '#fff', fontWeight: 600 }}>Recharge for</Typography>
                            <Box sx={{ width: 120 }} />
                        </Box>

                        {/* Table Rows */}
                        {rechargeOptions.map((option, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: 1.5,
                                    py: 2.5,
                                    borderBottom: index !== rechargeOptions.length - 1 ? '2px solid #c5c5c5' : 'none',
                                    transition: 'background 0.2s',
                                    '&:hover': { bgcolor: '#f9f9f9' }
                                }}
                            >
                                <Typography sx={{ flex: 1, fontWeight: 500, color: '#5b5b5b', fontSize: '1.2rem' }}>
                                    ₹ {option.price} <Box component="span" sx={{ fontWeight: 400, fontSize: '1rem', color: '#5b5b5b' }}></Box>
                                </Typography>
                                <PrimaryButton
                                    label={loading ? "..." : "Recharge"}
                                    variant="contained"
                                    onClick={() => handleRecharge(option.price)}
                                    disabled={loading}
                                    sx={{
                                        bgcolor: '#54a170',
                                        color: '#fff',
                                        borderRadius: 50,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        p: .5,
                                        width: '120px',
                                        '&:hover': { bgcolor: '#458a5c' }
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Transaction History Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography sx={{ color: '#eb3c34', fontWeight: 700, fontSize: '1rem', mb: 1 }}>Transaction History:</Typography>

                    {/* Table Container */}
                    <Box sx={{ borderRadius: 1, overflow: 'hidden', bgcolor: '#fff' }}>
                        {history.length === 0 ? (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography sx={{ color: '#666' }}>No transactions yet.</Typography>
                            </Box>
                        ) : (
                            <>
                                {/* Table Header */}
                                <Box sx={{ display: 'flex', bgcolor: '#54a170', p: 1.5 }}>
                                    <Typography sx={{ flex: 1.5, color: '#fff', fontWeight: 600 }}>Description</Typography>
                                    <Typography sx={{ flex: 1, color: '#fff', fontWeight: 600 }}>Amount</Typography>
                                    <Box sx={{ width: 100 }} />
                                </Box>

                                {/* Table Rows */}
                                {history.map((tx, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            p: 1.5,
                                            py: 2,
                                            borderBottom: index !== history.length - 1 ? '2px solid #c5c5c5' : 'none',
                                            transition: 'background 0.2s',
                                            '&:hover': { bgcolor: '#f9f9f9' }
                                        }}
                                    >
                                        <Box sx={{ flex: 1.5 }}>
                                            <Typography sx={{ fontWeight: 500, color: '#5b5b5b', fontSize: '1rem' }}>
                                                {tx.description || tx.category}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.8rem', color: '#888', display: 'flex', gap: 1 }}>
                                                {new Date(tx.timestamp * 1000).toLocaleDateString()}
                                                <Box component="span" sx={{
                                                    color: tx.status === 'success' ? '#54a170' : tx.status === 'failed' ? '#eb3c34' : '#888',
                                                    fontWeight: 600
                                                }}>
                                                    • {tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : ''}
                                                </Box>
                                            </Typography>
                                        </Box>
                                        <Typography sx={{
                                            flex: 1,
                                            fontWeight: 700,
                                            color: tx.type === 'credit' ? '#54a170' : '#eb3c34',
                                            fontSize: '1.1rem'
                                        }}>
                                            {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                                        </Typography>
                                        <PrimaryButton
                                            label="Detail"
                                            variant="contained"
                                            onClick={() => {
                                                // Functionality for Detail button can be added here
                                                console.log("Transaction detail:", tx);
                                            }}
                                            sx={{
                                                bgcolor: '#54a170',
                                                color: '#fff',
                                                borderRadius: 50,
                                                textTransform: 'none',
                                                fontWeight: 500,
                                                p: .5,
                                                width: '100px',
                                                '&:hover': { bgcolor: '#458a5c' }
                                            }}
                                        />
                                    </Box>
                                ))}
                            </>
                        )}
                    </Box>
                </Box>


            </Box>
        </Box>
    );
};

export default Wallet;
