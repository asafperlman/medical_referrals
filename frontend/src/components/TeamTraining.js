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
  Rating,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  CalendarToday as CalendarTodayIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Flag as FlagIcon,
  Comment as CommentIcon,
  Search as SearchIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

import * as trainingService from '../services/trainingService';

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL');
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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch teams - first try the API, then fall back to default teams if needed
      let teamsData;
      try {
        teamsData = await trainingService.getTeams();
      } catch (error) {
        console.warn("Failed to fetch teams, using default teams");
        teamsData = ['חוד', 'אתק', 'רתק', 'מפלג'];
      }
      
      // Fetch team trainings from the API
      const trainingsData = await trainingService.getTeamTrainings();
      
      setTeams(teamsData);
      setTrainings(trainingsData);
    } catch (error) {
      console.error('Error fetching training data:', error);
      trainingService.handleApiError(error, showNotification);
    } finally {
      setLoading(false);
    }
  };
  // בחלק של TeamTraining
  const handleSaveTeamTraining = async () => {
    try {
      if (selectedTraining) {
        // עדכון תרגול קיים
        const response = await trainingService.updateTeamTraining(selectedTraining.id, formData);
        if (response && response.data) {
          const updatedTrainings = trainings.map((training) =>
            training.id === selectedTraining.id ? response.data : training
          );
          setTrainings(updatedTrainings);
          showNotification('התרגיל עודכן בהצלחה');
        }
      } else {
        // יצירת תרגול חדש
        const response = await trainingService.createTeamTraining(formData);
        if (response && response.data) {
          setTrainings(prevTrainings => [...prevTrainings, response.data]);
          showNotification('התרגיל נוסף בהצלחה');
        }
      }
      setOpenForm(false);
    } catch (error) {
      console.error('Error saving training:', error);
      showNotification('שגיאה בשמירת הנתונים', 'error');
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
      notes: training.notes || '',
      performance_rating: training.performance_rating,
    });
    setOpenForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveTraining = async () => {
    setLoading(true);
    try {
      if (selectedTraining) {
        // Update existing training
        const updatedTraining = await trainingService.updateTeamTraining(selectedTraining.id, formData);
        
        // Update local state after successful API call
        const updatedTrainings = trainings.map((training) =>
          training.id === selectedTraining.id ? updatedTraining : training
        );
        setTrainings(updatedTrainings);
        showNotification('התרגיל עודכן בהצלחה', 'success');
      } else {
        // Create new training
        const newTraining = await trainingService.createTeamTraining(formData);
        
        // Update local state after successful API call
        setTrainings([...trainings, newTraining]);
        showNotification('התרגיל נוסף בהצלחה', 'success');
      }
      setOpenForm(false);
    } catch (error) {
      console.error('Error saving training:', error);
      trainingService.handleApiError(error, showNotification);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTraining = async (id) => {
    try {
      setLoading(true);
      // Delete training via API
      await trainingService.deleteTeamTraining(id);
      
      // Update local state after successful API call
      const updatedTrainings = trainings.filter((training) => training.id !== id);
      setTrainings(updatedTrainings);
      showNotification('התרגיל נמחק בהצלחה', 'info');
    } catch (error) {
      console.error('Error deleting training:', error);
      trainingService.handleApiError(error, showNotification);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    await fetchData();
    showNotification('הנתונים עודכנו בהצלחה', 'success');
  };

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = searchQuery === '' || 
      training.scenario?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
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
        <Box display="flex">
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
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
                boxShadow: '0 6px 10px rgba(0,0,0,0.2)',
              }
            }}
          >
            תרגיל חדש
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
                error={!formData.date}
                helperText={!formData.date ? "שדה חובה" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!formData.team}>
                <InputLabel id="team-label">צוות</InputLabel>
                <Select 
                  name="team" 
                  value={formData.team} 
                  onChange={handleFormChange} 
                  label="צוות"
                  labelId="team-label"
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
                {!formData.team && <Typography variant="caption" color="error">שדה חובה</Typography>}
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
                error={!formData.scenario}
                helperText={!formData.scenario ? "שדה חובה" : ""}
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
            disabled={!formData.team || !formData.date || !formData.scenario}
          >
            {selectedTraining ? 'עדכן' : 'הוסף'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamTraining;