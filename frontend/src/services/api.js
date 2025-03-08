// frontend/src/services/api.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Configure axios with authentication
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Training API services
export const trainingService = {
  // Teams API
  fetchTeams: async () => {
    try {
      const response = await apiClient.get('/trainings/teams/');
      return response.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },
  
  // Soldier API
  fetchSoldiers: async () => {
    try {
      const response = await apiClient.get('/trainings/soldiers/');
      return response.data;
    } catch (error) {
      console.error('Error fetching soldiers:', error);
      throw error;
    }
  },
  
  createSoldier: async (data) => {
    try {
      const response = await apiClient.post('/trainings/soldiers/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating soldier:', error);
      throw error;
    }
  },
  
  updateSoldier: async (id, data) => {
    try {
      const response = await apiClient.put(`/trainings/soldiers/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating soldier:', error);
      throw error;
    }
  },
  
  // Tourniquet Training API
  fetchTourniquetTrainings: async () => {
    try {
      const response = await apiClient.get('/trainings/tourniquet/');
      return response.data;
    } catch (error) {
      console.error('Error fetching tourniquet trainings:', error);
      throw error;
    }
  },
  
  fetchSoldierTourniquetTrainings: async (soldierId) => {
    try {
      const response = await apiClient.get(`/trainings/tourniquet/?soldier=${soldierId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tourniquet trainings for soldier ${soldierId}:`, error);
      throw error;
    }
  },
  
  createTourniquetTraining: async (data) => {
    try {
      const response = await apiClient.post('/trainings/tourniquet/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating tourniquet training:', error);
      throw error;
    }
  },
  
  bulkCreateTourniquetTrainings: async (dataArray) => {
    try {
      const response = await apiClient.post('/trainings/tourniquet/bulk_create/', dataArray);
      return response.data;
    } catch (error) {
      console.error('Error bulk creating tourniquet trainings:', error);
      throw error;
    }
  },
  
  updateTourniquetTraining: async (id, data) => {
    try {
      const response = await apiClient.put(`/trainings/tourniquet/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating tourniquet training:', error);
      throw error;
    }
  },
  
  deleteTourniquetTraining: async (id) => {
    try {
      await apiClient.delete(`/trainings/tourniquet/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting tourniquet training:', error);
      throw error;
    }
  },
  
  // Medic API
  fetchMedics: async () => {
    try {
      const response = await apiClient.get('/trainings/medics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching medics:', error);
      throw error;
    }
  },
  
  // Medic Training API
  fetchMedicTrainings: async () => {
    try {
      const response = await apiClient.get('/trainings/medic-training/');
      return response.data;
    } catch (error) {
      console.error('Error fetching medic trainings:', error);
      throw error;
    }
  },
  
  createMedicTraining: async (data) => {
    try {
      const response = await apiClient.post('/trainings/medic-training/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating medic training:', error);
      throw error;
    }
  },
  
  // Team Training API
  fetchTeamTrainings: async () => {
    try {
      const response = await apiClient.get('/trainings/team/');
      return response.data;
    } catch (error) {
      console.error('Error fetching team trainings:', error);
      throw error;
    }
  },
  
  createTeamTraining: async (data) => {
    try {
      const response = await apiClient.post('/trainings/team/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating team training:', error);
      throw error;
    }
  },
  
  // Training Stats API
  fetchTrainingStats: async (params = {}) => {
    try {
      const response = await apiClient.get('/trainings/stats/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching training stats:', error);
      throw error;
    }
  },
  
  fetchSoldierStats: async (soldierId) => {
    try {
      const response = await apiClient.get(`/trainings/soldiers/${soldierId}/stats/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for soldier ${soldierId}:`, error);
      throw error;
    }
  },
  
  fetchMedicStats: async (medicId) => {
    try {
      const response = await apiClient.get(`/trainings/medics/${medicId}/stats/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for medic ${medicId}:`, error);
      throw error;
    }
  }
};

// Authentication API services
export const authService = {
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/`, credentials);
      // Store token in localStorage
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },
  
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
        refresh: refreshToken
      });
      
      localStorage.setItem('token', response.data.access);
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, log out
      authService.logout();
      throw error;
    }
  }
};

export default { trainingService, authService };