import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Subheader from '../components/subheader';

const PlanCard = ({
    title,
    subtitle,
    features,
    originalPrice,
    discountedPrice,
    buttonText,
    ribbonText,
    ribbonSubtext,
    ribbonImg,
    note
}) => (
    <Box sx={{
        position: 'relative',
        bgcolor: '#fff',
        borderRadius: '20px',
        p: 3,
        mb: 3,
        mx: 2,
        boxShadow: '0px 4px 10px rgba(0,0,0,0.05)',
        overflow: 'visible'
    }}>
        {/* Ribbon / Badge Overlay */}
        {ribbonText && (
            <Box sx={{
                position: 'absolute',
                top: -6,
                right: 25,
                width: 70,
                zIndex: 2,
            }}>
                {/* SVG Ribbon Image - Scales to actual height */}
                <Box
                    component="img"
                    src={ribbonImg}
                    alt="Plan Ribbon"
                    sx={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                    }}
                />

                {/* Ribbon Text - Absolutely positioned over the image */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '80%', // Situate text in the upper 80% of the ribbon
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pt: 2,

                }}>
                    {ribbonSubtext && (
                        <Typography sx={{ fontSize: '.75rem', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.5, width: '85%' }}>
                            {ribbonSubtext}
                        </Typography>
                    )}
                    <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, textAlign: 'center', lineHeight: 1.2, mt: 0.2 }}>
                        <span style={{ color: '#fff', fontSize: '.9rem', fontWeight: 400, display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>Save</span> {ribbonText}<span style={{ color: '#fff', fontSize: '.9rem', fontWeight: 400, }}>%</span>
                    </Typography>
                </Box>
            </Box>
        )}

        {/* Content */}
        <Typography sx={{ fontSize: '0.8rem', color: '#000000', mb: 1.5, pr: 9, lineHeight: 1.2 }}>
            {subtitle}
        </Typography>

        <Box sx={{ mb: 2 }}>
            {features.map((feature, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 0.5, }}>
                    {feature.included ? (
                        <CheckIcon sx={{ color: '#54a170', fontSize: 22, mr: 1, stroke: "#54a170", strokeWidth: 1.7 }} />
                    ) : (
                        <CloseIcon sx={{ color: '#ff0000', fontSize: 22, mr: 1, stroke: "#ff0000", strokeWidth: .3 }} />
                    )}
                    <Typography sx={{
                        fontSize: '1rem',
                        fontWeight: 400,
                        color: feature.included ? '#000000' : '#968c7f',
                        lineHeight: 1
                    }}>
                        {feature.name}
                    </Typography>
                </Box>
            ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <Button
                variant="contained"
                sx={{
                    bgcolor: '#54a170',
                    color: '#fff',
                    borderRadius: 50,
                    textTransform: 'none',
                    fontWeight: 400,
                    px: 3,
                    py: 0.8,
                    fontSize: '1rem',
                    '&:hover': { bgcolor: '#54a170' }
                }}
            >
                {buttonText}
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ textDecoration: 'line-through', color: '#e63935', fontSize: '0.75rem', fontWeight: 500 }}>
                    ₹{originalPrice}
                </Typography>
                <Typography sx={{ color: '#54a170', fontSize: '1rem', fontWeight: 600 }}>
                    ₹{discountedPrice}
                </Typography>
            </Box>
        </Box>

        {note && (
            <Typography sx={{ fontSize: '0.9rem', mt: 2, color: '#000000', lineHeight: 1.2 }}>
                {note}
            </Typography>
        )}
    </Box>
);

const Subscription = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#FFF5E9',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <Box sx={{ position: 'relative', flexShrink: 0, zIndex: 100, bgcolor: '#FFF6EB' }}>
                <Subheader title="Subscription" showBack navTo="/dashboard" />
            </Box>

            {/* Scrollable Content */}
            <Box sx={{ flex: 1, pb: 4, mt: 8 }}>
                {/* Why Subscribe? Section */}
                <Box sx={{ p: 2, mt: 1 }}>
                    <Typography sx={{ color: '#e63935', fontWeight: 700, fontSize: '1.1rem', mb: 1 }}>
                        Why subscribe?
                    </Typography>
                    <Typography sx={{ color: '#000000', fontSize: '1rem', lineHeight: 1.4, mb: 2 }}>
                        A <strong>Monthly or Quarterly subscription is ideal</strong> if you wish to <strong>interact frequently</strong> with the astrologer and receive <strong>remedies and mantras</strong> whenever applicable.
                    </Typography>
                    <Typography sx={{ color: '#000000', fontSize: '1rem', lineHeight: 1.4 }}>
                        Subscribers receive more <strong>detailed insights</strong> with every response, and their <strong>questions are prioritized</strong> over non-subscribed users.
                    </Typography>
                </Box>

                {/* Daily Pass */}
                <Box sx={{ px: 2, mt: 1 }}>
                    <Typography sx={{ color: '#e63935', fontWeight: 700, fontSize: '1.2rem', mb: 0 }}>
                        One-Time Daily Pass:
                    </Typography>
                </Box>
                <PlanCard
                    subtitle={<>One-time payment valid for <strong>24 hours</strong>. Ask <strong>unlimited questions</strong> during this period.</>}
                    features={[
                        { name: 'Unlimited questions (No paywall)', included: true },
                        { name: 'Detailed answers', included: true },
                        { name: 'Remedies', included: false },
                        { name: 'Mantras', included: false },
                    ]}
                    buttonText="Get One Day Pass"
                    originalPrice="349"
                    discountedPrice="299"
                    ribbonText="14"
                    // ribbonSubtext="Save"
                    ribbonImg="/svg/daily.svg"
                    note="Note: Remedies and mantras are available only in Monthly and Quarterly subscriptions."
                />

                {/* Monthly Subscription */}
                <Box sx={{ px: 2 }}>
                    <Typography sx={{ color: '#e63935', fontWeight: 700, fontSize: '1.2rem', mb: 0 }}>
                        Monthly Subscription:
                    </Typography>
                </Box>
                <PlanCard
                    subtitle="This will be a recurring monthly subscription renewed automatically."
                    features={[
                        { name: 'Unlimited answers', included: true },
                        { name: 'Detailed answers', included: true },
                        { name: 'Remedies', included: true },
                        { name: 'Mantras', included: true },
                    ]}
                    buttonText="Subscribe Monthly"
                    originalPrice="1299"
                    discountedPrice="899"
                    ribbonText="30"
                    ribbonSubtext="POPULAR"
                    ribbonImg="/svg/monthly.svg"
                />

                {/* Quarterly Subscription */}
                <Box sx={{ px: 2 }}>
                    <Typography sx={{ color: '#e63935', fontWeight: 700, fontSize: '1.2rem', mb: 0 }}>
                        Quarterly Subscription:
                    </Typography>
                </Box>
                <PlanCard
                    subtitle="This will be a recurring once in 3 months subscription renewed automatically."
                    features={[
                        { name: 'Unlimited answers', included: true },
                        { name: 'Detailed answers', included: true },
                        { name: 'Remedies', included: true },
                        { name: 'Mantras', included: true },
                    ]}
                    buttonText="Subscribe Yearly"
                    originalPrice="3599"
                    discountedPrice="1499"
                    ribbonText="58"
                    ribbonSubtext="MOST VALUE FOR MONEY"
                    ribbonImg="/svg/quarterly.svg"
                />

                {/* Fair Use Policy */}
                <Box sx={{ p: 2, mt: 1 }}>
                    <Typography sx={{ color: '#e63935', fontWeight: 700, fontSize: '1rem', mb: 1, display: 'inline' }}>
                        Fair Use Policy:
                    </Typography>
                    <Typography sx={{ color: '#000000', fontSize: '1rem', lineHeight: 1, display: 'inline', ml: 0.5 }}>
                        Unlimited usage is intended for normal personal consultation. Excessive or automated usage will be restricted to ensure fair access for all users. This is applicable across all type of subscriptions and passes.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default Subscription;
