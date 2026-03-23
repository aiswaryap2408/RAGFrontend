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

const BirthDetailsForm = ({ details, setDetails, error, errors = {}, setErrors, focusTrigger = 0 }) => {
    const [dobModalOpen, setDobModalOpen] = React.useState(false);
    const [tobModalOpen, setTobModalOpen] = React.useState(false);

    const nameRef = React.useRef(null);
    const emailRef = React.useRef(null);
    const genderRef = React.useRef(null);
    const dobRef = React.useRef(null);
    const tobRef = React.useRef(null);
    const pobRef = React.useRef(null);
    const currentCityRef = React.useRef(null);
    const detailsRef = React.useRef(details);

    React.useEffect(() => {
        detailsRef.current = details;
    }, [details]);

    React.useEffect(() => {
        // Auto-clear errors when the user fills in the field
        if (setErrors && Object.keys(errors).length > 0) {
            const keysToClear = [];
            Object.keys(errors).forEach(key => {
                const val = details[key];
                if (val && typeof val === 'string' && val.trim() !== '') {
                    if (key === 'email') {
                        // Only clear email error if it passes basic format check
                        if (/\S+@\S+\.\S+/.test(val)) {
                            keysToClear.push(key);
                        }
                    } else if (key === 'pob') {
                        if (errors.pob === "Place of birth is required." && val.trim() !== '') {
                            keysToClear.push(key);
                        }
                        // Note: If the error is 'Please select a valid birth place from the suggestions dropdown.',
                        // we DO NOT auto-clear it here just because they typed a character. 
                        // It will be cleared explicitly by the 'place_changed' listener in the Places API callback.
                    } else if (key === 'current_city') {
                        // Only clear the 'required' error on typing, not the 'select from dropdown' error
                        if (val.trim() !== '' && errors.current_city === 'Select current place.') {
                            keysToClear.push(key);
                        }
                    } else {
                        // For other fields, just being non-empty is enough to clear "is required"
                        keysToClear.push(key);
                    }
                }
            });

            if (keysToClear.length > 0) {
                setErrors(prev => {
                    const next = { ...prev };
                    keysToClear.forEach(k => delete next[k]);
                    return next;
                });
            }
        }
    }, [details, errors, setErrors]);

    React.useEffect(() => {
        // Auto-focus on the first field with an error, BUT ONLY when triggered by a submit attempt.
        if (focusTrigger > 0 && Object.keys(errors).length > 0) {
            const firstErrorField = [
                { key: 'name', ref: nameRef },
                { key: 'email', ref: emailRef },
                { key: 'gender', ref: genderRef },
                { key: 'dob', ref: dobRef },
                { key: 'tob', ref: tobRef },
                { key: 'pob', ref: pobRef },
                { key: 'current_city', ref: currentCityRef },
            ].find(field => errors[field.key]);

            if (firstErrorField && firstErrorField.ref.current) {
                firstErrorField.ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a small delay for smooth scroll before focus
                setTimeout(() => {
                    if (firstErrorField.ref.current) {
                        firstErrorField.ref.current.focus();
                    }
                }, 300);
            }
        }
    }, [focusTrigger]);

    const handleConfirmDob = (newDob) => {
        setDetails({ ...details, dob: newDob });
        setDobModalOpen(false);
    };

    const handleConfirmTob = (newTob) => {
        setDetails({ ...details, tob: newTob });
        setTobModalOpen(false);
    };

    React.useEffect(() => {
        // solar.js uses initAutocomplete() which finds inputs by className='place_auto_complete'
        // and attaches onkeyup + clickastro.places.Autocomplete, then calls fillInAddressMain
        // which fills the hidden DOM inputs (country, longdeg, latdeg, etc.).
        // We need to sync those hidden input values back into React state.

        let syncInterval = null;

        const syncFromDOM = () => {
            // Ensure autocomplete is initialized if it exists
            if (typeof window.initAutocomplete === 'function') {
                const birthPlaceInput = document.getElementById('birth_place');
                const currentCityInput = document.getElementById('current_city');

                let initializedAny = false;
                [birthPlaceInput, currentCityInput].forEach(el => {
                    if (el && !el.hasAttribute('data-ac-initialized')) {
                        el.setAttribute('data-ac-initialized', 'true');
                        initializedAny = true;
                    }
                });

                if (initializedAny && typeof window.initAutocomplete === 'function') {
                    console.log('Targeted initAutocomplete trigger');
                    window.initAutocomplete();
                }
            }

            const currentDetails = detailsRef.current;

            const pobInput = document.getElementById('birth_place');
            const pob = pobInput?.value || '';
            if (pob && pob !== currentDetails.pob) {
                setDetails(prev => ({ ...prev, pob }));
                if (typeof setErrors === 'function') {
                    setErrors(prev => { const n = { ...prev }; delete n.pob; return n; });
                }
            }

            const currentCityInput = document.getElementById('current_city');
            const currentCity = currentCityInput?.value || '';
            if (currentCity && currentCity !== currentDetails.current_city) {
                setDetails(prev => ({ ...prev, current_city: currentCity }));
                if (typeof setErrors === 'function') {
                    setErrors(prev => { const n = { ...prev }; delete n.current_city; return n; });
                }
            }

            // Also sync all hidden fields that solar.js might have filled
            const hiddenFields = [
                'country', 'state', 'region_dist', 'longdeg', 'longmin', 'longdir',
                'latdeg', 'latmin', 'latdir', 'timezone', 'timezone_name',
                'latitude_google', 'longitude_google', 'correction',
                'current_country', 'current_state', 'current_region_dist', 'current_longdeg',
                'current_longmin', 'current_longdir', 'current_latdeg', 'current_latmin',
                'current_latdir', 'current_timezone', 'current_timezone_name',
                'current_latitude_google', 'current_longitude_google', 'current_correction'
            ];

            let stateUpdates = null;
            hiddenFields.forEach(id => {
                const el = document.getElementById(id);
                if (el && el.value !== currentDetails[id]) {
                    if (!stateUpdates) stateUpdates = {};
                    stateUpdates[id] = el.value;
                }
            });

            if (stateUpdates) {
                setDetails(prev => ({ ...prev, ...stateUpdates }));
            }
        };

        // Poll every 800ms while form is active
        syncInterval = setInterval(syncFromDOM, 800);
        syncFromDOM();

        return () => {
            if (syncInterval) clearInterval(syncInterval);
        };
    }, [setDetails, setErrors]); // Removed details.pob/current_city to stop loop

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


                {/* Hidden location fields required by solar.js */}
                <input type="hidden" name="current_country" id="current_country" value={details.current_country} />
                <input type="hidden" name="current_state" id="current_state" value={details.current_state} />
                <input type="hidden" name="current_region_dist" id="current_region_dist" value={details.current_region_dist} />
                <input type="hidden" name="current_txt_place_search" id="current_txt_place_search" value={details.current_txt_place_search} />
                <input type="hidden" name="current_longdeg" id="current_longdeg" value={details.current_longdeg} />
                <input type="hidden" name="current_longmin" id="current_longmin" value={details.current_longmin} />
                <input type="hidden" name="current_longdir" id="current_longdir" value={details.current_longdir} />
                <input type="hidden" name="current_latdeg" id="current_latdeg" value={details.current_latdeg} />
                <input type="hidden" name="current_latmin" id="current_latmin" value={details.current_latmin} />
                <input type="hidden" name="current_latdir" id="current_latdir" value={details.current_latdir} />
                <input type="hidden" name="current_timezone" id="current_timezone" value={details.current_timezone} />
                <input type="hidden" name="current_timezone_name" id="current_timezone_name" value={details.current_timezone_name} />
                <input type="hidden" name="current_latitude_google" id="current_latitude_google" value={details.current_latitude_google} />
                <input type="hidden" name="current_longitude_google" id="current_longitude_google" value={details.current_longitude_google} />
                <input type="hidden" name="current_correction" id="current_correction" value={details.current_correction} />

                {/* Name */}
                <InputField
                    name="name"
                    icon={<PersonIcon sx={{ backgroundColor: "#ff8338", color: "#fff", borderRadius: 12, border: "2px solid #ff8338" }} />}
                    placeholder="Name"
                    value={details.name}
                    onChange={e => setDetails({ ...details, name: e.target.value })}
                    error={!!errors.name}
                    helperText={errors.name}
                    inputRef={nameRef}
                />

                {/* Email */}
                <InputField
                    name="email"
                    icon={<EmailIcon sx={{ backgroundColor: "#ff8338", color: "#fff", borderRadius: 12, border: "4px solid #ff8338" }} />}
                    placeholder="Email Address"
                    type="email"
                    value={details.email}
                    onChange={e => setDetails({ ...details, email: e.target.value })}
                    error={!!errors.email}
                    helperText={errors.email}
                    inputRef={emailRef}
                />

                {/* Gender */}
                <Box ref={genderRef}>
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
                        <GenderButton value="male" error={!!errors.gender}>Male</GenderButton>
                        <GenderButton value="female" error={!!errors.gender}>Female</GenderButton>
                    </ToggleButtonGroup>
                    {errors.gender && (
                        <Typography color="error" variant="caption" sx={{ display: 'block', mb: 1, ml: 2, mt: -0.5 }}>
                            {errors.gender}
                        </Typography>
                    )}
                </Box>

                {/* Date of birth */}
                <InputField
                    icon={<EventAvailableRoundedIcon />}
                    placeholder="Date of birth"
                    value={formatDisplayDate(details.dob)}
                    inputProps={{ readOnly: true }}
                    onClick={() => setDobModalOpen(true)}
                    sx={{ cursor: 'pointer', "& .MuiInputBase-input": { cursor: 'pointer' } }}
                    error={!!errors.dob}
                    helperText={errors.dob}
                    inputRef={dobRef}
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
                        error={!!errors.tob}
                        helperText={errors.tob}
                        inputRef={tobRef}
                    />

                    <SpinnerTimePicker
                        open={tobModalOpen}
                        value={details.tob}
                        onCancel={() => setTobModalOpen(false)}
                        onConfirm={handleConfirmTob}
                    />
                </Box>
                {/* Place of birth */}
                {/* Place of birth */}
                <InputField
                    icon={<PlaceIcon />}
                    placeholder="Place of birth"
                    value={details.pob}
                    onChange={e => setDetails({ ...details, pob: e.target.value })}
                    error={!!errors.pob}
                    helperText={errors.pob}
                    inputRef={pobRef}
                    inputProps={{
                        id: 'birth_place',
                        className: 'place_auto_complete',
                        autoComplete: 'off',
                    }}
                />

                {/* Current City */}
                <InputField
                    icon={<PlaceIcon sx={{ color: "#ff8338" }} />}
                    placeholder="Current City"
                    value={details.current_city}
                    onChange={e => setDetails({ ...details, current_city: e.target.value })}
                    error={!!errors.current_city}
                    helperText={errors.current_city}
                    inputRef={currentCityRef}
                    inputProps={{
                        id: 'current_city',
                        className: 'place_auto_complete',
                        autoComplete: 'off',
                    }}
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
