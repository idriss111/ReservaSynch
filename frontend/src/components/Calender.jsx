// Calendar.jsx
import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { TextField } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import enLocale from 'date-fns/locale/en-US';

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-root': {
        borderRadius: theme.shape.borderRadius * 2,
        backgroundColor: theme.palette.grey[100],
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.dark,
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.secondary.main,
        borderWidth: 2,
    },
}));

export default function Calendar() {
    const [value, setValue] = useState(new Date());
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enLocale}>
            <DatePicker
                label="Select date"
                value={value}
                onChange={(newValue) => setValue(newValue)}
                renderInput={(params) => <StyledTextField {...params} />}
            />
        </LocalizationProvider>
    );
}
