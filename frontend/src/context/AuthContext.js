// medical-referrals/frontend/src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
// קרוב לתחילת הקובץ
import { API_BASE_URL, API_PREFIX } from '../config/api-config';

// שנה את הגדרת ה-API_URL
export const API_URL = `${API_BASE_URL}${API_PREFIX}`;
// יצירת API מרכזי

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// עדכון הטוקן בכותרות של בקשות API
const updateApiToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// יצירת context להרשאות
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  // הגדרת פונקציית handleLogout לפני השימוש בה
  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    updateApiToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    setLastRefresh(null);
    setAuthError(null);
    navigate('/login');
  }, [navigate]);

  // האזנה לשגיאות API ולפקיעת תוקף של טוקן
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // בדוק אם השגיאה היא 401 (לא מורשה) ואם התגובה נכשלה בגלל טוקן לא תקף
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // נסה לחדש את הטוקן
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
              // אם אין refresh token, צא מהמערכת
              handleLogout();
              return Promise.reject(error);
            }
            
            const response = await axios.post(`${API_URL}/auth/refresh/`, {
              refresh: refreshToken,
            });
            
            // שמור את הטוקן החדש
            localStorage.setItem('access_token', response.data.access);
            setLastRefresh(new Date());
            
            // הוסף את הטוקן החדש לבקשה המקורית ושלח שוב
            originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
            updateApiToken(response.data.access);
            return axios(originalRequest);
          } catch (refreshError) {
            // אם רענון הטוקן נכשל, צא מהמערכת
            console.error("Token refresh failed:", refreshError);
            handleLogout();
            return Promise.reject(refreshError);
          }
        }
        
        // טיפול בשגיאות ספציפיות לשיפור חוויית המשתמש
        if (error.response) {
          // רשימת שגיאות והודעות ידידותיות למשתמש
          const errorMessages = {
            400: 'בקשה לא תקינה, אנא בדוק את הנתונים שהוזנו',
            403: 'אין לך הרשאות לבצע פעולה זו',
            404: 'המשאב המבוקש לא נמצא',
            500: 'שגיאת שרת, אנא נסה שוב מאוחר יותר'
          };
          
          // הוסף את ההודעה המתאימה לאובייקט השגיאה אם קיימת
          if (errorMessages[error.response.status]) {
            error.friendlyMessage = errorMessages[error.response.status];
          }

          // שמור את השגיאה במצב ה-context אם זו שגיאת הרשאה
          if (error.response.status === 401 || error.response.status === 403) {
            setAuthError(error.friendlyMessage || 'שגיאת הרשאה');
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    // ניקוי האזנה בעת הסרת הקומפוננטה
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [handleLogout]);

  // קבלת מידע על המשתמש מהשרת
  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await api.get('/users/me/');
      setUser(response.data);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      console.error('Error fetching user info:', error);
      
      // בדוק אם השגיאה נובעת מבעיית הרשאה
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        handleLogout();
      } else {
        // שגיאה אחרת, לא קשורה להרשאות
        setAuthError('שגיאה בקבלת מידע המשתמש');
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  // בדיקת הרשאות בעת טעינת האפליקציה
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        // בדוק אם הטוקן תקף
        try {
          // פענח את הטוקן כדי לבדוק את תוקפו
          const decodedToken = jwt_decode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // אם הטוקן פג תוקף, נסה לחדש אותו
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              try {
                const response = await axios.post(`${API_URL}/auth/refresh/`, {
                  refresh: refreshToken,
                });
                
                // שמור את הטוקן החדש
                localStorage.setItem('access_token', response.data.access);
                updateApiToken(response.data.access);
                setLastRefresh(new Date());
                
                // קבל מידע על המשתמש
                await fetchUserInfo();
              } catch (error) {
                // יציאה אם רענון הטוקן נכשל
                console.error('Token refresh failed during init:', error);
                handleLogout();
              }
            } else {
              // יציאה אם אין refresh token
              handleLogout();
            }
          } else {
            // אם הטוקן תקף, עדכן את API וקבל מידע על המשתמש
            updateApiToken(token);
            await fetchUserInfo();
          }
        } catch (error) {
          // טיפול בשגיאות פענוח הטוקן
          console.error('Token decode error:', error);
          handleLogout();
        }
      } else {
        // אין טוקן, המשתמש לא מחובר
        setIsLoading(false);
      }
    };

    initAuth();
  }, [fetchUserInfo, handleLogout]);

  // פונקציה לריענון מידע משתמש במידת הצורך
  const refreshUserInfo = useCallback(async () => {
    if (isAuthenticated) {
      await fetchUserInfo();
    }
  }, [isAuthenticated, fetchUserInfo]);

  // התחברות למערכת
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      const response = await axios.post(`${API_URL}/auth/login/`, {
        email,
        password,
      });
      
      // שמור את הטוקנים
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // עדכן את כותרות ה-API
      updateApiToken(response.data.access);
      
      // עדכן את מצב המשתמש
      setUser(response.data.user);
      setIsAuthenticated(true);
      setLastRefresh(new Date());
      
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'שגיאה בהתחברות. נסה שוב.';
      if (error.response && error.response.data) {
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors.join(', ');
        }
      }
      
      setAuthError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // פונקציה להחלפת סיסמה
  const changePassword = async (oldPassword, newPassword) => {
    try {
      await api.post('/users/change-password/', { 
        old_password: oldPassword, 
        new_password: newPassword 
      });
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      
      let errorMessage = 'שגיאה בהחלפת הסיסמה';
      if (error.response && error.response.data) {
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.old_password) {
          errorMessage = error.response.data.old_password[0];
        } else if (error.response.data.new_password) {
          errorMessage = error.response.data.new_password[0];
        }
      }
      
      return { success: false, message: errorMessage };
    }
  };

  // פונקציה לעדכון פרטי משתמש
  const updateUserProfile = async (userData) => {
    try {
      const response = await api.patch('/users/me/', userData);
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Update profile error:', error);
      
      let errorMessage = 'שגיאה בעדכון פרטי המשתמש';
      if (error.response && error.response.data) {
        // Extract error messages from response data
        const errors = [];
        for (const [field, messages] of Object.entries(error.response.data)) {
          if (Array.isArray(messages)) {
            errors.push(`${field}: ${messages.join(', ')}`);
          } else if (typeof messages === 'string') {
            errors.push(`${field}: ${messages}`);
          }
        }
        
        if (errors.length > 0) {
          errorMessage = errors.join('; ');
        }
      }
      
      return { success: false, message: errorMessage };
    }
  };

  // פונקציה לבדיקת תוקף הטוקן הנוכחי
  const checkTokenValidity = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    try {
      const decodedToken = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      
      // הוסף שולי ביטחון של 5 דקות
      return decodedToken.exp > (currentTime + 300);
    } catch (error) {
      console.error('Token validity check error:', error);
      return false;
    }
  }, []);

  // פונקציה לקבלת ועדכון הטוקן אם צריך
  const getValidToken = useCallback(async () => {
    // בדוק אם הטוקן נוכחי תקף
    if (checkTokenValidity()) {
      return localStorage.getItem('access_token');
    }
    
    // נסה לחדש את הטוקן
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      handleLogout();
      return null;
    }
    
    try {
      const response = await axios.post(`${API_URL}/auth/refresh/`, {
        refresh: refreshToken,
      });
      
      const newToken = response.data.access;
      localStorage.setItem('access_token', newToken);
      updateApiToken(newToken);
      setLastRefresh(new Date());
      
      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleLogout();
      return null;
    }
  }, [checkTokenValidity, handleLogout]);

  // מעקב אחר פעילות משתמש לריענון אוטומטי של הטוקן
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const refreshTime = 10 * 60 * 1000; // 10 דקות
    
    // מאזין לפעילות משתמש שמפעיל רענון טוקן
    const refreshTokenOnActivity = async () => {
      if (isAuthenticated && lastRefresh) {
        const now = new Date();
        const timeSinceLastRefresh = now - lastRefresh;
        
        // בדוק אם עברו לפחות 10 דקות מאז הרענון האחרון
        if (timeSinceLastRefresh > refreshTime && !checkTokenValidity()) {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await axios.post(`${API_URL}/auth/refresh/`, {
                refresh: refreshToken,
              });
              
              localStorage.setItem('access_token', response.data.access);
              updateApiToken(response.data.access);
              setLastRefresh(new Date());
            } catch (error) {
              console.error('Auto refresh token error:', error);
              // אם הריענון נכשל, המשתמש יצטרך להתחבר מחדש בפעם הבאה שיקבל 401
            }
          }
        }
      }
    };
    
    // הוסף מאזינים לפעילות
    events.forEach(event => document.addEventListener(event, refreshTokenOnActivity, false));
    
    // הסר מאזינים בעת ניקוי
    return () => {
      events.forEach(event => document.removeEventListener(event, refreshTokenOnActivity, false));
    };
  }, [isAuthenticated, lastRefresh, checkTokenValidity]);

  // שמירת מידע על ביקור אחרון בעמוד
  const saveLastVisited = useCallback((path) => {
    if (isAuthenticated && user) {
      localStorage.setItem('lastVisitedPath', path);
    }
  }, [isAuthenticated, user]);

  // קבלת עמוד הביקור האחרון
  const getLastVisited = useCallback(() => {
    return localStorage.getItem('lastVisitedPath') || '/';
  }, []);

  // פונקציה לקבלת התוויה של עדיפות
  const getPriorityLabel = useCallback((priority) => {
    const labels = {
      highest: 'דחוף ביותר',
      urgent: 'דחופה',
      high: 'גבוהה',
      medium: 'בינונית',
      low: 'נמוכה',
      minimal: 'זניח'
    };
    return labels[priority] || priority;
  }, []);

  // פונקציה לקבלת התוויה של סטטוס
  const getStatusLabel = useCallback((status) => {
    const labels = {
      new: 'חדש',
      in_progress: 'בטיפול',
      waiting_for_approval: 'ממתין לאישור',
      appointment_scheduled: 'תור נקבע',
      completed: 'הושלם',
      cancelled: 'בוטל',
      requires_coordination: 'דרוש תיאום',
      requires_soldier_coordination: 'תיאום עם חייל',
      waiting_for_medical_date: 'ממתין לתאריך',
      waiting_for_budget_approval: 'ממתין לאישור',
      waiting_for_doctor_referral: 'ממתין להפניה',
      no_show: 'לא הגיע'
    };
    return labels[status] || status;
  }, []);

  // פונקציות עזר לפורמט תאריכים
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '—';
    
    const days = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];
    const date = new Date(dateString);
    const dayOfWeek = days[date.getDay()];
    
    return `${dayOfWeek}, ${date.toLocaleDateString('he-IL')}`;
  }, []);
  
  const formatTime = useCallback((dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  }, []);
  
  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return '—';
    
    const days = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];
    const date = new Date(dateString);
    const dayOfWeek = days[date.getDay()];
    
    return `${dayOfWeek}, ${date.toLocaleDateString('he-IL')} ${date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
  }, []);

  // הגדר את logout כמפנה ל-handleLogout
  const logout = handleLogout;

  // ערכי הקונטקסט שנחשפים לקומפוננטים
  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    authError,
    login,
    logout,
    api,
    refreshUserInfo,
    checkTokenValidity,
    getValidToken,
    changePassword,
    updateUserProfile,
    saveLastVisited,
    getLastVisited,
    // פונקציות עזר
    getPriorityLabel,
    getStatusLabel,
    formatDate,
    formatTime,
    formatDateTime
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook לשימוש פשוט בערכי ההרשאות
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};