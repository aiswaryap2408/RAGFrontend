import React, { useEffect, useRef, useState } from "react";
import { Dialog, Box, Typography, Button } from "@mui/material";

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

const ampmList = ["AM", "PM"];

const getHours = () => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const getMinutes = () => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

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
        }, 100); // Debounce to unlock scrolling thread
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

const SpinnerTimePicker = ({ open, value, onCancel, onConfirm }) => {
    const hoursList = getHours();
    const minutesList = getMinutes();

    // Parse incoming "HH:mm" (24hr) into 12hr parts
    const parseTime = () => {
        let hr24 = 6;
        let min = 0;

        if (value && typeof value === 'string' && value.includes(':')) {
            const parts = value.split(':');
            hr24 = parseInt(parts[0], 10);
            min = parseInt(parts[1], 10);
            if (isNaN(hr24)) hr24 = 6;
            if (isNaN(min)) min = 0;
        }

        const isPM = hr24 >= 12;
        let hr12 = hr24 % 12;
        if (hr12 === 0) hr12 = 12;

        return {
            hour: String(hr12).padStart(2, '0'),
            minute: String(min).padStart(2, '0'),
            ampm: isPM ? 'PM' : 'AM'
        };
    };

    const [hour, setHour] = useState("06");
    const [minute, setMinute] = useState("00");
    const [ampm, setAmpm] = useState("AM");

    useEffect(() => {
        if (open) {
            const parsed = parseTime();
            setHour(parsed.hour);
            setMinute(parsed.minute);
            setAmpm(parsed.ampm);
        }
    }, [open, value]);

    const handleConfirm = () => {
        let hr24 = parseInt(hour, 10);
        if (ampm === "PM" && hr24 < 12) {
            hr24 += 12;
        } else if (ampm === "AM" && hr24 === 12) {
            hr24 = 0;
        }

        const formattedTime = `${String(hr24).padStart(2, '0')}:${minute}`;
        onConfirm(formattedTime); // Returns 24-hr format e.g. "14:30"
    };

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            disableScrollLock={true}
            PaperProps={{
                sx: {
                    width: '90%',
                    maxWidth: '400px',
                    borderRadius: 3,
                    m: 2
                }
            }}
        >
            <Box sx={{ p: { xs: 2.5, sm: 3 }, textAlign: "center" }}>
                <Typography variant="h6" mb={2} sx={{ fontWeight: 600, color: '#444' }}>
                    Select Birth Time
                </Typography>

                <Box sx={{ display: "flex", gap: 0.5, px: { xs: 0, sm: 1 } }}>
                    <SpinnerColumn items={hoursList} value={hour} onChange={setHour} />
                    <SpinnerColumn items={minutesList} value={minute} onChange={setMinute} />
                    <SpinnerColumn items={ampmList} value={ampm} onChange={setAmpm} />
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

export default SpinnerTimePicker;
