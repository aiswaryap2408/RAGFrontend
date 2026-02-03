import React from "react";
import { Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";


const Header = ({ backgroundImage = "/svg/top_curve_light.svg" }) => {
    return (
        // <Box sx={{ minHeight: '182px' }}>
        <Box >

            <Box
                sx={{
                    position: "fixed",
                    top: 0,
                    width: { xs: '100%', sm: 450 },
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1100,
                    minHeight: '182px',
                    overflow: "hidden",
                    bgcolor: 'transparent',
                }}
            >
                {/* Top Curve */}
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "contain",
                        zIndex: 1,
                    }}
                >
                    {/* Stars */}
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: `url(/svg/header_stars.svg)`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                            backgroundSize: "contain",
                            zIndex: 2,
                            mt: { xs: -4, sm: 0 },
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default Header;
