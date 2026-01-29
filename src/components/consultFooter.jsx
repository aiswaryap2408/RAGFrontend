import React from "react";
import { Box, Button } from "@mui/material";

const ConsultFooter = ({ onConsult }) => {
    return (
        <Box
            sx={{
                mt: "auto",
                width: "100%",
                backgroundImage: 'url("/svg/bottom_closed_curve.svg")',
                pt: 1,
                textAlign: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                backgroundPosition: "bottom",
                minHeight: '65px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
            }}
        >

            <Box
                component="img"
                src="/svg/guruji_illustrated.svg"
                alt="Guruji"
                sx={{ width: 65, position: 'absolute', top: '-38px' }}
            />


            <Button
                onClick={onConsult}
                sx={{
                    color: "#fff",
                    fontSize: '.85rem',
                    fontWeight: 500,
                    textTransform: "none",
                    height: 15,
                    position: 'relative',
                    top: '15px',
                }}
            >
                Consult now
            </Button>
        </Box>
    );
};

export default ConsultFooter;
