import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
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
  Autocomplete,
  Stack,
  Badge,
  Fade,
  Collapse,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  Event as EventIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Notifications as NotificationsIcon,
  Flag as FlagIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  CalendarToday as CalendarTodayIcon,
  Timer as TimerIcon,
  NoteAdd as NoteAddIcon,
  Save as SaveIcon,
  ArrowForward as ArrowForwardIcon,
  ExpandMore as ExpandMoreIcon,
  People as PeopleIcon,
  Star as StarIcon,
  AssignmentLate as AssignmentLateIcon,
  Assignment as AssignmentIcon,
  Comment as CommentIcon
} from '@mui/icons-material';


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
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)', 
          color: 'white'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" fontWeight="bold">
            ניהול תרגילים ואימונים
          </Typography>
          <Box>
            <Tooltip title="ייצא דוח">
              <IconButton sx={{ mr: 1, color: 'white' }}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<AddIcon />} 
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
        </Box>
      </Paper>

      <Paper 
        elevation={2} 
        sx={{ 
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={activeTab}
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
          <Tab icon={<GroupIcon sx={{ mr: 1 }} />} iconPosition="start" label="אר״ן צוותי" />
          <Tab icon={<AccessTimeIcon sx={{ mr: 1 }} />} iconPosition="start" label="תרגול מחצ״ים" />
          <Tab icon={<PersonIcon sx={{ mr: 1 }} />} iconPosition="start" label="תרגול חובשים" />
          <Tab icon={<AssignmentIcon sx={{ mr: 1 }} />} iconPosition="start" label="ניתוח ומעקב" />
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
        const mockTeams = ['אתק', 'רתק', 'חוד', 'מפלג'];
        const mockTrainings = [
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
        ];
        setTeams(mockTeams);
        setTrainings(mockTrainings);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching training data:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const handleSaveTraining = () => {
    if (selectedTraining) {
      const updatedTrainings = trainings.map((training) =>
        training.id === selectedTraining.id ? { ...training, ...formData } : training
      );
      setTrainings(updatedTrainings);
      showNotification('התרגיל עודכן בהצלחה');
    } else {
      const newTraining = {
        id: Math.max(0, ...trainings.map((t) => t.id)) + 1,
        ...formData,
      };
      setTrainings([...trainings, newTraining]);
      showNotification('התרגיל נוסף בהצלחה');
    }
    setOpenForm(false);
  };

  const handleDeleteTraining = (id) => {
    const updatedTrainings = trainings.filter((training) => training.id !== id);
    setTrainings(updatedTrainings);
    showNotification('התרגיל נמחק בהצלחה', 'info');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
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
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>תאריך</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>צוות</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>תרחיש</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>מיקום</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>ביצוע</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>פעולות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTrainings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <WarningIcon sx={{ color: 'text.secondary', fontSize: 40 }} />
                          <Typography sx={{ color: 'text.secondary' }}>לא נמצאו תרגילים</Typography>
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
                          ) : (
                            <Button 
                              variant="contained" 
                              color="primary" 
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={handleAddTraining}
                              sx={{ mt: 1 }}
                            >
                              הוסף תרגיל חדש
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTrainings.map((training) => (
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
                        <TableCell>{formatDate(training.date)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={training.team} 
                            size="small" 
                            sx={{ 
                              bgcolor: training.team === 'אתק' ? '#bbdefb' :
                                      training.team === 'רתק' ? '#c8e6c9' :
                                      training.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                              color: 'rgba(0, 0, 0, 0.7)',
                              fontWeight: 'bold',
                              '& .MuiChip-label': { px: 1 }
                            }} 
                          />
                        </TableCell>
                        <TableCell>{training.scenario}</TableCell>
                        <TableCell>{training.location}</TableCell>
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
                          <Box sx={{ display: 'flex' }}>
                            <Tooltip title="ערוך">
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditTraining(training)} 
                                sx={{ 
                                  mr: 1,
                                  color: 'primary.main',
                                  '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)' },
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="מחק">
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleDeleteTraining(training.id)}
                                sx={{ 
                                  '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)' },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
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

// רכיב תרגול מחצ"ים (חסמי עורקים) - שודרג לפי דרישות
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const mockTeams = ['חוד', 'אתק', 'רתק', 'מפלג'];
        const mockSoldiers = [
          { id: 1, name: 'נועם עקה זוהר', team: 'חוד', personal_id: '9114251' },
          { id: 2, name: 'נהר שדמי', team: 'חוד', personal_id: '9292413' },
          { id: 3, name: 'יואב אטלן', team: 'חוד', personal_id: '9067695' },
          { id: 4, name: 'בן שטינברג', team: 'חוד', personal_id: '9180189' },
          { id: 5, name: 'יהלי חמו', team: 'חוד', personal_id: '9407190' },
          { id: 6, name: 'שמעון מימון', team: 'חוד', personal_id: '9409642' },
          { id: 7, name: "יונתן ג'יימס", team: 'חוד', personal_id: '9383684' },
          { id: 8, name: 'בן ואקנין', team: 'חוד', personal_id: '9271688' },
          { id: 9, name: 'דניאל רז', team: 'מפלג', personal_id: '9148536' },
          { id: 10, name: 'אסף בלר', team: 'חוד', personal_id: '9329110' },
          { id: 11, name: 'איתי זק', team: 'חוד', personal_id: '9208279' },
          { id: 12, name: 'אלעד סטולרו', team: 'חוד', personal_id: '9397140' },
          { id: 13, name: 'טל ריגר', team: 'חוד', personal_id: '9417483' },
          { id: 14, name: 'יובל מנגד', team: 'חוד', personal_id: '9256601' },
          { id: 15, name: 'שי וייסמרק', team: 'חוד', personal_id: '9334741' },
          { id: 16, name: 'איתי חיים סיגאוי', team: 'חוד', personal_id: '9320141' },
          { id: 17, name: 'עמית רווח', team: 'חוד', personal_id: '9347766' },
          { id: 18, name: 'אורי דנגוט', team: 'חוד', personal_id: '9199379' },
          { id: 19, name: 'טל קונפינו', team: 'חוד', personal_id: '9390442' },
          { id: 20, name: 'רועי משה קרצמר', team: 'חוד', personal_id: '9418334' },
          { id: 21, name: 'גיל סומך', team: 'חוד', personal_id: '9295243' },
          { id: 22, name: 'יובל מלכה', team: 'חוד', personal_id: '9187199' },
          { id: 23, name: 'תומר ויגמן', team: 'אתק', personal_id: '9177039' },
          { id: 24, name: 'יואב תומר', team: 'אתק', personal_id: '9387449' },
          { id: 25, name: 'אדם עבדל שאפי', team: 'אתק', personal_id: '9450496' },
          { id: 26, name: 'אוהד סולימן', team: 'אתק', personal_id: '9387008' },
          { id: 27, name: 'ארתור קנבסקי', team: 'אתק', personal_id: '9411096' },
          { id: 28, name: 'תמים נעים', team: 'אתק', personal_id: '9679237' },
          { id: 29, name: 'שגיא זוהר', team: 'אתק', personal_id: '9365060' },
          { id: 30, name: 'יובל יקותיאל', team: 'אתק', personal_id: '9338019' },
          { id: 31, name: 'יוסף ישראל מאיירס', team: 'אתק', personal_id: '9374267' },
          { id: 32, name: 'ניר פוני', team: 'אתק', personal_id: '9287484' },
          { id: 33, name: 'אייל ברטל', team: 'אתק', personal_id: '9327250' },
          { id: 34, name: 'איתן נוי', team: 'אתק', personal_id: '9254926' },
          { id: 35, name: 'אורי לביא', team: 'אתק', personal_id: '9223847' },
          { id: 36, name: 'אבנר קולודנר', team: 'אתק', personal_id: '9074792' },
          { id: 37, name: 'דרור שוקר', team: 'אתק', personal_id: '9131984' },
          { id: 38, name: 'אליה עזרא', team: 'אתק', personal_id: '9396792' },
          { id: 39, name: 'עידו כהן', team: 'אתק', personal_id: '9407286' },
          { id: 40, name: 'עומר בן עזרא', team: 'אתק', personal_id: '9268223' },
          { id: 41, name: 'הלל מיטלמן', team: 'אתק', personal_id: '9146543' },
          { id: 42, name: 'אופיר פלג', team: 'אתק', personal_id: '9384829' },
          { id: 43, name: 'יונתן בנסון', team: 'אתק', personal_id: '8879270' },
          { id: 44, name: 'מקסים ויקול', team: 'רתק', personal_id: '9175977' },
          { id: 45, name: 'הלל בן יהודה', team: 'רתק', personal_id: '9113651' },
          { id: 46, name: 'הראל טליס', team: 'רתק', personal_id: '9350120' },
          { id: 47, name: 'אדם אברמוביץ', team: 'רתק', personal_id: '9397348' },
          { id: 48, name: 'שי לבוביץ', team: 'רתק', personal_id: '9416291' },
          { id: 49, name: 'נועם דרסלר', team: 'רתק', personal_id: '9213987' },
          { id: 50, name: 'אביב כהן', team: 'רתק', personal_id: '9356591' },
          { id: 51, name: 'ישי אלון', team: 'רתק', personal_id: '9379003' },
          { id: 52, name: 'ערן סולומון', team: 'רתק', personal_id: '9432893' },
          { id: 53, name: 'ישי דוד', team: 'רתק', personal_id: '9077955' },
          { id: 54, name: 'משה בן שושן', team: 'רתק', personal_id: '9673275' },
          { id: 55, name: 'מתן זולטק', team: 'רתק', personal_id: '9284912' },
          { id: 56, name: 'יובל סוויסה', team: 'רתק', personal_id: '9275989' },
          { id: 57, name: 'יונתן חמו', team: 'רתק', personal_id: '9357405' },
          { id: 58, name: 'אלישע חיים מרום', team: 'רתק', personal_id: '9377885' },
          { id: 59, name: 'עידו פודולר', team: 'רתק', personal_id: '9335448' },
          { id: 60, name: 'לידור פיין זילברג', team: 'רתק', personal_id: '9389221' },
          { id: 61, name: 'רן אמר', team: 'רתק', personal_id: '9324588' },
          { id: 62, name: "עידו סמג׳ה", team: 'רתק', personal_id: '9405143' },
          { id: 63, name: 'שחר ישראלי עמית', team: 'רתק', personal_id: '9396864' },
          { id: 64, name: 'מיכאל יעקובר', team: 'רתק', personal_id: '9677134' },
          { id: 65, name: 'דניאל וסרמן', team: 'רתק', personal_id: '9117735' },
          { id: 66, name: 'אסף פרלמן', team: 'מפלג', personal_id: '9251555' },
          { id: 67, name: 'עומר גינת', team: 'מפלג', personal_id: '9249550' },
          { id: 68, name: 'אלעד אזולאי', team: 'מפלג', personal_id: '9240244' },
          { id: 69, name: 'יהל איטלי', team: 'מפלג', personal_id: '9139582' },
          { id: 70, name: 'אורי שמש', team: 'מפלג', personal_id: '9383891' },
          { id: 71, name: 'רז קורצטג', team: 'מפלג', personal_id: '9185941' },
          { id: 72, name: 'נועם שר', team: 'מפלג', personal_id: '9252070' },
          { id: 73, name: 'יואב רוזנר', team: 'מפלג', personal_id: '9316943' },
          { id: 74, name: 'מלאכי יצחקי', team: 'חוד', personal_id: '8842854' },
        ];
        const mockTrainings = [
          { id: 1, soldier_id: 1, training_date: '2025-02-05', cat_time: '28', passed: true, notes: '' },
          { id: 2, soldier_id: 2, training_date: '2025-02-07', cat_time: '25', passed: true, notes: '' },
          { id: 3, soldier_id: 3, training_date: '2025-02-10', cat_time: '45', passed: false, notes: 'צריך תרגול נוסף, זמן הנחה ארוך מדי' },
          { id: 4, soldier_id: 4, training_date: '2025-02-15', cat_time: '23', passed: true, notes: '' },
          { id: 5, soldier_id: 7, training_date: '2025-02-20', cat_time: '30', passed: true, notes: '' },
          { id: 6, soldier_id: 1, training_date: '2025-03-05', cat_time: '22', passed: true, notes: 'שיפור ניכר בזמן ההנחה' },
        ];
        setTeams(mockTeams);
        setSoldiers(mockSoldiers);
        setTrainings(mockTrainings);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching training data:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  

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

  const handleSaveTraining = () => {
    const newTraining = {
      id: Math.max(0, ...trainings.map((t) => t.id)) + 1,
      ...formData,
    };
    setTrainings([...trainings, newTraining]);
    setOpenForm(false);
    showNotification('הנתונים נשמרו בהצלחה');
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
  const handleSaveGroupTraining = () => {
    // בדיקה שהוזנו זמני CAT לכל החיילים
    const missingData = selectedSoldiers.some(id => !soldierTrainingData[id].cat_time);
    
    if (missingData) {
      showNotification('נא להזין זמן הנחת CAT עבור כל החיילים', 'error');
      return;
    }
    
    // יצירת רשומות אימון לכל אחד מהחיילים
    const newTrainings = selectedSoldiers.map(soldierId => ({
      id: Math.max(0, ...trainings.map(t => t.id)) + 1 + selectedSoldiers.indexOf(soldierId),
      soldier_id: soldierId,
      training_date: groupFormData.training_date,
      cat_time: soldierTrainingData[soldierId].cat_time,
      passed: soldierTrainingData[soldierId].passed,
      notes: soldierTrainingData[soldierId].notes || groupFormData.general_notes
    }));
    
    setTrainings([...trainings, ...newTrainings]);
    setOpenGroupTrainingForm(false);
    showNotification(`נשמרו נתוני תרגול עבור ${selectedSoldiers.length} חיילים`, 'success');
  };

  const filteredSoldiers = soldiers.filter(soldier => {
    const matchesTeam = filterTeam ? soldier.team === filterTeam : true;
    const matchesSearch = searchQuery === '' || 
      soldier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      soldier.personal_id.includes(searchQuery);
    
    return matchesTeam && matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };
  
  // קבלת רשימת חיילים שלא תורגלו החודש
  const getUntrained = () => {
    return soldiers.filter(soldier => !isTrainedThisMonth(soldier.id));
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
                          sx={{ 
                            bgcolor: !trainedThisMonth ? 'rgba(255, 152, 0, 0.08)' : 'inherit',
                            transition: 'all 0.2s',
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
                              onClick={() => handleAddTraining(soldier)}
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
    </Box>
  );
};

// רכיב תרגול חובשים
const MedicsTraining = ({ showNotification }) => {
  const [trainings, setTrainings] = useState([]);
  const [medics, setMedics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openSessionForm, setOpenSessionForm] = useState(false);
  const [selectedMedic, setSelectedMedic] = useState(null);
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
        const mockMedics = [
          { id: 1, name: 'דן לוי', team: 'אתק', role: 'חובש פלוגתי', experience: 'מתקדם' },
          { id: 2, name: 'עידן כהן', team: 'רתק', role: 'חובש פלוגתי', experience: 'מתחיל' },
          { id: 3, name: 'אורי אלון', team: 'חוד', role: 'חובש פלוגתי', experience: 'בכיר' },
        ];
        // כאן ניתן להמשיך עם שאר הקוד, למשל להגדיר את הסטייט של החובשים:
        setMedics(mockMedics);
      } catch (error) {
        console.error('Error fetching mock medics:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
};

export default TrainingManagement;
