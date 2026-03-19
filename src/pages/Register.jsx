import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, setAuthToken } from '../api';
import {
    Box,
    Typography,
    Button,
} from "@mui/material";
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import Header from "../components/header";
import PrimaryButton from "../components/PrimaryButton";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import BirthDetailsForm from '../components/BirthDetailsForm';
import HamburgerMenu from '../components/HamburgerMenu';

const Register = () => {
    const navigate = useNavigate();
    const [mobile, setMobile] = useState('');
    const [details, setDetails] = useState({
        name: '',
        gender: 'Male',
        chart_style: 'South Indian',
        dob: '',
        tob: '',
        pob: '',
        current_city: '',
        email: '',
        // Location-related hidden fields
        country: '',
        state: '',
        region_dist: '',
        txt_place_search: '',
        longdeg: '',
        longmin: '',
        longdir: '',
        latdeg: '',
        latmin: '',
        latdir: '',
        timezone: '0',
        timezone_name: '',
        latitude_google: '',
        longitude_google: '',
        correction: '0',
        current_country: '',
        current_state: '',
        current_region_dist: '',
        current_txt_place_search: '',
        current_longdeg: '',
        current_longmin: '',
        current_longdir: '',
        current_latdeg: '',
        current_latmin: '',
        current_latdir: '',
        current_timezone: '0',
        current_timezone_name: '',
        current_latitude_google: '',
        current_longitude_google: '',
        current_correction: '0'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [focusTrigger, setFocusTrigger] = useState(0);

    useEffect(() => {
        const storedMobile = localStorage.getItem('mobile');
        if (!storedMobile) {
            navigate('/');
        } else {
            setMobile(storedMobile);
        }

        // Session timeout: 10 minutes = 600,000 ms
        const timeoutId = setTimeout(() => {
            console.log("Registration session expired. Redirecting...");
            navigate('/');
        }, 600000);

        // Places API is handled by solar.js via the 'place_auto_complete' class.
        // We just need to make sure the script is loaded.


        // Load scripts in sequence to ensure proper initialization
        // Load jQuery first
        const jqueryScript = document.createElement('script');
        jqueryScript.src = 'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js';
        jqueryScript.onload = () => {
            console.log('jQuery loaded');

            // Load solar.js after jQuery
            const solarScript = document.createElement('script');
            solarScript.src = '/solar.js';
            solarScript.onload = () => {
                console.log('solar.js loaded');

                // Load CAPAC API script after solar.js
                const capacScript = document.createElement('script');
                capacScript.src = 'https://placesapis.clickastro.com/capac/api/?key=AJSjkshjjSDkjhKDJDhjdjdklDldld&callback=initAutocomplete';
                capacScript.onload = () => {
                    console.log('CAPAC API loaded');
                };
                capacScript.onerror = () => {
                    console.error('Failed to load CAPAC API');
                };
                document.body.appendChild(capacScript);
            };
            solarScript.onerror = () => {
                console.error('Failed to load solar.js');
            };
            document.body.appendChild(solarScript);
        };
        jqueryScript.onerror = () => {
            console.error('Failed to load jQuery');
        };
        document.body.appendChild(jqueryScript);

        return () => {
            clearTimeout(timeoutId);

            // Remove all dynamically added scripts
            const scriptsToRemove = [
                'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js',
                // '/solar.js',
                'https://www.clickastro.com/js/cad/google_place_for_cards-solar.js?ver=6.201',
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

    const handleDetailsSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        setErrors({});

        // Validation
        const { name, email, dob, tob, pob, current_city, chart_style, gender } = details;
        const newErrors = {};

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
            correction: document.getElementById('correction')?.value || '0',
            // Current City Location Fields
            current_country: document.getElementById('current_country')?.value || '',
            current_state: document.getElementById('current_state')?.value || '',
            current_region_dist: document.getElementById('current_region_dist')?.value || '',
            current_txt_place_search: document.getElementById('current_txt_place_search')?.value || '',
            current_longdeg: document.getElementById('current_longdeg')?.value || '',
            current_longmin: document.getElementById('current_longmin')?.value || '',
            current_longdir: document.getElementById('current_longdir')?.value || '',
            current_latdeg: document.getElementById('current_latdeg')?.value || '',
            current_latmin: document.getElementById('current_latmin')?.value || '',
            current_latdir: document.getElementById('current_latdir')?.value || '',
            current_timezone: document.getElementById('current_timezone')?.value || '0',
            current_timezone_name: document.getElementById('current_timezone_name')?.value || '',
            current_latitude_google: document.getElementById('current_latitude_google')?.value || '',
            current_longitude_google: document.getElementById('current_longitude_google')?.value || '',
            current_correction: document.getElementById('current_correction')?.value || '0'
        };

        if (!name.trim()) newErrors.name = "Name is required.";
        if (!email.trim()) newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid.";
        if (!gender.trim()) newErrors.gender = "Gender is required.";
        if (gender.trim() && !["Male", "Female"].includes(gender.trim())) newErrors.gender = "Gender must be Male or Female.";
        if (!dob.trim()) newErrors.dob = "Date of birth is required.";
        if (!tob.trim()) newErrors.tob = "Time of birth is required.";
        if (!pob.trim()) {
            newErrors.pob = "Select place of birth.";
        } else if (!locationFields.longdeg || !locationFields.latdeg || locationFields.longdeg === '0' || locationFields.latdeg === '0') {
            newErrors.pob = "Please select place of birth from the suggestions dropdown.";
        }

        if (!current_city.trim()) {
            newErrors.current_city = "Select current place.";
        } else if (!locationFields.current_longdeg || !locationFields.current_latdeg || locationFields.current_longdeg === '0' || locationFields.current_latdeg === '0') {
            newErrors.current_city = "Please select current place from the suggestions dropdown.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setFocusTrigger(prev => prev + 1);
            setLoading(false);
            return;
        }

        try {

            const payload = { ...details, ...locationFields, mobile };
            const res = await registerUser(payload);
            const { access_token, referenceid } = res.data;

            setAuthToken(access_token);
            localStorage.setItem('token', access_token);
            localStorage.setItem('userName', details.name);
            localStorage.setItem('userEmail', details.email);
            if (referenceid) {
                localStorage.setItem('currentProfileId', referenceid);
            }

            setTimeout(() => {
                navigate('/register-success');
            }, 1000);

        } catch (err) {
            console.error("Registration Error:", err);
            const msg = err.response?.data?.detail || err.message;
            // Handle Pydantic validation errors which might come as an array
            if (Array.isArray(msg)) {
                setError(`Registration failed: ${msg[0].msg}`);
            } else {
                setError(`Registration failed: ${msg}`);
            }
            setLoading(false);
        }
    };

    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <Header />

            <HamburgerMenu />


            <Box p={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 14 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {/* Hidden location fields moved to BirthDetailsForm */}

                    {/* <Box sx={{ width: { xs: "100%", sm: "85%" }, mx: "auto" }}> */}
                    <BirthDetailsForm details={details} setDetails={setDetails} error={error} errors={errors} setErrors={setErrors} focusTrigger={focusTrigger} />
                    {/* </Box> */}

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'right', width: '100%' }}>
                        <PrimaryButton
                            label={loading ? "Registering..." : "Continue"}
                            onClick={handleDetailsSubmit}
                            disabled={loading}
                            endIcon={<KeyboardDoubleArrowRightIcon />}
                            sx={{
                                p: 1.2,
                                height: 48,
                                borderRadius: 5,
                                width: { xs: "60%", sm: "40%" },
                                justifyContent: 'space-evenly',
                                "& .MuiButton-endIcon svg": {
                                    fontSize: 38,   // 👈 this WILL work
                                },
                            }}
                        />

                    </Box>
                </LocalizationProvider>
            </Box>
        </Box>
    );
};
export default Register;
