import React from 'react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import Subheader from '../components/subheader';


const TermsAndConditions = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ bgcolor: '#FFF6EB', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Subheader title={"Terms and Conditions"} showBack onBack={() => navigate(-1)} />

            {/* <Box sx={{ position: 'absolute', top: 50, left: 15, zIndex: 10 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
                    <ArrowBackIcon />
                </IconButton>
            </Box> */}

            <Box sx={{ p: 3, mt: 8, flex: 1, overflowY: 'auto' }}>
                <Typography variant="h5" sx={{ color: '#F36A2F', fontWeight: 700, mb: 3, textAlign: 'center' }}>
                    Terms and Conditions
                </Typography>

                <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.7)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>1. Acceptance of Terms</Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: '#444', lineHeight: 1.6 }}>
                        By accessing and using this Astrology Guruji application, you agree to be bound by these Terms and Conditions. If you do not agree, please refrain from using the service.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>2. Nature of Service</Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: '#444', lineHeight: 1.6 }}>
                        The readings and consultations provided are for entertainment and guidance purposes only. They do not constitute legal, financial, or medical advice. Decisions made based on these readings are the sole responsibility of the user.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>3. Privacy and Data</Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: '#444', lineHeight: 1.6 }}>
                        Your personal details and birth data are kept confidential as per our Privacy Policy. We do not share your private consultation history with third parties without your consent.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>4. Payments and Refunds</Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: '#444', lineHeight: 1.6 }}>
                        Consultations are subject to the wallet balance. Recharges are non-refundable once the service has been utilized. Any discrepancies in billing should be reported to support immediately.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>5. User Conduct</Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: '#444', lineHeight: 1.6 }}>
                        Users agree not to use the platform for any unlawful purposes or to transmit harmful or offensive content. We reserve the right to terminate access for users who violate these guidelines.
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 4, fontStyle: 'italic', textAlign: 'center', color: '#666' }}>
                        Last Updated: January 2026
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default TermsAndConditions;
