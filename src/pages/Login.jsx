import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOtp } from '../api';
import { Box, Typography, TextField, ThemeProvider } from "@mui/material";
import Header from "../components/header";
import PrimaryButton from "../components/PrimaryButton";
import GurujiImage from "../components/gurujiImg";
import theme from "../theme/theme";

const Login = () => {
    const navigate = useNavigate();
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const mobile = localStorage.getItem('mobile');
        const token = localStorage.getItem('token');
        if (mobile && token) {
            navigate('/chat');
        }
    }, [navigate]);

    const handleMobileSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');

        if (!/^\d{10}$/.test(mobile)) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        setLoading(true);
        try {
            await sendOtp(mobile);
            localStorage.setItem('mobile', mobile);
            navigate('/verify');
        } catch (err) {
            console.error("API Error details:", err);
            const msg = err.response?.data?.detail;
            const errorMsg = Array.isArray(msg) ? msg[0].msg : (msg || err.message);
            setError(`Failed to send OTP: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />

            {/* Content Container - ensuring it takes up remaining height and centers content */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    px: 3,
                    pb: 5,
                    mt: 18,
                }}
            >
                <Box sx={{ mb: 2.5 }}>
                    <GurujiImage />

                    <Typography fontSize={16} mt={1} color="text.primary" sx={{ fontFamily: "'Century Gothic', sans-serif" }}>
                        Welcome to <strong style={{ color: "#dc5d35" }}>Findastro</strong>!
                    </Typography>
                </Box>

                <Typography
                    mt={4}
                    mb={.5}
                    fontSize={15}
                    fontWeight={700}
                    color="primary"
                >
                    Login / Sign-in with your phone number:
                </Typography>



                {/* Phone Input Box */}
                <Box
                    sx={{
                        display: "flex",
                        border: "2px solid #f2a28a",
                        borderRadius: 1, // Slightly more rounded
                        overflow: "hidden",
                        bgcolor: "#fff",
                        width: "100%",
                        maxWidth: 350,
                        // mb: 1.5,
                        boxShadow: '0 4px 12px rgba(242,162,138,0.1)'
                    }}
                >
                    <Box sx={{ px: 1.5, py: 1.5, fontSize: 16, color: "#666" }}>
                        +91
                    </Box>
                    <TextField
                        variant="standard"
                        fullWidth
                        InputProps={{
                            disableUnderline: true,
                            sx: { px: 2, height: '100%', fontSize: 16, fontWeight: 500 }
                        }}
                        // placeholder="Mobile number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        inputProps={{ maxLength: 10, type: 'tel' }}
                        onKeyPress={(e) => e.key === 'Enter' && handleMobileSubmit()}
                    />

                </Box>
                {error && (
                    <Typography color="error" variant="body2" >
                        {error}
                    </Typography>
                )}


                <PrimaryButton
                    label={loading ? "Sending..." : "Get OTP"}
                    sx={{ width: { xs: '100%', sm: '200px' }, height: 50, borderRadius: 1, fontSize: 15, mt: 1.5 }}
                    onClick={handleMobileSubmit}
                    disabled={loading}
                />
            </Box>
        </>
    );
};

export default Login;
