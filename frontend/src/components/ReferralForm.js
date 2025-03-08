// medical-referrals/frontend/src/components/ReferralForm.js

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControl, InputLabel, Select, MenuItem, FormHelperText, Switch, FormControlLabel, Typography, Divider, CircularProgress, Alert } from '@mui/material';

import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { he } from 'date-fns/locale';

const ReferralForm = ({ open, onClose, onSave, referral = null }) => {
  const isEditMode = Boolean(referral);
  
  // מצב הטופס
  const [formData, setFormData] = useState({
    full_name: '',
    personal_id: '',
    team: '',
    referral_type: '',
    referral_details: '',
    has_documents: false,
    priority: 'medium',
    status: 'new',
    appointment_date: null,
    appointment_path: '',
    appointment_location: '',
    notes: '',
  });
  
  // מצב שגיאות ולידציה
  const [errors, setErrors] = useState({});
  
  // מצב טעינה
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // אתחול הטופס במצב עריכה
  useEffect(() => {
    if (referral) {
      const formattedReferral = {
        ...referral,
        appointment_date: referral.appointment_date ? new Date(referral.appointment_date) : null,
      };
      setFormData(formattedReferral);
    }
  }, [referral]);
  
  // טיפול בשינויים בשדות הטופס
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
    
    // נקה שגיאה בשדה שהשתנה
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // טיפול בשינוי תאריך התור
  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      appointment_date: date
    }));
    
    // נקה שגיאה בשדה התאריך
    if (errors.appointment_date) {
      setErrors(prev => ({
        ...prev,
        appointment_date: null
      }));
    }
  };
  
  // בדיקת תקינות הטופס
  const validateForm = () => {
    const newErrors = {};
    
    // שדות חובה
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'נא להזין שם מלא';
    }
    
    if (!formData.personal_id.trim()) {
      newErrors.personal_id = 'נא להזין מספר אישי';
    }
    
    if (!formData.team.trim()) {
      newErrors.team = 'נא להזין צוות';
    }
    
    if (!formData.referral_type) {
      newErrors.referral_type = 'נא לבחור סוג הפניה';
    }
    
    if (!formData.referral_details.trim()) {
      newErrors.referral_details = 'נא להזין פרטי הפניה';
    }
    
    // אם נקבע תור, חובה להזין מיקום
    if (formData.appointment_date && !formData.appointment_location.trim()) {
      newErrors.appointment_location = 'נא להזין מיקום התור';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // שליחת הטופס
  const handleSubmit = async () => {
    // בדיקת תקינות
    if (!validateForm()) return;
    
    setLoading(true);
    setSubmitError(null);
    
    try {
      // הכנת המידע לשמירה
      const dataToSave = {
        ...formData,
        // המרת תאריך לפורמט ISO string אם הוא קיים
        appointment_date: formData.appointment_date ? formData.appointment_date.toISOString() : null
      };
      
      // שמירת הנתונים דרך ה-callback
      await onSave(dataToSave);
      onClose(); // סגירת הדיאלוג
    } catch (error) {
      console.error('Error saving referral:', error);
      
      // טיפול בשגיאות מהשרת
      if (error.response && error.response.data) {
        // בודק אם יש שגיאת non_field_errors (שגיאת ולידציה כללית)
        if (error.response.data.non_field_errors) {
          setSubmitError(error.response.data.non_field_errors[0] || 'אירעה שגיאה בשמירת ההפניה');
        }
        // אם יש שגיאות בשדות ספציפיים
        else if (typeof error.response.data === 'object') {
          setErrors(error.response.data);
        } else {
          // שגיאה כללית
          setSubmitError(error.response.data.detail || 'אירעה שגיאה בשמירת ההפניה');
        }
      } else {
        setSubmitError('אירעה שגיאה בשמירת ההפניה');
      }
      
      setLoading(false);
    }
  };
  
  
  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {isEditMode ? 'עריכת הפניה' : 'הוספת הפניה חדשה'}
      </DialogTitle>
      
      <DialogContent dividers>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              פרטי מטופל
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="full_name"
              label="שם מלא"
              value={formData.full_name}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.full_name}
              helperText={errors.full_name}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="personal_id"
              label="מספר אישי"
              value={formData.personal_id}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.personal_id}
              helperText={errors.personal_id}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="team"
              label="צוות"
              value={formData.team}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.team}
              helperText={errors.team}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              פרטי ההפניה
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.referral_type} disabled={loading}>
              <InputLabel>סוג הפניה</InputLabel>
              <Select
                name="referral_type"
                value={formData.referral_type}
                onChange={handleChange}
                label="סוג הפניה"
              >
                <MenuItem value="specialist">רופא מומחה</MenuItem>
                <MenuItem value="imaging">בדיקות דימות</MenuItem>
                <MenuItem value="lab">בדיקות מעבדה</MenuItem>
                <MenuItem value="procedure">פרוצדורה</MenuItem>
                <MenuItem value="other">אחר</MenuItem>
              </Select>
              {errors.referral_type && <FormHelperText>{errors.referral_type}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="referral_details"
              label="הפניה מבוקשת"
              value={formData.referral_details}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.referral_details}
              helperText={errors.referral_details}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.priority} disabled={loading}>
              <InputLabel>עדיפות</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                label="עדיפות"
              >
                <MenuItem value="low">נמוכה</MenuItem>
                <MenuItem value="medium">בינונית</MenuItem>
                <MenuItem value="high">גבוהה</MenuItem>
                <MenuItem value="urgent">דחופה</MenuItem>
              </Select>
              {errors.priority && <FormHelperText>{errors.priority}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.status} disabled={loading}>
              <InputLabel>סטטוס</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="סטטוס"
              >
                <MenuItem value="appointment_scheduled">נקבע תור</MenuItem>
                <MenuItem value="requires_coordination">דרוש תיאום</MenuItem>
                <MenuItem value="completed">בוצע הושלם</MenuItem>
                <MenuItem value="waiting_for_budget_approval">ממתין לאישור תקציבי</MenuItem>
                <MenuItem value="waiting_for_doctor_referral">ממתין להפניה מרופא</MenuItem>
              </Select>
              {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  name="has_documents"
                  checked={formData.has_documents}
                  onChange={handleChange}
                  disabled={loading}
                />
              }
              label="יש אסמכתאות / מסמכים"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              פרטי התור
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
              <DateTimePicker
                label="תאריך ושעת התור"
                value={formData.appointment_date}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.appointment_date}
                    helperText={errors.appointment_date}
                    disabled={loading}
                  />
                )}
                disabled={loading}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="appointment_path"
              label="מסלול"
              value={formData.appointment_path}
              onChange={handleChange}
              fullWidth
              error={!!errors.appointment_path}
              helperText={errors.appointment_path}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="appointment_location"
              label="מיקום התור"
              value={formData.appointment_location}
              onChange={handleChange}
              fullWidth
              error={!!errors.appointment_location}
              helperText={errors.appointment_location}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              הערות
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="notes"
              label="הערות"
              value={formData.notes}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              error={!!errors.notes}
              helperText={errors.notes}
              disabled={loading}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          ביטול
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'שומר...' : isEditMode ? 'עדכן' : 'שמור'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReferralForm;