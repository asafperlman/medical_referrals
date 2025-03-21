import React, { useState, useEffect, useCallback } from 'react';
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
  ToggleButtonGroup,
  ToggleButton,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
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
  People as PeopleIcon
} from '@mui/icons-material';
import * as trainingService from '../services/trainingService';
import { API_BASE_URL, API_PREFIX } from '../config/api-config';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Helper function to get current month/year
const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth(),
    year: now.getFullYear()
  };
};

const TourniquetTraining = ({ showNotification }) => {
  // Data state variables
  const [trainings, setTrainings] = useState([]);
  const [soldiers, setSoldiers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // UI state variables
  const [openForm, setOpenForm] = useState(false);
  const [openGroupTrainingForm, setOpenGroupTrainingForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedSoldiers, setSelectedSoldiers] = useState([]);
  const [filterTeam, setFilterTeam] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [openSoldierDetails, setOpenSoldierDetails] = useState(false);
  const [selectedSoldier, setSelectedSoldier] = useState(null);

  // Form state for individual training
  const [formData, setFormData] = useState({
    soldier_id: '',
    training_date: new Date().toISOString().split('T')[0],
    cat_time: '',
    passed: true,
    notes: ''
  });

  // Form state for group training
  const [groupFormData, setGroupFormData] = useState({
    training_date: new Date().toISOString().split('T')[0],
    team: '',
    general_notes: ''
  });

  // State for soldier performance in group training
  const [soldierTrainingData, setSoldierTrainingData] = useState({});

  // Fetch data from API
  // בתוך פונקציית fetchData
  const fetchData = async () => {
    setLoading(true);
  console.log('=== Debug TourniquetTraining API ===');
  console.log('Access token:', localStorage.getItem('access_token')?.substring(0, 15) + '...');
  
  try {
    // Get teams
    console.log('Fetching teams...');
    const teamsData = await trainingService.getTeams();
    console.log('Teams response:', teamsData);
    setTeams(teamsData);
    
    // Get soldiers
    console.log('Fetching soldiers...');
    try {
      const soldiersData = await trainingService.getSoldiers();
      console.log('Soldiers response:', soldiersData);
      setSoldiers(soldiersData);
    } catch (soldierError) {
      console.error('Soldiers fetch error:', soldierError);
      showNotification('שגיאה בטעינת נתוני החיילים', 'error');
      setSoldiers([]);
    }
    
    // Get tourniquet trainings
    console.log('Fetching tourniquet trainings...');
    try {
      const trainingsData = await trainingService.getTourniquetTrainings();
      console.log('Trainings response:', trainingsData);
      setTrainings(trainingsData);
    } catch (trainingError) {
      console.error('Trainings fetch error:', trainingError);
      showNotification('שגיאה בטעינת נתוני תרגולים', 'error');
      setTrainings([]);
    }
    } catch (error) {
    console.error('Error loading tourniquet training data:', error);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);
      trainingService.handleApiError(error, showNotification);
    } finally {
      setLoading(false);
    console.log('=== End Debug TourniquetTraining API ===');
  }
};

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Helper functions
  const getSoldierTrainings = useCallback(
    (soldierId) => trainings.filter((t) => t.soldier_id === soldierId),
    [trainings]
  );

  const isTrainedThisMonth = useCallback(
    (soldierId) => {
      const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
      return trainings.some((t) => {
        const trainingDate = new Date(t.training_date);
        return (
          t.soldier_id === soldierId &&
          trainingDate.getMonth() === currentMonth &&
          trainingDate.getFullYear() === currentYear
        );
      });
    },
    [trainings]
  );

  const getUntrained = useCallback(
    () => soldiers.filter((soldier) => !isTrainedThisMonth(soldier.id)),
    [soldiers, isTrainedThisMonth]
  );

  const calculateAverageCatTime = useCallback(
    (soldierId) => {
      const soldierTrainings = getSoldierTrainings(soldierId);
      if (soldierTrainings.length === 0) return 0;
      const totalTime = soldierTrainings.reduce((sum, t) => sum + parseInt(t.cat_time || 0, 10), 0);
      return (totalTime / soldierTrainings.length).toFixed(1);
    },
    [getSoldierTrainings]
  );

  const calculatePassRate = useCallback(
    (soldierId) => {
      const soldierTrainings = getSoldierTrainings(soldierId);
      if (soldierTrainings.length === 0) return 0;
      const passedCount = soldierTrainings.filter((t) => t.passed).length;
      return ((passedCount / soldierTrainings.length) * 100).toFixed(0);
    },
    [getSoldierTrainings]
  );

  // Event handlers
  const handleAddTraining = (soldier) => {
    setFormData({
      soldier_id: soldier.id,
      training_date: new Date().toISOString().split('T')[0],
      cat_time: '',
      passed: true,
      notes: ''
    });
    setOpenForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveTraining = async () => {
    try {
      setSaving(true);
      setLoading(true);
      // Validate required fields
      if (!formData.soldier_id || !formData.training_date || !formData.cat_time) {
        showNotification('נא למלא את כל השדות הנדרשים', 'error');
        setSaving(false);
        setLoading(false);
        return;
      }
      console.log('Saving training data:', formData);
      const response = await trainingService.createTourniquetTraining(formData);
      console.log('Save response:', response);
      if (response) {
        // Add the new training to state
        setTrainings((prev) => [...prev, response]);
      setOpenForm(false);
        showNotification('התרגול נשמר בהצלחה', 'success');
      }
    } catch (error) {
      console.error('Error saving training:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      trainingService.handleApiError(error, showNotification);
    } finally {
      setSaving(false);
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
    setGroupFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'team') {
      // When team changes, update the selectedTeam state and clear selected soldiers
      setSelectedTeam(value);
      setSelectedSoldiers([]);
    }
  };

  const handleNextToSelectSoldiers = () => {
    if (!groupFormData.team || !groupFormData.training_date) {
      showNotification('אנא בחר צוות ותאריך', 'error');
      return;
    }
    setSelectedTeam(groupFormData.team);
    setActiveStep(1);
  };

  const handleSelectSoldier = (soldier) => {
    setSelectedSoldiers((prev) =>
      prev.includes(soldier.id) ? prev.filter((id) => id !== soldier.id) : [...prev, soldier.id]
    );
  };

  const handleNextToEnterData = () => {
    if (selectedSoldiers.length === 0) {
      showNotification('אנא בחר לפחות חייל אחד', 'error');
      return;
    }
    const initialData = {};
    selectedSoldiers.forEach((soldierId) => {
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
    setSoldierTrainingData((prev) => ({
      ...prev,
      [soldierId]: {
        ...prev[soldierId],
        [field]: value
      }
    }));
  };

  const handleSaveGroupTraining = async () => {
    const missingData = selectedSoldiers.some((id) => !soldierTrainingData[id]?.cat_time);
    if (missingData) {
      showNotification('נא להזין זמן הנחת CAT עבור כל החיילים', 'error');
      return;
    }
    try {
      setLoading(true);
      setSaving(true);
      const bulkData = {
        training_date: groupFormData.training_date,
        soldiers: selectedSoldiers,
        general_notes: groupFormData.general_notes,
        soldier_performances: soldierTrainingData
      };
      console.log('Saving bulk training data:', bulkData);
      const response = await trainingService.createBulkTourniquetTrainings(bulkData);
      console.log('Bulk save response:', response);
      await fetchData();
      setOpenGroupTrainingForm(false);
      showNotification(`נשמרו נתוני תרגול עבור ${selectedSoldiers.length} חיילים`, 'success');
    } catch (error) {
      console.error('Error saving group training:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      trainingService.handleApiError(error, showNotification);
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const handleOpenSoldierDetails = (soldier) => {
    setSelectedSoldier(soldier);
    setOpenSoldierDetails(true);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterTeam('');
  };

  // Filter soldiers based on search and team filter
  const filteredSoldiers = soldiers.filter((soldier) => {
    const matchesTeam = filterTeam ? soldier.team === filterTeam : true;
    const matchesSearch =
      searchQuery === '' ||
      soldier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      soldier.personal_id.includes(searchQuery);
    return matchesTeam && matchesSearch;
  });

  // Show loading indicator when data is being fetched
  if (loading && trainings.length === 0 && soldiers.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        animation: 'fadeIn 0.5s',
        '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } }
      }}
    >
      {/* Header */}
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
            sx={{ mr: 1, borderRadius: 2, textTransform: 'none' }}
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
              '&:hover': { boxShadow: '0 6px 10px rgba(0,0,0,0.2)' }
            }}
          >
            תרגול חדש
          </Button>
        </Box>
      </Box>

      {/* Search and filter */}
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
                )
              }}
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
            />
            <FormControl
              variant="outlined"
              size="small"
              sx={{
                minWidth: 120,
                bgcolor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
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
                onClick={handleClearFilters}
                sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' } }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>

      {/* Main content */}
      <Grid container spacing={3}>
        {/* Left column - Soldiers list */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={2}
            sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}
          >
            <Box
              p={0.5}
              bgcolor="#f5f5f5"
              borderBottom="1px solid #e0e0e0"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
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
                        <Box
                          sx={{
                            py: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <WarningIcon sx={{ color: 'text.secondary', fontSize: 40 }} />
                          <Typography sx={{ color: 'text.secondary' }}>לא נמצאו חיילים</Typography>
                          {(searchQuery || filterTeam) && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<RefreshIcon />}
                              onClick={handleClearFilters}
                              sx={{ mt: 1 }}
                            >
                              אפס סינון
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSoldiers.map((soldier) => {
                      const soldierTrainings = getSoldierTrainings(soldier.id);
                      const lastTraining =
                        soldierTrainings.length > 0
                          ? soldierTrainings.sort(
                              (a, b) =>
                                new Date(b.training_date) - new Date(a.training_date)
                            )[0]
                          : null;
                      const trainedThisMonth = isTrainedThisMonth(soldier.id);
                      return (
                        <TableRow
                          key={soldier.id}
                          hover
                          onClick={() => handleOpenSoldierDetails(soldier)}
                          sx={{
                            bgcolor: !trainedThisMonth
                              ? 'rgba(255, 152, 0, 0.08)'
                              : 'inherit',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: !trainedThisMonth
                                ? 'rgba(255, 152, 0, 0.12)'
                                : 'rgba(25, 118, 210, 0.04)'
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
                                  bgcolor: !trainedThisMonth
                                    ? 'warning.light'
                                    : soldier.team === 'אתק'
                                    ? '#bbdefb'
                                    : soldier.team === 'רתק'
                                    ? '#c8e6c9'
                                    : soldier.team === 'חוד'
                                    ? '#ffe0b2'
                                    : '#e1bee7',
                                  color: 'rgba(0, 0, 0, 0.7)'
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
                                bgcolor:
                                  soldier.team === 'אתק'
                                    ? '#bbdefb'
                                    : soldier.team === 'רתק'
                                    ? '#c8e6c9'
                                    : soldier.team === 'חוד'
                                    ? '#ffe0b2'
                                    : '#e1bee7',
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
                                <AccessTimeIcon
                                  fontSize="small"
                                  sx={{ mr: 0.5, color: 'text.secondary' }}
                                />
                                <Typography
                                  sx={{
                                    fontWeight: 'medium',
                                    color:
                                      parseInt(lastTraining.cat_time, 10) > 35
                                        ? 'error.main'
                                        : parseInt(lastTraining.cat_time, 10) > 25
                                        ? 'warning.main'
                                        : 'success.main'
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

          {/* Untrained soldiers list */}
          <Paper
            elevation={2}
            sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}
          >
            <Box p={0.5} bgcolor="#ffebee" borderBottom="1px solid #ffcdd2">
              <Typography
                variant="subtitle2"
                sx={{
                  p: 1.5,
                  fontWeight: 'bold',
                  color: 'error.main',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
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
                  {getUntrained().map((soldier) => (
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
                          '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
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
                          <Typography variant="body2" fontWeight="medium">
                            {soldier.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {soldier.team}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="text"
                          color="warning"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddTraining(soldier);
                          }}
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

        {/* Right column - Stats */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3} direction="column">
            {/* Team Stats Card */}
            <Grid item>
              <Card
                elevation={2}
                sx={{ borderRadius: 2, overflow: 'hidden' }}
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
                        {/* Team stats rows go here */}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Dialog for soldier details */}
      <Dialog
        open={openSoldierDetails}
        onClose={() => setOpenSoldierDetails(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>פרטי חייל</DialogTitle>
        <DialogContent>
          {/* Soldier details content goes here */}
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button onClick={() => setOpenSoldierDetails(false)} variant="outlined" startIcon={<CloseIcon />}>
                סגור
              </Button>
            </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TourniquetTraining;
