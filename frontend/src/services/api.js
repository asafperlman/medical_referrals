// frontend/src/services/apiService.js

import axios from 'axios';

// הגדרת קבוע לבסיס ה-URL של ה-API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// הגדרת instance של axios עם הגדרות ברירת מחדל
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// הוספת interceptor להוספת טוקן האימות בכל בקשה
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// טיפול גלובלי בשגיאות
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // שגיאות מהשרת (קודי תשובה לא תקינים)
      if (error.response.status === 401) {
        // בעיות אימות - לדוגמה, ניתן לנתב לדף התחברות
        console.error('Authentication error');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// שירות API עבור הפרויקט
const apiService = {
  // ===== פונקציות אימות =====
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  },
  localStorage.setItem('access_token', response.data.access),
  localStorage.setItem('refresh_token', response.data.refresh),

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await api.post('/auth/refresh/', {
      refresh: refreshToken
    });
    
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
    }
    return response.data;
  },

  // ===== פונקציות משתמשים =====
  fetchCurrentUser: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },

  // ===== פונקציות צוותים =====
  fetchTeams: async () => {
    try {
      // מניחים שיש נקודת קצה בשרת שמחזירה את כל הצוותים
      const response = await api.get('/trainings/teams/');
      return response.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      
      // במקרה של שגיאה, נחזיר רשימה ברירת מחדל
      return ['חוד', 'אתק', 'רתק', 'מפלג'];
    }
  },

  // ===== פונקציות תרגולי צוות =====
  fetchTeamTrainings: async () => {
    const response = await api.get('/trainings/team/');
    return response.data;
  },

  createTeamTraining: async (data) => {
    const response = await api.post('/trainings/team/', data);
    return response.data;
  },

  updateTeamTraining: async (id, data) => {
    const response = await api.put(`/trainings/team/${id}/`, data);
    return response.data;
  },

  deleteTeamTraining: async (id) => {
    await api.delete(`/trainings/team/${id}/`);
    return true;
  },

  // ===== פונקציות חיילים =====
  fetchSoldiers: async () => {
    const response = await api.get('/trainings/soldiers/');
    return response.data;
  },

  createSoldier: async (data) => {
    const response = await api.post('/trainings/soldiers/', data);
    return response.data;
  },

  updateSoldier: async (id, data) => {
    const response = await api.put(`/trainings/soldiers/${id}/`, data);
    return response.data;
  },

  deleteSoldier: async (id) => {
    await api.delete(`/trainings/soldiers/${id}/`);
    return true;
  },

  // ===== פונקציות תרגולי חסם עורקים =====
  fetchTourniquetTrainings: async () => {
    const response = await api.get('/trainings/tourniquet/');
    return response.data;
  },

  createTourniquetTraining: async (data) => {
    const response = await api.post('/trainings/tourniquet/', data);
    return response.data;
  },

  updateTourniquetTraining: async (id, data) => {
    const response = await api.put(`/trainings/tourniquet/${id}/`, data);
    return response.data;
  },

  deleteTourniquetTraining: async (id) => {
    await api.delete(`/trainings/tourniquet/${id}/`);
    return true;
  },

  bulkCreateTourniquetTraining: async (dataArray) => {
    const response = await api.post('/trainings/tourniquet/bulk_create/', dataArray);
    return response.data;
  },

  getUntrainedSoldiers: async () => {
    const response = await api.get('/trainings/soldiers/untrained_this_month/');
    return response.data;
  },

  getSoldierStats: async (soldierId) => {
    const response = await api.get(`/trainings/soldiers/${soldierId}/stats/`);
    return response.data;
  },

  // ===== פונקציות חובשים =====
  fetchMedics: async () => {
    const response = await api.get('/trainings/medics/');
    return response.data;
  },

  createMedic: async (data) => {
    const response = await api.post('/trainings/medics/', data);
    return response.data;
  },

  updateMedic: async (id, data) => {
    const response = await api.put(`/trainings/medics/${id}/`, data);
    return response.data;
  },

  deleteMedic: async (id) => {
    await api.delete(`/trainings/medics/${id}/`);
    return true;
  },

  // ===== פונקציות תרגולי חובשים =====
  fetchMedicTrainings: async () => {
    const response = await api.get('/trainings/medic-training/');
    return response.data;
  },

  createMedicTraining: async (data) => {
    const response = await api.post('/trainings/medic-training/', data);
    return response.data;
  },

  updateMedicTraining: async (id, data) => {
    const response = await api.put(`/trainings/medic-training/${id}/`, data);
    return response.data;
  },

  deleteMedicTraining: async (id) => {
    await api.delete(`/trainings/medic-training/${id}/`);
    return true;
  },

  bulkCreateMedicTraining: async (dataArray) => {
    const response = await api.post('/trainings/medic-training/bulk_create/', dataArray);
    return response.data;
  },

  // ===== פונקציות ניתוח נתונים =====
  fetchTrainingStats: async () => {
    const response = await api.get('/trainings/stats/');
    return response.data;
  },

  // ===== פונקציית טיפול בשגיאות =====
  handleApiError: (error, showNotification) => {
    console.error('API Error:', error);

    if (error.response) {
      // שגיאה מהשרת
      const statusCode = error.response.status;
      let message = '';

      // בדיקת סוג השגיאה
      if (statusCode === 400) {
        // שגיאות ולידציה
        const errors = error.response.data;
        
        if (typeof errors === 'object' && !Array.isArray(errors)) {
          // מיזוג הודעות שגיאה לטקסט אחד
          message = Object.keys(errors)
            .map(key => {
              const errorMsg = Array.isArray(errors[key]) ? errors[key].join(', ') : errors[key];
              return `${key}: ${errorMsg}`;
            })
            .join('; ');
        } else if (typeof errors === 'string') {
          message = errors;
        } else {
          message = 'בעיה בנתונים שנשלחו. אנא בדוק את הנתונים ונסה שנית.';
        }
      } else if (statusCode === 401) {
        message = 'אינך מחובר או שהחיבור שלך פג תוקף. אנא התחבר מחדש.';
      } else if (statusCode === 403) {
        message = 'אין לך הרשאות לביצוע פעולה זו.';
      } else if (statusCode === 404) {
        message = 'הנתונים המבוקשים לא נמצאו.';
      } else if (statusCode === 500) {
        message = 'שגיאת שרת. אנא נסה שוב מאוחר יותר.';
      } else {
        message = `שגיאה בקוד: ${statusCode}. אנא נסה שוב מאוחר יותר.`;
      }

      if (showNotification) {
        showNotification(message, 'error');
      }
    } else if (error.request) {
      // שגיאת חיבור - הבקשה נשלחה אך לא התקבלה תשובה
      const message = 'לא ניתן להתחבר לשרת. אנא בדוק את החיבור שלך.';
      
      if (showNotification) {
        showNotification(message, 'error');
      }
    } else {
      // שגיאה בהגדרת הבקשה
      const message = 'שגיאה בהגדרת הבקשה: ' + error.message;
      
      if (showNotification) {
        showNotification(message, 'error');
      }
    }
    
    return error;
  }
};

export default apiService;