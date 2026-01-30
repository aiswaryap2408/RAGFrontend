import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    IconButton,
    Button,
    Grid,
    TextField,
    Drawer,
    InputBase,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import Header from "../components/header";
import GurujiImage from "../components/gurujiImg";
import PrimaryButton from "../components/PrimaryButton";

const Dakshina = ({ open, onClose }) => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [paymentEnabled, setPaymentEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const mobile = localStorage.getItem('mobile');

    useEffect(() => {
        checkPaymentStatus();
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const checkPaymentStatus = async () => {
        try {
            const { getSystemSettings } = await import('../api');
            const { data } = await getSystemSettings();
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
                key: order.key,
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
                        if (onClose) onClose();
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

            if (window.Razorpay) {
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    alert("Payment Failed: " + response.error.description);
                });
                rzp.open();
            } else {
                alert("Payment gateway not loaded. Please refresh.");
            }

        } catch (error) {
            console.error("Payment init failed:", error);
            alert("Failed to initiate payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: open ? '#fff4e5' : '#FFF6EB', minHeight: open ? 'auto' : '100vh' }}>

            <Box sx={{ width: '100%', maxWidth: 400 }}>
                {!open && (
                    <IconButton onClick={() => navigate('/chat')} sx={{ mb: 2, color: '#F36A2F' }}>
                        <ArrowBackIcon />
                    </IconButton>
                )}

                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <GurujiImage sx={{ mb: 1, width: 120, mx: 'auto' }} />
                    <Typography sx={{ mb: 1, fontSize: 16 }}>
                        Varun, let there be happiness in your life!
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#F36A2F', mb: 1 }}>
                        Dakshina
                    </Typography>

                    {!paymentEnabled && (
                        <Box sx={{ mb: 2, p: 1.5, bgcolor: '#FFEBEE', color: '#D32F2F', borderRadius: 2, fontSize: '0.85rem', fontWeight: 700 }}>
                            ⚠️ Online payments are currently paused.
                        </Box>
                    )}

                    <Typography variant="body2" sx={{ color: '#666', mb: 4 }}>
                        Our astrology services are supported by the 'Dakshina' given by people like you.
                    </Typography>
                </Box>

                {/* Predefined Amounts */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {['11', '21', '51', '101'].map((val) => (
                        <Grid item xs={3} key={val}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => handleAmountSelect(val)}
                                sx={{
                                    borderColor: amount === val ? '#F36A2F' : '#ddd',
                                    bgcolor: amount === val ? '#FFF0E3' : 'white',
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

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, bgcolor: 'white', borderRadius: 2, p: 1, border: '1px solid #ddd' }}>
                    <CurrencyRupeeIcon sx={{ color: "#707070", ml: 1 }} />
                    <InputBase
                        fullWidth
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type="number"
                        sx={{ px: 1, fontWeight: 700, fontSize: '1.2rem' }}
                    />
                </Box>

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
                    {loading ? "Processing..." : "Give Dakshina to Guruji"}
                </Button>

                <Button
                    fullWidth
                    onClick={() => {
                        if (onClose) onClose();
                        navigate('/chat', { state: { newSession: true } });
                    }}
                    sx={{
                        color: '#F36A2F',
                        py: 1,
                        borderRadius: 10,
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        border: '1px solid #F36A2F',
                        mb: 2,
                        '&:hover': {
                            bgcolor: 'rgba(243,106,47,0.05)',
                        }
                    }}
                >
                    Start New Journey
                </Button>

                {open && (
                    <Button
                        fullWidth
                        onClick={onClose}
                        sx={{
                            color: "#b4b4b4",
                            py: 1,
                            borderRadius: 10,
                            fontSize: "0.9rem",
                            textTransform: "none",
                            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                        }}
                    >
                        Close
                    </Button>
                )}
            </Box>
        </Box>
    );

    if (open !== undefined) {
        return (
            <Drawer
                anchor="bottom"
                open={open}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    "& .MuiDrawer-paper": {
                        bgcolor: "#fff4e5",
                        borderTopLeftRadius: 35,
                        borderTopRightRadius: 35,
                        maxWidth: 450,
                        width: "100%",
                        mx: "auto",
                        overflow: 'hidden'
                    },
                }}
            >
                {content}
            </Drawer>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FFF6EB',
        }}>
            <Header backgroundImage="/svg/top_curve_dark.svg" />
            {content}
        </Box>
    );
};

export default Dakshina;
