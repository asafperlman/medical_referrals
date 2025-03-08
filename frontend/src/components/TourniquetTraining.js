import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  Backdrop,
  FormControlLabel,
  Checkbox,
  Stack,
  Badge,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  CalendarToday as CalendarTodayIcon,
  Timer as TimerIcon,
  Save as SaveIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// API service functions
const apiService = {
  // Team Training API
  fetchTeams: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/teams/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },
  
  // Soldier API
  fetchSoldiers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainings/soldiers/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching soldiers:', error);
      throw error;
    }
  },
  
  // Tourniquet Training API
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
  
  bulkCreateTourniquetTrainings: async (dataArray) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainings/tourniquet/bulk_create/`, dataArray);
      return response.data;
    } catch (error) {
      console.error('Error bulk creating tourniquet trainings:', error);
      throw error;
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

const TourniquetTraining = ({ showNotification }) => {
  const [trainings, setTrainings] = useState([]);
  const [soldiers, setSoldiers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openGroupTrainingForm, setOpenGroupTrainingForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedSoldiers, setSelectedSoldiers] = useState([]);
  const [filterTeam, setFilterTeam] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [openSoldierDetails, setOpenSoldierDetails] = useState(false);
  const [selectedSoldier, setSelectedSoldier] = useState(null);
  
  // Data for individual training
  const [formData, setFormData] = useState({
    soldier_id: '',
    training_date: '',
    cat_time: '',
    passed: true,
    notes: '',
  });

  // Data for group training
  const [groupFormData, setGroupFormData] = useState({
    training_date: new Date().toISOString().split('T')[0],
    team: '',
    general_notes: ''
  });
  
  // Data for individual soldier performance in group training
  const [soldierTrainingData, setSoldierTrainingData] = useState({});

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Try to fetch from API first
        let teamsData = [];
        let soldiersData = [];
        let trainingsData = [];
        
        try {
          teamsData = await apiService.fetchTeams();
        } catch (err) {
          console.warn('Error fetching teams, using default list:', err);
          teamsData = ['חוד', 'אתק', 'רתק', 'מפלג'];
        }
        
        try {
          soldiersData = await apiService.fetchSoldiers();
        } catch (err) {
          console.warn('Error fetching soldiers:', err);
          // Use mock data as fallback
          soldiersData = [
            { id: 1, name: 'נועם עקה זוהר', team: 'חוד', personal_id: '9114251' },
            { id: 2, name: 'נהר שדמי', team: 'חוד', personal_id: '9292413' },
            { id: 3, name: 'יואב אטלן', team: 'חוד', personal_id: '9067695' },
            { id: 4, name: 'בן שטינברג', team: 'חוד', personal_id: '9180189' },
            { id: 5, name: 'יהלי חמו', team: 'חוד', personal_id: '9407190' },
          ];
        }
        
        try {
          trainingsData = await apiService.fetchTourniquetTrainings();
        } catch (err) {
          console.warn('Error fetching trainings:', err);
          // Use mock data as fallback
          trainingsData = [
            { id: 1, soldier_id: 1, training_date: '2025-02-05', cat_time: '28', passed: true, notes: '' },
            { id: 2, soldier_id: 2, training_date: '2025-02-07', cat_time: '25', passed: true, notes: '' },
          ];
        }
        
        setTeams(Array.isArray(teamsData) ? teamsData : ['חוד', 'אתק', 'רתק', 'מפלג']);
        setSoldiers(soldiersData);
        setTrainings(trainingsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching training data:', err);
        setError('שגיאה בטעינת נתונים. נסה שוב.');
        // Use mock data as fallback if API fails
        setTeams(['חוד', 'אתק', 'רתק', 'מפלג']);
        setSoldiers([]);
        setTrainings([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helper functions to get soldier trainings and check if trained this month
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

  // Handle individual training form
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

  // Save individual training
  const handleSaveTraining = async () => {
    if (!formData.cat_time) {
      showNotification('יש להזין זמן CAT', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      let newTraining;
      
      try {
        // Try to save to API
        newTraining = await apiService.createTourniquetTraining(formData);
      } catch (err) {
        // If API call fails, create a local mock object
        console.error('Error saving to API, creating local data instead:', err);
        newTraining = {
          id: Math.max(0, ...trainings.map((t) => t.id || 0)) + 1,
          ...formData,
          soldier_name: soldiers.find(s => s.id === formData.soldier_id)?.name,
          soldier_team: soldiers.find(s => s.id === formData.soldier_id)?.team
        };
      }
      
      // Update local state with the new training
      setTrainings(prevTrainings => [...prevTrainings, newTraining]);
      setOpenForm(false);
      showNotification('התרגול נשמר בהצלחה', 'success');
    } catch (error) {
      console.error('Error saving training:', error);
      showNotification('שגיאה בשמירת הנתונים', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Group training handlers
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

  const handleGroupFormChange = (e) => {
    const { name, value } = e.target;
    setGroupFormData({ ...groupFormData, [name]: value });
    
    if (name === 'team') {
      setSelectedTeam(value);
      setSelectedSoldiers([]);
    }
  };

  const handleNextToSelectSoldiers = () => {
    if (!groupFormData.team || !groupFormData.training_date) {
      showNotification('אנא בחר צוות ותאריך', 'error');
      return;
    }
    setActiveStep(1);
  };

  const handleSelectSoldier = (soldier) => {
    if (selectedSoldiers.includes(soldier.id)) {
      setSelectedSoldiers(selectedSoldiers.filter(id => id !== soldier.id));
    } else {
      setSelectedSoldiers([...selectedSoldiers, soldier.id]);
    }
  };

  const handleNextToEnterData = () => {
    if (selectedSoldiers.length === 0) {
      showNotification('אנא בחר לפחות חייל אחד', 'error');
      return;
    }
    
    // Initialize data for each selected soldier
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

  const handleSoldierDataChange = (soldierId, field, value) => {
    setSoldierTrainingData(prev => ({
      ...prev,
      [soldierId]: {
        ...prev[soldierId],
        [field]: value
      }
    }));
  };

  // Save group training data
  const handleSaveGroupTraining = async () => {
    // Check if all CAT times are entered
    const missingData = selectedSoldiers.some(id => !soldierTrainingData[id].cat_time);
    
    if (missingData) {
      showNotification('נא להזין זמן הנחת CAT עבור כל החיילים', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare training data for all selected soldiers
      const trainingDataArray = selectedSoldiers.map(soldierId => ({
        soldier_id: soldierId,
        training_date: groupFormData.training_date,
        cat_time: soldierTrainingData[soldierId].cat_time,
        passed: soldierTrainingData[soldierId].passed,
        notes: soldierTrainingData[soldierId].notes || groupFormData.general_notes
      }));
      
      let newTrainings = [];
      
      try {
        // Try to save to API
        newTrainings = await apiService.bulkCreateTourniquetTrainings(trainingDataArray);
      } catch (err) {
        // If API call fails, create local mock objects
        console.error('Error saving to API, creating local data instead:', err);
        newTrainings = trainingDataArray.map((data, index) => ({
          id: Math.max(0, ...trainings.map(t => t.id || 0)) + 1 + index,
          ...data,
          soldier_name: soldiers.find(s => s.id === data.soldier_id)?.name,
          soldier_team: soldiers.find(s => s.id === data.soldier_id)?.team
        }));
      }
      
      // Update local state with the new trainings
      setTrainings(prevTrainings => [...prevTrainings, ...newTrainings]);
      setOpenGroupTrainingForm(false);
      showNotification(`נשמרו נתוני תרגול עבור ${selectedSoldiers.length} חיילים`, 'success');
    } catch (error) {
      console.error('Error saving group training:', error);
      showNotification('שגיאה בשמירת נתוני התרגול', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle opening soldier details
  const handleOpenSoldierDetails = (soldier) => {
    setSelectedSoldier(soldier);
    setOpenSoldierDetails(true);
  };

  // Calculate average CAT time for a soldier
  const calculateAverageCatTime = (soldierId) => {
    const soldierTrainings = getSoldierTrainings(soldierId);
    if (soldierTrainings.length === 0) return 0;
    
    const totalTime = soldierTrainings.reduce((sum, t) => sum + parseInt(t.cat_time || 0), 0);
    return (totalTime / soldierTrainings.length).toFixed(1);
  };

  // Calculate pass rate for a soldier
  const calculatePassRate = (soldierId) => {
    const soldierTrainings = getSoldierTrainings(soldierId);
    if (soldierTrainings.length === 0) return 0;
    
    const passedCount = soldierTrainings.filter(t => t.passed).length;
    return ((passedCount / soldierTrainings.length) * 100).toFixed(0);
  };

  // Get list of soldiers who haven't trained this month
  const getUntrained = () => {
    return soldiers.filter(soldier => !isTrainedThisMonth(soldier.id));
  };

  // Filter soldiers based on search and team filter
  const filteredSoldiers = useMemo(() => {
    return soldiers.filter(soldier => {
      const matchesTeam = filterTeam ? soldier.team === filterTeam : true;
      const matchesSearch = searchQuery === '' || 
        soldier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        soldier.personal_id.includes(searchQuery);
      
      return matchesTeam && matchesSearch;
    });
  }, [soldiers, filterTeam, searchQuery]);

  if (loading && soldiers.length === 0) {
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

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              נסה שוב
            </Button>
          }
        >
          {error}
        </Alert>
      )}

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
                          value={Math.round((soldiers.filter((s) => isTrainedThisMonth(s.id)).length / (soldiers.length || 1)) * 100) || 0}
                          size={150}
                          thickness={5}
                          sx={{ 
                            color: 
                              Math.round((soldiers.filter((s) => isTrainedThisMonth(s.id)).length / (soldiers.length || 1)) * 100) >= 80 ? 'success.main' : 
                              Math.round((soldiers.filter((s) => isTrainedThisMonth(s.id)).length / (soldiers.length || 1)) * 100) >= 50 ? 'warning.main' : 'error.main',
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
                            {Math.round((soldiers.filter((s) => isTrainedThisMonth(s.id)).length / (soldiers.length || 1)) * 100) || 0}%
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
                  startIcon={<GroupIcon />}
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
                  פרטי פרטי תרגול - {selectedSoldier.name}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        פרטים אישיים
                      </Typography>
                      <List>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <PersonIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="שם מלא" 
                            secondary={selectedSoldier.name} 
                            primaryTypographyProps={{ 
                              variant: 'body2', 
                              color: 'text.secondary' 
                            }}
                            secondaryTypographyProps={{ 
                              variant: 'body1', 
                              fontWeight: 'medium' 
                            }}
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <GroupIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="צוות" 
                            secondary={
                              <Chip 
                                label={selectedSoldier.team} 
                                size="small" 
                                sx={{ 
                                  bgcolor: selectedSoldier.team === 'אתק' ? '#bbdefb' :
                                          selectedSoldier.team === 'רתק' ? '#c8e6c9' :
                                          selectedSoldier.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                                  color: 'rgba(0, 0, 0, 0.7)',
                                  fontWeight: 'bold'
                                }} 
                              />
                            } 
                            primaryTypographyProps={{ 
                              variant: 'body2', 
                              color: 'text.secondary' 
                            }}
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <Badge 
                              badgeContent={selectedSoldier.personal_id} 
                              color="primary"
                              sx={{ 
                                '& .MuiBadge-badge': { 
                                  position: 'static',
                                  transform: 'none',
                                  fontSize: '0.75rem',
                                  padding: '0 6px',
                                  height: '18px',
                                  minWidth: '18px'
                                } 
                              }}
                            >
                              <PersonIcon sx={{ mr: 2 }} />
                            </Badge>
                          </ListItemIcon>
                          <ListItemText 
                            primary="מספר אישי" 
                            secondary={selectedSoldier.personal_id} 
                            primaryTypographyProps={{ 
                              variant: 'body2', 
                              color: 'text.secondary' 
                            }}
                            secondaryTypographyProps={{ 
                              variant: 'body1', 
                              fontWeight: 'medium' 
                            }}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                  
                  <Card variant="outlined" sx={{ borderRadius: 2, mt: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        נתוני תרגול
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              זמן CAT ממוצע
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <AccessTimeIcon sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="h5" fontWeight="bold">
                                {calculateAverageCatTime(selectedSoldier.id)}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              שניות
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              אחוז מעבר
                            </Typography>
                            <Typography 
                              variant="h5" 
                              fontWeight="bold" 
                              sx={{ 
                                color: parseInt(calculatePassRate(selectedSoldier.id)) >= 80 ? 'success.main' : 
                                      parseInt(calculatePassRate(selectedSoldier.id)) >= 50 ? 'warning.main' : 'error.main' 
                              }}
                            >
                              {calculatePassRate(selectedSoldier.id)}%
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      <Divider sx={{ my: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          סטטוס חודשי
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          {isTrainedThisMonth(selectedSoldier.id) ? (
                            <Chip 
                              icon={<CheckIcon />} 
                              label="בוצע תרגול החודש" 
                              color="success" 
                              variant="filled" 
                              sx={{ fontWeight: 'medium' }} 
                            />
                          ) : (
                            <Chip 
                              icon={<WarningIcon />} 
                              label="לא בוצע תרגול החודש" 
                              color="warning" 
                              variant="filled" 
                              sx={{ fontWeight: 'medium' }} 
                            />
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                    <CardHeader
                      title="היסטוריית תרגולים"
                      titleTypographyProps={{ fontWeight: 'bold' }}
                      sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}
                      action={
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => {
                            setOpenSoldierDetails(false);
                            handleAddTraining(selectedSoldier);
                          }}
                          sx={{ borderRadius: 2 }}
                        >
                          תרגול חדש
                        </Button>
                      }
                    />
                    <CardContent sx={{ p: 0 }}>
                      {getSoldierTrainings(selectedSoldier.id).length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Typography color="text.secondary" sx={{ mb: 2 }}>
                            לא נמצאו תרגולים קודמים
                          </Typography>
                          <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => {
                              setOpenSoldierDetails(false);
                              handleAddTraining(selectedSoldier);
                            }}
                          >
                            הוסף תרגול ראשון
                          </Button>
                        </Box>
                      ) : (
                        <TableContainer sx={{ maxHeight: 400 }}>
                          <Table stickyHeader size="small">
                            <TableHead>
                              <TableRow>
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
                                  <TableRow key={training.id}>
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
                                        size="small"
                                        variant={training.passed ? "filled" : "outlined"}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {training.notes || '-'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Button
                variant="outlined"
                onClick={() => setOpenSoldierDetails(false)}
                startIcon={<CloseIcon />}
              >
                סגור
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setOpenSoldierDetails(false);
                  handleAddTraining(selectedSoldier);
                }}
                startIcon={<AddIcon />}
              >
                תרגול חדש
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading && soldiers.length > 0}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default TourniquetTraining;