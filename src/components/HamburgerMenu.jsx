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
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import AddCommentIcon from "@mui/icons-material/AddComment";
import PersonIcon from "@mui/icons-material/Person";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";

const HamburgerMenu = ({ open, toggleDrawer, handleNavigation }) => {
  return (
    // <Drawer
    //   anchor="left"
    //   open={open}
    //   onClose={() => toggleDrawer(false)}
    //   disablePortal
    //   sx={{
    //     position: "absolute",
    //     left: 0,
    //     top: 0,
    //     width: 350,

    //     "& .MuiDrawer-paper": {
    //       position: "absolute",
    //       left: 0,
    //       top: 0,
    //       width: 350,
    //       height: "100%",
    //       bgcolor: "#2f3148",
    //       color: "#fff",
    //       borderTopRightRadius: 30,
    //       borderBottomRightRadius: 30,

    //       overflowY: "auto",
    //       "&::-webkit-scrollbar": {
    //         display: "none",
    //       },
    //       scrollbarWidth: "none",
    //     },
    //   }}
    // >
    <Drawer
      anchor="left"
      open={open}
      onClose={() => toggleDrawer(false)}
      disablePortal
      //   disableScrollLock
      sx={{
        "& .MuiDrawer-paper": {
          position: "absolute",
          width: 320,
          height: "100%",
          bgcolor: "#2f3148",
          color: "#fff",
          borderTopRightRadius: 30,
          borderBottomRightRadius: 30,

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
          <Box sx={{ fontWeight: "bold", fontSize: 16 }}>Menu</Box>

          {/* CLOSE BUTTON ADDED HERE */}
          <IconButton
            onClick={() => toggleDrawer(false)}
            sx={{ color: "#fff" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <List sx={{ pt: 2 }}>
          <ListItem disablePadding onClick={() => handleNavigation("/chat")}>
            <ListItemButton sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: "#F26A2E" }}>
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
              <ListItemIcon sx={{ minWidth: 40, color: "#F26A2E" }}>
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
              <ListItemIcon sx={{ minWidth: 40, color: "#F26A2E" }}>
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
              <ListItemIcon sx={{ minWidth: 40, color: "#F26A2E" }}>
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
              <ListItemIcon sx={{ minWidth: 40, color: "#F26A2E" }}>
                <span style={{ fontSize: 20 }}>💰</span>
              </ListItemIcon>
              <ListItemText
                primary="My Wallet"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding onClick={() => handleNavigation("logout")}>
            <ListItemButton sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: "#888" }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontWeight: 500, color: "#666" }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default HamburgerMenu;
