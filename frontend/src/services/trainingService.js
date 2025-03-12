import api from './api';

// Base URL for training API
const BASE_URL = '/api/trainings';

// Team Training
export const getTeamTrainings = async (filters = {}) => {
  const response = await api.get(`${BASE_URL}/team/`, { params: filters });
  return response.data;
};

export const getTeamTraining = async (id) => {
  const response = await api.get(`${BASE_URL}/team/${id}/`);
  return response.data;
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

// Medic Trainings - Using medic-trainings instead of medic as per required backend change
export const getMedicTrainings = async (filters = {}) => {
  const response = await api.get(`${BASE_URL}/medic-trainings/`, { params: filters });
  return response.data;
};

export const getMedicTraining = async (id) => {
  const response = await api.get(`${BASE_URL}/medic-trainings/${id}/`);
  return response.data;
};

export const createMedicTraining = async (data) => {
  const response = await api.post(`${BASE_URL}/medic-trainings/`, data);
  return response.data;
};

export const updateMedicTraining = async (id, data) => {
  const response = await api.put(`${BASE_URL}/medic-trainings/${id}/`, data);
  return response.data;
};

export const deleteMedicTraining = async (id) => {
  return await api.delete(`${BASE_URL}/medic-trainings/${id}/`);
};

export const createBulkMedicTrainings = async (data) => {
  const response = await api.post(`${BASE_URL}/medic-trainings/bulk_create/`, data);
  return response.data;
};

export const getCurrentMonthMedicTrainings = async (team) => {
  const params = team ? { team } : {};
  const response = await api.get(`${BASE_URL}/medic-trainings/current_month/`, { params });
  return response.data;
};

export const getMedicTrainingsByType = async (type) => {
  const response = await api.get(`${BASE_URL}/medic-trainings/by_type/`, { params: { type } });
  return response.data;
};

// Overall Training Stats
export const getTrainingStats = async (period = 'all', team = null) => {
  const params = { period };
  if (team) params.team = team;
  const response = await api.get(`${BASE_URL}/stats/`, { params });
  return response.data;
};

// Teams - This isn't directly provided in the API documentation but is needed
export const getTeams = async () => {
  // This is a helper function as there's no direct endpoint for teams
  // We can extract teams from the soldier list or use a fallback
  try {
    const response = await api.get(`${BASE_URL}/teams/`);
    return response.data;
  } catch (error) {
    // If there's no teams endpoint, we can fall back to a common set of teams
    console.warn('Teams endpoint not available, using fallback teams');
    return ['חוד', 'אתק', 'רתק', 'מפלג'];
  }
};

// Error handling helper
export const handleApiError = (error, showNotification) => {
  if (error.response) {
    const status = error.response.status;
    let message = 'שגיאה לא ידועה';
    
    if (status === 400) {
      message = 'בקשה שגויה. אנא בדוק את הנתונים שהוזנו';
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
  
  // Rethrow the error for further handling if needed
  throw error;
};

export default {
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