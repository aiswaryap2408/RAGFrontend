import React from "react";
import { Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";


const Header = ({ backgroundImage = "/svg/top_curve_light.svg" }) => {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Only show menu on specific pages
    const showMenu = ['/chat', '/profile', '/history', '/dakshina', '/wallet', '/wallet/recharge'].includes(location.pathname);

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const handleNavigation = (path) => {
        if (path === 'logout') {
            localStorage.clear();
            navigate('/');
        } else if (path === '/chat-new') {
            navigate('/chat', { state: { newSession: true } });
        } else {
            navigate(path);
        }
        setDrawerOpen(false);
    };

    return (
        <Box
            sx={{
                position: "relative",
                minHeight: '182px',
                overflow: "hidden",
            }}
        >
            {/* Top Curve */}
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                    zIndex: 1,
                }}
            >
                {/* Stars */}
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url(/svg/header_stars.svg)`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "contain",
                        zIndex: 2,
                        mt: { xs: -4, sm: 0 },
                    }}
                />
            </Box>





            {/* Hamburger menu - Only for logged in users on specific pages */}

        </Box>
    );
};

export default Header;
