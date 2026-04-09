import React, { useState, useEffect } from 'react';
import { getBalance, getTransactionHistory, getPublicRechargeConfigs } from '../../api';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Card, CardContent, IconButton, Button, Divider, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import Subheader from '../../components/subheader';
import PrimaryButton from '../../components/PrimaryButton';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const Wallet = () => {
    const [balance, setBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [configs, setConfigs] = useState([]);
    const [configsLoading, setConfigsLoading] = useState(true);
    const mobile = localStorage.getItem('mobile');
    const referenceid = localStorage.getItem('currentProfileId');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!mobile) {
            navigate('/');
            return;
        }
        fetchWalletData();
        fetchConfigs();

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
    }, [mobile, location.key]);

    const fetchConfigs = async () => {
        setConfigsLoading(true);
        try {
            const { data } = await getPublicRechargeConfigs();
            setConfigs(data || []);
        } catch (e) {
            console.error("Failed to fetch recharge configs", e);
        } finally {
            setConfigsLoading(false);
        }
    };

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
        if (!mobile || !referenceid) {
            console.error("Missing credentials for recharge:", { mobile, referenceid });
            alert("No profile selected or session expired. Please select a profile before recharging.");
            navigate('/chat');
            return;
        }

        setLoading(true);
        try {
            const { createPaymentOrder, verifyPayment } = await import('../../api');

            // 1. Create Order
            const orderRes = await createPaymentOrder(parseFloat(amount), mobile, referenceid);
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
                        // Always refresh balance immediately
                        await fetchWalletData();
                        if (location.state?.returnToChat) {
                            setTimeout(() => {
                                navigate('/chat', { state: { fromRecharge: true } });
                            }, 800);
                        }
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
            if (!window.Razorpay) {
                throw new Error("Razorpay SDK not loaded. Please refresh the page and try again.");
            }
            rzp.on('payment.failed', function (response) {
                alert("Payment Failed: " + response.error.description);
            });
            rzp.open();

        } catch (error) {
            console.error("Payment init failed:", error);
            const errMsg = error.response?.data?.detail || error.message || "Failed to initiate payment. Please try again.";
            alert("Error: " + errMsg);
        } finally {
            setLoading(false);
        }
    };



    return (
        <Box sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FFF6EB',
            overflow: 'hidden'
        }}>
            <Box sx={{ position: 'relative', flexShrink: 0, zIndex: 100, bgcolor: '#FFF6EB' }}>
                <Subheader title="Recharge" showBack />
            </Box>

            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                position: 'relative',
                zIndex: 10,
                mt: 6.5,
                pt: 4,
                px: 2,
                pb: 5,
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
            }}>
                <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontWeight: 700, color: '#eb3c34', fontSize: '1rem' }}>Current wallet balance:</Typography>
                    <Typography sx={{ fontWeight: 500, color: '#53300e', fontSize: '2.5rem', lineHeight: 1.2 }}>{balance.toLocaleString()}<span style={{ fontSize: '1.5rem', fontWeight: 400 }}> pts</span></Typography>
                </Box>

                {/* Recharge Section */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 0 }}>
                        <Typography sx={{ color: '#eb3c34', fontWeight: 700, fontSize: '1.2rem', mr: 1.5 }}>Recharge:</Typography>
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
                            <Typography sx={{ fontWeight: 700, textDecoration: 'underline', fontSize: '0.9rem', mr: 0 }}>
                                Show previous recharges<KeyboardArrowRightIcon sx={{ fontSize: '1.8rem', fontWeight: 900, position: 'relative', left: -5 }} />
                            </Typography>

                        </Box>
                    </Box>
                    <Typography sx={{ fontWeight: 400, color: '#000000', fontSize: '.95rem', mb: 2 }}>Recharge your wallet if you prefer to pay per question. Points will be deducted whenever a question falls under the paid category.</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#000000', fontSize: '.95rem', mb: 1 }}>Remedies and mantras will be provided when applicable.</Typography>
                    {/* Table Container */}
                    <Box sx={{ borderRadius: 1, overflow: 'hidden', bgcolor: '#fff' }}>
                        {/* Table Header */}
                        <Box sx={{ display: 'flex', bgcolor: '#54a170', p: 1, px: 1.5 }}>
                            <Typography sx={{ flex: 1, color: '#fff', fontWeight: 500, fontSize: '1rem' }}>Recharge for</Typography>
                            <Typography sx={{ flex: 1, color: '#fff', fontWeight: 500, fontSize: '1rem' }}>You get</Typography>
                            <Box sx={{ width: 120 }} />
                        </Box>

                        {/* Table Rows */}
                        {configsLoading ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <CircularProgress size={24} sx={{ color: '#54a170' }} />
                                <Typography sx={{ mt: 1, color: '#666', fontSize: '0.85rem' }}>Loading current offers...</Typography>
                            </Box>
                        ) : configs.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography sx={{ color: '#666', fontSize: '0.85rem' }}>No recharge packages available at the moment.</Typography>
                            </Box>
                        ) : (
                            configs.map((option, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 1.5,
                                        py: 2.5,
                                        borderBottom: index !== configs.length - 1 ? '2px solid #c5c5c5' : 'none',
                                        transition: 'background 0.2s',
                                        '&:hover': { bgcolor: '#f9f9f9' }
                                    }}
                                >
                                    <Typography sx={{ flex: 1, fontWeight: 400, color: '#5b5b5b', fontSize: '1.3rem' }}>
                                        ₹ {option.amount} <Box component="span" sx={{ fontWeight: 400, fontSize: '.8rem', color: '#5b5b5b' }}>+ GST</Box>
                                    </Typography>
                                    <Typography sx={{ flex: 1, fontWeight: 600, color: '#5b5b5b', fontSize: '1.2rem' }}>
                                        {option.points} pts
                                    </Typography>
                                    <PrimaryButton
                                        label={loading ? "..." : "Recharge"}
                                        variant="contained"
                                        onClick={() => handleRecharge(option.amount)}
                                        disabled={loading}
                                        sx={{
                                            bgcolor: '#54a170',
                                            color: '#fff',
                                            borderRadius: 50,
                                            textTransform: 'none',
                                            fontWeight: 400,
                                            p: .5,
                                            px: 0,
                                            width: '110px',
                                            '&:hover': { bgcolor: '#458a5c' }
                                        }}
                                    />
                                </Box>
                            ))
                        )}
                    </Box>
                </Box>

                {/* Separator */}
                <Box sx={{ py: 0, textAlign: 'center' }}>
                    <Typography sx={{ color: '#eb3c34', fontWeight: 700, fontSize: '1.2rem' }}>- or -</Typography>
                </Box>

                {/* Subscribe Section */}
                <Box sx={{ mb: 6 }}>
                    <Typography sx={{ color: '#eb3c34', fontWeight: 700, fontSize: '1.2rem', mb: .3 }}>Subscribe:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '0.95rem', mb: 2, lineHeight: 1.6 }}>
                        A Monthly or Quarterly subscription is ideal if you wish to interact frequently with the astrologer and receive remedies and mantras whenever applicable.</Typography>
                    <Typography sx={{ color: '#333', fontSize: '0.95rem', mb: 2, lineHeight: 1.6 }}>
                        Subscribers receive more detailed insights with every response, and their questions are prioritized over non-subscribed users.
                    </Typography>
                    <PrimaryButton
                        label="Show details"
                        variant="contained"
                        onClick={() => navigate('/wallet/subscribe')}
                        endIcon={<KeyboardArrowRightIcon />}
                        sx={{
                            bgcolor: '#54a170',
                            color: '#fff',
                            borderRadius: 50,
                            textTransform: 'none',
                            fontWeight: 400,
                            py: .4,
                            px: 2,
                            width: 'auto',
                            '&:hover': { bgcolor: '#458a5c' },
                            '& .MuiButton-endIcon svg': {
                                fontSize: 30,

                            },

                        }}
                    />
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
        </Box >
    );
};

export default Wallet;
