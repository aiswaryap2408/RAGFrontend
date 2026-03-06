import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { sendMessage, endChat, startSession, getChatHistory, submitFeedback, generateReport, createPaymentOrder, verifyPayment } from '../api';
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
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import PrimaryButton from '../components/PrimaryButton';
import Header from "../components/header";
import ChatInputFooter from "../components/ChatInputFooter";
import FeedbackDrawer from '../components/FeedbackDrawer';
import HamburgerMenu from '../components/HamburgerMenu';
import Dakshina from '../pages/Dakshina';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
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

const MayaIntro = ({ title, name, content, mayaJson, psycologyJson, rawResponse, time, jsonVisibility, onLabelClick }) => {
    // Filter out fields we don't want to show in the UI debug block
    const getFilteredJson = (json) => {
        if (!json) return null;
        const { amount, usage, ...rest } = json;
        return rest;
    };

    const isSafetyWarning = mayaJson?.is_safety_warning;
    const safetyTitle = mayaJson?.safety_title;
    const safetyMessage = mayaJson?.safety_message;

    return (
        <Box sx={{ pt: 4, pb: 3, width: "100%" }}>
            <Typography sx={{
                fontSize: '0.75rem',
                color: '#acacac',
                fontWeight: 400,
                opacity: 1,
                transition: 'opacity 0.3s ease-in-out',
                position: 'relative',
                pointerEvents: 'none',
                mb: 0,
                mr: 1,
                textAlign: 'right',
            }}>
                MAYA
            </Typography>
            <Box sx={{
                position: "relative",
                // border: "2px solid #F36A2F",
                borderRadius: 2,
                p: 2,
                bgcolor: "#fece8d",
                border: "none",
                // boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>

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

                {name && (
                    <Typography sx={{
                        position: 'absolute',
                        top: 8,
                        right: 12,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'rgba(0,0,0,0.5)'
                    }}>
                        {name}
                    </Typography>
                )}

                {isSafetyWarning ? (
                    <Box sx={{ mt: 2, mb: 1.5 }}>
                        <Typography sx={{ fontSize: '1.05rem', lineHeight: 1.4, color: '#333', mb: 1, textAlign: 'center', fontWeight: 700 }}>
                            {safetyTitle}
                        </Typography>
                        <Typography sx={{ fontSize: '0.92rem', lineHeight: 1.5, color: '#333', textAlign: 'center', fontWeight: 500 }}>
                            {safetyMessage}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ mt: 1, mb: 1 }}> {/* Increased mt to avoid overlap with name */}
                        {title && (
                            <Typography sx={{ fontSize: '1.05rem', lineHeight: 1.4, color: '#333', mb: 1, fontWeight: 700, textAlign: 'center' }}>
                                {title}
                            </Typography>
                        )}
                        <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#333', textAlign: 'left', fontWeight: 500, whiteSpace: 'pre-line' }}>
                            {content}
                        </Typography>
                    </Box>
                )}

                {/* JSON Output View for Maya Intro */}
                {(jsonVisibility?.maya || jsonVisibility?.psycology) && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed rgba(243,106,47,0.3)', textAlign: 'center', display: 'flex', gap: 2, justifyContent: 'center' }}>
                        {(mayaJson && jsonVisibility?.maya) && (
                            <Typography
                                onClick={() => onLabelClick?.(mayaJson, 'RECEPTIONIST CLASSIFICATION')}
                                sx={{
                                    fontSize: '0.65rem',
                                    color: '#F36A2F',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    textDecoration: 'underline',
                                    '&:hover': { opacity: 0.8 }
                                }}
                            >
                                View Maya JSON
                            </Typography>
                        )}
                        {(psycologyJson && jsonVisibility?.psycology) && (
                            <Typography
                                onClick={() => onLabelClick?.(psycologyJson, 'USER PSYCHOLOGY')}
                                sx={{
                                    fontSize: '0.65rem',
                                    color: '#F36A2F',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    textDecoration: 'underline',
                                    '&:hover': { opacity: 0.8 }
                                }}
                            >
                                View Psychology
                            </Typography>
                        )}
                    </Box>
                )}

                {time && (
                    <Typography sx={{
                        fontSize: '0.7rem',
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

const TranslationIndicator = ({ text, sx }) => (
    <Box sx={{
        display: 'inline-block',
        // backgroundColor: '#b0f88d',
        color: '#acacac',
        // padding: '0px 12px',
        // borderRadius: '8px',
        fontSize: '0.7rem',
        fontWeight: 400,
        marginTop: '2px',
        // marginBottom: '8px',
        ...sx
    }}>
        {text}
    </Box>
);

const FadeInRoleLabel = ({ isUser, name, ml, mr }) => (
    <Typography
        sx={{
            fontSize: '0.75rem',
            color: '#acacac',
            fontWeight: 400,
            pointerEvents: 'none',
            mb: 0,
        }}
    >
        {name}
    </Typography>
);


// Helper to safely render text with bold (**text**) and newlines (\n)
const FormattedText = ({ text, sx }) => {
    if (!text) return null;

    // Split by newlines first
    return (
        <Typography sx={sx} variant="body2">
            {text.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                    {/* Split each line by **bold** markers */}
                    {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j}>{part.slice(2, -2)}</strong>;
                        }
                        return <span key={j}>{part}</span>;
                    })}
                    {i < text.split('\n').length - 1 && <br />}
                </React.Fragment>
            ))}
        </Typography>
    );
};

const MayaTemplateBox = ({ name, content, buttonLabel, onButtonClick, loading, disabled }) => (
    <Box sx={{ px: 0, pt: 3, mb: 2.5, pb: 1, width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{
            position: "relative",
            // border: "2px solid #F36A2F",
            borderRadius: 2,
            p: 2.5,
            bgcolor: "#fece8d",
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

const SequentialResponse = ({ gurujiJson, bubbles: bubblesProp = [], delays = [], animate = false, onComplete, onFirstBubble, messages, handleReportGeneration, reportState, activeCategory, userName, time, index, activeReportIndex, isPaidResponse = false }) => {
    const msgObj = messages[index] || {};
    const isThisActiveReport = index === activeReportIndex;
    const hasReport = msgObj.report_generated || false;
    const reportId = msgObj.report_id || null;

    // Use pre-processed bubbles from backend if available;
    // fallback to splitting by '#' for old history messages without bubbles
    const paras = bubblesProp.length > 0 ? bubblesProp : (() => {
        const fallback = [];
        Object.keys(gurujiJson || {})
            .filter(key => key.startsWith('para'))
            .sort()
            .forEach(key => {
                if (gurujiJson[key]) {
                    gurujiJson[key].split('#').map(s => s.trim()).filter(s => s !== '').forEach(s => fallback.push(s));
                }
            });
        if (gurujiJson?.follow_up) {
            fallback.push(gurujiJson.follow_up);
        }
        return fallback;
    })();

    const [visibleCount, setVisibleCount] = useState(animate ? 0 : paras.length);
    const [isBuffering, setIsBuffering] = useState(animate ? true : false);
    const [waitMessage, setWaitMessage] = useState("");
    const textEndRef = useRef(null);
    const hasCalledComplete = useRef(false);

    const pleaseWaitMessages = [
        "Astrologer is typing..."
    ];

    const scrollToBottom = () => {
        if (!textEndRef.current) return;
        // Only auto-scroll if user is near the end of the text block already
        const container = textEndRef.current.closest('.MuiBox-root');
        if (container) {
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
            if (isNearBottom) {
                textEndRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        } else {
            textEndRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
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
            }, 120); // Pause between bubbles
            return () => clearTimeout(timer);
        }
    }, [visibleCount, isBuffering, animate, paras.length, onComplete]);

    // Effect 2: Manage Typing Delay when Buffering
    useEffect(() => {
        if (isBuffering && animate && visibleCount < paras.length) {
            const delay = (delays && delays[visibleCount]) ? delays[visibleCount] : 2000;

            // Set waiting message
            const randomMsg = pleaseWaitMessages[Math.floor(Math.random() * pleaseWaitMessages.length)];
            setWaitMessage(randomMsg);

            scrollToBottom();

            const timer = setTimeout(() => {
                setIsBuffering(false);
                setVisibleCount(prev => {
                    const next = prev + 1;
                    if (prev === 0 && onFirstBubble) onFirstBubble();
                    return next;
                });
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
        // Find the user question that led to this response
        let question = null;
        for (let i = index - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
                question = messages[i].content;
                break;
            }
        }

        const currentMsg = messages[index];
        handleReportGeneration(currentMsg?.mayaJson?.category || 'general', index, question);
    };

    const bubbleSx = {
        p: '12px 16px 14px 12px',
        borderRadius: ' 2px 10px 10px 10px',
        bgcolor: isPaidResponse ? '#fef6eb' : '#f1f1f1',
        color: isPaidResponse ? '#3e2723' : '#000000',
        // boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        // border: isPaidResponse ? '1px solid #ffd54f' : 'none',
        position: 'relative',
        mb: 1,
        // maxWidth: '85%',
        width: 'fit-content',
        minWidth: '100px',

    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {paras.slice(0, visibleCount).map((para, idx) => (
                <Box key={idx} sx={bubbleSx}>
                    {/* Label Removed to match Maya's bubble style */}
                    <Box
                        sx={{
                            mb: .5,
                            '& p': { margin: 0 },
                            '& blockquote': { margin: 0, paddingLeft: 1, borderLeft: '4px solid rgba(0,0,0,0.1)' },
                            '& ul, & ol': { margin: 0, paddingLeft: 2 }
                        }}
                    >
                        {/* <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.9rem' }} dangerouslySetInnerHTML={{ __html: para }} /> */}
                        <FormattedText
                            text={para}
                            sx={{ lineHeight: 1.6, fontSize: '0.9rem' }}
                        />
                        {/* <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.9rem' }} dangerouslySetInnerHTML={{ __html: para.replace(/,/g, '') }} /> */}
                    </Box>

                    {/* {idx === paras.length - 1 && !hasReport && (!isThisActiveReport || reportState === 'IDLE') && (
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
                    )} */}

                    {time && (
                        <Typography
                            sx={{
                                fontSize: '10px',
                                opacity: 0.8,
                                position: 'absolute',
                                bottom: (idx === paras.length - 1 && !hasReport && (!isThisActiveReport || reportState === 'IDLE')) ? 4 : 4,
                                right: 8,
                                color: '#494848',
                                fontWeight: 500
                            }}
                        >
                            {time}
                        </Typography>
                    )}
                </Box>
            ))}

            {isBuffering && waitMessage && (
                <Box sx={{
                    position: 'fixed',
                    bottom: 80,
                    left: 0,
                    right: 0,
                    minHeight: 25,
                    height: 'auto',
                    mx: 'auto',
                    width: 'max-content',
                    minWidth: '20%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10,
                    pointerEvents: 'none',
                    bgcolor: '#fece8d',
                    borderRadius: '50px',
                    px: 3,
                    py: 0.5
                }}>
                    <Typography
                        sx={{
                            fontSize: "0.9rem",
                            fontWeight: 400,
                            display: "inline-block",
                            overflow: "hidden",
                            "@keyframes letterBounceAppear": {
                                "0%": { opacity: 0 },
                                "10%": { opacity: 1 },
                                "15%, 85%": { opacity: 1 },
                                "100%": { opacity: 0 }
                            },
                        }}
                    >
                        {waitMessage.split("").map((char, index) => (
                            <Box
                                component="span"
                                key={index}
                                sx={{
                                    display: "inline-block",
                                    whiteSpace: char === " " ? "pre" : "normal",
                                    opacity: 0,
                                    animation: "letterBounceAppear 3.5s infinite",
                                    animationDelay: `${index * 0.1}s`,
                                }}
                            >
                                {char}
                            </Box>
                        ))}
                    </Typography>
                </Box>
            )}


            {isThisActiveReport && (reportState === 'CONFIRMING' || reportState === 'PREPARING' || reportState === 'READY') && (
                <MayaTemplateBox
                    name={userName.split(' ')[0]}
                    content={`detailed predictions on ${activeCategory || 'your query'} are chargeable ₹49.`}
                    buttonLabel={reportState === 'CONFIRMING' ? "Pay for detailed answer" : "Paid for detailed answer"}
                    onButtonClick={() => handleReportGeneration(activeCategory, 'PAY')}
                    loading={reportState === 'PAYING' || reportState === 'PREPARING'}
                    disabled={reportState === 'PAYING' || reportState === 'PREPARING' || reportState === 'READY'}
                />
            )}

            {isThisActiveReport && (reportState === 'PREPARING' || reportState === 'READY') && (
                <MayaTemplateBox
                    content={<>The detailed answer will be available in the <strong>"Detailed Reports"</strong> section of your home screen.<br /><br />Once prepared you'll be notified here.</>}
                    loading={reportState === 'PREPARING'}
                />
            )}

            {(hasReport || (isThisActiveReport && reportState === 'READY')) && (
                <NotificationBox
                    content={hasReport ? `The detailed answer on ${msgObj.report_category || 'your query'} is ready.` : `The detailed answer on ${activeCategory || 'your query'} is ready.`}
                    buttonLabel="Download Report"
                    onButtonClick={() => {
                        if (hasReport && reportId) {
                            handleReportGeneration(msgObj.report_category, 'DOWNLOAD_EXISTING', null, reportId);
                        } else {
                            handleReportGeneration(activeCategory, 'DOWNLOAD');
                        }
                    }}
                />
            )}

            <div ref={textEndRef} style={{ height: 1 }} />
        </Box>
    );
};


const Chat = () => {
    const [showHeader, setShowHeader] = useState(true);
    const lastScrollTop = useRef(0);
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
    const [profileDob, setProfileDob] = useState('');
    const [profilebirthstar, setProfileBirthStar] = useState('');

    // Multi-step report flow state
    const [reportState, setReportState] = useState('IDLE'); // IDLE, CONFIRMING, PAYING, PREPARING, READY
    const [activeCategory, setActiveCategory] = useState(null);
    const [readyReportData, setReadyReportData] = useState(null);
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [activeReportIndex, setActiveReportIndex] = useState(null);
    const [jsonVisibility, setJsonVisibility] = useState({ maya: false, guruji: false, psycology: false });
    const [jsonModal, setJsonModal] = useState({ open: false, data: null, title: '' });
    const [chatPaymentState, setChatPaymentState] = useState('IDLE'); // IDLE, REQUIRED, PAYING, COMPLETE
    const [pendingMessageId, setPendingMessageId] = useState(null);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [gurujiStarted, setGurujiStarted] = useState(new Set()); // tracks which guruji msgs have shown at least 1 bubble
    const [waitMessage, setWaitMessage] = useState("");
    const messagesEndRef = useRef(null);
    const processedNewSession = useRef(false);
    const isAutoScrolling = useRef(false);
    const scrollTimeout = useRef(null);
    const latestGurujiRef = useRef(null); // ref to the top of the latest guruji response

    // Dynamic timer to force re-renders for status ticks
    const [currentTime, setCurrentTime] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            isAutoScrolling.current = true;
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });

            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
                isAutoScrolling.current = false;
            }, 800); // Wait for smooth scroll to finish
        }
    };

    const renderStatusTicks = (idx) => {
        const msg = messages[idx];
        if (msg.role !== 'user') return null;

        const nextMsg = messages[idx + 1];

        // Dynamic time updates matching user specifications
        const msgTime = msg.timestamp ? new Date(msg.timestamp).getTime() : Date.now();
        const now = currentTime;
        const elapsedSecs = (now - msgTime) / 1000;
        const isExpired = elapsedSecs > 300; // 5 mins fallback

        if (!nextMsg || nextMsg.role !== 'assistant') {
            if (elapsedSecs < 5) {
                return <DoneOutlinedIcon sx={{ fontSize: '1.2rem', ml: 0.3, verticalAlign: 'middle', color: 'inherit', opacity: 0.7 }} />;
            }
            return <DoneAllOutlinedIcon sx={{ fontSize: '1.2rem', ml: 0.3, verticalAlign: 'middle', color: 'inherit', opacity: 0.7 }} />;
        }

        // Check if Maya or Guruji responded
        const isGuruji = nextMsg.assistant === 'guruji' || !!nextMsg.gurujiJson;
        const isMaya = nextMsg.assistant === 'maya' || !!nextMsg.mayaJson;

        if (isGuruji) {
            if (elapsedSecs < 5) {
                return <DoneAllOutlinedIcon sx={{ fontSize: '1.2rem', ml: 0.3, verticalAlign: 'middle', color: 'inherit', opacity: 0.7 }} />;
            } else {
                return <DoneAllOutlinedIcon sx={{ fontSize: '1.2rem', ml: 0.3, verticalAlign: 'middle', color: '#34B7F1' }} />;
            }
        } else if (isMaya || isExpired) {
            return <DoneAllOutlinedIcon sx={{ fontSize: '1.2rem', ml: 0.3, verticalAlign: 'middle', color: 'inherit', opacity: 0.7 }} />;
        }

        return <DoneOutlinedIcon sx={{ fontSize: '1.2rem', ml: 0.3, verticalAlign: 'middle', color: 'inherit', opacity: 0.7 }} />;
    };
    const handleScroll = (e) => {
        const scrollTop = e.target.scrollTop;
        if (isAutoScrolling.current) {
            lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;
            return;
        }

        // Don't trigger for small scrolls
        if (Math.abs(scrollTop - lastScrollTop.current) < 10) return;

        if (scrollTop <= 10) {
            setShowHeader(true);
        } else if (scrollTop > lastScrollTop.current) {
            // Scrolling down (towards bottom/newer) -> HIDE header
            setShowHeader(false);
        } else {
            // Scrolling up (towards top/older) -> SHOW header
            setShowHeader(true);
        }
        lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;
    };

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
                    const currentLocalSid = localStorage.getItem('activeSessionId');
                    console.log("DEBUG: currentLocalSid:", currentLocalSid);

                    if (res.data.sessions && res.data.sessions.length > 0) {
                        // Check if our localStorage session exists on the server
                        let localSessionOnServer = null;
                        if (currentLocalSid) {
                            localSessionOnServer = res.data.sessions.find(s => s.session_id === currentLocalSid);
                        }

                        // Priority: Use the localStorage session if it exists on server and is NOT ended
                        if (localSessionOnServer && !localSessionOnServer.is_ended) {
                            console.log("DEBUG: Found localStorage session on server, not ended:", currentLocalSid);
                            const history = localSessionOnServer.messages;
                            if (history && history.length > 0) {
                                console.log("DEBUG: Resuming localStorage session with", history.length, "messages");
                                setSessionId(currentLocalSid);

                                const mappedHistory = history.map(msg => ({
                                    ...msg,
                                    time: msg.time || formatTime(msg.timestamp) || formatTime(msg.created_at) || '',
                                    gurujiJson: tryParseJson(msg.guruji_json || msg.gurujiJson) || (msg.assistant === 'guruji' ? tryParseJson(msg.content) : null),
                                    mayaJson: tryParseJson(msg.maya_json || msg.mayaJson),
                                    psycologyJson: tryParseJson(msg.psycology_json || msg.psycologyJson),
                                    animating: false
                                }));

                                setMessages(mappedHistory);

                                // Check for unpaid chat messages to resume state
                                const unpaidMsg = mappedHistory.find(m => m.requires_chat_payment && !m.is_paid);
                                if (unpaidMsg) {
                                    setChatPaymentState('REQUIRED');
                                    setPendingMessageId(unpaidMsg.message_id);
                                    setActiveQuestion(unpaidMsg.content);
                                }
                            } else {
                                // Active session exists on server but has zero messages — keep the welcome screen
                                console.log("DEBUG: Active localStorage session has no messages yet, keeping welcome screen.");
                                setSessionId(currentLocalSid);
                            }
                            return;
                        }

                        // Fallback: Use the most recent session from server
                        const mostRecentSession = res.data.sessions[0];
                        console.log("DEBUG: mostRecentSession:", mostRecentSession.session_id);

                        // Scenario 2: Most recent session on server is already ended
                        if (mostRecentSession.is_ended) {
                            console.log("DEBUG: Scenario 2 - Most recent session on server is ended. Starting fresh.");
                            handleNewChat();
                            return;
                        }

                        // Scenario 3: Load history (Relaxed logic + Parsing)
                        const history = mostRecentSession.messages;
                        if (history && history.length > 0) {
                            console.log("DEBUG: Scenario 3 - Resuming Session:", mostRecentSession.session_id);
                            setSessionId(mostRecentSession.session_id);
                            if (!currentLocalSid || currentLocalSid !== mostRecentSession.session_id) {
                                localStorage.setItem('activeSessionId', mostRecentSession.session_id);
                            }

                            const mappedHistory = history.map(msg => ({
                                ...msg,
                                time: msg.time || formatTime(msg.timestamp) || formatTime(msg.created_at) || '',
                                gurujiJson: tryParseJson(msg.guruji_json || msg.gurujiJson) || (msg.assistant === 'guruji' ? tryParseJson(msg.content) : null),
                                mayaJson: tryParseJson(msg.maya_json || msg.mayaJson),
                                psycologyJson: tryParseJson(msg.psycology_json || msg.psycologyJson),
                                animating: false
                            }));

                            console.log("DEBUG: mappedHistory set, count:", mappedHistory.length);
                            setMessages(mappedHistory);

                            const unpaidMsg = mappedHistory.find(m => m.requires_chat_payment && !m.is_paid);
                            if (unpaidMsg) {
                                setChatPaymentState('REQUIRED');
                                setPendingMessageId(unpaidMsg.message_id);
                                setActiveQuestion(unpaidMsg.content);
                            }
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
                    guruji: res.data.guruji_json_enabled,
                    psycology: res.data.psycology_json_enabled || false
                });
            } catch (err) {
                console.error("Failed to fetch JSON settings:", err);
            }
        };
        fetchJsonSettings();
    }, []);

    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.role === 'assistant' && latestGurujiRef.current) {
            // Scroll to the top of the new assistant message so it's readable from the start
            latestGurujiRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            scrollToBottom();
        }
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
                if (res.data.user_profile?.dob) {
                    const dob = res.data.user_profile.dob;
                    try {
                        const date = new Date(dob);
                        if (!isNaN(date.getTime())) {
                            const formatted = date.toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            }).replace(/ /g, ' '); // Ensure single spaces
                            setProfileDob(formatted);
                        }
                    } catch (e) {
                        console.error("Error formatting DOB:", e);
                    }
                }
                const userChart = res.data.user_chart || res.data.user_charts;
                let extractedStar = "";
                const chartData = Array.isArray(userChart) ? userChart[0] : userChart;

                if (chartData) {
                    // Image-based structure: birth_star.mainHTML.content[2]
                    if (chartData.birth_star?.mainHTML?.content?.[2]) {
                        const starStr = chartData.birth_star.mainHTML.content[2];
                        if (starStr.toLowerCase().includes('birth star')) {
                            extractedStar = starStr.split(':')[1]?.trim() || "";
                        }
                    }
                    // Fallbacks
                    if (!extractedStar) {
                        if (chartData.data?.birth_star) {
                            extractedStar = chartData.data.birth_star;
                        } else if (typeof chartData.birth_star === 'string') {
                            extractedStar = chartData.birth_star;
                        }
                    }
                }

                if (extractedStar || res.data.user_profile?.birthstar || res.data.user_profile?.profilestar || res.data.user_profile?.star || res.data.user_profile?.nakshatra) {
                    setProfileBirthStar(extractedStar || res.data.user_profile.birthstar || res.data.user_profile.profilestar || res.data.user_profile.star || res.data.user_profile.nakshatra);
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

        // Register the new session on the server immediately so it survives page reload
        const mobile = localStorage.getItem('mobile');
        if (mobile) {
            startSession(mobile, newSid).catch(err => console.error('Failed to register session:', err));
        }
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

    const handleLabelClick = (data, title) => {
        setJsonModal({
            open: true,
            data: data,
            title: title || 'JSON DATA'
        });
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

        // Reset global report state for the new interaction ONLY if not preparing a report
        // If a report is preparing, we keep the state to show the preparation status for the old message
        if (reportState === 'IDLE' || reportState === 'READY') {
            setReportState('IDLE');
            setReadyReportData(null);
            setActiveCategory(null);
            setActiveQuestion(null);
            setActiveReportIndex(null);
        }

        setLoading(true);
        setIsBuffering(true);
        scrollToBottom();
        setWaitMessage("Sending to your astrologer...");

        // After a random 1.5–3s delay (natural feel, approx when Maya finishes), switch to "Astrologer is typing..."
        const waitDelay = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000; // random between 3000ms and 5000ms
        const waitMsgTimer = setTimeout(() => setWaitMessage("Astrologer is typing..."), waitDelay);


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

            // Handle rate limit / offline
            if (res.data.error_code === 'ASTROLOGER_OFFLINE') {
                setWaitMessage("Astrologer is offline");
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: res.data.answer || 'Guruji is currently unavailable. Please try again shortly.',
                    assistant: 'maya',
                    time: res.data.timestamp ? formatTime(res.data.timestamp) : getCurrentTime(),
                    timestamp: res.data.timestamp || new Date().toISOString()
                }]);
                setLoading(false);
                setIsBuffering(false);
                return;
            }

            if (res.data.requires_payment) {
                setLoading(false);
                setIsBuffering(false);
                setWaitMessage("");

                // Update the last user message with payment flags
                setMessages(prev => {
                    const next = [...prev];
                    const lastIdx = next.length - 1;
                    if (next[lastIdx].role === 'user') {
                        next[lastIdx] = {
                            ...next[lastIdx],
                            requires_chat_payment: true,
                            chat_payment_amount: res.data.amount,
                            is_paid: false,
                            message_id: res.data.message_id,
                            mayaJson: tryParseJson(res.data.maya_json),
                            psycologyJson: tryParseJson(res.data.psycology_json)
                        };
                    }
                    return next;
                });

                setChatPaymentState('REQUIRED');
                setPendingMessageId(res.data.message_id);
                setActiveQuestion(text);
                return;
            }

            const { answer, metrics, context, assistant, wallet_balance, amount, maya_json, guruji_json, psycology_json, bubbles, delays, timestamp, message_id } = res.data;

            if (wallet_balance !== undefined) setWalletBalance(wallet_balance);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: answer,
                assistant: assistant || 'guruji',
                metrics,
                context,
                amount,
                rawResponse: res.data,
                mayaJson: tryParseJson(maya_json),
                gurujiJson: tryParseJson(guruji_json),
                psycologyJson: tryParseJson(psycology_json),
                bubbles: bubbles || [],
                delays: delays || [],
                animating: true,
                message_id: message_id,
                time: timestamp ? formatTime(timestamp) : getCurrentTime(),
                timestamp: timestamp || new Date().toISOString()
            }]);
            if (guruji_json) setIsAnimating(true);
        } catch (err) {
            console.error("Chat Error:", err);
            // If it's a 404/401/403, the interceptor will handle redirect to login
            // Only show error message for other types of errors
            if (err.response?.status !== 404 && err.response?.status !== 401 && err.response?.status !== 403) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    assistant: 'maya',
                    content: 'Sorry, I encountered an error. Please try again.',
                    time: getCurrentTime()
                }]);
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
    const processReportWithWallet = async (mobile, category, question = null, reportIndex = null) => {
        setReportState('PREPARING');
        // alert('₹49 will be deducted from your wallet. Generating your report...');

        setTimeout(async () => {
            try {
                const currentMsg = messages[reportIndex];
                const msgId = currentMsg?.message_id;
                console.log("DEBUG: Generating report for message_id:", msgId);

                const res = await generateReport(mobile, category || 'general', question, sessionId, msgId);

                if (res.data.type === 'application/json') {
                    const reader = new FileReader();
                    reader.onload = async () => {
                        const result = JSON.parse(reader.result);
                        if (result.status === 'insufficient_funds') {
                            // Wallet was depleted between check and generation
                            // Fallback to Razorpay
                            alert("Insufficient wallet balance. Redirecting to payment gateway...");
                            console.log("Insufficient funds during generation, falling back to Razorpay");
                            await processReportWithRazorpay(mobile, category, question, reportIndex);
                        }
                    };
                    reader.readAsText(res.data);
                    return;
                }

                // Success
                const pdfData = res.data;
                const report_id = res.headers ? res.headers['x-report-id'] : null;

                setReadyReportData(pdfData);
                setReportState('READY');

                // Update the message in history to persist its status
                if (reportIndex !== null) {
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        if (newMsgs[reportIndex]) {
                            newMsgs[reportIndex] = {
                                ...newMsgs[reportIndex],
                                report_generated: true,
                                report_id: report_id,
                                report_category: category
                            };
                        }
                        return newMsgs;
                    });
                }
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
    const processReportWithRazorpay = async (mobile, category, question = null, reportIndex = null) => {
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
                name: "Guruji",
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
                        await processReportWithWallet(mobile, category, question, reportIndex);

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

    const handleReportGeneration = async (category, action, question = null, existingReportId = null) => {
        const mobile = localStorage.getItem('mobile');
        if (!mobile) return;

        if (action === 'DOWNLOAD_EXISTING') {
            try {
                const res = await api.get(`/wallet/report/${existingReportId}`, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Astrology_Report_${category}_${Date.now()}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            } catch (error) {
                console.error("Download failed:", error);
                alert("Failed to download report. Please try again.");
            }
            return;
        }

        if (action === 'START') {
            setActiveCategory(category);
            setActiveQuestion(question);
            // We need to know which message index this is for
            // The index is passed from the SequentialResponse's handleReportClick calling this
            // But we need to update handleReportClick to pass the index too.
            // Wait, I already added index to SequentialResponse.
            // Let's use a temporary hack or better, pass index to START.
            return;
        }

        // Handle the START with index
        if (typeof action === 'number') {
            const reportIndex = action;
            setActiveCategory(category);
            setActiveQuestion(question);
            setActiveReportIndex(reportIndex);
            setReportState('CONFIRMING');
            return;
        }

        if (action === 'PAY') {
            processReportWithRazorpay(localStorage.getItem('mobile'), category, question, activeReportIndex);
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

    const handleChatSuccess = async (paymentId, amount) => {
        try {
            setChatPaymentState('COMPLETE');
            setThankYouAction('CHAT_PAYMENT');
            // setThankYouData({
            //     amount: amount,
            //     points: 0,
            //     title: 'Payment successful',
            //     trustMsg: 'Guruji is now analyzing your chart...',
            //     gratitudeMsg: 'Thank you for your patience.',
            //     showWave: true,
            //     referenceId: paymentId
            // });
            setThankYouOpen(false);

            // Proceed to process the message after payment
            const lastUserMsg = messages.find(m => m.message_id === pendingMessageId);
            const mobile = localStorage.getItem('mobile');
            const history = messages.slice(1, messages.findIndex(m => m.message_id === pendingMessageId));

            const chatRes = await api.post('/auth/chat', {
                mobile,
                message: lastUserMsg.content,
                history,
                session_id: sessionId,
                payment_id: paymentId
            });

            const { answer, metrics, context, assistant, wallet_balance, amount: cost, maya_json, guruji_json, timestamp, message_id } = chatRes.data;

            if (wallet_balance !== undefined) setWalletBalance(wallet_balance);

            setMessages(prev => {
                const next = [...prev];
                // Mark the user message as paid
                const userIdx = next.findIndex(m => m.message_id === pendingMessageId);
                if (userIdx !== -1) {
                    next[userIdx].is_paid = true;
                    next[userIdx].payment_id = paymentId;
                }

                // Add Guruji's response
                return [...next, {
                    role: 'assistant',
                    content: answer,
                    assistant: assistant || 'guruji',
                    metrics,
                    context,
                    amount: cost,
                    mayaJson: maya_json,
                    psycologyJson: chatRes.data.psycology_json,
                    gurujiJson: guruji_json,
                    bubbles: chatRes.data.bubbles || [],
                    delays: chatRes.data.delays || [],
                    animating: true,
                    message_id: message_id,
                    time: timestamp ? formatTime(timestamp) : getCurrentTime(),
                    timestamp: timestamp || new Date().toISOString()
                }];
            });
            if (guruji_json) setIsAnimating(true);
            setChatPaymentState('IDLE');
            setPendingMessageId(null);
        } catch (err) {
            console.error("Chat success processing failed:", err);
            alert("Error processing your request. Please contact support.");
            setChatPaymentState('REQUIRED');
        }
    };

    const handleChatPayment = async (amount, mobile) => {
        // Temporary Bypass: Alert Success and proceed
        // alert("Payment successful!");
        handleChatSuccess("MOCK_PAYMENT_ID", amount);
        return;

        // Original logic preserved below (currently unreachable)
        setChatPaymentState('PAYING');
        try {
            const orderRes = await createPaymentOrder(amount, mobile);
            const { order_id, key } = orderRes.data;

            const options = {
                key,
                amount: amount * 100,
                currency: "INR",
                name: "Astrology Consultation",
                description: "Payment for personalized answer",
                order_id,
                handler: async (response) => {
                    handleChatSuccess(response.razorpay_payment_id, amount);
                },
                modal: {
                    ondismiss: () => {
                        setChatPaymentState('REQUIRED');
                    }
                },
                prefill: {
                    contact: mobile
                },
                theme: {
                    color: "#F36A2F"
                }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Order creation failed:", err);
            setChatPaymentState('REQUIRED');
        }
    };

    return (
        <Box
            sx={{
                // minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#FFFFFF',
                height: "100vh",
                position: 'relative',
                // width: '100%'
                // overflowY: "auto",
                // "&::-webkit-scrollbar": { display: "block" },
                // scrollbarWidth: "none",
            }}
        >
            <Header
                showProfile={true}
                name={userName.split(' ')[0]}
                profiledob={profileDob}
                profilebirthstar={profilebirthstar}
                hscrollsx={{
                    position: 'fixed',
                    transition: 'transform 0.3s ease-in-out',
                    transform: showHeader ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-100%)',
                    left: '50%',
                    pointerEvents: showHeader ? 'auto' : 'none',
                    zIndex: 1200
                }}
            />

            {/* <HamburgerMenu
                menubarsx={{
                    position: 'fixed',
                    // top: 25,
                    transition: 'transform 0.3s ease-in-out',
                    transform: showHeader ? 'translateY(0)' : 'translateY(-100px)',
                    zIndex: 1210,
                    pointerEvents: showHeader ? 'auto' : 'none',
                }}
            /> */}


            {messages.some(m => m.assistant === 'guruji') && (
                <Box sx={{
                    position: 'fixed',
                    top: 20,
                    left: 0,
                    right: 0,
                    transform: showHeader ? 'translateY(70px)' : 'translateY(0)',
                    zIndex: 1200,
                    display: 'flex',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    transition: 'transform 0.3s ease-in-out'
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
                                bgcolor: '#ff0000',
                                fontWeight: 'normal',
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
                onScroll={handleScroll}
                sx={{
                    flex: 1,
                    // overflowY: "auto",
                    px: 3,
                    pb: 14,

                    pt: 19,
                    overflowY: "auto",
                    "&::-webkit-scrollbar": { display: "block" },
                    scrollbarWidth: "none",
                }}
            >
                {messages.map((msg, i) => {
                    const idx = i; // Use idx for the current message index

                    if (msg.assistant === 'maya') {
                        if (!msg.content || msg.content.trim() === '') {
                            return null;
                        }
                        return (
                            <MayaIntro
                                key={i}
                                title={msg.title || msg.mayaJson?.title || "Title"}
                                name={i === 0 ? userName : null}
                                content={msg.content}
                                mayaJson={msg.mayaJson}
                                psycologyJson={msg.psycologyJson}
                                rawResponse={msg.rawResponse}
                                time={msg.time}
                                jsonVisibility={jsonVisibility}
                                onLabelClick={handleLabelClick}
                            />
                        );
                    }

                    const gurujiData = msg.gurujiJson || (msg.assistant === 'guruji' ? tryParseJson(msg.content) : null);

                    if (gurujiData && msg.assistant === 'guruji') {
                        const startedCond = !msg.animating || gurujiStarted.has(i);
                        return (
                            <Box key={i} ref={i === messages.length - 1 ? latestGurujiRef : null} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 0, width: '100%' }}>
                                {startedCond && <FadeInRoleLabel isUser={false} name="Guruji" ml={1} />}
                                <Box sx={{ flex: 1, maxWidth: '85%' }}>
                                    <SequentialResponse
                                        isPaidResponse={messages[i - 1] && messages[i - 1].role === 'user' && messages[i - 1].requires_chat_payment}
                                        gurujiJson={gurujiData}
                                        bubbles={msg.bubbles || []}
                                        delays={msg.delays || []}
                                        animate={msg.animating}
                                        onComplete={() => {
                                            setIsAnimating(false);
                                            setMessages(prev => prev.map((m, idx) =>
                                                idx === i ? { ...m, animating: false } : m
                                            ));
                                        }}
                                        onFirstBubble={() => {
                                            setGurujiStarted(prev => new Set([...prev, i]));
                                        }}
                                        messages={messages}
                                        handleReportGeneration={handleReportGeneration}
                                        reportState={reportState}
                                        activeCategory={activeCategory}
                                        userName={userName}
                                        time={msg.time}
                                        index={i}
                                        activeReportIndex={activeReportIndex}
                                    />
                                    {/* JSON Output View for Guruji Multi-bubble */}
                                    {(jsonVisibility.maya || jsonVisibility.guruji || jsonVisibility.psycology) && (msg.mayaJson || gurujiData || msg.psycologyJson) && (
                                        <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed rgba(0,0,0,0.1)', display: 'flex', gap: 2, justifyContent: 'center' }}>
                                            {(msg.mayaJson && jsonVisibility.maya) && (
                                                <Typography
                                                    onClick={() => handleLabelClick(msg.mayaJson, 'RECEPTIONIST CLASSIFICATION')}
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        color: 'rgba(0,0,0,0.4)',
                                                        fontWeight: 800,
                                                        cursor: 'pointer',
                                                        textTransform: 'uppercase',
                                                        textDecoration: 'underline',
                                                        '&:hover': { color: '#F36A2F' }
                                                    }}
                                                >
                                                    Maya JSON
                                                </Typography>
                                            )}
                                            {(gurujiData && jsonVisibility.guruji) && (
                                                <Typography
                                                    onClick={() => handleLabelClick(gurujiData, 'ASTROLOGER STRUCTURED RESPONSE')}
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        color: '#F36A2F',
                                                        fontWeight: 800,
                                                        cursor: 'pointer',
                                                        textTransform: 'uppercase',
                                                        textDecoration: 'underline',
                                                        '&:hover': { opacity: 0.8 }
                                                    }}
                                                >
                                                    Guruji JSON
                                                </Typography>
                                            )}
                                            {(msg.psycologyJson && jsonVisibility.psycology) && (
                                                <Typography
                                                    onClick={() => handleLabelClick(msg.psycologyJson, 'USER PSYCHOLOGY')}
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        color: '#F36A2F',
                                                        fontWeight: 800,
                                                        cursor: 'pointer',
                                                        textTransform: 'uppercase',
                                                        textDecoration: 'underline',
                                                        '&:hover': { opacity: 0.8 }
                                                    }}
                                                >
                                                    Psychology
                                                </Typography>
                                            )}
                                            {(msg.context && jsonVisibility.guruji) && (
                                                <Typography
                                                    onClick={() => handleLabelClick(msg.context, 'RAG CHUNKS')}
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        color: 'rgba(0,0,0,0.4)',
                                                        fontWeight: 800,
                                                        cursor: 'pointer',
                                                        textTransform: 'uppercase',
                                                        textDecoration: 'underline',
                                                        '&:hover': { color: '#F36A2F' }
                                                    }}
                                                >
                                                    RAG
                                                </Typography>
                                            )}
                                            {(msg.metrics && jsonVisibility.guruji) && (
                                                <Typography
                                                    onClick={() => handleLabelClick(msg.metrics, 'MODELLING METRICS')}
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        color: '#F36A2F',
                                                        fontWeight: 800,
                                                        cursor: 'pointer',
                                                        textTransform: 'uppercase',
                                                        textDecoration: 'underline',
                                                        '&:hover': { opacity: 0.8 }
                                                    }}
                                                >
                                                    Modelling %
                                                </Typography>
                                            )}
                                        </Box>
                                    )}

                                    {/* Translation Indicator for Guruji Response */}
                                    {startedCond &&
                                        msg.mayaJson?.MSG_LANGUAGE &&
                                        msg.mayaJson.MSG_LANGUAGE.toLowerCase() !== 'en' &&
                                        msg.mayaJson.MSG_LANGUAGE.toLowerCase() !== 'english' && (
                                            <TranslationIndicator
                                                text={`Translated to your language / language style by MAYA`}
                                                sx={{ mt: reportState === 'IDLE' ? '3px' : '3px', position: 'relative', top: -12 }}
                                            />
                                        )}
                                </Box>
                            </Box>
                        );
                    }

                    const nextMsg = messages[i + 1];

                    let langDetected = msg?.mayaJson?.MSG_LANGUAGE;

                    if (!langDetected && msg.role === "user") {
                        langDetected = nextMsg?.mayaJson?.MSG_LANGUAGE;
                    }

                    const normalizedLang = langDetected?.toLowerCase();

                    const showTranslationIndicator =
                        normalizedLang &&
                        !["en", "english"].includes(normalizedLang);

                    if (msg.role === 'user' && msg.requires_chat_payment && !msg.is_paid) {
                        return (
                            <Box key={i} sx={{ width: '100%', mb: 0 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%', mb: 1 }}>
                                    <FadeInRoleLabel isUser={true} name="User" mr={1} />
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flexDirection: 'row-reverse', maxWidth: '90%' }}>
                                        <Box sx={{
                                            p: '12px 16px 14px 12px',
                                            borderRadius: '10px 0 10px 10px',
                                            bgcolor: '#2f3148',
                                            color: '#fff',
                                            // boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                            position: 'relative',
                                            maxWidth: '325px',
                                            minWidth: '100px',
                                            width: 'fit-content',
                                            overflowWrap: "break-word",
                                            wordBreak: "break-word",
                                            whiteSpace: "pre-line",
                                        }}>
                                            <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.9rem', m: 0, mb: .5 }}>
                                                {msg.content}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.625rem', opacity: 0.8, position: 'absolute', bottom: 2, right: 8, color: '#fff', fontWeight: 500, pt: 1, display: 'flex', alignItems: 'center' }}>
                                                {msg.time}
                                                {renderStatusTicks(i)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {showTranslationIndicator && (
                                        <TranslationIndicator
                                            // text={`Translated from English to ${msg.mayaJson.language_detected} for the user`}
                                            text={`Translated to astrologer's language by MAYA`}
                                            sx={{ mt: reportState === 'IDLE' ? '3px' : '3px', position: 'relative', top: 0 }}
                                        />
                                    )}
                                </Box>
                                <MayaTemplateBox
                                    name={userName.split(' ')[0]}
                                    content={`personalized answer to your concern is chargeable ₹${msg.chat_payment_amount || 39}.`}
                                    buttonLabel={chatPaymentState === 'REQUIRED' || chatPaymentState === 'IDLE' ? `Pay ₹${msg.chat_payment_amount || 39} to get answer` : "Processing..."}
                                    onButtonClick={() => handleChatPayment(msg.chat_payment_amount || 39, localStorage.getItem('mobile'))}
                                    loading={chatPaymentState === 'PAYING'}
                                    disabled={chatPaymentState === 'PAYING' || chatPaymentState === 'COMPLETE'}
                                />
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
                                mb: 1
                            }}
                        >
                            <FadeInRoleLabel
                                isUser={msg.role === 'user'}
                                name={msg.role === 'user' ? 'You' : (msg.assistant === 'maya' ? 'MAYA' : 'Guruji')}
                                ml={msg.role !== 'user' ? 1 : 0}
                                mr={msg.role === 'user' ? 1 : 0}
                            />
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.5,
                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                                maxWidth: '90%',

                            }}>
                                {/* ... message contents ... */}
                                {msg.content && msg.content.trim() !== '' && (
                                    <Box sx={{
                                        p: '12px 16px 18px 12px',
                                        borderRadius: '10px 2px 10px 10px',
                                        bgcolor: msg.role === 'user' ? (msg.requires_chat_payment ? '#2f3148' : '#e2e2e2') : (messages[i - 1] && messages[i - 1].role === 'user' && messages[i - 1].requires_chat_payment ? '#fef6eb' : '#f1f1f1'),
                                        color: msg.role === 'user' ? (msg.requires_chat_payment ? '#ffffff' : '#000000') : (messages[i - 1] && messages[i - 1].role === 'user' && messages[i - 1].requires_chat_payment ? '#3e2723' : '#000000'),
                                        // boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                        // border: msg.role !== 'user' && messages[i - 1] && messages[i - 1].role === 'user' && messages[i - 1].requires_chat_payment ? '1px solid #ffd54f' : 'none',
                                        position: 'relative',
                                        maxWidth: '325px',
                                        minWidth: '100px',
                                        width: 'fit-content',
                                        overflowWrap: "break-word",
                                        wordBreak: "break-word",
                                        whiteSpace: "pre-line",
                                    }}>
                                        <FormattedText
                                            text={msg.content}
                                            sx={{ lineHeight: 1.6, fontSize: '0.9rem' }}
                                        />

                                        {/* JSON Output View (for regular messages) */}
                                        {((msg.mayaJson && !msg.gurujiJson && jsonVisibility.maya) || (msg.psycologyJson && jsonVisibility.psycology)) && (
                                            <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed rgba(0,0,0,0.1)', textAlign: 'right', display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                                {(msg.mayaJson && !msg.gurujiJson && jsonVisibility.maya) && (
                                                    <Typography
                                                        onClick={() => handleLabelClick(msg.mayaJson, 'RECEPTIONIST CLASSIFICATION')}
                                                        sx={{
                                                            fontSize: '0.65rem',
                                                            color: '#F36A2F',
                                                            fontWeight: 800,
                                                            cursor: 'pointer',
                                                            textTransform: 'uppercase',
                                                            textDecoration: 'underline',
                                                            '&:hover': { opacity: 0.8 }
                                                        }}
                                                    >
                                                        Maya JSON
                                                    </Typography>
                                                )}
                                                {(msg.psycologyJson && jsonVisibility.psycology) && (
                                                    <Typography
                                                        onClick={() => handleLabelClick(msg.psycologyJson, 'USER PSYCHOLOGY')}
                                                        sx={{
                                                            fontSize: '0.65rem',
                                                            color: '#F36A2F',
                                                            fontWeight: 800,
                                                            cursor: 'pointer',
                                                            textTransform: 'uppercase',
                                                            textDecoration: 'underline',
                                                            '&:hover': { opacity: 0.8 }
                                                        }}
                                                    >
                                                        Psychology
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}

                                        {/* Additional Debug Labels for Regular Guruji Bubble */}
                                        {(msg.assistant === 'guruji' && jsonVisibility.guruji) && (
                                            <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed rgba(255,255,255,0.2)', display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                                                {msg.context && (
                                                    <Typography
                                                        onClick={() => handleLabelClick(msg.context, 'RAG CHUNKS')}
                                                        sx={{
                                                            fontSize: '0.65rem',
                                                            color: 'rgba(255,255,255,0.7)',
                                                            fontWeight: 800,
                                                            cursor: 'pointer',
                                                            textTransform: 'uppercase',
                                                            textDecoration: 'underline',
                                                            '&:hover': { color: 'white' }
                                                        }}
                                                    >
                                                        RAG
                                                    </Typography>
                                                )}
                                                {msg.metrics && (
                                                    <Typography
                                                        onClick={() => handleLabelClick(msg.metrics, 'MODELLING METRICS')}
                                                        sx={{
                                                            fontSize: '0.65rem',
                                                            color: 'rgba(255,255,255,0.8)',
                                                            fontWeight: 800,
                                                            cursor: 'pointer',
                                                            textTransform: 'uppercase',
                                                            textDecoration: 'underline',
                                                            '&:hover': { color: 'white' }
                                                        }}
                                                    >
                                                        Modelling %
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}


                                        {/* Timestamp moved inside the bubble */}
                                        <Box
                                            sx={{
                                                fontSize: '10px',
                                                opacity: 0.8,
                                                position: 'absolute',
                                                bottom: 2,
                                                right: 8,
                                                color: msg.role === 'user' ? (msg.requires_chat_payment ? 'rgba(255,255,255,0.7)' : '#494848') : '#494848',
                                                fontWeight: 500,
                                                pt: 1,
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            {msg.time}
                                            {renderStatusTicks(i)}
                                        </Box>

                                    </Box>

                                )}

                            </Box>

                            {/* Translation Indicator */}
                            {showTranslationIndicator && (
                                <TranslationIndicator
                                    text={msg.role === 'user'
                                        ? `Translated to astrologer's language by MAYA`
                                        : `Translated to your language / language style by MAYA`
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
                        minHeight: 25,
                        height: 'auto',
                        mx: 'auto',
                        width: 'max-content',
                        minWidth: '20%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10,
                        pointerEvents: 'none',
                        bgcolor: '#fece8d',
                        borderRadius: '50px',
                        px: 3,
                        py: 0.5
                    }}>
                        <Typography
                            sx={{
                                fontSize: "0.9rem",
                                fontWeight: 400,
                                display: "inline-block",
                                overflow: "hidden",
                                "@keyframes letterBounceAppear": {
                                    "0%": { opacity: 0 },
                                    "10%": { opacity: 1 },
                                    "15%, 85%": { opacity: 1 },
                                    "100%": { opacity: 0 }
                                },
                            }}
                        >
                            {waitMessage.split("").map((char, index) => (
                                <Box
                                    component="span"
                                    key={index}
                                    sx={{
                                        display: "inline-block",
                                        whiteSpace: char === " " ? "pre" : "normal",
                                        opacity: 0,
                                        animation: "letterBounceAppear 3.5s infinite",
                                        animationDelay: `${index * 0.1}s`,
                                    }}
                                >
                                    {char}
                                </Box>
                            ))}
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
                isAnimating={isAnimating}
            />
            {/* Same overlays as before (Inactivity, Summary, Drawer) */}
            {/* ... preserved ... */}

            {/* Inactivity Prompt Overlay */}
            {/* {showInactivityPrompt && !summary && (
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
            )} */}

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

            {/* Initial Loading / Processing Overlay */}
            {/* {userStatus === 'processing' && (
                <Box sx={{
                    position: 'fixed',
                    inset: 0,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 20000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    textAlign: 'center'
                }}>
                    <CircularProgress sx={{ color: '#F36A2F', mb: 4, size: 60 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#333', mb: 2 }}>
                        Connecting with the Cosmos
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666', maxWidth: 400 }}>
                        Guruji is currently preparing your personalized astrological charts.
                        Please wait a moment as we align your stars...
                    </Typography>
                </Box>
            )} */}
            {/* Full JSON Modal */}
            <Dialog
                open={jsonModal.open}
                onClose={() => setJsonModal({ ...jsonModal, open: false })}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: { borderRadius: 3, bgcolor: '#fbfbfb' }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {jsonModal.title}
                    <IconButton onClick={() => setJsonModal({ ...jsonModal, open: false })}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{
                        bgcolor: '#1e1e1e',
                        color: '#d4d4d4',
                        p: 2,
                        borderRadius: 2,
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        whiteSpace: 'pre-wrap',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                    }}>
                        {JSON.stringify(jsonModal.data, null, 4)}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(jsonModal.data, null, 2));
                        }}
                        sx={{ textTransform: 'none', color: '#F36A2F' }}
                    >
                        Copy JSON
                    </Button>
                    <Button onClick={() => setJsonModal({ ...jsonModal, open: false })} sx={{ textTransform: 'none', color: '#666' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Chat;
