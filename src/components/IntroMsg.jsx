import React from "react";
import { Box, Typography, Button } from "@mui/material";

const DEFAULT_DESCRIPTION = `Press "Consult now" button below to start your astrologer consultation any time. I’ll connect you to our astrologer.`;
const DEFAULT_FOOTER = "You may call him as ‘Guruji’";
const DEFAULT_AVATAR = "/svg/guruji_illustrated.svg";

const IntroMsg = ({
    name = "Varun",
    title,
    description,
    footerText,
    ConsultSrc,
    paybutton,

    wrapperSx,
    cardSx,
    titleSx,
    descriptionSx,
    footerSx,
    imgSx,
    payButtonSx,
}) => {
    const finalTitle = title !== undefined ? title : `${name}, welcome!`;
    const finalDescription =
        description !== undefined ? description : DEFAULT_DESCRIPTION;
    const finalFooter = footerText !== undefined ? footerText : DEFAULT_FOOTER;
    const finalImg = ConsultSrc !== undefined ? ConsultSrc : DEFAULT_AVATAR;

    return (
        <Box sx={{ px: 0, pb: 1, pt: 4, width: "100%", ...wrapperSx }}>
            <Box
                sx={{
                    position: "relative",
                    border: "2px solid #F36A2F",
                    borderRadius: 2,
                    p: 2,
                    bgcolor: "#fcebd3",
                    ...cardSx,
                }}
            >
                {/* Mayas IMG */}
                {finalImg && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: -38,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            border: "5px solid #F36A2F",
                            bgcolor: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            ...imgSx,
                        }}
                    >
                        <Box
                            component="img"
                            src={finalImg}
                            alt="Guruji"
                            sx={{ width: 50 }}
                        />
                    </Box>
                )}

                {/* Title */}
                {finalTitle && (
                    <Typography sx={{ mb: 2, ...titleSx }}>
                        {finalTitle}
                    </Typography>
                )}

                {/* Description */}
                {finalDescription && (
                    <Typography sx={{ mb: 2, ...descriptionSx }}>
                        {finalDescription}
                    </Typography>
                )}

                {/* Footer */}
                {finalFooter && (
                    <Typography sx={{ ...footerSx }}>
                        {finalFooter}
                    </Typography>
                )}
            </Box>
            {paybutton && (
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: "#54a170",
                        color: "#fff",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: 50,
                        cursor: "pointer",
                        float: "right",
                        position: "relative",
                        top: -20,
                        right: 20,
                        textTransform: "none",
                        width: "150px",
                        fontSize: 16,
                        mb: 2,
                        ...payButtonSx,
                    }}
                >
                    {paybutton}
                </Button>
            )}
        </Box>
    );
};

export default IntroMsg;
