// בקובץ frontend/src/services/trainingService.js

import axios from 'axios';

// הגדרת כתובת הבסיס של ה-API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const TRAININGS_BASE_URL = `${API_BASE_URL}/api/trainings`;

// יצירת מופע axios עם הגדרות בסיסיות
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// הוספת interceptor לטיפול בטוקן אימות (אם יש)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// שירות API לנתוני תרגולים
const trainingService = {
  // פונקציה להבאת רשימת צוותים
  fetchTeams: async () => {
    try {
      const response = await api.get(`${TRAININGS_BASE_URL}/teams/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },
  
  // פונקציה להבאת רשימת חיילים
  fetchSoldiers: async () => {
    try {
      const response = await api.get(`${TRAININGS_BASE_URL}/soldiers/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching soldiers:', error);
      throw error;
    }
  },
  
  // פונקציה להבאת נתוני תרגולי חסמי עורקים
  fetchTourniquetTrainings: async () => {
    try {
      const response = await api.get(`${TRAININGS_BASE_URL}/tourniquet/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tourniquet trainings:', error);
      throw error;
    }
  },
  
  // פונקציה ליצירת תרגול חסם עורקים חדש
  createTourniquetTraining: async (data) => {
    try {
      const response = await api.post(`${TRAININGS_BASE_URL}/tourniquet/`, data);
      return response;
    } catch (error) {
      console.error('Error creating tourniquet training:', error);
      throw error;
    }
  },
  
  // פונקציה להבאת נתוני חובשים
  fetchMedics: async () => {
    try {
      const response = await api.get(`${TRAININGS_BASE_URL}/medic/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medics:', error);
      throw error;
    }
  },
  
  // פונקציה להבאת תרגולי חובשים
  fetchMedicTrainings: async () => {
    try {
      const response = await api.get(`${TRAININGS_BASE_URL}/medic/trainings/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medic trainings:', error);
      throw error;
    }
  }
};

export default trainingService;