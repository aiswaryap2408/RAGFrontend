import React from 'react';
import { Box, Typography, IconButton, Paper, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import Subheader from '../components/subheader';
import PrimaryButton from '../components/PrimaryButton';
import KeyboardDoubleArrowRightOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowRightOutlined';



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

            <Box sx={{ p: 3, px: 5, mt: 1.5, flex: 1, overflowY: 'auto', color: '#533000' }}>
                <Typography sx={{ color: '#000', fontWeight: 500, mb: 3, textAlign: 'center', bgcolor: '#f1d3a9', py: 2, borderRadius: 1 }}>
                    IMPORTANT
                </Typography>

                <Box >
                    <Typography sx={{ fontWeight: 600, mb: 2 }}>Findastro is now AI powered and the option for choosing your astrologer is no longer available.</Typography>
                    <Typography sx={{ mb: 2 }}>
                        Our AI system (MAYA) automatically connects with the astrologer available without revealing the astrologer identity.
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                        If you wish to consult with the same astrologer you previously consulted, <b>please download our Clickastro app</b>. There you'll get the same astrologers list and your wallet balance will also be retained.
                    </Typography>

                    <Typography sx={{ mb: 2 }}>
                        If you continue in this new Findastro app, you can still use the same wallet balance.
                    </Typography>

                    <Typography sx={{ fontWeight: 600, mb: 2 }}>
                        You'll receive this same message in your WhatsApp too.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', my: 4 }}>
                    <Box
                        component="img"
                        src={'/svg/guruji_illustrated.svg'}
                        sx={{
                            width: '55px',
                            height: '55px',
                            objectFit: 'contain',
                            border: '2px solid #dc5d35',
                            borderRadius: 10,
                        }}
                    />
                    <Button
                        fullWidth
                        component="a"
                        href="https://play.google.com/store/apps/details?id=com.clickastro.android.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            bgcolor: '#fff',
                            color: '#666666',
                            textTransform: 'none',
                            fontWeight: 500,
                            borderRadius: 5,
                            py: 1.5,
                            px: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            width: 'auto',
                            fontSize: 16,
                            border: '2px solid #dc5d35',
                            '&:hover': { bgcolor: '#e0c298' }
                        }}
                    >
                        <Box component="img" src="/svg/Gplay-store.png" sx={{ width: 24, height: 24, }} alt="" />
                        Download Clickastro app
                    </Button>
                </Box>
                <PrimaryButton
                    label="Continue to new Findastro app"
                    fullWidth
                    onClick={() => navigate('/chat')}
                    sx={{
                        borderRadius: 5,
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 2,
                        py: 0,
                        fontSize: 16,
                        mt: 2,
                        width: 'auto',
                        display: 'flex',
                        margin: '10px auto',
                        '& .MuiButton-endIcon svg': {
                            fontSize: '50px'
                        }
                    }}
                    endIcon={<KeyboardDoubleArrowRightOutlinedIcon />}
                />
            </Box>
        </Box>
    );
};

export default TermsAndConditions;