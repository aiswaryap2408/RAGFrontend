import React, { useState, useEffect } from 'react';
import { getBalance, getTransactionHistory } from '../../api';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Divider } from '@mui/material';
import Subheader from '../../components/subheader';
import PrimaryButton from '../../components/PrimaryButton';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const RechargeHistory = () => {
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
            // Filter only credit transactions (recharges)
            const rechargeHistory = (historyRes.data.history || []).filter(tx => tx.type === 'credit');
            setHistory(rechargeHistory);
        } catch (error) {
            console.error("Error fetching wallet data:", error);
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
                <Subheader title="Recharge history" showBack />
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
                {/* Balance Card */}
                <Card sx={{
                    borderRadius: 3,
                    mb: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    border: '1px solid #eee'
                }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccountBalanceWalletIcon sx={{ color: '#eb3c34', mr: 1, fontSize: 30 }} />
                            <Typography sx={{ fontWeight: 700, color: '#eb3c34', fontSize: '1.1rem' }}>
                                Wallet balance: <Box component="span" sx={{ color: '#333' }}>₹{balance.toLocaleString()} </Box>
                            </Typography>
                        </Box>
                        <PrimaryButton
                            label="Recharge now"
                            onClick={() => navigate('/wallet')}
                            sx={{
                                bgcolor: '#54a170',
                                color: '#fff',
                                borderRadius: 50,
                                textTransform: 'none',
                                fontWeight: 500,
                                p: 1,
                                width: '130px',
                                fontSize: '0.9rem',
                                '&:hover': { bgcolor: '#458a5c' }
                            }}
                        />
                    </CardContent>
                </Card>

                {/* History List */}
                <Box>
                    {loading ? (
                        <Typography sx={{ textAlign: 'center', mt: 4, color: '#666' }}>Loading...</Typography>
                    ) : history.length === 0 ? (
                        <Typography sx={{ textAlign: 'center', mt: 4, color: '#666' }}>No recharge history found.</Typography>
                    ) : (
                        history.map((tx, index) => (
                            <Card key={index} sx={{
                                borderRadius: 3,
                                mb: 2,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                border: '1px solid #eee'
                            }}>
                                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                    <Typography sx={{ fontWeight: 700, color: '#1a237e', fontSize: '1.1rem', mb: 0.5 }}>
                                        Wallet recharge
                                    </Typography>
                                    <Typography sx={{ fontSize: '1rem', color: '#333', mb: 1, fontWeight: 500 }}>
                                        Amount: ₹{tx.amount}
                                    </Typography>

                                    <Typography sx={{ fontSize: '0.9rem', color: '#666', mb: 0.5 }}>
                                        On: {new Date(tx.timestamp * 1000).toLocaleString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </Typography>

                                    <Typography sx={{ fontSize: '0.9rem', color: '#666', mb: 0.5 }}>
                                        Using email: {localStorage.getItem('userEmail') || 'N/A'}
                                    </Typography>

                                    <Typography sx={{ fontSize: '0.9rem', color: '#666', mb: 0.5 }}>
                                        Using email: {localStorage.getItem('userEmail') || 'N/A'}
                                    </Typography>

                                    <Typography sx={{
                                        fontSize: '0.9rem',
                                        color: tx.status === 'success' ? '#54a170' : tx.status === 'failed' ? '#eb3c34' : '#666',
                                        fontWeight: 600,
                                        mb: 0.5
                                    }}>
                                        Status: {tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'N/A'}
                                    </Typography>

                                    <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>
                                        Tx ID: {tx.transaction_id || tx.gateway_id || 'N/A'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default RechargeHistory;
