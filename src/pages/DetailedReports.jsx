import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    CircularProgress,
    Button
} from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import Subheader from '../components/subheader';
import ConsultFooter from "../components/consultFooter";
import { useNavigate } from 'react-router-dom';
import { getUserReports, downloadReportById, getBalance } from "../api";

const DetailedReports = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);
    const [balance, setBalance] = useState(0);
    const mobile = localStorage.getItem("mobile");

    useEffect(() => {
        if (mobile) {
            fetchData();
        } else {
            navigate('/');
        }
    }, [mobile]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reportsRes, balanceRes] = await Promise.all([
                getUserReports(mobile),
                getBalance(mobile)
            ]);
            setReports(reportsRes.data.reports || []);
            setBalance(balanceRes.data.balance || 0);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (reportId, category) => {
        setDownloadingId(reportId);
        try {
            const response = await downloadReportById(reportId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_${category}_${reportId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download report. Please try again.");
        } finally {
            setDownloadingId(null);
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    return (
        <Box sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FFF6EB',
            overflow: 'hidden',
        }}>
            <Box sx={{ position: 'relative', flexShrink: 0, zIndex: 100, bgcolor: '#FFF6EB' }}>
                <Subheader title={'Detailed Reports'} showBack onBack={() => navigate('/chat')} />
            </Box>

            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                position: 'relative',
                zIndex: 10,
                mt: 9,
                pt: 2,
                px: 2,
                pb: 10,
                maxWidth: 800,
                mx: "auto",
                width: "100%",
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
            }}>
                {/* <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontWeight: 700, color: '#eb3c34', fontSize: '1rem' }}>Current wallet balance:</Typography>
                    <Typography sx={{ fontWeight: 500, color: '#53300e', fontSize: '2.5rem' }}>
                        {balance.toLocaleString()}<span style={{ fontSize: '1.5rem', fontWeight: 400 }}> pts</span>
                    </Typography>
                </Box> */}

                <Typography variant="h5" sx={{ fontWeight: 600, color: "#dc5d35", mb: 2 }}>
                    My Detailed Reports
                </Typography>

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                        <CircularProgress sx={{ color: "#dc5d35" }} />
                    </Box>
                ) : reports.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: "center", bgcolor: "rgba(255, 255, 255, 0.5)", borderRadius: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                            You haven't purchased any detailed reports yet.
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{ mt: 2, bgcolor: "#54a170", "&:hover": { bgcolor: "#458a5c" }, borderRadius: 50 }}
                            onClick={() => navigate('/chat')}
                        >
                            Get Your First Report
                        </Button>
                    </Paper>
                ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: 3, bgcolor: "rgba(255, 255, 255, 0.8)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                        <Table>
                            <TableHead sx={{ bgcolor: "#ffdaa7" }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }} align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reports.map((report) => (
                                    <TableRow key={report.report_id} hover>
                                        <TableCell>{formatDate(report.timestamp)}</TableCell>
                                        <TableCell sx={{ textTransform: "capitalize" }}>{report.category}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                onClick={() => handleDownload(report.report_id, report.category)}
                                                disabled={downloadingId === report.report_id}
                                                sx={{ color: "#54a170" }}
                                            >
                                                {downloadingId === report.report_id ? (
                                                    <CircularProgress size={24} color="inherit" />
                                                ) : (
                                                    <DownloadIcon />
                                                )}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            <ConsultFooter />
        </Box>
    );
};

export default DetailedReports;
