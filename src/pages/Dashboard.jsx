import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import Header from "../components/header";
import HamburgerMenu from "../components/HamburgerMenu";
import PrimaryButton from "../components/PrimaryButton";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import WalletIcon from '@mui/icons-material/Wallet';
import DescriptionIcon from '@mui/icons-material/Description';
import { useNavigate } from "react-router-dom";
import ConsultFooter from "../components/consultFooter";
import IntroMsg from "../components/IntroMsg";
import { getDailyPrediction } from "../api";
import { useEffect } from "react";


const Dashboard = () => {
    const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [loadingPrediction, setLoadingPrediction] = useState(false);
    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem("token");

    const handleAction = (path) => {
        if (isLoggedIn) {
            navigate(path);
        } else {
            setIsProfilePopupOpen(true);
        }
    };


    useEffect(() => {
        if (isLoggedIn) {
            const mobile = localStorage.getItem("mobile");
            if (mobile) {
                fetchPrediction(mobile);
            } else {
                setPrediction("Please log in to view your daily prediction.");
            }
        } else {
            setPrediction("You are currently logged out. Login to view your daily horoscope.");
        }
    }, [isLoggedIn]);

    const fetchPrediction = async (mobile) => {
        try {
            setLoadingPrediction(true);
            const response = await getDailyPrediction(mobile);
            console.log("Daily Prediction Full JSON:", response.data);
            const predData = response.data;
            const clickAstro = predData.prediction;

            if (clickAstro) {
                if (typeof clickAstro === 'string') {
                    setPrediction(clickAstro);
                } else if (clickAstro.sunsign) {
                    setPrediction(clickAstro.sunsign);
                } else if (clickAstro.data && clickAstro.data.sun_sign_prediction) {
                    setPrediction(clickAstro.data.sun_sign_prediction);
                } else {
                    setPrediction("Your daily prediction is being prepared. Please check back shortly.");
                }
            } else {
                setPrediction("Your daily prediction is being prepared. Please check back shortly.");
            }
        } catch (error) {
            console.error("Error fetching daily prediction:", error);
            if (error.response && error.response.status === 404) {
                setPrediction("Please complete your profile details to view daily predictions.");
            } else {
                setPrediction("Unable to load daily prediction at this time.");
            }
        } finally {
            setLoadingPrediction(false);
        }
    };

    return (
        <>
            <Box
                sx={{
                    bgcolor: "#fff4e5",
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    position: "relative",
                }}
            >
                <Header backgroundImage="/svg/top_curve_light.svg" />

                {/* Added a menu toggle button or logic since it was missing in the snippet but state was used */}

                <HamburgerMenu />

                {!isLoggedIn && (
                    <PrimaryButton
                        label="Login"
                        onClick={() => navigate("/")}
                        startIcon={<Box sx={{ display: "flex", "& svg": { fontSize: 25 } }}>
                            <LoginOutlinedIcon />
                        </Box>}
                        sx={{
                            bgcolor: "#54a170",
                            color: "#fff",
                            borderRadius: 50,
                            width: "150px",
                            border: "2px solid #ffffff",
                            p: 0.5,
                            fontSize: 16,
                            position: "absolute",
                            top: 140,
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 1100,
                        }} />
                )}
                <Box sx={{
                    overflowX: 'scroll', "&::-webkit-scrollbar": {
                        display: "none",
                    },
                    scrollbarWidth: "none",
                    mt: 22,
                }}>
                    <Box sx={{ mt: 3.5, textAlign: "center", px: 2, display: "flex", justifyContent: "space-around", flexWrap: 'wrap', gap: 2 }}>
                        <Box onClick={() => handleAction('/profile')} sx={{ cursor: 'pointer' }}>
                            <AccountCircleRoundedIcon sx={{ fontSize: 65, color: "#dc5d35", bgcolor: "#ffdaa7", borderRadius: 1, p: 1 }} />
                            <Typography fontSize={14} fontWeight={500} mt={1} width={75} margin={'auto'}>
                                Edit profiles
                            </Typography>
                        </Box>
                        <Box onClick={() => handleAction('/wallet')} sx={{ cursor: 'pointer' }}>
                            <WalletIcon sx={{ fontSize: 65, color: "#dc5d35", bgcolor: "#ffdaa7", borderRadius: 1, p: 1 }} />
                            <Typography fontSize={14} fontWeight={500} mt={1} width={75} margin={'auto'}>
                                Recharge
                            </Typography>
                        </Box>
                        <Box onClick={() => handleAction('/wallet/recharge-history')} sx={{ cursor: 'pointer' }}>
                            <DescriptionIcon sx={{ fontSize: 65, color: "#dc5d35", bgcolor: "#ffdaa7", borderRadius: 1, p: 1 }} />
                            <Typography fontSize={14} fontWeight={500} mt={1} width={75} margin={'auto'}>
                                Payments
                            </Typography>
                        </Box>
                        <Box onClick={() => handleAction('/detailed-reports')} sx={{ cursor: 'pointer' }}>
                            <DescriptionIcon sx={{ fontSize: 65, color: "#dc5d35", bgcolor: "#ffdaa7", borderRadius: 1, p: 1 }} />
                            <Typography fontSize={14} fontWeight={500} mt={1} width={75} margin={'auto'}>
                                Detailed Reports
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', m: 2 }}>
                    <Typography fontSize={18} fontWeight={600} m={1} color="#dc5d35">
                        Your today:
                    </Typography>
                    <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: 2, width: '100%', minHeight: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        {loadingPrediction ? (
                            <Typography fontSize={14} color="text.secondary">Loading your daily prediction...</Typography>
                        ) : (
                            <Typography
                                fontSize={15}
                                fontWeight={500}
                                color={prediction && prediction.includes("log") ? "text.secondary" : "#444"}
                                textAlign={prediction && prediction.includes("log") ? 'center' : 'justify'}
                                lineHeight={1.6}
                                dangerouslySetInnerHTML={{ __html: prediction || (isLoggedIn ? "Fetching your prediction..." : "Login to view predictions") }}
                            />
                        )}
                    </Box>
                </Box>
                {/* <Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', m: 2 }}>
                        <Typography fontSize={18} fontWeight={600} m={1} color="#dc5d35">
                            Your today:
                        </Typography>
                        <Box sx={{ bgcolor: '#fff', p: 2, borderRadius: 1, width: '100%', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography fontSize={14} fontWeight={500} mt={1} textAlign={'center'} >
                                You are logged out.<br />Login to view the predictions.
                            </Typography>
                        </Box>
                        <PrimaryButton
                            label="Log in"
                            onClick={handleOpenProfilePopup}
                            sx={{
                                bgcolor: "#54a170",
                                color: "#fff",
                                borderRadius: 50,
                                width: "120px",
                                p: 0.5,
                                fontSize: 16,
                                position: "relative",
                                top: "-20px",
                                left: "80%",
                                transform: "translateX(-50%)",
                            }} />
                    </Box>
                </Box> */}
                </Box>
                <ConsultFooter />

                {/* Internal Popup Overlay */}
                {isProfilePopupOpen && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            bgcolor: "rgba(0, 0, 0, 0.7)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 10000,
                            // backdropFilter: "blur(4px)",
                        }}
                        onClick={handleCloseProfilePopup}
                    >
                        {/* <Box
                        sx={{
                            width: "85%",
                            maxWidth: 400,
                            bgcolor: "#fff4e5",
                            borderRadius: 3,
                            p: 3,
                            boxShadow: 24,
                            textAlign: "center",
                            position: "relative",
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "#dc5d35", mb: 1 }}>
                            Edit Profile
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Profile editing functionality will be implemented here.
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                            <Button onClick={handleCloseProfilePopup} sx={{ color: "#dc5d35" }}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCloseProfilePopup}
                                variant="contained"
                                sx={{ bgcolor: "#54a170", "&:hover": { bgcolor: "#458a5c" }, borderRadius: 50 }}
                            >
                                Save
                            </Button>
                        </Box>
                    </Box> */}
                        <IntroMsg
                            name=""
                            title=""
                            description="You must log in to access this feature. Please continue to log in."
                            ConsultSrc="/svg/guruji_illustrated.svg"
                            paybutton="Log in"
                            onPayClick={() => navigate('/')}
                            footerText=""
                            wrapperSx={{ m: 2 }}
                            descriptionSx={{ pt: 1 }}
                            payButtonSx={{ border: '1px solid #fff', p: 1 }}
                        />
                    </Box>
                )}
            </Box>

        </>
    );
};

export default Dashboard;
