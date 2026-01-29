import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from "../components/header";

const Dakshina = () => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [paymentEnabled, setPaymentEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const mobile = localStorage.getItem('mobile');

    React.useEffect(() => {
        checkPaymentStatus();
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const checkPaymentStatus = async () => {
        try {
            const { data } = await import('../api').then(m => m.getSystemSettings());
            if (data && typeof data.payment_enabled !== 'undefined') {
                setPaymentEnabled(data.payment_enabled);
            }
        } catch (e) {
            console.error("Failed to check payment status", e);
        }
    };

    const handleAmountSelect = (val) => {
        setAmount(val);
    };

    const handleProceed = async () => {
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        if (!paymentEnabled) {
            alert("Payments are currently disabled by the administrator.");
            return;
        }

        setLoading(true);
        try {
            const { createPaymentOrder, verifyPayment } = await import('../api');

            // 1. Create Order
            const orderRes = await createPaymentOrder(parseFloat(amount), mobile);
            const order = orderRes.data;

            // 2. Open Razorpay
            const options = {
                key: order.key, // Backend provides the key now
                amount: order.amount,
                currency: order.currency,
                name: "Astrology Guruji",
                description: "Dakshina Contribution",
                order_id: order.order_id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        alert("Dakshina received with gratitude! 🙏");
                        navigate('/chat', { state: { newSession: true } });
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

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FFF6EB',
        }}>
            <Header backgroundImage="/svg/top_curve_dark.svg" />

            <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                <Box sx={{ width: '100%', maxWidth: 400 }}>
                    <IconButton onClick={() => navigate('/chat')} sx={{ mb: 2, color: '#F36A2F' }}>
                        <ArrowBackIcon />
                    </IconButton>

                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#333', mb: 1, textAlign: 'center' }}>
                        Add Dakshina
                    </Typography>

                    {!paymentEnabled && (
                        <Box sx={{ mb: 2, p: 1.5, bgcolor: '#FFEBEE', color: '#D32F2F', borderRadius: 2, fontSize: '0.85rem', fontWeight: 700, textAlign: 'center' }}>
                            ⚠️ Online payments are currently paused.
                        </Box>
                    )}

                    <Typography variant="body2" sx={{ color: '#666', mb: 4, textAlign: 'center' }}>
                        Your contribution supports our service.
                    </Typography>

                    {/* Predefined Amounts (Optional UX enhancement) */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {['11', '21', '51', '101'].map((val) => (
                            <Grid item xs={3} key={val}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => handleAmountSelect(val)}
                                    sx={{
                                        borderColor: amount === val ? '#F36A2F' : '#ddd',
                                        bgcolor: amount === val ? '#FFF0E3' : 'transparent',
                                        color: amount === val ? '#F36A2F' : '#666',
                                        fontWeight: 700,
                                        borderRadius: 2,
                                        '&:hover': {
                                            borderColor: '#F36A2F',
                                            bgcolor: '#FFF0E3'
                                        }
                                    }}
                                >
                                    ₹{val}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>

                    <TextField
                        fullWidth
                        label="Enter Amount (₹)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type="number"
                        InputProps={{
                            sx: { borderRadius: 2, bgcolor: 'white' }
                        }}
                        sx={{ mb: 4 }}
                    />

                    <Button
                        fullWidth
                        onClick={handleProceed}
                        disabled={loading || !paymentEnabled || !amount}
                        sx={{
                            bgcolor: '#F36A2F',
                            color: 'white',
                            py: 1.5,
                            borderRadius: 10,
                            fontSize: '1rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: '0 4px 15px rgba(243,106,47,0.3)',
                            mb: 2,
                            '&:hover': {
                                bgcolor: '#FF7A28',
                                boxShadow: '0 6px 20px rgba(243,106,47,0.4)',
                            },
                            '&.Mui-disabled': {
                                bgcolor: '#FFD7C4',
                                color: 'white'
                            }
                        }}
                    >
                        {loading ? "Processing..." : "Proceed to Payment"}
                    </Button>

                    <Button
                        fullWidth
                        onClick={() => navigate('/chat', { state: { newSession: true } })}
                        sx={{
                            color: '#F36A2F',
                            py: 1,
                            borderRadius: 10,
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            border: '1px solid #F36A2F',
                            '&:hover': {
                                bgcolor: 'rgba(243,106,47,0.05)',
                            }
                        }}
                    >
                        Start New Journey
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default Dakshina;
