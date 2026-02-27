import React, { useEffect, useRef, useState } from "react";
import { Dialog, Box, Typography, Button } from "@mui/material";

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
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

    // 🔥 CORRECT CENTER SCROLL LOGIC
    useEffect(() => {
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
                    const isSelected = index === selectedIndex;

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
                                opacity: isSelected ? 1 : 0.25,
                                fontWeight: isSelected ? 800 : 500,
                                fontSize: isSelected ? "1.2rem" : "1rem",
                                color: isSelected ? "#FF8A3D" : "#555",
                                transform: isSelected ? "scale(1.15)" : "scale(0.95)"
                            }}
                        >
                            {item}
                        </Box>
                    );
                })}
            </Box>

            {/* Center Highlight */}
            <Box
                sx={{
                    position: "absolute",
                    top: ITEM_HEIGHT * CENTER_INDEX,
                    left: 0,
                    right: 0,
                    height: ITEM_HEIGHT,
                    borderTop: "1px solid #ddd",
                    borderBottom: "1px solid #ddd",
                    pointerEvents: "none",
                }}
            />
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
        <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6" mb={2}>
                    Select Birth Date
                </Typography>

                <Box sx={{ display: "flex" }}>
                    <SpinnerColumn items={days} value={day} onChange={setDay} />
                    <SpinnerColumn items={months} value={month} onChange={setMonth} />
                    <SpinnerColumn items={years} value={year} onChange={setYear} />
                </Box>

                <Box mt={3} display="flex" justifyContent="space-between">
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button variant="contained" onClick={handleConfirm}>
                        Confirm
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};

export default SpinnerDatePicker;