import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { sendMessage, endChat, getChatHistory, submitFeedback, generateReport, createPaymentOrder, verifyPayment } from '../api';
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
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import PrimaryButton from '../components/PrimaryButton';
import Header from "../components/header";
import ChatInputFooter from "../components/ChatInputFooter";
import FeedbackDrawer from '../components/FeedbackDrawer';
import HamburgerMenu from '../components/HamburgerMenu';
import Dakshina from '../pages/Dakshina';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import ThankYou from '../components/Thankyou';

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

const MayaIntro = ({ name, content, mayaJson, rawResponse, time, jsonVisibility }) => {
    // Filter out fields we don't want to show in the UI debug block
    const getFilteredJson = (json) => {
        if (!json) return null;
        const { amount, usage, ...rest } = json;
        return rest;
    };

    return (
        <Box sx={{ pt: 4, pb: 1, width: "100%" }}>
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
                    top: -33,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    border: "3px solid #F36A2F",
                    bgcolor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <img src="/svg/maya.png" style={{ width: 50 }} alt="Maya" />
                </Box>

                <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#333', mt: 2, mb: 1.5, textAlign: 'left', fontWeight: 500 }}>
                    {name && <strong>Namaste {name}, </strong>}{content}
                </Typography>

                {/* JSON Output View for Maya Intro */}
                {jsonVisibility?.maya && mayaJson && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed rgba(243,106,47,0.3)' }}>
                        <Typography sx={{ fontSize: '0.6rem', color: '#999', fontWeight: 700, mb: 0.5 }}>RECEPTIONIST CLASSIFICATION</Typography>
                        <Box sx={{ bgcolor: 'rgba(0,0,0,0.03)', p: 1, borderRadius: 1, fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: '#666' }}>
                            {JSON.stringify(getFilteredJson(mayaJson), null, 2)}
                        </Box>
                    </Box>
                )}

                {time && (
                    <Typography sx={{
                        fontSize: '0.75rem',
                        opacity: 0.8,
                        position: 'absolute',
                        bottom: 6,
                        right: 12,
                        color: "#666",
                        fontWeight: 500
                    }}>
                        {time}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

const TranslationIndicator = ({ text }) => (
    <Box sx={{
        display: 'inline-block',
        backgroundColor: '#90EE90',
        color: '#2d5016',
        padding: '4px 12px',
        borderRadius: '8px',
        fontSize: '0.75rem',
        fontWeight: 500,
        marginTop: '10px',
        marginBottom: '8px'
    }}>
        {text}
    </Box>
);


const MayaTemplateBox = ({ name, content, buttonLabel, onButtonClick, loading, disabled }) => (
    <Box sx={{ px: 0, pt: 3, mb: 2.5, pb: 1, width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{
            position: "relative",
            border: "2px solid #F36A2F",
            borderRadius: 2,
            p: 2.5,
            bgcolor: "#fcebd3",
            width: '100%',
            maxWidth: 450
        }}>
            <Box sx={{
                position: "absolute",
                top: -24,
                left: "50%",
                transform: "translateX(-50%)",
                width: 50,
                height: 50,
                borderRadius: "50%",
                border: "3px solid #F36A2F",
                bgcolor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: 'hidden'
            }}>
                <img src="/svg/maya.png" style={{ width: 42 }} alt="Maya" />
            </Box>

            <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#333', mt: 1, mb: 1, textAlign: 'left', fontWeight: 500 }}>
                {name && name + ", "}{content}
            </Typography>

            {loading && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} sx={{ color: '#F36A2F' }} />
                    <Typography sx={{ fontSize: '0.85rem', color: '#F36A2F', fontWeight: 600 }}>Preparing your report...</Typography>
                </Box>
            )}

            {buttonLabel && !loading && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'right', position: 'absolute', bottom: -20, right: 10 }}>
                    <Button
                        onClick={onButtonClick}
                        // disabled={disabled}
                        startIcon={<DoneAllOutlinedIcon />}
                        sx={{
                            bgcolor: 'white',
                            color: '#54a170',
                            px: 3,
                            py: 0.8,
                            borderRadius: 10,
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            border: '2px solid #54a170',
                            //  border: disabled ? '2px solid #ccc' : '2px solid #54a170',
                            // '&:hover': { bgcolor: disabled ? '#e0e0e0' : '#f0fdf4' },
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
    <Box sx={{ px: 0, pt: 2, pb: 1, mb: 2.5, width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{
            position: "relative",
            bgcolor: '#54a170',
            borderRadius: 2,
            p: 2.5,
            width: '100%',
            maxWidth: '100%',
            color: 'white'
        }}>
            <Box sx={{
                position: "absolute",
                top: -24,
                left: "50%",
                transform: "translateX(-50%)",
                width: 50,
                height: 50,
                borderRadius: "50%",
                bgcolor: '#54a170',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: '3px solid #FFF6EB'
            }}>
                <DescriptionOutlinedIcon sx={{ color: 'white' }} />
            </Box>

            <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.5, mt: 1, mb: 1, textAlign: 'left', fontWeight: 500 }}>
                {content}
            </Typography>

            {buttonLabel && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'right', position: 'absolute', bottom: -20, right: 10 }}>
                    <Button
                        onClick={onButtonClick}
                        startIcon={<DescriptionOutlinedIcon />}
                        sx={{
                            bgcolor: 'white',
                            color: '#54a170',
                            border: '2px solid #54a170',
                            px: 3,
                            py: 0.8,
                            borderRadius: 10,
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            '&:hover': { transform: 'translateY(-2px)', '& svg': { transform: 'rotate(-10deg)' } }
                        }}
                    >
                        {buttonLabel}
                    </Button>
                </Box>
            )}
        </Box>
    </Box>
);

const SequentialResponse = ({ gurujiJson, animate = false, onComplete, messages, handleReportGeneration, reportState, activeCategory, userName, time }) => {
    const paras = [
        gurujiJson?.para1 || '',
        gurujiJson?.para2 || '',
        (gurujiJson?.para3 || '') + "<br><br>" + (gurujiJson?.follow_up || gurujiJson?.followup || "🤔 What's Next?")
    ].filter(p => p.trim() !== '');

    const [visibleCount, setVisibleCount] = useState(animate ? 0 : paras.length);
    const [isBuffering, setIsBuffering] = useState(animate ? true : false);
    const [waitMessage, setWaitMessage] = useState("");
    const textEndRef = useRef(null);
    const hasCalledComplete = useRef(false);

    const pleaseWaitMessages = [
        // "Please wait… checking your chart carefully.",
        // "One moment... ",
        "Astrologer is typing...",
        "Please give me a moment.",
    ];

    const scrollToBottom = () => {
        textEndRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const getDelayForText = (text) => {
        if (!text) return 2000;
        // Strip HTML tags to get pure text word count
        const cleanText = text.replace(/<[^>]*>/g, ' ');
        const wordCount = cleanText.trim().split(/\s+/).length;
        // Formula: min 3s, max 15s, 200ms per word
        return Math.max(3000, Math.min(15000, wordCount * 200));
    };

    // Effect 1: Manage Buffering State Transitions & Completion
    useEffect(() => {
        if (!animate) {
            if (onComplete && !hasCalledComplete.current) {
                hasCalledComplete.current = true;
                onComplete();
            }
            return;
        }

        // Cycle Complete
        if (visibleCount >= paras.length) {
            setIsBuffering(false);
            if (onComplete && !hasCalledComplete.current) {
                hasCalledComplete.current = true;
                onComplete();
            }
            return;
        }

        // If not buffering and not finished, trigger next buffer phase after pause
        if (!isBuffering) {
            const timer = setTimeout(() => {
                setIsBuffering(true);
                scrollToBottom();
            }, 1200); // Pause between bubbles
            return () => clearTimeout(timer);
        }
    }, [visibleCount, isBuffering, animate, paras.length, onComplete]);

    // Effect 2: Manage Typing Delay when Buffering
    useEffect(() => {
        if (isBuffering && animate && visibleCount < paras.length) {
            const currentPara = paras[visibleCount];
            const isLast = visibleCount === paras.length - 1;
            const delay = getDelayForText(currentPara);

            // Set waiting message
            const randomMsg = pleaseWaitMessages[Math.floor(Math.random() * pleaseWaitMessages.length)];
            setWaitMessage(randomMsg);

            scrollToBottom();

            const timer = setTimeout(() => {
                setIsBuffering(false);
                setVisibleCount(prev => prev + 1);
                scrollToBottom();
            }, delay);

            return () => clearTimeout(timer);
        }
    }, [isBuffering, animate, visibleCount]);

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
        p: '16px 12px 14px 16px',
        borderRadius: '10px',
        bgcolor: '#ff8338',
        color: 'white',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        border: 'none',
        position: 'relative',
        mb: 1.5,
        maxWidth: '85%',
    };

    return (
        <Box sx={{ width: '100%' }}>
            {paras.slice(0, visibleCount).map((para, idx) => (
                <Box key={idx} sx={bubbleSx}>
                    {/* Label Removed to match Maya's bubble style */}
                    <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.9rem' }} dangerouslySetInnerHTML={{ __html: para }} />

                    {idx === paras.length - 1 && reportState === 'IDLE' && (
                        <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'flex-start', position: 'relative' }}>
                            <ListItemButton
                                onClick={handleReportClick}
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: '#fff',
                                    color: '#ff8338',
                                    px: 2,
                                    py: 1,
                                    width: 'auto',
                                    border: '1px solid #ff8338',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        bgcolor: '#fff',
                                        color: '#ff8338',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 20px rgba(255,131,56,0.3)',
                                        '& svg': { transform: 'rotate(-10deg)' }
                                    },
                                    position: 'absolute',
                                    bottom: -48,
                                    right: 0,
                                }}
                            >
                                <DescriptionOutlinedIcon sx={{ fontSize: 20, mr: 1, transition: 'transform 0.3s' }} />
                                Get Detailed PDF Report
                            </ListItemButton>
                        </Box>
                    )}

                    {time && (
                        <Typography
                            sx={{
                                fontSize: '0.75rem',
                                opacity: 0.8,
                                position: 'absolute',
                                bottom: (idx === paras.length - 1 && reportState === 'IDLE') ? 32 : 4,
                                right: 8,
                                color: 'rgba(255,255,255,0.9)',
                                fontWeight: 500
                            }}
                        >
                            {time}
                        </Typography>
                    )}
                </Box>
            ))}

            {isBuffering && (
                <Box sx={{
                    position: 'fixed',
                    bottom: 80,
                    left: 0,
                    right: 0,
                    mx: 'auto',
                    width: { xs: '90%', sm: 400 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 0.5,
                    zIndex: 10,
                    pointerEvents: 'none'
                }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#a19b93', fontWeight: 'normal', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
                        {waitMessage}
                    </Typography>
                    {/* <Box sx={{ display: 'flex', gap: 1 }}>
                        <Box sx={{ width: 6, height: 6, bgcolor: '#ff8338', borderRadius: '50%', animation: 'bounce 1s infinite' }} />
                        <Box sx={{ width: 6, height: 6, bgcolor: '#ff8338', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }} />
                        <Box sx={{ width: 6, height: 6, bgcolor: '#ff8338', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }} />
                    </Box> */}
                </Box>
            )}

            {(reportState === 'CONFIRMING' || reportState === 'PREPARING' || reportState === 'READY') && (
                <MayaTemplateBox
                    name={userName.split(' ')[0]}
                    content={`detailed predictions on ${activeCategory || 'your query'} are chargeable ₹49.`}
                    buttonLabel={reportState === 'CONFIRMING' ? "Pay for detailed answer" : "Paid for detailed answer"}
                    onButtonClick={() => handleReportGeneration(activeCategory, 'PAY')}
                    loading={reportState === 'PAYING' || reportState === 'PREPARING'}
                    disabled={reportState === 'PAYING' || reportState === 'PREPARING' || reportState === 'READY'}
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
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [dakshinaOpen, setDakshinaOpen] = useState(false);
    const [thankYouOpen, setThankYouOpen] = useState(false);
    const [thankYouAction, setThankYouAction] = useState(null);
    const [thankYouData, setThankYouData] = useState({
        amount: 0,
        points: 0,
        title: 'Payment received',
        trustMsg: 'Your new wallet balance is',
        gratitudeMsg: ' ',
        addedLabel: ' ',
        showWave: true,
        referenceId: ''
    });

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
        { role: 'assistant', content: "Welcome! I'll connect you to our astrologer.\nYou may call him as 'Guruji'", assistant: 'maya', time: getCurrentTime(), timestamp: new Date().toISOString() }
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
    const [reportState, setReportState] = useState('IDLE'); // IDLE, CONFIRMING, PAYING, PREPARING, READY
    const [activeCategory, setActiveCategory] = useState(null);
    const [readyReportData, setReadyReportData] = useState(null);
    const [jsonVisibility, setJsonVisibility] = useState({ maya: false, guruji: false });
    const [isBuffering, setIsBuffering] = useState(false);
    const [waitMessage, setWaitMessage] = useState("");
    const messagesEndRef = useRef(null);
    const processedNewSession = useRef(false);

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
                // Scenario 1: User explicitly clicked "New Consultation"
                if (location.state?.newSession) {
                    console.log("DEBUG: Scenario 1 - New Consultation requested");
                    processedNewSession.current = true;
                    // Clear the state to prevent re-triggering on refresh
                    navigate(location.pathname, { replace: true, state: {} });
                    handleNewChat();
                    return;
                }

                // If we just processed a new session, skip this run (which is likely the trigger after navigate)
                if (processedNewSession.current) {
                    console.log("DEBUG: Skipping history load as new session was just initialized.");
                    processedNewSession.current = false;
                    return;
                }

                try {
                    const res = await getChatHistory(mobile);
                    console.log("DEBUG: getChatHistory response:", res.data);

                    if (res.data.sessions && res.data.sessions.length > 0) {
                        const mostRecentSession = res.data.sessions[0];
                        const currentLocalSid = localStorage.getItem('activeSessionId');
                        console.log("DEBUG: mostRecentSession:", mostRecentSession.session_id);
                        console.log("DEBUG: currentLocalSid:", currentLocalSid);

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
                    // If it's a 404/401/403, the interceptor will handle redirect to login
                }
            }
        };
        loadHistory();
    }, [location.state]);

    useEffect(() => {
        const fetchJsonSettings = async () => {
            try {
                const res = await api.get('/auth/json-settings');
                console.log("DEBUG: JSON settings fetched:", res.data);
                setJsonVisibility({
                    maya: res.data.maya_json_enabled,
                    guruji: res.data.guruji_json_enabled
                });
            } catch (err) {
                console.error("Failed to fetch JSON settings:", err);
            }
        };
        fetchJsonSettings();
    }, []);

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
                // If it's a 404/401/403, the interceptor will handle redirect
                // Otherwise, fallback to ready to unblock UI
                if (err.response?.status !== 404 && err.response?.status !== 401 && err.response?.status !== 403) {
                    setUserStatus('ready');
                }
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

    // Load Razorpay script
    useEffect(() => {
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

    const handleSend = async (msg = null) => {
        const text = typeof msg === 'string' ? msg : input;
        if (!text.trim() || loading || userStatus !== 'ready') return;

        const userMsg = { role: 'user', content: text, time: getCurrentTime(), timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        if (typeof msg !== 'string') setInput('');
        setLoading(true);
        setIsBuffering(true);
        setWaitMessage("Please wait...");

        try {
            const mobile = localStorage.getItem('mobile');
            if (!mobile) {
                // Session expired - redirect to login
                localStorage.clear();
                navigate('/');
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
            // If it's a 404/401/403, the interceptor will handle redirect to login
            // Only show error message for other types of errors
            if (err.response?.status !== 404 && err.response?.status !== 401 && err.response?.status !== 403) {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
            }
        } finally {
            setLoading(false);
            setIsBuffering(false);
            setWaitMessage("");
        }
    };



    //   const location = useLocation();
    //   const navigate = useNavigate();



    // Helper function to process report with wallet deduction
    const processReportWithWallet = async (mobile, category) => {
        setReportState('PREPARING');
        alert('₹49 will be deducted from your wallet. Generating your report...');

        setTimeout(async () => {
            try {
                const res = await generateReport(mobile, category || 'general');

                if (res.data.type === 'application/json') {
                    const reader = new FileReader();
                    reader.onload = async () => {
                        const result = JSON.parse(reader.result);
                        if (result.status === 'insufficient_funds') {
                            // Wallet was depleted between check and generation
                            // Fallback to Razorpay
                            alert("Insufficient wallet balance. Redirecting to payment gateway...");
                            console.log("Insufficient funds during generation, falling back to Razorpay");
                            await processReportWithRazorpay(mobile, category);
                        }
                    };
                    reader.readAsText(res.data);
                    return;
                }

                // Success
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
    };

    // Helper function to process report with Razorpay payment
    const processReportWithRazorpay = async (mobile, category) => {
        try {
            const amount = 49;

            // Create Razorpay order
            const orderRes = await createPaymentOrder(amount, mobile);
            const order = orderRes.data;

            // Open Razorpay
            const options = {
                key: order.key,
                amount: order.amount,
                currency: order.currency,
                name: "Astrology Guruji",
                description: "Detailed Report Payment",
                order_id: order.order_id,
                handler: async function (response) {
                    try {
                        // Verify payment
                        await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        // alert("Payment successful! Generating your report...");
                        setThankYouAction(null); // No special action on close for reports
                        setThankYouData({
                            amount: 49,
                            points: 4.9,
                            title: 'Payment received',
                            trustMsg: 'Your new wallet balance is',
                            gratitudeMsg: ' ',
                            addedLabel: ' ',
                            showWave: false,
                            referenceId: response.razorpay_order_id
                        });
                        setThankYouOpen(true);

                        // Payment successful - refresh wallet balance
                        const balanceRes = await api.get(`/auth/user-status/${mobile}`);
                        if (balanceRes.data.wallet_balance !== undefined) {
                            setWalletBalance(balanceRes.data.wallet_balance);
                        }

                        // Now generate report with updated wallet
                        await processReportWithWallet(mobile, category);

                    } catch (err) {
                        console.error("Payment verification failed", err);
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    contact: mobile,
                },
                theme: {
                    color: "#F36A2F"
                },
                modal: {
                    ondismiss: function () {
                        console.log("Razorpay modal dismissed");
                        setReportState('CONFIRMING');
                    }
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
            setReportState('CONFIRMING');
        }
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
            setReportState('PAYING');
            // Check wallet balance in real-time
            try {
                const resStatus = await api.get(`/auth/user-status/${mobile}?t=${Date.now()}`);
                const currentBalance = resStatus.data.wallet_balance || 0;
                setWalletBalance(currentBalance);

                if (currentBalance >= 49) {
                    // Sufficient funds - proceed with wallet deduction
                    await processReportWithWallet(mobile, category);
                } else {
                    // Insufficient funds - open Razorpay
                    // alert("Insufficient wallet balance. Redirecting to payment gateway...");
                    await processReportWithRazorpay(mobile, category);
                }
            } catch (err) {
                console.error("Balance check failed:", err);
                // Fallback to existing state check if API fails
                if (walletBalance >= 49) {
                    await processReportWithWallet(mobile, category);
                } else {
                    await processReportWithRazorpay(mobile, category);
                }
            }
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
            overflowY: "auto",
            "&::-webkit-scrollbar": { display: "block" },
            scrollbarWidth: "none",
        }}>
            <Header backgroundImage="/svg/top_curve_dark.svg" hscrollsx={{ position: 'relative' }} />

            <HamburgerMenu menubarsx={{ position: 'absolute' }} />


            {messages.some(m => m.assistant === 'guruji') && (
                <Box sx={{
                    position: 'sticky',
                    top: 20,
                    zIndex: 1101,
                    height: 0,
                    overflow: 'visible',
                    display: 'flex',
                    justifyContent: 'center',
                    mt: -5,
                    mb: 10,
                    pointerEvents: 'none'
                }}>
                    <Box sx={{ pointerEvents: 'auto' }}>
                        <PrimaryButton
                            label="End Consultation"
                            onClick={() => setFeedbackDrawerOpen(true)}
                            disabled={loading || messages.length < 1}
                            startIcon={<CancelIcon sx={{ fontSize: 24 }} />}
                            sx={{
                                width: 200,
                                height: 40,
                                borderRadius: 10,
                            }}
                        />
                    </Box>
                </Box>
            )}

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
                onSubmit={handleDrawerSubmit}
                onAddDakshina={() => {
                    setFeedbackDrawerOpen(false);
                    setTimeout(() => setDakshinaOpen(true), 150);
                }}
                onNewJourney={() => {
                    setFeedbackDrawerOpen(false);
                    handleNewChat();
                }}
            />

            <Dakshina
                open={dakshinaOpen}
                onClose={() => setDakshinaOpen(false)}
                onSuccess={(amt) => {
                    const amountPaid = parseFloat(amt);
                    const gratitudePoints = (amountPaid * 0.1).toFixed(1);

                    setDakshinaOpen(false);
                    setThankYouAction('NEW_CHAT');
                    setThankYouData({
                        amount: amountPaid,
                        points: gratitudePoints,
                        title: 'Dakshina received!',
                        trustMsg: 'Thank you for the trust and support!',
                        gratitudeMsg: "We've credited 10% of your Dakshina as gratitude points in your wallet",
                        addedLabel: 'added',
                        showWave: true,
                        referenceId: response.referenceId
                    });
                    setThankYouOpen(true);
                }}
            />


            {/* Chat Messages Area - Scrollable segment with visible scrollbar */}
            <Box
                sx={{
                    flex: 1,
                    // overflowY: "auto",
                    px: 3,
                    pb: 10,

                    // pt: 22,
                }}
            >
                {messages.map((msg, i) => {
                    if (msg.assistant === 'maya' && msg.content && msg.content.trim() !== '') {
                        return (
                            <MayaIntro
                                key={i}
                                name={i === 0 ? userName : null}
                                content={msg.content}
                                mayaJson={msg.mayaJson}
                                rawResponse={msg.rawResponse}
                                time={msg.time}
                                jsonVisibility={jsonVisibility}
                            />
                        );
                    }

                    const gurujiData = msg.gurujiJson || (msg.assistant === 'guruji' ? tryParseJson(msg.content) : null);

                    if (gurujiData && msg.assistant === 'guruji') {
                        return (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2, width: '100%' }}>
                                {/* <Box sx={{
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
                                </Box> */}
                                <Box sx={{ flex: 1, maxWidth: '100%' }}>
                                    <SequentialResponse
                                        gurujiJson={gurujiData}
                                        animate={msg.animating}
                                        messages={messages}
                                        handleReportGeneration={handleReportGeneration}
                                        reportState={reportState}
                                        activeCategory={activeCategory}
                                        userName={userName}
                                        time={msg.time}
                                    />
                                    {/* JSON Output View for Guruji Multi-bubble */}
                                    {(jsonVisibility.maya || jsonVisibility.guruji) && (msg.mayaJson || gurujiData) && (
                                        <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(0,0,0,0.4)', mb: 0.5, textTransform: 'uppercase' }}>
                                                Debug Data:
                                            </Typography>
                                            {(msg.mayaJson && jsonVisibility.maya) && (
                                                <Box sx={{ mb: 1 }}>
                                                    <Typography sx={{ fontSize: '0.6rem', color: '#999', fontWeight: 700 }}>RECEPTIONIST CLASSIFICATION</Typography>
                                                    <Box sx={{ bgcolor: 'rgba(0,0,0,0.03)', p: 1, borderRadius: 1, fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: '#666' }}>
                                                        {JSON.stringify((({ amount, usage, ...rest }) => rest)(msg.mayaJson), null, 2)}
                                                    </Box>
                                                </Box>
                                            )}
                                            {(gurujiData && jsonVisibility.guruji) && (
                                                <Box>
                                                    <Typography sx={{ fontSize: '0.6rem', color: '#999', fontWeight: 700 }}>ASTROLOGER STRUCTURED RESPONSE</Typography>
                                                    <Box sx={{ bgcolor: 'rgba(243,106,47,0.05)', p: 1, borderRadius: 1, fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: '#444', border: '1px solid rgba(243,106,47,0.1)' }}>
                                                        {JSON.stringify(gurujiData, null, 2)}
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                    )}

                                    {/* Translation Indicator for Guruji Response */}
                                    {msg.mayaJson?.language_detected &&
                                        msg.mayaJson.language_detected.toLowerCase() !== 'english' &&
                                        msg.mayaJson.category === 'PROCEED' && (
                                            <TranslationIndicator
                                                text={`Translated from English to ${msg.mayaJson.language_detected} for the user`}
                                            />
                                        )}
                                </Box>
                            </Box>
                        );
                    }

                    // Check for translation indicators
                    const nextMsg = messages[i + 1];
                    const langDetected = msg.role === 'user' ? nextMsg?.mayaJson?.language_detected : msg.mayaJson?.language_detected;
                    const category = msg.role === 'user' ? nextMsg?.mayaJson?.category : msg.mayaJson?.category;
                    const showTranslationIndicator = langDetected &&
                        langDetected.toLowerCase() !== 'english' &&
                        category === 'PROCEED';

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
                                        p: '12px 12px 24px 12px',
                                        borderRadius: '10px',
                                        bgcolor: msg.role === 'user' ? '#2f3148' : '#ff8338',
                                        color: 'white',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                        border: 'none',
                                        position: 'relative',
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
                                        {(msg.mayaJson && !msg.gurujiJson && jsonVisibility.maya) && (
                                            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed rgba(255,255,255,0.2)' }}>
                                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', mb: 0.5, textTransform: 'uppercase' }}>
                                                    Debug Data:
                                                </Typography>
                                                <Box sx={{ mb: 1 }}>
                                                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>RECEPTIONIST CLASSIFICATION</Typography>
                                                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 1, borderRadius: 1, fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: 'white' }}>
                                                        {JSON.stringify((({ amount, usage, ...rest }) => rest)(msg.mayaJson), null, 2)}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Automated chat fee label removed */}

                                        {/* Timestamp moved inside the bubble */}
                                        <Typography
                                            sx={{
                                                fontSize: '0.75rem',
                                                opacity: 0.8,
                                                position: 'absolute',
                                                bottom: 5,
                                                right: 8,
                                                color: 'rgba(255,255,255,0.9)',
                                                fontWeight: 500,
                                                pt: 1,
                                            }}
                                        >
                                            {msg.time}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Translation Indicator */}
                            {showTranslationIndicator && (
                                <TranslationIndicator
                                    text={msg.role === 'user'
                                        ? `${langDetected} detected, translated to English for astrologer.`
                                        : `Translated from English to ${langDetected} for the user`
                                    }
                                />
                            )}
                        </Box>
                    );
                })}

                {/* Global Wait Message (for both Maya and Guruji) */}
                {isBuffering && waitMessage && (
                    <Box sx={{
                        position: 'fixed',
                        bottom: 80,
                        left: 0,
                        right: 0,
                        mx: 'auto',
                        width: { xs: '90%', sm: 400 },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 0.5,
                        zIndex: 10,
                        pointerEvents: 'none'
                    }}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#a19b93', fontWeight: 'normal', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
                            {waitMessage}
                        </Typography>
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
                <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
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
            <ThankYou
                open={thankYouOpen}
                onClose={() => {
                    setThankYouOpen(false);
                    if (thankYouAction === 'NEW_CHAT') {
                        handleNewChat();
                    }
                    setThankYouAction(null);
                }}
                amount={thankYouData.amount}
                points={thankYouData.points}
                title={thankYouData.title}
                trustMsg={thankYouData.trustMsg}
                gratitudeMsg={thankYouData.gratitudeMsg}
                addedLabel={thankYouData.addedLabel}
                showWave={thankYouData.showWave}
                referenceId={thankYouData.referenceId}
            />
        </Box>
    );
};

export default Chat;
