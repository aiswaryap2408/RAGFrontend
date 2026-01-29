import React, { useState } from "react";
import {
    Box,
    Typography,
    Drawer,
    InputBase,
    IconButton,
    Button,
    Grid
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GurujiImage from "../components/gurujiImg";
import PrimaryButton from "../components/PrimaryButton";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

const Dakshina = ({ open, onClose }) => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState("");
    const [paymentEnabled, setPaymentEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const mobile = localStorage.getItem('mobile');

    React.useEffect(() => {
        if (open) {
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
        }
    }, [open]);

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
                        onClose();
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
                    px: 2.5,
                    pt: 5,
                    pb: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                },
            }}
        >
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <GurujiImage sx={{ mb: 1, width: 150 }} />
                <Typography sx={{ mb: 2, textAlign: "center", fontSize: 16 }}>
                    Let there be happiness in your life!
                </Typography>
                <Typography
                    sx={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: "#dc5d35",
                        mb: 1,
                        textAlign: "center",
                    }}
                >
                    Dakshina
                </Typography>
                <Box
                    sx={{
                        p: 2,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        borderRadius: 3,
                        border: "2px solid #F36A2F",
                        bgcolor: '#fcebd3',
                        mb: 3
                    }}
                >
                    <Box sx={{ width: "100%", maxWidth: 400, textAlign: 'center' }}>
                        <Typography sx={{ mb: 2, fontSize: "0.95rem", color: '#444' }}>
                            Our astrology services are supported by the 'Dakshina' given by people like you.
                        </Typography>

                        {!paymentEnabled && (
                            <Box sx={{ mb: 2, p: 1, bgcolor: '#FFEBEE', color: '#D32F2F', borderRadius: 1.5, fontSize: '0.8rem', fontWeight: 700 }}>
                                ⚠️ Payments are currently paused.
                            </Box>
                        )}

                        <Grid container spacing={1} sx={{ mb: 2 }}>
                            {['11', '21', '51', '101'].map((val) => (
                                <Grid item xs={3} key={val}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleAmountSelect(val)}
                                        sx={{
                                            borderColor: amount === val ? '#F36A2F' : '#ddd',
                                            bgcolor: amount === val ? '#FFF0E3' : 'white',
                                            color: amount === val ? '#F36A2F' : '#666',
                                            fontWeight: 700,
                                            borderRadius: 2,
                                        }}
                                    >
                                        ₹{val}
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>

                        <Box sx={{ display: "flex", alignItems: "center", mb: 2, justifyContent: "center" }}>
                            <CurrencyRupeeIcon sx={{ color: "#707070", mr: 1 }} />
                            <InputBase
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                type="number"
                                placeholder="Amount"
                                sx={{
                                    width: "50%",
                                    bgcolor: "white",
                                    borderRadius: 1.5,
                                    px: 2,
                                    py: 1,
                                    fontSize: '1.2rem',
                                    fontWeight: 700,
                                    border: '1px solid #ddd'
                                }}
                            />
                        </Box>

                        <PrimaryButton
                            label={loading ? "Connecting..." : "Give Dakshina to Guruji"}
                            onClick={handleProceed}
                            disabled={loading || !paymentEnabled || !amount}
                            sx={{
                                bgcolor: "#54a170",
                                color: "white",
                                py: 1.2,
                                borderRadius: 10,
                                fontWeight: 700,
                                boxShadow: "0 4px 15px rgba(84,161,112,0.3)",
                                width: "100%",
                            }}
                        />
                    </Box>
                </Box>

                <Button
                    onClick={onClose}
                    sx={{ color: '#999', textTransform: 'none', fontWeight: 700 }}
                >
                    Close
                </Button>
            </Box>
        </Drawer>
    );
};

export default Dakshina;

