// בקובץ frontend/src/services/trainingService.js

import axios from 'axios';

// הגדרת כתובת הבסיס של ה-API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// פונקציה לטיפול בשגיאות API
export const handleApiError = (error, showNotification) => {
  if (error.response) {
    // Server responded with an error status
    const message = error.response.data?.detail || error.response.data?.message || 'שגיאת שרת';
    console.error('Server error:', error.response.status, message);
    showNotification(`שגיאה: ${message}`, 'error');
  } else if (error.request) {
    // Request made but no response received (network error)
    console.error('Network error:', error.request);
    showNotification('שגיאת רשת - לא ניתן להתחבר לשרת', 'error');
  } else {
    // Error in request setup
    console.error('Request error:', error.message);
    showNotification(`שגיאה: ${error.message}`, 'error');
  }
};

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

// נתוני דמה למקרה שהשרת לא זמין
const mockData = {
  teams: ['חוד', 'אתק', 'רתק', 'מפלג'],
  soldiers: [
    { id: 1, name: 'ישראל ישראלי', personal_id: '8371234', team: 'חוד' },
    { id: 2, name: 'משה כהן', personal_id: '8367890', team: 'אתק' },
    { id: 3, name: 'דוד לוי', personal_id: '8412345', team: 'רתק' },
    { id: 4, name: 'יעקב גולדברג', personal_id: '8356789', team: 'חוד' },
    { id: 5, name: 'אברהם פרידמן', personal_id: '8391234', team: 'אתק' },
    { id: 6, name: 'יצחק רבין', personal_id: '8323456', team: 'רתק' },
    { id: 7, name: 'שמעון פרס', personal_id: '8367890', team: 'חוד' },
    { id: 8, name: 'אהוד ברק', personal_id: '8323456', team: 'אתק' },
    { id: 9, name: 'בנימין נתניהו', personal_id: '8378901', team: 'רתק' },
    { id: 10, name: 'נפתלי בנט', personal_id: '8334567', team: 'מפלג' }
  ],
  medics: [
    { id: 1, name: 'שלמה הרופא', personal_id: '8323456', team: 'חוד', role: 'חובש קרבי' },
    { id: 2, name: 'גדי הסניטר', personal_id: '8378901', team: 'אתק', role: 'חובש מחלקתי' },
    { id: 3, name: 'רותם כהן', personal_id: '8334567', team: 'רתק', role: 'חובש מחלקתי' },
    { id: 4, name: 'תמיר לוי', personal_id: '8345678', team: 'חוד', role: 'חובש פלוגתי' }
  ],
  teamTrainings: [
    { id: 1, date: '2023-02-15', team: 'אתק', scenario: 'פצוע אחד - דימום מאסיבי', location: 'שטח אימונים צפוני', performance_rating: 4, notes: 'ביצוע טוב, תגובה מהירה' },
    { id: 2, date: '2023-02-20', team: 'חוד', scenario: 'פצוע בודד - חבלת ראש', location: 'בסיס', performance_rating: 3, notes: 'נדרש שיפור בתיאום צוותי' },
    { id: 3, date: '2023-03-05', team: 'רתק', scenario: 'אר"ן המוני - 5 נפגעים', location: 'שטח אש דרומי', performance_rating: 5, notes: 'ביצוע מצוין, תיאום מעולה' }
  ],
  tourniquetTrainings: [
    { id: 1, soldier_id: 1, training_date: '2023-02-10', cat_time: '22', passed: true, notes: 'ביצוע טוב' },
    { id: 2, soldier_id: 2, training_date: '2023-02-12', cat_time: '31', passed: true, notes: 'נדרש שיפור במהירות' },
    { id: 3, soldier_id: 3, training_date: '2023-02-15', cat_time: '28', passed: true, notes: 'ביצוע סביר' },
    { id: 4, soldier_id: 4, training_date: '2023-02-18', cat_time: '19', passed: true, notes: 'ביצוע טוב מאוד' },
    { id: 5, soldier_id: 5, training_date: '2023-02-20', cat_time: '25', passed: true, notes: 'ביצוע בסדר' },
    { id: 6, soldier_id: 1, training_date: '2023-03-05', cat_time: '20', passed: true, notes: 'שיפור משמעותי' },
    { id: 7, soldier_id: 2, training_date: '2023-03-08', cat_time: '27', passed: true, notes: 'התקדמות' }
  ],
  medicTrainings: [
    { id: 1, medic_id: 1, training_date: '2023-02-05', training_type: 'החייאה', performance_rating: 4, notes: 'ביצוע טוב' },
    { id: 2, medic_id: 2, training_date: '2023-02-08', training_type: 'טיפול בחבלות', performance_rating: 3, notes: 'נדרש שיפור' },
    { id: 3, medic_id: 3, training_date: '2023-02-15', training_type: 'עירוי', performance_rating: 5, notes: 'ביצוע מצוין' },
    { id: 4, medic_id: 4, training_date: '2023-02-20', training_type: 'החייאה', performance_rating: 4, notes: 'יכולת טובה' },
    { id: 5, medic_id: 1, training_date: '2023-03-01', training_type: 'טיפול בחבלות', performance_rating: 5, notes: 'שליטה מצוינת' }
  ]
};

// פונקציה להבאת נתונים עם גיבוי לנתוני דמה
const getSafeData = async (endpoint, mockDataKey) => {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.warn(`API endpoint ${endpoint} not available, using mock data`, error);
    return mockData[mockDataKey];
  }
};

// פונקציות API לצוותים
export const getTeams = async () => {
  return await getSafeData('/teams/', 'teams');
};

export const getTeamTrainings = async () => {
  return await getSafeData('/trainings/team/', 'teamTrainings');
};

export const createTeamTraining = async (data) => {
  try {
    const response = await api.post('/trainings/team/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating team training:', error);
    // אם ה-API נכשל, החזר תגובת דמה
    return { id: Date.now(), ...data };
  }
};

export const updateTeamTraining = async (id, data) => {
  try {
    const response = await api.put(`/trainings/team/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating team training:', error);
    // אם ה-API נכשל, החזר את הנתונים כאילו הם עודכנו
    return { id, ...data };
  }
};

export const deleteTeamTraining = async (id) => {
  try {
    await api.delete(`/trainings/team/${id}/`);
    return true;
  } catch (error) {
    console.error('Error deleting team training:', error);
    // אם ה-API נכשל, דמה הצלחה
    return true;
  }
};

// פונקציות API לחיילים
export const getSoldiers = async () => {
  return await getSafeData('/soldiers/', 'soldiers');
};

export const getUntrainedSoldiers = async () => {
  try {
    const response = await api.get('/soldiers/untrained/');
    return response.data;
  } catch (error) {
    console.warn('API endpoint for untrained soldiers not available, calculating locally', error);
    
    // חישוב חיילים שלא תורגלו באופן מקומי
    const soldiers = await getSoldiers();
    const trainings = await getTourniquetTrainings();
    
    // קבלת חודש/שנה נוכחיים
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // סינון חיילים שיש להם אימון החודש
    const trainedSoldierIds = new Set();
    
    trainings.forEach(training => {
      const trainingDate = new Date(training.training_date);
      if (trainingDate.getMonth() === currentMonth && trainingDate.getFullYear() === currentYear) {
        trainedSoldierIds.add(training.soldier_id);
      }
    });
    
    // החזרת חיילים שלא תורגלו החודש
    return soldiers.filter(soldier => !trainedSoldierIds.has(soldier.id));
  }
};

export const getSoldierStats = async (soldierId) => {
  try {
    const response = await api.get(`/soldiers/${soldierId}/stats/`);
    return response.data;
  } catch (error) {
    console.warn(`API endpoint for soldier stats not available, calculating locally for soldier ${soldierId}`, error);
    
    // חישוב סטטיסטיקות חייל מקומית
    const trainings = await getTourniquetTrainings();
    const soldierTrainings = trainings.filter(t => t.soldier_id === soldierId);
    
    // מיון אימונים לפי תאריך
    const sortedTrainings = [...soldierTrainings].sort((a, b) => 
      new Date(b.training_date) - new Date(a.training_date)
    );
    
    // חישוב זמן CAT ממוצע
    const totalTime = soldierTrainings.reduce((sum, t) => sum + parseInt(t.cat_time || 0), 0);
    const average_cat_time = soldierTrainings.length > 0 ? 
      (totalTime / soldierTrainings.length).toFixed(1) : 0;
    
    // חישוב אחוז הצלחה
    const passedCount = soldierTrainings.filter(t => t.passed).length;
    const pass_rate = soldierTrainings.length > 0 ? 
      Math.round((passedCount / soldierTrainings.length) * 100) : 0;
    
    // חישוב מגמת שיפור (אם יש לפחות 2 אימונים)
    let improvement_trend = null;
    if (sortedTrainings.length >= 2) {
      const firstTrainingTime = parseInt(sortedTrainings[sortedTrainings.length - 1].cat_time || 0);
      const lastTrainingTime = parseInt(sortedTrainings[0].cat_time || 0);
      
      if (firstTrainingTime > 0 && lastTrainingTime > 0) {
        const improvement = firstTrainingTime - lastTrainingTime;
        const improvement_percent = (improvement / firstTrainingTime) * 100;
        
        improvement_trend = {
          first_training: sortedTrainings[sortedTrainings.length - 1],
          last_training: sortedTrainings[0],
          improvement,
          improvement_percent
        };
      }
    }
    
    return {
      average_cat_time,
      pass_rate,
      total_trainings: soldierTrainings.length,
      trainings: sortedTrainings,
      improvement_trend
    };
  }
};

// פונקציות API לאימוני חסמי עורקים
export const getTourniquetTrainings = async () => {
  return await getSafeData('/trainings/tourniquet/', 'tourniquetTrainings');
};

export const createTourniquetTraining = async (data) => {
  try {
    const response = await api.post('/trainings/tourniquet/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating tourniquet training:', error);
    // אם ה-API נכשל, החזר תגובת דמה
    return { id: Date.now(), ...data };
  }
};

export const createBulkTourniquetTrainings = async (data) => {
  try {
    const response = await api.post('/trainings/tourniquet/bulk/', { trainings: data });
    return response.data;
  } catch (error) {
    console.error('Error creating bulk tourniquet trainings:', error);
    // אם ה-API נכשל, החזר תגובות דמה
    return data.map(item => ({ id: Date.now() + Math.random() * 1000, ...item }));
  }
};

export const updateTourniquetTraining = async (id, data) => {
  try {
    const response = await api.put(`/trainings/tourniquet/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating tourniquet training:', error);
    // אם ה-API נכשל, החזר את הנתונים כאילו הם עודכנו
    return { id, ...data };
  }
};

export const deleteTourniquetTraining = async (id) => {
  try {
    await api.delete(`/trainings/tourniquet/${id}/`);
    return true;
  } catch (error) {
    console.error('Error deleting tourniquet training:', error);
    // אם ה-API נכשל, דמה הצלחה
    return true;
  }
};

// פונקציות API לחובשים
export const getMedics = async () => {
  return await getSafeData('/medics/', 'medics');
};

export const getMedicTrainings = async () => {
  return await getSafeData('/trainings/medic/', 'medicTrainings');
};

export const createMedicTraining = async (data) => {
  try {
    const response = await api.post('/trainings/medic/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating medic training:', error);
    // אם ה-API נכשל, החזר תגובת דמה
    return { id: Date.now(), ...data };
  }
};

export const createBulkMedicTrainings = async (data) => {
  try {
    const response = await api.post('/trainings/medic/bulk/', { trainings: data });
    return response.data;
  } catch (error) {
    console.error('Error creating bulk medic trainings:', error);
    // אם ה-API נכשל, החזר תגובות דמה
    return data.map(item => ({ id: Date.now() + Math.random() * 1000, ...item }));
  }
};

export const updateMedicTraining = async (id, data) => {
  try {
    const response = await api.put(`/trainings/medic/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating medic training:', error);
    // אם ה-API נכשל, החזר את הנתונים כאילו הם עודכנו
    return { id, ...data };
  }
};

export const deleteMedicTraining = async (id) => {
  try {
    await api.delete(`/trainings/medic/${id}/`);
    return true;
  } catch (error) {
    console.error('Error deleting medic training:', error);
    // אם ה-API נכשל, דמה הצלחה
    return true;
  }
};

// פונקציות API לסטטיסטיקות
export const getTrainingStats = async () => {
  try {
    const response = await api.get('/trainings/stats/');
    return response.data;
  } catch (error) {
    console.warn('API endpoint for training stats not available', error);
    // החזר סטטיסטיקות ריקות
    return {
      total_trainings: 0,
      team_stats: [],
      soldier_stats: []
    };
  }
};