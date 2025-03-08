// medical-referrals/frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { createContext, useState, useEffect, useMemo } from 'react';
import { rtlCache } from './utils/rtlCache';
import { CacheProvider } from '@emotion/react';
import DoctorVisits from './pages/DoctorVisits';
import TrainingManagement from './pages/TrainingManagement';
// משתמש והרשאות
import { AuthProvider, useAuth } from './context/AuthContext';

// דפים
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReferralsPage from './pages/ReferralsPage';
import ReferralDetail from './pages/ReferralDetail';
import UserManagement from './pages/UserManagement';
import AuditLogs from './pages/AuditLogs';
import NotFound from './pages/NotFound';
import SystemSettings from './pages/SystemSettings';
import Profile from './pages/Profile';

// רכיבים משותפים
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';

// צבעים וערכת נושא
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

function App() {
  const [mode, setMode] = useState('light');
  
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('theme-mode', newMode);
          return newMode;
        });
      },
    }),
    [],
  );

  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode');
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        direction: 'rtl',
        palette: {
          mode,
          primary: {
            main: '#3f51b5',
            light: '#757de8',
            dark: '#002984',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#f50057',
            light: '#ff4081',
            dark: '#c51162',
            contrastText: '#ffffff',
          },
          error: {
            main: '#f44336',
            light: '#e57373',
            dark: '#d32f2f',
            contrastText: '#ffffff',
          },
          warning: {
            main: '#ff9800',
            light: '#ffb74d',
            dark: '#f57c00',
            contrastText: '#000000',
          },
          info: {
            main: '#2196f3',
            light: '#64b5f6',
            dark: '#1976d2',
            contrastText: '#ffffff',
          },
          success: {
            main: '#4caf50',
            light: '#81c784',
            dark: '#388e3c',
            contrastText: '#ffffff',
          },
          // הוסף גם עבור default כדי לפתור את הבעיה
          default: {
            main: '#e0e0e0',
            contrastText: '#000000',
          },
          // ודא שכל הצבעים שמשתמשים בהם ב-Chip יש להם contrastText
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
        // שאר ההגדרות כמו קודם
      }),
    [mode],
  );
  

  return (
    <CacheProvider value={rtlCache}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </Router>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </CacheProvider>
  );

}

// מרכיב הניתובים המוגנים בהרשאות
function AppRoutes() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* נתיבים ציבוריים */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      
      {/* נתיבים מוגנים */}
      <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="referrals" element={<ReferralsPage />} />
        <Route path="doctor-visits" element={<DoctorVisits />} />
        <Route path="trainings" element={<TrainingManagement />} />
        <Route path="referrals/:id" element={<ReferralDetail />} />
        <Route path="profile" element={<Profile />} />
        
        {/* נתיבים למנהלים בלבד */}
        <Route 
          path="users" 
          element={user?.role === 'admin' || user?.role === 'manager' ? <UserManagement /> : <Navigate to="/" />} 
        />
        <Route 
          path="audit-logs" 
          element={user?.role === 'admin' || user?.role === 'manager' ? <AuditLogs /> : <Navigate to="/" />} 
        />
        
        {/* נתיבים למנהלי מערכת בלבד */}
        <Route 
          path="settings" 
          element={user?.role === 'admin' ? <SystemSettings /> : <Navigate to="/" />} 
        />
      </Route>
      
      {/* נתיב 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;