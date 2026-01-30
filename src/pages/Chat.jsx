import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { sendMessage, endChat, getChatHistory, submitFeedback, generateReport } from '../api';
import axios from 'axios';

import {
    Box,
    Typography,
    IconButton,
    Rating,
    CircularProgress,
    TextField,
    Divider,
    ListItemButton,
    Button
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CancelIcon from '@mui/icons-material/Cancel';
import PrimaryButton from '../components/PrimaryButton';
import Header from "../components/header";
import ChatInputFooter from "../components/ChatInputFooter";
import FeedbackDrawer from '../components/FeedbackDrawer';
import HamburgerMenu from '../components/HamburgerMenu';
import Dakshina from '../pages/Dakshina';

const tryParseJson = (data) => {
    if (!data) return null;
    if (typeof data === 'object') return data;
    if (typeof data !== 'string') return null;
    const trimmed = data.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
            return JSON.parse(trimmed);
        } catch (e) {
            return null;
        }
    }
    return null;
};

const MayaIntro = ({ name, content, mayaJson, rawResponse, time }) => (
    <Box sx={{ px: 3, pt: 4, pb: 1, width: "100%" }}>
        <Box sx={{
            position: "relative",
            border: "2px solid #F36A2F",
            borderRadius: 2,
            p: 2,
            bgcolor: "#fcebd3",
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
            {/* Avatar */}
            <Box sx={{
                position: "absolute",
                top: -28,
                left: "50%",
                transform: "translateX(-50%)",
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: "5px solid #F36A2F",
                bgcolor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <img src="/svg/guruji_illustrated.svg" style={{ width: 45 }} alt="Maya" />
            </Box>

            <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#333', mt: 2, textAlign: 'left', fontWeight: 500 }}>
                {name && <strong>Namaste {name}, </strong>}{content}
            </Typography>

            {time && (
                <Typography sx={{
                    fontSize: 12,
                    opacity: 0.8,
                    textAlign: "right",
                    mt: 0.5,
                    color: "#666"
                }}>
                    {time}
                </Typography>
            )}
        </Box>
    </Box>
);


const MayaTemplateBox = ({ name, content, buttonLabel, onButtonClick, loading, disabled }) => (
    <Box sx={{ px: 3, pt: 3, pb: 1, width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{
            position: "relative",
            border: "1.5px solid #F36A2F",
            borderRadius: 4,
            p: 2.5,
            bgcolor: "#FFF6EB",
            width: '100%',
            maxWidth: 450
        }}>
            <Box sx={{
                position: "absolute",
                top: -24,
                left: "50%",
                transform: "translateX(-50%)",
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "3px solid #F36A2F",
                bgcolor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: 'hidden'
            }}>
                <img src="/svg/guruji_illustrated.svg" style={{ width: 38 }} alt="Maya" />
            </Box>

            <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#333', mt: 1, textAlign: 'left', fontWeight: 500 }}>
                {name && <strong>{name}, </strong>}{content}
            </Typography>

            {loading && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} sx={{ color: '#F36A2F' }} />
                    <Typography sx={{ fontSize: '0.85rem', color: '#F36A2F', fontWeight: 600 }}>Preparing your report...</Typography>
                </Box>
            )}

            {buttonLabel && !loading && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button
                        onClick={onButtonClick}
                        disabled={disabled}
                        startIcon={<img src="/svg/task_alt.svg" style={{ width: 18 }} alt="icon" />}
                        sx={{
                            bgcolor: disabled ? '#e0e0e0' : 'white',
                            color: disabled ? '#999' : '#10b981',
                            px: 3,
                            py: 0.8,
                            borderRadius: 10,
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            border: disabled ? '1.5px solid #ccc' : '1.5px solid #10b981',
                            '&:hover': { bgcolor: disabled ? '#e0e0e0' : '#f0fdf4' },
                            cursor: disabled ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {buttonLabel}
                    </Button>
                </Box>
            )}
        </Box>
    </Box>
);

const NotificationBox = ({ content, buttonLabel, onButtonClick }) => (
    <Box sx={{ px: 3, pt: 2, pb: 1, width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{
            position: "relative",
            bgcolor: '#4dab7c',
            borderRadius: 4,
            p: 2.5,
            width: '100%',
            maxWidth: 450,
            color: 'white'
        }}>
            <Box sx={{
                position: "absolute",
                top: -24,
                left: "50%",
                transform: "translateX(-50%)",
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: '#4dab7c',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: '4px solid #FFF6EB'
            }}>
                <PictureAsPdfIcon sx={{ color: 'white' }} />
            </Box>

            <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.5, mt: 1, textAlign: 'left', fontWeight: 500 }}>
                {content}
            </Typography>

            {buttonLabel && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button
                        onClick={onButtonClick}
                        startIcon={<PictureAsPdfIcon />}
                        sx={{
                            bgcolor: 'white',
                            color: '#4dab7c',
                            px: 3,
                            py: 0.8,
                            borderRadius: 10,
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#f0fdf4' }
                        }}
                    >
                        {buttonLabel}
                    </Button>
                </Box>
            )}
        </Box>
    </Box>
);

const SequentialResponse = ({ gurujiJson, animate = false, onComplete, messages, handleReportGeneration, reportState, activeCategory, userName }) => {
    const paras = [
        gurujiJson?.para1 || '',
        gurujiJson?.para2 || '',
        (gurujiJson?.para3 || '') + "<br><br>" + (gurujiJson?.follow_up || gurujiJson?.followup || "🤔 What's Next?")
    ].filter(p => p.trim() !== '');

    const [visibleCount, setVisibleCount] = useState(animate ? 0 : paras.length);
    const [isBuffering, setIsBuffering] = useState(animate ? true : false);
    const textEndRef = useRef(null);

    const scrollToBottom = () => {
        textEndRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    useEffect(() => {
        if (!animate) {
            if (onComplete) onComplete();
            return;
        }

        let currentIdx = 0;
        const showNext = () => {
            if (currentIdx >= paras.length) {
                setIsBuffering(false);
                if (onComplete) onComplete();
                return;
            }
            setIsBuffering(true);
            scrollToBottom();
            setTimeout(() => {
                setIsBuffering(false);
                setVisibleCount(prev => prev + 1);
                currentIdx++;
                scrollToBottom();
                setTimeout(showNext, 2000);
            }, 3000);
        };
        showNext();
    }, [gurujiJson, animate]);

    useEffect(() => {
        if (reportState !== 'IDLE') {
            scrollToBottom();
        }
    }, [reportState]);

    const handleReportClick = () => {
        const lastMsg = messages[messages.length - 1];
        handleReportGeneration(lastMsg?.mayaJson?.category || 'general', 'START');
    };

    const bubbleSx = {
        p: '16px 12px 8px 16px',
        borderRadius: '10px',
        bgcolor: '#ff8338',
        color: 'white',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        border: 'none',
        position: 'relative',
        mb: 1.5,
        maxWidth: '100%',
    };

    return (
        <Box sx={{ width: '100%' }}>
            {paras.slice(0, visibleCount).map((para, idx) => (
                <Box key={idx} sx={bubbleSx}>
                    {/* Label Removed to match Maya's bubble style */}
                    <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.9rem' }} dangerouslySetInnerHTML={{ __html: para }} />

                    {idx === paras.length - 1 && reportState === 'IDLE' && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
                            <ListItemButton onClick={handleReportClick} sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', px: 2, py: 1, width: 'auto', border: '1px solid rgba(255,255,255,0.4)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                                <PictureAsPdfIcon sx={{ fontSize: 20, mr: 1 }} />
                                Get Detailed PDF Report
                            </ListItemButton>
                        </Box>
                    )}
                </Box>
            ))}

            {isBuffering && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2, ml: 1 }}>
                    <Box sx={{ width: 6, height: 6, bgcolor: '#ff8338', borderRadius: '50%', animation: 'bounce 1s infinite' }} />
                    <Box sx={{ width: 6, height: 6, bgcolor: '#ff8338', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }} />
                    <Box sx={{ width: 6, height: 6, bgcolor: '#ff8338', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }} />
                </Box>
            )}

            {(reportState === 'CONFIRMING' || reportState === 'PREPARING' || reportState === 'READY') && (
                <MayaTemplateBox
                    name={userName.split(' ')[0]}
                    content={`detailed predictions on ${activeCategory || 'your query'} are chargeable ₹49.`}
                    buttonLabel="Paid for detailed answer"
                    onButtonClick={() => handleReportGeneration(activeCategory, 'PAY')}
                    loading={reportState === 'PREPARING'}
                    disabled={reportState === 'PREPARING' || reportState === 'READY'}
                />
            )}

            {(reportState === 'PREPARING' || reportState === 'READY') && (
                <MayaTemplateBox
                    content={<>The detailed answer will be available in the <strong>"Detailed Reports"</strong> section of your home screen.<br /><br />Once prepared you'll be notified here.</>}
                    loading={reportState === 'PREPARING'}
                />
            )}

            {reportState === 'READY' && (
                <NotificationBox
                    content={`The detailed answer on ${activeCategory || 'your query'} is ready.`}
                    buttonLabel="Download Report"
                    onButtonClick={() => handleReportGeneration(activeCategory, 'DOWNLOAD')}
                />
            )}

            <div ref={textEndRef} style={{ height: 1 }} />
        </Box>
    );
};


const Chat = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [feedbackDrawerOpen, setFeedbackDrawerOpen] = useState(false);

    // Helper to format time strings
    // Helper to format time strings
    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        try {
            let date;
            // Handle numeric timestamp (check if seconds or milliseconds)
            if (typeof dateStr === 'number' || (typeof dateStr === 'string' && !isNaN(dateStr))) {
                let ts = Number(dateStr);
                // If timestamp is in seconds (e.g. 17xxxxxxxx), convert to ms
                if (ts < 10000000000) ts *= 1000;
                date = new Date(ts);
            } else {
                date = new Date(dateStr);
            }

            if (isNaN(date.getTime())) return ''; // Invalid date
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
        } catch (e) {
            return '';
        }
    };

    // Helper to get current time string
    const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

    const [messages, setMessages] = useState([
        { role: 'assistant', content: "welcome! I'll connect you to our astrologer.\nYou may call him as 'Guruji'", assistant: 'maya', time: getCurrentTime(), timestamp: new Date().toISOString() }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const [userStatus, setUserStatus] = useState('checking'); // 'checking', 'processing', 'ready', 'failed'
    const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
    const [walletBalance, setWalletBalance] = useState(0);
    const [sessionId, setSessionId] = useState(localStorage.getItem('activeSessionId') || `SESS_${Date.now()}`);
    const [showInactivityPrompt, setShowInactivityPrompt] = useState(false);
    const [feedback, setFeedback] = useState({ rating: 0, comment: '' });
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    // Multi-step report flow state
    const [reportState, setReportState] = useState('IDLE'); // IDLE, CONFIRMING, PREPARING, READY
    const [activeCategory, setActiveCategory] = useState(null);
    const [readyReportData, setReadyReportData] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    // Load Chat History (Smart Resume Logic)
    useEffect(() => {
        const loadHistory = async () => {
            const mobile = localStorage.getItem('mobile');
            console.log("DEBUG: loadHistory triggered for mobile:", mobile);
            console.log("DEBUG: location.state:", location.state);

            if (mobile) {
                try {
                    const res = await getChatHistory(mobile);
                    console.log("DEBUG: getChatHistory response:", res.data);

                    if (res.data.sessions && res.data.sessions.length > 0) {
                        const mostRecentSession = res.data.sessions[0];
                        const currentLocalSid = localStorage.getItem('activeSessionId');
                        console.log("DEBUG: mostRecentSession:", mostRecentSession.session_id);
                        console.log("DEBUG: currentLocalSid:", currentLocalSid);

                        // Scenario 1: User explicitly clicked "New Consultation"
                        if (location.state?.newSession) {
                            console.log("DEBUG: Scenario 1 - New Consultation requested");
                            // Clear the state to prevent re-triggering on refresh
                            navigate(location.pathname, { replace: true, state: {} });
                            handleNewChat();
                            return;
                        }

                        // Scenario 2: Most recent session on server is already ended
                        if (mostRecentSession.is_ended) {
                            console.log("DEBUG: Scenario 2 - Most recent session on server is ended. Starting fresh.");
                            // ALWAYS start fresh if the server says the latest session is ended
                            handleNewChat();
                            return;
                        }

                        // Scenario 3: Load history (Relaxed logic + Parsing)
                        const history = mostRecentSession.messages;
                        if (history && history.length > 0) {
                            console.log("DEBUG: Scenario 3 - Resuming Session:", mostRecentSession.session_id);
                            // Use Relaxed logic: Load it regardless of local ID mismatch
                            setSessionId(mostRecentSession.session_id);
                            if (!currentLocalSid || currentLocalSid !== mostRecentSession.session_id) {
                                localStorage.setItem('activeSessionId', mostRecentSession.session_id);
                            }

                            const mappedHistory = history.map(msg => ({
                                ...msg,
                                time: msg.time || formatTime(msg.timestamp) || formatTime(msg.created_at) || '',
                                gurujiJson: tryParseJson(msg.guruji_json || msg.gurujiJson) || (msg.assistant === 'guruji' ? tryParseJson(msg.content) : null),
                                mayaJson: tryParseJson(msg.maya_json || msg.mayaJson),
                                animating: false
                            }));

                            console.log("DEBUG: mappedHistory set, count:", mappedHistory.length);
                            // Set messages to history (Replacing the initial welcome message)
                            setMessages(mappedHistory);
                        } else {
                            console.log("DEBUG: No history messages found in most recent session.");
                        }
                    } else {
                        console.log("DEBUG: No sessions found for this user.");
                    }
                } catch (err) {
                    console.error("Failed to load chat history:", err);
                }
            }
        };
        loadHistory();
    }, [location.state]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const checkUserStatus = async () => {
            const mobile = localStorage.getItem('mobile');
            if (!mobile) {
                navigate('/');
                return;
            }

            try {
                // Use the configured api instance instead of raw axios
                // Add a cache-buster just in case
                const res = await api.get(`/auth/user-status/${mobile}?t=${Date.now()}`);
                const status = res.data.status;
                setUserStatus(status);
                if (res.data.user_profile?.name) {
                    setUserName(res.data.user_profile.name);
                    localStorage.setItem('userName', res.data.user_profile.name);
                }
                if (res.data.wallet_balance !== undefined) {
                    setWalletBalance(res.data.wallet_balance);
                }

                if (status === 'processing') {
                    const pollInterval = setInterval(async () => {
                        try {
                            const pollRes = await api.get(`/auth/user-status/${mobile}?t=${Date.now()}`);
                            const newStatus = pollRes.data.status;
                            setUserStatus(newStatus);
                            if (pollRes.data.wallet_balance !== undefined) {
                                setWalletBalance(pollRes.data.wallet_balance);
                            }
                            if (newStatus === 'ready' || newStatus === 'failed') {
                                clearInterval(pollInterval);
                            }
                        } catch (err) {
                            console.error('Status polling error:', err);
                        }
                    }, 3000);
                    return () => clearInterval(pollInterval);
                }
            } catch (err) {
                console.error('Status check error:', err);
                // Fallback to ready after a failure to unblock UI if possible
                setUserStatus('ready');
            }
        };

        // Fallback: If still checking after 10 seconds, force ready to allow manual attempt
        const fallbackTimer = setTimeout(() => {
            setUserStatus(prev => prev === 'checking' ? 'ready' : prev);
        }, 10000);

        checkUserStatus();
        return () => clearTimeout(fallbackTimer);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleNewChat = () => {
        const newSid = `SESS_${Date.now()}`;
        setMessages([
            { role: 'assistant', content: "welcome! \n\nI'll connect you to our astrologer.You may call him as 'Guruji'", assistant: 'maya', time: getCurrentTime(), timestamp: new Date().toISOString() }
        ]);
        setSessionId(newSid);
        localStorage.setItem('activeSessionId', newSid);
        setSummary(null);
        setFeedback({ rating: 0, comment: '' });
        setFeedbackSubmitted(false);
    };

    const handleEndChat = async (keepFeedback = false) => {
        if (messages.length < 1) return;
        setShowInactivityPrompt(false);
        setLoading(true);
        try {
            const mobile = localStorage.getItem('mobile');
            const res = await endChat(mobile, messages, sessionId);
            setSummary(res.data.summary);
            // Clear local session ID so it doesn't try to resume an ended session
            localStorage.removeItem('activeSessionId');
            if (!keepFeedback) {
                setFeedback({ rating: 0, comment: '' });
                setFeedbackSubmitted(false);
            }
        } catch (err) {
            console.error("End Chat Error:", err);
            alert("Failed to summarize chat. You can still logout.");
        } finally {
            setLoading(false);
        }
    };

    const handleDrawerSubmit = async (rating, comment) => {
        setSubmittingFeedback(true);
        try {
            const mobile = localStorage.getItem('mobile');
            await submitFeedback({
                mobile,
                session_id: sessionId,
                rating,
                feedback: comment
            });
            setFeedbackSubmitted(true);
            setFeedback({ rating, comment });

            // Fire and forget endChat
            endChat(mobile, messages, sessionId).catch(e => console.error("Silent end chat error:", e));

        } catch (err) {
            console.error("Feedback error:", err);
            alert("Failed to submit feedback.");
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const handleFeedbackSubmit = async () => {
        if (feedback.rating === 0) {
            alert("Please provide a rating.");
            return;
        }
        setSubmittingFeedback(true);
        try {
            const mobile = localStorage.getItem('mobile');
            await submitFeedback({
                mobile,
                session_id: sessionId,
                rating: feedback.rating,
                feedback: feedback.comment
            });
            setFeedbackSubmitted(true);
        } catch (err) {
            console.error("Feedback error:", err);
            alert("Failed to submit feedback.");
        } finally {
            setSubmittingFeedback(false);
        }
    };

    useEffect(() => {
        if (summary || showInactivityPrompt) return;
        const timer = setTimeout(() => {
            if (messages.length >= 2) {
                setShowInactivityPrompt(true);
            }
        }, 10 * 60 * 1000);
        return () => clearTimeout(timer);
    }, [messages, input, summary, showInactivityPrompt]);

    // Background scroll lock when modals are open
    useEffect(() => {
        if (summary || showInactivityPrompt) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [summary, showInactivityPrompt]);

    const handleSend = async (msg = null) => {
        const text = typeof msg === 'string' ? msg : input;
        if (!text.trim() || loading || userStatus !== 'ready') return;

        const userMsg = { role: 'user', content: text, time: getCurrentTime(), timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        if (typeof msg !== 'string') setInput('');
        setLoading(true);

        try {
            const mobile = localStorage.getItem('mobile');
            if (!mobile) {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Session error. Please log in again.' }]);
                setLoading(false);
                return;
            }
            const history = messages.slice(1);
            const res = await sendMessage(mobile, text, history, sessionId);
            const { answer, metrics, context, assistant, wallet_balance, amount, maya_json, guruji_json, timestamp } = res.data;

            if (wallet_balance !== undefined) setWalletBalance(wallet_balance);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: answer,
                assistant: assistant || 'guruji',
                metrics,
                context,
                amount,
                rawResponse: res.data,
                mayaJson: maya_json,
                gurujiJson: guruji_json,
                animating: true,
                time: timestamp ? formatTime(timestamp) : getCurrentTime(),
                timestamp: timestamp || new Date().toISOString()
            }]);
        } catch (err) {
            console.error("Chat Error:", err);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [dakshinaOpen, setDakshinaOpen] = useState(false);


    //   const location = useLocation();
    //   const navigate = useNavigate();

    const showMenu = [
        "/chat",
        "/profile",
        "/history",
        "/dakshina",
        "/wallet",
        "/wallet/recharge",
    ].includes(location.pathname);

    const toggleDrawer = (open) => (event) => {
        if (
            event.type === "keydown" &&
            (event.key === "Tab" || event.key === "Shift")
        ) {
            return;
        }
        setDrawerOpen(open);
    };

    const handleNavigation = (path) => {
        if (path === 'logout') {
            localStorage.clear();
            navigate('/');
        } else if (path === '/chat-new') {
            navigate('/chat', { state: { newSession: true } });
        } else {
            navigate(path);
        }
        setDrawerOpen(false);
    };

    const handleReportGeneration = async (category, action) => {
        const mobile = localStorage.getItem('mobile');
        if (!mobile) return;

        if (action === 'START') {
            setActiveCategory(category);
            setReportState('CONFIRMING');
            return;
        }

        if (action === 'PAY') {
            if (!window.confirm(`Do you wish to pay ₹49 for the detailed prediction?`)) return;

            setReportState('PREPARING');

            // Simulate 20-second report generation delay
            setTimeout(async () => {
                try {
                    const res = await generateReport(mobile, category || 'general');

                    if (res.data.type === 'application/json') {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const result = JSON.parse(reader.result);
                            if (result.status === 'insufficient_funds') {
                                alert(`Insufficient coins. You need ${result.required_amount} coins for this report.`);
                                setReportState('CONFIRMING');
                            }
                        };
                        reader.readAsText(res.data);
                        return;
                    }

                    // Report is ready
                    setReadyReportData(res.data);
                    setReportState('READY');

                    // Refresh balance
                    const balanceRes = await api.get(`/auth/user-status/${mobile}`);
                    if (balanceRes.data.wallet_balance !== undefined) {
                        setWalletBalance(balanceRes.data.wallet_balance);
                    }
                } catch (err) {
                    console.error("Report Error:", err);
                    alert("Failed to generate report. Please try again.");
                    setReportState('CONFIRMING');
                }
            }, 20000); // 20 seconds delay

            return;
        }

        if (action === 'DOWNLOAD') {
            if (!readyReportData) return;
            const url = window.URL.createObjectURL(new Blob([readyReportData]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Astrology_Report_${category || 'General'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
    };

    return (
        <Box sx={{
            // minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FFF6EB',
            height: "100vh",
            position: 'relative',
            // width: '100%'
        }}>
            <Header backgroundImage="/svg/top_curve_dark.svg" />
            {showMenu && (
                <Box
                    onClick={toggleDrawer(true)}
                    sx={{
                        position: "absolute",
                        top: 50,
                        left: 15,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        height: 20,
                        cursor: "pointer",
                        zIndex: 3,
                    }}
                >
                    {[1, 2, 3].map((i) => (
                        <Box
                            key={i}
                            sx={{
                                width: 30,
                                height: "0.2rem",
                                bgcolor: "text.primary",
                            }}
                        />
                    ))}
                </Box>
            )}

            <HamburgerMenu
                open={drawerOpen}
                toggleDrawer={setDrawerOpen}
                handleNavigation={handleNavigation}

            />


            <PrimaryButton
                label="End Consultation"
                onClick={() => setFeedbackDrawerOpen(true)}
                disabled={loading || messages.length < 1}
                startIcon={<CancelIcon sx={{ fontSize: 24 }} />}
                sx={{
                    position: "absolute",
                    top: 135,
                    left: 0,
                    right: 0,
                    m: "auto",
                    width: 200,
                    height: 40,
                    borderRadius: 10,
                    zIndex: 10
                }}
            />

            {/* <FeedbackDrawer
                open={feedbackDrawerOpen}
                onClose={() => setFeedbackDrawerOpen(false)}
                onSubmit={handleDrawerSubmit}
                onAddDakshina={() => {
                    setFeedbackDrawerOpen(false);
                    navigate('/dakshina');
                }}
                onNewJourney={() => {
                    setFeedbackDrawerOpen(false);
                    handleNewChat();
                }}
            /> */}



            <FeedbackDrawer
                open={feedbackDrawerOpen}
                onClose={() => setFeedbackDrawerOpen(false)}
                onAddDakshina={() => {
                    setFeedbackDrawerOpen(false);
                    setTimeout(() => setDakshinaOpen(true), 150);
                }}
            />

            <Dakshina
                open={dakshinaOpen}
                onClose={() => setDakshinaOpen(false)}
            />



            {/* Chat Messages Area - Scrollable segment with visible scrollbar */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    px: 3,
                    pb: 2.5,
                    "&::-webkit-scrollbar": { display: "block" },
                    scrollbarWidth: "thin",
                }}
            >
                {messages.map((msg, i) => {
                    const isFirstMaya = i === 0 && msg.assistant === 'maya';

                    if (isFirstMaya) {
                        return (
                            <MayaIntro
                                key={i}
                                name={userName}
                                content={msg.content}
                                mayaJson={msg.mayaJson}
                                rawResponse={msg.rawResponse}
                                time={msg.time}
                            />
                        );
                    }

                    const gurujiData = msg.gurujiJson || (msg.assistant === 'guruji' ? tryParseJson(msg.content) : null);

                    if (gurujiData) {
                        return (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2, width: '100%' }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    bgcolor: 'white',
                                    border: '3px solid #F36A2F',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                    <img src="/svg/guruji_illustrated.svg" style={{ width: 32 }} alt="G" />
                                </Box>
                                <Box sx={{ flex: 1, maxWidth: '85%' }}>
                                    <SequentialResponse
                                        gurujiJson={gurujiData}
                                        animate={msg.animating}
                                        messages={messages}
                                        handleReportGeneration={handleReportGeneration}
                                        reportState={reportState}
                                        activeCategory={activeCategory}
                                        userName={userName}
                                    />
                                    {/* JSON Output View for Guruji Multi-bubble */}
                                    {(gurujiData || msg.mayaJson) && (
                                        <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(0,0,0,0.4)', mb: 0.5, textTransform: 'uppercase' }}>
                                                Debug Data:
                                            </Typography>
                                            {msg.mayaJson && (
                                                <Box sx={{ mb: 1 }}>
                                                    <Typography sx={{ fontSize: '0.6rem', color: '#999', fontWeight: 700 }}>RECEPTIONIST CLASSIFICATION</Typography>
                                                    <Box sx={{ bgcolor: 'rgba(0,0,0,0.03)', p: 1, borderRadius: 1, fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: '#666' }}>
                                                        {JSON.stringify(msg.mayaJson, null, 2)}
                                                    </Box>
                                                </Box>
                                            )}
                                            {gurujiData && (
                                                <Box>
                                                    <Typography sx={{ fontSize: '0.6rem', color: '#999', fontWeight: 700 }}>ASTROLOGER STRUCTURED RESPONSE</Typography>
                                                    <Box sx={{ bgcolor: 'rgba(243,106,47,0.05)', p: 1, borderRadius: 1, fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: '#444', border: '1px solid rgba(243,106,47,0.1)' }}>
                                                        {JSON.stringify(gurujiData, null, 2)}
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                    <Typography sx={{ fontSize: 12, opacity: 0.6, textAlign: "right", px: 1, mt: 0.5 }}>
                                        {msg.time}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    }

                    return (
                        <Box
                            key={i}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '100%',
                                mb: 2
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.5,
                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                                maxWidth: '90%',

                            }}>
                                {/* {msg.role === 'assistant' && (
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        bgcolor: 'white',
                                        border: '3px solid #F36A2F',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}>
                                        {msg.assistant === 'maya' ? (
                                            <Typography sx={{ fontWeight: 800, color: '#F36A2F', fontSize: '0.9rem' }}>M</Typography>
                                        ) : (
                                            <img src="/svg/guruji_illustrated.svg" style={{ width: 32 }} alt="G" />
                                        )}
                                    </Box>
                                )} */}

                                {/* Only render bubble if there is content */}
                                {msg.content && msg.content.trim() !== '' && (
                                    <Box sx={{
                                        // p: 2,
                                        p: '16px 12px 8px 16px',
                                        // borderRadius: msg.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                                        borderRadius: '10px',
                                        bgcolor: msg.role === 'user' ? '#2f3148' : '#ff8338',
                                        color: 'white',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                        border: 'none',
                                        position: 'relative',
                                        // width: 'fit-content',
                                        maxWidth: '85%',
                                        minWidth: '100px',
                                        overflowWrap: "break-word",
                                        wordBreak: "break-word",
                                        whiteSpace: "pre-line",
                                    }}>
                                        {msg.role === 'assistant' && msg.assistant !== 'maya' && (
                                            <Typography sx={{
                                                fontSize: '0.65rem',
                                                fontWeight: 900,
                                                textTransform: 'uppercase',
                                                mb: 0.5,
                                                color: 'rgba(255,255,255,0.9)',
                                                letterSpacing: 1,

                                            }}>
                                                Astrology Guruji
                                            </Typography>
                                        )}

                                        <Typography
                                            variant="body2"
                                            sx={{ lineHeight: 1.6, fontSize: '0.9rem' }}
                                            dangerouslySetInnerHTML={{ __html: msg.content }}
                                        />

                                        {/* JSON Output View (for regular messages) */}
                                        {(msg.mayaJson && !msg.gurujiJson) && (
                                            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed rgba(255,255,255,0.2)' }}>
                                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', mb: 0.5, textTransform: 'uppercase' }}>
                                                    Debug Data:
                                                </Typography>
                                                <Box sx={{ mb: 1 }}>
                                                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>RECEPTIONIST CLASSIFICATION</Typography>
                                                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 1, borderRadius: 1, fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: 'white' }}>
                                                        {JSON.stringify(msg.mayaJson, null, 2)}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Automated chat fee label removed */}
                                    </Box>
                                )}
                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        opacity: 0.8,
                                        textAlign: "right",
                                        mt: 0.5,
                                    }}
                                >
                                    {msg.time}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
                {loading && (
                    <Box sx={{ display: 'flex', gap: 1, p: 2, bgcolor: 'white', borderRadius: '15px 15px 15px 0', width: 'fit-content', border: '1px solid #FFEDD5' }}>
                        <Box sx={{ width: 8, height: 8, bgcolor: '#F36A2F', borderRadius: '50%', animation: 'bounce 1s infinite' }} />
                        <Box sx={{ width: 8, height: 8, bgcolor: '#F36A2F', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }} />
                        <Box sx={{ width: 8, height: 8, bgcolor: '#F36A2F', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }} />
                    </Box>
                )}
                <div ref={messagesEndRef} />
            </Box>

            <ChatInputFooter
                onSend={handleSend}
                userStatus={userStatus}
                loading={loading}
                summary={summary}
            />
            {/* Same overlays as before (Inactivity, Summary, Drawer) */}
            {/* ... preserved ... */}

            {/* Inactivity Prompt Overlay */}
            {showInactivityPrompt && !summary && (
                <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                    <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 4, textAlign: 'center', maxWidth: 400, boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '1px solid #F36A2F' }}>
                        <Box sx={{ width: 80, height: 80, bgcolor: '#FFF6EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                            <CancelIcon sx={{ fontSize: 50, color: '#F36A2F' }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#333' }}>Still here?</Typography>
                        <Typography variant="body2" sx={{ color: '#666', mb: 4 }}>
                            Guruji is ready when you are. Would you like to wrap up this session and receive your summary?
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <ListItemButton onClick={() => setShowInactivityPrompt(false)} sx={{ borderRadius: 2, textAlign: 'center', justifyContent: 'center', border: '1px solid #ccc' }}>
                                Continue
                            </ListItemButton>
                            <ListItemButton onClick={() => { setShowInactivityPrompt(false); setFeedbackDrawerOpen(true); }} sx={{ borderRadius: 2, textAlign: 'center', justifyContent: 'center', bgcolor: '#F36A2F', color: 'white', '&:hover': { bgcolor: '#FF7A28' } }}>
                                End & Review
                            </ListItemButton>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Summary & Feedback Modal */}
            {summary && (
                <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                    <Box sx={{
                        bgcolor: 'white',
                        p: 4,
                        borderRadius: 5,
                        maxWidth: 500,
                        width: '100%',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                        position: 'relative',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': { display: 'none' },
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }}>
                        <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2, zIndex: 2 }}>
                            <img src="/svg/header_stars.svg" style={{ width: 100, opacity: 0.1 }} alt="Stars" />
                        </Box>

                        {!feedbackSubmitted ? (
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#F36A2F' }}>Session Insights</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#999', display: 'block', mb: 3 }}>COMPLETED CONSULTATION</Typography>

                                <Box sx={{ bgcolor: '#FFF6EB', p: 3, borderRadius: 3, borderLeft: '6px solid #F36A2F', mb: 4 }}>
                                    <Typography sx={{ fontStyle: 'italic', fontSize: '0.95rem', color: '#555', lineHeight: 1.7 }}>
                                        "{summary}"
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 4 }}>
                                    <Typography sx={{ fontWeight: 800, color: '#333', mb: 1 }}>Rate Guruji's Wisdom</Typography>
                                    <Rating
                                        value={feedback.rating}
                                        onChange={(_, v) => setFeedback(prev => ({ ...prev, rating: v }))}
                                        size="large"
                                        sx={{ color: '#F36A2F' }}
                                    />
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="Add a thought..."
                                        value={feedback.comment}
                                        onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                                        sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fbfbfb' } }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <ListItemButton onClick={() => setSummary(null)} sx={{ borderRadius: 2, justifyContent: 'center', bgcolor: '#F3F4F6' }}>
                                        Review Chat
                                    </ListItemButton>
                                    <ListItemButton
                                        onClick={handleFeedbackSubmit}
                                        disabled={submittingFeedback || feedback.rating === 0}
                                        sx={{ borderRadius: 2, justifyContent: 'center', bgcolor: '#F36A2F', color: 'white', '&:hover': { bgcolor: '#FF7A28' } }}
                                    >
                                        {submittingFeedback ? <CircularProgress size={20} color="inherit" /> : 'Submit & Close'}
                                    </ListItemButton>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#F36A2F' }}>Session Insights</Typography>
                                <Box sx={{ bgcolor: '#FFF6EB', p: 3, borderRadius: 3, borderLeft: '6px solid #F36A2F', mb: 4, textAlign: 'left' }}>
                                    <Typography sx={{ fontStyle: 'italic', fontSize: '0.95rem', color: '#555', lineHeight: 1.7 }}>
                                        "{summary}"
                                    </Typography>
                                </Box>

                                <Box sx={{ width: 80, height: 80, bgcolor: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                                    <Box sx={{ color: '#4CAF50', fontSize: 40 }}>✓</Box>
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>Gratitude!</Typography>
                                <Typography variant="body2" sx={{ color: '#666', mb: 4 }}>
                                    Your feedback has been cast into the heavens.
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    <ListItemButton onClick={handleNewChat} sx={{ borderRadius: 2, justifyContent: 'center', bgcolor: '#F36A2F', color: 'white' }}>
                                        New Journey
                                    </ListItemButton>
                                    <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, justifyContent: 'center', bgcolor: '#f0f0f0' }}>
                                        Logout
                                    </ListItemButton>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}


            <style>{`
@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
}
`}</style>
        </Box>
    );
};

export default Chat;
