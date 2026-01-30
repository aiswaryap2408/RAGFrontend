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

const HamburgerMenu = ({ open, toggleDrawer, handleNavigation }) => {
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

        <Box sx={{ p: 2.5, pb: 2, pt: 0, display: "flex" }}>
          <Box sx={{ width: "85px", mr: 2 }}>

            <img
              src="/svg/guruji_illustrated.svg"
              alt="guruji"
              style={{
                width: "85px",
                height: "85px",
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
                Varun Maniyan
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontSize: 12, color: "#b6b7bf" }}
              >
                varun@clickastro.com
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontSize: 12, color: "#b6b7bf" }}
              >
                +91 9876543210
              </Typography>
            </Box>
          </Box>
        </Box>


        <List sx={{ pt: 2 }}>
          <ListItem disablePadding onClick={() => handleNavigation("logout")}>
            <ListItemButton sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon sx={{ minWidth: 40, color: "#fff" }} />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding onClick={() => handleNavigation("/chat")}>
            <ListItemButton sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: "#fff" }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText
                primary="Home"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem
            disablePadding
            onClick={() => handleNavigation("/chat-new")}
          >
            <ListItemButton sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: "#fff" }}>
                <AddCommentIcon />
              </ListItemIcon>
              <ListItemText
                primary="New Consultation"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding onClick={() => handleNavigation("/profile")}>
            <ListItemButton sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: "#fff" }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText
                primary="Profile"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding onClick={() => handleNavigation("/history")}>
            <ListItemButton sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: "#fff" }}>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText
                primary="History"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding onClick={() => handleNavigation("/wallet")}>
            <ListItemButton sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: "#fff" }}>
                <WalletIcon />
              </ListItemIcon>
              <ListItemText
                primary="My Wallet"
                primaryTypographyProps={{ fontWeight: 500 }}
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
