// frontend/src/components/ReferralForm.js

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Typography,
  Box,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import heLocale from 'date-fns/locale/he';
import PatientAutocomplete from './PatientAutocomplete';
import { useAuth } from '../context/AuthContext';

const ReferralForm = ({ open, onClose, onSave, referral = null }) => {
  const { api } = useAuth();
  
  // מצבים
  const [formData, setFormData] = useState({
    full_name: '',
    personal_id: '',
    team: '',
    referral_type: '',
    referral_details: '',
    has_documents: false,
    priority: 'medium',
    status: 'requires_coordination',
    appointment_date: null,
    appointment_path: '',
    appointment_location: '',
    notes: '',
    reference_date: null,
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // אופציות
  const priorityOptions = [
    { value: 'highest', label: 'דחוף ביותר' },
    { value: 'urgent', label: 'דחוף' },
    { value: 'high', label: 'גבוה' },
    { value: 'medium', label: 'בינוני' },
    { value: 'low', label: 'נמוך' },
    { value: 'minimal', label: 'זניח' },
  ];
  
  const statusOptions = [
    { value: 'appointment_scheduled', label: 'נקבע תור' },
    { value: 'requires_coordination', label: 'דרוש תיאום' },
    { value: 'requires_soldier_coordination', label: 'דרוש תיאום עם חייל' },
    { value: 'waiting_for_medical_date', label: 'ממתין לתאריך מגורם רפואי' },
    { value: 'completed', label: 'הושלם' },
    { value: 'cancelled', label: 'בוטל' },
    { value: 'waiting_for_budget_approval', label: 'ממתין לאישור תקציבי' },
    { value: 'waiting_for_doctor_referral', label: 'ממתין להפניה מרופא' },
    { value: 'no_show', label: 'לא הגיע לתור' },
  ];
  
  const referralTypeOptions = [
    { value: 'specialist', label: 'רופא מומחה' },
    { value: 'imaging', label: 'בדיקות דימות' },
    { value: 'lab', label: 'בדיקות מעבדה' },
    { value: 'procedure', label: 'פרוצדורה' },
    { value: 'therapy', label: 'טיפול' },
    { value: 'surgery', label: 'ניתוח' },
    { value: 'consultation', label: 'ייעוץ' },
    { value: 'dental', label: 'טיפול שיניים' },
    { value: 'other', label: 'אחר' },
  ];
  
  const teamOptions = [
    { value: 'חוד', label: 'חוד' },
    { value: 'אתק', label: 'אתק' },
    { value: 'רתק', label: 'רתק' },
    { value: 'מפלג', label: 'מפלג' },
  ];
  
  // אתחול הטופס בעריכה
  useEffect(() => {
    if (referral) {
      const initialData = { ...referral };
      
      // המרת שדות תאריך
      initialData.appointment_date = initialData.appointment_date ? new Date(initialData.appointment_date) : null;
      initialData.reference_date = initialData.reference_date ? new Date(initialData.reference_date) : null;
      
      setFormData(initialData);
    }
  }, [referral]);
  
  // טיפול בשינוי שדות
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // נקה שגיאה כאשר השדה משתנה
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };
  
  // טיפול בשינוי תאריך
  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date,
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };
  
  // עדכון ספציפי של שדה (עבור רכיב ההשלמה האוטומטית)
  const setFieldValue = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // בדיקת תקינות הטופס
  const validateForm = () => {
    const newErrors = {};
    
    // בדיקת שדות חובה
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'שם מלא הוא שדה חובה';
    }
    
    if (!formData.personal_id.trim()) {
      newErrors.personal_id = 'מספר אישי הוא שדה חובה';
    }
    
    if (!formData.team.trim()) {
      newErrors.team = 'צוות הוא שדה חובה';
    }
    
    if (!formData.referral_type) {
      newErrors.referral_type = 'סוג הפניה הוא שדה חובה';
    }
    
    if (!formData.referral_details.trim()) {
      newErrors.referral_details = 'פרטי הפניה הוא שדה חובה';
    }
    
    return newErrors;
  };
  
  // שליחת הטופס
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // בדיקת תקינות
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setSubmitError(null);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving referral:', error);
      setSubmitError('אירעה שגיאה בשמירת ההפניה. אנא נסה שוב.');
      setLoading(false);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      aria-labelledby="referral-form-title"
    >
      <DialogTitle id="referral-form-title">
        {referral ? 'עריכת הפניה' : 'הפניה חדשה'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          
          <Typography variant="h6" gutterBottom>
            פרטי מטופל
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              {/* רכיב ההשלמה האוטומטית לשם מטופל */}
              <PatientAutocomplete
                value={formData.full_name}
                onChange={(value) => setFieldValue('full_name', value)}
                setFieldValue={setFieldValue}
                error={!!errors.full_name}
                helperText={errors.full_name}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="מספר אישי"
                name="personal_id"
                value={formData.personal_id}
                onChange={handleChange}
                error={!!errors.personal_id}
                helperText={errors.personal_id}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="צוות"
                name="team"
                value={formData.team}
                onChange={handleChange}
                error={!!errors.team}
                helperText={errors.team}
                required
              >
                {teamOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={heLocale}>
                <DateTimePicker
                  label="תאריך אסמכתא"
                  value={formData.reference_date}
                  onChange={(date) => handleDateChange('reference_date', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.reference_date,
                      helperText: errors.reference_date,
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
          
          <Typography variant="h6" gutterBottom>
            פרטי ההפניה
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="סוג הפניה"
                name="referral_type"
                value={formData.referral_type}
                onChange={handleChange}
                error={!!errors.referral_type}
                helperText={errors.referral_type}
                required
              >
                {referralTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="הפניה מבוקשת"
                name="referral_details"
                value={formData.referral_details}
                onChange={handleChange}
                error={!!errors.referral_details}
                helperText={errors.referral_details}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="סטטוס"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="עדיפות"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                {priorityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.has_documents}
                    onChange={handleChange}
                    name="has_documents"
                  />
                }
                label="יש אסמכתא"
              />
            </Grid>
          </Grid>
          
          <Typography variant="h6" gutterBottom>
            פרטי התור
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={heLocale}>
                <DateTimePicker
                  label="תאריך התור"
                  value={formData.appointment_date}
                  onChange={(date) => handleDateChange('appointment_date', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.appointment_date,
                      helperText: errors.appointment_date,
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="מיקום התור"
                name="appointment_location"
                value={formData.appointment_location}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="מסלול"
                name="appointment_path"
                value={formData.appointment_path}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          
          <Typography variant="h6" gutterBottom>
            הערות
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="הערות"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            ביטול
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'שומר...' : 'שמור'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ReferralForm;