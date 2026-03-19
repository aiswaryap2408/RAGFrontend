import React from "react";
import { TextField, ToggleButton, Box } from "@mui/material";

const InputField = ({
    icon,
    placeholder,
    value,
    onChange,
    onBlur,
    id,
    type = "text",
    helperText,
    inputProps,
    className,
    name,
    error,
    inputRef,
    ...props
}) => (
    <TextField
        {...props}
        fullWidth
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        inputRef={inputRef}
        variant="outlined"
        InputProps={{
            startAdornment: (
                <Box sx={{ color: "#FF8A3D", mr: 1 }}>{icon}</Box>
            ),
        }}
        inputProps={{
            ...inputProps,
            // Merge classNames so neither the top-level prop nor inputProps.className are lost
            className: [className, inputProps?.className].filter(Boolean).join(' ') || undefined,
        }}
        sx={{
            mb: 1.5,
            "& fieldset": {
                border: "none",
            },
            "& .MuiInputBase-root": {
                height: 52, // Standard height for all fields
                bgcolor: "#fff",
                borderRadius: 1,
            },
            "& .MuiInputBase-input": {
                padding: "12px 14px",
            },
            "& .MuiFormHelperText-root": {
                mx: 0,
            }
        }}
        helperText={helperText}
    />
);

const GenderButton = ({
    children,
    selected,
    error,
    ...props
}) => (
    <ToggleButton
        {...props}
        sx={{
            flex: 1,
            border: error ? "1px solid #d32f2f" : "none",
            borderRadius: 1,
            py: 1.5,
            fontWeight: 500,
            bgcolor: selected ? "#FF8A3D" : (error ? "#ffebee" : "#fff"),
            color: selected ? "#fff" : (error ? "#d32f2f" : "#111"),
            "&.Mui-selected": {
                bgcolor: "#FF8A3D",
                color: "#fff",
            },
            "&.Mui-selected:hover": {
                bgcolor: "#FF7A28",
            },
            "&:hover": {
                bgcolor: selected ? "#FF7A28" : "#FFF0E6",
            },
        }}
    >
        {children}
    </ToggleButton >
);

export { InputField, GenderButton };
