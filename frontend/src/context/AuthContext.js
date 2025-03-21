import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { API_BASE_URL, API_PREFIX } from '../config/api-config';

export const API_URL = `${API_BASE_URL}${API_PREFIX}`;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// שימוש במשתנה לניהול מזהה ה-interceptor
let requestInterceptorId = null;

const updateApiToken = (token) => {
  if (token) {
    console.log("Updating API token");
    // ביטול interceptor קודם אם קיים
    if (requestInterceptorId !== null) {
      api.interceptors.request.eject(requestInterceptorId);
    }
    // הוספת interceptor חדש עם הטוקן המעודכן
    requestInterceptorId = api.interceptors.request.use(
      (config) => {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, 
                    `Authorization: Bearer ${token.substring(0, 15)}...`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );
  } else {
    if (requestInterceptorId !== null) {
      api.interceptors.request.eject(requestInterceptorId);
      requestInterceptorId = null;
    }
    console.log("Cleared API token");
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

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

  // Interceptor לטיפול בתגובות API (כולל ניסיון רענון טוקן)
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
              handleLogout();
              return Promise.reject(error);
            }
            const response = await axios.post(`${API_URL}/auth/refresh/`, { refresh: refreshToken });
            localStorage.setItem('access_token', response.data.access);
            setLastRefresh(new Date());
            originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
            updateApiToken(response.data.access);
            return axios(originalRequest);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            handleLogout();
            return Promise.reject(refreshError);
          }
        }
        if (error.response) {
          const errorMessages = {
            400: 'בקשה לא תקינה, אנא בדוק את הנתונים שהוזנו',
            403: 'אין לך הרשאות לבצע פעולה זו',
            404: 'המשאב המבוקש לא נמצא',
            500: 'שגיאת שרת, אנא נסה שוב מאוחר יותר'
          };
          if (errorMessages[error.response.status]) {
            error.friendlyMessage = errorMessages[error.response.status];
          }
          if (error.response.status === 401 || error.response.status === 403) {
            setAuthError(error.friendlyMessage || 'שגיאת הרשאה');
          }
        }
        return Promise.reject(error);
      }
    );
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [handleLogout]);

  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await api.get('/users/me/');
      setUser(response.data);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      console.error('Error fetching user info:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        handleLogout();
      } else {
        setAuthError('שגיאה בקבלת מידע המשתמש');
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  // אתחול האימות – כולל בדיקת תוקף הטוקן ורענונו במידת הצורך
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decodedToken = jwt_decode(token);
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp < currentTime) {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              try {
                const response = await axios.post(`${API_URL}/auth/refresh/`, { refresh: refreshToken });
                const newToken = response.data.access;
                localStorage.setItem('access_token', newToken);
                updateApiToken(newToken);
                setLastRefresh(new Date());
                await fetchUserInfo();
                console.log("Token refreshed successfully during init");
                console.log("New token (first 15 chars):", newToken.substring(0, 15));
              } catch (error) {
                console.error('Token refresh failed during init:', error);
                handleLogout();
              }
            } else {
              handleLogout();
            }
          } else {
            console.log("Valid token found during init");
            updateApiToken(token);
            await fetchUserInfo();
          }
        } catch (error) {
          console.error('Token decode error:', error);
          handleLogout();
        }
      } else {
        console.log("No token found during init");
        setIsLoading(false);
      }
    };
    initAuth();
  }, [fetchUserInfo, handleLogout]);

  const refreshUserInfo = useCallback(async () => {
    if (isAuthenticated) await fetchUserInfo();
  }, [isAuthenticated, fetchUserInfo]);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      console.log("[Auth] Attempting login for:", email);
      const response = await axios.post(`${API_URL}/auth/login/`, { email, password });
      const token = response.data.access;
      
      // Make sure tokens are saved to localStorage
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Log token storage for debugging
      console.log("[Auth] Tokens saved to localStorage");
      console.log("[Auth] Access token:", response.data.access.substring(0, 15) + "...");
      console.log("[Auth] Refresh token exists:", !!response.data.refresh);
      
      updateApiToken(token);
      console.log("[Auth] Login successful. Token:", token.substring(0, 15) + "...");
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

  const updateUserProfile = async (userData) => {
    try {
      const response = await api.patch('/users/me/', userData);
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Update profile error:', error);
      let errorMessage = 'שגיאה בעדכון פרטי המשתמש';
      if (error.response && error.response.data) {
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

  const checkTokenValidity = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    try {
      const decodedToken = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      // הוספת מרווח ביטחון של 5 דקות
      return decodedToken.exp > (currentTime + 300);
    } catch (error) {
      console.error('Token validity check error:', error);
      return false;
    }
  }, []);

  const getValidToken = useCallback(async () => {
    if (checkTokenValidity()) return localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      handleLogout();
      return null;
    }
    try {
      const response = await axios.post(`${API_URL}/auth/refresh/`, { refresh: refreshToken });
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

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const refreshTime = 10 * 60 * 1000; // 10 דקות
    const refreshTokenOnActivity = async () => {
      if (isAuthenticated && lastRefresh) {
        const now = new Date();
        const timeSinceLastRefresh = now - lastRefresh;
        if (timeSinceLastRefresh > refreshTime && !checkTokenValidity()) {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await axios.post(`${API_URL}/auth/refresh/`, { refresh: refreshToken });
              localStorage.setItem('access_token', response.data.access);
              updateApiToken(response.data.access);
              setLastRefresh(new Date());
            } catch (error) {
              console.error('Auto refresh token error:', error);
            }
          }
        }
      }
    };
    events.forEach(event => document.addEventListener(event, refreshTokenOnActivity, false));
    return () => {
      events.forEach(event => document.removeEventListener(event, refreshTokenOnActivity, false));
    };
  }, [isAuthenticated, lastRefresh, checkTokenValidity]);

  const saveLastVisited = useCallback((path) => {
    if (isAuthenticated && user) {
      localStorage.setItem('lastVisitedPath', path);
    }
  }, [isAuthenticated, user]);

  const getLastVisited = useCallback(() => localStorage.getItem('lastVisitedPath') || '/', []);

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

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '—';
    const days = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];
    const date = new Date(dateString);
    return `${days[date.getDay()]}, ${date.toLocaleDateString('he-IL')}`;
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
    return `${days[date.getDay()]}, ${date.toLocaleDateString('he-IL')} ${date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
  }, []);

  const debugRequest = async (url, method = 'get', data = null) => {
    console.log(`[DEBUG] Sending ${method.toUpperCase()} request to: ${url}`);
    console.log(`[DEBUG] Token exists: ${!!localStorage.getItem('access_token')}`);
    try {
      let config = {
        url,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      };
      if (data) config.data = data;
      console.log('[DEBUG] Request config:', config);
      const response = await axios(config);
      console.log('[DEBUG] Response:', response.status, response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[DEBUG] Request failed:', error);
      console.error('[DEBUG] Response status:', error.response?.status);
      console.error('[DEBUG] Response data:', error.response?.data);
      return { success: false, status: error.response?.status, data: error.response?.data, error };
    }
  };

  const fetchTrainingData = async (endpoint, method = 'get', data = null) => {
    try {
      const token = await getValidToken();
      if (!token) throw new Error("No valid token available");
      const url = `${API_URL}/trainings/${endpoint}`;
      console.log(`[Training API] Calling ${method.toUpperCase()} ${url}`);
      console.log(`[Training API] Token: ${token.substring(0, 15)}...`);
      const config = {
        url,
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      };
      if (data) config.data = data;
      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`[Training API] Error in ${endpoint}:`, error);
      console.error(`[Training API] Response:`, error.response?.data);
      return { success: false, error: error.response?.data || error.message };
    }
  };

  const logout = handleLogout;

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
    getPriorityLabel,
    getStatusLabel,
    formatDate,
    formatTime,
    formatDateTime,
    debugRequest,
    fetchTrainingData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
