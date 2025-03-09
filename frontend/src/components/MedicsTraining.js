// Fixed MedicsTraining component
import React, { useState, useEffect } from 'react';
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
  Avatar,
  FormControlLabel,
  Switch,
  CircularProgress,
  InputAdornment,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Rating
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
  Person as PersonIcon,
  Group as GroupIcon,
  CalendarToday as CalendarTodayIcon,
  Save as SaveIcon,
  ArrowForward as ArrowForwardIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Flag as FlagIcon
} from '@mui/icons-material';

// רכיב תרגול חובשים - חדש ומלא
const MedicsTraining = ({ showNotification }) => {
  const [trainings, setTrainings] = useState([]);
  const [medics, setMedics] = useState([]);
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
        // In a real implementation, we would use the API service
        // const teamsData = await apiService.fetchTeams();
        // const medicsData = await apiService.fetchMedics();
        // const trainingsData = await apiService.fetchMedicTrainings();
        
        // For now, using mock data
        const teamsData = mockDataService.teams;
        const medicsData = mockDataService.medics;
        const trainingsData = mockDataService.medicTrainings;
        
        setTeams(teamsData);
        setMedics(medicsData);
        setTrainings(trainingsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching medic data:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  // פונקציה חדשה לפתיחת טופס תרגול חדש ללא בחירת חובש מראש
  const handleOpenNewTraining = () => {
    setSelectedMedic(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      medic_id: '',
      training_type: '',
      performance_rating: 3,
      attendance: true,
      notes: '',
      recommendations: ''
    });
    setOpenForm(true);
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
            onClick={handleOpenNewTraining}
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
              {selectedMedic 
                ? `תרגול חדש - ${selectedMedic.name}` 
                : formData.medic_id 
                  ? `תרגול חדש - ${medics.find(m => m.id === formData.medic_id)?.name || ''}` 
                  : 'תרגול חדש'
              }
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {!selectedMedic && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>חובש</InputLabel>
                  <Select 
                    name="medic_id" 
                    value={formData.medic_id} 
                    onChange={handleFormChange} 
                    label="חובש"
                  >
                    <MenuItem value="" disabled>בחר חובש</MenuItem>
                    {medics.map((medic) => (
                      <MenuItem key={medic.id} value={medic.id}>
                        {medic.name} - {medic.team}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} md={selectedMedic ? 6 : 6}>
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
            disabled={!formData.training_type || !formData.date || (!selectedMedic && !formData.medic_id)}
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

// Helper function for formatting dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Mock data service for development
const mockDataService = {
  teams: ['אתק', 'רתק', 'חוד', 'פלס"ר'],
  medics: [
    { id: 1, name: 'אלון כהן', team: 'אתק', role: 'חובש קרבי', experience: 'בכיר' },
    { id: 2, name: 'מיכל לוי', team: 'רתק', role: 'חובשת מתקדמת', experience: 'מתקדם' },
    { id: 3, name: 'עומר דוד', team: 'חוד', role: 'חובש צוות', experience: 'מתחיל' },
    { id: 4, name: 'דניאל אברהם', team: 'אתק', role: 'חובש קרבי', experience: 'מתקדם' },
    { id: 5, name: 'שירה גולן', team: 'פלס"ר', role: 'חובשת בכירה', experience: 'בכיר' },
    { id: 6, name: 'יואב נחום', team: 'רתק', role: 'חובש צוות', experience: 'מתחיל' },
    { id: 7, name: 'נועה ברק', team: 'חוד', role: 'חובשת מתקדמת', experience: 'מתקדם' },
    { id: 8, name: 'איתי שמש', team: 'פלס"ר', role: 'חובש קרבי', experience: 'מתחיל' }
  ],
  medicTrainings: [
    { id: 1, medic_id: 1, training_date: '2024-03-01', training_type: 'החייאה', performance_rating: 4, attendance: true, notes: 'ביצוע מצוין' },
    { id: 2, medic_id: 2, training_date: '2024-03-02', training_type: 'טיפול בפציעות ראש', performance_rating: 3, attendance: true, notes: '' },
    { id: 3, medic_id: 1, training_date: '2024-02-15', training_type: 'החדרת נתיב אוויר', performance_rating: 5, attendance: true, notes: 'שליטה מלאה בנושא' },
    { id: 4, medic_id: 3, training_date: '2024-02-28', training_type: 'עצירת דימומים', performance_rating: 2, attendance: true, notes: 'זקוק לתרגול נוסף' },
    { id: 5, medic_id: 5, training_date: '2024-03-05', training_type: 'טיפול בפגיעות חזה', performance_rating: 4, attendance: true, notes: '' },
    { id: 6, medic_id: 4, training_date: '2024-02-20', training_type: 'הנחת עירוי', performance_rating: 3, attendance: false, notes: 'נעדר בחלק מהתרגול' },
    { id: 7, medic_id: 2, training_date: '2024-01-30', training_type: 'החייאה', performance_rating: 4, attendance: true, notes: 'שיפור משמעותי' },
    { id: 8, medic_id: 7, training_date: '2024-03-10', training_type: 'טיפול בהלם', performance_rating: 3, attendance: true, notes: '' }
  ]
};

export default MedicsTraining;