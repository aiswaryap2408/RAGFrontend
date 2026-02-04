import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { useNavigate } from "react-router-dom";

const Subheader = ({ title, showBack = false, onBack }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <Box
            sx={{
                width: { xs: '100%', sm: 450 },
                height: 75,
                display: "flex",
                alignItems: "center",
                px: 2,

                position: "fixed",
                top: 0,
                zIndex: 5,
                bgcolor: "#ffdaa7",
            }}
        >
            {showBack && (
                <IconButton
                    onClick={handleBack}
                    sx={{ position: "relative", left: -14 }}
                >
                    <KeyboardArrowLeftIcon sx={{ fontSize: 40, color: "#533000" }} />
                </IconButton>
            )}

            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    color: "#533000",
                    flex: 1,
                    fontSize: "1.1rem",
                }}
            >
                {title}
            </Typography>
        </Box>
    );
};

export default Subheader;
