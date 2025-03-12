import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
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
  Rating,
  Chip,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Event as EventIcon,
  LocationOn as LocationOnIcon,
  Save as SaveIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon
} from '@mui/icons-material';

import * as trainingService from '../services/trainingService';

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL');
};

// Helper function for current month
const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth(),
    year: now.getFullYear()
  };
};

// רכיב תרגול אר"ן צוותי
const TeamTraining = ({ showNotification }) => {
  const [trainings, setTrainings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    team: '',
    scenario: '',
    location: '',
    notes: '',
    performance_rating: 3
  });

  useEffect(() => {
    fetchData();
  }, [showNotification]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch teams data
      let teamsData;
      try {
        teamsData = await trainingService.getTeams();
      } catch (apiError) {
        console.error('שגיאה בטעינת נתוני צוותים:', apiError);
        teamsData = ['חוד', 'אתק', 'רתק', 'מפלג'];
        showNotification('לא ניתן להתחבר לשרת הצוותים. מציג נתונים מקומיים.', 'warning');
      }
      
      // Fetch team trainings data
      let trainingsData;
      try {
        trainingsData = await trainingService.getTeamTrainings();
      } catch (apiError) {
        console.error('שגיאה בטעינת נתוני אימוני צוות:', apiError);
        trainingsData = [];
        showNotification('לא ניתן להתחבר לשרת האימונים. מציג נתונים מקומיים.', 'warning');
      }
      
      // Update state with fetched data
      setTeams(teamsData);
      setTrainings(trainingsData);
    } catch (err) {
      console.error('שגיאה חמורה בטעינת נתונים:', err);
      showNotification('שגיאה בטעינת נתונים', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTraining = () => {
    setSelectedTraining(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      team: '',
      scenario: '',
      location: '',
      notes: '',
      performance_rating: 3
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
      notes: training.notes || '',
      performance_rating: training.performance_rating
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
      
      if (selectedTraining) {
        // Update existing training
        await trainingService.updateTeamTraining(selectedTraining.id, formData);
        showNotification('התרגיל עודכן בהצלחה', 'success');
      } else {
        // Create new training
        await trainingService.createTeamTraining(formData);
        showNotification('התרגיל נוסף בהצלחה', 'success');
      }
      
      // Refresh data
      await fetchData();
      setOpenForm(false);
    } catch (error) {
      console.error('שגיאה בשמירת נתוני תרגיל:', error);
      trainingService.handleApiError(error, showNotification);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTraining = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק תרגיל זה?')) {
      try {
        setLoading(true);
        
        // Delete training
        await trainingService.deleteTeamTraining(id);
        
        // Refresh data
        await fetchData();
        showNotification('התרגיל נמחק בהצלחה', 'success');
      } catch (error) {
        console.error('שגיאה במחיקת תרגיל:', error);
        trainingService.handleApiError(error, showNotification);
      } finally {
        setLoading(false);
      }
    }
  };

  // Group trainings by month
  const groupByMonth = () => {
    const grouped = {};
    
    trainings.forEach(training => {
      const date = new Date(training.date);
      const monthYear = `${date.getMonth()}-${date.getFullYear()}`;
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = {
          month: date.getMonth(),
          year: date.getFullYear(),
          trainings: []
        };
      }
      
      grouped[monthYear].trainings.push(training);
    });
    
    // Sort by date (newest first)
    return Object.values(grouped).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  };

  // Get trainings for the current month
  const getCurrentMonthTrainings = () => {
    const { month, year } = getCurrentMonthYear();
    
    return trainings.filter(training => {
      const date = new Date(training.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });
  };

  // Get team performance for the current month
  const getTeamPerformance = (team) => {
    const currentMonthTrainings = getCurrentMonthTrainings().filter(t => t.team === team);
    
    if (currentMonthTrainings.length === 0) return { count: 0, avg: 0 };
    
    const totalRating = currentMonthTrainings.reduce((sum, t) => sum + t.performance_rating, 0);
    return {
      count: currentMonthTrainings.length,
      avg: (totalRating / currentMonthTrainings.length).toFixed(1)
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const groupedTrainings = groupByMonth();
  const monthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  return (
    <Box sx={{ animation: 'fadeIn 0.5s', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
      {/* כותרת ופעולות */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          תרגילי אר"ן צוותיים
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{
              mr: 1,
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            רענן
          </Button>
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
                boxShadow: '0 6px 10px rgba(0,0,0,0.2)'
              }
            }}
          >
            תרגיל חדש
          </Button>
        </Box>
      </Box>

      {/* סטטיסטיקה חודשית */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {teams.map((team) => {
          const performance = getTeamPerformance(team);
          return (
            <Grid item xs={12} sm={6} md={3} key={team}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: theme => performance.count > 0 
                    ? `0 6px 12px ${team === 'אתק' ? 'rgba(25, 118, 210, 0.15)' : 
                      team === 'רתק' ? 'rgba(76, 175, 80, 0.15)' : 
                      team === 'חוד' ? 'rgba(255, 152, 0, 0.15)' : 'rgba(156, 39, 176, 0.15)'}`
                    : theme.shadows[1],
                  border: theme => performance.count > 0 
                    ? `1px solid ${team === 'אתק' ? 'rgba(25, 118, 210, 0.2)' : 
                      team === 'רתק' ? 'rgba(76, 175, 80, 0.2)' : 
                      team === 'חוד' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(156, 39, 176, 0.2)'}` 
                    : '1px solid rgba(0, 0, 0, 0.12)',
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Chip
                      label={team}
                      sx={{
                        fontWeight: 'bold',
                        bgcolor: team === 'אתק' ? '#bbdefb' : 
                                 team === 'רתק' ? '#c8e6c9' : 
                                 team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                        color: 'rgba(0, 0, 0, 0.7)',
                        px: 1
                      }}
                    />
                    <Rating
                      value={performance.avg}
                      precision={0.5}
                      readOnly
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="h4" fontWeight="bold" align="center" mb={1}>
                    {performance.count}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" align="center">
                    {performance.count === 0 ? 'לא בוצעו תרגילים החודש' : 
                     performance.count === 1 ? 'תרגיל אחד החודש' : 
                     `${performance.count} תרגילים החודש`}
                  </Typography>
                  
                  {performance.count > 0 && (
                    <Box display="flex" justifyContent="center" mt={1}>
                      <Chip
                        icon={<StarIcon fontSize="small" />}
                        label={`ממוצע ציון: ${performance.avg}`}
                        size="small"
                        sx={{ bgcolor: 'rgba(0, 0, 0, 0.05)' }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* תרגילים לפי חודשים */}
      {groupedTrainings.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            אין תרגילים
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            לא נמצאו תרגילי אר"ן צוותיים במערכת.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTraining}
            sx={{ mt: 1, borderRadius: 2 }}
          >
            הוסף תרגיל חדש
          </Button>
        </Paper>
      ) : (
        groupedTrainings.map((group) => (
          <Paper
            key={`${group.month}-${group.year}`}
            sx={{
              mb: 3,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box
              p={2}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="h6" fontWeight="medium">
                {monthNames[group.month]} {group.year}
              </Typography>
              <Chip
                label={`${group.trainings.length} תרגילים`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white'
                }}
              />
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>תאריך</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>צוות</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>תרחיש</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>מיקום</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>ביצוע</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>פעולות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.trainings
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((training) => (
                      <TableRow
                        key={training.id}
                        sx={{
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.03)'
                          }
                        }}
                      >
                        <TableCell>{formatDate(training.date)}</TableCell>
                        <TableCell>
                          <Chip
                            label={training.team}
                            size="small"
                            sx={{
                              fontWeight: 'medium',
                              bgcolor: training.team === 'אתק' ? '#bbdefb' : 
                                      training.team === 'רתק' ? '#c8e6c9' : 
                                      training.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                              color: 'rgba(0, 0, 0, 0.7)'
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
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Tooltip title="ערוך">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditTraining(training)}
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
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))
      )}

      {/* טופס להוספה/עריכה */}
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
          {selectedTraining ? 'עריכת תרגיל' : 'תרגיל חדש'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="date"
                label="תאריך"
                type="date"
                fullWidth
                value={formData.date}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon fontSize="small" />
                    </InputAdornment>
                  )
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
                value={formData.scenario}
                onChange={handleFormChange}
                required
                placeholder="תאר את התרחיש (לדוגמה: פצוע אחד - פגיעת ראש)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AssignmentIcon fontSize="small" />
                    </InputAdornment>
                  )
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
                required
                placeholder="היכן התבצע התרגיל (לדוגמה: שטח אימונים צפוני)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                ציון ביצוע
              </Typography>
              <Rating
                name="performance_rating"
                value={formData.performance_rating}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, performance_rating: newValue });
                }}
                size="large"
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
                placeholder="הוסף הערות רלוונטיות לתרגיל, נקודות לשימור ולשיפור"
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
            disabled={!formData.date || !formData.team || !formData.scenario || !formData.location}
          >
            {selectedTraining ? 'עדכן' : 'הוסף'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamTraining;