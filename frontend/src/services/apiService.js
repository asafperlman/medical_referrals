// API Configuration
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
const TRAININGS_BASE_URL = `${API_BASE_URL}/trainings`;

// API service functions
const apiService = {
  // Utility function for API error handling
  handleApiError: (error, showNotification) => {
    if (error.response) {
      // Server responded with an error
      const status = error.response.status;
      const data = error.response.data;
      
      let message = 'שגיאה בשרת';
      if (data.detail) {
        message = data.detail;
      } else if (data.message) {
        message = data.message;
      } else if (typeof data === 'string') {
        message = data;
      }
      
      if (showNotification) {
        showNotification(message, 'error');
      }
      
      return { status, message };
    } else if (error.request) {
      // Request was made but no response
      const message = 'לא ניתן להתחבר לשרת. בדוק את החיבור שלך.';
      if (showNotification) {
        showNotification(message, 'error');
      }
      return { status: 0, message };
    } else {
      // Error in setting up the request
      const message = 'שגיאה בהגדרת הבקשה: ' + error.message;
      if (showNotification) {
        showNotification(message, 'error');
      }
      return { status: 0, message };
    }
  },

  // Teams API (uses hardcoded values if no endpoint exists)
  fetchTeams: async () => {
    try {
      // Try to get teams from API first
      try {
        const response = await axios.get(`${TRAININGS_BASE_URL}/teams/`);
        return response.data;
      } catch (error) {
        // If API endpoint doesn't exist, return hardcoded values
        console.log('Using hardcoded teams data');
        return ['חוד', 'אתק', 'רתק', 'מפלג'];
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },

  // Team Training API
  fetchTeamTrainings: async (filters = {}) => {
    try {
      let url = `${TRAININGS_BASE_URL}/team/`;
      
      // Add filters if provided
      if (Object.keys(filters).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        url += `?${queryParams.toString()}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching team trainings:', error);
      throw error;
    }
  },
  
  createTeamTraining: async (data) => {
    try {
      const response = await axios.post(`${TRAININGS_BASE_URL}/team/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating team training:', error);
      throw error;
    }
  },
  
  updateTeamTraining: async (id, data) => {
    try {
      const response = await axios.put(`${TRAININGS_BASE_URL}/team/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating team training:', error);
      throw error;
    }
  },
  
  deleteTeamTraining: async (id) => {
    try {
      const response = await axios.delete(`${TRAININGS_BASE_URL}/team/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting team training:', error);
      throw error;
    }
  },
  
  getTeamStats: async (team) => {
    try {
      const response = await axios.get(`${TRAININGS_BASE_URL}/team/stats_by_team/?team=${team}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team stats:', error);
      throw error;
    }
  },
  
  // Soldiers API
  fetchSoldiers: async (filters = {}) => {
    try {
      let url = `${TRAININGS_BASE_URL}/soldiers/`;
      
      // Add filters if provided
      if (Object.keys(filters).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        url += `?${queryParams.toString()}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching soldiers:', error);
      throw error;
    }
  },
  
  createSoldier: async (data) => {
    try {
      const response = await axios.post(`${TRAININGS_BASE_URL}/soldiers/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating soldier:', error);
      throw error;
    }
  },
  
  getSoldierStats: async (id) => {
    try {
      const response = await axios.get(`${TRAININGS_BASE_URL}/soldiers/${id}/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching soldier stats:', error);
      throw error;
    }
  },
  
  getSoldiersByTeam: async (team) => {
    try {
      const response = await axios.get(`${TRAININGS_BASE_URL}/soldiers/by_team/?team=${team}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching soldiers by team:', error);
      throw error;
    }
  },
  
  getUntrainedSoldiers: async (team) => {
    try {
      let url = `${TRAININGS_BASE_URL}/soldiers/untrained_this_month/`;
      if (team) {
        url += `?team=${team}`;
      }
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching untrained soldiers:', error);
      throw error;
    }
  },
  
  // Tourniquet Training API
  fetchTourniquetTrainings: async (filters = {}) => {
    try {
      let url = `${TRAININGS_BASE_URL}/tourniquet/`;
      
      // Add filters if provided
      if (Object.keys(filters).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        url += `?${queryParams.toString()}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching tourniquet trainings:', error);
      throw error;
    }
  },
  
  createTourniquetTraining: async (data) => {
    try {
      const response = await axios.post(`${TRAININGS_BASE_URL}/tourniquet/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating tourniquet training:', error);
      throw error;
    }
  },
  
  // Added both versions to ensure compatibility
  bulkCreateTourniquetTraining: async (data) => {
    try {
      const response = await axios.post(`${TRAININGS_BASE_URL}/tourniquet/bulk_create/`, data);
      return response.data;
    } catch (error) {
      console.error('Error bulk creating tourniquet trainings:', error);
      throw error;
    }
  },
  
  bulkCreateTourniquetTrainings: async (data) => {
    try {
      const response = await axios.post(`${TRAININGS_BASE_URL}/tourniquet/bulk_create/`, data);
      return response.data;
    } catch (error) {
      console.error('Error bulk creating tourniquet trainings:', error);
      throw error;
    }
  },
  
  getCurrentMonthTourniquetTrainings: async (team) => {
    try {
      let url = `${TRAININGS_BASE_URL}/tourniquet/current_month/`;
      if (team) {
        url += `?team=${team}`;
      }
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching current month tourniquet trainings:', error);
      throw error;
    }
  },
  
  getTourniquetTrainingsByTeam: async () => {
    try {
      const response = await axios.get(`${TRAININGS_BASE_URL}/tourniquet/by_team/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tourniquet trainings by team:', error);
      throw error;
    }
  },
  
  // Medics API
  fetchMedics: async (filters = {}) => {
    try {
      let url = `${TRAININGS_BASE_URL}/medics/`;
      
      // Add filters if provided
      if (Object.keys(filters).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        url += `?${queryParams.toString()}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching medics:', error);
      throw error;
    }
  },
  
  getMedicStats: async (id) => {
    try {
      const response = await axios.get(`${TRAININGS_BASE_URL}/medics/${id}/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medic stats:', error);
      throw error;
    }
  },
  
  getMedicsByTeam: async (team) => {
    try {
      const response = await axios.get(`${TRAININGS_BASE_URL}/medics/by_team/?team=${team}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medics by team:', error);
      throw error;
    }
  },
  
  getUntrainedMedics: async (team) => {
    try {
      let url = `${TRAININGS_BASE_URL}/medics/untrained_this_month/`;
      if (team) {
        url += `?team=${team}`;
      }
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching untrained medics:', error);
      throw error;
    }
  },
  
  // Medic Training API - IMPORTANT: uses /medic/ endpoint, not /medic-training/
  fetchMedicTrainings: async (filters = {}) => {
    try {
      let url = `${TRAININGS_BASE_URL}/medic/`;
      
      // Add filters if provided
      if (Object.keys(filters).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        url += `?${queryParams.toString()}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching medic trainings:', error);
      throw error;
    }
  },
  
  createMedicTraining: async (data) => {
    try {
      const response = await axios.post(`${TRAININGS_BASE_URL}/medic/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating medic training:', error);
      throw error;
    }
  },
  
  bulkCreateMedicTraining: async (data) => {
    try {
      const response = await axios.post(`${TRAININGS_BASE_URL}/medic/bulk_create/`, data);
      return response.data;
    } catch (error) {
      console.error('Error bulk creating medic trainings:', error);
      throw error;
    }
  },
  
  bulkCreateMedicTrainings: async (data) => {
    try {
      const response = await axios.post(`${TRAININGS_BASE_URL}/medic/bulk_create/`, data);
      return response.data;
    } catch (error) {
      console.error('Error bulk creating medic trainings:', error);
      throw error;
    }
  },
  
  getCurrentMonthMedicTrainings: async (team) => {
    try {
      let url = `${TRAININGS_BASE_URL}/medic/current_month/`;
      if (team) {
        url += `?team=${team}`;
      }
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching current month medic trainings:', error);
      throw error;
    }
  },
  
  getMedicTrainingsByType: async () => {
    try {
      const response = await axios.get(`${TRAININGS_BASE_URL}/medic/by_type/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medic trainings by type:', error);
      throw error;
    }
  },
  
  // Stats API
  getTrainingStats: async (period, team) => {
    try {
      let url = `${TRAININGS_BASE_URL}/stats/`;
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (team) params.append('team', team);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching training stats:', error);
      throw error;
    }
  }
};

export default apiService;