import React from 'react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ bgcolor: '#FFF6EB', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header backgroundImage="/svg/top_curve_dark.svg" />

            <Box sx={{ position: 'absolute', top: 50, left: 15, zIndex: 10 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
                    <ArrowBackIcon />
                </IconButton>
            </Box>

            <Box sx={{ p: 3, mt: 8, flex: 1, overflowY: 'auto' }}>
                <Typography variant="h5" sx={{ color: '#F36A2F', fontWeight: 700, mb: 3, textAlign: 'center' }}>
                    Privacy Policy
                </Typography>

                <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.7)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>1. Information Collection</Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: '#444', lineHeight: 1.6 }}>
                        We collect personal information such as your name, email address, mobile number, and birth details (date, time, and place of birth) to provide accurate astrological services.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>2. Use of Information</Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: '#444', lineHeight: 1.6 }}>
                        Your information is used solely to generate astrological reports, facilitate consultations with Guruji, and manage your account balance and transactions.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>3. Data Security</Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: '#444', lineHeight: 1.6 }}>
                        We implement strict security measures to protect your data from unauthorized access, alteration, or disclosure. Chat histories are stored securely and are only accessible to you.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>4. Third-Party Services</Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: '#444', lineHeight: 1.6 }}>
                        We do not sell or trade your personal information to third parties. We may use trusted third-party services to process payments or for technical support, under strict confidentiality agreements.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>5. Your Rights</Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: '#444', lineHeight: 1.6 }}>
                        You have the right to access, correct, or delete your personal information at any time through the application settings or by contacting our support team.
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 4, fontStyle: 'italic', textAlign: 'center', color: '#666' }}>
                        Last Updated: January 2026
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default PrivacyPolicy;
