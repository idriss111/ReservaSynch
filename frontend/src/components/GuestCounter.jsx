import React, { useState } from 'react';
import { Box, Typography, IconButton, Popover, Divider } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export function GuestCounter() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);

    const open = Boolean(anchorEl);
    const handleClick = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

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
                }}
            >
                <PersonIcon sx={{ mr: 1 }} />
                <Typography>
                    {adults} Erwachsen{adults > 1 ? 'e' : ''}, {children} Kind{children !== 1 ? 'er' : ''}
                </Typography>
            </Box>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box sx={{ p: 2, minWidth: 200 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Gäste auswählen
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon sx={{ mr: 1 }} />
                        <Typography sx={{ flexGrow: 1 }}>Erwachsene</Typography>
                        <IconButton size="small" onClick={() => setAdults((a) => Math.max(1, a - 1))}>
                            <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ mx: 1 }}>{adults}</Typography>
                        <IconButton size="small" onClick={() => setAdults((a) => a + 1)}>
                            <AddIcon />
                        </IconButton>
                    </Box>

                    <Divider />

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <ChildCareIcon sx={{ mr: 1 }} />
                        <Typography sx={{ flexGrow: 1 }}>Kinder</Typography>
                        <IconButton size="small" onClick={() => setChildren((c) => Math.max(0, c - 1))}>
                            <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ mx: 1 }}>{children}</Typography>
                        <IconButton size="small" onClick={() => setChildren((c) => c + 1)}>
                            <AddIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Popover>
        </>
    );
}
