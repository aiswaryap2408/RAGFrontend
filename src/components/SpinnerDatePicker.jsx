import React, { useEffect, useRef, useState } from "react";
import { Dialog, Box, Typography, Button } from "@mui/material";

const ITEM_HEIGHT = 38;
const VISIBLE_ITEMS = 7;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const getYears = () => {
    const current = new Date().getFullYear();
    return Array.from({ length: current - 1901 + 1 }, (_, i) => current - i);
};

const getDays = (month, year) => {
    const monthIndex = months.indexOf(month);
    const total = new Date(year, monthIndex + 1, 0).getDate();
    return Array.from({ length: total }, (_, i) => i + 1);
};

const SpinnerColumn = ({ items, value, onChange }) => {
    const ref = useRef(null);

    const selectedIndex = items.findIndex(
        (item) => String(item) === String(value)
    );

    const [localIndex, setLocalIndex] = useState(selectedIndex >= 0 ? selectedIndex : 0);

    // 🔥 CORRECT CENTER SCROLL LOGIC
    useEffect(() => {
        setLocalIndex(selectedIndex >= 0 ? selectedIndex : 0);
        if (!ref.current || selectedIndex < 0) return;

        const scrollTo = selectedIndex * ITEM_HEIGHT;

        ref.current.scrollTo({
            top: scrollTo < 0 ? 0 : scrollTo,
            behavior: "auto",
        });
    }, [selectedIndex]);

    const scrollTimeout = useRef(null);

    const handleScroll = (e) => {
        const scrollTop = e.target.scrollTop;
        const index = Math.round(scrollTop / ITEM_HEIGHT);

        // Instantly update the visual highlight
        if (index !== localIndex && items[index] !== undefined) {
            setLocalIndex(index);
        }

        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

        scrollTimeout.current = setTimeout(() => {
            if (items[index] !== undefined) {
                onChange(items[index]);
            }
        }, 100); // Only update state 100ms after scrolling stops or slows
    };

    return (
        <Box
            sx={{
                flex: 1,
                height: ITEM_HEIGHT * VISIBLE_ITEMS,
                position: "relative",
            }}
        >
            <Box
                ref={ref}
                onScroll={handleScroll}
                sx={{
                    height: "100%",
                    overflowY: "auto",
                    scrollSnapType: "y mandatory",
                    "&::-webkit-scrollbar": { display: "none" },
                    scrollbarWidth: "none",
                    pt: `${ITEM_HEIGHT * CENTER_INDEX}px`,
                    pb: `${ITEM_HEIGHT * CENTER_INDEX}px`,
                }}
            >
                {items.map((item, index) => {
                    const isSelected = index === localIndex;
                    const distance = Math.abs(index - localIndex);

                    let opacity = 0.3;
                    let fontSize = "1rem";

                    if (distance === 0) {
                        opacity = 1;
                        fontSize = "1.2rem";
                    } else if (distance === 1) {
                        opacity = 0.5;
                        fontSize = "1.1rem";
                    } else if (distance === 2) {
                        opacity = 0.4;
                        fontSize = "1rem";
                    }
                    else if (distance === 3) {
                        opacity = 0.6;
                        fontSize = ".9rem";
                    }

                    return (
                        <Box
                            key={`${index}-${item}`}
                            sx={{
                                height: ITEM_HEIGHT,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                scrollSnapAlign: "center",
                                transition: "all 0.15s ease-out",
                                opacity: opacity,
                                fontWeight: isSelected ? 500 : 400,
                                fontSize: fontSize,
                                color: isSelected ? "#222" : "#888888",
                            }}
                        >
                            {item}
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

const SpinnerDatePicker = ({ open, value, onCancel, onConfirm }) => {
    const years = getYears();

    const parseDate = () => {
        if (!value) return new Date();
        const d = new Date(value);
        return isNaN(d) ? new Date() : d;
    };

    const [day, setDay] = useState(1);
    const [month, setMonth] = useState("Jan");
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        if (open) {
            const d = parseDate();
            setDay(d.getDate());
            setMonth(months[d.getMonth()]);
            setYear(d.getFullYear());
        }
    }, [open, value]);

    const days = getDays(month, year);

    useEffect(() => {
        if (!days.includes(day)) {
            setDay(days[days.length - 1]);
        }
    }, [month, year]);

    const handleConfirm = () => {
        const monthIndex = months.indexOf(month) + 1;
        const formattedDate = `${year}-${String(monthIndex).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onConfirm(formattedDate);
    };

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            disableScrollLock={true}
            PaperProps={{
                sx: {
                    width: '70%',
                    maxWidth: '320px',
                    borderRadius: 3,
                    m: 2
                }
            }}
        >
            <Box sx={{ p: { xs: 2.5, sm: 3 }, textAlign: "center" }}>
                <Typography variant="h6" mb={2} sx={{ fontWeight: 600, color: '#444' }}>
                    Select Birth Date
                </Typography>

                <Box sx={{ position: "relative" }}>
                    {/* Global Center Highlight */}
                    <Box
                        sx={{
                            position: "absolute",
                            top: ITEM_HEIGHT * CENTER_INDEX,
                            left: 0,
                            right: 0,
                            height: ITEM_HEIGHT,
                            bgcolor: '#ffe8da',
                            pointerEvents: "none",
                            borderRadius: 1,
                        }}
                    />
                    {/* Columns with Fade Effect */}
                    <Box sx={{
                        display: "flex",
                        px: { xs: 0, sm: 1 },
                        maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
                        position: 'relative' // Sit above the absolute highlight
                    }}>
                        <SpinnerColumn items={years} value={year} onChange={setYear} />
                        <SpinnerColumn items={months} value={month} onChange={setMonth} />
                        <SpinnerColumn items={days} value={day} onChange={setDay} />
                    </Box>
                </Box>

                <Box mt={3} display="flex" justifyContent="space-between" px={1}>
                    <Button onClick={onCancel} sx={{ color: '#888', fontWeight: 600 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleConfirm} sx={{ bgcolor: '#FF8A3D', fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: '#e67324' } }}>
                        Confirm
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};

export default SpinnerDatePicker;