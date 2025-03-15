// medical-referrals/frontend/src/components/ReferralForm.js

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Typography
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import PatientAutocomplete from './PatientAutocomplete';

// רשימות ערכים לבחירה (העברתי מחוץ לקומפוננטה כדי למנוע יצירה מחדש בכל רנדור)
const referralTypeOptions = [
  { value: 'specialist', label: 'רופא מומחה' },
  { value: 'imaging', label: 'בדיקות דימות' },
  { value: 'lab', label: 'בדיקות מעבדה' },
  { value: 'therapy', label: 'טיפול' },
  { value: 'procedure', label: 'פרוצדורה' },
  { value: 'surgery', label: 'ניתוח' },
  { value: 'consultation', label: 'ייעוץ' },
  { value: 'dental', label: 'טיפול שיניים' },
  { value: 'other', label: 'אחר' },
];

const statusOptions = [
  { value: 'appointment_scheduled', label: 'נקבע תור' },
  { value: 'requires_coordination', label: 'דרוש תיאום' },
  { value: 'requires_soldier_coordination', label: 'דרוש תיאום עם חייל' },
  { value: 'waiting_for_medical_date', label: 'ממתין לתאריך מגורם רפואי' },
  { value: 'completed', label: 'בוצע הושלם' },
  { value: 'cancelled', label: 'בוטל' },
  { value: 'waiting_for_budget_approval', label: 'ממתין לאישור תקציבי' },
  { value: 'waiting_for_doctor_referral', label: 'ממתין להפניה מרופא' },
  { value: 'no_show', label: 'לא הגיע לתור' },
];

const priorityOptions = [
  { value: 'highest', label: 'דחוף ביותר' },
  { value: 'urgent', label: 'דחוף' },
  { value: 'high', label: 'גבוה' },
  { value: 'medium', label: 'בינוני' },
  { value: 'low', label: 'נמוך' },
  { value: 'minimal', label: 'זניח' },
];

const teamOptions = [
  { value: 'חוד', label: 'חוד' },
  { value: 'אתק', label: 'אתק' },
  { value: 'רתק', label: 'רתק' },
  { value: 'מפלג', label: 'מפלג' },
];

const ReferralForm = ({ open, onClose, onSave, referral }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  
  // הגדרת state עבור כל שדה בטופס
  const [formValues, setFormValues] = useState({
    full_name: '',
    personal_id: '',
    team: '',
    referral_type: '',
    referral_details: '',
    status: 'requires_coordination',
    priority: 'medium',
    has_documents: false,
    appointment_date: null,
    appointment_location: '',
    appointment_path: '',
    notes: '',
  });
  
  // הגדרת state לשגיאות טופס
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  // אתחול הטופס כשהוא נפתח
  useEffect(() => {
    if (referral) {
      // אם זה עריכה, נאתחל עם ערכי ההפניה הקיימת
      setFormValues({
        full_name: referral.full_name || '',
        personal_id: referral.personal_id || '',
        team: referral.team || '',
        referral_type: referral.referral_type || '',
        referral_details: referral.referral_details || '',
        status: referral.status || 'requires_coordination',
        priority: referral.priority || 'medium',
        has_documents: referral.has_documents || false,
        appointment_date: referral.appointment_date ? new Date(referral.appointment_date) : null,
        appointment_location: referral.appointment_location || '',
        appointment_path: referral.appointment_path || '',
        notes: referral.notes || '',
      });
    } else {
      // איפוס הטופס אם זה הפניה חדשה
      setFormValues({
        full_name: '',
        personal_id: '',
        team: '',
        referral_type: '',
        referral_details: '',
        status: 'requires_coordination',
        priority: 'medium',
        has_documents: false,
        appointment_date: null,
        appointment_location: '',
        appointment_path: '',
        notes: '',
      });
    }
    // איפוס שגיאות ו-touched
    setFormErrors({});
    setTouched({});
  }, [referral, open]);

  // פונקציה לטיפול בשינויים בשדות
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // סימון השדה כ-touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // וולידציה בסיסית
    validateField(name, type === 'checkbox' ? checked : value);
  };
  
  // פונקציה לטיפול בשינויים בשדה תאריך
  const handleDateChange = (date) => {
    setFormValues(prev => ({
      ...prev,
      appointment_date: date
    }));
  };
  
  // פונקציה לטיפול בשינויים בשדה שם מטופל - מתאים לרכיב PatientAutocomplete
  const handlePatientChange = (value) => {
    setFormValues(prev => ({
      ...prev,
      full_name: value
    }));
    
    setTouched(prev => ({
      ...prev,
      full_name: true
    }));
    
    validateField('full_name', value);
  };
  
  // פונקציה לעדכון שדה בטופס - משמשת את PatientAutocomplete
  const setFieldValue = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    validateField(field, value);
  };
  
  // וולידציה בסיסית לשדה בודד
  const validateField = (name, value) => {
    const newErrors = { ...formErrors };
    
    // שדות חובה
    const requiredFields = ['full_name', 'personal_id', 'team', 'referral_type', 'referral_details', 'status', 'priority'];
    if (requiredFields.includes(name) && (!value || value === '')) {
      newErrors[name] = 'שדה חובה';
    } else {
      delete newErrors[name];
    }
    
    setFormErrors(newErrors);
  };
  
  // וולידציה לכל הטופס
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['full_name', 'personal_id', 'team', 'referral_type', 'referral_details', 'status', 'priority'];
    
    // בדיקת שדות חובה
    requiredFields.forEach(field => {
      if (!formValues[field] || formValues[field] === '') {
        newErrors[field] = 'שדה חובה';
      }
    });
    
    setFormErrors(newErrors);
    
    // מחזיר האם הטופס תקין
    return Object.keys(newErrors).length === 0;
  };

  // טיפול בשליחת הטופס
  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      // סימון כל השדות כ-touched כדי להציג את כל השגיאות
      const allTouched = {};
      Object.keys(formValues).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      
      setToast({
        open: true,
        message: 'יש לתקן את השגיאות בטופס',
        severity: 'error'
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // הכנת הנתונים לשליחה, וידוא פורמט תאריכים נכון
      const submissionValues = {
        ...formValues,
        appointment_date: formValues.appointment_date ? new Date(formValues.appointment_date).toISOString() : null,
      };
      
      console.log("Submitting form with values:", submissionValues);
      
      // שליחת הנתונים לשרת
      await onSave(submissionValues);
      
      setToast({ 
        open: true, 
        message: referral ? 'ההפניה עודכנה בהצלחה' : 'ההפניה נוצרה בהצלחה', 
        severity: 'success' 
      });
      
      // סגירת החלון רק אם השמירה הצליחה
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error saving referral:", err);
      setError(err.message || 'אירעה שגיאה בשמירת ההפניה');
      
      // טיפול בשגיאות מהשרת
      if (err.response && err.response.data) {
        const serverErrors = err.response.data;
        
        // עדכון שגיאות הטופס מהשרת
        const newErrors = { ...formErrors };
        Object.keys(serverErrors).forEach(key => {
          const errorMessage = Array.isArray(serverErrors[key]) ? 
            serverErrors[key][0] : serverErrors[key];
          newErrors[key] = errorMessage;
        });
        
        setFormErrors(newErrors);
      }
      
      setToast({ 
        open: true, 
        message: 'אירעה שגיאה בשמירת ההפניה', 
        severity: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // סגירת הודעת טוסט
  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        aria-labelledby="referral-form-title"
      >
        <DialogTitle id="referral-form-title">
          {referral ? 'עריכת הפניה רפואית' : 'הוספת הפניה רפואית חדשה'}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form id="referral-form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* פרטי מטופל */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  פרטי מטופל
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                {/* רכיב השלמה אוטומטית למטופל */}
                <PatientAutocomplete
                  value={formValues.full_name}
                  onChange={handlePatientChange}
                  setFieldValue={setFieldValue}
                  error={touched.full_name && Boolean(formErrors.full_name)}
                  helperText={touched.full_name && formErrors.full_name}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  id="personal_id"
                  name="personal_id"
                  label="מספר אישי"
                  value={formValues.personal_id}
                  onChange={handleChange}
                  error={touched.personal_id && Boolean(formErrors.personal_id)}
                  helperText={touched.personal_id && formErrors.personal_id}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth required error={touched.team && Boolean(formErrors.team)}>
                  <InputLabel id="team-label">צוות</InputLabel>
                  <Select
                    labelId="team-label"
                    id="team"
                    name="team"
                    value={formValues.team}
                    onChange={handleChange}
                    label="צוות"
                  >
                    {teamOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.team && formErrors.team && (
                    <FormHelperText>{formErrors.team}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              {/* פרטי הפניה */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  פרטי הפניה
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={touched.referral_type && Boolean(formErrors.referral_type)}>
                  <InputLabel id="referral-type-label">סוג הפניה</InputLabel>
                  <Select
                    labelId="referral-type-label"
                    id="referral_type"
                    name="referral_type"
                    value={formValues.referral_type}
                    onChange={handleChange}
                    label="סוג הפניה"
                  >
                    {referralTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.referral_type && formErrors.referral_type && (
                    <FormHelperText>{formErrors.referral_type}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="referral_details"
                  name="referral_details"
                  label="הפניה מבוקשת"
                  value={formValues.referral_details}
                  onChange={handleChange}
                  error={touched.referral_details && Boolean(formErrors.referral_details)}
                  helperText={touched.referral_details && formErrors.referral_details}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={touched.status && Boolean(formErrors.status)}>
                  <InputLabel id="status-label">סטטוס</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formValues.status}
                    onChange={handleChange}
                    label="סטטוס"
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.status && formErrors.status && (
                    <FormHelperText>{formErrors.status}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={touched.priority && Boolean(formErrors.priority)}>
                  <InputLabel id="priority-label">עדיפות</InputLabel>
                  <Select
                    labelId="priority-label"
                    id="priority"
                    name="priority"
                    value={formValues.priority}
                    onChange={handleChange}
                    label="עדיפות"
                  >
                    {priorityOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.priority && formErrors.priority && (
                    <FormHelperText>{formErrors.priority}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formValues.has_documents}
                      onChange={(e) => {
                        setFormValues(prev => ({
                          ...prev,
                          has_documents: e.target.checked
                        }));
                      }}
                      name="has_documents"
                      color="primary"
                    />
                  }
                  label="יש אסמכתא"
                />
              </Grid>
              
              {/* פרטי תור */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  פרטי התור
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
                  <DateTimePicker
                    label="תאריך ושעת התור"
                    value={formValues.appointment_date}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="appointment_location"
                  name="appointment_location"
                  label="מיקום התור"
                  value={formValues.appointment_location}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="הערות"
                  multiline
                  rows={4}
                  value={formValues.notes}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            ביטול
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'שומר...' : (referral ? 'עדכן' : 'הוסף')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Toast הודעות */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ReferralForm;
