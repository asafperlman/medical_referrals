// frontend/src/components/PatientAutocomplete.js

import React from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';
import patientsData from '../data/patientsData';

/**
 * רכיב השלמה אוטומטית למטופלים
 * מאפשר חיפוש מטופל לפי שם ומעדכן אוטומטית את הצוות והמספר האישי
 */
const PatientAutocomplete = ({ value, onChange, setFieldValue, error, helperText }) => {
  // מצא את המטופל הנוכחי (אם קיים) מתוך מאגר הנתונים
  const currentPatient = patientsData.find(p => p.full_name === value) || null;

  // טיפול בשינוי בחירת מטופל
  const handlePatientChange = (event, newPatient) => {
    if (newPatient) {
      // עדכן את השם המלא
      onChange(newPatient.full_name);
      
      // עדכן את שדות הצוות והמספר האישי אוטומטית
      setFieldValue('team', newPatient.team);
      setFieldValue('personal_id', newPatient.personal_id);
    } else {
      // נקה את השדה אם לא נבחר מטופל
      onChange('');
    }
  };

  return (
    <Autocomplete
      id="patient-autocomplete"
      options={patientsData}
      getOptionLabel={(option) => {
        // טיפול במקרה שהאופציה היא מחרוזת או אובייקט
        return typeof option === 'string' ? option : option.full_name;
      }}
      value={currentPatient}
      onChange={handlePatientChange}
      isOptionEqualToValue={(option, value) => option.full_name === value.full_name}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box>
            <Typography variant="body1">{option.full_name}</Typography>
            <Typography variant="body2" color="text.secondary">
              צוות: {option.team} | מספר אישי: {option.personal_id}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="שם מלא"
          required
          error={error}
          helperText={helperText}
          placeholder="הקלד שם מטופל לחיפוש..."
        />
      )}
      freeSolo
      autoSelect
    />
  );
};

export default PatientAutocomplete;