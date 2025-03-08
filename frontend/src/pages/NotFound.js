// medical-referrals/frontend/src/pages/NotFound.js

import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
  const navigate = useNavigate();
  
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          p: 5,
          textAlign: 'center',
          maxWidth: 500,
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          color="primary"
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          404
        </Typography>
        
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
        >
          הדף לא נמצא
        </Typography>
        
        <Typography
          variant="body1"
          color="text.secondary"
          paragraph
          sx={{ mb: 4 }}
        >
          הדף שחיפשת אינו קיים או שאין לך גישה אליו.
          אנא חזור לדף הבית או נסה לחפש דף אחר.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
        >
          חזרה לדף הבית
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;