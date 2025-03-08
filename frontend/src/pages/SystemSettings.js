// medical-referrals/frontend/src/pages/SystemSettings.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const SystemSettings = () => {
  const { api } = useAuth();
  const theme = useTheme();
  
  // מצבים
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  
  // מצב טופס
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
  });
  
  // טעינת הגדרות מערכת
  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/settings/');
      setSettings(response.data.results);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('אירעה שגיאה בטעינת הגדרות המערכת');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  // טיפול בהוספת הגדרה
  const handleAddSetting = () => {
    setSelectedSetting(null);
    setFormData({
      key: '',
      value: '',
      description: '',
    });
    setEditDialogOpen(true);
  };
  
  // טיפול בעריכת הגדרה
  const handleEditSetting = (setting) => {
    setSelectedSetting(setting);
    setFormData({
      key: setting.key,
      value: JSON.stringify(setting.value, null, 2),
      description: setting.description || '',
    });
    setEditDialogOpen(true);
  };
  
  // טיפול במחיקת הגדרה
  const handleDeleteClick = (setting) => {
    setSelectedSetting(setting);
    setDeleteDialogOpen(true);
  };
  
  // שינוי ערכי הטופס
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // שמירת הגדרה
  const handleSaveSetting = async () => {
    try {
      setLoading(true);
      
      // ולידציית הערך כ-JSON תקין
      let parsedValue;
      try {
        parsedValue = JSON.parse(formData.value);
      } catch (err) {
        setError('ערך לא תקין. יש להזין JSON תקין');
        setLoading(false);
        return;
      }
      
      const dataToSave = {
        key: formData.key,
        value: parsedValue,
        description: formData.description,
      };
      
      if (selectedSetting) {
        // עדכון הגדרה קיימת
        await api.put(`/settings/${selectedSetting.id}/`, dataToSave);
      } else {
        // יצירת הגדרה חדשה
        await api.post('/settings/', dataToSave);
      }
      
      setEditDialogOpen(false);
      fetchSettings();
    } catch (err) {
      console.error('Error saving setting:', err);
      setError('אירעה שגיאה בשמירת ההגדרה');
      setLoading(false);
    }
  };
  
  // מחיקת הגדרה
  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/settings/${selectedSetting.id}/`);
      setDeleteDialogOpen(false);
      fetchSettings();
    } catch (err) {
      console.error('Error deleting setting:', err);
      setError('אירעה שגיאה במחיקת ההגדרה');
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // חילוץ סוג הערך להצגה
  const getValueType = (value) => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };
  
  // פונקציה להצגת ערך מותאמת לפי סוג
  const renderValue = (value) => {
    const valueType = getValueType(value);
    
    switch (valueType) {
      case 'string':
        return `"${value}"`;
      case 'object':
        return JSON.stringify(value, null, 2);
      case 'array':
        return JSON.stringify(value, null, 2);
      default:
        return String(value);
    }
  };
  
  // מיון הגדרות לפי מפתח
  const sortedSettings = [...settings].sort((a, b) => a.key.localeCompare(b.key));
  
  if (loading && settings.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          הגדרות מערכת
        </Typography>
        <Box>
          <Tooltip title="רענן">
            <IconButton onClick={fetchSettings} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddSetting}
          >
            הגדרה חדשה
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Box display="flex" alignItems="flex-start">
          <InfoIcon sx={{ mr: 1, mt: 0.5 }} />
          <Box>
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              הנחיות להגדרות מערכת:
            </Typography>
            <Typography variant="body2" paragraph>
              1. ערכי ההגדרות חייבים להיות בפורמט JSON תקין (מספרים, מחרוזות, מערכים או אובייקטים).
            </Typography>
            <Typography variant="body2" paragraph>
              2. מפתחות ההגדרות צריכים להיות ייחודיים במערכת.
            </Typography>
            <Typography variant="body2">
              3. שינויי הגדרות עשויים להשפיע על פעילות המערכת. יש לפעול בזהירות.
            </Typography>
          </Box>
        </Box>
      </Alert>
      
      <Grid container spacing={3}>
        {sortedSettings.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <SettingsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                אין הגדרות מערכת
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                כדי להתחיל, לחץ על כפתור "הגדרה חדשה" כדי להוסיף את ההגדרה הראשונה.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddSetting}
                sx={{ mt: 2 }}
              >
                הגדרה חדשה
              </Button>
            </Paper>
          </Grid>
        ) : (
          sortedSettings.map((setting) => (
            <Grid item xs={12} md={6} lg={4} key={setting.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[6],
                  }
                }}
              >
                <CardHeader
                  title={setting.key}
                  titleTypographyProps={{ variant: 'h6', noWrap: true }}
                  action={
                    <Box>
                      <Tooltip title="ערוך">
                        <IconButton onClick={() => handleEditSetting(setting)} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="מחק">
                        <IconButton onClick={() => handleDeleteClick(setting)} size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
                <CardContent>
                  {setting.description && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {setting.description}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    סוג ערך: {getValueType(setting.value)}
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      mt: 1,
                      p: 1,
                      maxHeight: 120,
                      overflow: 'auto',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      component="pre" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        margin: 0,
                        fontFamily: 'monospace'
                      }}
                    >
                      {renderValue(setting.value)}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      
      {/* דיאלוג הוספה/עריכת הגדרה */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedSetting ? 'עריכת הגדרה' : 'הוספת הגדרה חדשה'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="key"
                label="מפתח"
                fullWidth
                required
                value={formData.key}
                onChange={handleFormChange}
                disabled={!!selectedSetting} // לא ניתן לשנות מפתח בעריכה
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="description"
                label="תיאור"
                fullWidth
                value={formData.description}
                onChange={handleFormChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="value"
                label="ערך (JSON)"
                fullWidth
                required
                value={formData.value}
                onChange={handleFormChange}
                multiline
                rows={8}
                InputProps={{
                  sx: { fontFamily: 'monospace' },
                }}
                helperText="יש להזין ערך בפורמט JSON תקין"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            ביטול
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveSetting}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {loading ? 'שומר...' : 'שמור'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* דיאלוג מחיקת הגדרה */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>מחיקת הגדרה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את ההגדרה <b>{selectedSetting?.key}</b>?
            פעולה זו אינה ניתנת לביטול.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            ביטול
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemSettings;