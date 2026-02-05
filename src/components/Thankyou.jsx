import React, { useState } from "react";
import {
    Dialog,
    Box,
    Typography,
    Button,
} from "@mui/material";
import DoneIcon from '@mui/icons-material/Done';

const ThankYou = ({
    open,
    onClose,
    amount = 400,
    referenceId = "CAEN1718873032141",
    points = 40,
    title = "Dakshina credited!",
    trustMsg = "Thank you for the trust and support!",
    gratitudeMsg = "We've credited 10% of your Dakshina as gratitude points in your wallet",
    addedLabel = "added",
    showWave = true,
    topSx = {},
    bottomSx = {}
}) => {
    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        mx: 2,
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
                        width: 80,
                        height: 80,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        border: '8px solid #fff',
                    }}
                >
                    <DoneIcon sx={{ fontSize: 60, fontWeight: 900 }} />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', color: '#696969' }}>
                    <Box sx={{
                        px: 3, pb: showWave ? 0 : 4, pt: 10,
                        bgcolor: '#fff',
                        borderRadius: '20px 20px 0 0',
                        ...topSx
                    }}>
                        <Typography fontSize={18} color="#5FA777" fontWeight={500}>
                            {title}
                        </Typography>

                        <Typography mt={1.5} fontSize={15} fontWeight={500}>
                            We've received payment amount of:
                        </Typography>

                        <Typography fontSize={24} fontWeight={700} color="#585858">
                            ₹{amount}
                        </Typography>

                        <Typography fontSize={14} color="#acacac">
                            Reference Id
                        </Typography>

                        <Typography mb={2} fontSize={14} color="#acacac">
                            {referenceId}
                        </Typography>
                    </Box>

                    {showWave && (
                        <Box sx={{ lineHeight: 0, position: 'relative' }}>
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
                    )}

                    <Box sx={{
                        // bgcolor: showWave ? 'transparent' : '#fff',
                        pt: showWave ? 0 : 5,
                        pb: 3,
                        ...bottomSx
                    }}>
                        {showWave && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                <img src="/svg/chirag.png" alt="chirag" style={{ width: '2rem' }} />
                            </Box>
                        )}

                        <Box sx={{ px: 6, textAlign: 'center' }}>
                            <Typography color="#5FA777" fontWeight={600} fontSize={18}>
                                {trustMsg}
                            </Typography>

                            <Typography mt={1} fontSize={14} fontWeight={500}>
                                {gratitudeMsg}
                            </Typography>

                            <Typography mt={.5} fontWeight={700} fontSize={25} color="#585858">
                                {points} pts <span style={{ color: "#5FA777", fontSize: '1rem', fontWeight: 500 }}>{addedLabel}</span>
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={onClose}
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
