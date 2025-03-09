// frontend/src/services/apiService.js

import axios from 'axios';

// הגדרת כתובת בסיס ל-API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// הוספת האינטרספטור להוספת טוקן אוטומטית
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// שירות API עבור הפעולות השונות במערכת
const apiService = {
  // === טיפול בשגיאות ===
  handleApiError: (error, showNotification) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // שגיאת תשובה מהשרת
      const status = error.response.status;
      
      if (status === 401) {
        // שגיאת אימות - המשתמש לא מחובר או שפג תוקף הטוקן
        localStorage.removeItem('token');
        showNotification('פג תוקף החיבור, יש להתחבר מחדש', 'error');
        // הפניה לדף התחברות במידת הצורך
        // window.location.href = '/login';
      } else if (status === 403) {
        // אין הרשאות מתאימות
        showNotification('אין לך הרשאה לבצע פעולה זו', 'error');
      } else if (status === 400) {
        // שגיאת וולידציה
        const errors = error.response.data;
        let errorMessage = 'שגיאה בנתונים שהוזנו:';
        
        // במידה והשגיאה היא אובייקט עם שדות שגיאה
        if (typeof errors === 'object') {
          Object.entries(errors).forEach(([field, messages]) => {
            errorMessage += `\n- ${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
          });
        } else if (typeof errors === 'string') {
          errorMessage = errors;
        }
        
        showNotification(errorMessage, 'error');
      } else {
        // שגיאות אחרות
        showNotification(`שגיאה בשרת: ${error.response.data.detail || 'נא לנסות שוב מאוחר יותר'}`, 'error');
      }
    } else if (error.request) {
      // לא התקבלה תשובה מהשרת
      showNotification('לא ניתן להתחבר לשרת, אנא בדוק את החיבור לאינטרנט', 'error');
    } else {
      // שגיאה בהגדרת הבקשה
      showNotification(`שגיאה בהגדרת הבקשה: ${error.message}`, 'error');
    }
    
    return Promise.reject(error);
  },

  // === קבלת רשימת צוותים ===
  fetchTeams: async () => {
    try {
      // בהנחה שיש נקודת קצה לקבלת רשימת צוותים
      const response = await axios.get(`${API_BASE_URL}/teams/`);
      return response.data;
    } catch (error) {
      // אם אין נקודת קצה ספציפית, נשתמש ברשימה קבועה
      console.warn('Using hardcoded teams data');
      return ['חוד', 'אתק', 'רתק', 'מפלג'];
    }
  },

  // === אר"ן צוותי - Team Training ===
  
  fetchTeamTrainings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/team/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team trainings:', error);
      throw error;
    }
  },
  
  createTeamTraining: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainings/team/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating team training:', error);
      throw error;
    }
  },
  
  updateTeamTraining: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/trainings/team/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating team training:', error);
      throw error;
    }
  },
  
  deleteTeamTraining: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/trainings/team/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting team training:', error);
      throw error;
    }
  },

  // === חיילים - Soldiers ===
  
  fetchSoldiers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/soldiers/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching soldiers:', error);
      throw error;
    }
  },
  
  // === חסמי עורקים - Tourniquet Training ===
  
  fetchTourniquetTrainings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/tourniquet/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tourniquet trainings:', error);
      throw error;
    }
  },
  
  createTourniquetTraining: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainings/tourniquet/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating tourniquet training:', error);
      throw error;
    }
  },
  
  bulkCreateTourniquetTraining: async (dataArray) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainings/tourniquet/bulk_create/`, dataArray);
      return response.data;
    } catch (error) {
      console.error('Error bulk creating tourniquet trainings:', error);
      throw error;
    }
  },
  
  getUntrainedSoldiers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/soldiers/untrained_this_month/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching untrained soldiers:', error);
      throw error;
    }
  },
  
  getSoldierStats: async (soldierId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/soldiers/${soldierId}/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching soldier stats:', error);
      throw error;
    }
  },
  
  // === חובשים - Medics ===
  
  fetchMedics: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/medics/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medics:', error);
      throw error;
    }
  },
  
  // === תרגולי חובשים - Medic Training ===
  
  fetchMedicTrainings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/medic-training/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medic trainings:', error);
      throw error;
    }
  },
  
  createMedicTraining: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainings/medic-training/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating medic training:', error);
      throw error;
    }
  },
  
  bulkCreateMedicTraining: async (dataArray) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainings/medic-training/bulk_create/`, dataArray);
      return response.data;
    } catch (error) {
      console.error('Error bulk creating medic trainings:', error);
      throw error;
    }
  },
  
  updateMedicTraining: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/trainings/medic-training/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating medic training:', error);
      throw error;
    }
  },
  
  getMedicStats: async (medicId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/medics/${medicId}/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medic stats:', error);
      throw error;
    }
  },
  
  // === סטטיסטיקות - Statistics ===
  
  fetchTrainingStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching training stats:', error);
      throw error;
    }
  }
};

export default apiService;