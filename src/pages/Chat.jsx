import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { sendMessage, getGurujiResponse, endChat, startSession, getChatHistory, submitFeedback, generateReport, createPaymentOrder, verifyPayment, payForChat } from '../api';
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
import ConsultFooter from '../components/consultFooter';

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

const SafeHTML = ({ html }) => {
    if (!html) return null;

    const parse = (text) => {
        if (typeof text !== 'string') return text;

        // Replace &nbsp; with non-breaking space character
        const processedText = text.replace(/&nbsp;/g, '\u00A0');

        // Split by tags: <b>, </b>, <strong>, </strong>, <p...>, </p>, <br.../>, <span...>, </span> AND newlines (\n\n or \n)
        const parts = processedText.split(/(<(?:b|\/b|strong|\/strong|p[^>]*|\/p|br[^>]*\/?|span[^>]*|\/span)>|\n\n|\n)/i);

        const result = [];
        let isBold = false;
        let activeStyles = {};
        const extractStyles = (tag) => {
            const styles = {};
            const styleMatch = tag.match(/style=["']([^"']+)["']/i);
            if (styleMatch) {
                const styleStr = styleMatch[1];
                const colorMatch = styleStr.match(/color:\s*([^;]+)/i);
                const weightMatch = styleStr.match(/font-weight:\s*([^;]+)/i);
                const marginMatch = styleStr.match(/margin:\s*([^;]+)/i);
                const marginTopMatch = styleStr.match(/margin-top:\s*([^;]+)/i);
                const decorationMatch = styleStr.match(/text-decoration:\s*([^;"]+)/i);
                if (colorMatch) styles.color = colorMatch[1].trim();
                if (weightMatch) styles.fontWeight = weightMatch[1].trim();
                if (marginMatch) styles.margin = marginMatch[1].trim();
                if (marginTopMatch) styles.marginTop = marginTopMatch[1].trim();
                if (decorationMatch) styles.textDecoration = decorationMatch[1].trim();
            }
            return styles;
        };

        parts.forEach((part, index) => {
            if (!part) return;

            const lowerPart = part.toLowerCase();

            if (lowerPart === '<b>' || lowerPart === '<strong>') {
                isBold = true;
            } else if (lowerPart === '</b>' || lowerPart === '</strong>') {
                isBold = false;
            } else if (lowerPart.startsWith('<span')) {
                activeStyles = { ...activeStyles, ...extractStyles(part) };
            } else if (lowerPart === '</span>') {
                activeStyles = {}; // Simple reset for now
            } else if (lowerPart === '<br>' || lowerPart.startsWith('<br')) {
                result.push(<br key={index} />);
            } else if (lowerPart === '\n\n') {
                result.push(<Box key={index} sx={{ height: '14px' }} />);
            } else if (lowerPart === '\n') {
                result.push(<br key={index} />);
            } else if (lowerPart.startsWith('<p')) {
                activeStyles = { ...activeStyles, ...extractStyles(part) };
                if (result.length > 0) result.push(<br key={`br-p-${index}-1`} />);
            } else if (lowerPart === '</p>') {
                activeStyles = {}; // Reset for now
                result.push(<br key={`br-p-${index}-2`} />);
            } else {
                // Text content
                let content = part;
                if (isBold) content = <strong key={`bold-${index}`}>{content}</strong>;

                if (Object.keys(activeStyles).length > 0) {
                    const isBlockStyle = !!activeStyles.marginTop || !!activeStyles.margin;
                    result.push(
                        <span
                            key={`style-wrap-${index}`}
                            style={{
                                ...activeStyles,
                                display: isBlockStyle ? 'inline-block' : 'inline',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {content}
                        </span>
                    );
                } else if (isBold) {
                    result.push(content);
                } else {
                    result.push(<React.Fragment key={index}>{content}</React.Fragment>);
                }
            }
        });

        return result;
    };

    return <React.Fragment>{parse(html)}</React.Fragment>;
};

const MayaIntro = ({ title, name, content, mayaJson, psycologyJson, rawResponse, time, jsonVisibility, onLabelClick, sx }) => {
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
                // mr: 1,
                textAlign: 'right',
            }}>
                MAYA AI
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
                                {typeof title === 'object' ? (title.message || title.title || JSON.stringify(title)) : title}
                            </Typography>
                        )}
                        <Typography
                            sx={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#333', textAlign: 'left', fontWeight: 500, ...sx }}
                        >
                            <SafeHTML html={typeof content === 'object' ? (content.message || JSON.stringify(content)) : content} />
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
                                Maya JSON
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
                                Psychology
                            </Typography>
                        )}
                        {(rawResponse?.guruji_input?.replacements && jsonVisibility?.guruji) && (
                            <Typography
                                onClick={() => onLabelClick?.(rawResponse.guruji_input.replacements, 'PROMPT REPLACEMENTS')}
                                sx={{
                                    fontSize: '0.65rem',
                                    color: '#54A170',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    textDecoration: 'underline',
                                    '&:hover': { opacity: 0.8 }
                                }}
                            >
                                Replacements
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
            maxWidth: 450,
            mb: 2,
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

            <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#333', mt: 1, mb: 1, textAlign: 'left', fontWeight: 500 }}>
                {name && name + ", "}{typeof content === 'string' ? <SafeHTML html={content} /> : content}
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
                        onClick={disabled ? undefined : onButtonClick}
                        disabled={disabled}
                        // startIcon={<DoneAllOutlinedIcon />}
                        sx={{
                            bgcolor: disabled ? '#e0e0e0' : '#54a170',
                            color: disabled ? '#aaa' : '#ffffff',
                            px: 3,
                            py: 0.8,
                            borderRadius: 10,
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            minWidth: '170px',
                            border: '2px solid #ffffff',
                            '&:hover': { bgcolor: disabled ? '#e0e0e0' : '#f0fdf4', color: '#54a170', border: '2px solid #54a170' },
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            pointerEvents: disabled ? 'none' : 'auto',
                        }}
                    >
                        {typeof buttonLabel === 'string' ? <SafeHTML html={buttonLabel} /> : buttonLabel}
                        <Typography sx={{ fontSize: '0.9rem', color: '#000', fontWeight: 400, position: 'absolute', bottom: -24 }}>Or ask another question</Typography>
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

const UserMessageTimer = ({ arrivalTime, children }) => {
    const [isAnimating, setIsAnimating] = useState(() => {
        if (!arrivalTime) return false;
        return Date.now() - arrivalTime < 3000;
    });

    useEffect(() => {
        if (!arrivalTime) {
            setIsAnimating(false);
            return;
        }
        const timeElapsed = Date.now() - arrivalTime;
        if (timeElapsed < 3000) {
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 3000 - timeElapsed);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
        }
    }, [arrivalTime]);

    return <>{children(isAnimating)}</>;
};

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
        "Astrologer is typing"
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
            const delay = (delays && delays[visibleCount]) ? delays[visibleCount] : 1000;

            // Set waiting message
            const randomMsg = pleaseWaitMessages[Math.floor(Math.random() * pleaseWaitMessages.length)];
            setWaitMessage(randomMsg);

            scrollToBottom();

            const timer = setTimeout(() => {
                setIsBuffering(false);
                if (visibleCount === 0 && onFirstBubble) onFirstBubble();
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
        borderLeft: isPaidResponse ? ' 2.5px solid #54A170' : 'none',
        bgcolor: isPaidResponse ? '#fef6eb' : '#f1f1f1',
        color: isPaidResponse ? '#3e2723' : '#000000',
        // boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        // border: isPaidResponse ? '1px solid #ffd54f' : 'none',
        position: 'relative',
        mb: .5,
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





            {
                isThisActiveReport && (reportState === 'CONFIRMING' || reportState === 'PREPARING' || reportState === 'READY') && (
                    <MayaTemplateBox
                        name={userName.split(' ')[0]}
                        content={`detailed predictions on ${activeCategory || 'your query'} are chargeable ₹49.`}
                        buttonLabel={reportState === 'CONFIRMING' ? "Pay for detailed answer" : "Paid for detailed answer"}
                        onButtonClick={() => handleReportGeneration(activeCategory, 'PAY')}
                        loading={reportState === 'PAYING' || reportState === 'PREPARING'}
                        disabled={reportState === 'PAYING' || reportState === 'PREPARING' || reportState === 'READY'}
                    />
                )
            }

            {
                isThisActiveReport && (reportState === 'PREPARING' || reportState === 'READY') && (
                    <MayaTemplateBox
                        content={<>The detailed answer will be available in the <strong>"Detailed Reports"</strong> section of your home screen.<br /><br />Once prepared you'll be notified here.</>}
                        loading={reportState === 'PREPARING'}
                    />
                )
            }

            {
                (hasReport || (isThisActiveReport && reportState === 'READY')) && (
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
                )
            }

            <div ref={textEndRef} style={{ height: 1 }} />
        </Box >
    );
};


const deduplicateHistory = (historyArr) => {
    if (!Array.isArray(historyArr)) return historyArr;
    const deduplicated = [];
    const seenIds = new Set();
    let lastUserContent = null;
    let lastUserTime = 0;
    let skippingDuplicateBlock = false;

    for (let i = 0; i < historyArr.length; i++) {
        const msg = historyArr[i];

        // 1. Deduplicate by explicit message_id
        if (msg.message_id && seenIds.has(msg.message_id)) {
            continue;
        }
        if (msg.message_id) seenIds.add(msg.message_id);

        if (msg.role === 'user') {
            const msgTime = new Date(msg.timestamp || msg.created_at || Date.now()).getTime();
            // 2. Handle User message retries (identical content within 2 mins)
            if (lastUserContent && lastUserContent === msg.content && (msgTime - lastUserTime < 120000)) {
                skippingDuplicateBlock = true;
                continue; // Skip this user message
            } else {
                skippingDuplicateBlock = false;
                lastUserContent = msg.content;
                lastUserTime = msgTime;
                deduplicated.push(msg);
            }
        } else {
            // 3. Handle Assistant message duplicates
            if (skippingDuplicateBlock) {
                // Skip assistant messages that belong to the duplicate user message block
                continue;
            }

            // [NEW ENHANCED] Check for identical content within the current conversation slice to avoid duplicates from history overlaps
            const contentExists = deduplicated.some(m =>
                m.role === msg.role &&
                m.assistant === msg.assistant &&
                m.content === msg.content &&
                (msg.message_id ? m.message_id === msg.message_id : true)
            );

            if (contentExists) {
                continue;
            }

            deduplicated.push(msg);
        }
    }
    return deduplicated;
};

const Chat = () => {
    const [showHeader, setShowHeader] = useState(true);
    const [sendingWaitMessage, setSendingWaitMessage] = useState("");
    const [isSendingToBackend, setIsSendingToBackend] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isUserTyping, setIsUserTyping] = useState(false);
    const [messageQueue, setMessageQueue] = useState([]);
    const [timerKey, setTimerKey] = useState(Date.now());
    const debounceTimerRef = useRef(null);
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

    const [sessionLogs, setSessionLogs] = useState([]);
    const [logsOpen, setLogsOpen] = useState(false);
    const addSessionLog = (msg) => {
        const now = new Date();
        const timeStr = `${now.toLocaleTimeString()}.${now.getMilliseconds().toString().padStart(3, '0')}`;
        const logEntry = `[${timeStr}] ${msg}`;
        setSessionLogs(prev => [...prev, logEntry]);
        console.log(logEntry);
    };

    const applyHistoryUpdate = (history) => {
        if (!history || !Array.isArray(history)) return;
        const mappedHistory = history.map(msg => ({
            ...msg,
            time: msg.time || formatTime(msg.timestamp) || formatTime(msg.created_at) || '',
            gurujiJson: tryParseJson(msg.guruji_json || msg.gurujiJson) || (msg.assistant === 'guruji' ? tryParseJson(msg.content) : null),
            mayaJson: tryParseJson(msg.maya_json || msg.mayaJson),
            psycologyJson: tryParseJson(msg.psycology_json || msg.psycologyJson),
            gurujiInput: tryParseJson(msg.guruji_input || msg.gurujiInput),
            paywall_level: msg.paywall_level,
            animating: false
        }));
        setMessages(deduplicateHistory(mappedHistory));
    };

    const deduplicateMessages = (msgs) => {
        if (!Array.isArray(msgs)) return msgs;
        return deduplicateHistory(msgs);
    };

    const [messages, setMessages] = useState([]);
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
    const [profileBirthStar, setProfileBirthStar] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

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
    const [insufficientFundsInfo, setInsufficientFundsInfo] = useState(null); // { required, balance }
    const [gurujiStarted, setGurujiStarted] = useState(new Set()); // tracks which guruji msgs have shown at least 1 bubble
    const [chatStarted, setChatStarted] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMovingToTop, setIsMovingToTop] = useState(false);
    const [connectionText, setConnectionText] = useState('Connecting to Guruji...');
    const [forceShowTyping, setForceShowTyping] = useState(false);
    const typingLockRef = useRef(null);
    const [readingPhaseStartTime, setReadingPhaseStartTime] = useState(null);
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);
    const processedNewSession = useRef(false);
    const processedPaymentRetry = useRef(false);
    const isAutoScrolling = useRef(false);
    const scrollTimeout = useRef(null);
    const latestGurujiRef = useRef(null); // ref to the top of the latest guruji response

    // Dynamic timer to force re-renders for status ticks
    // Only runs while a message is actively being sent (tick transitions need it).
    // When idle, no interval = no unnecessary re-renders.
    const [currentTime, setCurrentTime] = useState(Date.now());
    useEffect(() => {
        if (!isSendingToBackend) return;
        const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(interval);
    }, [isSendingToBackend]);

    // Keep "Astrologer is typing" overlay visible for at least 2s so animation completes
    useEffect(() => {
        if (sendingWaitMessage === 'Astrologer is typing') {
            setForceShowTyping(true);
            if (typingLockRef.current) clearTimeout(typingLockRef.current);
            typingLockRef.current = setTimeout(() => setForceShowTyping(false), 2000);
        }
        return () => { if (typingLockRef.current) clearTimeout(typingLockRef.current); };
    }, [sendingWaitMessage]);

    // Track when the reading phase starts so we can pre-show 'Astrologer is typing' 2s in
    useEffect(() => {
        const isReading = sendingWaitMessage === 'Sending to Astrologer' ||
            sendingWaitMessage === 'Sending to astrologer' ||
            sendingWaitMessage === 'Astrologer is reading your message';
        if (isReading) {
            setReadingPhaseStartTime(prev => prev ?? Date.now());
        } else {
            setReadingPhaseStartTime(null);
        }
    }, [sendingWaitMessage]);

    // Synchronize waitMessage overlay with user message animation
    const [userMsgPhase, setUserMsgPhase] = useState(2); // 0: Animating(0-3s), 1: Single Tick(3-4.5s), 2: Double Tick(>4.5s)
    const lastUserMsg = messages.slice().reverse().find(m => m.role === 'user');

    useEffect(() => {
        if (lastUserMsg && lastUserMsg.arrivalTime) {
            const elapsed = Date.now() - lastUserMsg.arrivalTime;
            if (elapsed < 3000) {
                setUserMsgPhase(0);
                const t1 = setTimeout(() => {
                    setUserMsgPhase(2);
                }, 3000 - elapsed);
                return () => clearTimeout(t1);
            } else {
                setUserMsgPhase(2);
            }
        }
    }, [lastUserMsg?.arrivalTime]);

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
        if (msg.isQueued) return null;

        const nextMsg = messages[idx + 1];
        const isLatestExchange = idx === messages.findLastIndex(m => m.role === 'user');


        // Check if a Guruji response has arrived
        let hasGurujiAnswer = false;
        for (let j = idx + 1; j < messages.length; j++) {
            if (messages[j].role === 'user') break;
            if (messages[j].assistant === 'guruji' || !!messages[j].guruji_json || !!messages[j].gurujiJson) {
                hasGurujiAnswer = true;
                break;
            }
        }

        const isGurujiActive = sendingWaitMessage === "Sending to Astrologer" || sendingWaitMessage === "Astrologer is reading your message" || sendingWaitMessage === "Astrologer is typing";
        const isMayaActive = sendingWaitMessage === "Sending to Maya";

        // Stage 3: Sent to Astrologer (Blue Double Tick)
        if (hasGurujiAnswer || (isGurujiActive && isLatestExchange)) {
            return <DoneAllOutlinedIcon sx={{ fontSize: '1.2rem', ml: 0.3, verticalAlign: 'middle', color: '#34B7F1' }} />;
        }

        // Check if next message is a Maya fallback/error/template message
        if (nextMsg && nextMsg.assistant === 'maya' &&
            (
                ['error', 'offline', 'unavailable'].some(kw => nextMsg.content?.toLowerCase().includes(kw)) ||
                nextMsg.mayaJson?.is_safety_warning || // Safety warning templates
                !nextMsg.trigger_guruji // Any other Maya-only terminal response
            )) {
            return <DoneOutlinedIcon sx={{ fontSize: '1.2rem', ml: 0.3, verticalAlign: 'middle', color: 'inherit', opacity: 0.7 }} />;
        }

        // Stage 2: Maya reading/processing (Grey Double Tick ✓✓)
        // Show single tick for first 2s so it's clearly visible before upgrading
        const timeSinceSent = msg.arrivalTime ? (currentTime - msg.arrivalTime) : Infinity;
        if (nextMsg || (isMayaActive && isLatestExchange && timeSinceSent >= 5000)) {
            return <DoneAllOutlinedIcon sx={{ fontSize: '1.2rem', ml: 0.3, verticalAlign: 'middle', color: 'inherit', opacity: 0.7 }} />;
        }

        // Stage 1: Single Tick — sent from device, not yet received by Maya
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

    const attemptGurujiRecovery = (currentHistory, currentLocalSid) => {
        const lastMsg = currentHistory[currentHistory.length - 1];
        const secondLastMsg = currentHistory.length > 1 ? currentHistory[currentHistory.length - 2] : null;

        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.assistant === 'maya' && secondLastMsg && secondLastMsg.role === 'user') {
            // Skip recovery if the user message requires payment but hasn't been paid
            if (secondLastMsg.requires_chat_payment && !secondLastMsg.is_paid) {
                console.log("DEBUG: Recovery skipped — user message requires payment but is not paid yet.");
                return;
            }

            const explicitlyTriggered = lastMsg.trigger_guruji === true;
            const contentLower = typeof lastMsg.content === 'string' ? lastMsg.content.toLowerCase() : '';
            const hasErrorKeyword = contentLower.includes('error') || contentLower.includes('sorry') || contentLower.includes('offline') || contentLower.includes('payment') || contentLower.includes('verified');
            const implicitlyTriggered = lastMsg.trigger_guruji === undefined && lastMsg.mayaJson && !lastMsg.mayaJson.is_safety_warning && !lastMsg.requires_chat_payment && !hasErrorKeyword;

            if (explicitlyTriggered || implicitlyTriggered) {
                if (!isSendingToBackend) {
                    console.log("DEBUG: Recovering missing Guruji response...");
                    const mobile = localStorage.getItem('mobile');
                    const historyForGuruji = currentHistory.length > 2 ? currentHistory.slice(1, -2) : [];
                    const sanitizedHistory = sanitizeHistory(historyForGuruji);
                    // const paymentId = secondLastMsg.is_paid ? secondLastMsg.payment_id : null;
                    const paymentId = (secondLastMsg.is_paid && secondLastMsg.payment_id) ? secondLastMsg.payment_id : null;
                    const idempotencyKey = secondLastMsg.message_id ? `${secondLastMsg.message_id}_guruji` : null;

                    // Support the same persistent guard used during payment auto-retry
                    const retryKey = secondLastMsg.message_id ? `retry_initiated_${secondLastMsg.message_id}` : null;
                    if (retryKey && sessionStorage.getItem(retryKey)) {
                        console.log("DEBUG: Recovering skipped as resumption is already in progress.");
                        return;
                    }

                    setIsSendingToBackend(true);
                    setSendingWaitMessage("Astrologer is typing");
                    fetchGurujiResponse(mobile, secondLastMsg.content, sanitizedHistory, currentLocalSid, paymentId, idempotencyKey);
                }
            }
        }
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
                    setIsHistoryLoaded(true);
                    return;
                }

                try {
                    const currentProfileId = localStorage.getItem('currentProfileId');
                    const res = await getChatHistory(mobile, currentProfileId);
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
                                    gurujiInput: tryParseJson(msg.guruji_input || msg.gurujiInput),
                                    animating: false
                                }));

                                const dedupHistory = deduplicateHistory(mappedHistory);
                                setMessages(dedupHistory);
                                setChatStarted(dedupHistory.some(m => m.role === 'user'));
                                attemptGurujiRecovery(dedupHistory, currentLocalSid);

                                // Check for unpaid chat messages to resume state
                                const unpaidMsg = dedupHistory.find(m => m.requires_chat_payment && !m.is_paid);
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

                        // Scenario 3: Load history (Relaxed logic + Parsing) ..
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
                                gurujiInput: tryParseJson(msg.guruji_input || msg.gurujiInput),
                                animating: false
                            }));

                            console.log("DEBUG: mappedHistory set, count:", mappedHistory.length);
                            const dedupHistory = deduplicateHistory(mappedHistory);
                            setMessages(dedupHistory);
                            setChatStarted(dedupHistory.some(m => m.role === 'user'));
                            attemptGurujiRecovery(dedupHistory, mostRecentSession.session_id);

                            const unpaidMsg = dedupHistory.find(m => m.requires_chat_payment && !m.is_paid);
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
                    setIsHistoryLoaded(true); // Unblock retry even on failure so it can show appropriate errors
                } finally {
                    setIsHistoryLoaded(true);
                }
            } else {
                setIsHistoryLoaded(true);
            }
        };
        loadHistory();
    }, [location.state]);

    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && !isSendingToBackend && messageQueue.length === 0 && userStatus === 'ready') {
                const mobile = localStorage.getItem('mobile');
                const currentLocalSid = localStorage.getItem('activeSessionId');

                if (mobile && currentLocalSid) {
                    const currentProfileId = localStorage.getItem('currentProfileId');
                    try {
                        const res = await getChatHistory(mobile, currentProfileId);
                        if (res.data.sessions && res.data.sessions.length > 0) {
                            const localSessionOnServer = res.data.sessions.find(s => s.session_id === currentLocalSid);
                            if (localSessionOnServer && !localSessionOnServer.is_ended) {
                                const history = localSessionOnServer.messages;
                                if (history && history.length > 0) {
                                    const mappedHistory = history.map(msg => ({
                                        ...msg,
                                        time: msg.time || formatTime(msg.timestamp) || formatTime(msg.created_at) || '',
                                        gurujiJson: tryParseJson(msg.guruji_json || msg.gurujiJson) || (msg.assistant === 'guruji' ? tryParseJson(msg.content) : null),
                                        mayaJson: tryParseJson(msg.maya_json || msg.mayaJson),
                                        psycologyJson: tryParseJson(msg.psycology_json || msg.psycologyJson),
                                        gurujiInput: tryParseJson(msg.guruji_input || msg.gurujiInput),
                                        animating: false
                                    }));

                                    const dedupHistory = deduplicateHistory(mappedHistory);

                                    setMessages(prev => {
                                        if (prev.length === 0) return prev;

                                        const lastLocal = prev[prev.length - 1];
                                        const hasLocalError = lastLocal?.role === 'assistant' && lastLocal?.assistant === 'maya' && (
                                            lastLocal.isLocalError === true ||
                                            (typeof lastLocal.content === 'string' && lastLocal.content.includes('Sorry, I encountered an error')) ||
                                            (typeof lastLocal.content === 'string' && lastLocal.content.includes('Guruji is not available right now')) ||
                                            (typeof lastLocal.content === 'string' && lastLocal.content.includes('Network Error')) ||
                                            (typeof lastLocal.content === 'string' && lastLocal.content.includes('network connection was interrupted')) ||
                                            (typeof lastLocal.content === 'string' && lastLocal.content.includes('taking a bit longer'))
                                        );

                                        if (hasLocalError || dedupHistory.length > prev.length) {
                                            attemptGurujiRecovery(dedupHistory, currentLocalSid);
                                            return dedupHistory;
                                        }
                                        return prev;
                                    });
                                }
                            }
                        }
                    } catch (err) {
                        console.error("Silent history reload failed:", err);
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isSendingToBackend, messageQueue.length, userStatus]);

    const scrollToTop = () => {
        if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

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
                setIsSubscribed(!!res.data.user_profile?.is_subscribed);
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
                            setIsSubscribed(!!pollRes.data.user_profile?.is_subscribed);
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
        setMessages([]);
        setSessionId(newSid);
        localStorage.setItem('activeSessionId', newSid);
        setSummary(null);
        setFeedback({ rating: 0, comment: '' });
        setFeedbackSubmitted(false);
        setChatStarted(false);
        setInsufficientFundsInfo(null);

        // Register the new session on the server immediately so it survives page reload
        const mobile = localStorage.getItem('mobile');
        if (mobile) {
            const currentProfileId = localStorage.getItem('currentProfileId');
            startSession(mobile, newSid, currentProfileId).catch(err => console.error('Failed to register session:', err));
        }
    };

    const handleEndChat = async (keepFeedback = false) => {
        if (messages.length < 1) return;
        setShowInactivityPrompt(false);
        setLoading(true);
        try {
            const mobile = localStorage.getItem('mobile');
            const currentProfileId = localStorage.getItem('currentProfileId');
            const res = await endChat(mobile, messages, sessionId, currentProfileId);
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


    // const sanitizeHistory = (h) => {
    //     if (!Array.isArray(h)) return [];
    //     return h.map(m => ({
    //         role: m.role || 'user',
    //         content: m.content || ''
    //     }));  ///
    // };

    const sanitizeHistory = (h) => {
        if (!Array.isArray(h)) return [];
        return h.map(m => ({
            role: m.role || 'user',
            content: m.content || '',
            timestamp: m.timestamp || new Date().toISOString(),
            assistant: m.assistant || 'maya',
        }));
    };

    const fetchGurujiResponse = async (mobile, text, history, sessionId, paymentId = null, idempotencyKey = null) => {
        setLoading(true);
        setIsSendingToBackend(true);
        setSendingWaitMessage("Sending to Astrologer");
        addSessionLog("Wait State: Sending to Astrologer");
        console.log(`[${getCurrentTime()}] Wait State: Sending to Astrologer`);

        try {
            const referenceid = localStorage.getItem('currentProfileId');
            const sanitizedHistory = sanitizeHistory(history);
            addSessionLog(`Guruji receiving message: ${text}`);
            console.log(`[${getCurrentTime()}] Guruji receiving message:`, text);
            const startTime = Date.now();
            const res = await getGurujiResponse(mobile, text, sanitizedHistory, sessionId, paymentId, referenceid, idempotencyKey);
            const duration = Date.now() - startTime;
            addSessionLog(`Guruji API responded in ${duration}ms`);
            setSendingWaitMessage("Astrologer is typing");
            addSessionLog("Wait State: Astrologer is typing");
            console.log(`[${getCurrentTime()}] Wait State: Astrologer is typing`);
            const { answer, metrics, context, assistant, wallet_balance, amount, maya_json, guruji_json, psycology_json, guruji_input, bubbles, delays, timestamp, message_id } = res.data;
            addSessionLog(`Guruji replied with: ${answer.substring(0, 50)}...`);
            console.log(`[${getCurrentTime()}] Guruji replied with:`, answer);
            if (wallet_balance !== undefined) setWalletBalance(wallet_balance);

            setMessages(prev => {
                const newMsg = {
                    role: 'assistant',
                    content: answer,
                    assistant: 'guruji',
                    metrics,
                    context,
                    amount,
                    rawResponse: res.data,
                    mayaJson: tryParseJson(maya_json),
                    gurujiJson: tryParseJson(guruji_json),
                    psycologyJson: tryParseJson(psycology_json),
                    gurujiInput: tryParseJson(guruji_input),
                    bubbles: bubbles || [],
                    delays: delays || [],
                    animating: true,
                    message_id: message_id,
                    time: timestamp ? formatTime(timestamp) : getCurrentTime(),
                    timestamp: timestamp || new Date().toISOString(),
                    arrivalTime: Date.now()
                };

                return deduplicateMessages([...prev, newMsg]);
            });
            if (guruji_json) {
                setIsAnimating(true);
            } else {
                setIsSendingToBackend(false);
                setSendingWaitMessage("");
            }
        } catch (err) {
            console.error("Guruji Error:", err);
            addSessionLog(`Guruji Error: ${err.message || 'Unknown error'}`);

            // const isTimeout = err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout'));
            // const isNetworkError = !err.response && (err.message === 'Network Error' || isTimeout);
            const isTimeout = err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout'));
            const isCancelled = err.code === 'ERR_CANCELED' || axios.isCancel(err);
            // Treat anything with NO server response as a network/connectivity issue for silent recovery
            const isNetworkError = !err.response && (err.message === 'Network Error' || isTimeout || isCancelled || !err.status);
            const isDuplicate = err.response?.status === 409;

            if (isNetworkError || isDuplicate) {
                addSessionLog(isNetworkError ? "Network dropped. Entering silent recovery polling..." : "Duplicate request. Checking for existing response...");
                console.log(isNetworkError ? "Network dropped. Entering silent recovery polling..." : "Duplicate request. Checking for existing response...");
                setSendingWaitMessage("Astrologer is typing");

                let recovered = false;
                for (let i = 0; i < 10; i++) {
                    addSessionLog(`Recovery attempt ${i + 1}/10...`);

                    await new Promise(resolve => setTimeout(resolve, 4000));
                    try {
                        const currentProfileId = localStorage.getItem('currentProfileId');
                        const historyRes = await getChatHistory(mobile, currentProfileId);
                        if (historyRes.data.sessions && historyRes.data.sessions.length > 0) {
                            const thisSession = historyRes.data.sessions.find(s => s.session_id === sessionId);
                            if (thisSession && thisSession.messages) {
                                const lastServerMsg = thisSession.messages[thisSession.messages.length - 1];
                                if (lastServerMsg && (lastServerMsg.assistant === 'guruji' || lastServerMsg.role === 'guruji' || lastServerMsg.guruji_json)) {
                                    addSessionLog("Recovered Guruji response from background!");
                                    console.log("Recovered Guruji response from background!");
                                    applyHistoryUpdate(thisSession.messages);
                                    recovered = true;
                                    break;
                                }
                            }
                        }
                    } catch (pollErr) {
                        console.error("Poll error during silent recovery:", pollErr);
                    }
                }

                if (recovered) {
                    setIsSendingToBackend(false);
                    setSendingWaitMessage("");
                    setLoading(false);
                    return;
                } else {
                    addSessionLog("Recovery failed after maximum attempts.");
                }

                if (isDuplicate && !recovered) {
                    const errMsg = "Guruji is contemplating your stars deeply. This may take another moment, your answer will appear shortly. You can also refresh the page.";
                    setMessages(prev => [...prev, {
                        role: 'assistant', assistant: 'maya', content: errMsg, time: getCurrentTime(), isLocalError: true
                    }]);
                    setIsSendingToBackend(false);
                    setSendingWaitMessage("");
                    setLoading(false);
                    return;
                }
            }

            if (isTimeout || isNetworkError) {
                window.location.reload();
                return;
            }

            const errMsg = err.response?.data?.detail || err.message || 'Guruji is not available right now. Please try again after some time.';
            setMessages(prev => [...prev, {
                role: 'assistant',
                assistant: 'maya',
                content: errMsg,
                time: getCurrentTime(),
                isLocalError: true
            }]);
            setIsSendingToBackend(false);
            setSendingWaitMessage("");
        } finally {
            setLoading(false);
        }
    };


    // Effect to handle Typing interrupts and 3s sending delay
    useEffect(() => {
        if (isUserTyping && messageQueue.length > 0) {
            // User started typing! Pause the timer, do nothing.
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }
        } else if (!isUserTyping && messageQueue.length > 0) {
            // Typing stopped or just sent a message. Start/restart timer.
            const now = Date.now();
            setTimerKey(now);

            // Sync arrival time for queued messages so they restart animation together
            setMessages(prev => {
                const next = [...prev];
                const lastIdx = next.length - 1;
                // Since we append, there is exactly ONE queued user message at the very end.
                if (lastIdx >= 0 && next[lastIdx].role === 'user' && next[lastIdx].isQueued) {
                    next[lastIdx] = { ...next[lastIdx], arrivalTime: now };
                }
                return next;
            });

            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
                processQueue(messageQueue);
                setMessageQueue([]);
                debounceTimerRef.current = null;
            }, 3000);
        }

        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [isUserTyping, messageQueue]);

    const handleStartConsultation = () => {
        setIsMovingToTop(true);
        scrollToTop();

        // Delay starting the connection to allow the "move up" animation to show
        setTimeout(() => {
            const capitalizedUserName = userName ? userName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : ' ';
            const welcomeMsg = {
                role: 'assistant',
                content: `<b>${capitalizedUserName}, welcome.</b>\n\nI'm <b>MAYA</b>, and I'll assist you during your consultation.\n\nWhenever you're ready, you may begin your conversation with <b>Guruji</b> by pressing the button below.\n\nYou may ask about your life, your future, or anything that has been on your mind.`,
                assistant: 'maya',
                time: getCurrentTime(),
                timestamp: new Date().toISOString()
            };

            // Immediately add welcome message to chat history
            setMessages([welcomeMsg]);
            setIsConnecting(true);
            setConnectionText('Connecting to Guruji...');

            // Simulate connecting animation
            const connectingTime = Math.floor(Math.random() * 2000) + 3000;

            setTimeout(() => {
                setConnectionText('Connected to Guruji');

                // Show "Connected" for 2 seconds before opening input and showing messages
                setTimeout(() => {
                    const systemMsg = {
                        role: 'system',
                        content: 'Connected to Guruji',
                        time: getCurrentTime(),
                        timestamp: new Date().toISOString()
                    };
                    const mayaConnectedMsg = {
                        role: 'assistant',
                        content: `<b>You're now connected with Guruji. He is online.</b>\n\nWhenever you're ready, you may ask your question.`,
                        assistant: 'maya',
                        time: getCurrentTime(),
                        timestamp: new Date().toISOString(),
                    };

                    setMessages(prev => [...prev, systemMsg, mayaConnectedMsg]);
                    setChatStarted(true);
                    setIsConnecting(false);
                    setIsMovingToTop(false);
                }, 2000);
            }, connectingTime);
        }, 600); // Wait for initial scroll/slide
    };

    const handleSend = async (content) => {
        const text = typeof content === 'string' ? content : input;
        if (!text.trim() || loading || userStatus !== 'ready') return;

        const now = Date.now();
        setMessages(prev => {
            const next = [...prev];
            const lastIdx = next.length - 1;
            // If the last message is ALSO queued, just append to it visually.
            // This treats the whole clump as one combined user input bubble!
            if (lastIdx >= 0 && next[lastIdx].role === 'user' && next[lastIdx].isQueued) {
                // Combine with newline only if preceding content doesn't end with one
                const separator = next[lastIdx].content.endsWith('\n') ? '' : '\n';
                next[lastIdx] = {
                    ...next[lastIdx],
                    content: (next[lastIdx].content + separator + text.trim()).trim(),
                    arrivalTime: now,
                    time: getCurrentTime()
                };
            } else {
                const userMsg = { role: 'user', content: text.trim(), time: getCurrentTime(), timestamp: new Date().toISOString(), arrivalTime: now, isQueued: true };
                next.push(userMsg);
            }
            return next;
        });

        // Always clear the input field after sending
        setInput('');

        // Add to state queue; this naturally triggers the useEffect which starts the 3s timer
        setMessageQueue(prev => [...prev, text]);

        // Because the message is sent, the user is no longer typing
        setIsUserTyping(false);

        scrollToBottom();
    };

    const handleEditQueuedMessage = () => {
        if (messageQueue.length === 0 || loading || userStatus !== 'ready') return;

        // Cancel the timer so the message doesn't get sent
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }

        // Combine all currently queued text to edit
        const combinedText = messageQueue.join('\n');

        // Put the text back into the input field
        setInput(combinedText);

        // Remove the queued messages from the visual chat history
        setMessages(prev => {

            return prev.filter(m => !m.isQueued);
        });

        // Clear the conceptual queue
        setMessageQueue([]);

        // Optionally, focus the input field by treating it as if the user is typing again
        setIsUserTyping(true);
    };

    const processQueue = async (queuedMessages) => {
        if (queuedMessages.length === 0 || loading || userStatus !== 'ready') return;

        const combinedText = queuedMessages.map(m => m.trim()).filter(m => m !== '').join('\n');

        // Reset global report state for the new interaction ONLY if not preparing a report
        if (reportState === 'IDLE' || reportState === 'READY') {
            setReportState('IDLE');
            setReadyReportData(null);
            setActiveCategory(null);
            setActiveQuestion(null);
            setActiveReportIndex(null);
        }

        setLoading(true);
        setIsSendingToBackend(true);
        scrollToBottom();
        setSendingWaitMessage("Sending to Maya");

        let trigger_guruji_flag = false;
        try {
            const mobile = localStorage.getItem('mobile');
            if (!mobile) {
                localStorage.clear();
                navigate('/');
                return;
            }

            // In React Strict Mode, setMessages can be called twice, so NEVER put an API side effect inside it!
            // Instead, we derive the history synchronously from the CURRENT 'messages' closure.
            // Since this function is debounced, 'messages' array from the last render before timers completed
            // contains the queued message block exactly as its last element.
            let historyWithoutNewlyQueued = messages.length > 1 ? messages.slice(1, -1) : [];
            // Remove the 'isQueued' flag from history objects just to be clean
            historyWithoutNewlyQueued = historyWithoutNewlyQueued.map(m => m.isQueued ? { ...m, isQueued: false } : m);

            setMessages(prev => {
                // Mark all currently queued messages as no longer queued in the UI
                return prev.map(m => m.isQueued ? { ...m, isQueued: false } : m);
            });

            // Call backend ONCE securely outside the state setter.
            const sanitizedHistory = sanitizeHistory(historyWithoutNewlyQueued);
            const idempotencyKey = `REQ_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            sendToBackend(mobile, combinedText, sanitizedHistory, idempotencyKey);

        } catch (err) {
            console.error("Queue Processing Error:", err);
            setLoading(false);
            setIsSendingToBackend(false);
        }
    };

    const sendToBackend = async (mobile, combinedText, history, idempotencyKey = null) => {
        let trigger_guruji_flag = false;
        try {
            addSessionLog(`Sending message to Maya: ${combinedText}`);
            console.log(`[${getCurrentTime()}] Sending message to Maya:`, combinedText);
            const startTime = Date.now();
            const currentProfileId = localStorage.getItem('currentProfileId');
            const res = await sendMessage(mobile, combinedText, history, sessionId, null, currentProfileId, idempotencyKey);
            const duration = Date.now() - startTime;
            addSessionLog(`Maya API responded in ${duration}ms`);

            // Handle rate limit / offline
            if (res.data.error_code === 'ASTROLOGER_OFFLINE') {
                addSessionLog("Maya: Astrologer is offline");
                setSendingWaitMessage("Astrologer is offline");
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: res.data.answer || 'Guruji is currently unavailable. Please try again shortly.',
                    assistant: 'maya',
                    time: res.data.timestamp ? formatTime(res.data.timestamp) : getCurrentTime(),
                    timestamp: res.data.timestamp || new Date().toISOString()
                }]);
                setLoading(false);
                setIsSendingToBackend(false);
                return;
            }

            if (res.data.requires_payment) {
                addSessionLog("Maya: Requires payment");
                setLoading(false);
                setIsSendingToBackend(false);
                setSendingWaitMessage("");

                // Update the last user message with payment flags
                setMessages(prev => {
                    const next = [...prev];
                    const lastIdx = next.length - 1;
                    if (next[lastIdx].role === 'user') {
                        next[lastIdx] = {
                            ...next[lastIdx],
                            requires_chat_payment: true,
                            chat_payment_amount: res.data.amount,
                            actual_chat_payment_amount: res.data.actual_amount,
                            is_paid: false,
                            message_id: res.data.message_id,
                            mayaJson: tryParseJson(res.data.maya_json),
                            psycologyJson: tryParseJson(res.data.psycology_json),
                            paywall_level: res.data.paywall_level
                        };
                    }
                    return next;
                });

                setChatPaymentState('REQUIRED');
                setPendingMessageId(res.data.message_id);
                setActiveQuestion(combinedText);
                return;
            }

            const { answer, metrics, context, assistant, wallet_balance, amount, maya_json, guruji_json, psycology_json, bubbles, delays, timestamp, message_id, trigger_guruji } = res.data;
            trigger_guruji_flag = trigger_guruji;

            addSessionLog(`Maya replied with: ${answer.substring(0, 50)}...`);
            console.log(`[${getCurrentTime()}] Maya replied with:`, answer);

            if (wallet_balance !== undefined) setWalletBalance(wallet_balance);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: answer,
                assistant: assistant || 'maya',
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
                timestamp: timestamp || new Date().toISOString(),
                arrivalTime: Date.now(),
                trigger_guruji: trigger_guruji // Store this for tick logic

            }]);
            if (trigger_guruji) {
                setSendingWaitMessage("Sending to Astrologer");
                setIsSendingToBackend(true);
                // Use the Maya message_id for deterministic idempotency
                const gurujiIdempotency = message_id ? `${message_id}_guruji` : (idempotencyKey ? `${idempotencyKey}_guruji` : null);
                await fetchGurujiResponse(mobile, combinedText, history, sessionId, null, gurujiIdempotency);
            }


        } catch (err) {
            console.error("Chat Error:", err);
            // const isTimeout = err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout'));
            // const isNetworkError = !err.response && (err.message === 'Network Error' || isTimeout);
            const isTimeout = err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout'));
            const isCancelled = err.code === 'ERR_CANCELED' || axios.isCancel(err);
            // Treat anything with NO server response as a network/connectivity issue for silent recovery
            const isNetworkError = !err.response && (err.message === 'Network Error' || isTimeout || isCancelled || !err.status);
            if (err.response?.status === 409) {
                console.log("Duplicate Maya request detected, trusting backend process.");
                return;
            }
            // If it's a 404/401/403, the interceptor will handle redirect to login
            // Only show error message for other types of errors
            if (err.response?.status !== 404 && err.response?.status !== 401 && err.response?.status !== 403) {
                if (isTimeout || isNetworkError) {
                    window.location.reload();
                    return;
                }
                
                const errMsg = err.response?.data?.detail || err.message || 'Sorry, I encountered an error. Please try again.';

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    assistant: 'maya',
                    content: errMsg,
                    time: getCurrentTime(),
                    isLocalError: true
                }]);
            }
        } finally {
            setLoading(false);
            if (!trigger_guruji_flag) {
                setIsSendingToBackend(false);
                setSendingWaitMessage("");
            }
            scrollToBottom();
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

                const referenceid = localStorage.getItem('currentProfileId');
                // const res = await generateReport(mobile, category || 'general', question, sessionId, msgId);
                const res = await generateReport(mobile, category || 'general', question, sessionId, msgId, referenceid);

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
            // const orderRes = await createPaymentOrder(amount, mobile);
            const referenceid = localStorage.getItem('currentProfileId');
            const orderRes = await createPaymentOrder(amount, mobile, referenceid);
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
            setInsufficientFundsInfo(null);
            setThankYouAction('CHAT_PAYMENT');
            setThankYouOpen(false);

            // Proceed to process the message after payment
            setLoading(true);
            setIsSendingToBackend(true);
            setSendingWaitMessage("Sending to astrologer");

            const mobile = localStorage.getItem('mobile');

            // Find the pending user message to retry its state
            const lastUserMsg = messages.find(m => m.message_id === pendingMessageId);

            if (!lastUserMsg) {
                console.error("DEBUG [handleChatSuccess]: Could not find pending message with ID:", pendingMessageId);
                console.log("Current messages in state:", messages.map(m => m.message_id));
                // Try fallback: if messages exists, use the last user message that requires payment
                const fallbackMsg = [...messages].reverse().find(m => m.role === 'user' && m.requires_chat_payment);
                if (fallbackMsg) {
                    console.log("DEBUG [handleChatSuccess]: Using fallback message:", fallbackMsg.message_id);
                    setPendingMessageId(fallbackMsg.message_id);
                    // Continue with fallback
                } else {
                    throw new Error("Unable to locate your question in chat history to complete the payment. Please refresh the page.");
                }
            }

            const targetMsg = lastUserMsg || messages.find(m => m.role === 'user' && m.requires_chat_payment);

            // Mark the user message as paid in UI
            setMessages(prev => {
                const next = [...prev];
                const userIdx = next.findIndex(m => m.message_id === pendingMessageId);
                if (userIdx !== -1) {
                    next[userIdx].is_paid = true;
                    next[userIdx].payment_id = paymentId;
                }
                return next;
            });

            // Call Guruji directly — Maya's classification is already saved in DB
            const history = messages;
            const sanitizedHistory = sanitizeHistory(history);
            const idempotencyKey = (targetMsg.message_id || pendingMessageId) ? `${targetMsg.message_id || pendingMessageId}_guruji_${Date.now()}` : null;

            await fetchGurujiResponse(mobile, targetMsg.content, sanitizedHistory, sessionId, paymentId, idempotencyKey);
            setChatPaymentState('IDLE');
            setPendingMessageId(null);
        } catch (err) {
            console.error("Chat success processing failed:", err);
            alert("Error processing your request. Please contact support.");
            setChatPaymentState('REQUIRED');
        } finally {
            setLoading(false);
        }
    };

    const handleChatPayment = async (amount, mobile) => {
        if (amount === 0) {
            setChatPaymentState('PAYING');
            handleChatSuccess("FREE_QUOTA", amount);
            return;
        }

        setChatPaymentState('PAYING');
        setInsufficientFundsInfo(null);
        try {
            const referenceid = localStorage.getItem('currentProfileId');

            // Deduct from wallet
            const response = await payForChat({
                mobile,
                referenceid,
                amount,
                description: `Payment for question: ${activeQuestion ? activeQuestion.substring(0, 30) : ''}...`
            });

            if (response.data && response.data.success) {
                // Payment successful
                handleChatSuccess(response.data.transaction_id, amount);
            } else {
                throw new Error("Wallet deduction failed: logic error or insufficient funds.");
            }

        } catch (err) {
            console.error("Wallet deduction failed:", err);

            // Show inline insufficient funds notification instead of redirecting
            setChatPaymentState('REQUIRED');
            setInsufficientFundsInfo({
                required: amount,
                balance: walletBalance
            });
        }
    };

    // Auto-retry payment after returning from Recharge/Wallet
    useEffect(() => {
        const pendingChatPaymentStr = localStorage.getItem('pendingChatPayment');
        const mobile = localStorage.getItem('mobile');

        if (pendingChatPaymentStr && userStatus === 'ready' && isHistoryLoaded) {
            try {
                const pendingChatPayment = JSON.parse(pendingChatPaymentStr);
                const retryKey = `retry_initiated_${pendingChatPayment.pendingMessageId}`;
                const alreadyRetryStarted = sessionStorage.getItem(retryKey);

                if (pendingChatPayment && pendingChatPayment.amount !== undefined && pendingChatPayment.sessionId === sessionId && !alreadyRetryStarted) {
                    console.log("DEBUG [Chat]: Auto-retrying payment for message:", pendingChatPayment.pendingMessageId);
                    sessionStorage.setItem(retryKey, 'true'); // Guard against re-entry sustainably
                    localStorage.removeItem('pendingChatPayment'); // Prevent re-trigger on next render

                    setChatPaymentState('REQUIRED');
                    setPendingMessageId(pendingChatPayment.pendingMessageId);
                    setActiveQuestion(pendingChatPayment.activeQuestion);

                    setTimeout(() => {
                        handleChatPayment(pendingChatPayment.amount, mobile);
                    }, 800);
                } else if (alreadyRetryStarted) {
                    localStorage.removeItem('pendingChatPayment');
                }
            } catch (e) {
                console.error("Failed to parse pending payment", e);
                localStorage.removeItem('pendingChatPayment');
            }
        }
    }, [location.state, userStatus, sessionId, isHistoryLoaded]);

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
                profilebirthstar={profileBirthStar}
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
                    transition: 'transform 0.3s ease-in-out',
                    // width: 'fit-content',
                    height: 40,
                    // borderRadius: 100,

                }}>
                    <Box sx={{ pointerEvents: 'auto', }}>
                        <PrimaryButton
                            label="End Consultation"
                            onClick={() => setFeedbackDrawerOpen(true)}
                            // disabled={loading || messages.length < 1}
                            startIcon={<img src="/svg/close-icon.svg" alt="close" style={{ width: 16, height: 16, marginLeft: 5 }} />}
                            sx={{
                                width: 'fit-content',
                                borderRadius: isSubscribed ? '50px' : '50px 0 0 50px',
                                bgcolor: '#EC2222',
                                fontWeight: 'normal',
                                fontSize: '14px',
                                py: .5,
                                borderRight: '2px solid #fff',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1) !important',
                            }}
                        />
                        {!isSubscribed && (
                            <PrimaryButton
                                label="Subscribe Now"
                                onClick={() => setFeedbackDrawerOpen(true)}
                                // disabled={loading || messages.length < 1}
                                startIcon={<img src="/svg/subscribe.svg" alt="Subscribe" style={{ width: 16, height: 16, marginLeft: 5 }} />}
                                sx={{
                                    width: 'fit-content',
                                    borderRadius: '0 50px 50px 0',
                                    bgcolor: '#54A170',
                                    fontWeight: 'normal',
                                    py: .5,
                                    fontSize: '14px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1) !important',
                                }}
                            />
                        )}
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
                // onSuccess={(amt) => {
                onSuccess={(amt, res) => {
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
                        // referenceId: response.referenceId,
                        // referenceId: res?.razorpay_payment_id || 'N/A'
                        referenceId: response.referenceId || 'N/A'
                    });
                    setThankYouOpen(true);
                }}
            />


            {/* Chat Messages Area - Scrollable segment with visible scrollbar */}
            <Box
                ref={containerRef}
                onScroll={handleScroll}
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
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
                    const idx = i;

                    if (msg.role === 'system') {
                        return (
                            <Box key={i} sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: 2 }}>
                                <Typography sx={{
                                    bgcolor: '#fdf6ec',
                                    px: 6,
                                    py: .6,
                                    borderRadius: 10,
                                    fontSize: '0.75rem',
                                    color: '#2e1f0c',
                                    fontWeight: 400,
                                    // textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {msg.content}
                                </Typography>
                            </Box>
                        );
                    }

                    const isLastQueuedMsg = i === messages.findLastIndex(m => m.isQueued);

                    let isPaidUserMsg = false;
                    for (let j = i - 1; j >= 0; j--) {
                        if (messages[j].role === 'user') {
                            isPaidUserMsg = !!messages[j].requires_chat_payment;
                            break;
                        }
                    }

                    if (msg.assistant === 'maya' && !msg.isSimple) {
                        if (!msg.content || (typeof msg.content === 'string' && msg.content.trim() === '')) {
                            return null;
                        }
                        return (
                            <MayaIntro
                                key={i}
                                title={msg.title || msg.mayaJson?.title || " "}
                                // name={i === 0 ? userName : null}
                                content={msg.content}
                                mayaJson={msg.mayaJson}
                                psycologyJson={msg.psycologyJson}
                                rawResponse={msg.rawResponse}
                                // time={msg.time}
                                jsonVisibility={jsonVisibility}
                                onLabelClick={handleLabelClick}
                                sx={{ fontSize: '.9rem', fontWeight: 400 }}
                            />
                        );
                    }

                    const gurujiData = msg.gurujiJson || (msg.assistant === 'guruji' ? tryParseJson(msg.content) : null);

                    if (gurujiData && msg.assistant === 'guruji') {
                        const startedCond = !msg.animating || gurujiStarted.has(i);
                        return (
                            <Box key={i} ref={i === messages.length - 1 ? latestGurujiRef : null} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 0, width: '100%' }}>
                                {startedCond && <Typography sx={{ fontSize: '0.75rem', color: '#acacac', fontWeight: 400, pointerEvents: 'none', mb: 0 }}>Guruji</Typography>}
                                <Box sx={{ flex: 1, maxWidth: '85%' }}>
                                    <SequentialResponse
                                        // isPaidResponse={isPaidUserMsg}
                                        isPaidResponse={isPaidUserMsg || isSubscribed}
                                        gurujiJson={gurujiData}
                                        bubbles={msg.bubbles || []}
                                        delays={msg.delays || []}
                                        animate={msg.animating}
                                        onComplete={() => {
                                            setIsAnimating(false);
                                            setIsSendingToBackend(false);
                                            setSendingWaitMessage("");
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
                                            {(msg.gurujiInput?.replacements && jsonVisibility.guruji) && (
                                                <Typography
                                                    onClick={() => handleLabelClick(msg.gurujiInput.replacements, 'PROMPT REPLACEMENTS')}
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        color: '#54A170',
                                                        fontWeight: 800,
                                                        cursor: 'pointer',
                                                        textTransform: 'uppercase',
                                                        textDecoration: 'underline',
                                                        '&:hover': { opacity: 0.8 }
                                                    }}
                                                >
                                                    Replacements
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
                                            {(jsonVisibility.guruji || jsonVisibility.maya) && (
                                                <Typography
                                                    onClick={() => setLogsOpen(true)}
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        color: '#666',
                                                        fontWeight: 800,
                                                        cursor: 'pointer',
                                                        textTransform: 'uppercase',
                                                        textDecoration: 'underline',
                                                        '&:hover': { color: '#F36A2F' }
                                                    }}
                                                >
                                                    Logs
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
                                                text={`Translated to your language / language style by MAYA AI`}
                                                sx={{ mt: reportState === 'IDLE' ? '3px' : '3px', position: 'relative', top: -9 }}
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
                                    <Typography sx={{ fontSize: '0.75rem', color: '#acacac', fontWeight: 400, pointerEvents: 'none', mb: 0, mr: 0 }}>You</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flexDirection: 'row-reverse', maxWidth: '90%' }}>
                                        <Box sx={{
                                            p: '12px 16px 14px 12px',
                                            borderRadius: msg.role === 'user' ? '10px 2px 10px 10px' : '2px 10px 10px 10px',
                                            bgcolor: msg.role === 'user' ? '#2f3148' : '#fece8d',
                                            borderRight: msg.role === 'user' ? '2.5px solid #54A170' : 'none',
                                            borderLeft: msg.role !== 'user' ? '2.5px solid #F36A2F' : 'none',
                                            color: msg.role === 'user' ? '#fff' : '#000',
                                            position: 'relative',
                                            maxWidth: '325px',
                                            minWidth: '100px',
                                            width: 'fit-content',
                                            overflowWrap: "break-word",
                                            wordBreak: "break-word",
                                        }}>
                                            {msg.assistant === 'maya' ? (
                                                <Typography
                                                    variant="body2"
                                                    sx={{ lineHeight: 1.6, fontSize: '0.9rem', m: 0, mb: .5 }}
                                                >
                                                    <SafeHTML html={msg.content} />
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.9rem', m: 0, mb: .5, whiteSpace: 'pre-line' }}>
                                                    {msg.content}
                                                </Typography>
                                            )}
                                            <Typography sx={{ fontSize: '0.625rem', opacity: 0.8, position: 'absolute', bottom: 2, right: 8, color: msg.role === 'user' ? '#fff' : '#333', fontWeight: 500, pt: 1, display: 'flex', alignItems: 'center' }}>
                                                {msg.time}
                                                {msg.role === 'user' && renderStatusTicks(i)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {showTranslationIndicator && (
                                        <TranslationIndicator
                                            // text={`Translated from English to ${msg.mayaJson.language_detected} for the user`}
                                            text={`Translated to astrologer's language by MAYA AI`}
                                            sx={{ mt: reportState === 'IDLE' ? '3px' : '3px', position: 'relative', top: 0 }}
                                        />
                                    )}
                                </Box>
                                <MayaTemplateBox
                                    // name={userName.split(' ')[0]}
                                    // content={msg.chat_payment_amount === 0
                                    //     ? `<span style="font-weight: 800;">This is a premium prediction worth ₹${msg.actual_chat_payment_amount || 39} - but get it for free now.</span> \n\n <span style="color: #54A170">Subscribe</span> to get unlimited answers access for a day, month or a quarter.`
                                    //     : `<span style="font-weight: 800;">This is a premium prediction.</span>\n Get the answer for <span style="text-decoration: line-through;">₹${msg.actual_chat_payment_amount || 39}</span> ₹${msg.chat_payment_amount || 39}.<p style="margin-top: 15px;">Or you may <span style="color: #54A170; text-decoration: underline;">subscribe now</span> <span style="font-weight: 800;">to get unlimited answers access </span>for a day, month or a quarter.</p>`}
                                    content={(() => {
                                        const amount = msg.chat_payment_amount !== undefined ? msg.chat_payment_amount : 39;
                                        const actualAmount = msg.actual_chat_payment_amount || 39;
                                        const level = msg.paywall_level || 'LEVEL_1';

                                        if (amount === 0) {
                                            let levelBadge = '';
                                            if (level === 'LEVEL_2') levelBadge = ' <span style="color: #F36A2F; font-weight: 900;">[PRIORITY]</span>';
                                            if (level === 'LEVEL_3') levelBadge = ' <span style="color: #F36A2F; font-weight: 900;">[EXCLUSIVE]</span>';

                                            return `<span style="font-weight: 800;">This is a premium prediction${levelBadge} worth ₹${actualAmount} - but get it for free now.</span> \n\n <span style="color: #54A170">Subscribe</span> to get unlimited answers access for a day, month or a quarter.`;
                                        } else {
                                            let title = 'This is a premium prediction.';
                                            if (level === 'LEVEL_2') title = 'This is a <span style="color: #F36A2F;">Level 2</span> prediction.';
                                            if (level === 'LEVEL_3') title = 'This is an <span style="color: #F36A2F;">Level 3</span>.';

                                            return `<span style="font-weight: 800;">${title}</span>\n Get the answer for <span style="text-decoration: line-through;">₹${actualAmount}</span> ₹${amount}.<p style="margin-top: 15px;">Or you may <span style="color: #54A170; text-decoration: underline;">subscribe now</span> <span style="font-weight: 800;">to get unlimited answers access </span>for a day, month or a quarter.</p>`;
                                        }
                                    })()}
                                    buttonLabel={(() => {
                                        const lastPaymentMsgIdx = messages.reduce((last, m, idx) => m.requires_chat_payment ? idx : last, -1);
                                        const isOldPayment = i < lastPaymentMsgIdx;
                                        const hasNewerUserMsg = messages.slice(i + 1).some(m => m.role === 'user');
                                        if (isOldPayment || hasNewerUserMsg) return "No longer active";
                                        return chatPaymentState === 'REQUIRED' || chatPaymentState === 'IDLE'
                                            ? (msg.chat_payment_amount === 0 ? "Get answer for FREE" : `Get answer for&nbsp;<span style="text-decoration: line-through; ">₹${msg.actual_chat_payment_amount || 39}</span> &nbsp;₹${msg.chat_payment_amount || 39}`)
                                            : "Processing...";
                                    })()}
                                    onButtonClick={() => handleChatPayment(msg.chat_payment_amount !== undefined ? msg.chat_payment_amount : 39, localStorage.getItem('mobile'))}
                                    // onButtonClick={() => handleChatPayment(msg.chat_payment_amount || 39, localStorage.getItem('mobile'))}
                                    loading={chatPaymentState === 'PAYING' && i === messages.reduce((last, m, idx) => m.requires_chat_payment ? idx : last, -1)}
                                    disabled={(() => {
                                        const lastPaymentMsgIdx = messages.reduce((last, m, idx) => m.requires_chat_payment ? idx : last, -1);
                                        const isOldPayment = i < lastPaymentMsgIdx;
                                        const hasNewerUserMsg = messages.slice(i + 1).some(m => m.role === 'user');
                                        if (isOldPayment || hasNewerUserMsg) return true;
                                        return chatPaymentState === 'PAYING' || chatPaymentState === 'COMPLETE';
                                    })()}
                                />
                                {insufficientFundsInfo && i === messages.reduce((last, m, idx) => m.requires_chat_payment ? idx : last, -1) && (
                                    <MayaTemplateBox
                                        content={`<span style="font-weight: 800; color: #d32f2f;">Insufficient balance in your wallet.</span>\n\nYour current balance is <span style="font-weight: 800;">${insufficientFundsInfo.balance} points</span>, but <span style="font-weight: 800;">${insufficientFundsInfo.required} points</span> are needed for this answer.\n\nPlease recharge your wallet to continue.`}
                                        buttonLabel="Recharge Wallet and Get answer"
                                        onButtonClick={() => {
                                            localStorage.setItem('pendingChatPayment', JSON.stringify({
                                                amount: insufficientFundsInfo.required,
                                                pendingMessageId,
                                                activeQuestion,
                                                sessionId
                                            }));
                                            navigate('/wallet', { state: { returnToChat: true } });
                                        }}
                                    />
                                )}
                            </Box>
                        );
                    }

                    return (
                        <UserMessageTimer key={i} arrivalTime={msg.role === 'user' ? msg.arrivalTime : null}>
                            {(isAnimating) => (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '100%',
                                        mb: 1
                                    }}
                                >
                                    {/* <Typography sx={{ fontSize: '0.75rem', color: '#acacac', fontWeight: 400, pointerEvents: 'none', mb: 0, mr: .5 }}>
                                        {msg.role === 'user' ? 'You' : (msg.assistant === 'maya' ? 'MAYA' : 'Guruji')}
                                    </Typography> */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', flexWrap: 'wrap', flexDirection: 'column' }}>
                                            <Typography sx={{ fontSize: '0.75rem', color: '#acacac', fontWeight: 400, pointerEvents: 'none', mb: -.2, mr: 0 }}>
                                                {msg.role === 'user' ? 'You' : (msg.assistant === 'maya' ? 'MAYA' : 'Guruji')}
                                            </Typography>

                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 1.5,
                                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                                                maxWidth: '100%',

                                            }}>
                                                {msg.content && msg.content.trim() !== '' && (
                                                    <Box sx={{
                                                        p: '12px 16px 18px 12px',
                                                        borderRadius: '10px 2px 10px 10px',
                                                        borderRight: (msg.role === 'user' && (msg.requires_chat_payment || isSubscribed)) || (msg.role === 'assistant' && (isPaidUserMsg || isSubscribed))
                                                            ? '2.5px solid #54A170'
                                                            : 'none',
                                                        bgcolor: msg.role === 'user'
                                                            ? (msg.requires_chat_payment || isSubscribed ? '#2f3148' : '#e2e2e2')
                                                            : (isPaidUserMsg || isSubscribed ? '#fef6eb' : '#f1f1f1'),
                                                        cursor: (msg.isQueued && isLastQueuedMsg && !isUserTyping && msg.role === 'user') ? 'pointer' : 'default',
                                                        pointerEvents: (msg.isQueued && isLastQueuedMsg && !isUserTyping && msg.role === 'user') ? 'auto' : 'inherit',
                                                        color: msg.role === 'user'
                                                            ? (msg.requires_chat_payment || isSubscribed ? '#ffffff' : '#000000')
                                                            : (isPaidUserMsg || isSubscribed ? '#3e2723' : '#000000'),
                                                        position: 'relative',
                                                        maxWidth: '325px',
                                                        minWidth: '100px',
                                                        width: 'fit-content',
                                                        overflowWrap: "break-word",
                                                        wordBreak: "break-word",
                                                        whiteSpace: "pre-line",
                                                        fontSize: "0.9rem",
                                                    }}
                                                        onClick={(msg.isQueued && isLastQueuedMsg && !isUserTyping && msg.role === 'user') ? handleEditQueuedMessage : undefined}
                                                    >
                                                        <SafeHTML
                                                            html={msg.content}
                                                        />

                                                        {/* JSON Output View (for regular messages) */}
                                                        {((msg.mayaJson && !msg.gurujiJson && jsonVisibility.maya) || (msg.psycologyJson && jsonVisibility.psycology) || (msg.gurujiInput && jsonVisibility.guruji)) && (
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
                                                                {(msg.gurujiInput && jsonVisibility.guruji) && (
                                                                    <Typography
                                                                        onClick={() => handleLabelClick(msg.gurujiInput, 'ASTROLOGER INPUT JSON')}
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
                                                                        Guruji Input
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
                                                                {(jsonVisibility.guruji || jsonVisibility.maya) && (
                                                                    <Typography
                                                                        onClick={() => setLogsOpen(true)}
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
                                                                        Logs
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
                                                            {(!isAnimating || msg.role !== 'user') && renderStatusTicks(i)}
                                                        </Box>

                                                    </Box>

                                                )}

                                            </Box>
                                        </Box>
                                        {/* timer animation for user msg */}
                                        <Box
                                            sx={{
                                                width: (msg.isQueued && isLastQueuedMsg && !isUserTyping && msg.role === 'user') ? 45 : 0,
                                                opacity: (msg.isQueued && isLastQueuedMsg && !isUserTyping && msg.role === 'user') ? 1 : 0,
                                                overflow: 'hidden',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                position: 'relative',
                                                top: '15px',
                                                pointerEvents: (msg.isQueued && isLastQueuedMsg && !isUserTyping && msg.role === 'user') ? 'auto' : 'none',
                                                zIndex: 10,
                                            }}
                                        >
                                            <Box
                                                key={msg.arrivalTime}
                                                onClick={handleEditQueuedMessage}
                                                sx={{
                                                    m: 0,
                                                    display: "flex",
                                                    justifyContent: "flex-end",
                                                    alignItems: "center",
                                                    backgroundColor: "transparent",
                                                    cursor: "pointer",
                                                    p: .5,
                                                    minWidth: 40,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        position: "relative",
                                                        width: 40,
                                                        height: 40,
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <Box
                                                        component="svg"
                                                        viewBox="0 0 36 36"
                                                        sx={{
                                                            transform: "rotate(-90deg)",
                                                            width: 30,
                                                            height: 30,
                                                            display: "block",
                                                        }}
                                                    >
                                                        {/* Background circle */}
                                                        <Box
                                                            component="circle"
                                                            cx="18"
                                                            cy="18"
                                                            r="15"
                                                            sx={{
                                                                fill: "none",
                                                                strokeWidth: 3,
                                                                stroke: "#eeeeee",
                                                            }}
                                                        />

                                                        {/* Animated border circle */}
                                                        <Box
                                                            component="circle"
                                                            cx="18"
                                                            cy="18"
                                                            r="15"
                                                            sx={{
                                                                fill: "none",
                                                                strokeWidth: 3,
                                                                stroke: "#1C1F46",
                                                                strokeLinecap: "round",
                                                                strokeDasharray: 95,
                                                                strokeDashoffset: 95,
                                                                animation: "fillBorder 3s linear forwards",
                                                            }}
                                                        />
                                                    </Box>

                                                    {/* Close icon */}
                                                    <Box
                                                        sx={{
                                                            position: "absolute",
                                                            top: "35%",
                                                            left: "42%",
                                                            width: 13,
                                                            height: 13,
                                                            transform: "translate(-50%, -50%)",

                                                            "&::before, &::after": {
                                                                content: '""',
                                                                position: "absolute",
                                                                top: "50%",
                                                                left: 0,
                                                                width: "100%",
                                                                height: "2px",
                                                                backgroundColor: "#1C1F46",
                                                                borderRadius: "1px",
                                                            },

                                                            "&::before": {
                                                                transform: "rotate(45deg)",
                                                            },

                                                            "&::after": {
                                                                transform: "rotate(-45deg)",
                                                            },
                                                        }}
                                                    />

                                                    {/* keyframes */}
                                                    <Box
                                                        sx={{
                                                            "@keyframes fillBorder": {
                                                                from: { strokeDashoffset: 95 },
                                                                to: { strokeDashoffset: 0 },
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                    {/* Translation Indicator */}
                                    {showTranslationIndicator && (
                                        <TranslationIndicator
                                            text={msg.role === 'user'
                                                ? `Translated to astrologer's language by MAYA AI`
                                                : `Translated to your language / language style by MAYA AI`
                                            }
                                        />
                                    )}
                                </Box>
                            )}
                        </UserMessageTimer>
                    );
                })}

                {/* Dot Loader + Astrologer status overlay - 3 distinct phases */}
                {(isSendingToBackend || forceShowTyping) && userMsgPhase === 2 && (() => {
                    const isMayaPhase = !sendingWaitMessage || sendingWaitMessage === "Sending to Maya";
                    const isReadingPhase = sendingWaitMessage === "Sending to Astrologer" || sendingWaitMessage === "Sending to astrologer" || sendingWaitMessage === "Astrologer is reading your message";
                    const isTypingPhase = sendingWaitMessage === "Astrologer is typing";

                    // Pre-typing: 2s into reading phase, start showing 'Astrologer is typing' early
                    const timeInReading = readingPhaseStartTime ? (currentTime - readingPhaseStartTime) : 0;
                    const showPreTyping = isReadingPhase && timeInReading >= 2000;

                    if (!isMayaPhase && !isReadingPhase && !isTypingPhase) return null;

                    // Effective phases for rendering
                    const showDots = isMayaPhase;
                    const showReading = isReadingPhase && !showPreTyping;
                    const showTyping = isTypingPhase || showPreTyping;

                    return (
                        <Box sx={{
                            position: 'fixed',
                            bottom: showDots ? 30 : 18,
                            left: 0,
                            right: 0,
                            mx: 'auto',
                            width: 'max-content',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 10000,
                            pointerEvents: 'none',
                            minWidth: '180px',
                            ...(showDots || showReading ? {
                                bgcolor: 'transparent',
                            } : {
                                // bgcolor: '#67687a',
                                bgcolor: '#f1f1f1',
                                borderRadius: '2px 10px 10px 10px',
                                color: '#000',
                                px: 3,
                                py: 0.8,
                                minHeight: 20,
                            })
                        }}>
                            {showDots ? (
                                /* Phase 1: 3-dot loader while Maya processes */
                                <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                    {[0, 1, 2].map((i) => (
                                        <Box
                                            key={i}
                                            component="span"
                                            sx={{
                                                width: 5,
                                                height: 5,
                                                backgroundColor: '#646577',
                                                borderRadius: '50%',
                                                display: 'inline-block',
                                                "@keyframes micro-pulse": {
                                                    "0%, 80%, 100%": { transform: 'scale(0.8)', opacity: 0.35 },
                                                    "40%": { transform: 'scale(1.2)', backgroundColor: '#a0a3ab', opacity: 1 }
                                                },
                                                animation: 'micro-pulse 1s ease-in-out infinite both',
                                                animationDelay: i === 0 ? '-0.32s' : i === 1 ? '-0.16s' : '0s',
                                            }}
                                        />
                                    ))}
                                </Box>
                            ) : showReading ? (
                                /* Phase 2: "Astrologer is reading your message" (first 2s of reading phase) */
                                <Box
                                    component="span"
                                    sx={{
                                        fontFamily: "'Roboto', sans-serif",
                                        fontSize: "12px",
                                        fontWeight: 500,
                                        color: "#fff",
                                        display: "block",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        borderRight: "2px solid transparent",
                                        width: 0,
                                        mb: 1,
                                        maxWidth: "fit-content",
                                        "@keyframes reading": {
                                            "0%": { width: 0, opacity: 1 },
                                            "70%": { width: "100%" },
                                            "95%": { width: "100%", opacity: 1 },
                                            "99%": { width: 0, opacity: 0 },
                                            "100%": { width: 0, opacity: 0 },
                                        },
                                        // "@keyframes cursor-blink": {
                                        //     "0%, 100%": { borderColor: "transparent" },
                                        //     "50%": { borderColor: "#fff" },
                                        // },
                                        animation: "reading 4s linear infinite",
                                    }}
                                >
                                    Astrologer is reading your message
                                </Box>
                            ) : (
                                /* Phase 3: "Astrologer is typing" typewriter animation */
                                <Box
                                    component="span"
                                    sx={{
                                        fontFamily: "'Roboto', sans-serif",
                                        fontSize: "12px",
                                        fontWeight: 500,
                                        color: "#2F3148",
                                        display: "block",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        borderRight: "2px solid #2F3148",
                                        width: 0,
                                        maxWidth: "fit-content",
                                        "@keyframes human-typing": {
                                            "0%": { width: 0, opacity: 1 },
                                            "12%": { width: "5em" },
                                            "20%": { width: "5em" },
                                            "45%": { width: "9.5em" },
                                            "55%": { width: "9.5em" },
                                            "75%": { width: "100%" },
                                            "98%": { width: "100%", opacity: 1 },
                                            "99%": { width: 0, opacity: 0 },
                                            "100%": { width: 0, opacity: 0 },
                                        },
                                        "@keyframes cursor-blink": {
                                            "0%, 100%": { borderColor: "transparent" },
                                            "50%": { borderColor: "#2F3148" },
                                        },
                                        animation: "human-typing 7s linear infinite, cursor-blink 0.8s step-end infinite",
                                    }}
                                >
                                    Astrologer is typing
                                </Box>
                            )}
                        </Box>
                    );
                })()}



                {!chatStarted && messages.length === 0 && (
                    <>
                        <Box sx={{
                            flex: isMovingToTop ? 0 : 1,
                            maxHeight: isMovingToTop ? 0 : '100%',
                            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                            overflow: 'hidden'
                        }} />
                        <Box sx={{
                            mb: 2,
                            transform: isMovingToTop ? 'translateY(0)' : 'translateY(0)',
                            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>
                            <MayaIntro
                                // title="Welcome"
                                content={`<b>${userName ? userName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : ' '}, welcome.</b>\n\nI'm <b>MAYA</b>, and I'll assist you during your consultation.\n\nWhenever you're ready, you may begin your conversation with <b>Guruji</b> by pressing the button below.\n\nYou may ask about your life, your future, or anything that has been on your mind.`}
                                jsonVisibility={jsonVisibility}
                                onLabelClick={handleLabelClick}
                                sx={{ fontSize: '.9rem', fontWeight: 400 }}
                            />
                        </Box>
                    </>
                )}

                {/* {isConnecting && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, gap: 2 }}>
                        <CircularProgress size={30} sx={{ color: '#F36A2F' }} />
                        <Typography sx={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>Connecting to Guruji...</Typography>
                    </Box>
                )} */}

                < div ref={messagesEndRef} />
            </Box>

            {!chatStarted && !isConnecting ? (
                <ConsultFooter
                    label="Talk to Guruji"
                    onConsult={handleStartConsultation}
                />
            ) : (chatStarted || isConnecting) ? (
                <ChatInputFooter
                    onSend={handleSend}
                    onTyping={setIsUserTyping}
                    userStatus={userStatus}
                    loading={loading}
                    summary={summary}
                    isAnimating={isAnimating}
                    userMsgPhase={userMsgPhase}
                    inputValue={input}
                    setInputValue={setInput}
                    isBuffering={isSendingToBackend}
                    isConnecting={isConnecting}
                    connectionText={connectionText}
                />
            ) : null}
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
            {
                summary && (
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
                )
            }


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
            {/* Modal for Logs */}
            <Dialog
                open={logsOpen}
                onClose={() => setLogsOpen(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        bgcolor: '#1a1a1a',
                        color: '#eee',
                        height: '70vh'
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #333', py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>SESSION LOGS</Typography>
                    <Box>
                        <Button
                            size="small"
                            onClick={() => {
                                navigator.clipboard.writeText(sessionLogs.join('\n'));
                                alert("Logs copied to clipboard!");
                            }}
                            sx={{ color: '#F36A2F', fontSize: '0.7rem', mr: 1 }}
                        >
                            Copy
                        </Button>
                        <Button
                            size="small"
                            onClick={() => setSessionLogs([])}
                            sx={{ color: '#ff4444', fontSize: '0.7rem', mr: 1 }}
                        >
                            Clear
                        </Button>
                        <IconButton
                            size="small"
                            onClick={() => setLogsOpen(false)}
                            sx={{ color: '#fff' }}
                        >
                            <CloseIcon sx={{ fontSize: '1.2rem' }} />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: '#000' }}>
                    <Box
                        sx={{
                            p: 2,
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            maxHeight: '100%',
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': { width: '6px' },
                            '&::-webkit-scrollbar-thumb': { bgcolor: '#333', borderRadius: '3px' }
                        }}
                    >
                        {sessionLogs.length === 0 ? (
                            <Typography sx={{ color: '#444', textAlign: 'center', mt: 4 }}>No logs in this session.</Typography>
                        ) : (
                            sessionLogs.map((log, idx) => (
                                <Box key={idx} sx={{ borderBottom: '1px solid #111', pb: 0.5 }}>
                                    <span style={{ color: '#F36A2F', fontWeight: 600 }}>{log.split(']')[0]}]</span>
                                    <span style={{ color: '#ccc' }}>{log.split(']')[1]}</span>
                                </Box>
                            ))
                        )}
                        {/* Auto-scroll anchor */}
                        <div ref={el => { if (el) el.scrollIntoView({ behavior: 'smooth' }); }} />
                    </Box>
                </DialogContent>
            </Dialog>

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
        </Box >
    );
};

export default Chat;
