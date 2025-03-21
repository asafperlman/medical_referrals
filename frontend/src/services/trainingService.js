// frontend/src/services/trainingService.js

import axios from 'axios';
import { API_BASE_URL, API_PREFIX } from '../config/api-config';

// יצירת instance של axios עם הגדרות בסיס
const api = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// בדיקת קיום הטוקן בתחילת הקובץ
const token = localStorage.getItem('access_token');
if (!token) {
  console.warn('No access token found, please log in first.');
}

// פונקציית דיבוג לטוקן
const debugToken = () => {
  const token = localStorage.getItem('access_token');
  console.log('Token exists:', !!token);
  if (token) {
    console.log('Token preview:', token.substring(0, 20) + '...');
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('Token does not appear to be valid JWT format (needs 3 parts)');
      } else {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Token payload:', payload);
        console.log('Token exp:', new Date(payload.exp * 1000));
      }
    } catch (e) {
      console.error('Error parsing token:', e);
    }
  }
};

// עדכון האינטרספטור להוספת לוגים ובדיקת הטוקן
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      
      if (config.url.includes('/trainings/') || config.url.includes('/teams/') || config.url.includes('/soldiers/')) {
        console.log(`%c[Training API Request] ${config.method?.toUpperCase()} ${config.url}`, 'color: #ff9800; font-weight: bold');
        console.log(`Authorization Header: Bearer ${token.substring(0, 15)}...`);
        console.log(`Full URL: ${config.baseURL}${config.url}`);
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            console.log('Token appears valid (has 3 parts)');
          } else {
            console.warn('WARNING: Token does not look like valid JWT format!');
          }
        } catch (e) {
          console.error('Token parsing error:', e);
        }
      } else {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      }
    } else {
      console.warn(`No token found for request to: ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// טיפול בשגיאות במקום אחד מרכזי
export const handleApiError = (error, showNotification) => {
  if (error.response) {
    const message = error.response.data?.detail || error.response.data?.message || 'שגיאת שרת';
    console.error('Server error:', error.response.status, message);
    if (showNotification) {
      showNotification(`שגיאה: ${message}`, 'error');
    }
  } else if (error.request) {
    console.error('Network error:', error.request);
    if (showNotification) {
      showNotification('שגיאת רשת - לא ניתן להתחבר לשרת', 'error');
    }
  } else {
    console.error('Request error:', error.message);
    if (showNotification) {
      showNotification(`שגיאה: ${error.message}`, 'error');
    }
  }
  return Promise.reject(error);
};

// פונקציה להצגת הנחיות לדיבוג
const logAuthInstructions = () => {
  console.log(`
=== DEBUG INSTRUCTIONS ===
1. Check localStorage token:
   - Open DevTools
   - Go to Application > Storage > Local Storage
   - Check 'access_token' value

2. Test token manually:
   - Copy the token
   - Use Postman or curl:
     curl -H "Authorization: Bearer YOUR_TOKEN" ${API_BASE_URL}${API_PREFIX}/trainings/team/

3. Check Network tab:
   - Look for requests to /api/trainings/
   - Verify 'Authorization' header and response status codes
=========================
  `);
};

// פונקציות API

export const getTeams = async () => {
  try {
    console.log('=== Fetching teams... ===');
    debugToken();
    const token = localStorage.getItem('access_token');
    console.log('Using token (first 15 chars):', token?.substring(0, 15) + '...');
    const response = await api.get('/teams/');
    console.log('Teams response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);
    try {
      console.log('Trying alternate method with direct axios call');
      const directResponse = await axios({
        method: 'get',
        url: `${API_BASE_URL}${API_PREFIX}/teams/`,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Direct axios method worked!', directResponse.data);
      return directResponse.data;
    } catch (directError) {
      console.error('Direct axios method also failed:', directError);
    }
    return ['חוד', 'אתק', 'רתק', 'מפלג'];
  }
};

export const getSoldiers = async () => {
  debugToken();
  try {
    console.log('Fetching soldiers...');
    const response = await api.get('/trainings/soldiers/');
    console.log('Soldiers response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching soldiers:', error);
    logAuthInstructions();
    throw error;
  }
};

export const getTourniquetTrainings = async () => {
  debugToken();
  try {
    console.log('Fetching tourniquet trainings...');
    const response = await api.get('/trainings/tourniquet/');
    console.log('Trainings response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching tourniquet trainings:', error);
    logAuthInstructions();
    throw error;
  }
};

export const createTourniquetTraining = async (data) => {
  debugToken();
  try {
    console.log('Creating tourniquet training:', data);
    const response = await api.post('/trainings/tourniquet/', data);
    console.log('Create response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating tourniquet training:', error);
    logAuthInstructions();
    throw error;
  }
};

export const createBulkTourniquetTrainings = async (data) => {
  debugToken();
  try {
    console.log('Creating bulk tourniquet trainings:', data);
    const response = await api.post('/trainings/tourniquet/bulk_create/', data);
    console.log('Bulk create response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating bulk tourniquet trainings:', error);
    logAuthInstructions();
    throw error;
  }
};

export const debugAuth = async () => {
  const token = localStorage.getItem('access_token');
  console.log('=== AUTH DEBUG ===');
  console.log('Token exists:', !!token);
  if (token) {
    console.log('Token preview:', token.substring(0, 20) + '...');
    try {
      const meResponse = await axios({
        method: 'get',
        url: `${API_BASE_URL}${API_PREFIX}/users/me/`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('/users/me/ works! Status:', meResponse.status);
      console.log('User data:', meResponse.data);
    } catch (error) {
      console.error('/users/me/ failed:', error.response?.status, error.response?.data);
    }
    try {
      const teamsResponse = await axios({
        method: 'get',
        url: `${API_BASE_URL}${API_PREFIX}/teams/`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('/teams/ works! Status:', teamsResponse.status);
    } catch (error) {
      console.error('/teams/ failed:', error.response?.status, error.response?.data);
    }
  }
  console.log('=== END DEBUG ===');
  return { token_exists: !!token };
};

export default {
  getTeams,
  getSoldiers,
  getTourniquetTrainings,
  createTourniquetTraining,
  createBulkTourniquetTrainings,
  handleApiError
};

export { debugToken, debugAuth };
