// frontend/src/pages/TrainingManagement.js

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  DateRange as DateRangeIcon,
  Group as GroupIcon,
  AssignmentInd as AssignmentIndIcon,
  Event as EventIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Star as StarIcon,
  Search as SearchIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// רכיב עמוד ניהול תרגילים
const TrainingManagement = () => {
  const { api } = useAuth();
  
  // מצב לשונית פעילה
  const [activeTab, setActiveTab] = useState(0);
  
  // מצבי טעינה ושגיאה
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // החלפת לשונית
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          ניהול תרגילים ואימונים
        </Typography>
        
        <Box>
          <Tooltip title="ייצא דוח">
            <IconButton sx={{ mr: 1 }}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            תרגיל חדש
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="אר״ן צוותי" />
          <Tab label="תרגול מחצ״ים" />
          <Tab label="תרגול חובשים" />
          <Tab label="ניתוח ומעקב" />
        </Tabs>
      </Paper>
      
      {/* הודעת שגיאה */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => setError(null)}>
              נסה שוב
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* תוכן לשוניות */}
      {activeTab === 0 && <TeamTraining />}
      {activeTab === 1 && <TourniquetTraining />}
      {activeTab === 2 && <MedicsTraining />}
      {activeTab === 3 && <TrainingAnalytics />}
      
      {/* מסך טעינה */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

// רכיב תרגול אר"ן צוותי
const TeamTraining = () => {
  const [trainings, setTrainings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  
  // מצב הטופס
  const [formData, setFormData] = useState({
    date: '',
    team: '',
    scenario: '',
    location: '',
    notes: '',
    performance_rating: 3,
  });
  
  // טעינת נתונים
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // נתוני צוותים לדוגמה
        const mockTeams = ['אתק', 'רתק', 'חוד', 'מפלג'];
        
        // נתוני תרגילים לדוגמה
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
  
  // פתיחת טופס הוספה
  const handleAddTraining = () => {
    setSelectedTraining(null);
    setFormData({
      date: '',
      team: '',
      scenario: '',
      location: '',
      notes: '',
      performance_rating: 3,
    });
    setOpenForm(true);
  };
  
  // פתיחת טופס עריכה
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
  
  // שינוי בטופס
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // שמירת תרגיל
  const handleSaveTraining = () => {
    if (selectedTraining) {
      // עדכון תרגיל קיים
      const updatedTrainings = trainings.map(training =>
        training.id === selectedTraining.id ? { ...training, ...formData } : training
      );
      setTrainings(updatedTrainings);
    } else {
      // הוספת תרגיל חדש
      const newTraining = {
        id: Math.max(0, ...trainings.map(t => t.id)) + 1,
        ...formData,
      };
      setTrainings([...trainings, newTraining]);
    }
    
    setOpenForm(false);
  };
  
  // מחיקת תרגיל
  const handleDeleteTraining = (id) => {
    const updatedTrainings = trainings.filter(training => training.id !== id);
    setTrainings(updatedTrainings);
  };
  
  // פורמט תאריך
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">
          תרגילי אר"ן צוותיים
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddTraining}
        >
          תרגיל חדש
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>תאריך</TableCell>
                  <TableCell>צוות</TableCell>
                  <TableCell>תרחיש</TableCell>
                  <TableCell>מיקום</TableCell>
                  <TableCell>ביצוע</TableCell>
                  <TableCell>פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trainings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography sx={{ py: 3 }}>
                        לא נמצאו תרגילים
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  trainings.map((training) => (
                    <TableRow key={training.id} hover>
                      <TableCell>{formatDate(training.date)}</TableCell>
                      <TableCell>{training.team}</TableCell>
                      <TableCell>{training.scenario}</TableCell>
                      <TableCell>{training.location}</TableCell>
                      <TableCell>
                        <Rating
                          value={training.performance_rating}
                          readOnly
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex' }}>
                          <Tooltip title="ערוך">
                            <IconButton
                              size="small"
                              onClick={() => handleEditTraining(training)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="מחק">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTraining(training.id)}
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
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="סיכום תרגילים" />
            <CardContent>
              <List>
                {teams.map((team) => {
                  const teamTrainings = trainings.filter(t => t.team === team);
                  const count = teamTrainings.length;
                  const avgRating = count > 0
                    ? teamTrainings.reduce((sum, t) => sum + t.performance_rating, 0) / count
                    : 0;
                  
                  return (
                    <ListItem key={team}>
                      <ListItemIcon>
                        <GroupIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`צוות ${team}`}
                        secondary={`${count} תרגילים`}
                      />
                      {count > 0 && (
                        <Rating
                          value={avgRating}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                      )}
                    </ListItem>
                  );
                })}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  סה"כ תרגילים שבוצעו
                </Typography>
                <Typography variant="h4">
                  {trainings.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* טופס הוספה/עריכה */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedTraining ? 'עריכת תרגיל' : 'הוספת תרגיל חדש'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
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
                >
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
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="location"
                label="מיקום"
                fullWidth
                value={formData.location}
                onChange={handleFormChange}
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
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  דירוג ביצוע:
                </Typography>
                <Rating
                  name="performance_rating"
                  value={Number(formData.performance_rating)}
                  onChange={(event, newValue) => {
                    setFormData({ ...formData, performance_rating: newValue });
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>
            ביטול
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveTraining}
          >
            {selectedTraining ? 'עדכן' : 'הוסף'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// רכיב תרגול מחצ"ים (חסמי עורקים)
const TourniquetTraining = () => {
  const [trainings, setTrainings] = useState([]);
  const [soldiers, setSoldiers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedSoldier, setSelectedSoldier] = useState(null);
  const [filterTeam, setFilterTeam] = useState('');
  
  // מצב הטופס
  const [formData, setFormData] = useState({
    soldier_id: '',
    training_date: '',
    passed: true,
    notes: '',
  });
  
  // טעינת נתונים
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // נתוני צוותים לדוגמה
        const mockTeams = ['אתק', 'רתק', 'חוד', 'מפלג'];
        
        // נתוני חיילים לדוגמה
        const mockSoldiers = [
          { id: 1, name: 'אלון כהן', team: 'אתק', personal_id: '9876543' },
          { id: 2, name: 'דני לוי', team: 'אתק', personal_id: '8765432' },
          { id: 3, name: 'רועי גולן', team: 'רתק', personal_id: '7654321' },
          { id: 4, name: 'נועם אבן', team: 'רתק', personal_id: '6543219' },
          { id: 5, name: 'יוסי אברהם', team: 'חוד', personal_id: '5432198' },
          { id: 6, name: 'אייל דרור', team: 'חוד', personal_id: '4321987' },
          { id: 7, name: 'דור שלום', team: 'מפלג', personal_id: '3219876' },
          { id: 8, name: 'תומר הדר', team: 'מפלג', personal_id: '2198765' },
        ];
        
        // נתוני תרגילים לדוגמה
        const mockTrainings = [
          { id: 1, soldier_id: 1, training_date: '2025-02-05', passed: true, notes: '' },
          { id: 2, soldier_id: 2, training_date: '2025-02-07', passed: true, notes: '' },
          { id: 3, soldier_id: 3, training_date: '2025-02-10', passed: false, notes: 'צריך תרגול נוסף' },
          { id: 4, soldier_id: 5, training_date: '2025-02-15', passed: true, notes: '' },
          { id: 5, soldier_id: 7, training_date: '2025-02-20', passed: true, notes: '' },
          { id: 6, soldier_id: 1, training_date: '2025-03-05', passed: true, notes: '' },
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
  
  // חישוב תרגילים פר חייל
  const getSoldierTrainings = (soldierId) => {
    return trainings.filter(t => t.soldier_id === soldierId);
  };
  
  // בדיקה האם חייל מתורגל החודש
  const isTrainedThisMonth = (soldierId) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return trainings.some(t => {
      const trainingDate = new Date(t.training_date);
      return (
        t.soldier_id === soldierId &&
        trainingDate.getMonth() === currentMonth &&
        trainingDate.getFullYear() === currentYear
      );
    });
  };
  
  // פתיחת טופס הוספת תרגול
  const handleAddTraining = (soldier) => {
    setSelectedSoldier(soldier);
    setFormData({
      soldier_id: soldier.id,
      training_date: new Date().toISOString().split('T')[0],
      passed: true,
      notes: '',
    });
    setOpenForm(true);
  };
  
  // שינוי בטופס
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  // שמירת תרגול
  const handleSaveTraining = () => {
    // הוספת תרגול חדש
    const newTraining = {
      id: Math.max(0, ...trainings.map(t => t.id)) + 1,
      ...formData,
    };
    
    setTrainings([...trainings, newTraining]);
    setOpenForm(false);
  };
  
  // סינון חיילים לפי צוות
  const filteredSoldiers = filterTeam
    ? soldiers.filter(s => s.team === filterTeam)
    : soldiers;
  
  // פורמט תאריך
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">
          תרגול מחצ"ים - חסמי עורקים
        </Typography>
        
        <Box>
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel id="team-filter-label">סינון לפי צוות</InputLabel>
            <Select
              labelId="team-filter-label"
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              label="סינון לפי צוות"
            >
              <MenuItem value="">הכל</MenuItem>
              {teams.map((team) => (
                <MenuItem key={team} value={team}>{team}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
          >
            רענן
          </Button>
        </Box>
      </Box>
      
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם</TableCell>
              <TableCell>מספר אישי</TableCell>
              <TableCell>צוות</TableCell>
              <TableCell>תרגול אחרון</TableCell>
              <TableCell>סטטוס חודשי</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSoldiers.map((soldier) => {
              const soldierTrainings = getSoldierTrainings(soldier.id);
              const lastTraining = soldierTrainings.length > 0 
                ? soldierTrainings.sort((a, b) => new Date(b.training_date) - new Date(a.training_date))[0] 
                : null;
              const trainedThisMonth = isTrainedThisMonth(soldier.id);
              
              return (
                <TableRow 
                  key={soldier.id} 
                  hover
                  sx={{
                    bgcolor: !trainedThisMonth ? 'rgba(255, 0, 0, 0.05)' : 'inherit',
                  }}
                >
                  <TableCell>{soldier.name}</TableCell>
                  <TableCell>{soldier.personal_id}</TableCell>
                  <TableCell>{soldier.team}</TableCell>
                  <TableCell>
                    {lastTraining ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {formatDate(lastTraining.training_date)}
                        {!lastTraining.passed && (
                          <Chip 
                            label="נכשל" 
                            color="error" 
                            size="small" 
                            sx={{ ml: 1 }} 
                          />
                        )}
                      </Box>
                    ) : (
                      'לא תורגל'
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
                    >
                      תרגול חדש
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="סטטיסטיקת תרגול לפי צוות" />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>צוות</TableCell>
                      <TableCell>מספר חיילים</TableCell>
                      <TableCell>תורגלו החודש</TableCell>
                      <TableCell>אחוז</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teams.map((team) => {
                      const teamSoldiers = soldiers.filter(s => s.team === team);
                      const trainedCount = teamSoldiers.filter(s => isTrainedThisMonth(s.id)).length;
                      const percentage = teamSoldiers.length > 0 
                        ? Math.round((trainedCount / teamSoldiers.length) * 100) 
                        : 0;
                      
                      return (
                        <TableRow key={team}>
                          <TableCell>{team}</TableCell>
                          <TableCell>{teamSoldiers.length}</TableCell>
                          <TableCell>{trainedCount}</TableCell>
                          <TableCell>
                            <Chip 
                              label={`${percentage}%`}
                              color={percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'error'}
                              size="small"
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
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="סיכום חודשי" />
            <CardContent>
              <Box textAlign="center" mb={3}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  סך כל החיילים
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {soldiers.length}
                </Typography>
                
                <Box display="flex" justifyContent="center" mb={2}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="body1" color="success.main">
                      תורגלו החודש
                    </Typography>
                    <Typography variant="h5">
                      {soldiers.filter(s => isTrainedThisMonth(s.id)).length}
                    </Typography>
                  </Box>
                  
                  <Box textAlign="center" p={2}>
                    <Typography variant="body1" color="error.main">
                      לא תורגלו החודש
                    </Typography>
                    <Typography variant="h5">
                      {soldiers.filter(s => !isTrainedThisMonth(s.id)).length}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  אחוז ביצוע חודשי
                </Typography>
                <Typography variant="h4" color="primary">
                  {Math.round((soldiers.filter(s => isTrainedThisMonth(s.id)).length / soldiers.length) * 100)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* טופס הוספת תרגול */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          תרגול חדש - {selectedSoldier?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="training_date"
                label="תאריך תרגול"
                type="date"
                fullWidth
                required
                value={formData.training_date}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>תוצאה</InputLabel>
                <Select
                  name="passed"
                  value={formData.passed}
                  onChange={handleFormChange}
                  label="תוצאה"
                >
                  <MenuItem value={true}>עבר</MenuItem>
                  <MenuItem value={false}>נכשל</MenuItem>
                </Select>
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
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>
            ביטול
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveTraining}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// רכיב תרגול חובשים
const MedicsTraining = () => {
  const [trainings, setTrainings] = useState([]);
  const [medics, setMedics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedMedic, setSelectedMedic] = useState(null);
  
  // מצב הטופס
  const [formData, setFormData] = useState({
    date: '',
    medic_id: '',
    topic: '',
    performance_rating: 3,
    attendance: true,
    notes: '',
  });
  
  // טעינת נתונים
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // נתוני חובשים לדוגמה
        const mockMedics = [
          { id: 1, name: 'דן לוי', team: 'אתק', role: 'חובש פלוגתי' },
          { id: 2, name: 'עידן כהן', team: 'רתק', role: 'חובש פלוגתי' },
          { id: 3, name: 'אורי אלון', team: 'חוד', role: 'חובש פלוגתי' },
          { id: 4, name: 'יוני דרור', team: 'מפלג', role: 'חובש פלוגתי' },
        ];
        
        // נתוני תרגול לדוגמה
        const mockTrainings = [
          {
            id: 1,
            date: '2025-02-07',
            medic_id: 1,
            topic: 'החייאה',
            performance_rating: 4,
            attendance: true,
            notes: 'ביצוע טוב, צריך לשפר זמני תגובה',
          },
          {
            id: 2,
            date: '2025-02-07',
            medic_id: 2,
            topic: 'החייאה',
            performance_rating: 3,
            attendance: true,
            notes: 'בסדר גמור',
          },
          {
            id: 3,
            date: '2025-02-07',
            medic_id: 4,
            topic: 'החייאה',
            performance_rating: 5,
            attendance: true,
            notes: 'מצויין',
          },
          {
            id: 4,
            date: '2025-02-14',
            medic_id: 1,
            topic: 'טיפול בפציעות ראש',
            performance_rating: 4,
            attendance: true,
            notes: '',
          },
          {
            id: 5,
            date: '2025-02-14',
            medic_id: 3,
            topic: 'טיפול בפציעות ראש',
            performance_rating: 2,
            attendance: true,
            notes: 'צריך תרגול נוסף',
          },
          {
            id: 6,
            date: '2025-02-14',
            medic_id: 4,
            topic: 'טיפול בפציעות ראש',
            performance_rating: 3,
            attendance: true,
            notes: '',
          },
          {
            id: 7,
            date: '2025-02-21',
            medic_id: 1,
            topic: 'החדרת נתיב אוויר',
            performance_rating: 3,
            attendance: true,
            notes: '',
          },
          {
            id: 8,
            date: '2025-02-21',
            medic_id: 2,
            topic: 'החדרת נתיב אוויר',
            performance_rating: 4,
            attendance: true,
            notes: '',
          },
          {
            id: 9,
            date: '2025-02-21',
            medic_id: 3,
            topic: 'החדרת נתיב אוויר',
            performance_rating: 0,
            attendance: false,
            notes: 'לא נכח באימון',
          },
        ];
        
        setMedics(mockMedics);
        setTrainings(mockTrainings);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching medic training data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // קבלת כל ימי התרגול הייחודיים
  const getTrainingDates = () => {
    const dates = [...new Set(trainings.map(t => t.date))];
    return dates.sort((a, b) => new Date(b) - new Date(a));
  };
  
  // קבלת הנושאים שתורגלו בתאריך מסויים
  const getTopicsForDate = (date) => {
    const trainingsOnDate = trainings.filter(t => t.date === date);
    const topics = [...new Set(trainingsOnDate.map(t => t.topic))];
    return topics.join(', ');
  };
  
  // קבלת חובשים שנכחו בתאריך מסויים
  const getMedicsForDate = (date) => {
    const trainingsOnDate = trainings.filter(t => t.date === date);
    const presentMedicIds = trainingsOnDate
      .filter(t => t.attendance)
      .map(t => t.medic_id);
    
    return medics.filter(m => presentMedicIds.includes(m.id));
  };
  
  // קבלת חובשים שנעדרו בתאריך מסויים
  const getAbsentMedicsForDate = (date) => {
    const trainingsOnDate = trainings.filter(t => t.date === date);
    const absentMedicIds = trainingsOnDate
      .filter(t => !t.attendance)
      .map(t => t.medic_id);
    const presentMedicIds = trainingsOnDate
      .filter(t => t.attendance)
      .map(t => t.medic_id);
    
    // חובשים שלא נכחו באימון כלל
    const allMedicIds = medics.map(m => m.id);
    const fullyAbsentMedicIds = allMedicIds.filter(
      id => !presentMedicIds.includes(id) && !absentMedicIds.includes(id)
    );
    
    return medics.filter(m => absentMedicIds.includes(m.id) || fullyAbsentMedicIds.includes(m.id));
  };
  
  // חישוב ממוצע הביצוע של כל חובש
  const getMedicAveragePerformance = (medicId) => {
    const medicTrainings = trainings.filter(t => t.medic_id === medicId && t.attendance);
    if (medicTrainings.length === 0) return 0;
    
    const total = medicTrainings.reduce((sum, t) => sum + t.performance_rating, 0);
    return total / medicTrainings.length;
  };
  
  // חישוב אחוז ההשתתפות של כל חובש
  const getMedicAttendancePercentage = (medicId) => {
    const trainingDates = getTrainingDates();
    const medicTrainings = trainings.filter(t => t.medic_id === medicId);
    
    // מספר האימונים שהחובש נכח בהם
    const attendedCount = medicTrainings.filter(t => t.attendance).length;
    
    return trainingDates.length > 0 ? Math.round((attendedCount / trainingDates.length) * 100) : 0;
  };
  
  // פתיחת טופס תרגול
  const handleAddTraining = () => {
    setSelectedMedic(null);
    
    // תאריך נוכחי כברירת מחדל
    const today = new Date().toISOString().split('T')[0];
    
    setFormData({
      date: today,
      medic_id: '',
      topic: '',
      performance_rating: 3,
      attendance: true,
      notes: '',
    });
    
    setOpenForm(true);
  };
  
  // שינוי בטופס
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  // שמירת תרגול
  const handleSaveTraining = () => {
    // הוספת תרגול חדש
    const newTraining = {
      id: Math.max(0, ...trainings.map(t => t.id)) + 1,
      ...formData,
    };
    
    setTrainings([...trainings, newTraining]);
    setOpenForm(false);
  };
  
  // פורמט תאריך
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">
          תרגול חובשים שבועי
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddTraining}
        >
          תרגול חדש
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Typography variant="h6" gutterBottom>
            אימונים אחרונים
          </Typography>
          
          {getTrainingDates().length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                לא נמצאו אימונים
              </Typography>
            </Paper>
          ) : (
            getTrainingDates().map((date) => (
              <Card key={date} sx={{ mb: 3 }}>
                <CardHeader
                  title={formatDate(date)}
                  subheader={`נושא: ${getTopicsForDate(date)}`}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        חובשים שהשתתפו
                      </Typography>
                      <List dense>
                        {getMedicsForDate(date).map((medic) => {
                          const trainingRecord = trainings.find(
                            t => t.date === date && t.medic_id === medic.id
                          );
                          
                          return (
                            <ListItem key={medic.id}>
                              <ListItemIcon>
                                <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>
                                  {medic.name.charAt(0)}
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText
                                primary={medic.name}
                                secondary={medic.team}
                              />
                              {trainingRecord && (
                                <Rating
                                  value={trainingRecord.performance_rating}
                                  readOnly
                                  size="small"
                                />
                              )}
                            </ListItem>
                          );
                        })}
                      </List>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        חובשים שלא השתתפו
                      </Typography>
                      {getAbsentMedicsForDate(date).length === 0 ? (
                        <Typography color="success.main" variant="body2">
                          כל החובשים נכחו באימון!
                        </Typography>
                      ) : (
                        <List dense>
                          {getAbsentMedicsForDate(date).map((medic) => (
                            <ListItem key={medic.id}>
                              <ListItemIcon>
                                <Avatar sx={{ width: 28, height: 28, fontSize: 14, bgcolor: 'error.light' }}>
                                  {medic.name.charAt(0)}
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText
                                primary={medic.name}
                                secondary={medic.team}
                              />
                              <Chip label="לא נכח" size="small" color="error" variant="outlined" />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))
          )}
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Typography variant="h6" gutterBottom>
            סיכום ביצועים
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>חובש</TableCell>
                  <TableCell>צוות</TableCell>
                  <TableCell>נוכחות</TableCell>
                  <TableCell>ביצוע</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {medics.map((medic) => (
                  <TableRow key={medic.id} hover>
                    <TableCell>{medic.name}</TableCell>
                    <TableCell>{medic.team}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${getMedicAttendancePercentage(medic.id)}%`}
                        color={
                          getMedicAttendancePercentage(medic.id) >= 80 ? 'success' :
                          getMedicAttendancePercentage(medic.id) >= 50 ? 'warning' :
                          'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Rating
                        value={getMedicAveragePerformance(medic.id)}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Card sx={{ mt: 3 }}>
            <CardHeader title="סיכום אימונים" />
            <CardContent>
              <Box textAlign="center">
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  סך הכל אימונים שבוצעו
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {getTrainingDates().length}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  ממוצע השתתפות
                </Typography>
                <Typography variant="h5" color="primary">
                  {Math.round(
                    medics.reduce(
                      (sum, medic) => sum + getMedicAttendancePercentage(medic.id),
                      0
                    ) / medics.length
                  )}%
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  ממוצע ביצוע כללי
                </Typography>
                <Rating
                  value={
                    medics.reduce(
                      (sum, medic) => sum + getMedicAveragePerformance(medic.id),
                      0
                    ) / medics.length
                  }
                  precision={0.5}
                  readOnly
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* טופס הוספת תרגול */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          הוספת תרגול חדש
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="date"
                label="תאריך תרגול"
                type="date"
                fullWidth
                required
                value={formData.date}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>חובש</InputLabel>
                <Select
                  name="medic_id"
                  value={formData.medic_id}
                  onChange={handleFormChange}
                  label="חובש"
                >
                  {medics.map((medic) => (
                    <MenuItem key={medic.id} value={medic.id}>
                      {medic.name} ({medic.team})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="topic"
                label="נושא התרגול"
                fullWidth
                required
                value={formData.topic}
                onChange={handleFormChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="attendance"
                    checked={formData.attendance}
                    onChange={handleFormChange}
                  />
                }
                label="נכח בתרגול"
              />
            </Grid>
            
            {formData.attendance && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ mr: 2 }}>דירוג ביצוע:</Typography>
                  <Rating
                    name="performance_rating"
                    value={Number(formData.performance_rating)}
                    onChange={(event, newValue) => {
                      setFormData({ ...formData, performance_rating: newValue });
                    }}
                  />
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="הערות"
                fullWidth
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>
            ביטול
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveTraining}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// רכיב ניתוח מעקב אימונים
const TrainingAnalytics = () => {
  const [loading, setLoading] = useState(false);
  
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        ניתוח ומעקב אימונים
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardHeader title="סטטיסטיקה כללית" />
            <CardContent>
              <Box textAlign="center">
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  סך כל התרגילים שבוצעו
                </Typography>
                <Typography variant="h4" gutterBottom>
                  28
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      אר"ן צוותי
                    </Typography>
                    <Typography variant="h6">
                      7
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      מחצ"ים
                    </Typography>
                    <Typography variant="h6">
                      13
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      חובשים
                    </Typography>
                    <Typography variant="h6">
                      8
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardHeader title="דירוגי ביצוע" />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>צוות</TableCell>
                      <TableCell>דירוג ממוצע</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>אתק</TableCell>
                      <TableCell>
                        <Rating value={4.2} precision={0.1} readOnly size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>רתק</TableCell>
                      <TableCell>
                        <Rating value={3.8} precision={0.1} readOnly size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>חוד</TableCell>
                      <TableCell>
                        <Rating value={4.5} precision={0.1} readOnly size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>מפלג</TableCell>
                      <TableCell>
                        <Rating value={3.6} precision={0.1} readOnly size="small" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardHeader title="השתתפות" />
            <CardContent>
              <Box textAlign="center">
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  אחוז השתתפות כללי
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  87%
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    השתתפות לפי צוות
                  </Typography>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ width: 60 }}>
                      אתק
                    </Typography>
                    <Box sx={{ flexGrow: 1, bgcolor: 'success.light', height: 10, borderRadius: 5 }}>
                      <Box sx={{ width: '92%', bgcolor: 'success.main', height: '100%', borderRadius: 5 }} />
                    </Box>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      92%
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ width: 60 }}>
                      רתק
                    </Typography>
                    <Box sx={{ flexGrow: 1, bgcolor: 'success.light', height: 10, borderRadius: 5 }}>
                      <Box sx={{ width: '85%', bgcolor: 'success.main', height: '100%', borderRadius: 5 }} />
                    </Box>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      85%
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ width: 60 }}>
                      חוד
                    </Typography>
                    <Box sx={{ flexGrow: 1, bgcolor: 'success.light', height: 10, borderRadius: 5 }}>
                      <Box sx={{ width: '90%', bgcolor: 'success.main', height: '100%', borderRadius: 5 }} />
                    </Box>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      90%
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ width: 60 }}>
                      מפלג
                    </Typography>
                    <Box sx={{ flexGrow: 1, bgcolor: 'warning.light', height: 10, borderRadius: 5 }}>
                      <Box sx={{ width: '78%', bgcolor: 'warning.main', height: '100%', borderRadius: 5 }} />
                    </Box>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      78%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardHeader title="מועדי אימון הבאים" />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EventIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="תרגול חובשים שבועי"
                    secondary="14/03/2025"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EventIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="תרגול מחצ״ים (רתק + חוד)"
                    secondary="16/03/2025"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EventIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="אר״ן צוותי (אתק)"
                    secondary="20/03/2025"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EventIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="תרגול מחצ״ים (אתק + מפלג)"
                    secondary="23/03/2025"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrainingManagement;