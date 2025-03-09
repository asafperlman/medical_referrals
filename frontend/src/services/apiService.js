// services/apiService.js
import axios from 'axios';

// קונפיגורציית API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// פונקציה להוספת headers הכוללים את טוקן האימות
const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // או כל מקום אחר שבו שומרים את הטוקן
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  };
};

// שירות API
const apiService = {
  // ===== Team Training API =====
  fetchTeams: async () => {
    try {
      // הערה: במידה ואין נקודת קצה ספציפית לצוותים, ניתן לחלץ אותם מנתוני הפניות
      // או ליצור קובץ נתונים סטטי זמני
      const response = await axios.get(`${API_BASE_URL}/teams/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },
  
  fetchTeamTrainings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/team/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching team trainings:', error);
      throw error;
    }
  },
  
  createTeamTraining: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainings/team/`, data, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error creating team training:', error);
      throw error;
    }
  },
  
  updateTeamTraining: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/trainings/team/${id}/`, data, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error updating team training:', error);
      throw error;
    }
  },
  
  deleteTeamTraining: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/trainings/team/${id}/`, getAuthHeaders());
      return true;
    } catch (error) {
      console.error('Error deleting team training:', error);
      throw error;
    }
  },
  
  // ===== Tourniquet Training API =====
  fetchSoldiers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/soldiers/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching soldiers:', error);
      throw error;
    }
  },
  
  fetchTourniquetTrainings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/tourniquet/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching tourniquet trainings:', error);
      throw error;
    }
  },
  
  createTourniquetTraining: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainings/tourniquet/`, data, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error creating tourniquet training:', error);
      throw error;
    }
  },
  
  updateTourniquetTraining: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/trainings/tourniquet/${id}/`, data, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error updating tourniquet training:', error);
      throw error;
    }
  },
  
  deleteTourniquetTraining: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/trainings/tourniquet/${id}/`, getAuthHeaders());
      return true;
    } catch (error) {
      console.error('Error deleting tourniquet training:', error);
      throw error;
    }
  },
  
  bulkCreateTourniquetTraining: async (dataArray) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainings/tourniquet/bulk_create/`, dataArray, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error creating bulk tourniquet trainings:', error);
      throw error;
    }
  },
  
  getSoldierStats: async (soldierId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/soldiers/${soldierId}/stats/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching soldier stats:', error);
      throw error;
    }
  },
  
  getUntrainedSoldiers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/soldiers/untrained_this_month/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching untrained soldiers:', error);
      throw error;
    }
  },
  
  // ===== Medics Training API =====
  fetchMedics: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/medics/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching medics:', error);
      throw error;
    }
  },
  
  fetchMedicTrainings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/medic-training/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching medic trainings:', error);
      throw error;
    }
  },
  
  createMedicTraining: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainings/medic-training/`, data, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error creating medic training:', error);
      throw error;
    }
  },
  
  updateMedicTraining: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/trainings/medic-training/${id}/`, data, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error updating medic training:', error);
      throw error;
    }
  },
  
  deleteMedicTraining: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/trainings/medic-training/${id}/`, getAuthHeaders());
      return true;
    } catch (error) {
      console.error('Error deleting medic training:', error);
      throw error;
    }
  },
  
  bulkCreateMedicTraining: async (dataArray) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainings/medic-training/bulk_create/`, dataArray, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error creating bulk medic trainings:', error);
      throw error;
    }
  },
  
  getMedicStats: async (medicId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/medics/${medicId}/stats/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching medic stats:', error);
      throw error;
    }
  },
  
  getUntrainedMedics: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/medics/untrained_this_month/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching untrained medics:', error);
      throw error;
    }
  },
  
  // ===== Analysis API =====
  fetchTrainingStats: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // הוסף פרמטרי סינון לשאילתא אם קיימים
      if (params.team) queryParams.append('team', params.team);
      if (params.period) queryParams.append('period', params.period);
      
      const url = `${API_BASE_URL}/trainings/stats/?${queryParams.toString()}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching training stats:', error);
      throw error;
    }
  },
  
  // ===== כללי =====
  // טיפול בשגיאות כללי שניתן להשתמש בו בכל הקומפוננטות
  handleApiError: (error, setNotification) => {
    if (error.response) {
      // השרת החזיר תשובה עם קוד שגיאה
      if (error.response.status === 401) {
        setNotification('אינך מחובר למערכת. נא להתחבר מחדש.', 'error');
        // הפנייה לדף ההתחברות או פתיחת דיאלוג התחברות
      } else if (error.response.status === 403) {
        setNotification('אין לך הרשאה לבצע פעולה זו.', 'error');
      } else {
        setNotification('שגיאה: ' + (error.response.data.detail || 'קרתה תקלה'), 'error');
      }
    } else if (error.request) {
      // הבקשה נשלחה אך לא התקבלה תשובה
      setNotification('לא ניתן להתחבר לשרת. נא לבדוק את החיבור לאינטרנט.', 'error');
    } else {
      // שגיאה בהגדרת הבקשה
      setNotification('שגיאה בבקשה: ' + error.message, 'error');
    }
  }
};

export default apiService;