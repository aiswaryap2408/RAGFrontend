import React from 'react';
import {
    Box,
    InputBase,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const ChatInputFooter = ({ onSend, onTyping, userStatus, loading, summary, inputValue, setInputValue, isBuffering }) => {
    
    // Gate: block send when backend is processing, chat ended, or astrologer is typing (buffering)
    const isBlocked = loading || !!summary || isBuffering;

    const handleSend = () => {
        if (!inputValue.trim() || isBlocked || userStatus !== 'ready') return;
        onSend(inputValue);
        // Do not clear the input here because Chat.jsx expects onSend to handle it or it clears it itself.
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
            <Box sx={{ bgcolor: "#2f3148", px: 2, py: 1.5, display: "flex", gap: 2, alignItems: "center" }}>
                {/* Input bubble — hides only when loading/summary */}
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
                        fullWidth
                        multiline
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
                            maxHeight: 52,
                            overflowY: "auto",
                            display: isBlocked ? "none" : "flex",
                            py: 0,
                            "& textarea": {
                                maxHeight: 52,
                                overflowY: "auto",
                            },
                            "&::-webkit-scrollbar": { display: "none" },
                            scrollbarWidth: "none",
                        }}
                    />
                </Box>

                {/* Send button — hides only when loading/summary */}
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
                >
                    <SendIcon sx={{ color: isBlocked ? "#999" : "#2f3148", transition: 'color 0.3s ease' }} />
                </Box>
            </Box>
        </Box>
    );
};

export default ChatInputFooter;
