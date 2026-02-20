import React from "react";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ConsultFooter = ({ onConsult }) => {
    const navigate = useNavigate();
    return (
        <Box
            sx={{
                mt: "auto",
                width: "100%",
                // backgroundImage: 'url("/svg/bottom_closed_curve.svg")',
                pt: 1,
                textAlign: "center",
                // backgroundRepeat: "no-repeat",
                // backgroundSize: "contain",
                // backgroundPosition: "bottom",
                minHeight: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // position: 'relative',
                position: 'sticky',
                bgcolor: '#2f3148',
            }}
        >
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

            {/* <Box
                component="img"
                src="/svg/guruji_illustrated.svg"
                alt="Guruji"
                sx={{ width: 65, position: 'absolute', bottom: 32 }}
            /> */}


            <Button
                onClick={() => {
                    if (onConsult) onConsult();
                    navigate("/chat");
                }}
                sx={{
                    color: "#fff",
                    fontSize: '.9rem',
                    fontWeight: 400,
                    textTransform: "none",
                    height: 'auto',
                    position: 'absolute',
                    top: '-48px',
                    bgcolor: '#54a170',
                    borderRadius: 12,
                    p: '8px 25px',
                    width: '65%',

                }}
            >
                <Box
                    component="img"
                    src="/svg/Icon-ionic-ios-chatbubbles.svg"
                    alt="Chat"
                    sx={{ width: "25px", height: "25px", mr: 1 }}
                />
                Start Consultation
            </Button>
        </Box>
    );
};

export default ConsultFooter;
