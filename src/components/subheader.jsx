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
                width: "100%",
                height: 56,
                display: "flex",
                alignItems: "center",
                px: 2,

                position: "relative",
                zIndex: 5,
                bgcolor: "#ffdaa7",
            }}
        >
            {showBack && (
                <IconButton
                    onClick={handleBack}

                >
                    <KeyboardArrowLeftIcon sx={{ fontSize: 35, color: "#533000" }} />
                </IconButton>
            )}

            <Typography
                variant="h6"
                sx={{
                    fontWeight: 700,
                    color: "#333",
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
