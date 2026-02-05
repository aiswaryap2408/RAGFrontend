import React, { useState } from "react";
import {
    Dialog,
    Box,
    Typography,
    Button,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const ThankYou = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>Open Popup</Button>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        mx: 2,                 // 🔥 left & right margin
                        borderRadius: 2,
                        // p: 3,
                        textAlign: "center",
                        position: "relative",
                        overflow: "visible",
                        bgcolor: '#ebebeb',
                    },
                }}
            >

                {/* Top Icon */}
                <Box
                    sx={{
                        position: "absolute",
                        top: -35,
                        left: "50%",
                        transform: "translateX(-50%)",
                        bgcolor: "#5FA777",
                        borderRadius: "50%",
                        width: 70,
                        height: 70,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                    }}
                >
                    <CheckCircleIcon sx={{ fontSize: 40 }} />
                </Box>

                <Box >
                    <Box sx={{ p: 3, pt: 10, bgcolor: '#fff', color: '#696969', borderRadius: ' 20px 20px 0 0' }}>
                        <Typography variant="h6" color="#5FA777" fontWeight={600}>
                            Dakshina credited!
                        </Typography>

                        <Typography mt={2}>
                            We've received payment amount of:
                        </Typography>

                        <Typography variant="h4" fontWeight={700}>
                            ₹400
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Reference Id
                        </Typography>

                        <Typography mb={2} color="text.secondary">
                            CAEN1718873032141
                        </Typography>
                    </Box>
                    <Box sx={{ lineHeight: 0 }}>
                        <svg
                            viewBox="0 0 500 80"
                            preserveAspectRatio="none"
                            style={{ width: "100%", height: 75, display: "block" }}
                        >
                            <path
                                d="M0,18 Q250,120 499,15 L500,0 L0,0 Z"
                                fill="#fff"
                            />
                        </svg>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', color: '#696969' }}>
                        <img src="/svg/chirag.png" alt="chirag" style={{ width: '2rem' }} />
                    </Box>
                    <Box sx={{ p: 3 }}>

                        <Typography variant="h6" color="#5FA777" fontWeight={600}>
                            Thank you for the trust and support!
                        </Typography>

                        <Typography mt={1}>
                            We've credited 10% of your Dakshina as{" "}
                            <b>gratitude points</b> in your wallet
                        </Typography>

                        <Typography variant="h5" mt={2} fontWeight={700}>
                            40pts <span style={{ color: "#5FA777", fontSize: '1rem', fontWeight: 500 }}>added</span>
                        </Typography>
                    </Box>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => setOpen(false)}
                        sx={{
                            mt: 3,
                            borderRadius: '0 0 20px 20px',
                            bgcolor: "#5FA777",
                            textTransform: "none",
                            fontSize: '1rem',
                            p: 1.5,
                        }}
                    >
                        Ok
                    </Button>
                </Box>
            </Dialog >
        </>
    );
};

export default ThankYou;
