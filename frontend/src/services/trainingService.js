// קובץ: frontend/src/services/trainingService.js

import axios from 'axios';
import { API_BASE_URL, API_PREFIX } from '../config/api-config';

// הגדרת כתובת הבסיס של ה-API באמצעות TRAINING_URL
const TRAINING_URL = `${API_PREFIX}/trainings`;

// פונקציה לטיפול בשגיאות API עם הודעות בעברית
export const handleApiError = (error, showNotification) => {
  console.error('API Error:', error);

  if (error.response) {
    // שגיאה שהתקבלה מהשרת
    console.error('Response status:', error.response.status);
    console.error('Response data:', error.response.data);

    const statusCode = error.response.status;
    let message = '';

    if (statusCode === 401) {
      message = 'פג תוקף החיבור למערכת. יש להתחבר מחדש.';
    } else if (statusCode === 403) {
      message = 'אין הרשאה לבצע פעולה זו';
    } else if (statusCode === 404) {
      message = 'הנתונים המבוקשים לא נמצאו';
    } else if (statusCode === 400) {
      message = 'הבקשה לא תקינה';
    } else if (statusCode >= 500) {
      message = 'שגיאת שרת. נסה שוב מאוחר יותר';
    } else {
      message = `שגיאה (${statusCode}). אנא נסה שוב מאוחר יותר.`;
    }

    if (showNotification) {
      showNotification(message, 'error');
    }
  } else if (error.request) {
    // לא התקבלה תגובה מהשרת
    console.error('Network error - no response received');
    if (showNotification) {
      showNotification('אין תקשורת עם השרת. משתמש בנתוני דמה.', 'warning');
    }
  } else {
    // שגיאה בהגדרת הבקשה עצמה
    console.error('Request setup error:', error.message);
    if (showNotification) {
      showNotification(`שגיאה: ${error.message}`, 'error');
    }
  }

  return error;
};

// יצירת מופע axios עם הגדרות בסיסיות
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// הוספת interceptor לטיפול בטוקן אימות
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); // שימוש במפתח 'access_token'
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Request config:', config.url, config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

// פונקציה להבאת נתונים עם גיבוי לנתוני דמה במקרה של שגיאה
const getSafeData = async (endpoint, mockDataKey) => {
  console.log(`Fetching data from: ${endpoint}`);

  try {
    const response = await api.get(endpoint);
    console.log(`API Response for ${endpoint} (status ${response.status}):`, response.data);
    return response.data;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }

    console.warn(`Falling back to mock data for ${mockDataKey}`);
    // יש לוודא שמשתנה mockData מוגדר במידה ומדובר בנתוני דמה
    return mockData[mockDataKey];
  }
};

// פונקציות API לצוותים ונתונים אחרים – עדכון לכל הפונקציות כך שישתמשו ב-TRAINING_URL

// דוגמה: הפונקציה להבאת רשימת צוותים
export const getTeams = async () => {
  return await getSafeData(`${TRAINING_URL}/teams/`, 'teams');
};

// דוגמה: הפונקציה להבאת אימונים של צוות מסוים
export const getTeamTrainings = async () => {
  return await getSafeData(`${TRAINING_URL}/team/`, 'teamTrainings');
};

// ניתן להוסיף כאן פונקציות נוספות בהתאם לצורך, לדוגמה:
// export const createTeamTraining = async (trainingData) => {
//   try {
//     const response = await api.post(`${TRAINING_URL}/team/`, trainingData);
//     return response.data;
//   } catch (error) {
//     handleApiError(error, null);
//     throw error;
//   }
// };
