import React from 'react';
import {
    Box,
    Typography,
    ToggleButtonGroup,
    Button,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon from "@mui/icons-material/Place";
import EmailIcon from "@mui/icons-material/Email";
import { InputField } from "./inputwithIcon";
import { GenderButton } from "./inputwithIcon";
import SpinnerDatePicker from './SpinnerDatePicker';
import SpinnerTimePicker from './SpinnerTimePicker';

const BirthDetailsForm = ({ details, setDetails, error }) => {
    const [dobModalOpen, setDobModalOpen] = React.useState(false);
    const [tobModalOpen, setTobModalOpen] = React.useState(false);

    const handleConfirmDob = (newDob) => {
        setDetails({ ...details, dob: newDob });
        setDobModalOpen(false);
    };

    const handleConfirmTob = (newTob) => {
        setDetails({ ...details, tob: newTob });
        setTobModalOpen(false);
    };

    React.useEffect(() => {
        const initPlaces = () => {
            const birthPlaceInput = document.getElementById('birth_place');
            if (birthPlaceInput && window.clickastro && window.clickastro.places) {
                // To prevent double initialization
                if (birthPlaceInput.getAttribute('data-capac-initialized')) return;

                const capac = new window.clickastro.places.Autocomplete(birthPlaceInput, { types: ['(cities)'] });
                capac.inputId = 'capac_' + birthPlaceInput.id;
                capac.addListener('place_changed', function () {
                    const place = this.getPlace();
                    if (place && place.formatted_address) {
                        setDetails(prev => ({ ...prev, pob: place.formatted_address }));
                    }
                });
                birthPlaceInput.setAttribute('data-capac-initialized', 'true');
            }
        };

        // If the script is already loaded, init. Otherwise hook into the listener.
        if (window.clickastro && window.clickastro.places) {
            initPlaces();
        } else {
            // Store previous listener just in case
            const prevListener = window.CAPACInitListener;
            window.CAPACInitListener = () => {
                if (prevListener) prevListener();
                initPlaces();
            };
        }
    }, [setDetails]);

    const formatDisplayDate = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length >= 3) {
            // Safe manual parsing that ignores timezone shifts
            const daySpan = parts[2].split('T')[0];
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthName = monthNames[parseInt(parts[1], 10) - 1] || parts[1];
            return `${daySpan} ${monthName} ${parts[0]}`;
        }
        return dateString;
    };

    const formatDisplayTime = (timeString) => {
        if (!timeString) return '';
        if (timeString.includes(':')) {
            const parts = timeString.split(':');
            let hr24 = parseInt(parts[0], 10);
            const min = parts[1];
            const isPM = hr24 >= 12;
            let hr12 = hr24 % 12;
            if (hr12 === 0) hr12 = 12;
            return `${String(hr12).padStart(2, '0')}:${min} ${isPM ? 'PM' : 'AM'}`;
        }
        return timeString;
    };

    return (
        <form name="frmplaceorder" style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '0 10px' }}>
            <Box sx={{ width: { xs: "100%", sm: "90%" } }}>
                <Typography
                    sx={{
                        color: "#dc5d35",
                        fontWeight: 600,
                        mb: 1,
                        fontSize: 16,
                    }}
                >
                    Birth details:
                </Typography>

                {error && (
                    <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {/* Hidden location fields required by solar.js */}
                <input type="hidden" name="country" id="country" value={details.country} />
                <input type="hidden" name="state" id="state" value={details.state} />
                <input type="hidden" name="region_dist" id="region_dist" value={details.region_dist} />
                <input type="hidden" name="txt_place_search" id="txt_place_search" value={details.txt_place_search} />
                <input type="hidden" name="longdeg" id="longdeg" value={details.longdeg} />
                <input type="hidden" name="longmin" id="longmin" value={details.longmin} />
                <input type="hidden" name="longdir" id="longdir" value={details.longdir} />
                <input type="hidden" name="latdeg" id="latdeg" value={details.latdeg} />
                <input type="hidden" name="latmin" id="latmin" value={details.latmin} />
                <input type="hidden" name="latdir" id="latdir" value={details.latdir} />
                <input type="hidden" name="timezone" id="timezone" value={details.timezone} />
                <input type="hidden" name="timezone_name" id="timezone_name" value={details.timezone_name} />
                <input type="hidden" name="latitude_google" id="latitude_google" value={details.latitude_google} />
                <input type="hidden" name="longitude_google" id="longitude_google" value={details.longitude_google} />
                <input type="hidden" name="correction" id="correction" value={details.correction} />

                {/* Name */}
                <InputField
                    name="name"
                    icon={<PersonIcon sx={{ backgroundColor: "#ff8338", color: "#fff", borderRadius: 12, border: "2px solid #ff8338" }} />}
                    placeholder="Name"
                    value={details.name}
                    onChange={e => setDetails({ ...details, name: e.target.value })}
                />

                {/* Email */}
                <InputField
                    name="email"
                    icon={<EmailIcon sx={{ backgroundColor: "#ff8338", color: "#fff", borderRadius: 12, border: "4px solid #ff8338" }} />}
                    placeholder="Email Address"
                    type="email"
                    value={details.email}
                    onChange={e => setDetails({ ...details, email: e.target.value })}
                />

                {/* Gender */}
                <ToggleButtonGroup
                    exclusive
                    value={details.gender.toLowerCase()}
                    onChange={(_, v) => v && setDetails({ ...details, gender: v.charAt(0).toUpperCase() + v.slice(1) })}
                    sx={{
                        width: "90%",
                        mb: 1.5,
                        borderRadius: 1,
                        overflow: "hidden",
                    }}
                >
                    <GenderButton value="male">Male</GenderButton>
                    <GenderButton value="female">Female</GenderButton>
                </ToggleButtonGroup>

                {/* Date of birth */}
                <InputField
                    icon={<EventAvailableRoundedIcon />}
                    placeholder="Date of birth"
                    value={formatDisplayDate(details.dob)}
                    inputProps={{ readOnly: true }}
                    onClick={() => setDobModalOpen(true)}
                    sx={{ cursor: 'pointer', "& .MuiInputBase-input": { cursor: 'pointer' } }}
                />

                <SpinnerDatePicker
                    open={dobModalOpen}
                    value={details.dob}
                    onCancel={() => setDobModalOpen(false)}
                    onConfirm={handleConfirmDob}
                />

                {/* Time of birth */}
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <InputField
                        icon={<AccessTimeIcon />}
                        placeholder="Time of birth"
                        value={formatDisplayTime(details.tob)}
                        inputProps={{ readOnly: true }}
                        onClick={() => setTobModalOpen(true)}
                        sx={{ cursor: 'pointer', "& .MuiInputBase-input": { cursor: 'pointer' } }}
                    />

                    <SpinnerTimePicker
                        open={tobModalOpen}
                        value={details.tob}
                        onCancel={() => setTobModalOpen(false)}
                        onConfirm={handleConfirmTob}
                    />
                </Box>
                {/* Place of birth */}
                <InputField
                    id="birth_place"
                    className="place_auto_complete"
                    icon={<PlaceIcon />}
                    placeholder="Place of birth"
                    value={details.pob}
                    onChange={e => setDetails({ ...details, pob: e.target.value })}
                />
            </Box>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Chart style */}
                <Typography
                    sx={{
                        color: "#dc5d35",
                        fontWeight: 700,
                        mt: .5,
                        mb: 0.5,
                        fontSize: 17,
                    }}
                >
                    Horoscope chart style preference?
                </Typography>

                <Typography fontSize={16} color="#555" mb={2} lineHeight={1.2}>
                    The chart representations are slightly different based on regions in India.
                </Typography>
            </Box>
            <Box sx={{ width: { xs: "100%", sm: "90%" } }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, width: "90%" }}>
                    {["South Indian", "North Indian", "East Indian", "Kerala"].map((item) => (
                        <Button
                            key={item}
                            onClick={() => setDetails({ ...details, chart_style: item })}
                            variant={details.chart_style === item ? "contained" : "outlined"}
                            sx={{
                                bgcolor: details.chart_style === item ? "#FF8A3D" : "#fff",
                                color: details.chart_style === item ? "#fff" : "#111",
                                border: "none",
                                borderRadius: 1,
                                py: 1.2,
                                textTransform: "capitalize",
                                "&:hover": {
                                    bgcolor: details.chart_style === item ? "#FF7A28" : "#FFF0E6",
                                },
                            }}
                        >
                            {item}
                        </Button>
                    ))}
                </Box>
            </Box>
        </form>
    );
};

export default BirthDetailsForm;
