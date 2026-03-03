import React from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';


const Header = ({ showProfile = false, name = "", profiledob = "", profilebirthstar = "", hscrollsx = {} }) => {
    return (
        // <Box sx={{ minHeight: '182px' }}>
        <Box >

            <Box
                sx={{
                    position: "fixed",
                    top: 0,
                    width: { xs: '100%', sm: 452 },
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1100,
                    height: '152px',
                    overflow: "visible",
                    bgcolor: 'transparent',
                    ...hscrollsx
                }}
            >
                <Box sx={{
                    bgcolor: "#2f3148",
                    height: '100px',
                    px: 3,
                    pt: 1.5,
                    pb: .5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                }}>
                    {!showProfile ? (
                        <Typography sx={{ fontSize: 28, fontWeight: 100, color: "#fff", fontFamily: "'Century Gothic', sans-serif", mb: 1 }}>
                            Findastro
                        </Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonRoundedIcon sx={{ color: '#fff', fontSize: 24 }} />
                                <Typography sx={{ fontSize: 24, fontWeight: 600, color: "#fff", fontFamily: "'Century Gothic', sans-serif", textTransform: 'capitalize' }}>
                                    {name}
                                </Typography>
                                {/* <KeyboardArrowDownRoundedIcon sx={{ color: '#fff', fontSize: 24 }} /> */}
                            </Box>
                            {(profiledob || profilebirthstar) && (
                                <Typography sx={{ fontSize: 14, mt: -.5, fontWeight: 100, color: "rgba(255,255,255,0.7)", fontFamily: "'Century Gothic', sans-serif" }}>
                                    {profiledob}{profilebirthstar ? `, ${profilebirthstar}` : ""}
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 7,
                        left: 0,
                        width: 100,
                        transform: 'rotate(180deg)',
                    }}
                >
                    <Box
                        component="img"
                        src="/svg/bottom_right_open_curve.svg"
                        alt="Right curve"
                        sx={{ width: "100px" }}
                    />
                </Box>

                <Box
                    sx={{
                        position: "absolute",
                        bottom: 7,
                        right: 0,
                        width: 100,
                        transform: 'rotate(180deg)',
                    }}
                >
                    <Box
                        component="img"
                        src="/svg/bottom_left_open_curve.svg"
                        alt="Left curve"
                        sx={{ width: "100px" }}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default Header;
