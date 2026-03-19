import React, { useRef, useState, useEffect } from 'react';
import {
    Box,
    InputBase,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { Typography, keyframes } from "@mui/material";

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const ChatInputFooter = ({ onSend, onTyping, userStatus, loading, summary, inputValue, setInputValue, isBuffering, isConnecting, connectionText }) => {

    const inputRef = useRef(null);

    // Gate: block send when backend is processing, chat ended, astrologer is typing, or connecting
    const isBlocked = loading || !!summary || isBuffering || isConnecting;

    const handleSend = () => {
        if (!inputValue.trim() || isBlocked || userStatus !== 'ready') return;
        onSend(inputValue);

        // Keep focus on input to prevent mobile keyboard from closing
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 10);
    };


    return (
        <Box sx={{ position: "fixed", width: { xs: '100%', sm: 450 }, bottom: 0, zIndex: 1000 }}>
            {/* Bottom Curves */}
            <Box sx={{ display: "flex", justifyContent: "space-between", position: "relative", top: '8px' }}>
                <Box
                    component="img"
                    src="/svg/bottom_left_open_curve.svg"
                    alt="Left curve"
                    sx={{ width: "100px" }}
                />
                <Box
                    component="img"
                    src="/svg/bottom_right_open_curve.svg"
                    alt="Right curve"
                    sx={{ width: "100px" }}
                />
            </Box>

            {/* Footer Input Area */}
            <Box sx={{ bgcolor: "#2f3148", px: 2, py: 1.5, display: "flex", gap: 2, alignItems: "center", minHeight: 80 }}>
                {isConnecting ? (
                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 2,
                        }}
                    >
                        <Typography
                            sx={{
                                color: "white",
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                display: "flex",
                                gap: "1px",

                                "@keyframes opacityWave": {
                                    "0%, 100%": { opacity: 0.3 },
                                    "50%": { opacity: 1 }
                                }
                            }}
                        >
                            {(connectionText || '').split("").map((char, i) => (
                                <Box
                                    component="span"
                                    key={i}
                                    sx={{
                                        display: "inline-block",
                                        animation: (connectionText || '').includes("...") ? "opacityWave 1.5s ease-in-out infinite" : "none",
                                        animationDelay: `${i * 0.08}s`
                                    }}
                                >
                                    {char === " " ? "\u00A0" : char}
                                </Box>
                            ))}
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* Input bubble — hides only when loading/summary/isConnecting */}
                        <Box
                            sx={{
                                flex: 1,
                                bgcolor: isBlocked ? "none" : "#ffffff",
                                borderRadius: 30,
                                px: 2,
                                display: "flex",
                                alignItems: "center",
                                minHeight: 48,
                                transition: 'background-color 0.3s ease',
                            }}
                        >
                            <InputBase
                                inputRef={inputRef}
                                fullWidth
                                multiline
                                maxRows={4}
                                placeholder={
                                    isBlocked ? "" :
                                        userStatus === 'ready' ? "Type your message..." :
                                            userStatus === 'failed' ? "Registration failed. Please re-register." :
                                                "Preparing..."
                                }
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    if (onTyping) onTyping(e.target.value.length > 0);
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                disabled={isBlocked || userStatus !== 'ready'}
                                sx={{
                                    fontSize: 14,
                                    lineHeight: 1.5,
                                    display: isBlocked ? "none" : "flex",
                                    py: 1,
                                    px: 1,
                                    "& textarea": {
                                        overflowY: "auto !important",
                                        "&::-webkit-scrollbar": { display: "block" },
                                        scrollbarWidth: "none",
                                    },
                                }}
                            />
                        </Box>

                        {/* Send button — hides only when loading/summary/isConnecting */}
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                bgcolor: isBlocked ? "#e0e0e0" : "#ffffff",
                                borderRadius: "50%",
                                display: isBlocked ? "none" : "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: inputValue.trim() && !isBlocked && userStatus === 'ready' ? "pointer" : "default",
                                transition: 'background-color 0.3s ease',
                            }}
                            onClick={handleSend}
                            onMouseDown={(e) => e.preventDefault()} // Prevent clicking from taking focus away from input
                        >
                            <SendIcon sx={{ color: isBlocked ? "#999" : "#2f3148", transition: 'color 0.3s ease' }} />
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default ChatInputFooter;
