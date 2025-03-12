import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Backdrop,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Switch,
  Checkbox,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';

import {
  Refresh as RefreshIcon,
  Group as GroupIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  CompareArrows as CompareArrowsIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Star as StarIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  Flag as FlagIcon,
  Comment as CommentIcon,
  CalendarToday as CalendarTodayIcon,
  People as PeopleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

import * as trainingService from '../services/trainingService';

// ייבוא קומפוננטות תרגול מתיקיית components

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// API service functions
const apiService = {
  // Team Training API
  fetchTeamTrainings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/team/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team trainings:', error);
      throw error;
    }
  },
  
  createTeamTraining: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainings/team/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating team training:', error);
      throw error;
    }
  },
  
  updateTeamTraining: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/trainings/team/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating team training:', error);
      throw error;
    }
  },
  
  deleteTeamTraining: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/trainings/team/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting team training:', error);
      throw error;
    }
  },
  
  // Tourniquet Training API
  fetchSoldiers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/soldiers/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching soldiers:', error);
      throw error;
    }
  },
  
  fetchTourniquetTrainings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/tourniquet/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tourniquet trainings:', error);
      throw error;
    }
  },
  
  createTourniquetTraining: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainings/tourniquet/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating tourniquet training:', error);
      throw error;
    }
  },
  
  // Medics Training API
  fetchMedics: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/medics/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medics:', error);
      throw error;
    }
  },
  
  fetchMedicTrainings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/medic/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medic trainings:', error);
      throw error;
    }
  },
  
  createMedicTraining: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainings/medic/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating medic training:', error);
      throw error;
    }
  },
  
  updateMedicTraining: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/trainings/medic/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating medic training:', error);
      throw error;
    }
  },
  
  // Analysis API
  fetchTrainingStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching training stats:', error);
      throw error;
    }
  },
  
  fetchSoldierStats: async (soldierId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/soldiers/${soldierId}/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching soldier stats:', error);
      throw error;
    }
  }
};

// Mock data - will be replaced with actual API calls
const mockDataService = {
  teams: ['חוד', 'אתק', 'רתק', 'מפלג'],
  
  teamTrainings: [
    {
      id: 1,
      date: '2025-02-15',
      team: 'אתק',
      scenario: 'פציעות הדף',
      location: 'אזור אלפא',
      notes: 'הצוות תיפקד היטב',
      performance_rating: 4,
    },
    {
      id: 2,
      date: '2025-02-22',
      team: 'רתק',
      scenario: 'פציעות רסיסים',
      location: 'שטח אימונים',
      notes: 'נדרש תרגול נוסף בנושא חבישות',
      performance_rating: 3,
    },
    {
      id: 3,
      date: '2025-03-01',
      team: 'חוד',
      scenario: 'טיפול בפצוע רב-מערכתי',
      location: 'אזור בטא',
      notes: 'טוב מאוד',
      performance_rating: 5,
    },
    {
      id: 4,
      date: '2025-03-06',
      team: 'מפלג',
      scenario: 'טיפול בפצועים מרובים',
      location: 'אזור אימונים C',
      notes: 'ביצוע סביר, יש לשפר זמני תגובה',
      performance_rating: 3,
    },
    {
      id: 5,
      date: '2025-03-10',
      team: 'אתק',
      scenario: 'פינוי מרובה פצועים',
      location: 'שדה אימונים ראשי',
      notes: 'תיאום טוב בין אנשי הצוות',
      performance_rating: 4,
    },
  ],
  
  soldiers: [
    { id: 1, name: 'נועם עקה זוהר', team: 'חוד', personal_id: '9114251' },
    { id: 2, name: 'נהר שדמי', team: 'חוד', personal_id: '9292413' },
    { id: 3, name: 'יואב אטלן', team: 'חוד', personal_id: '9067695' },
    { id: 4, name: 'בן שטינברג', team: 'חוד', personal_id: '9180189' },
    { id: 5, name: 'יהלי חמו', team: 'חוד', personal_id: '9407190' },
    { id: 6, name: 'שמעון מימון', team: 'חוד', personal_id: '9409642' },
    { id: 7, name: "יונתן ג'יימס", team: 'חוד', personal_id: '9383684' },
    { id: 8, name: 'בן ואקנין', team: 'חוד', personal_id: '9271688' },
    { id: 9, name: 'דניאל רז', team: 'מפלג', personal_id: '9148536' },
    // ...other soldiers from original code
  ],
  
  tourniquetTrainings: [
    { id: 1, soldier_id: 1, training_date: '2025-02-05', cat_time: '28', passed: true, notes: '' },
    { id: 2, soldier_id: 2, training_date: '2025-02-07', cat_time: '25', passed: true, notes: '' },
    { id: 3, soldier_id: 3, training_date: '2025-02-10', cat_time: '45', passed: false, notes: 'צריך תרגול נוסף, זמן הנחה ארוך מדי' },
    { id: 4, soldier_id: 4, training_date: '2025-02-15', cat_time: '23', passed: true, notes: '' },
    { id: 5, soldier_id: 7, training_date: '2025-02-20', cat_time: '30', passed: true, notes: '' },
    { id: 6, soldier_id: 1, training_date: '2025-03-05', cat_time: '22', passed: true, notes: 'שיפור ניכר בזמן ההנחה' },
  ],
  
  medics: [
    { id: 1, name: 'דן לוי', team: 'אתק', role: 'חובש פלוגתי', experience: 'מתקדם' },
    { id: 2, name: 'עידן כהן', team: 'רתק', role: 'חובש פלוגתי', experience: 'מתחיל' },
    { id: 3, name: 'אורי אלון', team: 'חוד', role: 'חובש פלוגתי', experience: 'בכיר' },
    { id: 4, name: 'יובל ישראלי', team: 'מפלג', role: 'חובש גדודי', experience: 'בכיר' },
    { id: 5, name: 'אוהד נמרי', team: 'אתק', role: 'חובש פלוגתי', experience: 'מתקדם' },
    { id: 6, name: 'רועי בן חיים', team: 'חוד', role: 'חובש פלוגתי', experience: 'מתחיל' },
  ],
  
  medicTrainings: [
    { 
      id: 1, 
      medic_id: 1, 
      training_date: '2025-02-10', 
      training_type: 'החייאה', 
      performance_rating: 4, 
      attendance: true, 
      notes: 'ביצוע טוב של פרוטוקול החייאה', 
      recommendations: 'לתרגל תקשורת בעת החייאה'
    },
    { 
      id: 2, 
      medic_id: 2, 
      training_date: '2025-02-15', 
      training_type: 'עצירת דימומים', 
      performance_rating: 3, 
      attendance: true, 
      notes: 'הנחת חוסם עורקים בזמן סביר', 
      recommendations: 'נדרש שיפור בטכניקת חבישות לחץ'
    },
    { 
      id: 3, 
      medic_id: 3, 
      training_date: '2025-02-20', 
      training_type: 'פינוי נפגעים', 
      performance_rating: 5, 
      attendance: true, 
      notes: 'ביצוע מצוין של תרגול פינוי', 
      recommendations: 'להמשיך באותה רמה'
    },
  ],
  
  // Mock data for training statistics
  trainingStats: {
    tourniquetStats: {
      totalTrainings: 342,
      averageTime: 28.5,
      passRate: 87.2,
      teamPerformance: {
        'חוד': { avg: 24.3, passRate: 92.1 },
        'אתק': { avg: 27.8, passRate: 88.4 },
        'רתק': { avg: 30.1, passRate: 85.2 },
        'מפלג': { avg: 32.7, passRate: 82.5 }
      },
      monthlyProgress: [
        { month: '10/2024', avg: 33.2, passRate: 79.5 },
        { month: '11/2024', avg: 31.8, passRate: 81.2 },
        { month: '12/2024', avg: 30.4, passRate: 83.7 },
        { month: '01/2025', avg: 29.6, passRate: 85.1 },
        { month: '02/2025', avg: 28.5, passRate: 87.2 },
      ]
    },
    medicStats: {
      totalTrainings: 124,
      averageRating: 3.8,
      byTrainingType: {
        'החייאה': { count: 32, avg: 3.9 },
        'עצירת דימומים': { count: 28, avg: 4.1 },
        'החדרת נתיב אוויר': { count: 18, avg: 3.7 },
        'פינוי נפגעים': { count: 22, avg: 3.6 },
        'טיפול בהלם': { count: 24, avg: 3.9 }
      }
    },
    teamStats: {
      totalTrainings: 48,
      averageRating: 3.7,
      teamPerformance: {
        'חוד': { count: 14, avg: 4.1 },
        'אתק': { count: 12, avg: 3.8 },
        'רתק': { count: 12, avg: 3.5 },
        'מפלג': { count: 10, avg: 3.4 }
      }
    }
  }
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL');
};

// Helper function for current month/year
const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth(),
    year: now.getFullYear()
  };
};

// Main component
const TrainingManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ 
      pb: 5, 
      background: 'linear-gradient(to bottom, rgba(240,245,250,1) 0%, rgba(255,255,255,1) 100%)',
      minHeight: '100vh'
    }}>
      <Paper 
        elevation={0}
        sx={{ 
          mb: 3, 
          p: 2, 
          borderRadius: 2,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center', 
          mb: 2,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            ניהול אימונים ותרגולים
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              רענן נתונים
            </Button>
          </Box>
        </Box>

        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ 
            mb: 2,
            '& .MuiTab-root': {
              fontSize: '1rem',
              fontWeight: 'medium',
              px: 3
            }
          }}
        >
          <Tab icon={<GroupIcon sx={{ mr: 1 }} />} iconPosition="start" label="אר״ן צוותי" />
          <Tab icon={<AccessTimeIcon sx={{ mr: 1 }} />} iconPosition="start" label="תרגול מחצ״ים" />
          <Tab icon={<PersonIcon sx={{ mr: 1 }} />} iconPosition="start" label="תרגול חובשים" />
          <Tab icon={<BarChartIcon sx={{ mr: 1 }} />} iconPosition="start" label="ניתוח ומעקב" />
        </Tabs>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => setError(null)}>
              נסה שוב
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {activeTab === 0 && <TeamTraining showNotification={showNotification} />}
      {activeTab === 1 && <TourniquetTraining showNotification={showNotification} />}
      {activeTab === 2 && <MedicsTraining showNotification={showNotification} />}
      {activeTab === 3 && <TrainingAnalysis showNotification={showNotification} />}
      

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%', borderRadius: 2 }}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// רכיב תרגול אר"ן צוותי
const TeamTraining = ({ showNotification }) => {
  const [trainings, setTrainings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState('');

  const [formData, setFormData] = useState({
    date: '',
    team: '',
    scenario: '',
    location: '',
    notes: '',
    performance_rating: 3,
  });
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ניסיון להביא נתונים מהשרת
        let teamsData, trainingsData;
        
        try {
          // בדיקת חיבור לשרת והבאת נתונים
          teamsData = await trainingService.getTeams();
          trainingsData = await trainingService.getTeamTrainings();
          console.log('נתוני צוותים התקבלו מהשרת:', { teamsData, trainingsData });
        } catch (apiError) {
          console.error('שגיאה בטעינת נתונים מהשרת:', apiError);
          // במקרה של שגיאת API, השתמש בנתוני מוק מקומיים
          teamsData = mockDataService.teams;
          trainingsData = mockDataService.teamTrainings;
          showNotification('לא ניתן להתחבר לשרת. מציג נתונים מקומיים.', 'warning');
        }
        
        // עדכון מצב הקומפוננטה עם הנתונים שהתקבלו
        setTeams(teamsData);
        setTrainings(trainingsData);
      } catch (err) {
        console.error('שגיאה חמורה בטעינת נתונים:', err);
        showNotification('שגיאה בטעינת נתונים', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [showNotification]); // הוספת showNotification לתלויות

  const handleAddTraining = () => {
    setSelectedTraining(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      team: '',
      scenario: '',
      location: '',
      notes: '',
      performance_rating: 3,
    });
    setOpenForm(true);
  };

  const handleEditTraining = (training) => {
    setSelectedTraining(training);
    setFormData({
      date: training.date,
      team: training.team,
      scenario: training.scenario,
      location: training.location,
      notes: training.notes,
      performance_rating: training.performance_rating,
    });
    setOpenForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveTraining = async () => {
    try {
      setLoading(true);
      // Save to API
      await trainingService.createMedicTraining(formData);
      
      // Refresh data from API
      await fetchData();
      
      setOpenForm(false);
      showNotification('נתוני התרגול נשמרו בהצלחה', 'success');
    } catch (error) {
      console.error('Error saving training:', error);
      // More specific error handling
      if (error.response && error.response.status === 401) {
        showNotification('אין הרשאת גישה. נא להתחבר מחדש', 'error');
      } else if (error.response && error.response.status === 400) {
        showNotification('נתונים שגויים. אנא בדוק את הפרטים שהזנת', 'error');
      } else {
        trainingService.handleApiError(error, showNotification);
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleDeleteTraining = async (id) => {
    try {
      // In a real implementation, we would delete via the API
      // await apiService.deleteTeamTraining(id);
      
      // For now, updating local state
      const updatedTrainings = trainings.filter((training) => training.id !== id);
      setTrainings(updatedTrainings);
      showNotification('התרגיל נמחק בהצלחה', 'info');
    } catch (error) {
      console.error('Error deleting training:', error);
      showNotification('שגיאה במחיקת התרגיל', 'error');
    }
  };

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = searchQuery === '' || 
      training.scenario.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.notes.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTeam = filterTeam === '' || training.team === filterTeam;
    
    return matchesSearch && matchesTeam;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          תרגילי אר"ן צוותיים
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={handleAddTraining}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 6px 10px rgba(0,0,0,0.2)',
            }
          }}
        >
          תרגיל חדש
        </Button>
      </Box>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={8}>
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 1,
              flexWrap: { xs: 'wrap', md: 'nowrap' } 
            }}
          >
            <TextField
              placeholder="חפש לפי תרחיש או מיקום"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                bgcolor: 'white', 
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <FormControl 
              variant="outlined" 
              size="small" 
              sx={{ 
                minWidth: 120,
                bgcolor: 'white', 
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              <InputLabel id="team-filter-label">סינון לפי צוות</InputLabel>
              <Select
                labelId="team-filter-label"
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                label="סינון לפי צוות"
              >
                <MenuItem value="">הכל</MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team} value={team}>
                    {team}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="אפס סינון">
              <IconButton 
                onClick={() => {
                  setSearchQuery('');
                  setFilterTeam('');
                }}
                sx={{ 
                  bgcolor: 'white',
                  '&:hover': { bgcolor: '#f5f5f5' } 
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={2}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box p={0.5} bgcolor="#f5f5f5" borderBottom="1px solid #e0e0e0">
              <Typography variant="subtitle2" sx={{ p: 1.5, fontWeight: 'bold' }}>
                רשימת תרגילים {filteredTrainings.length > 0 && `(${filteredTrainings.length})`}
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>שם</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>מספר אישי</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>צוות</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>תרגול אחרון</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>זמן CAT</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>סטטוס</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>פעולות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Table content remains the same */}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            elevation={2} 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2
            }}
          >
            <CardHeader 
              title="סיכום תרגילים" 
              titleTypographyProps={{ fontWeight: 'bold' }}
              sx={{ 
                bgcolor: '#f5f5f5', 
                borderBottom: '1px solid #e0e0e0',
                p: 2
              }}
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <List sx={{ mb: 2 }}>
                {teams.map((team) => {
                  const teamTrainings = trainings.filter((t) => t.team === team);
                  const count = teamTrainings.length;
                  const avgRating = count > 0 ? teamTrainings.reduce((sum, t) => sum + t.performance_rating, 0) / count : 0;
                  const bgColor = team === 'אתק' ? '#bbdefb' :
                                 team === 'רתק' ? '#c8e6c9' :
                                 team === 'חוד' ? '#ffe0b2' : '#e1bee7';
                  
                  return (
                    <ListItem 
                      key={team} 
                      sx={{ 
                        mb: 1, 
                        borderRadius: 2,
                        bgcolor: 'white',
                        border: '1px solid #eee',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            bgcolor: bgColor,
                            color: 'rgba(0, 0, 0, 0.7)',
                            fontWeight: 'bold'
                          }}
                        >
                          {team.charAt(0)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                      primary={`צוות ${team}`} 
                      secondary={`${count} תרגילים`}
                      primaryTypographyProps={{ fontWeight: 'bold', component: 'span' }}
                      secondaryTypographyProps={{ component: 'span' }}
                    />
                      {count > 0 && (
                        <Box display="flex" alignItems="center">
                          <Rating 
                            value={avgRating} 
                            precision={0.5} 
                            readOnly 
                            size="small" 
                            sx={{
                              '& .MuiRating-iconFilled': {
                                color: avgRating >= 4 ? 'success.main' : 
                                       avgRating >= 3 ? 'warning.main' : 'error.main',
                              }
                            }}
                          />
                        </Box>
                      )}
                    </ListItem>
                  );
                })}
              </List>
              <Divider sx={{ my: 2 }} />
              <Box 
                textAlign="center" 
                mt="auto" 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'primary.light', 
                  color: 'primary.contrastText' 
                }}
              >
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  סה"כ תרגילים שבוצעו
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {trainings.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            p: 2
          }}
        >
          <Box display="flex" alignItems="center">
            {selectedTraining ? (
              <EditIcon sx={{ mr:.5 }} />
            ) : (
              <AddIcon sx={{ mr: .5 }} />
            )}
            <Typography variant="h6">
              {selectedTraining ? 'עריכת תרגיל' : 'הוספת תרגיל חדש'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="date"
                label="תאריך"
                type="date"
                fullWidth
                required
                value={formData.date}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>צוות</InputLabel>
                <Select 
                  name="team" 
                  value={formData.team} 
                  onChange={handleFormChange} 
                  label="צוות"
                  startAdornment={
                    <InputAdornment position="start">
                      <GroupIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="" disabled>בחר צוות</MenuItem>
                  {teams.map((team) => (
                    <MenuItem key={team} value={team}>
                      {team}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="scenario"
                label="תרחיש"
                fullWidth
                required
                value={formData.scenario}
                onChange={handleFormChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AssignmentIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="location"
                label="מיקום"
                fullWidth
                value={formData.location}
                onChange={handleFormChange}
                placeholder="הזן את מיקום התרגיל"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FlagIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="הערות"
                fullWidth
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="הערות נוספות לגבי התרגיל"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CommentIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(0,0,0,0.23)', borderRadius: 1, p: 2 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  דירוג ביצוע:
                </Typography>
                <Rating
                  name="performance_rating"
                  value={Number(formData.performance_rating)}
                  onChange={(event, newValue) =>
                    setFormData({ ...formData, performance_rating: newValue })
                  }
                  size="large"
                  sx={{
                    '& .MuiRating-iconFilled': {
                      color: formData.performance_rating >= 4 ? 'success.main' : 
                             formData.performance_rating >= 3 ? 'warning.main' : 'error.main',
                    }
                  }}
                />
                <Box sx={{ ml: 2, minWidth: '24px' }}>
                  <Typography variant="body2" color="text.secondary">
                    {formData.performance_rating}/5
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={() => setOpenForm(false)}
            variant="outlined"
            startIcon={<CloseIcon />}
          >
            ביטול
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveTraining}
            startIcon={<SaveIcon />}
          >
            {selectedTraining ? 'עדכן' : 'הוסף'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// רכיב תרגול מחצ"ים (חסמי עורקים)
const TourniquetTraining = ({ showNotification }) => {
  const [trainings, setTrainings] = useState([]);
  const [soldiers, setSoldiers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openGroupTrainingForm, setOpenGroupTrainingForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedSoldiers, setSelectedSoldiers] = useState([]);
  const [filterTeam, setFilterTeam] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [openSoldierDetails, setOpenSoldierDetails] = useState(false);
  const [selectedSoldier, setSelectedSoldier] = useState(null);
  
  // מידע בסיסי לאימון קבוצתי
  const [groupFormData, setGroupFormData] = useState({
    training_date: new Date().toISOString().split('T')[0],
    team: '',
    general_notes: ''
  });
  
  // מידע ספציפי לחייל
  const [soldierTrainingData, setSoldierTrainingData] = useState({});
  
  // מידע על חייל בודד
  const [formData, setFormData] = useState({
    soldier_id: '',
    training_date: '',
    cat_time: '',
    passed: true,
    notes: '',
  });

  

  const getSoldierTrainings = (soldierId) => trainings.filter((t) => t.soldier_id === soldierId);

  const isTrainedThisMonth = (soldierId) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return trainings.some((t) => {
      const trainingDate = new Date(t.training_date);
      return (
        t.soldier_id === soldierId &&
        trainingDate.getMonth() === currentMonth &&
        trainingDate.getFullYear() === currentYear
      );
    });
  };

  const handleAddTraining = (soldier) => {
    setFormData({
      soldier_id: soldier.id,
      training_date: new Date().toISOString().split('T')[0],
      cat_time: '',
      passed: true,
      notes: '',
    });
    setOpenForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSaveTraining = async () => {
    try {
      setLoading(true); // מציג אינדיקטור טעינה
      
      console.log('שולח נתונים לשרת:', formData); // לוג לצורכי דיבוג
      
      // שימוש בשירות ה-API לשליחת הנתונים לשרת
      const response = await trainingService.createTourniquetTraining(formData);
      
      // בדיקה אם התקבלה תשובה תקינה מהשרת
      if (response && response.data) {
        // עדכון מצב הקומפוננטה עם הנתונים שהתקבלו מהשרת
        setTrainings(prevTrainings => [...prevTrainings, response.data]);
        setOpenForm(false); // סגירת הטופס
        showNotification('התרגול נשמר בהצלחה', 'success');
      } else {
        throw new Error('תגובה לא תקינה מהשרת');
      }
    } catch (error) {
      console.error('שגיאה בשמירת התרגול:', error);
      
      // הצגת הודעת שגיאה ספציפית יותר למשתמש
      const errorMessage = error.response?.data?.detail || error.message || 'אירעה שגיאה לא ידועה';
      showNotification(`שגיאה בשמירת התרגול: ${errorMessage}`, 'error');
      
      // כמטפל יחיד במקרה של חיבור שרת לא תקין, ניתן להוסיף טיפול במקרה של שגיאת רשת
      if (error.message === 'Network Error') {
        console.log('מנסה לשמור נתונים מקומית בינתיים');
        // שמירה מקומית זמנית עד שיתאפשר שוב חיבור לשרת
        const newTraining = {
          id: Math.max(0, ...trainings.map((t) => t.id)) + 1,
          ...formData,
          _pending: true // סימון שהנתונים ממתינים לסנכרון עם השרת
        };
        setTrainings([...trainings, newTraining]);
        setOpenForm(false);
        showNotification('הנתונים נשמרו מקומית. יסונכרנו עם השרת בהתחברות הבאה.', 'warning');
      }
    } finally {
      setLoading(false); // הפסקת אינדיקטור טעינה בכל מקרה
    }
  };
  
  // פתיחת טופס תרגול קבוצתי
  const handleOpenGroupTraining = () => {
    setGroupFormData({
      training_date: new Date().toISOString().split('T')[0],
      team: '',
      general_notes: ''
    });
    setSoldierTrainingData({});
    setSelectedTeam('');
    setSelectedSoldiers([]);
    setActiveStep(0);
    setOpenGroupTrainingForm(true);
  };
  
  // טיפול בשינוי בטופס הקבוצתי
  const handleGroupFormChange = (e) => {
    const { name, value } = e.target;
    setGroupFormData({ ...groupFormData, [name]: value });
    
    if (name === 'team') {
      setSelectedTeam(value);
      setSelectedSoldiers([]);
    }
  };
  
  // סיום שלב 1 - מעבר לבחירת חיילים
  const handleNextToSelectSoldiers = () => {
    if (!groupFormData.team || !groupFormData.training_date) {
      showNotification('אנא בחר צוות ותאריך', 'error');
      return;
    }
    setActiveStep(1);
  };
  
  // טיפול בבחירת חיילים
  const handleSelectSoldier = (soldier) => {
    if (selectedSoldiers.includes(soldier.id)) {
      setSelectedSoldiers(selectedSoldiers.filter(id => id !== soldier.id));
    } else {
      setSelectedSoldiers([...selectedSoldiers, soldier.id]);
    }
  };
  
  // סיום שלב 2 - מעבר להזנת נתונים
  const handleNextToEnterData = () => {
    if (selectedSoldiers.length === 0) {
      showNotification('אנא בחר לפחות חייל אחד', 'error');
      return;
    }
    
    // יצירת אובייקט עם נתונים ריקים לכל חייל שנבחר
    const initialData = {};
    selectedSoldiers.forEach(soldierId => {
      initialData[soldierId] = {
        cat_time: '',
        passed: true,
        notes: ''
      };
    });
    
    setSoldierTrainingData(initialData);
    setActiveStep(2);
  };
  
  // עדכון נתוני חייל ספציפי
  const handleSoldierDataChange = (soldierId, field, value) => {
    setSoldierTrainingData(prev => ({
      ...prev,
      [soldierId]: {
        ...prev[soldierId],
        [field]: field === 'passed' ? value : value
      }
    }));
  };
  
  // שמירת נתוני התרגול הקבוצתי
  const handleSaveGroupTraining = async () => {
    // בדיקה שהוזנו זמני CAT לכל החיילים
    const missingData = selectedSoldiers.some(id => !soldierTrainingData[id].cat_time);
    
    if (missingData) {
      showNotification('נא להזין זמן הנחת CAT עבור כל החיילים', 'error');
      return;
    }
    
    try {
      // יצירת רשומות אימון לכל אחד מהחיילים
      const newTrainings = selectedSoldiers.map(soldierId => ({
        id: Math.max(0, ...trainings.map(t => t.id)) + 1 + selectedSoldiers.indexOf(soldierId),
        soldier_id: soldierId,
        training_date: groupFormData.training_date,
        cat_time: soldierTrainingData[soldierId].cat_time,
        passed: soldierTrainingData[soldierId].passed,
        notes: soldierTrainingData[soldierId].notes || groupFormData.general_notes
      }));
      
      // In a real implementation, we would save to the API
      // await Promise.all(newTrainings.map(training => apiService.createTourniquetTraining(training)));
      
      // For now, updating local state
      setTrainings([...trainings, ...newTrainings]);
      setOpenGroupTrainingForm(false);
      showNotification(`נשמרו נתוני תרגול עבור ${selectedSoldiers.length} חיילים`, 'success');
    } catch (error) {
      console.error('Error saving group training:', error);
      showNotification('שגיאה בשמירת נתוני התרגול', 'error');
    }
  };

  const filteredSoldiers = soldiers.filter(soldier => {
    const matchesTeam = filterTeam ? soldier.team === filterTeam : true;
    const matchesSearch = searchQuery === '' || 
      soldier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      soldier.personal_id.includes(searchQuery);
    
    return matchesTeam && matchesSearch;
  });
  
  // קבלת רשימת חיילים שלא תורגלו החודש
  const getUntrained = () => {
    return soldiers.filter(soldier => !isTrainedThisMonth(soldier.id));
  };

  // פתיחת פרטי חייל ספציפי
  const handleOpenSoldierDetails = (soldier) => {
    setSelectedSoldier(soldier);
    setOpenSoldierDetails(true);
  };

  // חישוב ממוצע זמן הנחת חסם עורקים לחייל
  const calculateAverageCatTime = (soldierId) => {
    const soldierTrainings = getSoldierTrainings(soldierId);
    if (soldierTrainings.length === 0) return 0;
    
    const totalTime = soldierTrainings.reduce((sum, t) => sum + parseInt(t.cat_time || 0), 0);
    return (totalTime / soldierTrainings.length).toFixed(1);
  };

  // חישוב אחוז הצלחה לחייל
  const calculatePassRate = (soldierId) => {
    const soldierTrainings = getSoldierTrainings(soldierId);
    if (soldierTrainings.length === 0) return 0;
    
    const passedCount = soldierTrainings.filter(t => t.passed).length;
    return ((passedCount / soldierTrainings.length) * 100).toFixed(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          תרגול מחצ"ים - חסמי עורקים (CAT)
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<GroupIcon />} 
            onClick={handleOpenGroupTraining}
            sx={{ 
              mr: 1,
              borderRadius: 2, 
              textTransform: 'none',
            }}
          >
            תרגול קבוצתי
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setFilterTeam('')}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 10px rgba(0,0,0,0.2)',
              }
            }}
          >
            תרגול חדש
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={8}>
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 1,
              flexWrap: { xs: 'wrap', md: 'nowrap' } 
            }}
          >
            <TextField
              placeholder="חפש לפי שם או מספר אישי"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                bgcolor: 'white', 
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <FormControl 
              variant="outlined" 
              size="small" 
              sx={{ 
                minWidth: 120,
                bgcolor: 'white', 
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              <InputLabel id="team-filter-label">סינון לפי צוות</InputLabel>
              <Select
                labelId="team-filter-label"
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                label="סינון לפי צוות"
              >
                <MenuItem value="">הכל</MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team} value={team}>
                    {team}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="אפס סינון">
              <IconButton 
                onClick={() => {
                  setSearchQuery('');
                  setFilterTeam('');
                }}
                sx={{ 
                  bgcolor: 'white',
                  '&:hover': { bgcolor: '#f5f5f5' } 
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={2}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              mb: 3
            }}
          >
            <Box p={0.5} bgcolor="#f5f5f5" borderBottom="1px solid #e0e0e0" display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" sx={{ p: 1.5, fontWeight: 'bold' }}>
                רשימת חיילים {filteredSoldiers.length > 0 && `(${filteredSoldiers.length})`}
              </Typography>
              <Box pr={1}>
                <Chip 
                  icon={<WarningIcon fontSize="small" />} 
                  label={`${getUntrained().length} לא תורגלו החודש`} 
                  color="warning" 
                  size="small"
                  sx={{ fontWeight: 'medium' }} 
                />
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>שם</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>מספר אישי</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>צוות</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>תרגול אחרון</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>זמן CAT</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>סטטוס</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>פעולות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSoldiers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <WarningIcon sx={{ color: 'text.secondary', fontSize: 40 }} />
                          <Typography sx={{ color: 'text.secondary' }}>לא נמצאו חיילים</Typography>
                          {searchQuery || filterTeam ? (
                            <Button 
                              variant="outlined" 
                              size="small" 
                              startIcon={<RefreshIcon />}
                              onClick={() => {
                                setSearchQuery('');
                                setFilterTeam('');
                              }}
                              sx={{ mt: 1 }}
                            >
                              אפס סינון
                            </Button>
                          ) : null}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSoldiers.map((soldier) => {
                      const soldierTrainings = getSoldierTrainings(soldier.id);
                      const lastTraining =
                        soldierTrainings.length > 0
                          ? soldierTrainings.sort((a, b) => new Date(b.training_date) - new Date(a.training_date))[0]
                          : null;
                      const trainedThisMonth = isTrainedThisMonth(soldier.id);
                      return (
                        <TableRow
                          key={soldier.id}
                          hover
                          onClick={() => handleOpenSoldierDetails(soldier)}
                          sx={{ 
                            bgcolor: !trainedThisMonth ? 'rgba(255, 152, 0, 0.08)' : 'inherit',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: !trainedThisMonth ? 'rgba(255, 152, 0, 0.12)' : 'rgba(25, 118, 210, 0.04)',
                            }
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  mr: 1, 
                                  fontSize: '0.9rem',
                                  bgcolor: !trainedThisMonth ? 'warning.light' : 
                                           soldier.team === 'אתק' ? '#bbdefb' :
                                           soldier.team === 'רתק' ? '#c8e6c9' :
                                           soldier.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                                  color: 'rgba(0, 0, 0, 0.7)',
                                }}
                              >
                                {soldier.name.charAt(0)}
                              </Avatar>
                              {soldier.name}
                            </Box>
                          </TableCell>
                          <TableCell>{soldier.personal_id}</TableCell>
                          <TableCell>
                            <Chip 
                              label={soldier.team} 
                              size="small" 
                              sx={{ 
                                bgcolor: soldier.team === 'אתק' ? '#bbdefb' :
                                        soldier.team === 'רתק' ? '#c8e6c9' :
                                        soldier.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                                color: 'rgba(0, 0, 0, 0.7)',
                                fontWeight: 'bold',
                                '& .MuiChip-label': { px: 1 }
                              }} 
                            />
                          </TableCell>
                          <TableCell>
                            {lastTraining ? (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {formatDate(lastTraining.training_date)}
                                {!lastTraining.passed && (
                                  <Chip label="נכשל" color="error" size="small" sx={{ ml: 1 }} />
                                )}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                לא תורגל
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {lastTraining ? (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                <Typography 
                                  sx={{ 
                                    fontWeight: 'medium',
                                    color: parseInt(lastTraining.cat_time) > 35 ? 'error.main' : 
                                           parseInt(lastTraining.cat_time) > 25 ? 'warning.main' : 'success.main'
                                  }}
                                >
                                  {lastTraining.cat_time} שניות
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                אין נתונים
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={trainedThisMonth ? <CheckIcon /> : <CloseIcon />}
                              label={trainedThisMonth ? 'בוצע החודש' : 'לא בוצע החודש'}
                              color={trainedThisMonth ? 'success' : 'error'}
                              variant={trainedThisMonth ? 'filled' : 'outlined'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddTraining(soldier);
                              }}
                              startIcon={<AddIcon />}
                              sx={{ borderRadius: 2 }}
                            >
                              תרגול חדש
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          
          {/* רשימת חיילים שלא תורגלו */}
          <Paper 
            elevation={2}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              mb: 3
            }}
          >
            <Box p={0.5} bgcolor="#ffebee" borderBottom="1px solid #ffcdd2">
              <Typography variant="subtitle2" sx={{ p: 1.5, fontWeight: 'bold', color: 'error.main', display: 'flex', alignItems: 'center' }}>
                <ErrorIcon sx={{ mr: 1 }} /> חיילים שלא ביצעו תרגול החודש ({getUntrained().length})
              </Typography>
            </Box>
            {getUntrained().length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="success.main" variant="body1" sx={{ fontWeight: 'medium' }}>
                  כל החיילים ביצעו תרגול החודש! 👍
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 2 }}>
                <Grid container spacing={1}>
                  {getUntrained().map(soldier => (
                    <Grid item xs={12} sm={6} md={4} key={soldier.id}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center', 
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(255, 152, 0, 0.05)',
                          borderColor: 'rgba(255, 152, 0, 0.2)',
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          }
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            bgcolor: 'warning.light', 
                            color: 'warning.contrastText',
                            width: 32,
                            height: 32,
                            fontSize: '0.9rem',
                            mr: 1
                          }}
                        >
                          {soldier.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ mr: 'auto' }}>
                          <Typography variant="body2" fontWeight="medium">{soldier.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{soldier.team}</Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="text"
                          color="warning"
                          onClick={() => handleAddTraining(soldier)}
                          sx={{ minWidth: 0, p: 1 }}
                        >
                          <AddIcon fontSize="small" />
                        </Button>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grid container spacing={3} direction="column">
            <Grid item>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <CardHeader 
                  title="סטטיסטיקת תרגול לפי צוות" 
                  titleTypographyProps={{ fontWeight: 'bold' }}
                  sx={{ 
                    bgcolor: '#f5f5f5', 
                    borderBottom: '1px solid #e0e0e0',
                    p: 2
                  }}
                />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>צוות</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>מספר חיילים</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>תורגלו החודש</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>אחוז</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teams.map((team) => {
                          const teamSoldiers = soldiers.filter((s) => s.team === team);
                          const trainedCount = teamSoldiers.filter((s) => isTrainedThisMonth(s.id)).length;
                          const percentage =
                            teamSoldiers.length > 0 ? Math.round((trainedCount / teamSoldiers.length) * 100) : 0;
                          return (
                            <TableRow 
                              key={team}
                              hover
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                              }}
                              onClick={() => setFilterTeam(team)}
                            >
                              <TableCell>
                                <Chip 
                                  label={team} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: team === 'אתק' ? '#bbdefb' :
                                    team === 'רתק' ? '#c8e6c9' :
                                    team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                                    color: 'rgba(0, 0, 0, 0.7)',
                                    fontWeight: 'bold',
                                    '& .MuiChip-label': { px: 1 }
                                  }}
                                />
                              </TableCell>
                              <TableCell>{teamSoldiers.length}</TableCell>
                              <TableCell>{trainedCount}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box 
                                    sx={{ 
                                      width: '50px',
                                      height: '6px',
                                      borderRadius: '3px',
                                      mr: 1,
                                      bgcolor: percentage >= 80 ? 'success.light' : 
                                              percentage >= 50 ? 'warning.light' : 'error.light',
                                    }}
                                  >
                                    <Box 
                                      sx={{ 
                                        width: `${percentage}%`,
                                        height: '100%',
                                        borderRadius: '3px',
                                        bgcolor: percentage >= 80 ? 'success.main' : 
                                                percentage >= 50 ? 'warning.main' : 'error.main',
                                      }}
                                    />
                                  </Box>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontWeight: 'medium',
                                      color: percentage >= 80 ? 'success.main' : 
                                            percentage >= 50 ? 'warning.main' : 'error.main'
                                    }}
                                  >
                                    {percentage}%
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <CardHeader 
                  title="סיכום חודשי" 
                  titleTypographyProps={{ fontWeight: 'bold' }}
                  sx={{ 
                    bgcolor: '#f5f5f5', 
                    borderBottom: '1px solid #e0e0e0',
                    p: 2
                  }}
                />
                <CardContent>
                  <Box textAlign="center" mb={3}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      סך כל החיילים
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                      {soldiers.length}
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={6}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            bgcolor: 'success.light', 
                            color: 'success.dark',
                            borderRadius: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="body2" fontWeight="medium">
                            תורגלו החודש
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {soldiers.filter((s) => isTrainedThisMonth(s.id)).length}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            bgcolor: 'error.light', 
                            color: 'error.dark',
                            borderRadius: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="body2" fontWeight="medium">
                            לא תורגלו החודש
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {soldiers.filter((s) => !isTrainedThisMonth(s.id)).length}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 3 }} />
                    <Box>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        אחוז ביצוע חודשי
                      </Typography>
                      <Box sx={{ position: 'relative', display: 'inline-block', width: '150px', height: '150px' }}>
                        <CircularProgress
                          variant="determinate"
                          value={100}
                          size={150}
                          thickness={5}
                          sx={{ color: 'grey.200', position: 'absolute', top: 0, left: 0 }}
                        />
                        <CircularProgress
                          variant="determinate"
                          value={Math.round((soldiers.filter((s) => isTrainedThisMonth(s.id)).length / soldiers.length) * 100)}
                          size={150}
                          thickness={5}
                          sx={{ 
                            color: 
                              Math.round((soldiers.filter((s) => isTrainedThisMonth(s.id)).length / soldiers.length) * 100) >= 80 ? 'success.main' : 
                              Math.round((soldiers.filter((s) => isTrainedThisMonth(s.id)).length / soldiers.length) * 100) >= 50 ? 'warning.main' : 'error.main',
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography
                            variant="h4"
                            component="div"
                            color="text.primary"
                            fontWeight="bold"
                          >
                            {Math.round((soldiers.filter((s) => isTrainedThisMonth(s.id)).length / soldiers.length) * 100)}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* טופס לתרגול של חייל בודד */}
      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            p: 2
          }}
        >
          <Box display="flex" alignItems="center">
            <AddIcon sx={{ mr:.5 }} />
            <Typography variant="h6">
              תרגול חדש - {soldiers.find(s => s.id === formData.soldier_id)?.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="training_date"
                label="תאריך תרגול"
                type="date"
                fullWidth
                required
                value={formData.training_date}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="cat_time"
                label="זמן הנחת חסם עורקים (שניות)"
                type="number"
                fullWidth
                required
                value={formData.cat_time}
                onChange={handleFormChange}
                placeholder="הזן זמן בשניות"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      שניות
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Box 
                  sx={{ 
                    border: '1px solid rgba(0, 0, 0, 0.23)',
                    borderRadius: 1,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      תוצאה:
                    </Typography>
                    <Chip 
                      label={formData.passed ? "עבר" : "נכשל"} 
                      color={formData.passed ? "success" : "error"}
                      variant="filled"
                      sx={{ mr: 2 }}
                    />
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.passed}
                        onChange={(e) => setFormData({ ...formData, passed: e.target.checked })}
                        color="success"
                      />
                    }
                    label=""
                  />
                </Box>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="הערות"
                fullWidth
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="הוסף הערות לגבי ביצוע התרגול, דגשים לשיפור וכדומה"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={() => setOpenForm(false)}
            variant="outlined"
            startIcon={<CloseIcon />}
          >
            ביטול
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveTraining}
            startIcon={<SaveIcon />}
            disabled={!formData.cat_time}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* טופס לתרגול קבוצתי */}
      <Dialog 
        open={openGroupTrainingForm} 
        onClose={() => setOpenGroupTrainingForm(false)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            p: 2
          }}
        >
          <Box display="flex" alignItems="center">
            <GroupIcon sx={{ mr:.5 }} />
            <Typography variant="h6">
              תרגול קבוצתי - מחצ"ים
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 4 }}>
            <Step>
              <StepLabel>בחירת צוות ותאריך</StepLabel>
            </Step>
            <Step>
              <StepLabel>בחירת חיילים</StepLabel>
            </Step>
            <Step>
              <StepLabel>הזנת נתוני תרגול</StepLabel>
            </Step>
          </Stepper>
          
          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="training_date"
                  label="תאריך תרגול"
                  type="date"
                  fullWidth
                  required
                  value={groupFormData.training_date}
                  onChange={handleGroupFormChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>צוות לתרגול</InputLabel>
                  <Select 
                    name="team" 
                    value={groupFormData.team} 
                    onChange={handleGroupFormChange} 
                    label="צוות לתרגול"
                    startAdornment={
                      <InputAdornment position="start">
                        <GroupIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="" disabled>בחר צוות</MenuItem>
                    {teams.map((team) => (
                      <MenuItem key={team} value={team}>
                        {team}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="general_notes"
                  label="הערות כלליות לתרגול"
                  fullWidth
                  multiline
                  rows={2}
                  value={groupFormData.general_notes}
                  onChange={handleGroupFormChange}
                  placeholder="הערות כלליות שיחולו על כל החיילים שתורגלו (אופציונלי)"
                />
              </Grid>
            </Grid>
          )}
          
          {activeStep === 1 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                בחר חיילים מצוות {groupFormData.team} להשתתפות בתרגול:
              </Typography>
              
              <Grid container spacing={1} sx={{ mt: 1 }}>
                {soldiers
                  .filter(s => s.team === groupFormData.team)
                  .map(soldier => (
                    <Grid item xs={12} sm={6} md={4} key={soldier.id}>
                      <Card 
                        variant={selectedSoldiers.includes(soldier.id) ? "elevation" : "outlined"}
                        elevation={selectedSoldiers.includes(soldier.id) ? 4 : 0}
                        onClick={() => handleSelectSoldier(soldier)}
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center', 
                          p: 1,
                          borderRadius: 2,
                          cursor: 'pointer',
                          borderColor: selectedSoldiers.includes(soldier.id) ? 'primary.main' : undefined,
                          bgcolor: selectedSoldiers.includes(soldier.id) ? 'primary.light' : 'white',
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            bgcolor: selectedSoldiers.includes(soldier.id) ? 'primary.light' : 'rgba(25, 118, 210, 0.04)',
                          }
                        }}
                      >
                        <Checkbox 
                          checked={selectedSoldiers.includes(soldier.id)} 
                          color="primary"
                          sx={{ p: 0.5, mr: 1 }}
                        />
                        <Avatar 
                          sx={{ 
                            bgcolor: isTrainedThisMonth(soldier.id) ? 'success.light' : 'warning.light',
                            color: isTrainedThisMonth(soldier.id) ? 'success.contrastText' : 'warning.contrastText', 
                            width: 32,
                            height: 32,
                            fontSize: '0.9rem',
                            mr: 1
                          }}
                        >
                          {soldier.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography 
                            variant="body2" 
                            fontWeight="medium" 
                            color={selectedSoldiers.includes(soldier.id) ? 'primary.contrastText' : 'inherit'}
                          >
                            {soldier.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {isTrainedThisMonth(soldier.id) ? (
                              <Chip 
                                label="תורגל החודש" 
                                size="small" 
                                color="success" 
                                variant="outlined"
                                sx={{ height: 20, '& .MuiChip-label': { px: 0.5, fontSize: '0.6rem' } }}
                              />
                            ) : (
                              <Chip 
                                label="לא תורגל החודש" 
                                size="small" 
                                color="warning" 
                                variant="outlined"
                                sx={{ height: 20, '& .MuiChip-label': { px: 0.5, fontSize: '0.6rem' } }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, borderTop: '1px solid #eee', pt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    setSelectedSoldiers(soldiers.filter(s => s.team === groupFormData.team && !isTrainedThisMonth(s.id)).map(s => s.id));
                  }}
                  startIcon={<WarningIcon />}
                  sx={{ mr: 1 }}
                >
                  בחר את כל החיילים שטרם תורגלו החודש
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    setSelectedSoldiers(soldiers.filter(s => s.team === groupFormData.team).map(s => s.id));
                  }}
                  startIcon={<PeopleIcon />}
                >
                  בחר את כל החיילים בצוות
                </Button>
              </Box>
            </Box>
          )}
          
          {activeStep === 2 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                הזן נתוני תרגול עבור {selectedSoldiers.length} חיילים:
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>שם</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>זמן CAT (שניות)</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>תוצאה</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>הערות ספציפיות</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedSoldiers.map(soldierId => {
                      const soldier = soldiers.find(s => s.id === soldierId);
                      return (
                        <TableRow key={soldierId}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  mr: 1, 
                                  fontSize: '0.9rem',
                                  bgcolor: isTrainedThisMonth(soldierId) ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                  color: isTrainedThisMonth(soldierId) ? 'success.main' : 'warning.main',
                                }}
                              >
                                {soldier?.name.charAt(0)}
                              </Avatar>
                              {soldier?.name}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              fullWidth
                              required
                              value={soldierTrainingData[soldierId]?.cat_time || ''}
                              onChange={(e) => handleSoldierDataChange(soldierId, 'cat_time', e.target.value)}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    שניות
                                  </InputAdornment>
                                ),
                              }}
                              error={soldierTrainingData[soldierId]?.cat_time === ''}
                            />
                          </TableCell>
                          <TableCell>
                            <FormControl>
                              <ToggleButtonGroup
                                exclusive
                                size="small"
                                value={soldierTrainingData[soldierId]?.passed}
                                onChange={(e, value) => {
                                  if (value !== null) { // Prevent deselection
                                    handleSoldierDataChange(soldierId, 'passed', value);
                                  }
                                }}
                                aria-label="תוצאה"
                              >
                                <ToggleButton 
                                  value={true} 
                                  aria-label="עבר"
                                  sx={{ 
                                    color: soldierTrainingData[soldierId]?.passed ? 'success.main' : 'inherit',
                                    borderColor: soldierTrainingData[soldierId]?.passed ? 'success.main' : 'inherit',
                                    bgcolor: soldierTrainingData[soldierId]?.passed ? 'success.light' : 'inherit',
                                  }}
                                >
                                  <CheckIcon sx={{ mr: 0.5 }} /> עבר
                                </ToggleButton>
                                <ToggleButton 
                                  value={false} 
                                  aria-label="נכשל"
                                  sx={{ 
                                    color: soldierTrainingData[soldierId]?.passed === false ? 'error.main' : 'inherit',
                                    borderColor: soldierTrainingData[soldierId]?.passed === false ? 'error.main' : 'inherit',
                                    bgcolor: soldierTrainingData[soldierId]?.passed === false ? 'error.light' : 'inherit',
                                  }}
                                >
                                  <CloseIcon sx={{ mr: 0.5 }} /> נכשל
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="הערות ספציפיות (אופציונלי)"
                              value={soldierTrainingData[soldierId]?.notes || ''}
                              onChange={(e) => handleSoldierDataChange(soldierId, 'notes', e.target.value)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', justifyContent: 'space-between' }}>
          {activeStep > 0 ? (
            <Button 
              onClick={() => setActiveStep(activeStep - 1)}
              variant="outlined"
            >
              חזור
            </Button>
          ) : (
            <Button 
              onClick={() => setOpenGroupTrainingForm(false)}
              variant="outlined"
              startIcon={<CloseIcon />}
            >
              ביטול
            </Button>
          )}
          
          {activeStep < 2 ? (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={activeStep === 0 ? handleNextToSelectSoldiers : handleNextToEnterData}
              endIcon={<ArrowForwardIcon />}
            >
              המשך
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSaveGroupTraining}
              startIcon={<SaveIcon />}
            >
              שמור נתוני תרגול
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* דיאלוג לפרטי חייל */}
      <Dialog
        open={openSoldierDetails}
        onClose={() => setOpenSoldierDetails(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        {selectedSoldier && (
          <>
            <DialogTitle 
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                p: 2
              }}
            >
              <Box display="flex" alignItems="center">
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  פרטי תרגול - {selectedSoldier.name}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ mb: 2, borderRadius: 2 }}>
                    <CardHeader 
                      title="פרטי חייל" 
                      titleTypographyProps={{ fontWeight: 'bold' }}
                      sx={{ 
                        bgcolor: '#f5f5f5', 
                        borderBottom: '1px solid #e0e0e0',
                        p: 2
                      }}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 64, 
                              height: 64, 
                              mr: 2,
                              fontSize: '1.5rem',
                              bgcolor: selectedSoldier.team === 'אתק' ? '#bbdefb' :
                                      selectedSoldier.team === 'רתק' ? '#c8e6c9' :
                                      selectedSoldier.team === 'חוד' ? '#ffe0b2' : '#e1bee7'
                            }}
                          >
                            {selectedSoldier.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">{selectedSoldier.name}</Typography>
                            <Chip 
                              label={selectedSoldier.team} 
                              size="small" 
                              sx={{ 
                                bgcolor: selectedSoldier.team === 'אתק' ? '#bbdefb' :
                                        selectedSoldier.team === 'רתק' ? '#c8e6c9' :
                                        selectedSoldier.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                                color: 'rgba(0, 0, 0, 0.7)',
                                fontWeight: 'bold',
                                '& .MuiChip-label': { px: 1 }
                              }} 
                            />
                          </Box>
                        </Box>
                        
                        <Divider />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">מספר אישי:</Typography>
                          <Typography variant="body2" fontWeight="medium">{selectedSoldier.personal_id}</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">ממוצע זמן CAT:</Typography>
                          <Typography 
                            variant="body2" 
                            fontWeight="medium"
                            color={
                              parseInt(calculateAverageCatTime(selectedSoldier.id)) > 35 ? 'error.main' : 
                              parseInt(calculateAverageCatTime(selectedSoldier.id)) > 25 ? 'warning.main' : 'success.main'
                            }
                          >
                            {calculateAverageCatTime(selectedSoldier.id)} שניות
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">אחוז הצלחה:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {calculatePassRate(selectedSoldier.id)}%
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">תרגולים סך הכל:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {getSoldierTrainings(selectedSoldier.id).length} תרגולים
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">סטטוס חודשי:</Typography>
                          <Chip
                            size="small"
                            label={isTrainedThisMonth(selectedSoldier.id) ? 'בוצע החודש' : 'לא בוצע החודש'}
                            color={isTrainedThisMonth(selectedSoldier.id) ? 'success' : 'error'}
                            variant={isTrainedThisMonth(selectedSoldier.id) ? 'filled' : 'outlined'}
                          />
                        </Box>
                      </Box>
                      
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setOpenSoldierDetails(false);
                          handleAddTraining(selectedSoldier);
                        }}
                        sx={{ mt: 3, borderRadius: 2 }}
                      >
                        תרגול חדש
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                    <Box p={0.5} bgcolor="#f5f5f5" borderBottom="1px solid #e0e0e0">
                      <Typography variant="subtitle1" sx={{ p: 1.5, fontWeight: 'bold' }}>
                        היסטוריית תרגולים
                      </Typography>
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>תאריך</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>זמן CAT</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>תוצאה</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>הערות</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getSoldierTrainings(selectedSoldier.id)
                            .sort((a, b) => new Date(b.training_date) - new Date(a.training_date))
                            .map((training) => (
                              <TableRow
                                key={training.id}
                                hover
                                sx={{ 
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    bgcolor: 'rgba(25, 118, 210, 0.04)',
                                  } 
                                }}
                              >
                                <TableCell>{formatDate(training.training_date)}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                    <Typography 
                                      sx={{ 
                                        fontWeight: 'medium',
                                        color: parseInt(training.cat_time) > 35 ? 'error.main' : 
                                               parseInt(training.cat_time) > 25 ? 'warning.main' : 'success.main'
                                      }}
                                    >
                                      {training.cat_time} שניות
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={training.passed ? "עבר" : "נכשל"}
                                    color={training.passed ? "success" : "error"}
                                    variant="filled"
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  {training.notes || <Typography variant="body2" color="text.secondary">אין הערות</Typography>}
                                </TableCell>
                              </TableRow>
                            ))}
                          {getSoldierTrainings(selectedSoldier.id).length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} align="center">
                                <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                  <WarningIcon sx={{ color: 'text.secondary', fontSize: 40 }} />
                                  <Typography sx={{ color: 'text.secondary' }}>אין היסטוריית תרגולים</Typography>
                                  <Button 
                                    variant="contained" 
                                    color="primary" 
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => {
                                      setOpenSoldierDetails(false);
                                      handleAddTraining(selectedSoldier);
                                    }}
                                    sx={{ mt: 1 }}
                                  >
                                    הוסף תרגול חדש
                                  </Button>
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                  
                  {/* גרף התקדמות */}
                  {getSoldierTrainings(selectedSoldier.id).length > 0 && (
                    <Paper sx={{ borderRadius: 2, p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        מגמת שיפור
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        מציג את זמני הנחת החסם לאורך זמן. ניתן לראות שיפור ככל שהזמן קטן יותר.
                      </Typography>
                      <Box sx={{ height: '180px', width: '100%', p: 1 }}>
                        {/* Here we'd include an actual chart component, this is just a basic visualization */}
                        <Box sx={{ height: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                          {getSoldierTrainings(selectedSoldier.id)
                            .sort((a, b) => new Date(a.training_date) - new Date(b.training_date))
                            .map((training, index, arr) => {
                              const maxTime = Math.max(...arr.map(t => parseInt(t.cat_time)));
                              const height = (parseInt(training.cat_time) / maxTime) * 100;
                              return (
                                <Box 
                                  key={training.id}
                                  sx={{ 
                                    flexGrow: 1, 
                                    mx: 0.5,
                                    height: `${height}%`,
                                    bgcolor: parseInt(training.cat_time) > 35 ? 'error.light' : 
                                             parseInt(training.cat_time) > 25 ? 'warning.light' : 'success.light',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    position: 'relative',
                                    '&:hover': {
                                      bgcolor: parseInt(training.cat_time) > 35 ? 'error.main' : 
                                               parseInt(training.cat_time) > 25 ? 'warning.main' : 'success.main',
                                    }
                                  }}
                                >
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      position: 'absolute', 
                                      top: -20, 
                                      color: 'text.secondary',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {training.cat_time}
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      position: 'absolute', 
                                      bottom: -20, 
                                      color: 'text.secondary',
                                      fontSize: '0.6rem',
                                      transform: 'rotate(-45deg)',
                                      transformOrigin: 'top left'
                                    }}
                                  >
                                    {formatDate(training.training_date).slice(0, 5)}
                                  </Typography>
                                </Box>
                              );
                            })}
                        </Box>
                      </Box>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Button 
                onClick={() => setOpenSoldierDetails(false)}
                variant="outlined"
                startIcon={<CloseIcon />}
              >
                סגור
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

// רכיב תרגול חובשים - חדש ומלא
const MedicsTraining = ({ showNotification }) => {
  const [trainings, setTrainings] = useState([]);
  const [medics] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openSessionForm, setOpenSessionForm] = useState(false);
  const [selectedMedic, setSelectedMedic] = useState(null);
  const [openMedicDetails, setOpenMedicDetails] = useState(false);
  const [filterTeam, setFilterTeam] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainingType, setSelectedTrainingType] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  
  const [trainingTypes, setTrainingTypes] = useState([
    'החייאה',
    'טיפול בפציעות ראש',
    'החדרת נתיב אוויר',
    'עצירת דימומים',
    'טיפול בפגיעות חזה',
    'הנחת עירוי',
    'טיפול בהלם',
    'חבישות',
    'פינוי נפגעים',
    'ציוד רפואי והכרתו'
  ]);
  
  // אימון חדש - תרגול קבוצתי
  const [sessionFormData, setSessionFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    training_type: '',
    location: '',
    notes: '',
    participants: []
  });
  
  // נתוני ביצוע לחובשים בתרגול
  const [medicPerformance, setMedicPerformance] = useState({});
  
  // נתוני ביצוע לחובש בודד
  const [formData, setFormData] = useState({
    date: '',
    medic_id: '',
    training_type: '',
    performance_rating: 3,
    attendance: true,
    notes: '',
    recommendations: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ניסיון להביא נתונים מהשרת
        let teamsData, medicsData, trainingsData;
        
        try {
          // בדיקת חיבור לשרת והבאת נתונים
          teamsData = await trainingService.getTeams();
          medicsData = await trainingService.getMedics();
          trainingsData = await trainingService.getMedicTrainings();
          
          console.log('נתוני תרגולי חובשים התקבלו מהשרת:', { teamsData, medicsData, trainingsData });
        } catch (apiError) {
          console.error('שגיאה בטעינת נתונים מהשרת:', apiError);
          // במקרה של שגיאת API, השתמש בנתוני מוק מקומיים
          teamsData = mockDataService.teams;
          medicsData = mockDataService.medics;
          trainingsData = mockDataService.medicTrainings;
          showNotification('לא ניתן להתחבר לשרת. מציג נתונים מקומיים.', 'warning');
        }
        
        // עדכון מצב הקומפוננטה עם הנתונים שהתקבלו
        setTeams(teamsData);
        setMedics(medicsData); // במקום setSoldiers
        setTrainings(trainingsData);
      } catch (err) {
        console.error('שגיאה חמורה בטעינת נתונים:', err);
        showNotification('שגיאה בטעינת נתונים', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [showNotification]); // הוספת showNotification לתלויות

  const getMedicTrainings = (medicId) => trainings.filter((t) => t.medic_id === medicId);

  const isTrainedThisMonth = (medicId, trainingType = null) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return trainings.some((t) => {
      const trainingDate = new Date(t.training_date);
      const matchesMedicAndDate = (
        t.medic_id === medicId &&
        trainingDate.getMonth() === currentMonth &&
        trainingDate.getFullYear() === currentYear
      );
      
      // If trainingType is provided, check if it matches
      if (trainingType) {
        return matchesMedicAndDate && t.training_type === trainingType;
      }
      
      return matchesMedicAndDate;
    });
  };

  const handleAddTraining = (medic) => {
    setSelectedMedic(medic);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      medic_id: medic.id,
      training_type: '',
      performance_rating: 3,
      attendance: true,
      notes: '',
      recommendations: ''
    });
    setOpenForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSaveTraining = async () => {
    try {
      // In a real implementation, we would save to the API
      // await apiService.createMedicTraining(formData);
      
      // For now, updating local state
      const newTraining = {
        id: Math.max(0, ...trainings.map((t) => t.id || 0)) + 1,
        ...formData,
      };
      setTrainings([...trainings, newTraining]);
      setOpenForm(false);
      showNotification('נתוני התרגול נשמרו בהצלחה');
    } catch (error) {
      console.error('Error saving training:', error);
      showNotification('שגיאה בשמירת הנתונים', 'error');
    }
  };

  // פתיחת טופס אימון קבוצתי
  const handleOpenSessionForm = () => {
    setSessionFormData({
      date: new Date().toISOString().split('T')[0],
      training_type: '',
      location: '',
      notes: '',
      participants: []
    });
    setMedicPerformance({});
    setActiveStep(0);
    setOpenSessionForm(true);
  };

  // טיפול בשינוי בטופס אימון קבוצתי
  const handleSessionFormChange = (e) => {
    const { name, value } = e.target;
    setSessionFormData({ ...sessionFormData, [name]: value });
  };

  // טיפול בבחירת משתתפים לאימון
  const handleSelectParticipant = (medicId) => {
    const currentParticipants = [...sessionFormData.participants];
    if (currentParticipants.includes(medicId)) {
      setSessionFormData({
        ...sessionFormData,
        participants: currentParticipants.filter(id => id !== medicId)
      });
    } else {
      setSessionFormData({
        ...sessionFormData,
        participants: [...currentParticipants, medicId]
      });
    }
  };

  // מעבר לשלב הבא בטופס האימון
  const handleNextStep = () => {
    if (activeStep === 0) {
      // בדיקת תקינות שלב 1
      if (!sessionFormData.training_type || !sessionFormData.date) {
        showNotification('אנא מלא את כל השדות הנדרשים', 'error');
        return;
      }
    } else if (activeStep === 1) {
      // בדיקת תקינות שלב 2
      if (sessionFormData.participants.length === 0) {
        showNotification('אנא בחר לפחות חובש אחד', 'error');
        return;
      }
      
      // יצירת אובייקט ביצועים ריק עבור כל חובש
      const initialPerformance = {};
      sessionFormData.participants.forEach(medicId => {
        initialPerformance[medicId] = {
          performance_rating: 3,
          attendance: true,
          notes: ''
        };
      });
      setMedicPerformance(initialPerformance);
    }
    
    setActiveStep(activeStep + 1);
  };

  // חזרה לשלב הקודם
  const handlePrevStep = () => {
    setActiveStep(activeStep - 1);
  };

  // עדכון נתוני ביצוע של חובש
  const handleMedicPerformanceChange = (medicId, field, value) => {
    setMedicPerformance(prev => ({
      ...prev,
      [medicId]: {
        ...prev[medicId],
        [field]: value
      }
    }));
  };

  // שמירת נתוני האימון הקבוצתי
  const handleSaveSession = async () => {
    try {
      // יצירת רשומות אימון עבור כל חובש שהשתתף
      const newTrainings = sessionFormData.participants.map(medicId => ({
        id: Math.max(0, ...trainings.map(t => t.id || 0)) + 1 + sessionFormData.participants.indexOf(medicId),
        medic_id: medicId,
        training_date: sessionFormData.date,
        training_type: sessionFormData.training_type,
        performance_rating: medicPerformance[medicId].performance_rating,
        attendance: medicPerformance[medicId].attendance,
        notes: medicPerformance[medicId].notes || sessionFormData.notes,
        recommendations: ''
      }));
      
      // In a real implementation, we would save to the API
      // await Promise.all(newTrainings.map(training => apiService.createMedicTraining(training)));
      
      // For now, updating local state
      setTrainings([...trainings, ...newTrainings]);
      setOpenSessionForm(false);
      showNotification(`נשמרו נתוני אימון עבור ${sessionFormData.participants.length} חובשים`, 'success');
    } catch (error) {
      console.error('Error saving session:', error);
      showNotification('שגיאה בשמירת נתוני האימון', 'error');
    }
  };

  // פתיחת פרטי חובש
  const handleOpenMedicDetails = (medic) => {
    setSelectedMedic(medic);
    setOpenMedicDetails(true);
  };

  // חישוב ממוצע ביצוע לחובש
  const calculateAveragePerformance = (medicId) => {
    const medicTrainings = getMedicTrainings(medicId);
    if (medicTrainings.length === 0) return 0;
    
    const totalRating = medicTrainings.reduce((sum, t) => sum + t.performance_rating, 0);
    return (totalRating / medicTrainings.length).toFixed(1);
  };

  // סינון חובשים
  const filteredMedics = medics.filter(medic => {
    const matchesTeam = filterTeam ? medic.team === filterTeam : true;
    const matchesSearch = searchQuery === '' || 
      medic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medic.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTeam && matchesSearch;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          תרגול חובשים
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<GroupIcon />} 
            onClick={handleOpenSessionForm}
            sx={{ 
              mr: 1,
              borderRadius: 2, 
              textTransform: 'none',
            }}
          >
            אימון קבוצתי
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setFilterTeam('')}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 10px rgba(0,0,0,0.2)',
              }
            }}
          >
            תרגול חדש
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={8}>
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 1,
              flexWrap: { xs: 'wrap', md: 'nowrap' } 
            }}
          >
            <TextField
              placeholder="חפש לפי שם או תפקיד"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                bgcolor: 'white', 
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <FormControl 
              variant="outlined" 
              size="small" 
              sx={{ 
                minWidth: 120,
                bgcolor: 'white', 
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              <InputLabel id="team-filter-label">צוות</InputLabel>
              <Select
                labelId="team-filter-label"
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                label="צוות"
              >
                <MenuItem value="">הכל</MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team} value={team}>
                    {team}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl 
              variant="outlined" 
              size="small" 
              sx={{ 
                minWidth: 180,
                bgcolor: 'white', 
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              <InputLabel id="training-type-filter-label">סוג תרגול</InputLabel>
              <Select
                labelId="training-type-filter-label"
                value={selectedTrainingType}
                onChange={(e) => setSelectedTrainingType(e.target.value)}
                label="סוג תרגול"
              >
                <MenuItem value="">הכל</MenuItem>
                {trainingTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="אפס סינון">
              <IconButton 
                onClick={() => {
                  setSearchQuery('');
                  setFilterTeam('');
                  setSelectedTrainingType('');
                }}
                sx={{ 
                  bgcolor: 'white',
                  '&:hover': { bgcolor: '#f5f5f5' } 
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={2}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              mb: 3
            }}
          >
            <Box p={0.5} bgcolor="#f5f5f5" borderBottom="1px solid #e0e0e0">
              <Typography variant="subtitle2" sx={{ p: 1.5, fontWeight: 'bold' }}>
                רשימת חובשים {filteredMedics.length > 0 && `(${filteredMedics.length})`}
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>שם</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>צוות</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>תפקיד</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>רמה</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>ביצוע</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>אימונים</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>פעולות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMedics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <WarningIcon sx={{ color: 'text.secondary', fontSize: 40 }} />
                          <Typography sx={{ color: 'text.secondary' }}>לא נמצאו חובשים</Typography>
                          {searchQuery || filterTeam || selectedTrainingType ? (
                            <Button 
                              variant="outlined" 
                              size="small" 
                              startIcon={<RefreshIcon />}
                              onClick={() => {
                                setSearchQuery('');
                                setFilterTeam('');
                                setSelectedTrainingType('');
                              }}
                              sx={{ mt: 1 }}
                            >
                              אפס סינון
                            </Button>
                          ) : null}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMedics.map((medic) => {
                      const medicTrainings = getMedicTrainings(medic.id);
                      const avgPerformance = calculateAveragePerformance(medic.id);
                      const trainedThisMonth = isTrainedThisMonth(
                        medic.id, 
                        selectedTrainingType || undefined
                      );
                      
                      return (
                        <TableRow
                          key={medic.id}
                          hover
                          onClick={() => handleOpenMedicDetails(medic)}
                          sx={{ 
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'rgba(25, 118, 210, 0.04)',
                            } 
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  mr: 1, 
                                  fontSize: '0.9rem',
                                  bgcolor: medic.team === 'אתק' ? '#bbdefb' :
                                           medic.team === 'רתק' ? '#c8e6c9' :
                                           medic.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                                  color: 'rgba(0, 0, 0, 0.7)',
                                }}
                              >
                                {medic.name.charAt(0)}
                              </Avatar>
                              {medic.name}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={medic.team} 
                              size="small" 
                              sx={{ 
                                bgcolor: medic.team === 'אתק' ? '#bbdefb' :
                                        medic.team === 'רתק' ? '#c8e6c9' :
                                        medic.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                                color: 'rgba(0, 0, 0, 0.7)',
                                fontWeight: 'bold',
                                '& .MuiChip-label': { px: 1 }
                              }} 
                            />
                          </TableCell>
                          <TableCell>{medic.role}</TableCell>
                          <TableCell>
                            <Chip 
                              label={medic.experience} 
                              size="small" 
                              color={
                                medic.experience === 'בכיר' ? 'success' :
                                medic.experience === 'מתקדם' ? 'info' : 'warning'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Rating 
                              value={avgPerformance > 0 ? parseFloat(avgPerformance) : 0} 
                              readOnly 
                              precision={0.5}
                              size="small"
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: avgPerformance >= 4 ? 'success.main' : 
                                         avgPerformance >= 3 ? 'warning.main' : 'error.main',
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ mr: 1 }}>
                                {medicTrainings.length}
                              </Typography>
                              {selectedTrainingType && (
                                <Chip
                                  size="small"
                                  label={trainedThisMonth ? "בוצע" : "לא בוצע"}
                                  color={trainedThisMonth ? "success" : "error"}
                                  variant={trainedThisMonth ? "filled" : "outlined"}
                                  sx={{ height: 20, '& .MuiChip-label': { px: 0.5 } }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddTraining(medic);
                              }}
                              startIcon={<AddIcon />}
                              sx={{ borderRadius: 2 }}
                            >
                              תרגול חדש
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          
          {/* תצוגת תרגולים אחרונים */}
          <Paper 
            elevation={2}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              mb: 3
            }}
          >
            <Box p={0.5} bgcolor="#e3f2fd" borderBottom="1px solid #bbdefb">
              <Typography variant="subtitle2" sx={{ p: 1.5, fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                <HistoryIcon sx={{ mr: 1 }} /> תרגולים אחרונים
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>תאריך</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>חובש</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>סוג תרגול</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>ביצוע</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>הערות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trainings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <WarningIcon sx={{ color: 'text.secondary', fontSize: 40 }} />
                          <Typography sx={{ color: 'text.secondary' }}>לא נמצאו תרגולים</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    trainings
                      .sort((a, b) => new Date(b.training_date) - new Date(a.training_date))
                      .slice(0, 10)
                      .map((training) => {
                        const medic = medics.find(m => m.id === training.medic_id);
                        return (
                          <TableRow
                            key={training.id}
                            hover
                            sx={{ 
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: 'rgba(25, 118, 210, 0.04)',
                              } 
                            }}
                          >
                            <TableCell>{formatDate(training.training_date)}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                  sx={{ 
                                    width: 24, 
                                    height: 24, 
                                    mr: 1, 
                                    fontSize: '0.7rem',
                                    bgcolor: medic?.team === 'אתק' ? '#bbdefb' :
                                             medic?.team === 'רתק' ? '#c8e6c9' :
                                             medic?.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                                  }}
                                >
                                  {medic?.name.charAt(0)}
                                </Avatar>
                                <Typography variant="body2">{medic?.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{training.training_type}</TableCell>
                            <TableCell>
                              <Rating 
                                value={training.performance_rating} 
                                readOnly 
                                size="small"
                                sx={{
                                  '& .MuiRating-iconFilled': {
                                    color: training.performance_rating >= 4 ? 'success.main' : 
                                           training.performance_rating >= 3 ? 'warning.main' : 'error.main',
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {training.notes || <Typography variant="body2" color="text.secondary">אין הערות</Typography>}
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            elevation={2} 
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              mb: 3
            }}
          >
            <CardHeader 
              title="סיכום סוגי תרגולים" 
              titleTypographyProps={{ fontWeight: 'bold' }}
              sx={{ 
                bgcolor: '#f5f5f5', 
                borderBottom: '1px solid #e0e0e0',
                p: 2
              }}
            />
            <CardContent>
              <List sx={{ mb: 2 }}>
                {trainingTypes.map((type) => {
                  const typeTrainings = trainings.filter((t) => t.training_type === type);
                  const count = typeTrainings.length;
                  const avgRating = count > 0 ? typeTrainings.reduce((sum, t) => sum + t.performance_rating, 0) / count : 0;
                  
                  return (
                    <ListItem 
                      key={type} 
                      sx={{ 
                        mb: 1, 
                        borderRadius: 2,
                        bgcolor: 'white',
                        border: '1px solid #eee',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                      onClick={() => setSelectedTrainingType(type)}
                    >
                      <ListItemText 
                        primary={type} 
                        secondary={`${count} תרגולים`}
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                      {count > 0 && (
                        <Box display="flex" alignItems="center">
                          <Rating 
                            value={avgRating} 
                            precision={0.5} 
                            readOnly 
                            size="small" 
                            sx={{
                              '& .MuiRating-iconFilled': {
                                color: avgRating >= 4 ? 'success.main' : 
                                       avgRating >= 3 ? 'warning.main' : 'error.main',
                              }
                            }}
                          />
                        </Box>
                      )}
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
          
          <Card 
            elevation={2} 
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <CardHeader 
              title="סטטיסטיקה לפי צוות" 
              titleTypographyProps={{ fontWeight: 'bold' }}
              sx={{ 
                bgcolor: '#f5f5f5', 
                borderBottom: '1px solid #e0e0e0',
                p: 2
              }}
            />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>צוות</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>חובשים</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>תרגולים</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>ביצוע</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teams.map((team) => {
                      const teamMedics = medics.filter((m) => m.team === team);
                      const teamTrainings = trainings.filter((t) => {
                        const medic = medics.find(m => m.id === t.medic_id);
                        return medic && medic.team === team;
                      });
                      const avgRating = teamTrainings.length > 0 ? 
                        teamTrainings.reduce((sum, t) => sum + t.performance_rating, 0) / teamTrainings.length : 
                        0;
                      
                      return (
                        <TableRow 
                          key={team}
                          hover
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                          }}
                          onClick={() => setFilterTeam(team)}
                        >
                          <TableCell>
                            <Chip 
                              label={team} 
                              size="small" 
                              sx={{ 
                                bgcolor: team === 'אתק' ? '#bbdefb' :
                                team === 'רתק' ? '#c8e6c9' :
                                team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                                color: 'rgba(0, 0, 0, 0.7)',
                                fontWeight: 'bold',
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          </TableCell>
                          <TableCell>{teamMedics.length}</TableCell>
                          <TableCell>{teamTrainings.length}</TableCell>
                          <TableCell>
                            <Rating 
                              value={avgRating} 
                              precision={0.5} 
                              readOnly 
                              size="small" 
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: avgRating >= 4 ? 'success.main' : 
                                         avgRating >= 3 ? 'warning.main' : 'error.main',
                                }
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* טופס תרגול לחובש */}
      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            p: 2
          }}
        >
          <Box display="flex" alignItems="center">
            <AddIcon sx={{ mr:.5 }} />
            <Typography variant="h6">
              תרגול חדש - {selectedMedic?.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="date"
                label="תאריך תרגול"
                type="date"
                fullWidth
                required
                value={formData.date}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>סוג תרגול</InputLabel>
                <Select 
                  name="training_type" 
                  value={formData.training_type} 
                  onChange={handleFormChange} 
                  label="סוג תרגול"
                >
                  <MenuItem value="" disabled>בחר סוג תרגול</MenuItem>
                  {trainingTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(0, 0, 0, 0.23)', borderRadius: 1, p: 2 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  דירוג ביצוע:
                </Typography>
                <Rating
                  name="performance_rating"
                  value={Number(formData.performance_rating)}
                  onChange={(event, newValue) =>
                    setFormData({ ...formData, performance_rating: newValue })
                  }
                  size="large"
                  sx={{
                    '& .MuiRating-iconFilled': {
                      color: formData.performance_rating >= 4 ? 'success.main' : 
                             formData.performance_rating >= 3 ? 'warning.main' : 'error.main',
                    }
                  }}
                />
                <Box sx={{ ml: 2, minWidth: '24px' }}>
                  <Typography variant="body2" color="text.secondary">
                    {formData.performance_rating}/5
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.attendance}
                    onChange={(e) => setFormData({ ...formData, attendance: e.target.checked })}
                    color="success"
                  />
                }
                label="נוכחות מלאה"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="הערות"
                fullWidth
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="הערות לגבי ביצוע התרגול (אופציונלי)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="recommendations"
                label="המלצות לשיפור"
                fullWidth
                multiline
                rows={3}
                value={formData.recommendations}
                onChange={handleFormChange}
                placeholder="המלצות לשיפור ולתרגול עתידי (אופציונלי)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={() => setOpenForm(false)}
            variant="outlined"
            startIcon={<CloseIcon />}
          >
            ביטול
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveTraining}
            startIcon={<SaveIcon />}
            disabled={!formData.training_type || !formData.date}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>

      {/* טופס אימון קבוצתי */}
      <Dialog 
        open={openSessionForm} 
        onClose={() => setOpenSessionForm(false)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            p: 2
          }}
        >
          <Box display="flex" alignItems="center">
            <GroupIcon sx={{ mr:.5 }} />
            <Typography variant="h6">
              אימון קבוצתי - חובשים
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 4 }}>
            <Step>
              <StepLabel>הגדרת האימון</StepLabel>
            </Step>
            <Step>
              <StepLabel>בחירת משתתפים</StepLabel>
            </Step>
            <Step>
              <StepLabel>הזנת נתוני ביצוע</StepLabel>
            </Step>
          </Stepper>
          
          {/* שלב 1 - הגדרת האימון */}
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="date"
                  label="תאריך האימון"
                  type="date"
                  fullWidth
                  required
                  value={sessionFormData.date}
                  onChange={handleSessionFormChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>סוג תרגול</InputLabel>
                  <Select 
                    name="training_type" 
                    value={sessionFormData.training_type} 
                    onChange={handleSessionFormChange} 
                    label="סוג תרגול"
                  >
                    <MenuItem value="" disabled>בחר סוג תרגול</MenuItem>
                    {trainingTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="location"
                  label="מיקום האימון"
                  fullWidth
                  value={sessionFormData.location}
                  onChange={handleSessionFormChange}
                  placeholder="הזן את מיקום האימון (אופציונלי)"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FlagIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="notes"
                  label="הערות כלליות"
                  fullWidth
                  multiline
                  rows={3}
                  value={sessionFormData.notes}
                  onChange={handleSessionFormChange}
                  placeholder="הערות כלליות לגבי האימון (אופציונלי)"
                />
              </Grid>
            </Grid>
          )}
          
          {/* שלב 2 - בחירת משתתפים */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                בחר חובשים להשתתפות באימון:
              </Typography>
              
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {teams.map((team) => (
                  <Chip 
                    key={team}
                    label={team}
                    clickable
                    onClick={() => {
                      // בחר את כל החובשים מהצוות הנבחר
                      const teamMedics = medics.filter(m => m.team === team);
                      const teamMedicIds = teamMedics.map(m => m.id);
                      
                      // אם כל החובשים מהצוות כבר נבחרו, הסר את כולם, אחרת הוסף את כולם
                      const allSelected = teamMedicIds.every(id => sessionFormData.participants.includes(id));
                      
                      if (allSelected) {
                        setSessionFormData({
                          ...sessionFormData,
                          participants: sessionFormData.participants.filter(id => !teamMedicIds.includes(id))
                        });
                      } else {
                        setSessionFormData({
                          ...sessionFormData,
                          participants: [...new Set([...sessionFormData.participants, ...teamMedicIds])]
                        });
                      }
                    }}
                    color={
                      medics.filter(m => m.team === team)
                            .every(m => sessionFormData.participants.includes(m.id)) ?
                      'primary' : 'default'
                    }
                    variant={
                      medics.filter(m => m.team === team)
                            .some(m => sessionFormData.participants.includes(m.id)) ?
                      'filled' : 'outlined'
                    }
                    sx={{ 
                      borderRadius: 2,
                      fontWeight: 'medium'
                    }}
                  />
                ))}
              </Box>
              
              <Grid container spacing={1}>
                {medics.map(medic => (
                  <Grid item xs={12} sm={6} md={4} key={medic.id}>
                    <Card 
                      variant={sessionFormData.participants.includes(medic.id) ? "elevation" : "outlined"}
                      elevation={sessionFormData.participants.includes(medic.id) ? 4 : 0}
                      onClick={() => handleSelectParticipant(medic.id)}
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center', 
                        p: 1,
                        borderRadius: 2,
                        cursor: 'pointer',
                        borderColor: sessionFormData.participants.includes(medic.id) ? 'primary.main' : undefined,
                        bgcolor: sessionFormData.participants.includes(medic.id) ? 'primary.light' : 'white',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          bgcolor: sessionFormData.participants.includes(medic.id) ? 'primary.light' : 'rgba(25, 118, 210, 0.04)',
                        }
                      }}
                    >
                      <Checkbox 
                        checked={sessionFormData.participants.includes(medic.id)} 
                        color="primary"
                        sx={{ p: 0.5, mr: 1 }}
                      />
                      <Avatar 
                        sx={{ 
                          bgcolor: medic.team === 'אתק' ? '#bbdefb' :
                                   medic.team === 'רתק' ? '#c8e6c9' :
                                   medic.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                          color: 'rgba(0, 0, 0, 0.7)',
                          width: 32,
                          height: 32,
                          fontSize: '0.9rem',
                          mr: 1
                        }}
                      >
                        {medic.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography 
                          variant="body2" 
                          fontWeight="medium" 
                          color={sessionFormData.participants.includes(medic.id) ? 'primary.contrastText' : 'inherit'}
                        >
                          {medic.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography 
                            variant="caption" 
                            color={sessionFormData.participants.includes(medic.id) ? 'primary.contrastText' : 'text.secondary'}
                          >
                            {medic.team} • {medic.role}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {/* שלב 3 - הזנת נתוני ביצוע */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                הזן נתוני ביצוע עבור {sessionFormData.participants.length} חובשים:
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>שם</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>תפקיד</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>ביצוע</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>נוכחות</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>הערות</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessionFormData.participants.map(medicId => {
                      const medic = medics.find(m => m.id === medicId);
                      return (
                        <TableRow key={medicId}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  mr: 1, 
                                  fontSize: '0.7rem',
                                  bgcolor: medic.team === 'אתק' ? '#bbdefb' :
                                           medic.team === 'רתק' ? '#c8e6c9' :
                                           medic.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                                }}
                              >
                                {medic?.name.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" fontWeight="medium">{medic?.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{medic?.role}</TableCell>
                          <TableCell>
                            <Rating
                              value={medicPerformance[medicId]?.performance_rating || 3}
                              onChange={(e, newValue) => 
                                handleMedicPerformanceChange(medicId, 'performance_rating', newValue)
                              }
                              size="small"
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: (medicPerformance[medicId]?.performance_rating || 3) >= 4 ? 'success.main' : 
                                         (medicPerformance[medicId]?.performance_rating || 3) >= 3 ? 'warning.main' : 'error.main',
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={medicPerformance[medicId]?.attendance !== false}
                                  onChange={(e) => 
                                    handleMedicPerformanceChange(medicId, 'attendance', e.target.checked)
                                  }
                                  color="success"
                                  size="small"
                                />
                              }
                              label=""
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="הערות ספציפיות (אופציונלי)"
                              value={medicPerformance[medicId]?.notes || ''}
                              onChange={(e) => 
                                handleMedicPerformanceChange(medicId, 'notes', e.target.value)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', justifyContent: 'space-between' }}>
          {activeStep > 0 ? (
            <Button 
              onClick={handlePrevStep}
              variant="outlined"
            >
              חזור
            </Button>
          ) : (
            <Button 
              onClick={() => setOpenSessionForm(false)}
              variant="outlined"
              startIcon={<CloseIcon />}
            >
              ביטול
            </Button>
          )}
          
          {activeStep < 2 ? (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleNextStep}
              endIcon={<ArrowForwardIcon />}
            >
              המשך
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSaveSession}
              startIcon={<SaveIcon />}
            >
              שמור נתוני אימון
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* דיאלוג לפרטי חובש */}
      <Dialog
        open={openMedicDetails}
        onClose={() => setOpenMedicDetails(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        {selectedMedic && (
          <>
            <DialogTitle 
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                p: 2
              }}
            >
              <Box display="flex" alignItems="center">
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  פרטי חובש - {selectedMedic.name}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ mb: 2, borderRadius: 2 }}>
                    <CardHeader 
                      title="פרטי חובש" 
                      titleTypographyProps={{ fontWeight: 'bold' }}
                      sx={{ 
                        bgcolor: '#f5f5f5', 
                        borderBottom: '1px solid #e0e0e0',
                        p: 2
                      }}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 64, 
                              height: 64, 
                              mr: 2,
                              fontSize: '1.5rem',
                              bgcolor: selectedMedic.team === 'אתק' ? '#bbdefb' :
                                      selectedMedic.team === 'רתק' ? '#c8e6c9' :
                                      selectedMedic.team === 'חוד' ? '#ffe0b2' : '#e1bee7'
                            }}
                          >
                            {selectedMedic.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">{selectedMedic.name}</Typography>
                            <Chip 
                              label={selectedMedic.team} 
                              size="small" 
                              sx={{ 
                                bgcolor: selectedMedic.team === 'אתק' ? '#bbdefb' :
                                        selectedMedic.team === 'רתק' ? '#c8e6c9' :
                                        selectedMedic.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                                color: 'rgba(0, 0, 0, 0.7)',
                                fontWeight: 'bold',
                                '& .MuiChip-label': { px: 1 }
                              }} 
                            />
                          </Box>
                        </Box>
                        
                        <Divider />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">תפקיד:</Typography>
                          <Typography variant="body2" fontWeight="medium">{selectedMedic.role}</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">רמה:</Typography>
                          <Chip 
                            label={selectedMedic.experience} 
                            size="small" 
                            color={
                              selectedMedic.experience === 'בכיר' ? 'success' :
                              selectedMedic.experience === 'מתקדם' ? 'info' : 'warning'
                            }
                            variant="outlined"
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">ממוצע ביצוע:</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating 
                              value={calculateAveragePerformance(selectedMedic.id) > 0 ? parseFloat(calculateAveragePerformance(selectedMedic.id)) : 0} 
                              readOnly 
                              precision={0.5}
                              size="small"
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: calculateAveragePerformance(selectedMedic.id) >= 4 ? 'success.main' : 
                                         calculateAveragePerformance(selectedMedic.id) >= 3 ? 'warning.main' : 'error.main',
                                }
                              }}
                            />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              ({calculateAveragePerformance(selectedMedic.id)})
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">אימונים סך הכל:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {getMedicTrainings(selectedMedic.id).length} אימונים
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setOpenMedicDetails(false);
                          handleAddTraining(selectedMedic);
                        }}
                        sx={{ mt: 3, borderRadius: 2 }}
                      >
                        תרגול חדש
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                    <Box p={0.5} bgcolor="#f5f5f5" borderBottom="1px solid #e0e0e0">
                      <Typography variant="subtitle1" sx={{ p: 1.5, fontWeight: 'bold' }}>
                        היסטוריית תרגולים
                      </Typography>
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>תאריך</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>סוג תרגול</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>ביצוע</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>נוכחות</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>הערות</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getMedicTrainings(selectedMedic.id)
                            .sort((a, b) => new Date(b.training_date) - new Date(a.training_date))
                            .map((training) => (
                              <TableRow
                                key={training.id}
                                hover
                                sx={{ 
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    bgcolor: 'rgba(25, 118, 210, 0.04)',
                                  } 
                                }}
                              >
                                <TableCell>{formatDate(training.training_date)}</TableCell>
                                <TableCell>{training.training_type}</TableCell>
                                <TableCell>
                                  <Rating 
                                    value={training.performance_rating} 
                                    readOnly 
                                    size="small"
                                    sx={{
                                      '& .MuiRating-iconFilled': {
                                        color: training.performance_rating >= 4 ? 'success.main' : 
                                               training.performance_rating >= 3 ? 'warning.main' : 'error.main',
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={training.attendance !== false ? "נוכחות מלאה" : "נעדר/חלקי"}
                                    color={training.attendance !== false ? "success" : "error"}
                                    variant="outlined"
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  {training.notes || <Typography variant="body2" color="text.secondary">אין הערות</Typography>}
                                </TableCell>
                              </TableRow>
                            ))}
                          {getMedicTrainings(selectedMedic.id).length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} align="center">
                                <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                  <WarningIcon sx={{ color: 'text.secondary', fontSize: 40 }} />
                                  <Typography sx={{ color: 'text.secondary' }}>אין היסטוריית תרגולים</Typography>
                                  <Button 
                                    variant="contained" 
                                    color="primary" 
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => {
                                      setOpenMedicDetails(false);
                                      handleAddTraining(selectedMedic);
                                    }}
                                    sx={{ mt: 1 }}
                                  >
                                    הוסף תרגול חדש
                                  </Button>
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                  
                  {/* סטטיסטיקת סוגי תרגולים */}
                  {getMedicTrainings(selectedMedic.id).length > 0 && (
                    <Paper sx={{ borderRadius: 2, p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        סטטיסטיקת תרגולים לפי סוג
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        {trainingTypes
                          .filter(type => getMedicTrainings(selectedMedic.id).some(t => t.training_type === type))
                          .map(type => {
                            const typeTrainings = getMedicTrainings(selectedMedic.id).filter(t => t.training_type === type);
                            const avgRating = typeTrainings.reduce((sum, t) => sum + t.performance_rating, 0) / typeTrainings.length;
                            const lastTraining = typeTrainings.sort((a, b) => new Date(b.training_date) - new Date(a.training_date))[0];
                            
                            return (
                              <Box key={type} sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">{type}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    תרגול אחרון: {formatDate(lastTraining.training_date)}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box sx={{ mr: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">
                                      תרגולים
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                      {typeTrainings.length}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">
                                      ביצוע
                                    </Typography>
                                    <Rating 
                                      value={avgRating} 
                                      readOnly 
                                      precision={0.5}
                                      size="small"
                                      sx={{
                                        '& .MuiRating-iconFilled': {
                                          color: avgRating >= 4 ? 'success.main' : 
                                                 avgRating >= 3 ? 'warning.main' : 'error.main',
                                        }
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </Box>
                            );
                          })}
                      </Box>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Button 
                onClick={() => setOpenMedicDetails(false)}
                variant="outlined"
                startIcon={<CloseIcon />}
              >
                סגור
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

// רכיב ניתוח ומעקב
const TrainingAnalysis = ({ showNotification }) => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedSoldier, setSelectedSoldier] = useState(null);
  const [openSoldierStats, setOpenSoldierStats] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ניסיון להביא נתונים מהשרת
        let stats;
        
        try {
          // בדיקת חיבור לשרת והבאת נתונים
          stats = await trainingService.getTrainingStats(selectedPeriod, selectedTeam);
          console.log('נתוני ניתוח התקבלו מהשרת:', stats);
        } catch (apiError) {
          console.error('שגיאה בטעינת נתוני ניתוח מהשרת:', apiError);
          // במקרה של שגיאת API, השתמש בנתוני מוק מקומיים
          stats = mockDataService.trainingStats;
          showNotification('לא ניתן להתחבר לשרת. מציג נתוני ניתוח מקומיים.', 'warning');
        }
        
        // עדכון מצב הקומפוננטה עם הנתונים שהתקבלו
        setStatsData(stats);
      } catch (err) {
        console.error('שגיאה חמורה בטעינת נתוני ניתוח:', err);
        showNotification('שגיאה בטעינת נתוני ניתוח', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedPeriod, selectedTeam, showNotification]); // הוספת תלויות רלוונטיות

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
  };

  const handlePeriodChange = (event) => {
    setSelectedPeriod(event.target.value);
  };

  const handleTeamChange = (event) => {
    setSelectedTeam(event.target.value);
  };

  const handleOpenSoldierStats = (soldier) => {
    setSelectedSoldier(soldier);
    setOpenSoldierStats(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          ניתוח ומעקב אימונים
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<PrintIcon />} 
            sx={{ 
              mr: 1,
              borderRadius: 2, 
              textTransform: 'none',
            }}
          >
            הפק דוח
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 10px rgba(0,0,0,0.2)',
              }
            }}
          >
            רענן נתונים
          </Button>
        </Box>
      </Box>

      <Paper 
        elevation={2} 
        sx={{ 
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              py: 1,
              px: 3,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
            },
            '& .Mui-selected': {
              fontWeight: 700,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: 3,
                bgcolor: 'primary.main',
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3
              }
            }
          }}
        >
          <Tab icon={<BarChartIcon sx={{ mr: 1 }} />} iconPosition="start" label="סיכום כולל" />
          <Tab icon={<AccessTimeIcon sx={{ mr: 1 }} />} iconPosition="start" label="תרגול מחצ״ים" />
          <Tab icon={<PersonIcon sx={{ mr: 1 }} />} iconPosition="start" label="תרגול חובשים" />
          <Tab icon={<GroupIcon sx={{ mr: 1 }} />} iconPosition="start" label="תרגול צוותי" />
          <Tab icon={<CompareArrowsIcon sx={{ mr: 1 }} />} iconPosition="start" label="השוואה" />
        </Tabs>
      </Paper>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={8}>
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 1,
              flexWrap: { xs: 'wrap', md: 'nowrap' } 
            }}
          >
            <FormControl 
              variant="outlined" 
              size="small" 
              sx={{ 
                minWidth: 150,
                bgcolor: 'white', 
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              <InputLabel id="period-filter-label">תקופה</InputLabel>
              <Select
                labelId="period-filter-label"
                value={selectedPeriod}
                onChange={handlePeriodChange}
                label="תקופה"
              >
                <MenuItem value="week">שבוע אחרון</MenuItem>
                <MenuItem value="month">חודש אחרון</MenuItem>
                <MenuItem value="quarter">רבעון אחרון</MenuItem>
                <MenuItem value="year">שנה אחרונה</MenuItem>
              </Select>
            </FormControl>
            <FormControl 
              variant="outlined" 
              size="small" 
              sx={{ 
                minWidth: 120,
                bgcolor: 'white', 
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              <InputLabel id="team-filter-label">צוות</InputLabel>
              <Select
                labelId="team-filter-label"
                value={selectedTeam}
                onChange={handleTeamChange}
                label="צוות"
              >
                <MenuItem value="">הכל</MenuItem>
                {mockDataService.teams.map((team) => (
                  <MenuItem key={team} value={team}>
                    {team}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl 
              variant="outlined" 
              size="small" 
              sx={{ 
                minWidth: 150,
                bgcolor: 'white', 
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              <InputLabel id="report-filter-label">סינון</InputLabel>
              <Select
                labelId="report-filter-label"
                value={selectedFilter}
                onChange={handleFilterChange}
                label="סינון"
              >
                <MenuItem value="all">הכל</MenuItem>
                <MenuItem value="completed">הושלם</MenuItem>
                <MenuItem value="incomplete">לא הושלם</MenuItem>
                <MenuItem value="improvement">שיפור נדרש</MenuItem>
                <MenuItem value="excellence">מצוינות</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="אפס סינון">
              <IconButton 
                onClick={() => {
                  setSelectedPeriod('month');
                  setSelectedTeam('');
                  setSelectedFilter('all');
                }}
                sx={{ 
                  bgcolor: 'white',
                  '&:hover': { bgcolor: '#f5f5f5' } 
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>

      {selectedTab === 0 && (
        // סיכום כולל
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ borderRadius: 2, p: 2, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                סיכום ביצועים כולל
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" gutterBottom>
                      סך כל האימונים
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {statsData.tourniquetStats.totalTrainings + statsData.medicStats.totalTrainings + statsData.teamStats.totalTrainings}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      bgcolor: 'success.main', 
                      color: 'white',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" gutterBottom>
                      אחוז הצלחה
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {statsData.tourniquetStats.passRate}%
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      bgcolor: 'warning.main', 
                      color: 'white',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" gutterBottom>
                      זמן ממוצע CAT
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {statsData.tourniquetStats.averageTime}s
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    התפלגות אימונים לפי סוג
                  </Typography>
                  <Box sx={{ height: '200px', width: '100%', p: 1, display: 'flex', alignItems: 'flex-end' }}>
                    {/* Simple visualization of training distribution by type */}
                    <Box sx={{ flexGrow: 1, height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
                        <Box 
                          sx={{ 
                            width: '80%', 
                            height: `${(statsData.tourniquetStats.totalTrainings / (statsData.tourniquetStats.totalTrainings + statsData.medicStats.totalTrainings + statsData.teamStats.totalTrainings)) * 100}%`, 
                            bgcolor: 'primary.main',
                            borderRadius: '4px 4px 0 0',
                            minHeight: '20px',
                            transition: 'height 0.3s ease'
                          }}
                        />
                        <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>
                          תרגול מחצ"ים
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {statsData.tourniquetStats.totalTrainings} תרגולים
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
                        <Box 
                          sx={{ 
                            width: '80%', 
                            height: `${(statsData.medicStats.totalTrainings / (statsData.tourniquetStats.totalTrainings + statsData.medicStats.totalTrainings + statsData.teamStats.totalTrainings)) * 100}%`, 
                            bgcolor: 'success.main',
                            borderRadius: '4px 4px 0 0',
                            minHeight: '20px',
                            transition: 'height 0.3s ease'
                          }}
                        />
                        <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>
                          תרגול חובשים
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {statsData.medicStats.totalTrainings} תרגולים
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
                        <Box 
                          sx={{ 
                            width: '80%', 
                            height: `${(statsData.teamStats.totalTrainings / (statsData.tourniquetStats.totalTrainings + statsData.medicStats.totalTrainings + statsData.teamStats.totalTrainings)) * 100}%`, 
                            bgcolor: 'warning.main',
                            borderRadius: '4px 4px 0 0',
                            minHeight: '20px',
                            transition: 'height 0.3s ease'
                          }}
                        />
                        <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>
                          תרגול צוותי
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {statsData.teamStats.totalTrainings} תרגולים
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper elevation={2} sx={{ borderRadius: 2, p: 2, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                ביצועים לפי צוות
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>צוות</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>תרגול מחצ"ים</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>תרגול חובשים</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>תרגול צוותי</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>סך הכל</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockDataService.teams.map(team => {
                      const tourniquetPerformance = statsData.tourniquetStats.teamPerformance[team] || { avg: 0, passRate: 0 };
                      const teamPerformance = statsData.teamStats.teamPerformance[team] || { count: 0, avg: 0 };
                      
                      return (
                        <TableRow 
                          key={team}
                          hover
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                          }}
                          onClick={() => setSelectedTeam(team)}
                        >
                          <TableCell>
                            <Chip 
                              label={team} 
                              size="small" 
                              sx={{ 
                                bgcolor: team === 'אתק' ? '#bbdefb' :
                                team === 'רתק' ? '#c8e6c9' :
                                team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                                color: 'rgba(0, 0, 0, 0.7)',
                                fontWeight: 'bold',
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography 
                                sx={{ 
                                  fontWeight: 'medium',
                                  color: tourniquetPerformance.avg > 35 ? 'error.main' : 
                                         tourniquetPerformance.avg > 25 ? 'warning.main' : 'success.main'
                                }}
                              >
                                {tourniquetPerformance.avg}s
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>|</Typography>
                              <Typography 
                                sx={{ 
                                  fontWeight: 'medium',
                                  color: tourniquetPerformance.passRate >= 90 ? 'success.main' : 
                                         tourniquetPerformance.passRate >= 75 ? 'warning.main' : 'error.main'
                                }}
                              >
                                {tourniquetPerformance.passRate}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Rating 
                              value={3.8} 
                              readOnly 
                              precision={0.5}
                              size="small" 
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: 3.8 >= 4 ? 'success.main' : 
                                         3.8 >= 3 ? 'warning.main' : 'error.main',
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Rating 
                              value={teamPerformance.avg} 
                              readOnly 
                              precision={0.5}
                              size="small" 
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: teamPerformance.avg >= 4 ? 'success.main' : 
                                         teamPerformance.avg >= 3 ? 'warning.main' : 'error.main',
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Rating 
                              value={(tourniquetPerformance.passRate/20 + teamPerformance.avg + 3.8) / 3} 
                              readOnly 
                              precision={0.5}
                              size="small" 
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: (tourniquetPerformance.passRate/20 + teamPerformance.avg + 3.8) / 3 >= 4 ? 'success.main' : 
                                         (tourniquetPerformance.passRate/20 + teamPerformance.avg + 3.8) / 3 >= 3 ? 'warning.main' : 'error.main',
                                }
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                mb: 3
              }}
            >
              <CardHeader 
                title="ביצועי מצטיינים" 
                titleTypographyProps={{ fontWeight: 'bold' }}
                sx={{ 
                  bgcolor: '#f5f5f5', 
                  borderBottom: '1px solid #e0e0e0',
                  p: 2
                }}
              />
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.secondary">
                  מחצ"ים - זמני CAT מהירים ביותר
                </Typography>
                <List dense>
                  {mockDataService.soldiers.slice(0, 5).map((soldier, index) => (
                    <ListItem 
                      key={soldier.id}
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography sx={{ fontWeight: 'medium', color: 'success.main' }}>
                            {20 + index}s
                          </Typography>
                        </Box>
                      }
                      sx={{ 
                        mb: 1, 
                        borderRadius: 2,
                        bgcolor: 'white',
                        border: '1px solid #eee',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                      onClick={() => handleOpenSoldierStats(soldier)}
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            fontSize: '0.9rem',
                            bgcolor: soldier.team === 'אתק' ? '#bbdefb' :
                                    soldier.team === 'רתק' ? '#c8e6c9' :
                                    soldier.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={soldier.name} 
                        secondary={soldier.team}
                        primaryTypographyProps={{ fontWeight: 'medium', variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.secondary">
                  חובשים - דירוגים גבוהים ביותר
                </Typography>
                <List dense>
                  {mockDataService.medics.slice(0, 5).map((medic, index) => (
                    <ListItem 
                      key={medic.id}
                      secondaryAction={
                        <Rating 
                          value={5 - index * 0.2} 
                          readOnly 
                          size="small" 
                          sx={{
                            '& .MuiRating-iconFilled': {
                              color: 'success.main'
                            }
                          }}
                        />
                      }
                      sx={{ 
                        mb: 1, 
                        borderRadius: 2,
                        bgcolor: 'white',
                        border: '1px solid #eee',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            fontSize: '0.9rem',
                            bgcolor: medic.team === 'אתק' ? '#bbdefb' :
                                    medic.team === 'רתק' ? '#c8e6c9' :
                                    medic.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={medic.name} 
                        secondary={medic.team}
                        primaryTypographyProps={{ fontWeight: 'medium', variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
            
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <CardHeader 
                title="דורשי שיפור" 
                titleTypographyProps={{ fontWeight: 'bold' }}
                sx={{ 
                  bgcolor: '#ffebee', 
                  borderBottom: '1px solid #ffcdd2',
                  p: 2
                }}
              />
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="error.main">
                  חיילים שלא תורגלו החודש
                </Typography>
                <List dense>
                  {mockDataService.soldiers.slice(5, 10).map((soldier, index) => (
                    <ListItem 
                      key={soldier.id}
                      secondaryAction={
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          sx={{ borderRadius: 4, fontSize: '0.7rem', py: 0 }}
                        >
                          תזכורת
                        </Button>
                      }
                      sx={{ 
                        mb: 1, 
                        borderRadius: 2,
                        bgcolor: 'white',
                        border: '1px solid #ffcdd2',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                      onClick={() => handleOpenSoldierStats(soldier)}
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            fontSize: '0.9rem',
                            bgcolor: 'error.light',
                            color: 'error.main'
                          }}
                        >
                          !
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={soldier.name} 
                        secondary={soldier.team}
                        primaryTypographyProps={{ fontWeight: 'medium', variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="error.main">
                  זמני CAT איטיים ביותר
                </Typography>
                <List dense>
                  {mockDataService.soldiers.slice(10, 15).map((soldier, index) => (
                    <ListItem 
                      key={soldier.id}
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography sx={{ fontWeight: 'medium', color: 'error.main' }}>
                            {40 + index * 2}s
                          </Typography>
                        </Box>
                      }
                      sx={{ 
                        mb: 1, 
                        borderRadius: 2,
                        bgcolor: 'white',
                        border: '1px solid #ffcdd2',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                      onClick={() => handleOpenSoldierStats(soldier)}
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            fontSize: '0.9rem',
                            bgcolor: 'error.light',
                            color: 'error.main'
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={soldier.name} 
                        secondary={soldier.team}
                        primaryTypographyProps={{ fontWeight: 'medium', variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {selectedTab === 1 && (
        // תרגול מחצ"ים
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ borderRadius: 2, p: 2, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                נתוני תרגול מחצ"ים - זמני CAT
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" gutterBottom>
                      סך כל התרגולים
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {statsData.tourniquetStats.totalTrainings}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      bgcolor: 'warning.main', 
                      color: 'white',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" gutterBottom>
                      זמן ממוצע
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {statsData.tourniquetStats.averageTime}s
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      bgcolor: 'success.main', 
                      color: 'white',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" gutterBottom>
                      אחוז הצלחה
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {statsData.tourniquetStats.passRate}%
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 2 }}>
                התקדמות לאורך זמן
              </Typography>
              <Box sx={{ height: '200px', width: '100%', p: 1 }}>
                {/* Line graph visualization for CAT times over months */}
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative', px: 2 }}>
                  {/* Y-axis labels */}
                  <Box sx={{ position: 'absolute', height: '100%', left: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">0s</Typography>
                    <Typography variant="caption" color="text.secondary">20s</Typography>
                    <Typography variant="caption" color="text.secondary">40s</Typography>
                  </Box>
                  
                  {/* Graph area */}
                  <Box sx={{ flexGrow: 1, height: '100%', display: 'flex', alignItems: 'flex-end', ml: 4 }}>
                    {statsData.tourniquetStats.monthlyProgress.map((month, index, arr) => (
                      <Box key={month.month} sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        width: `${100/arr.length}%`,
                        position: 'relative',
                        height: '100%'
                      }}>
                        {/* Horizontal grid line */}
                        <Box sx={{ 
                          position: 'absolute', 
                          width: '100%', 
                          borderTop: '1px dashed #e0e0e0',
                          top: 0,
                          left: 0
                        }} />
                        <Box sx={{ 
                          position: 'absolute', 
                          width: '100%', 
                          borderTop: '1px dashed #e0e0e0',
                          top: '50%',
                          left: 0
                        }} />
                        
                        {/* Bar for average time */}
                        <Box sx={{ 
                          position: 'absolute',
                          bottom: 0,
                          height: `${(month.avg / 40) * 100}%`,
                          width: '50%',
                          bgcolor: month.avg > 35 ? 'error.main' : 
                                   month.avg > 25 ? 'warning.main' : 'success.main',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease'
                        }} />
                        
                        {/* X-axis label */}
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ position: 'absolute', bottom: -20, whiteSpace: 'nowrap' }}
                        >
                          {month.month}
                        </Typography>
                        
                        {/* Value label */}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            position: 'absolute', 
                            bottom: `${(month.avg / 40) * 100}%`,
                            color: month.avg > 35 ? 'error.main' : 
                                   month.avg > 25 ? 'warning.main' : 'success.main',
                            fontWeight: 'bold',
                            mt: 1
                          }}
                        >
                          {month.avg}s
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>
            
            <Paper elevation={2} sx={{ borderRadius: 2, p: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                ביצועים לפי צוות
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>צוות</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>זמן ממוצע</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>אחוז הצלחה</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>מגמה</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(statsData.tourniquetStats.teamPerformance).map(([team, performance]) => (
                      <TableRow 
                        key={team}
                        hover
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                        }}
                        onClick={() => setSelectedTeam(team)}
                      >
                        <TableCell>
                          <Chip 
                            label={team} 
                            size="small" 
                            sx={{ 
                              bgcolor: team === 'אתק' ? '#bbdefb' :
                              team === 'רתק' ? '#c8e6c9' :
                              team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                              color: 'rgba(0, 0, 0, 0.7)',
                              fontWeight: 'bold',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography 
                              sx={{ 
                                fontWeight: 'medium',
                                color: performance.avg > 35 ? 'error.main' : 
                                       performance.avg > 25 ? 'warning.main' : 'success.main'
                              }}
                            >
                              {performance.avg} שניות
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ 
                              width: '100px', 
                              height: '8px', 
                              bgcolor: 'grey.200', 
                              borderRadius: '4px',
                              mr: 1
                            }}>
                              <Box sx={{ 
                                width: `${performance.passRate}%`, 
                                height: '100%', 
                                bgcolor: performance.passRate >= 90 ? 'success.main' : 
                                         performance.passRate >= 75 ? 'warning.main' : 'error.main',
                                borderRadius: '4px'
                              }} />
                            </Box>
                            <Typography 
                              sx={{ 
                                fontWeight: 'medium',
                                color: performance.passRate >= 90 ? 'success.main' : 
                                       performance.passRate >= 75 ? 'warning.main' : 'error.main'
                              }}
                            >
                              {performance.passRate}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrendingUpIcon sx={{ 
                              color: performance.passRate >= 90 ? 'success.main' : 
                                     performance.passRate >= 75 ? 'warning.main' : 'error.main',
                              mr: 1
                            }} />
                            <Typography 
                              sx={{ 
                                fontWeight: 'medium',
                                color: performance.passRate >= 90 ? 'success.main' : 
                                       performance.passRate >= 75 ? 'warning.main' : 'error.main'
                              }}
                            >
                              משתפר
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                mb: 3
              }}
            >
              <CardHeader 
                title="זמני CAT מהירים ביותר" 
                titleTypographyProps={{ fontWeight: 'bold' }}
                sx={{ 
                  bgcolor: '#f5f5f5', 
                  borderBottom: '1px solid #e0e0e0',
                  p: 2
                }}
              />
              <CardContent>
                <List>
                  {mockDataService.soldiers.slice(0, 5).map((soldier, index) => (
                    <ListItem 
                      key={soldier.id}
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography sx={{ fontWeight: 'medium', color: 'success.main' }}>
                            {20 + index}s
                          </Typography>
                        </Box>
                      }
                      sx={{ 
                        mb: 1, 
                        borderRadius: 2,
                        bgcolor: 'white',
                        border: '1px solid #eee',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                      onClick={() => handleOpenSoldierStats(soldier)}
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            fontSize: '0.9rem',
                            bgcolor: 'success.light',
                            color: 'success.contrastText',
                            fontWeight: 'bold'
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={soldier.name} 
                        secondary={soldier.team}
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
            
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                mb: 3
              }}
            >
              <CardHeader 
                title="חיילים שלא תורגלו החודש" 
                titleTypographyProps={{ fontWeight: 'bold' }}
                sx={{ 
                  bgcolor: '#ffebee', 
                  borderBottom: '1px solid #ffcdd2',
                  p: 2
                }}
              />
              <CardContent>
                <List>
                  {mockDataService.soldiers.slice(5, 10).map((soldier) => (
                    <ListItem 
                      key={soldier.id}
                      secondaryAction={
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          sx={{ borderRadius: 4 }}
                        >
                          תזכורת
                        </Button>
                      }
                      sx={{ 
                        mb: 1, 
                        borderRadius: 2,
                        bgcolor: 'white',
                        border: '1px solid #ffcdd2',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                      onClick={() => handleOpenSoldierStats(soldier)}
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            fontSize: '0.9rem',
                            bgcolor: 'error.light',
                            color: 'error.main'
                          }}
                        >
                          !
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={soldier.name} 
                        secondary={soldier.team}
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  startIcon={<NotificationsIcon />}
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  שלח תזכורת לכולם
                </Button>
              </CardContent>
            </Card>
            
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <CardHeader 
                title="המלצות" 
                titleTypographyProps={{ fontWeight: 'bold' }}
                sx={{ 
                  bgcolor: '#e3f2fd', 
                  borderBottom: '1px solid #bbdefb',
                  p: 2
                }}
              />
              <CardContent>
                <List>
                  <ListItem 
                    sx={{ 
                      mb: 1, 
                      borderRadius: 2,
                      bgcolor: 'white',
                      border: '1px solid #bbdefb',
                      transition: 'all 0.2s',
                    }}
                  >
                    <ListItemIcon>
                      <InfoIcon sx={{ color: 'info.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="בצע תרגול קבוצתי לצוות מפלג" 
                      secondary="ביצועים נמוכים מהממוצע, נדרש תרגול נוסף"
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                  <ListItem 
                    sx={{ 
                      mb: 1, 
                      borderRadius: 2,
                      bgcolor: 'white',
                      border: '1px solid #bbdefb',
                      transition: 'all 0.2s',
                    }}
                  >
                    <ListItemIcon>
                      <InfoIcon sx={{ color: 'info.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="קבע תרגול מתקן לחיילים עם זמן CAT > 35 שניות" 
                      secondary="נדרש שיפור טכניקה"
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                  <ListItem 
                    sx={{ 
                      mb: 1, 
                      borderRadius: 2,
                      bgcolor: 'white',
                      border: '1px solid #bbdefb',
                      transition: 'all 0.2s',
                    }}
                  >
                    <ListItemIcon>
                      <InfoIcon sx={{ color: 'info.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="יש לבצע ריענון תרגול כל 30 יום לכל הפחות" 
                      secondary="מומלץ לקבוע תרגולים חודשיים קבועים"
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {(selectedTab === 2 || selectedTab === 3 || selectedTab === 4) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, flexDirection: 'column' }}>
          <InfoIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {selectedTab === 2 && "סטטיסטיקת תרגול חובשים"}
            {selectedTab === 3 && "סטטיסטיקת תרגול צוותי"}
            {selectedTab === 4 && "השוואת ביצועים"}
          </Typography>
          <Typography color="text.secondary" align="center">
            נתוני הניתוח המפורטים של טאב זה יהיו זמינים בקרוב כאשר יתווספו נתונים נוספים.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setSelectedTab(0)}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            חזור לניתוח הכולל
          </Button>
        </Box>
      )}

      {/* דיאלוג לפרטי חייל */}
      <Dialog
        open={openSoldierStats}
        onClose={() => setOpenSoldierStats(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        {selectedSoldier && (
          <>
            <DialogTitle 
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                p: 2
              }}
            >
              <Box display="flex" alignItems="center">
                <BarChartIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  נתוני תרגול - {selectedSoldier.name}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ mb: 2, borderRadius: 2 }}>
                    <CardHeader 
                      title="פרטי חייל" 
                      titleTypographyProps={{ fontWeight: 'bold' }}
                      sx={{ 
                        bgcolor: '#f5f5f5', 
                        borderBottom: '1px solid #e0e0e0',
                        p: 2
                      }}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 64, 
                              height: 64, 
                              mr: 2,
                              fontSize: '1.5rem',
                              bgcolor: selectedSoldier.team === 'אתק' ? '#bbdefb' :
                                      selectedSoldier.team === 'רתק' ? '#c8e6c9' :
                                      selectedSoldier.team === 'חוד' ? '#ffe0b2' : '#e1bee7'
                            }}
                          >
                            {selectedSoldier.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">{selectedSoldier.name}</Typography>
                            <Chip 
                              label={selectedSoldier.team} 
                              size="small" 
                              sx={{ 
                                bgcolor: selectedSoldier.team === 'אתק' ? '#bbdefb' :
                                        selectedSoldier.team === 'רתק' ? '#c8e6c9' :
                                        selectedSoldier.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                                color: 'rgba(0, 0, 0, 0.7)',
                                fontWeight: 'bold',
                                '& .MuiChip-label': { px: 1 }
                              }} 
                            />
                          </Box>
                        </Box>
                        
                        <Divider />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">מספר אישי:</Typography>
                          <Typography variant="body2" fontWeight="medium">{selectedSoldier.personal_id}</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">זמן CAT ממוצע:</Typography>
                          <Typography 
                            variant="body2" 
                            fontWeight="medium"
                            color="success.main"
                          >
                            22 שניות
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">אחוז הצלחה:</Typography>
                          <Typography variant="body2" fontWeight="medium" color="success.main">
                            92%
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">תרגולים סך הכל:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            6 תרגולים
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">דירוג בצוות:</Typography>
                          <Chip
                            size="small"
                            label="#2"
                            color="success"
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                  
                  <Card sx={{ borderRadius: 2 }}>
                    <CardHeader 
                      title="המלצות" 
                      titleTypographyProps={{ fontWeight: 'bold' }}
                      sx={{ 
                        bgcolor: '#e3f2fd', 
                        borderBottom: '1px solid #bbdefb',
                        p: 2
                      }}
                    />
                    <CardContent>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckIcon sx={{ color: 'success.main' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary="ביצועים טובים מאוד" 
                            secondary="ממשיך לשמור על זמני CAT מתחת ל-25 שניות"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <InfoIcon sx={{ color: 'info.main' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary="בצע ריענון תרגול" 
                            secondary="לשמירה על רמת מיומנות גבוהה"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <StarIcon sx={{ color: 'warning.main' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary="פוטנציאל למדריך" 
                            secondary="שקול להכשיר כמדריך מחצ\'י תרגולים עקב ביצועים מצוינים"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Paper sx={{ borderRadius: 2, p: 2, mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      היסטוריית תרגולים
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>תאריך</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>זמן CAT</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>תוצאה</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>הערות</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>{formatDate('2025-03-05')}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                <Typography sx={{ fontWeight: 'medium', color: 'success.main' }}>
                                  22 שניות
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label="עבר"
                                color="success"
                                variant="filled"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>שיפור ניכר בזמן ההנחה</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>{formatDate('2025-02-05')}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                <Typography sx={{ fontWeight: 'medium', color: 'success.main' }}>
                                  28 שניות
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label="עבר"
                                color="success"
                                variant="filled"
                                size="small"
                              />
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>{formatDate('2025-01-10')}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                <Typography sx={{ fontWeight: 'medium', color: 'warning.main' }}>
                                  34 שניות
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label="עבר"
                                color="success"
                                variant="filled"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>בוצע תרגול בתנאי לחץ</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                  
                  <Paper sx={{ borderRadius: 2, p: 2 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      מגמת התקדמות זמני CAT
                    </Typography>
                    <Box sx={{ height: '250px', width: '100%', p: 1 }}>
                      {/* Line chart visualization of CAT times over time */}
                      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', height: '200px', position: 'relative' }}>
                          {/* Y-axis labels */}
                          <Box sx={{ width: '30px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">50s</Typography>
                            <Typography variant="caption" color="text.secondary">40s</Typography>
                            <Typography variant="caption" color="text.secondary">30s</Typography>
                            <Typography variant="caption" color="text.secondary">20s</Typography>
                            <Typography variant="caption" color="text.secondary">10s</Typography>
                          </Box>
                          
                          {/* Graph area */}
                          <Box sx={{ flexGrow: 1, position: 'relative', height: '100%' }}>
                            {/* Horizontal grid lines */}
                            {[0, 25, 50, 75, 100].map(percent => (
                              <Box 
                                key={percent}
                                sx={{ 
                                  position: 'absolute',
                                  width: '100%',
                                  borderTop: '1px dashed #e0e0e0',
                                  top: `${100 - percent}%`,
                                }}
                              />
                            ))}
                            
                            {/* Data points and line */}
                            <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                              <path 
                                d="M 50,160 L 150,136 L 250,68 L 350,44"
                                fill="none"
                                stroke="#1976d2"
                                strokeWidth="3"
                              />
                              <circle cx="50" cy="160" r="6" fill="#1976d2" />
                              <circle cx="150" cy="136" r="6" fill="#1976d2" />
                              <circle cx="250" cy="68" r="6" fill="#1976d2" />
                              <circle cx="350" cy="44" r="6" fill="#1976d2" />
                              
                              {/* Target line */}
                              <path 
                                d="M 0,100 L 400,100"
                                fill="none"
                                stroke="#4caf50"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                              />
                              <text x="370" y="95" fontSize="12" fill="#4caf50" fontWeight="bold">25s</text>
                            </svg>
                          </Box>
                        </Box>
                        
                        {/* X-axis */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', ml: '30px', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">ינואר 2025</Typography>
                          <Typography variant="caption" color="text.secondary">פברואר 2025</Typography>
                          <Typography variant="caption" color="text.secondary">מרץ 2025</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Chip 
                        icon={<TrendingUpIcon />} 
                        label="מגמת שיפור מתמדת" 
                        color="success" 
                        variant="outlined"
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Button 
                onClick={() => setOpenSoldierStats(false)}
                variant="outlined"
                startIcon={<CloseIcon />}
              >
                סגור
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TrainingManagement