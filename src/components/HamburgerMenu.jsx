import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import AddCommentIcon from "@mui/icons-material/AddComment";
import PersonIcon from "@mui/icons-material/Person";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import WalletIcon from '@mui/icons-material/Wallet';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GavelIcon from '@mui/icons-material/Gavel';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';

const HamburgerMenu = ({ open, toggleDrawer, handleNavigation }) => {
  const userName = localStorage.getItem("userName") || "User";
  const userEmail = localStorage.getItem("userEmail") || "";
  const mobileNumber = localStorage.getItem("mobile") || "";

  return (

    <Drawer
      anchor="left"
      open={open}
      onClose={() => toggleDrawer(false)}
      disableScrollLock
      disablePortal
      ModalProps={{
        keepMounted: true,
        style: { position: 'absolute' }
      }}
      PaperProps={{
        style: { position: 'absolute' }
      }}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "100%",
        width: "100%",
        zIndex: 1300,
        "& .MuiDrawer-root": {
          position: "absolute"
        },
        "& .MuiDrawer-paper": {
          width: 320,
          height: "100%",
          bgcolor: "#2f3148",
          color: "#fff",
          borderTopRightRadius: 30,
          borderBottomRightRadius: 30,
          boxSizing: 'border-box',
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        role="presentation"
        onKeyDown={() => toggleDrawer(false)}
      >
        {/* Drawer Header with CLOSE BUTTON */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* <Box sx={{ fontWeight: "bold", fontSize: 16 }}>Menu</Box> */}

          {/* CLOSE BUTTON ADDED HERE */}
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

            {/* <Box
                sx={{
                  width: "85px",
                  height: "85px",
                  borderRadius: "50%",
                  border: "2px solid #ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PersonIcon sx={{ fontSize: 60, color: "#ffffff" }} />
              </Box> */}

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
      <Box>
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
    </Drawer>
  );
};

export default HamburgerMenu;
