import React from "react";
import { Box } from "@mui/material";

const GurujiImage = ({ sx = {} }) => {
    return (
<<<<<<< HEAD
        <Box
            sx={{
                width: 250,
                mx: "auto",
                ...sx,
            }}
        >
=======
        <Box width={250} mx="auto">
>>>>>>> 0708b7b844e4497943e3ea2a382e101ff80a16e1
            <img
                src="/svg/guruji_illustrated.svg"
                alt="guruji"
                style={{ width: "100%" }}
            />
        </Box>
    );
};

export default GurujiImage;
