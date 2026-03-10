import React from "react";
import { Box, Typography } from "@mui/material";
import GlobalStyles from "@mui/material/GlobalStyles";
import { useNavigate } from "react-router-dom";
import './consultFooter.css';

const ConsultFooter = ({ onConsult }) => {
    const navigate = useNavigate();
    return (
        <>
            {/* Inject keyframes for the spinning border ring globally */}
            <GlobalStyles styles={{
                "@keyframes cf-spin": {
                    "0%": { transform: "translate(-50%,-50%) rotate(0deg)" },
                    "100%": { transform: "translate(-50%,-50%) rotate(360deg)" },
                },
                "@keyframes cf-glare": {
                    "0%": { backgroundPosition: "200% 0" },
                    "15%, 100%": { backgroundPosition: "-100% 0" },
                },
            }} />

            {/* Footer sticky bar */}
            <Box
                sx={{
                    mt: "auto",
                    width: { xs: '100%', sm: 450 },
                    pt: 1,
                    textAlign: "center",
                    minHeight: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'fixed',
                    bottom: 0,
                    // left: 0,
                    // right: 0,
                    // mx: 'auto',
                    bgcolor: '#2f3148',
                    overflow: 'visible',
                    zIndex: 100,
                }}
            >
                {/* Left curve */}
                <Box
                    component="img"
                    src="/svg/bottom_left_open_curve.svg"
                    alt="Left curve"
                    sx={{ position: "absolute", top: '-45px', left: 0, width: "100px" }}
                />
                {/* Right curve */}
                <Box
                    component="img"
                    src="/svg/bottom_right_open_curve.svg"
                    alt="Right curve"
                    sx={{ position: "absolute", top: '-45px', right: 0, width: "100px" }}
                />

                {/* Animated Start Consultation Button */}
                <Box
                    component="button"
                    onClick={() => {
                        if (onConsult) onConsult();
                        navigate("/chat");
                    }}
                    sx={{
                        position: "absolute",
                        top: "-55px",
                        width: "65%",
                        padding: "2px",
                        borderRadius: "999px",
                        border: "none",
                        outline: "none",
                        cursor: "pointer",
                        background: "transparent",
                        overflow: "hidden",

                        "&:active": {
                            transform: "scale(0.97)",
                            transition: "transform 0.1s cubic-bezier(0.4,0,0.2,1)",
                        },
                    }}
                >
                    {/* Spinning conic gradient ring — real element so it works in React */}
                    <Box
                        aria-hidden="true"
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            width: "700%",
                            height: "600%",
                            background: `conic-gradient(
                                from 0deg,
                                #54A170 40%,
                                #90e8b0 47%,
                                #d4fff0 50%,
                                #90e8b0 53%,
                                #54A170 60%
                            )`,
                            animation: "cf-spin 3s linear infinite",
                            zIndex: 0,
                            pointerEvents: "none",
                        }}
                    />

                    {/* Inner pill */}
                    <Box
                        sx={{
                            position: "relative",
                            zIndex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "12px",
                            padding: "10px 20px",
                            borderRadius: "999px",
                            color: "white",
                            overflow: "hidden",
                            backgroundColor: "#54A170",
                            boxShadow: "inset 0 1.5px 1.5px rgba(255,255,255,0.15)",

                            "&::after": {
                                content: '""',
                                position: "absolute",
                                inset: 0,
                                background: `linear-gradient(
                                    105deg,
                                    transparent 20%,
                                    rgba(180,255,220,0.2) 23%,
                                    rgba(180,255,220,0.05) 26%,
                                    transparent 30%
                                )`,
                                backgroundSize: "200% 100%",
                                animation: "cf-glare 4s cubic-bezier(0.25,1,0.5,1) infinite",
                                pointerEvents: "none",
                            },
                        }}
                    >
                        {/* SVG Icon — uses CSS classes/ids for bubble + dot animations */}
                        <Box sx={{ width: 26, height: 26, flexShrink: 0, position: "relative", zIndex: 1 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 21.25 21.25">
                                <g transform="translate(-3.375 -3.375)">
                                    {/* Back bubble (top right) — animated via #bubble-back in CSS */}
                                    <g id="bubble-back">
                                        <path d="M24.253,17.3a1.238,1.238,0,0,1,.169-.623,1.721,1.721,0,0,1,.107-.158,8.277,8.277,0,0,0,1.41-4.613,8.689,8.689,0,0,0-8.873-8.531,8.812,8.812,0,0,0-8.7,6.789,8.209,8.209,0,0,0-.189,1.747,8.665,8.665,0,0,0,8.735,8.638,10.52,10.52,0,0,0,2.411-.393c.577-.158,1.149-.368,1.3-.424a1.35,1.35,0,0,1,.475-.087,1.328,1.328,0,0,1,.516.1l2.9,1.027a.691.691,0,0,0,.2.051.407.407,0,0,0,.409-.409.656.656,0,0,0-.026-.138Z" transform="translate(-1.313)" fill="#fff" />
                                        {/* Typing dots — animated via .dot .dot1 .dot2 .dot3 in CSS */}
                                        <circle className="dot dot1" cx="13.5" cy="11.8" r="1" />
                                        <circle className="dot dot2" cx="17" cy="11.8" r="1" />
                                        <circle className="dot dot3" cx="20.5" cy="11.8" r="1" />
                                    </g>

                                    {/* Front bubble (bottom left) — animated via #bubble-front in CSS */}
                                    <g id="bubble-front">
                                        <path d="M17.193,23.578c-.184.051-.419.107-.674.163a9.428,9.428,0,0,1-1.737.23,8.665,8.665,0,0,1-8.735-8.638,9.658,9.658,0,0,1,.077-1.093c.031-.22.066-.439.117-.654.051-.23.112-.46.179-.684l-.409.363a7.6,7.6,0,0,0-2.636,5.716A7.517,7.517,0,0,0,4.642,23.17c.117.179.184.317.163.409S4.2,26.745,4.2,26.745a.41.41,0,0,0,.138.393.416.416,0,0,0,.261.092.366.366,0,0,0,.148-.031L7.61,26.071a.8.8,0,0,1,.291-.056.806.806,0,0,1,.322.066,8.6,8.6,0,0,0,3.1.613,8.023,8.023,0,0,0,6.135-2.815s.163-.225.352-.49C17.622,23.456,17.407,23.522,17.193,23.578Z" transform="translate(0 -2.606)" fill="#fff" />
                                    </g>
                                </g>
                            </svg>
                        </Box>

                        <Typography component="span" sx={{ fontSize: "17px", fontWeight: 500 }}>
                            Start Consultation
                        </Typography>
                    </Box>
                </Box>
            </Box >
        </>
    );
};

export default ConsultFooter;
