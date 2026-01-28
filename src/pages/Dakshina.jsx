import React, { useState } from "react";
import {
    Box,
    Typography,
    Drawer,
    InputBase,
} from "@mui/material";

import GurujiImage from "../components/gurujiImg";
import PrimaryButton from "../components/PrimaryButton";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

const Dakshina = ({ open, onClose }) => {
    const [amount, setAmount] = useState("");

    const handleAmountSelect = (val) => {
        setAmount(val);
    };

    const handleProceed = () => {
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        alert(`Proceeding to payment for ₹${amount}`);
    };

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            ModalProps={{ keepMounted: true }}
            sx={{
                "& .MuiDrawer-paper": {
                    bgcolor: "#fff4e5",
                    borderTopLeftRadius: 35,
                    borderTopRightRadius: 35,

                    /* center horizontally */
                    maxWidth: 450,
                    width: "100%",
                    mx: "auto",

                    px: 2.5,
                    pt: 5,
                    pb: 1.5,

                    // minHeight: submitted ? 250 : "auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                },
            }}
        >


            <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>

                <GurujiImage sx={{ mb: 1, width: 150 }} />
                <Typography sx={{ mb: 2, textAlign: "center", fontSize: 16 }}>
                    Varun, let there be happiness in your life!
                </Typography>
                <Typography
                    sx={{
                        fontSize: 20,
                        color: "#dc5d35",
                        mb: .5,
                        textAlign: "center",
                    }}
                >
                    Dakshina
                </Typography>
                <Box
                    sx={{
                        p: 2,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        overflowY: "auto",
                        borderRadius: 2,
                        border: "2px solid #F36A2F",
                        bgcolor: '#fcebd3'
                    }}
                >

                    <Box sx={{ width: "100%", maxWidth: 400, textAlign: 'center', bgcolor: '#fcebd3' }}>
                        <Typography
                            sx={{ mb: 2, textAlign: "left", fontSize: ".95rem" }}
                        >
                            Our astrology and astrologer services are supported by the 'Dakshina' given by people like you.
                        </Typography>
                        <Typography sx={{ mb: 2, textAlign: "left", fontSize: ".95rem" }}>
                            You may give Guruji a Dakshina of your choice.
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2, justifyContent: "center" }}>
                            <CurrencyRupeeIcon
                                sx={{ color: "#707070" }}
                            />
                            <InputBase
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                type="number"
                                placeholder="Enter amount"
                                sx={{
                                    width: "40%",
                                    bgcolor: "white",
                                    borderRadius: 1,
                                    px: 1.5,
                                    py: 1,

                                    /* 🔥 hide arrows */
                                    "& input[type=number]": {
                                        MozAppearance: "textfield", // Firefox
                                    },
                                    "& input[type=number]::-webkit-outer-spin-button": {
                                        WebkitAppearance: "none",
                                        margin: 0,
                                    },
                                    "& input[type=number]::-webkit-inner-spin-button": {
                                        WebkitAppearance: "none",
                                        margin: 0,
                                    },
                                }}
                            />

                        </Box>
                        <PrimaryButton
                            label="Give dakshina to Guruji"
                            onClick={handleProceed}
                            sx={{
                                bgcolor: "#54a170",
                                color: "white",
                                py: .8,
                                px: 3,
                                borderRadius: 10,
                                fontSize: "1rem",
                                fontWeight: "normal",
                                textTransform: "none",
                                boxShadow: "0 4px 15px rgba(243,106,47,0.3)",
                                mb: 0,
                                width: "auto",
                                mx: "auto",

                            }}
                        />

                    </Box>

                </Box>
                <PrimaryButton
                    label="Close"
                    fullWidth
                    onClick={onClose}
                    sx={{
                        color: "#b4b4b4",
                        py: 1,
                        mt: 5,
                        mb: 2,
                        borderRadius: 10,
                        fontSize: "1rem",
                        textTransform: "none",
                        bgcolor: "#fff",
                        boxShadow: "none",
                        width: "30%",
                        mx: "auto",
                    }}
                />
            </Box>
        </Drawer>
    );
};

export default Dakshina;
