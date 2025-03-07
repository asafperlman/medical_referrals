// medical-referrals/frontend/src/components/LoadingScreen.js

import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

const LoadingScreen = ({ message = 'טוען...' }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        bgcolor: theme.palette.background.default,
      }}
    >
      <MedicalServicesIcon
        color="primary"
        sx={{
          fontSize: 64,
          mb: 3,
          animation: 'pulse 1.5s infinite ease-in-out',
          '@keyframes pulse': {
            '0%': {
              opacity: 0.7,
              transform: 'scale(0.95)',
            },
            '50%': {
              opacity: 1,
              transform: 'scale(1.05)',
            },
            '100%': {
              opacity: 0.7,
              transform: 'scale(0.95)',
            },
          },
        }}
      />
      
      <Typography
        variant="h5"
        color="primary"
        sx={{ mb: 2, fontWeight: 'bold' }}
      >
        מערכת ניהול הפניות רפואיות
      </Typography>
      
      <CircularProgress color="primary" size={30} thickness={5} sx={{ mb: 2 }} />
      
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;