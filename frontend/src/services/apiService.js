// frontend/src/services/trainingService.js

import axios from 'axios';

// קרוב לתחילת הקובץ
import { API_BASE_URL, API_PREFIX } from '../config/api-config';

// שנה את הגדרת ה-API_BASE_URL
const API_URL = `${API_BASE_URL}${API_PREFIX}`;

// שנה את הגדרת ה-api
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
// Add authorization interceptor
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

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and it's not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken
        });
        
        if (response.data.access) {
          localStorage.setItem('access_token', response.data.access);
          
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Redirect to login page (if using React Router)
        // window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Base URL for training API
const BASE_URL = '/api/trainings';

// Authentication functions
export const login = async (credentials) => {
  const response = await api.post('/auth/login/', credentials);
  if (response.data.access) {
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const refreshToken = async () => {
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
};
// Helper to get safe data (with mock fallback)
const getSafeData = async (endpoint, mockDataKey) => {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.warn(`API endpoint ${endpoint} not available, using mock data`, error);
    return mockData[mockDataKey];
  }
};
// Team Training
export const getTeamTrainings = async () => {
  return await getSafeData('/trainings/team/', 'teamTrainings'); // נתיב נכון לפי הגדרת השרת
};



// Mock data for fallback
const mockData = {
  teams: ['חוד', 'אתק', 'רתק', 'מפלג'],
  soldiers: [
    { id: 1, name: 'ישראל ישראלי', personal_id: '8371234', team: 'חוד' },
    { id: 2, name: 'משה כהן', personal_id: '8367890', team: 'אתק' },
    { id: 3, name: 'דוד לוי', personal_id: '8412345', team: 'רתק' },
    { id: 4, name: 'יעקב גולדברג', personal_id: '8356789', team: 'חוד' },
    { id: 5, name: 'אברהם פרידמן', personal_id: '8391234', team: 'אתק' }
  ],
  teamTrainings: [
    { id: 1, date: '2023-02-15', team: 'אתק', scenario: 'פצוע אחד - דימום מאסיבי', location: 'שטח אימונים צפוני', performance_rating: 4, notes: 'ביצוע טוב, תגובה מהירה' },
    { id: 2, date: '2023-02-20', team: 'חוד', scenario: 'פצוע בודד - חבלת ראש', location: 'בסיס', performance_rating: 3, notes: 'נדרש שיפור בתיאום צוותי' }
  ],
  tourniquetTrainings: [
    { id: 1, soldier_id: 1, training_date: '2023-02-10', cat_time: '22', passed: true, notes: 'ביצוע טוב' },
    { id: 2, soldier_id: 2, training_date: '2023-02-12', cat_time: '31', passed: true, notes: 'נדרש שיפור במהירות' }
  ],
  medicTrainings: [
    { id: 1, medic_id: 1, training_date: '2023-02-05', training_type: 'החייאה', performance_rating: 4, notes: 'ביצוע טוב' },
    { id: 2, medic_id: 2, training_date: '2023-02-08', training_type: 'טיפול בחבלות', performance_rating: 3, notes: 'נדרש שיפור' }
  ]
};

export const createTeamTraining = async (data) => {
  const response = await api.post(`${BASE_URL}/team/`, data);
  return response.data;
};

export const updateTeamTraining = async (id, data) => {
  const response = await api.put(`${BASE_URL}/team/${id}/`, data);
  return response.data;
};

export const deleteTeamTraining = async (id) => {
  return await api.delete(`${BASE_URL}/team/${id}/`);
};

export const getTeamStats = async (team) => {
  const response = await api.get(`${BASE_URL}/team/stats_by_team/`, { params: { team } });
  return response.data;
};

// Soldiers
export const getSoldiers = async (filters = {}) => {
  const response = await api.get(`${BASE_URL}/soldiers/`, { params: filters });
  return response.data;
};

export const getSoldier = async (id) => {
  const response = await api.get(`${BASE_URL}/soldiers/${id}/`);
  return response.data;
};

export const createSoldier = async (data) => {
  const response = await api.post(`${BASE_URL}/soldiers/`, data);
  return response.data;
};

export const updateSoldier = async (id, data) => {
  const response = await api.put(`${BASE_URL}/soldiers/${id}/`, data);
  return response.data;
};

export const deleteSoldier = async (id) => {
  return await api.delete(`${BASE_URL}/soldiers/${id}/`);
};

export const getSoldierStats = async (id) => {
  const response = await api.get(`${BASE_URL}/soldiers/${id}/stats/`);
  return response.data;
};

export const getUntrainedSoldiers = async (team) => {
  const params = team ? { team } : {};
  const response = await api.get(`${BASE_URL}/soldiers/untrained_this_month/`, { params });
  return response.data;
};

export const getSoldiersByTeam = async (team) => {
  const response = await api.get(`${BASE_URL}/soldiers/by_team/`, { params: { team } });
  return response.data;
};

// Tourniquet Trainings
export const getTourniquetTrainings = async (filters = {}) => {
  const response = await api.get(`${BASE_URL}/tourniquet/`, { params: filters });
  return response.data;
};

export const getTourniquetTraining = async (id) => {
  const response = await api.get(`${BASE_URL}/tourniquet/${id}/`);
  return response.data;
};

export const createTourniquetTraining = async (data) => {
  const response = await api.post(`${BASE_URL}/tourniquet/`, data);
  return response.data;
};

export const updateTourniquetTraining = async (id, data) => {
  const response = await api.put(`${BASE_URL}/tourniquet/${id}/`, data);
  return response.data;
};

export const deleteTourniquetTraining = async (id) => {
  return await api.delete(`${BASE_URL}/tourniquet/${id}/`);
};

export const createBulkTourniquetTrainings = async (data) => {
  const response = await api.post(`${BASE_URL}/tourniquet/bulk_create/`, data);
  return response.data;
};

export const getCurrentMonthTourniquetTrainings = async (team) => {
  const params = team ? { team } : {};
  const response = await api.get(`${BASE_URL}/tourniquet/current_month/`, { params });
  return response.data;
};

export const getBestTourniquetTimes = async () => {
  const response = await api.get(`${BASE_URL}/tourniquet/best_times/`);
  return response.data;
};

export const getTourniquetTrainingsByTeam = async () => {
  const response = await api.get(`${BASE_URL}/tourniquet/by_team/`);
  return response.data;
};

// Medics
export const getMedics = async (filters = {}) => {
  const response = await api.get(`${BASE_URL}/medics/`, { params: filters });
  return response.data;
};

export const getMedic = async (id) => {
  const response = await api.get(`${BASE_URL}/medics/${id}/`);
  return response.data;
};

export const createMedic = async (data) => {
  const response = await api.post(`${BASE_URL}/medics/`, data);
  return response.data;
};

export const updateMedic = async (id, data) => {
  const response = await api.put(`${BASE_URL}/medics/${id}/`, data);
  return response.data;
};

export const deleteMedic = async (id) => {
  return await api.delete(`${BASE_URL}/medics/${id}/`);
};

export const getMedicStats = async (id) => {
  const response = await api.get(`${BASE_URL}/medics/${id}/stats/`);
  return response.data;
};

export const getUntrainedMedics = async (team) => {
  const params = team ? { team } : {};
  const response = await api.get(`${BASE_URL}/medics/untrained_this_month/`, { params });
  return response.data;
};

export const getMedicsByTeam = async (team) => {
  const response = await api.get(`${BASE_URL}/medics/by_team/`, { params: { team } });
  return response.data;
};

// Medic Trainings
export const getMedicTrainings = async (filters = {}) => {
  const response = await api.get(`${BASE_URL}/medic-training/`, { params: filters });
  return response.data;
};

export const getMedicTraining = async (id) => {
  const response = await api.get(`${BASE_URL}/medic-training/${id}/`);
  return response.data;
};

export const createMedicTraining = async (data) => {
  const response = await api.post(`${BASE_URL}/medic-training/`, data);
  return response.data;
};

export const updateMedicTraining = async (id, data) => {
  const response = await api.put(`${BASE_URL}/medic-training/${id}/`, data);
  return response.data;
};

export const deleteMedicTraining = async (id) => {
  return await api.delete(`${BASE_URL}/medic-training/${id}/`);
};

export const createBulkMedicTrainings = async (data) => {
  const response = await api.post(`${BASE_URL}/medic-training/bulk_create/`, data);
  return response.data;
};

export const getCurrentMonthMedicTrainings = async (team) => {
  const params = team ? { team } : {};
  const response = await api.get(`${BASE_URL}/medic-training/current_month/`, { params });
  return response.data;
};

export const getMedicTrainingsByType = async (type) => {
  const response = await api.get(`${BASE_URL}/medic-training/by_type/`, { params: { type } });
  return response.data;
};

// Teams - This isn't directly provided in the API documentation but is needed
export const getTeams = async () => {
  // Try to get teams from a dedicated endpoint first
  try {
    const response = await api.get(`${BASE_URL}/teams/`);
    return response.data;
  } catch (error) {
    // If dedicated endpoint fails, try to get unique teams from soldiers
    try {
      const soldiers = await getSoldiers();
      const uniqueTeams = [...new Set(soldiers.map(soldier => soldier.team))];
      return uniqueTeams.filter(team => team); // Filter out undefined/null/empty
    } catch (innerError) {
      // If all else fails, return default teams
      console.warn('Teams endpoint not available, using fallback teams');
      return ['חוד', 'אתק', 'רתק', 'מפלג'];
    }
  }
};

// Overall Training Stats
export const getTrainingStats = async (period = 'all', team = null) => {
  const params = { period };
  if (team) params.team = team;
  const response = await api.get(`${BASE_URL}/stats/`, { params });
  return response.data;
};

// Error handling helper
export const handleApiError = (error, showNotification) => {
  if (error.response) {
    const status = error.response.status;
    let message = 'שגיאה לא ידועה';
    
    if (status === 400) {
      message = 'בקשה שגויה. אנא בדוק את הנתונים שהוזנו';
      // If detailed error information is available
      if (error.response.data && typeof error.response.data === 'object') {
        const detailErrors = Object.entries(error.response.data)
          .map(([field, errors]) => {
            if (Array.isArray(errors)) {
              return `${field}: ${errors.join(', ')}`;
            }
            return `${field}: ${errors}`;
          })
          .join('; ');
        
        if (detailErrors) {
          message = detailErrors;
        }
      }
    } else if (status === 401) {
      message = 'אינך מורשה. יש צורך בהתחברות מחדש';
    } else if (status === 403) {
      message = 'הגישה נדחתה. אינך מורשה לבצע פעולה זו';
    } else if (status === 404) {
      message = 'המשאב המבוקש לא נמצא';
    } else if (status === 500) {
      message = 'שגיאת שרת. אנא נסה שוב מאוחר יותר';
    }
    
    if (showNotification) {
      showNotification(message, 'error');
    }
  } else if (error.request) {
    const message = 'אין תשובה מהשרת. אנא בדוק את החיבור שלך';
    if (showNotification) {
      showNotification(message, 'error');
    }
  } else {
    const message = 'שגיאה בעת ניסיון להתחבר לשרת';
    if (showNotification) {
      showNotification(message, 'error');
    }
  }
  
  console.error('API Error:', error);
  return error;
};

// תיקון אזהרת ESLint על ידי יצירת אובייקט ושיוכו למשתנה לפני הייצוא
const trainingService = {
  getTeamTrainings,
  getTeamTraining,
  createTeamTraining,
  updateTeamTraining,
  deleteTeamTraining,
  getTeamStats,
  
  getSoldiers,
  getSoldier,
  createSoldier,
  updateSoldier,
  deleteSoldier,
  getSoldierStats,
  getUntrainedSoldiers,
  getSoldiersByTeam,
  
  getTourniquetTrainings,
  getTourniquetTraining,
  createTourniquetTraining,
  updateTourniquetTraining,
  deleteTourniquetTraining,
  createBulkTourniquetTrainings,
  getCurrentMonthTourniquetTrainings,
  getBestTourniquetTimes,
  getTourniquetTrainingsByTeam,
  
  getMedics,
  getMedic,
  createMedic,
  updateMedic,
  deleteMedic,
  getMedicStats,
  getUntrainedMedics,
  getMedicsByTeam,
  
  getMedicTrainings,
  getMedicTraining,
  createMedicTraining,
  updateMedicTraining,
  deleteMedicTraining,
  createBulkMedicTrainings,
  getCurrentMonthMedicTrainings,
  getMedicTrainingsByType,
  
  getTrainingStats,
  getTeams,
  handleApiError
};

export default trainingService;