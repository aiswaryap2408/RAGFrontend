import React from "react";
import { Box, Typography } from "@mui/material";
import GlobalStyles from "@mui/material/GlobalStyles";
import { useNavigate } from "react-router-dom";

const globalKeyframes = (
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
);


const ConsultFooter = ({ onConsult }) => {
    const navigate = useNavigate();
    return (
        <Box
            sx={{
                mt: "auto",
                width: "100%",
                pt: 1,
                textAlign: "center",
                minHeight: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'sticky',
                bgcolor: '#2f3148',
            }}
        >
            {/* Bottom Curves */}
            <Box sx={{ position: "absolute", bottom: "100%", left: 0, width: 100, top: '-45px' }}>
                <Box component="img" src="/svg/bottom_left_open_curve.svg" alt="Left curve" sx={{ width: "100px" }} />
            </Box>
            <Box sx={{ position: "absolute", bottom: "100%", right: 0, width: 100, top: '-45px' }}>
                <Box component="img" src="/svg/bottom_right_open_curve.svg" alt="Right curve" sx={{ width: "100px" }} />
            </Box>

            {/* Animated Start Consultation Button */}
            <Box
                component="button"
                onClick={() => {
                    if (onConsult) onConsult();
                    navigate("/chat");
                }}
                sx={{
                    position: "absolute",
                    top: "-60px",
                    width: "65%",
                    padding: "2px",
                    borderRadius: "999px",
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                    background: "#54A170",
                    overflow: "hidden",

                    "&:active": {
                        transform: "scale(0.97)",
                        transition: "transform 0.1s cubic-bezier(0.4,0,0.2,1)",
                    },

                    /* Spinning conic gradient ring via ::before */
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: "300%",
                        height: "300%",
                        transform: "translate(-50%,-50%) rotate(0deg)",
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
                    },

                    "@keyframes cf-spin": {
                        to: { transform: "translate(-50%,-50%) rotate(360deg)" },
                    },
                }}
            >
                {/* Inner pill */}
                <Box
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        padding: "12px 20px",
                        borderRadius: "999px",
                        color: "white",
                        overflow: "hidden",
                        backgroundColor: "#54A170",
                        boxShadow: "inset 0 1.5px 1.5px rgba(255,255,255,0.15)",

                        /* Sweeping glare */
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

                        "@keyframes cf-glare": {
                            "0%": { backgroundPosition: "200% 0" },
                            "15%,100%": { backgroundPosition: "-100% 0" },
                        },
                    }}
                >
                    {/* SVG Icon */}
                    <Box sx={{ width: 26, height: 26, flexShrink: 0, position: "relative", zIndex: 1 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 21.25 21.25">
                            <g transform="translate(-3.375 -3.375)">
                                {/* Back bubble — bobbing animation via SMIL */}
                                <g>
                                    <animateTransform
                                        attributeName="transform"
                                        type="scale"
                                        values="0.82;1.06;1;1;0.82"
                                        keyTimes="0;0.3;0.55;0.8;1"
                                        dur="2.6s"
                                        repeatCount="indefinite"
                                        additive="sum"
                                    />
                                    <path d="M24.253,17.3a1.238,1.238,0,0,1,.169-.623,1.721,1.721,0,0,1,.107-.158,8.277,8.277,0,0,0,1.41-4.613,8.689,8.689,0,0,0-8.873-8.531,8.812,8.812,0,0,0-8.7,6.789,8.209,8.209,0,0,0-.189,1.747,8.665,8.665,0,0,0,8.735,8.638,10.52,10.52,0,0,0,2.411-.393c.577-.158,1.149-.368,1.3-.424a1.35,1.35,0,0,1,.475-.087,1.328,1.328,0,0,1,.516.1l2.9,1.027a.691.691,0,0,0,.2.051.407.407,0,0,0,.409-.409.656.656,0,0,0-.026-.138Z" transform="translate(-1.313)" fill="#fff" />
                                    {/* Typing dots with SMIL blink */}
                                    <circle cx="13.5" cy="11.8" r="1" fill="#54A170">
                                        <animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;0.4;0.6;0.75;1" dur="2.6s" repeatCount="indefinite" begin="0.6s" />
                                    </circle>
                                    <circle cx="17" cy="11.8" r="1" fill="#54A170">
                                        <animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;0.4;0.6;0.75;1" dur="2.6s" repeatCount="indefinite" begin="0.8s" />
                                    </circle>
                                    <circle cx="20.5" cy="11.8" r="1" fill="#54A170">
                                        <animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;0.4;0.6;0.75;1" dur="2.6s" repeatCount="indefinite" begin="1s" />
                                    </circle>
                                </g>

                                {/* Front bubble */}
                                <g>
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
        </Box>
    );
};

export default ConsultFooter;
