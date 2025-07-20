import React, { useState } from 'react';
import {
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    Popover,
    IconButton,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const extrasList = [
    { key: 'breakfast', label: 'Frühstück' },
    { key: 'parking', label: 'Parkplatz' },
    { key: 'cleaning', label: 'Reinigung' },
];

export function ExtrasSelector() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selected, setSelected] = useState({});

    const open = Boolean(anchorEl);
    const handleClick = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const toggle = (key) => {
        setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const count = Object.values(selected).filter(Boolean).length;

    return (
        <>
            <Box
                onClick={handleClick}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    cursor: 'pointer',
                    mt: 2,
                }}
            >
                <AddShoppingCartIcon sx={{ mr: 1 }} />
                <Typography>{count > 0 ? `${count} Extra${count > 1 ? 's' : ''}` : 'Extras'}</Typography>
            </Box>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box sx={{ p: 2, minWidth: 200 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Extras auswählen
                    </Typography>
                    {extrasList.map((ex) => (
                        <FormControlLabel
                            key={ex.key}
                            control={
                                <Checkbox
                                    checked={!!selected[ex.key]}
                                    onChange={() => toggle(ex.key)}
                                />
                            }
                            label={ex.label}
                        />
                    ))}
                </Box>
            </Popover>
        </>
    );
}