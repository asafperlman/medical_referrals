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
      {activeTab === 3 && <TrainingAnalytics showNotification={showNotification} />}

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



bgcolor: getMedicAttendancePercentage(medic.id) >= 80 ? 'success.main' : 
                                            getMedicAttendancePercentage(medic.id) >= 50 ? 'warning.main' : 'error.main',
                                  }}
                                />
                              </Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 'medium',
                                  color: getMedicAttendancePercentage(medic.id) >= 80 ? 'success.main' : 
                                        getMedicAttendancePercentage(medic.id) >= 50 ? 'warning.main' : 'error.main'
                                }}
                              >
                                {getMedicAttendancePercentage(medic.id)}%
                              </Typography>
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Rating 
                            value={getMedicAveragePerformance(medic.id)} 
                            precision={0.5} 
                            readOnly 
                            size="small"
                            sx={{
                              '& .MuiRating-iconFilled': {
                                color: getMedicAveragePerformance(medic.id) >= 4 ? 'success.main' : 
                                       getMedicAveragePerformance(medic.id) >= 3 ? 'warning.main' : 'error.main',
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<AddIcon fontSize="small" />}
                            onClick={() => handleAddTraining(medic)}
                            sx={{ borderRadius: 2 }}
                          >
                            תרגול חדש
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
          
          <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
            <CardHeader 
              title="סיכום אימונים" 
              titleTypographyProps={{ fontWeight: 'bold' }}
              sx={{ 
                bgcolor: '#f5f5f5', 
                borderBottom: '1px solid #e0e0e0',
                p: 2
              }}
            />
            <CardContent>
              <Box textAlign="center">
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={4}>
                    <Box sx={{ p: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        סה"כ אימונים
                      </Typography>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {getTrainingSessions().length}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ p: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        השתתפות ממוצעת
                      </Typography>
                      <Typography 
                        variant="h4" 
                        fontWeight="bold"
                        color={
                          Math.round(
                            medics.reduce((sum, medic) => sum + getMedicAttendancePercentage(medic.id), 0) / medics.length
                          ) >= 80 ? 'success.main' : 
                          Math.round(
                            medics.reduce((sum, medic) => sum + getMedicAttendancePercentage(medic.id), 0) / medics.length
                          ) >= 50 ? 'warning.main' : 'error.main'
                        }
                      >
                        {Math.round(
                          medics.reduce((sum, medic) => sum + getMedicAttendancePercentage(medic.id), 0) /
                          medics.length
                        )}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ p: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        ביצוע ממוצע
                      </Typography>
                      <Box display="flex" justifyContent="center">
                        <Rating
                          value={
                            medics.reduce((sum, medic) => sum + getMedicAveragePerformance(medic.id), 0) /
                            medics.length
                          }
                          precision={0.1}
                          readOnly
                          sx={{
                            '& .MuiRating-iconFilled': {
                              color: 
                                (medics.reduce((sum, medic) => sum + getMedicAveragePerformance(medic.id), 0) / medics.length) >= 4 
                                  ? 'success.main' 
                                  : (medics.reduce((sum, medic) => sum + getMedicAveragePerformance(medic.id), 0) / medics.length) >= 3 
                                    ? 'warning.main' 
                                    : 'error.main',
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  צורך בתרגול לפי נושאים
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  {trainingTypes.map(type => {
                    const medicsTrained = medics.filter(medic => {
                      return trainings.some(t => t.medic_id === medic.id && t.training_type === type && t.attendance);
                    }).length;
                    
                    const percentage = Math.round((medicsTrained / medics.length) * 100);
                    
                    return (
                      <Box key={type} sx={{ mb: 1.5 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Typography variant="body2">{type}</Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 'medium',
                              color: percentage >= 80 ? 'success.main' : 
                                     percentage >= 50 ? 'warning.main' : 'error.main'
                            }}
                          >
                            {medicsTrained} מתוך {medics.length} ({percentage}%)
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: percentage >= 80 ? 'success.light' : 
                                    percentage >= 50 ? 'warning.light' : 'error.light',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: percentage >= 80 ? 'success.main' : 
                                      percentage >= 50 ? 'warning.main' : 'error.main',
                              borderRadius: 4,
                            }
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* טופס הוספת תרגול פרטני */}
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
              תרגול חדש - {selectedMedic?.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
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
                      נוכחות:
                    </Typography>
                    <Chip 
                      label={formData.attendance ? "נכח בתרגול" : "לא נכח בתרגול"} 
                      color={formData.attendance ? "success" : "error"}
                      variant="filled"
                      sx={{ mr: 2 }}
                    />
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.attendance}
                        onChange={(e) => setFormData({ ...formData, attendance: e.target.checked })}
                        color="success"
                      />
                    }
                    label=""
                  />
                </Box>
              </FormControl>
            </Grid>
            {formData.attendance && (
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2">דירוג ביצוע:</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(0,0,0,0.23)', borderRadius: 1, p: 2 }}>
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
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {formData.performance_rating === 5 && "מצוין"}
                      {formData.performance_rating === 4 && "טוב מאוד"}
                      {formData.performance_rating === 3 && "טוב"}
                      {formData.performance_rating === 2 && "בינוני"}
                      {formData.performance_rating === 1 && "חלש"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="הערות"
                fullWidth
                multiline
                rows={2}
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="הערות לגבי ביצוע התרגול"
              />
            </Grid>
            {formData.attendance && (
              <Grid item xs={12}>
                <TextField
                  name="recommendations"
                  label="המלצות לתרגול הבא"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.recommendations}
                  onChange={handleFormChange}
                  placeholder="המלצות לשיפור והתמקדות בתרגולים הבאים"
                />
              </Grid>
            )}
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
            disabled={!formData.training_type}
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
            <PeopleIcon sx={{ mr:.5 }} />
            <Typography variant="h6">
              תרגול קבוצתי חדש
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="date"
                label="תאריך תרגול"
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
            <Grid item xs={12} sm={6}>
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
                label="מיקום"
                fullWidth
                value={sessionFormData.location}
                onChange={handleSessionFormChange}
                placeholder="מיקום התרגול"
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
                rows={2}
                value={sessionFormData.notes}
                onChange={handleSessionFormChange}
                placeholder="הערות כלליות לגבי התרגול"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                בחירת משתתפים:
              </Typography>
              
              <Grid container spacing={1}>
                {medics.map(medic => (
                  <Grid item xs={12} sm={6} md={4} key={medic.id}>
                    <Card 
                      variant={sessionFormData.participants.includes(medic.id) ? "elevation" : "outlined"}
                      elevation={sessionFormData.participants.includes(medic.id) ? 4 : 0}
                      onClick={() => handleSelectMedic(medic.id)}
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
                        <Typography 
                          variant="caption" 
                          color={sessionFormData.participants.includes(medic.id) ? 'primary.contrastText' : 'text.secondary'}
                        >
                          {medic.team} • {medic.role}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {sessionFormData.participants.length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  
                  <Box>
                    <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                      הזנת נתוני ביצוע ({sessionFormData.participants.length} משתתפים):
                    </Typography>
                    
                    <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>שם</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>נוכחות</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>ביצוע</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>הערות והמלצות</TableCell>
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
                                        width: 28, 
                                        height: 28, 
                                        mr: 1, 
                                        fontSize: '0.9rem',
                                        bgcolor: medic?.team === 'אתק' ? '#bbdefb' :
                                                medic?.team === 'רתק' ? '#c8e6c9' :
                                                medic?.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                                        color: 'rgba(0, 0, 0, 0.7)',
                                      }}
                                    >
                                      {medic?.name.charAt(0)}
                                    </Avatar>
                                    {medic?.name}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={medicPerformance[medicId]?.attendance !== false}
                                        onChange={(e) => handleMedicPerformanceChange(medicId, 'attendance', e.target.checked)}
                                        color="success"
                                        size="small"
                                      />
                                    }
                                    label={
                                      <Typography variant="body2">
                                        {medicPerformance[medicId]?.attendance !== false ? "נכח" : "לא נכח"}
                                      </Typography>
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  {medicPerformance[medicId]?.attendance !== false && (
                                    <Rating
                                      value={medicPerformance[medicId]?.performance_rating || 3}
                                      onChange={(e, newValue) => handleMedicPerformanceChange(medicId, 'performance_rating', newValue)}
                                      size="small"
                                      sx={{
                                        '& .MuiRating-iconFilled': {
                                          color: (medicPerformance[medicId]?.performance_rating || 3) >= 4 ? 'success.main' : 
                                                (medicPerformance[medicId]?.performance_rating || 3) >= 3 ? 'warning.main' : 'error.main',
                                        }
                                      }}
                                    />
                                  )}
                                </TableCell>
                                <TableCell>
                                  {medicPerformance[medicId]?.attendance !== false ? (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <TextField
                                        placeholder="הערות"
                                        size="small"
                                        value={medicPerformance[medicId]?.notes || ''}
                                        onChange={(e) => handleMedicPerformanceChange(medicId, 'notes', e.target.value)}
                                        sx={{ width: '50%' }}
                                      />
                                      <TextField
                                        placeholder="המלצות"
                                        size="small"
                                        value={medicPerformance[medicId]?.recommendations || ''}
                                        onChange={(e) => handleMedicPerformanceChange(medicId, 'recommendations', e.target.value)}
                                        sx={{ width: '50%' }}
                                      />
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">לא נכח בתרגול</Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={() => setOpenSessionForm(false)}
            variant="outlined"
            startIcon={<CloseIcon />}
          >
            ביטול
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveTrainingSession}
            startIcon={<SaveIcon />}
            disabled={!sessionFormData.training_type || sessionFormData.participants.length === 0}
          >
            שמור אימון
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// רכיב ניתוח ומעקב אימונים
const TrainingAnalytics = ({ showNotification }) => {
  return (
    <Box sx={{ animation: 'fadeIn 0.5s', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
      <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
        ניתוח ומעקב אימונים
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardHeader 
              title="סטטיסטיקה כללית" 
              titleTypographyProps={{ fontWeight: 'bold' }}
              sx={{ 
                bgcolor: '#f5f5f5', 
                borderBottom: '1px solid #e0e0e0',
                p: 2
              }}
            />
            <CardContent>
              <Box textAlign="center">
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  סך כל התרגילים שבוצעו
                </Typography>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  28
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light' }}>
                      <Typography variant="body2" color="primary.dark" fontWeight="medium">
                        אר"ן צוותי
                      </Typography>
                      <Typography variant="h5" color="primary.dark" fontWeight="bold">7</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'warning.light' }}>
                      <Typography variant="body2" color="warning.dark" fontWeight="medium">
                        מחצ"ים
                      </Typography>
                      <Typography variant="h5" color="warning.dark" fontWeight="bold">13</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'success.light' }}>
                      <Typography variant="body2" color="success.dark" fontWeight="medium">
                        חובשים
                      </Typography>
                      <Typography variant="h5" color="success.dark" fontWeight="bold">8</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardHeader 
              title="דירוגי ביצוע" 
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
                      <TableCell sx={{ fontWeight: 'bold' }}>דירוג ממוצע</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Chip 
                          label="אתק" 
                          size="small" 
                          sx={{ 
                            bgcolor: '#bbdefb',
                            color: 'rgba(0, 0, 0, 0.7)',
                            fontWeight: 'bold',
                            '& .MuiChip-label': { px: 1 }
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={4.2} precision={0.1} readOnly size="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" fontWeight="medium">4.2</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip 
                          label="רתק" 
                          size="small" 
                          sx={{ 
                            bgcolor: '#c8e6c9',
                            color: 'rgba(0, 0, 0, 0.7)',
                            fontWeight: 'bold',
                            '& .MuiChip-label': { px: 1 }
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={3.8} precision={0.1} readOnly size="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" fontWeight="medium">3.8</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip 
                          label="חוד" 
                          size="small" 
                          sx={{ 
                            bgcolor: '#ffe0b2',
                            color: 'rgba(0, 0, 0, 0.7)',
                            fontWeight: 'bold',
                            '& .MuiChip-label': { px: 1 }
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={4.5} precision={0.1} readOnly size="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" fontWeight="medium">4.5</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip 
                          label="מפלג" 
                          size="small" 
                          sx={{ 
                            bgcolor: '#e1bee7',
                            color: 'rgba(0, 0, 0, 0.7)',
                            fontWeight: 'bold',
                            '& .MuiChip-label': { px: 1 }
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={3.6} precision={0.1} readOnly size="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" fontWeight="medium">3.6</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardHeader 
              title="השתתפות" 
              titleTypographyProps={{ fontWeight: 'bold' }}
              sx={{ 
                bgcolor: '#f5f5f5', 
                borderBottom: '1px solid #e0e0e0',
                p: 2
              }}
            />
            <CardContent>
              <Box textAlign="center">
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  אחוז השתתפות כללי
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-block', width: '120px', height: '120px' }}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={120}
                    thickness={5}
                    sx={{ color: 'grey.200', position: 'absolute', top: 0, left: 0 }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={87}
                    size={120}
                    thickness={5}
                    sx={{ color: 'success.main', position: 'absolute', top: 0, left: 0 }}
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
                    <Typography variant="h4" fontWeight="bold" color="success.main">87%</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    השתתפות לפי צוות
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ width: 60 }}>
                      אתק
                    </Typography>
                    <Box sx={{ flexGrow: 1, bgcolor: 'success.light', height: 8, borderRadius: 4 }}>
                      <Box sx={{ width: '92%', bgcolor: 'success.main', height: '100%', borderRadius: 4 }} />
                    </Box>
                    <Typography variant="body2" fontWeight="medium" sx={{ ml: 1, color: 'success.main' }}>
                      92%
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ width: 60 }}>
                      רתק
                    </Typography>
                    <Box sx={{ flexGrow: 1, bgcolor: 'success.light', height: 8, borderRadius: 4 }}>
                      <Box sx={{ width: '85%', bgcolor: 'success.main', height: '100%', borderRadius: 4 }} />
                    </Box>
                    <Typography variant="body2" fontWeight="medium" sx={{ ml: 1, color: 'success.main' }}>
                      85%
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ width: 60 }}>
                      חוד
                    </Typography>
                    <Box sx={{ flexGrow: 1, bgcolor: 'success.light', height: 8, borderRadius: 4 }}>
                      <Box sx={{ width: '90%', bgcolor: 'success.main', height: '100%', borderRadius: 4 }} />
                    </Box>
                    <Typography variant="body2" fontWeight="medium" sx={{ ml: 1, color: 'success.main' }}>
                      90%
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ width: 60 }}>
                      מפלג
                    </Typography>
                    <Box sx={{ flexGrow: 1, bgcolor: 'warning.light', height: 8, borderRadius: 4 }}>
                      <Box sx={{ width: '78%', bgcolor: 'warning.main', height: '100%', borderRadius: 4 }} />
                    </Box>
                    <Typography variant="body2" fontWeight="medium" sx={{ ml: 1, color: 'warning.main' }}>
                      78%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardHeader 
              title="מועדי אימון הבאים" 
              titleTypographyProps={{ fontWeight: 'bold' }}
              sx={{ 
                bgcolor: '#f5f5f5', 
                borderBottom: '1px solid #e0e0e0',
                p: 2
              }}
            />
            <CardContent>
              <List>
                <ListItem sx={{ 
                  mb: 1, 
                  p: 1.5, 
                  borderRadius: 2, 
                  border: '1px solid #e0e0e0',
                  bgcolor: 'rgba(25, 118, 210, 0.04)'
                }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <EventIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary="תרגול חובשים שבועי" 
                    secondary="14/03/2025"
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
                <ListItem sx={{ 
                  mb: 1, 
                  p: 1.5, 
                  borderRadius: 2, 
                  border: '1px solid #e0e0e0',
                  bgcolor: 'rgba(156, 39, 176, 0.04)'
                }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <EventIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary="תרגול מחצ״ים (רתק + חוד)" 
                    secondary="16/03/2025"
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
                <ListItem sx={{ 
                  mb: 1, 
                  p: 1.5, 
                  borderRadius: 2, 
                  border: '1px solid #e0e0e0',
                  bgcolor: 'rgba(211, 47, 47, 0.04)'
                }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'error.main' }}>
                      <EventIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary="אר״ן צוותי (אתק)" 
                    secondary="20/03/2025"
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
                <ListItem sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  border: '1px solid #e0e0e0',
                  bgcolor: 'rgba(2, 136, 209, 0.04)'
                }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <EventIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary="תרגול מחצ״ים (אתק + מפלג)" 
                    secondary="23/03/2025"
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardHeader 
              title="מגמות ושיפור ביצוע" 
              titleTypographyProps={{ fontWeight: 'bold' }}
              sx={{ 
                bgcolor: '#f5f5f5', 
                borderBottom: '1px solid #e0e0e0',
                p: 2
              }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(25, 118, 210, 0.04)', border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                      שיפור תפקוד מחצ"ים
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="body2">זמן ממוצע להנחת CAT</Typography>
                        <Typography variant="body2" fontWeight="medium" color="success.main">
                          <ArrowForwardIcon fontSize="small" sx={{ 
                            transform: 'rotate(-90deg)', 
                            verticalAlign: 'middle',
                            ml: 0.5
                          }} /> 
                          -17%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={83} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'rgba(76, 175, 80, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'success.main',
                            borderRadius: 4,
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        שיפור מ-31 שניות ל-25 שניות בממוצע
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(76, 175, 80, 0.04)', border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                      שיפור ביצוע חובשים
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="body2">ציון ממוצע בתרגולים</Typography>
                        <Typography variant="body2" fontWeight="medium" color="success.main">
                          <ArrowForwardIcon fontSize="small" sx={{ 
                            transform: 'rotate(-90deg)', 
                            verticalAlign: 'middle',
                            ml: 0.5
                          }} /> 
                          +19%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={78} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'rgba(76, 175, 80, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'success.main',
                            borderRadius: 4,
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        שיפור מדירוג 3.2 לדירוג 3.8 בממוצע
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    כמות תרגילים לפי חודש
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                    }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 80, 
                        display: 'flex', 
                        flexDirection: 'column-reverse',
                        mb: 1
                      }}>
                        <Box sx={{ 
                          height: '55%', 
                          width: '100%', 
                          bgcolor: 'primary.main', 
                          borderRadius: '3px 3px 0 0',
                        }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">ינואר</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                    }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 80, 
                        display: 'flex', 
                        flexDirection: 'column-reverse',
                        mb: 1
                      }}>
                        <Box sx={{ 
                          height: '70%', 
                          width: '100%', 
                          bgcolor: 'primary.main', 
                          borderRadius: '3px 3px 0 0',
                        }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">פברואר</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                    }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 80, 
                        display: 'flex', 
                        flexDirection: 'column-reverse',
                        mb: 1,
                        position: 'relative'
                      }}>
                        <Box sx={{ 
                          height: '85%', 
                          width: '100%', 
                          bgcolor: 'primary.main', 
                          borderRadius: '3px 3px 0 0',
                        }} />
                        <Chip 
                          label="החודש" 
                          size="small" 
                          color="primary"
                          sx={{ 
                            position: 'absolute', 
                            top: -20, 
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            height: 20,
                            '& .MuiChip-label': { px: 0.5, fontSize: '0.6rem' }
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">מרץ</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                    }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 80, 
                        display: 'flex', 
                        flexDirection: 'column-reverse',
                        mb: 1
                      }}>
                        <Box sx={{ 
                          height: '30%', 
                          width: '100%', 
                          bgcolor: 'grey.300', 
                          borderRadius: '3px 3px 0 0',
                        }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">אפריל</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                    }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 80, 
                        display: 'flex', 
                        flexDirection: 'column-reverse',
                        mb: 1
                      }}>
                        <Box sx={{ 
                          height: '40%', 
                          width: '100%', 
                          bgcolor: 'grey.300', 
                          borderRadius: '3px 3px 0 0',
                        }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">מאי</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                    }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 80, 
                        display: 'flex', 
                        flexDirection: 'column-reverse',
                        mb: 1
                      }}>
                        <Box sx={{ 
                          height: '45%', 
                          width: '100%', 
                          bgcolor: 'grey.300', 
                          borderRadius: '3px 3px 0 0',
                        }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">יוני</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardHeader 
              title="מעקב סטטוס הכשרות" 
              titleTypographyProps={{ fontWeight: 'bold' }}
              sx={{ 
                bgcolor: '#f5f5f5', 
                borderBottom: '1px solid #e0e0e0',
                p: 2
              }}
            />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  תקינות תרגול לפי תחום
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        borderRadius: 2,
                        bgcolor: 'success.light',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        color: 'success.dark'
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold">96%</Typography>
                      <Typography variant="body2" fontWeight="medium">אר"ן צוותי</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        borderRadius: 2,
                        bgcolor: 'warning.light',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        color: 'warning.dark'
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold">85%</Typography>
                      <Typography variant="body2" fontWeight="medium">תרגול מחצ"ים</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        borderRadius: 2,
                        bgcolor: 'primary.light',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        color: 'primary.dark'
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold">78%</Typography>
                      <Typography variant="body2" fontWeight="medium">תרגול חובשים</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                דירוג השתתפות לפי צוות
              </Typography>
              
              <List>
                <ListItem 
                  sx={{ 
                    p: 2, 
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: 'rgba(76, 175, 80, 0.04)', 
                    border: '1px solid rgba(76, 175, 80, 0.2)'
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: '#bbdefb', color: 'rgba(0, 0, 0, 0.7)' }}>א</Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="body1" fontWeight="medium">צוות אתק</Typography>
                        <Chip label="מקום ראשון" size="small" color="success" sx={{ ml: 1 }} />
                      </Box>
                    }
                    secondary="הצוות מבצע את כל התרגולים הנדרשים באופן מלא ועומד בכל הדרישות"
                  />
                  <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                    <Typography variant="h5" color="success.main" fontWeight="bold">92%</Typography>
                    <StarIcon color="success" />
                  </Box>
                </ListItem>
                
                <ListItem 
                  sx={{ 
                    p: 2, 
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: 'rgba(76, 175, 80, 0.04)', 
                    border: '1px solid rgba(76, 175, 80, 0.2)'
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: '#ffe0b2', color: 'rgba(0, 0, 0, 0.7)' }}>ח</Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="body1" fontWeight="medium">צוות חוד</Typography>
                        <Chip label="מקום שני" size="small" color="success" sx={{ ml: 1 }} />
                      </Box>
                    }
                    secondary="ביצוע טוב מאוד, יש מקום לשיפור בתרגול חובשים"
                  />
                  <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                    <Typography variant="h5" color="success.main" fontWeight="bold">90%</Typography>
                    <StarIcon color="success" />
                  </Box>
                </ListItem>
                
                <ListItem 
                  sx={{ 
                    p: 2, 
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: 'rgba(76, 175, 80, 0.04)', 
                    border: '1px solid rgba(76, 175, 80, 0.2)'
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: '#c8e6c9', color: 'rgba(0, 0, 0, 0.7)' }}>ר</Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="body1" fontWeight="medium">צוות רתק</Typography>
                        <Chip label="מקום שלישי" size="small" color="success" sx={{ ml: 1 }} />
                      </Box>
                    }
                    secondary="ביצוע טוב, יש לשפר נוכחות בתרגולים"
                  />
                  <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                    <Typography variant="h5" color="success.main" fontWeight="bold">85%</Typography>
                    <StarIcon color="success" />
                  </Box>
                </ListItem>
                
                <ListItem 
                  sx={{ 
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 152, 0, 0.04)', 
                    border: '1px solid rgba(255, 152, 0, 0.2)'
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: '#e1bee7', color: 'rgba(0, 0, 0, 0.7)' }}>מ</Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="body1" fontWeight="medium">צוות מפלג</Typography>
                        <Chip label="מקום רביעי" size="small" color="warning" sx={{ ml: 1 }} />
                      </Box>
                    }
                    secondary="ביצוע סביר, יש לשפר משמעותית את הנוכחות בתרגולים ואת הביצועים"
                  />
                  <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                    <Typography variant="h5" color="warning.main" fontWeight="bold">78%</Typography>
                    <StarIcon color="warning" />
                  </Box>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrainingManagement;  ]);
  
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
          { id: 4, name: 'יוני דרור', team: 'מפלג', role: 'חובש פלוגתי', experience: 'מתקדם' },
          { id: 5, name: 'רועי ברק', team: 'אתק', role: 'חובש מחלקתי', experience: 'מתחיל' },
          { id: 6, name: 'גיל שרון', team: 'רתק', role: 'חובש מחלקתי', experience: 'מתקדם' },
        ];
        const mockTrainings = [
          {
            id: 1,
            date: '2025-02-07',
            training_type: 'החייאה',
            location: 'חדר הדרכה ראשי',
            medic_id: 1,
            performance_rating: 4,
            attendance: true,
            notes: 'ביצוע טוב, צריך לשפר זמני תגובה',
            recommendations: 'לתרגל יותר פרוטוקול החייאה מתקדם'
          },
          {
            id: 2,
            date: '2025-02-07',
            training_type: 'החייאה',
            location: 'חדר הדרכה ראשי',
            medic_id: 2,
            performance_rating: 3,
            attendance: true,
            notes: 'בסדר גמור',
            recommendations: ''
          },
          {
            id: 3,
            date: '2025-02-07',
            training_type: 'החייאה',
            location: 'חדר הדרכה ראשי',
            medic_id: 4,
            performance_rating: 5,
            attendance: true,
            notes: 'מצויין',
            recommendations: 'מומלץ לשלב בהדרכות עתידיות'
          },
          {
            id: 4,
            date: '2025-02-14',
            training_type: 'טיפול בפציעות ראש',
            location: 'מרפאה',
            medic_id: 1,
            performance_rating: 4,
            attendance: true,
            notes: '',
            recommendations: 'לחזק נושא אבחון פגיעות מוחיות'
          },
          {
            id: 5,
            date: '2025-02-14',
            training_type: 'טיפול בפציעות ראש',
            location: 'מרפאה',
            medic_id: 3,
            performance_rating: 2,
            attendance: true,
            notes: 'צריך תרגול נוסף',
            recommendations: 'לתרגל פרוטוקול טיפול בפגיעות ראש'
          },
          {
            id: 6,
            date: '2025-02-14',
            training_type: 'טיפול בפציעות ראש',
            location: 'מרפאה',
            medic_id: 4,
            performance_rating: 3,
            attendance: true,
            notes: '',
            recommendations: ''
          },
          {
            id: 7,
            date: '2025-02-21',
            training_type: 'החדרת נתיב אוויר',
            location: 'חדר הדרכה',
            medic_id: 1,
            performance_rating: 3,
            attendance: true,
            notes: '',
            recommendations: 'לתרגל יותר שימוש באירווי'
          },
          {
            id: 8,
            date: '2025-02-21',
            training_type: 'החדרת נתיב אוויר',
            location: 'חדר הדרכה',
            medic_id: 2,
            performance_rating: 4,
            attendance: true,
            notes: '',
            recommendations: ''
          },
          {
            id: 9,
            date: '2025-02-21',
            training_type: 'החדרת נתיב אוויר',
            location: 'חדר הדרכה',
            medic_id: 3,
            performance_rating: 0,
            attendance: false,
            notes: 'לא נכח באימון',
            recommendations: ''
          },
          {
            id: 10,
            date: '2025-03-07',
            training_type: 'עצירת דימומים',
            location: 'חדר הדרכה ראשי',
            medic_id: 1,
            performance_rating: 5,
            attendance: true,
            notes: 'ביצוע מצוין של פרוטוקול',
            recommendations: 'מומלץ לשלב בהדרכות עתידיות'
          },
          {
            id: 11,
            date: '2025-03-07',
            training_type: 'עצירת דימומים',
            location: 'חדר הדרכה ראשי',
            medic_id: 2,
            performance_rating: 4,
            attendance: true,
            notes: 'שיפור ניכר',
            recommendations: ''
          },
          {
            id: 12,
            date: '2025-03-07',
            training_type: 'עצירת דימומים',
            location: 'חדר הדרכה ראשי',
            medic_id: 5,
            performance_rating: 2,
            attendance: true,
            notes: 'יש צורך בתרגול נוסף',
            recommendations: 'לתרגל יותר טכניקות חבישה'
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

  const getTrainingSessions = () => {
    // קבוצה של אימונים לפי תאריך וסוג
    const sessions = [];
    const trainingsByDateAndType = {};
    
    trainings.forEach(training => {
      const key = `${training.date}-${training.training_type}`;
      if (!trainingsByDateAndType[key]) {
        trainingsByDateAndType[key] = {
          date: training.date,
          training_type: training.training_type,
          location: training.location,
          trainings: []
        };
      }
      trainingsByDateAndType[key].trainings.push(training);
    });
    
    // המרה למערך ומיון לפי תאריך
    Object.values(trainingsByDateAndType).forEach(session => {
      sessions.push(session);
    });
    
    return sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getMedicsForSession = (session) => {
    const present = [];
    const absent = [];
    
    medics.forEach(medic => {
      const medicTraining = session.trainings.find(t => t.medic_id === medic.id);
      if (medicTraining && medicTraining.attendance) {
        present.push({...medic, ...medicTraining});
      } else if (medicTraining && !medicTraining.attendance) {
        absent.push(medic);
      } else {
        absent.push(medic);
      }
    });
    
    return { present, absent };
  };

  const getMedicTrainingCount = (medicId) => {
    return trainings.filter(t => t.medic_id === medicId && t.attendance).length;
  };

  const getMedicAveragePerformance = (medicId) => {
    const medicTrainings = trainings.filter((t) => t.medic_id === medicId && t.attendance);
    if (medicTrainings.length === 0) return 0;
    const total = medicTrainings.reduce((sum, t) => sum + t.performance_rating, 0);
    return total / medicTrainings.length;
  };

  const getMedicAttendancePercentage = (medicId) => {
    const sessions = getTrainingSessions();
    const attended = sessions.filter(session => {
      return session.trainings.some(t => t.medic_id === medicId && t.attendance);
    }).length;
    
    return sessions.length > 0 ? Math.round((attended / sessions.length) * 100) : 0;
  };
  
  // הוספת אימון חדש
  const handleOpenNewSession = () => {
    setSessionFormData({
      date: new Date().toISOString().split('T')[0],
      training_type: '',
      location: '',
      notes: '',
      participants: []
    });
    setMedicPerformance({});
    setOpenSessionForm(true);
  };
  
  // שינוי בטופס אימון כללי
  const handleSessionFormChange = (e) => {
    const { name, value } = e.target;
    setSessionFormData({ ...sessionFormData, [name]: value });
  };
  
  // בחירת חובשים להשתתפות בתרגול
  const handleSelectMedic = (medicId) => {
    if (sessionFormData.participants.includes(medicId)) {
      setSessionFormData({
        ...sessionFormData,
        participants: sessionFormData.participants.filter(id => id !== medicId)
      });
      
      // מחיקת נתוני ביצוע
      const newPerformance = {...medicPerformance};
      delete newPerformance[medicId];
      setMedicPerformance(newPerformance);
    } else {
      setSessionFormData({
        ...sessionFormData,
        participants: [...sessionFormData.participants, medicId]
      });
      
      // יצירת נתוני ביצוע ריקים
      setMedicPerformance({
        ...medicPerformance,
        [medicId]: {
          performance_rating: 3,
          attendance: true,
          notes: '',
          recommendations: ''
        }
      });
    }
  };
  
  // עדכון נתוני ביצוע של חובש בתרגול
  const handleMedicPerformanceChange = (medicId, field, value) => {
    setMedicPerformance({
      ...medicPerformance,
      [medicId]: {
        ...medicPerformance[medicId],
        [field]: value
      }
    });
  };
  
  // שמירת האימון הקבוצתי
  const handleSaveTrainingSession = () => {
    if (!sessionFormData.date || !sessionFormData.training_type || sessionFormData.participants.length === 0) {
      showNotification('אנא מלא את כל השדות הנדרשים ובחר לפחות חובש אחד', 'error');
      return;
    }
    
    // יצירת רשומות אימון עבור כל החובשים המשתתפים
    const newTrainings = sessionFormData.participants.map((medicId, index) => ({
      id: Math.max(0, ...trainings.map(t => t.id)) + 1 + index,
      date: sessionFormData.date,
      training_type: sessionFormData.training_type,
      location: sessionFormData.location,
      medic_id: medicId,
      performance_rating: medicPerformance[medicId]?.performance_rating || 3,
      attendance: medicPerformance[medicId]?.attendance !== undefined ? medicPerformance[medicId].attendance : true,
      notes: medicPerformance[medicId]?.notes || '',
      recommendations: medicPerformance[medicId]?.recommendations || ''
    }));
    
    setTrainings([...trainings, ...newTrainings]);
    setOpenSessionForm(false);
    showNotification(`נשמרו נתוני תרגול "${sessionFormData.training_type}" עבור ${sessionFormData.participants.length} חובשים`, 'success');
  };

  // הוספת תרגול לחובש בודד
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

  const handleSaveTraining = () => {
    if (!formData.date || !formData.training_type) {
      showNotification('אנא מלא את כל השדות הנדרשים', 'error');
      return;
    }
    
    const newTraining = {
      id: Math.max(0, ...trainings.map((t) => t.id)) + 1,
      ...formData,
    };
    setTrainings([...trainings, newTraining]);
    setOpenForm(false);
    showNotification('התרגול נוסף בהצלחה', 'success');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };
  
  // המלצות תרגול עבור חובש ספציפי
  const getMedicRecommendations = (medicId) => {
    const medicTrainings = trainings.filter(t => t.medic_id === medicId && t.attendance);
    return medicTrainings
      .filter(t => t.recommendations)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(t => ({
        date: t.date,
        training_type: t.training_type,
        recommendation: t.recommendations
      }));
  };
  
  // נושאים שחובש צריך להשלים (לא תורגל עדיין)
  const getMissingTrainingTypes = (medicId) => {
    const trainedTypes = new Set(
      trainings
        .filter(t => t.medic_id === medicId && t.attendance)
        .map(t => t.training_type)
    );
    
    return trainingTypes.filter(type => !trainedTypes.has(type));
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
          תרגול חובשים שבועי
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<PeopleIcon />} 
            onClick={handleOpenNewSession}
            sx={{ 
              mr: 1,
              borderRadius: 2, 
              textTransform: 'none',
            }}
          >
            תרגול קבוצתי חדש
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
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
            תרגול חדש
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Typography variant="h6" gutterBottom>
            אימונים אחרונים
          </Typography>
          {getTrainingSessions().length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
              <Typography color="text.secondary">לא נמצאו אימונים</Typography>
            </Paper>
          ) : (
            getTrainingSessions().map((session) => (
              <Card key={`${session.date}-${session.training_type}`} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                <CardHeader 
                  title={
                    <Box display="flex" alignItems="center">
                      <Typography variant="h6" component="span" fontWeight="medium">{session.training_type}</Typography>
                      <Chip 
                        label={formatDate(session.date)} 
                        size="small" 
                        color="primary" 
                        sx={{ ml: 1 }} 
                      />
                    </Box>
                  } 
                  subheader={
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <FlagIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        מיקום: {session.location || 'לא צוין'}
                      </Typography>
                    </Box>
                  }
                  sx={{ 
                    bgcolor: '#f5f5f5', 
                    borderBottom: '1px solid #e0e0e0',
                    p: 2
                  }}
                />
                <CardContent sx={{ p: 0 }}>
                  <Grid container spacing={0}>
                    <Grid item xs={12} sm={6} sx={{ borderRight: { sm: '1px solid #e0e0e0' }, borderBottom: { xs: '1px solid #e0e0e0', sm: 'none' } }}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                          חובשים שהשתתפו ({getMedicsForSession(session).present.length})
                        </Typography>
                        {getMedicsForSession(session).present.length === 0 ? (
                          <Typography color="text.secondary" variant="body2">אין משתתפים</Typography>
                        ) : (
                          <List dense>
                            {getMedicsForSession(session).present.map((medicData) => (
                              <ListItem 
                                key={medicData.id}
                                sx={{ 
                                  borderRadius: 2,
                                  mb: 1,
                                  border: '1px solid #e0e0e0',
                                  bgcolor: 'white',
                                  '&:hover': {
                                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                                  }
                                }}
                              >
                                <ListItemIcon>
                                  <Avatar 
                                    sx={{ 
                                      width: 32, 
                                      height: 32, 
                                      fontSize: 14,
                                      bgcolor: medicData.team === 'אתק' ? '#bbdefb' :
                                              medicData.team === 'רתק' ? '#c8e6c9' :
                                              medicData.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                                      color: 'rgba(0, 0, 0, 0.7)',
                                    }}
                                  >
                                    {medicData.name.charAt(0)}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText 
                                  primary={
                                    <Box display="flex" alignItems="center">
                                      <Typography variant="body2" fontWeight="medium">{medicData.name}</Typography>
                                      <Chip 
                                        label={medicData.team} 
                                        size="small" 
                                        sx={{ 
                                          ml: 1, 
                                          height: 18, 
                                          '& .MuiChip-label': { px: 0.5, fontSize: '0.6rem' } 
                                        }} 
                                      />
                                    </Box>
                                  } 
                                  secondary={
                                    <Box>
                                      {medicData.notes && (
                                        <Typography variant="caption" component="div">
                                          {medicData.notes}
                                        </Typography>
                                      )}
                                      {medicData.recommendations && (
                                        <Typography variant="caption" component="div" fontWeight="medium" color="primary.main">
                                          המלצה: {medicData.recommendations}
                                        </Typography>
                                      )}
                                    </Box>
                                  }
                                />
                                {medicData.performance_rating > 0 && (
                                  <Rating 
                                    value={medicData.performance_rating} 
                                    readOnly 
                                    size="small"
                                    sx={{
                                      '& .MuiRating-iconFilled': {
                                        color: medicData.performance_rating >= 4 ? 'success.main' : 
                                               medicData.performance_rating >= 3 ? 'warning.main' : 'error.main',
                                      }
                                    }}
                                  />
                                )}
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                          חובשים שלא השתתפו ({getMedicsForSession(session).absent.length})
                        </Typography>
                        {getMedicsForSession(session).absent.length === 0 ? (
                          <Typography color="success.main" variant="body2">כל החובשים נכחו באימון!</Typography>
                        ) : (
                          <List dense>
                            {getMedicsForSession(session).absent.map((medic) => (
                              <ListItem 
                                key={medic.id}
                                sx={{ 
                                  borderRadius: 2,
                                  mb: 0.5,
                                  '&:hover': {
                                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                                  }
                                }}
                              >
                                <ListItemIcon>
                                  <Avatar 
                                    sx={{ 
                                      width: 28, 
                                      height: 28, 
                                      fontSize: 14, 
                                      bgcolor: 'error.light',
                                      color: 'error.contrastText'
                                    }}
                                  >
                                    {medic.name.charAt(0)}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText 
                                  primary={medic.name} 
                                  secondary={medic.team} 
                                  primaryTypographyProps={{ variant: 'body2' }}
                                  secondaryTypographyProps={{ variant: 'caption' }}
                                />
                                <Chip label="לא נכח" size="small" color="error" variant="outlined" />
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))
          )}
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
            <CardHeader 
              title="סיכום ביצועים" 
              titleTypographyProps={{ fontWeight: 'bold' }}
              sx={{ 
                bgcolor: '#f5f5f5', 
                borderBottom: '1px solid #e0e0e0',
                p: 2
              }}
            />
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>חובש</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>צוות</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>השתתפות</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>ביצוע</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>פעולות</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {medics.map((medic) => (
                      <TableRow key={medic.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar 
                              sx={{ 
                                width: 28, 
                                height: 28, 
                                fontSize: 14, 
                                mr: 1,
                                bgcolor: medic.team === 'אתק' ? '#bbdefb' :
                                        medic.team === 'רתק' ? '#c8e6c9' :
                                        medic.team === 'חוד' ? '#ffe0b2' : '#e1bee7',
                                color: 'rgba(0, 0, 0, 0.7)',
                              }}
                            >
                              {medic.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">{medic.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {medic.role} • {medic.experience}
                              </Typography>
                            </Box>
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
                            }} 
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={`${getMedicAttendancePercentage(medic.id)}% השתתפות`}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box 
                                sx={{ 
                                  width: '50px',
                                  height: '6px',
                                  borderRadius: '3px',
                                  mr: 1,
                                  bgcolor: getMedicAttendancePercentage(medic.id) >= 80 ? 'success.light' : 
                                          getMedicAttendancePercentage(medic.id) >= 50 ? 'warning.light' : 'error.light',
                                }}
                              >
                                <Box 
                                  sx={{ 
                                    width: `${getMedicAttendancePercentage(medic.id)}%`,
                                    height: '100%',
                                    borderRadius: '3px',
                                    bgcolor: getMedicAttendancePercentage(medic.id) >= 80 ? 'success.main' : 
                                            getMedicAttendancePercentage(medic.id) >= import React, { useState, useEffect, useMemo } from 'react';
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

// רכיב עמוד ניהול תרגילים ואימונים
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

// רכיב תרגול חובשים - שודרג לפי דרישות
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
        const mockTeams = ['אתק', 'רתק', 'חוד', 'מפלג'];
        const mockSoldiers = [
          { id: 1, name: 'אלון כהן', team: 'אתק', personal_id: '9876543' },
          { id: 2, name: 'דני לוי', team: 'אתק', personal_id: '8765432' },
          { id: 3, name: 'שחר אברהם', team: 'אתק', personal_id: '7654321' },
          { id: 4, name: 'רועי גולן', team: 'רתק', personal_id: '7654321' },
          { id: 5, name: 'נועם אבן', team: 'רתק', personal_id: '6543219' },
          { id: 6, name: 'יובל חן', team: 'רתק', personal_id: '5432198' },
          { id: 7, name: 'יוסי אברהם', team: 'חוד', personal_id: '5432198' },
          { id: 8, name: 'אייל דרור', team: 'חוד', personal_id: '4321987' },
          { id: 9, name: 'עומר שלום', team: 'חוד', personal_id: '3219876' },
          { id: 10, name: 'דור שלום', team: 'מפלג', personal_id: '3219876' },
          { id: 11, name: 'תומר הדר', team: 'מפלג', personal_id: '2198765' },
          { id: 12, name: 'גיא ברק', team: 'מפלג', personal_id: '1987654' },
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
              </Box><IconButton sx={{ mr: 1, color: 'white' }}>
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
      {activeTab === 3 && <TrainingAnalytics showNotification={showNotification} />}

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
                      <CommentIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }} (
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