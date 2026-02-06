import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Card, CardContent, Divider, Grid, MenuItem, TextField, Alert, Snackbar } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import Subheader from '../components/subheader';
import { updateProfile } from '../api';

// import { InputField } from '../components/inputwithIcon';
import BirthDetailsForm from '../components/BirthDetailsForm';
import PrimaryButton from "../components/PrimaryButton";

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // Keep user for reference if needed, but details drives the form
    const [details, setDetails] = useState({
        name: '', mobile: '', relation: 'Self (This is me)', gender: 'Male', chart_style: 'South Indian', dob: '', tob: '', pob: '', email: '',
        country: '', state: '', region_dist: '', txt_place_search: '',
        longdeg: '', longmin: '', longdir: '', latdeg: '', latmin: '', latdir: '',
        timezone: '', timezone_name: '', latitude_google: '', longitude_google: '', correction: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const formatDate = (dateString) => {
        if (!dateString) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            const parts = dateString.split(/[-/]/);
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return '';
        }
        return date.toISOString().split('T')[0];
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        if (/^\d{2}:\d{2}$/.test(timeString)) return timeString;
        if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) return timeString.substring(0, 5);
        const date = new Date(`2000-01-01 ${timeString}`);
        if (!isNaN(date.getTime())) {
            return date.toTimeString().substring(0, 5);
        }
        return '';
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const mobile = localStorage.getItem('mobile');
            if (!mobile) {
                navigate('/');
                return;
            }

            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/user-status/${mobile}`);
                if (res.data.user_profile) {
                    const profile = res.data.user_profile;
                    setUser(profile);
                    setDetails({
                        name: profile.name || '',
                        mobile: profile.mobile || localStorage.getItem('mobile') || '',
                        relation: profile.relation || 'Self (This is me)',
                        email: profile.email || '',
                        gender: profile.gender || 'Male',
                        dob: formatDate(profile.dob),
                        tob: formatTime(profile.tob),
                        pob: profile.pob || '',
                        chart_style: profile.chart_style || 'South Indian',
                        country: profile.country || 'India',
                        state: profile.state || '',
                        region_dist: profile.region_dist || '',
                        txt_place_search: profile.txt_place_search || '',
                        longdeg: profile.longdeg || '',
                        longmin: profile.longmin || '',
                        longdir: profile.longdir || '',
                        latdeg: profile.latdeg || '',
                        latmin: profile.latmin || '',
                        latdir: profile.latdir || '',
                        timezone: profile.timezone || '',
                        timezone_name: profile.timezone_name || '',
                        latitude_google: profile.latitude_google || '',
                        longitude_google: profile.longitude_google || '',
                        correction: profile.correction || 0
                    });
                } else {
                    setError('Profile not found.');
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setError('Failed to load profile. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

        // Initialize Places API logic (Synced with Register.jsx)
        const initPlaces = () => {
            const birthPlaceInput = document.getElementById('birth_place');
            if (birthPlaceInput && window.clickastro && window.clickastro.places) {
                const capac = new window.clickastro.places.Autocomplete(birthPlaceInput, { types: ['(cities)'] });
                capac.inputId = 'capac_' + birthPlaceInput.id;
                capac.addListener('place_changed', function () {
                    const place = this.getPlace();
                    if (place && place.formatted_address) {
                        setDetails(prev => ({ ...prev, pob: place.formatted_address }));
                    }
                });
            }
        };

        window.CAPACInitListener = initPlaces;

        if (window.clickastro && window.clickastro.places) {
            initPlaces();
        }

        // Load scripts in sequence to ensure proper initialization
        const jqueryScript = document.createElement('script');
        jqueryScript.src = 'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js';
        jqueryScript.onload = () => {
            const solarScript = document.createElement('script');
            solarScript.src = '/solar.js';
            solarScript.onload = () => {
                const capacScript = document.createElement('script');
                capacScript.src = 'https://placesapis.clickastro.com/capac/api/?key=AJSjkshjjSDkjhKDJDhjdjdklDldld&callback=initAutocomplete';
                document.body.appendChild(capacScript);
            };
            document.body.appendChild(solarScript);
        };
        document.body.appendChild(jqueryScript);

        return () => {
            const scriptsToRemove = [
                'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js',
                'https://placesapis.clickastro.com/capac/api/'
            ];
            scriptsToRemove.forEach(src => {
                const scripts = document.querySelectorAll(`script[src^="${src}"]`);
                scripts.forEach(script => {
                    if (document.body.contains(script)) {
                        document.body.removeChild(script);
                    }
                });
            });
            delete window.CAPACInitListener;
        };
    }, [navigate]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            // Get location details from hidden inputs (populated by solar.js)
            const locationFields = {
                country: document.getElementById('country')?.value || '',
                state: document.getElementById('state')?.value || '',
                region_dist: document.getElementById('region_dist')?.value || '',
                txt_place_search: document.getElementById('txt_place_search')?.value || '',
                longdeg: document.getElementById('longdeg')?.value || '',
                longmin: document.getElementById('longmin')?.value || '',
                longdir: document.getElementById('longdir')?.value || '',
                latdeg: document.getElementById('latdeg')?.value || '',
                latmin: document.getElementById('latmin')?.value || '',
                latdir: document.getElementById('latdir')?.value || '',
                timezone: document.getElementById('timezone')?.value || '0',
                timezone_name: document.getElementById('timezone_name')?.value || '',
                latitude_google: document.getElementById('latitude_google')?.value || '',
                longitude_google: document.getElementById('longitude_google')?.value || '',
                correction: document.getElementById('correction')?.value || '0'
            };

            const payload = { ...details, ...locationFields };
            await updateProfile(payload);
            setSuccessMsg("Profile updated successfully! Your report is being regenerated.");

            // Optional: Update local storage if name/email changed
            localStorage.setItem('userName', details.name);
            localStorage.setItem('userEmail', details.email);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FFF6EB',
            overflow: 'hidden'
        }}>
            <Box sx={{ position: 'relative', flexShrink: 0, zIndex: 100, bgcolor: '#FFF6EB' }}>
                <Subheader title="Edit Profile" showBack navTo="/chat" />
            </Box>

            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                position: 'relative',
                zIndex: 10,
                mt: 9,
                px: 2,
                pb: 5,
                pt: 4,
                "&::-webkit-scrollbar": {
                    display: "none",
                },
                scrollbarWidth: "none",
            }}>


                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <div className="spinner-indigo" style={{ width: 40, height: 40 }} />
                    </Box>
                ) : (
                    <>
                        {/* <Box sx={{ width: '100%', display: 'flex', justifyContent: 'left', padding: '0 10px' }}>
                            <Box sx={{ width: { xs: "100%", sm: "90%" } }}>
                                <Typography
                                    sx={{
                                        color: "#dc5d35",
                                        fontWeight: 600,
                                        mb: 1,
                                        fontSize: 16,
                                    }}
                                >
                                    Relation:
                                </Typography>
                                <TextField
                                    select
                                    fullWidth
                                    value={details.relation || 'Self (This is me)'}
                                    onChange={(e) => setDetails({ ...details, relation: e.target.value })}
                                    variant="outlined"
                                    sx={{
                                        mb: 2,
                                        bgcolor: "#fff",
                                        borderRadius: 1,
                                        width: '75%',
                                        "& fieldset": { border: "none" },
                                        "& .MuiInputBase-root": { height: 52 },
                                        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
                                        "& .MuiSelect-icon": {
                                            color: "#dc5d35",
                                            fontSize: 40,
                                            right: 12,
                                            fontWeight: 900,
                                        }
                                    }}
                                    SelectProps={{
                                        IconComponent: KeyboardArrowDownRoundedIcon,
                                    }}
                                >
                                    {['Self (This is me)', 'Mother', 'Father', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister', 'Friend', 'Other'].map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Box> */}
                        <Box sx={{ width: '100%' }}>
                            <BirthDetailsForm details={details} setDetails={setDetails} error={error} />
                        </Box>
                        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'right', width: '100%' }}>
                            <PrimaryButton
                                label={saving ? "Saving..." : "Save profile"}
                                onClick={handleSave}
                                disabled={saving}
                                sx={{
                                    bgcolor: "#dc5d35",
                                    color: "#fff",
                                    fontWeight: 500,
                                    fontSize: 16,
                                    textTransform: "none",
                                    px: 3,
                                    py: 1.5,
                                    borderRadius: 5,
                                    boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
                                    "&:hover": {
                                        bgcolor: "#c24c2f",
                                        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                                    },
                                }}
                            />
                        </Box>
                    </>
                )}
            </Box>

            <Snackbar
                open={!!successMsg}
                autoHideDuration={6000}
                onClose={() => setSuccessMsg('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSuccessMsg('')} severity="success" sx={{ width: '100%' }}>
                    {successMsg}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!error && !loading}
                autoHideDuration={6000}
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UserProfile;
