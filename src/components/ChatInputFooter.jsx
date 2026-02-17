import React from 'react';
import {
    Box,
    InputBase,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useState } from "react";

const ChatInputFooter = ({ onSend, userStatus, loading, summary }) => {
    const [message, setMessage] = useState("");

    const handleSend = () => {
        if (!message.trim() || loading || summary || userStatus !== 'ready') return;
        onSend(message);
        setMessage("");
    };


    return (
        <Box sx={{ position: "fixed", width: { xs: '100%', sm: 450 }, bottom: 0 }}>
            {/* Bottom Curves */}
            <Box
                sx={{
                    position: "absolute",
                    bottom: "100%",
                    left: 0,
                    width: 100,
                    top: '-45px',
                }}
            >
                <Box
                    component="img"
                    src="/svg/bottom_left_open_curve.svg"
                    alt="Left curve"
                    sx={{ width: "100px" }}
                />
            </Box>

            <Box
                sx={{
                    position: "absolute",
                    bottom: "100%",
                    right: 0,
                    width: 100,
                    top: '-45px',
                }}
            >
                <Box
                    component="img"
                    src="/svg/bottom_right_open_curve.svg"
                    alt="Right curve"
                    sx={{ width: "100px" }}
                />
            </Box>

            {/* Footer Input Area */}
            <Box sx={{ bgcolor: "#2f3148", px: 2, py: 1.5, display: "flex", gap: 2, alignItems: "center" }}>
                <Box
                    sx={{
                        flex: 1,
                        bgcolor: "#fff4e5",
                        borderRadius: 30,
                        px: 2,
                        display: "flex",
                        alignItems: "center",
                        minHeight: 48,
                        // py: 0.5,

                    }}
                >
                    <InputBase
                        fullWidth
                        multiline
                        // maxRows={4}
                        placeholder={
                            userStatus === 'ready' ? "Type your message..." :
                                userStatus === 'failed' ? "Registration failed. Please re-register." :
                                    "Preparing..."
                        }
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        disabled={loading || summary || userStatus !== 'ready'}
                        sx={{
                            fontSize: 14,
                            lineHeight: 1.5,
                            maxHeight: 52,
                            overflowY: "auto",
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

                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        bgcolor: "#fff4e5",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: message.trim() && !loading && !summary && userStatus === 'ready' ? "pointer" : "default",
                    }}
                    onClick={handleSend}
                >
                    <SendIcon sx={{ color: "#2f3148" }} />
                </Box>
            </Box>
        </Box>
    );
};

export default ChatInputFooter;
