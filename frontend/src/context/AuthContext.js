// medical-referrals/frontend/src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

// יצירת API מרכזי
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

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
  const navigate = useNavigate();

  // הגדרת פונקציית handleLogout לפני השימוש בה
  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    updateApiToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    navigate('/login');
  }, [navigate]);

  // האזנה לשגיאות API ולפקיעת תוקף של טוקן
  useEffect(() => {
    api.interceptors.response.use(
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
            
            // הוסף את הטוקן החדש לבקשה המקורית ושלח שוב
            originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // אם רענון הטוקן נכשל, צא מהמערכת
            handleLogout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }, [handleLogout]);

  // קבלת מידע על המשתמש מהשרת
  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await api.get('/users/me/');
      setUser(response.data);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user info:', error);
      handleLogout();
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
                
                // קבל מידע על המשתמש
                await fetchUserInfo();
              } catch (error) {
                // יציאה אם רענון הטוקן נכשל
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
          handleLogout();
        }
      } else {
        // אין טוקן, המשתמש לא מחובר
        setIsLoading(false);
      }
    };

    initAuth();
  }, [fetchUserInfo, handleLogout]);

  // התחברות למערכת
  const login = async (email, password) => {
    try {
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
      
      return { success: true };
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
      
      return { success: false, message: errorMessage };
    }
  };

  // הגדר את logout כמפנה ל-handleLogout
  const logout = handleLogout;

  // ערכי הקונטקסט שנחשפים לקומפוננטים
  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    api,
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