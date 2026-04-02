import React from "react";
import { Box } from "@mui/material";

const GurujiImage = ({ sx = {} }) => {
    return (
        <Box
            sx={{
                width: 250,
                mx: "auto",
                ...sx,
            }}
        >
            <img
                src="/svg/guruji_illustrated.svg"
                alt="guruji"
                style={{ width: "100%" }}
            />
        </Box>
    );
};

export default GurujiImage;
