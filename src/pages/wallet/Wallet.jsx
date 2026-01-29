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

    const rechargeOptions = [
        { price: 99, points: 100 },
        { price: 199, points: 210 },
        { price: 499, points: 530 },
        { price: 999, points: 1070 },
        { price: 1999, points: 2150 },
        { price: 4999, points: 5450 },
        { price: 9999, points: 11000 },
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
                <Subheader title="My Wallet" showBack onBack={() => navigate('/chat')} />
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
                    <Typography sx={{ fontWeight: 500, my: 1, color: '#53300e', fontSize: '2.5rem' }}>1050<span style={{ fontSize: '1.5rem', fontWeight: 400 }}> pts</span></Typography>
                </Box>

                {/* Recharge Section */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ color: '#eb3c34', fontWeight: 700, fontSize: '1rem' }}>Recharge:</Typography>
                        {/* <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#54a170' }}>
                            <Typography sx={{ fontWeight: 700, textDecoration: 'underline', fontSize: '0.9rem', mr: 0.5 }}>
                                Show previous recharges
                            </Typography>
                            <Box component="span" sx={{ fontSize: '1.2rem', fontWeight: 800 }}>›</Box>
                        </Box> */}
                    </Box>

                    {/* Table Container */}
                    <Box sx={{ borderRadius: 1, overflow: 'hidden', bgcolor: '#fff' }}>
                        {/* Table Header */}
                        <Box sx={{ display: 'flex', bgcolor: '#54a170', p: 1.5 }}>
                            <Typography sx={{ flex: 1, color: '#fff', fontWeight: 600 }}>Recharge for</Typography>
                            <Typography sx={{ flex: 1, color: '#fff', fontWeight: 600 }}>You get</Typography>
                            <Box sx={{ width: 100 }} />
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
                                    ₹ {option.price} <Box component="span" sx={{ fontWeight: 400, fontSize: '1rem', color: '#5b5b5b' }}>+ GST</Box>
                                </Typography>
                                <Typography sx={{ flex: 1, fontWeight: 700, color: '#5b5b5b', fontSize: '1.2rem' }}>
                                    {option.points.toLocaleString()} pts
                                </Typography>
                                <PrimaryButton
                                    label="Recharge"
                                    variant="contained"
                                    onClick={() => navigate('/wallet/recharge', { state: { amount: option.price } })}
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


            </Box>
        </Box>
    );
};

export default Wallet;
