import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Slide,
  Backdrop,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import WalletIcon from '@mui/icons-material/Wallet';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GavelIcon from '@mui/icons-material/Gavel';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';

const HamburgerMenu = ({ open: externalOpen, toggleDrawer: externalToggle, handleNavigation: externalHandleNav }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const toggleDrawer = (val) => {
    if (externalToggle) externalToggle(val);
    setInternalOpen(val);
  };

  const handleNavigation = (path) => {
    if (externalHandleNav) {
      externalHandleNav(path);
      return;
    }

    if (path === 'logout') {
      localStorage.clear();
      navigate('/');
    } else if (path === '/chat-new') {
      navigate('/chat', { state: { newSession: true } });
    } else {
      navigate(path);
    }
    toggleDrawer(false);
  };

  const showTrigger = [
    "/chat",
    "/profile",
    "/history",
    "/dakshina",
    "/wallet",
    "/wallet/recharge",
    "/dashboard",
    "/register",
    "/terms",
    "/privacy"
  ].includes(location.pathname.toLowerCase().replace(/\/$/, ""));

  const userName = localStorage.getItem("userName") || "User";
  const userEmail = localStorage.getItem("userEmail") || "";
  const mobileNumber = localStorage.getItem("mobile") || "";

  return (
    <>
      {showTrigger && !isOpen && (
        <Box
          onClick={() => toggleDrawer(true)}
          sx={{
            position: "fixed",
            top: 50,
            left: "max(20px, calc(50% - 205px))",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: 20,
            cursor: "pointer",
            zIndex: 1200,
          }}
        >
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              sx={{
                width: 30,
                height: "0.2rem",
                bgcolor: "#333",
              }}
            />
          ))}
        </Box>
      )}

      {/* FIXED WRAPPER FOR DRAWER */}
      <Box
        ref={containerRef}
        sx={{
          position: "fixed",
          top: 0,
          left: { xs: 0, sm: "calc(50% - 225px)" },
          width: { xs: "100%", sm: 450 },
          height: "100%",
          pointerEvents: "none",
          zIndex: 1300,
          overflow: "hidden", // CRITICAL: Clips the sliding menu to the container
        }}
      >
        <Backdrop
          open={isOpen}
          onClick={() => toggleDrawer(false)}
          sx={{
            position: "absolute",
            zIndex: 1301,
            bgcolor: "rgba(0, 0, 0, 0.4)",
            pointerEvents: "auto",
          }}
        />

        <Slide direction="right" in={isOpen} container={() => containerRef.current}>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 320,
              height: "100%",
              bgcolor: "#2f3148",
              color: "#fff",
              borderTopRightRadius: 30,
              borderBottomRightRadius: 30,
              boxSizing: 'border-box',
              overflowY: "auto",
              zIndex: 1302,
              pointerEvents: "auto",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              scrollbarWidth: "none",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <IconButton
                  onClick={() => toggleDrawer(false)}
                  sx={{ color: "#fff" }}
                >
                  <CloseIcon sx={{ fontSize: 36 }} />
                </IconButton>
              </Box>

              <Box sx={{ p: 2.5, pb: 0, pt: 0, display: "flex" }}>
                <Box sx={{ width: "80px", mr: 2 }}>
                  <img
                    src="/svg/guruji_illustrated.svg"
                    alt="guruji"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      border: "2px solid #ffffff",
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{ fontSize: 16, fontWeight: "bold" }}
                    >
                      {userName}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontSize: 12, color: "#b6b7bf" }}
                    >
                      {userEmail}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontSize: 12, color: "#b6b7bf" }}
                    >
                      {mobileNumber ? `+91 ${mobileNumber}` : ""}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <List sx={{ pt: 2 }}>
                <ListItem disablePadding onClick={() => handleNavigation("logout")}>
                  <ListItemButton sx={{ pt: 1.3 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <LogoutIcon sx={{ minWidth: 40, color: "#fff" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Logout"
                      primaryTypographyProps={{ fontWeight: 400 }}
                    />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding onClick={() => handleNavigation("/dashboard")}>
                  <ListItemButton sx={{ pt: 1.3 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: "#fff" }}>
                      <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Dashboard"
                      primaryTypographyProps={{ fontWeight: 400 }}
                    />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding onClick={() => handleNavigation("/chat")}>
                  <ListItemButton sx={{ pt: 1.3 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: "#fff" }}>
                      <HomeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Chat"
                      primaryTypographyProps={{ fontWeight: 400 }}
                    />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding onClick={() => handleNavigation("/terms")}>
                  <ListItemButton sx={{ pt: 1.3 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: "#fff" }}>
                      <GavelIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Terms and Conditions"
                      primaryTypographyProps={{ fontWeight: 400 }}
                    />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding onClick={() => handleNavigation("/privacy")}>
                  <ListItemButton sx={{ pt: 1.3 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: "#fff" }}>
                      <PrivacyTipIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Privacy Policy"
                      primaryTypographyProps={{ fontWeight: 400 }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
            <Box sx={{ position: "relative" }}>
              <img
                src="/svg/header_stars-white.svg"
                alt="decorative"
                style={{
                  width: "100%",
                  position: "absolute",
                  bottom: 30,
                  left: 0,
                }}
              />
            </Box>
          </Box>
        </Slide>
      </Box>
    </>
  );
};

export default HamburgerMenu;
