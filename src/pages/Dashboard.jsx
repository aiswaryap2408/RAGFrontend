import React, { useState, useEffect } from "react";
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

const Dashboard = () => {
    const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [signName, setSignName] = useState("");
    const [balance, setBalance] = useState(0);
    const [loadingPrediction, setLoadingPrediction] = useState(false);
    const [profileDob, setProfileDob] = useState("");
    const [profilebirthstar, setProfileBirthStar] = useState("");
    const [userName, setUserName] = useState(localStorage.getItem('userName') || "");
    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem("token");

    const handleAction = (path) => {
        if (isLoggedIn) {
            navigate(path);
        } else {
            setIsProfilePopupOpen(true);
        }
    };

    const handleOpenProfilePopup = () => {
        setIsProfilePopupOpen(true);
    };

    const handleCloseProfilePopup = () => {
        setIsProfilePopupOpen(false);
    };

    useEffect(() => {
        if (isLoggedIn) {
            const mobile = localStorage.getItem("mobile");
            if (mobile) {
                fetchPrediction(mobile);
                fetchUserStatus(mobile);
            } else {
                setPrediction("Please log in to view your daily prediction.");
            }
        } else {
            setPrediction("You are currently logged out. Login to view your daily horoscope.");
        }
    }, [isLoggedIn]);

    const fetchUserStatus = async (mobile) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/user-status/${mobile}`);
            const data = await response.json();

            if (data.user_profile?.name) {
                setUserName(data.user_profile.name);
            }
            if (data.user_profile?.dob) {
                try {
                    const date = new Date(data.user_profile.dob);
                    if (!isNaN(date.getTime())) {
                        const formatted = date.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        });
                        setProfileDob(formatted);
                    }
                } catch (e) { console.error(e); }
            }

            const userChart = data.user_chart || data.user_charts;
            let extractedStar = "";
            const chartData = Array.isArray(userChart) ? userChart[0] : userChart;

            if (chartData) {
                // Image-based structure: birth_star.mainHTML.content[2]
                if (chartData.birth_star?.mainHTML?.content?.[2]) {
                    const starStr = chartData.birth_star.mainHTML.content[2];
                    if (starStr.toLowerCase().includes('birth star')) {
                        extractedStar = starStr.split(':')[1]?.trim() || "";
                    }
                }
                // Fallbacks
                if (!extractedStar) {
                    if (chartData.data?.birth_star) {
                        extractedStar = chartData.data.birth_star;
                    } else if (typeof chartData.birth_star === 'string') {
                        extractedStar = chartData.birth_star;
                    }
                }
            }

            if (extractedStar || data.user_profile?.birthstar || data.user_profile?.profilestar || data.user_profile?.star || data.user_profile?.nakshatra) {
                setProfileBirthStar(extractedStar || data.user_profile.birthstar || data.user_profile.profilestar || data.user_profile.star || data.user_profile.nakshatra);
            }
        } catch (error) {
            console.error("Error fetching user status:", error);
        }
    };

    const fetchPrediction = async (mobile) => {
        try {
            setLoadingPrediction(true);
            const response = await getDailyPrediction(mobile);
            const predData = response.data;

            if (predData.wallet_balance !== undefined) {
                setBalance(predData.wallet_balance);
            }

            if (predData.sign_name) {
                setSignName(predData.sign_name);
            }

            if (predData.birth_star || predData.star_name) {
                setProfileBirthStar(predData.birth_star || predData.star_name);
            }

            const clickAstro = predData.prediction;
            if (clickAstro) {
                let pText = "";
                if (typeof clickAstro === 'string') {
                    pText = clickAstro;
                } else {
                    pText = clickAstro.moonsign ||
                        clickAstro.moonsign_prediction ||
                        clickAstro.sunsign ||
                        clickAstro.sun_sign_prediction ||
                        (clickAstro.data && (clickAstro.data.moonsign_prediction || clickAstro.data.sun_sign_prediction || clickAstro.data.moonsign));

                    if (pText && typeof pText === 'object') {
                        pText = pText.moonsign || pText.moonsign_prediction || pText.sunsign || pText.text || "";
                    }
                }

                if (pText && typeof pText === 'string') {
                    setPrediction(pText);
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
                    overflow: "hidden"
                }}
            >
                <Header
                    backgroundImage="/svg/top_curve_light.svg"
                    showProfile={isLoggedIn}
                    name={userName?.split(' ')[0] || ""}
                    profiledob={profileDob}
                    profilebirthstar={profilebirthstar}
                />
                <HamburgerMenu />



                <Box sx={{
                    flex: 1,
                    overflowY: 'auto',
                    "&::-webkit-scrollbar": { display: "none" },
                    scrollbarWidth: "none",
                    mt: 12,
                    pb: 12,
                    px: 3
                }}>
                    {/* {!isLoggedIn && (
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
                                // border: "2px solid #ffffff",
                                p: 0.5,
                                fontSize: 16,
                                position: "relative",
                                // top: 140,
                                left: "50%",
                                transform: "translateX(-50%)",
                                zIndex: 1100,
                                mb: 3,
                                mt: 2
                            }} />
                    )} */}
                    {isLoggedIn && (
                        <Box sx={{ mb: 3, display: "flex", justifyContent: "center", mt: 1.5 }}>
                            <Typography sx={{ fontWeight: 400, color: '#fff', fontSize: '1rem', bgcolor: '#54a170', borderRadius: 5, p: 1, px: 3, display: "flex", alignItems: "center" }}>
                                <img src="/svg/wallet-white.svg" alt="" style={{ width: '20px', height: '20px', marginRight: '5px', }} />
                                You have {balance.toLocaleString()} pts
                            </Typography>
                        </Box>
                    )}
                    <Box sx={{ textAlign: "center", display: "flex", justifyContent: "space-around", flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
                        <Box onClick={() => handleAction('/profile')} sx={{ cursor: 'pointer', display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Box sx={{ bgcolor: "#2f3148", borderRadius: 1, p: 1, width: '65px', height: '65px', display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <img src="/svg/user.svg" alt="" style={{ width: '35px', height: '35px' }} />
                            </Box>
                            <Typography fontSize={16} mt={.3} width={90} >Edit profiles</Typography>
                        </Box>
                        <Box onClick={() => handleAction('/wallet')} sx={{ cursor: 'pointer', display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Box sx={{ bgcolor: "#2f3148", borderRadius: 1, p: 1, width: '65px', height: '65px', display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <img src="/svg/wallet-white.svg" alt="" style={{ width: '35px', height: '35px' }} />
                            </Box>
                            <Typography fontSize={16} mt={.3} width={75} >Recharge</Typography>
                        </Box>
                        <Box onClick={() => handleAction('/wallet/recharge-history')} sx={{ cursor: 'pointer', display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Box sx={{ bgcolor: "#2f3148", borderRadius: 1, p: 1, width: '65px', height: '65px', display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <img src="/svg/payments.svg" alt="" style={{ width: '35px', height: '35px' }} />
                            </Box>
                            <Typography fontSize={16} mt={.3} width={75} >Recharge</Typography>
                        </Box>
                        <Box onClick={() => handleAction('/detailed-reports')} sx={{ cursor: 'pointer', display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Box sx={{ bgcolor: "#2f3148", borderRadius: 1, p: 1, width: '65px', height: '65px', display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <img src="/svg/detailed_report.svg" alt="" style={{ width: '35px', height: '35px' }} />
                            </Box>
                            <Typography fontSize={16} mt={.3} width={75} margin={'auto'}>Detailed Reports</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
                        <Typography fontSize={18} fontWeight={600} mb={1.5} color="#dc5d35">
                            Your today {signName ? `(${signName})` : ""}:
                        </Typography>
                        <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: 2, width: '100%', minHeight: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            {loadingPrediction ? (
                                <Typography fontSize={14} color="text.secondary">Loading your daily prediction...</Typography>
                            ) : isLoggedIn ? (
                                <Typography
                                    fontSize={15}
                                    fontWeight={500}
                                    color={prediction && (prediction.includes("log") || prediction.includes("prepared")) ? "text.secondary" : "#444"}
                                    textAlign={prediction && (prediction.includes("log") || prediction.includes("prepared")) ? 'center' : 'justify'}
                                    lineHeight={1.6}
                                    dangerouslySetInnerHTML={{ __html: prediction || "Fetching your prediction..." }}
                                />
                            ) : (
                                <Typography fontSize={15} color="text.secondary" textAlign="center">
                                    You are logged out.<br />
                                    Login to view the predictions.
                                </Typography>
                            )}
                        </Box>
                        {!isLoggedIn && (
                            <PrimaryButton
                                label="Login"
                                onClick={() => navigate("/")}

                                sx={{
                                    bgcolor: "#54a170",
                                    color: "#fff",
                                    borderRadius: 50,
                                    width: "120px",
                                    // border: "2px solid #ffffff",
                                    p: 0.5,
                                    fontWeight: 'normal',
                                    fontSize: 16,
                                    position: "relative",
                                    // top: 140,
                                    left: "80%",
                                    transform: "translateX(-50%)",
                                    zIndex: 1100,
                                    mb: 3,
                                    top: -18,
                                }} />
                        )}
                    </Box>
                </Box>

                <ConsultFooter />

                {/* Internal Popup Overlay */}
                {isProfilePopupOpen && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "auto",
                            height: "100%",
                            bgcolor: "rgba(0, 0, 0, 0.7)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 10000,
                            backdropFilter: "blur(4px)",
                        }}
                        onClick={handleCloseProfilePopup}
                    >
                        <Box onClick={(e) => e.stopPropagation()}>
                            <IntroMsg
                                name=""
                                title=""
                                description="You must log in to access this feature. Please continue to log in."
                                ConsultSrc="/svg/maya.png"
                                paybutton="Log in"
                                onPayClick={() => navigate('/')}
                                footerText=""
                                wrapperSx={{ m: 2 }}
                                descriptionSx={{ pt: 1 }}
                                payButtonSx={{ border: '1px solid #fff', p: 1 }}
                            />
                        </Box>
                    </Box>
                )}
            </Box>
        </>
    );
};

export default Dashboard;
