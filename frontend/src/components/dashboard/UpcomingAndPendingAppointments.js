// frontend/src/components/dashboard/UpcomingAndPendingAppointments.js

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Button, 
  Chip, 
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  useTheme,
  Avatar,
  alpha
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Refresh as RefreshIcon,
  PriorityHigh as PriorityHighIcon,
  CalendarToday as CalendarTodayIcon,
  MedicalServices as MedicalServicesIcon,
  People as PeopleIcon,
  ArrowForward as ArrowForwardIcon,
  PersonAdd as PersonAddIcon,
  DateRange as DateRangeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Place as PlaceIcon,
  Info as InfoIcon,
  LocationOn as LocationOnIcon,
  Notifications as NotificationsIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UpcomingAndPendingAppointments = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekAppointments, setWeekAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [pendingByType, setPendingByType] = useState({});
  const [pendingByCategory, setPendingByCategory] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [filterTeam, setFilterTeam] = useState('all');
  
  const fetchAppointmentsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get appointments for the coming week
      const today = new Date().toISOString().split('T')[0];
      const weekLater = new Date();
      weekLater.setDate(new Date().getDate() + 7);
      
      const weekResponse = await api.get('/referrals/', {
        params: {
          appointment_date__gte: today,
          appointment_date__lte: weekLater.toISOString(),
          limit: 15,
          ...(filterTeam !== 'all' && { team: filterTeam })
        }
      });
      
      if (weekResponse.data && weekResponse.data.results) {
        setWeekAppointments(weekResponse.data.results);
      }
      
      // Get referrals that need scheduling
      const pendingResponse = await api.get('/referrals/', {
        params: {
          status__in: 'requires_coordination,requires_soldier_coordination,waiting_for_medical_date',
          limit: 50,
          ...(filterTeam !== 'all' && { team: filterTeam })
        }
      });
      
      if (pendingResponse.data && pendingResponse.data.results) {
        const pendingData = pendingResponse.data.results;
        setPendingAppointments(pendingData);
        
        // Organize referrals by type
        const byType = {};
        pendingData.forEach(item => {
          const type = item.referral_details;
          if (!byType[type]) {
            byType[type] = [];
          }
          byType[type].push(item);
        });
        
        setPendingByType(byType);
        
        // Organize referrals by broader categories
        const byCategory = {
          "פיזיותרפיה": [],
          "רופא עור": [],
          "רופא מומחה": [],
          "בדיקות דם": [],
          "דימות רפואי": [],
          "בודדים": []
        };
        
        // Categorize based on referral_details text
        pendingData.forEach(item => {
          const details = item.referral_details?.toLowerCase() || '';
          
          if (details.includes('פיזיו') || details.includes('פיסיותרפיה')) {
            byCategory["פיזיותרפיה"].push(item);
          } else if (details.includes('עור') || details.includes('דרמטולוג')) {
            byCategory["רופא עור"].push(item);
          } else if (details.includes('רופא') || details.includes('ייעוץ')) {
            byCategory["רופא מומחה"].push(item);
          } else if (details.includes('דם') || details.includes('מעבדה')) {
            byCategory["בדיקות דם"].push(item);
          } else if (details.includes('רנטגן') || details.includes('אולטרה') || 
                    details.includes('ct') || details.includes('mri')) {
            byCategory["דימות רפואי"].push(item);
          } else {
            byCategory["בודדים"].push(item);
          }
        });
        
        // Remove empty categories
        Object.keys(byCategory).forEach(key => {
          if (byCategory[key].length === 0) {
            delete byCategory[key];
          }
        });
        
        setPendingByCategory(byCategory);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments data:', err);
      setError('אירעה שגיאה בטעינת נתוני התורים');
      setLoading(false);
    }
  }, [api, filterTeam]);
  
  useEffect(() => {
    fetchAppointmentsData();
  }, [fetchAppointmentsData]);
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const days = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];
    const date = new Date(dateString);
    const dayOfWeek = days[date.getDay()];
    
    return `${dayOfWeek}, ${date.toLocaleDateString('he-IL')}`;
  };
  
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const days = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];
    const date = new Date(dateString);
    const dayOfWeek = days[date.getDay()];
    return `${dayOfWeek}, ${date.toLocaleDateString('he-IL')} ${formatTime(dateString)}`;
  };
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'highest': return 'error';
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };
  
  const getPriorityLabel = (priority) => {
    const labels = {
      highest: 'דחוף ביותר',
      urgent: 'דחופה',
      high: 'גבוהה',
      medium: 'בינונית',
      low: 'נמוכה',
      minimal: 'זניח'
    };
    return labels[priority] || priority;
  };
  
  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    
    return date.getTime() === today.getTime();
  };
  
  const isTomorrow = (dateString) => {
    if (!dateString) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    
    return date.getTime() === tomorrow.getTime();
  };
  
  // Filter appointments based on day relative to today
  const filterAppointmentsByDay = (days) => {
    return weekAppointments.filter(appointment => {
      if (!appointment.appointment_date) return false;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + days);
      
      const appointmentDate = new Date(appointment.appointment_date);
      appointmentDate.setHours(0, 0, 0, 0);
      
      return appointmentDate.getTime() === targetDate.getTime();
    });
  };
  
  // Get appointments for today
  const todayAppointments = filterAppointmentsByDay(0);
  
  // Get appointments for tomorrow
  const tomorrowAppointments = filterAppointmentsByDay(1);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle team filter change
  const handleTeamFilterChange = (event) => {
    setFilterTeam(event.target.value);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error">
        {error}
        <Button color="inherit" size="small" onClick={fetchAppointmentsData} sx={{ ml: 2 }}>
          נסה שוב
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header with filter */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">
          תורים והפניות
        </Typography>
        
        <Box display="flex" alignItems="center">
          <FormControl sx={{ minWidth: 120, mr: 2 }} size="small">
            <InputLabel id="team-filter-label">צוות</InputLabel>
            <Select
              labelId="team-filter-label"
              id="team-filter"
              value={filterTeam}
              label="צוות"
              onChange={handleTeamFilterChange}
            >
              <MenuItem value="all">הכל</MenuItem>
              <MenuItem value="אתק">אתק</MenuItem>
              <MenuItem value="רתק">רתק</MenuItem>
              <MenuItem value="חוד">חוד</MenuItem>
              <MenuItem value="מפלג">מפלג</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="רענן נתונים">
            <IconButton onClick={fetchAppointmentsData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Tabs for different views */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab 
          label={
            <Box display="flex" alignItems="center">
              <DateRangeIcon sx={{ mr: 1 }} /> 
              תורים לשבוע הקרוב
              <Badge 
                badgeContent={weekAppointments.length} 
                color="primary" 
                sx={{ ml: 1 }}
              />
            </Box>
          } 
        />
        <Tab 
          label={
            <Box display="flex" alignItems="center">
              <CalendarTodayIcon sx={{ mr: 1 }} /> 
              תורים להיום 
              <Badge 
                badgeContent={todayAppointments.length} 
                color="error" 
                sx={{ ml: 1 }}
              />
            </Box>
          } 
        />
        <Tab 
          label={
            <Box display="flex" alignItems="center">
              <MedicalServicesIcon sx={{ mr: 1 }} /> 
              הפניות דורשות תיאום
              <Badge 
                badgeContent={pendingAppointments.length} 
                color="warning" 
                sx={{ ml: 1 }}
              />
            </Box>
          } 
        />
      </Tabs>
      
      {/* Weekly appointments tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Summary cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={3} lg={2}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', pb: 2 }}>
                    <DateRangeIcon color="primary" fontSize="large" />
                    <Typography variant="h4" sx={{ my: 1 }}>{weekAppointments.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      סה"כ תורים השבוע
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={4} md={3} lg={2}>
                <Card sx={{ height: '100%', bgcolor: todayAppointments.length > 0 ? 'primary.50' : undefined, borderColor: todayAppointments.length > 0 ? 'primary.main' : undefined, borderWidth: todayAppointments.length > 0 ? 1 : 0, borderStyle: 'solid' }}>
                  <CardContent sx={{ textAlign: 'center', pb: 2 }}>
                    <CalendarTodayIcon color={todayAppointments.length > 0 ? "primary" : "disabled"} fontSize="large" />
                    <Typography variant="h4" sx={{ my: 1 }}>{todayAppointments.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      תורים להיום
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={4} md={3} lg={2}>
                <Card sx={{ height: '100%', bgcolor: tomorrowAppointments.length > 0 ? 'info.50' : undefined, borderColor: tomorrowAppointments.length > 0 ? 'info.main' : undefined, borderWidth: tomorrowAppointments.length > 0 ? 1 : 0, borderStyle: 'solid' }}>
                  <CardContent sx={{ textAlign: 'center', pb: 2 }}>
                    <EventIcon color={tomorrowAppointments.length > 0 ? "info" : "disabled"} fontSize="large" />
                    <Typography variant="h4" sx={{ my: 1 }}>{tomorrowAppointments.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      תורים למחר
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={4} md={3} lg={2}>
                <Card sx={{ height: '100%', bgcolor: pendingAppointments.length > 0 ? 'warning.50' : undefined, borderColor: pendingAppointments.length > 0 ? 'warning.main' : undefined, borderWidth: pendingAppointments.length > 0 ? 1 : 0, borderStyle: 'solid' }}>
                  <CardContent sx={{ textAlign: 'center', pb: 2 }}>
                    <AccessTimeIcon color={pendingAppointments.length > 0 ? "warning" : "disabled"} fontSize="large" />
                    <Typography variant="h4" sx={{ my: 1 }}>{pendingAppointments.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      דורשים תיאום
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Main content */}
          <Grid item xs={12}>
            <Paper sx={{ p: 0, overflow: 'hidden' }}>
              {weekAppointments.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {weekAppointments.map((appointment) => (
                    <React.Fragment key={appointment.id}>
                      <ListItem 
                        button 
                        onClick={() => navigate(`/referrals/${appointment.id}`)}
                        sx={{ 
                          py: 1.5,
                          borderRight: isToday(appointment.appointment_date) ? '4px solid' : isTomorrow(appointment.appointment_date) ? '4px dashed' : 'none',
                          borderRightColor: isToday(appointment.appointment_date) ? 'primary.main' : isTomorrow(appointment.appointment_date) ? 'info.main' : undefined,
                          bgcolor: isToday(appointment.appointment_date) ? alpha(theme.palette.primary.light, 0.1) : 
                                  isTomorrow(appointment.appointment_date) ? alpha(theme.palette.info.light, 0.05) : undefined
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={5}>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, bgcolor: isToday(appointment.appointment_date) ? 'primary.main' : 
                                        isTomorrow(appointment.appointment_date) ? 'info.main' : 'grey.400' }}>
                                {appointment.full_name ? appointment.full_name.charAt(0) : 'A'}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                  {appointment.full_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {appointment.referral_details}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={6} sm={3}>
                            <Box display="flex" alignItems="center">
                              <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {formatDate(appointment.appointment_date)}
                              </Typography>
                              {isToday(appointment.appointment_date) && (
                                <Chip 
                                  label="היום" 
                                  color="primary" 
                                  size="small" 
                                  sx={{ ml: 1 }}
                                />
                              )}
                              {isTomorrow(appointment.appointment_date) && (
                                <Chip 
                                  label="מחר" 
                                  color="info" 
                                  size="small" 
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                            <Box display="flex" alignItems="center" mt={0.5}>
                              <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {formatTime(appointment.appointment_date)}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={6} sm={2}>
                            <Box display="flex" alignItems="center">
                              <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" noWrap>
                                {appointment.appointment_location || '—'}
                              </Typography>
                            </Box>
                            {appointment.team && (
                              <Box display="flex" alignItems="center" mt={0.5}>
                                <PeopleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {appointment.team}
                                </Typography>
                              </Box>
                            )}
                          </Grid>
                          
                          <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                            <Chip
                              label={getPriorityLabel(appointment.priority)}
                              color={getPriorityColor(appointment.priority)}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Box>
                              <IconButton size="small" color="primary">
                                <ArrowForwardIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Grid>
                        </Grid>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CalendarTodayIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                    אין תורים לשבוע הקרוב
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<EventIcon />}
                    onClick={() => navigate('/referrals', { state: { openForm: true } })}
                    sx={{ mt: 2 }}
                  >
                    צור הפניה חדשה
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Today's appointments tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {todayAppointments.length > 0 ? (
            <Grid item xs={12}>
              <Card>
                <CardHeader 
                  title={
                    <Box display="flex" alignItems="center">
                      <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        {`${todayAppointments.length} תורים מתוכננים להיום, ${formatDate(new Date())}`}
                      </Typography>
                    </Box>
                  }
                  action={
                    <Button 
                      size="small" 
                      startIcon={<ArrowForwardIcon />}
                      onClick={() => navigate('/referrals', { state: { todayAppointments: true } })}
                    >
                      צפה בכל התורים
                    </Button>
                  }
                />
                <Divider />
                <CardContent sx={{ p: 0 }}>
                  <Grid container spacing={3} sx={{ p: 3 }}>
                    {todayAppointments.map((appointment) => (
                      <Grid item xs={12} sm={6} md={4} key={appointment.id}>
                        <Paper 
                          sx={{ 
                            p: 2, 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: 3,
                              transform: 'translateY(-2px)'
                            },
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                          onClick={() => navigate(`/referrals/${appointment.id}`)}
                          elevation={2}
                        >
                          <Box display="flex" alignItems="center" mb={1}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                              {appointment.full_name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {appointment.full_name}
                              </Typography>
                              <Chip
                                label={getPriorityLabel(appointment.priority)}
                                color={getPriorityColor(appointment.priority)}
                                size="small"
                              />
                            </Box>
                          </Box>
                          
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {appointment.referral_details}
                          </Typography>
                          
                          <Box mt="auto">
                            <Divider sx={{ my: 1 }} />
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box display="flex" alignItems="center">
                                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {formatTime(appointment.appointment_date)}
                                </Typography>
                              </Box>
                              
                              {appointment.appointment_location && (
                                <Box display="flex" alignItems="center">
                                  <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {appointment.appointment_location}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <CalendarTodayIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                  אין תורים מתוכננים להיום
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<EventIcon />}
                  onClick={() => navigate('/referrals', { state: { openForm: true } })}
                  sx={{ mt: 2 }}
                >
                  צור הפניה חדשה
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
      
      {/* Pending referrals tab */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          {/* תצוגת סיכום של קטגוריות */}
          <Grid item xs={12}>
            <Card sx={{ mb: 3 }}>
              <CardHeader 
                title={
                  <Box display="flex" alignItems="center">
                    <CategoryIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      סיכום הפניות לפי קטגוריות
                    </Typography>
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  {Object.entries(pendingByCategory).map(([category, referrals]) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={category}>
                      <Paper
                        variant="outlined"
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          borderColor: referrals.some(r => r.priority === 'urgent' || r.priority === 'highest') ? 
                            'error.main' : 'divider'
                        }}
                      >
                        <Typography variant="h6">{referrals.length}</Typography>
                        <Typography variant="body2">{category}</Typography>
                        {referrals.some(r => r.priority === 'urgent' || r.priority === 'highest') && (
                          <Chip 
                            label="כולל דחופים" 
                            color="error" 
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {Object.entries(pendingByCategory).length > 0 ? (
            Object.entries(pendingByCategory).map(([category, referrals]) => (
              <Grid item xs={12} key={category}>
                <Card>
                  <CardHeader 
                    title={
                      <Box display="flex" alignItems="center">
                        <MedicalServicesIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          {category} ({referrals.length})
                        </Typography>
                      </Box>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ p: 0, overflow: 'auto' }}>
                    <List disablePadding>
                      {referrals.map((referral) => (
                        <React.Fragment key={referral.id}>
                          <ListItem 
                            button 
                            onClick={() => navigate(`/referrals/${referral.id}`)}
                            sx={{ 
                              py: 1.5,
                              borderRight: (referral.status === 'requires_soldier_coordination' || 
                                          referral.priority === 'urgent' || 
                                          referral.priority === 'highest') ? '4px solid' : 'none',
                              borderRightColor: referral.priority === 'urgent' || referral.priority === 'highest' ? 
                                              'error.main' : 'warning.main'
                            }}
                          >
                            <ListItemIcon>
                              <Avatar>
                                {referral.full_name.charAt(0)}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center">
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                    {referral.full_name}
                                  </Typography>
                                  <Chip 
                                    label={getPriorityLabel(referral.priority)}
                                    color={getPriorityColor(referral.priority)}
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.primary">
                                    {referral.referral_details}
                                  </Typography>
                                  <Box display="flex" alignItems="center" mt={0.5}>
                                    <Chip
                                      label={referral.status === 'requires_soldier_coordination' 
                                        ? 'דרוש תיאום עם חייל' 
                                        : referral.status === 'requires_coordination' 
                                          ? 'דרוש תיאום' 
                                          : 'ממתין לתאריך'
                                      }
                                      size="small"
                                      variant="outlined"
                                      color={referral.status === 'requires_soldier_coordination' ? 'warning' : 'info'}
                                    />
                                    {referral.team && (
                                      <Typography variant="caption" sx={{ ml: 1 }}>
                                        צוות: {referral.team}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Button 
                                variant="outlined" 
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/referrals/${referral.id}`);
                                }}
                              >
                                צפה בפרטים
                              </Button>
                            </ListItemSecondaryAction>
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <MedicalServicesIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                  אין הפניות הדורשות תיאום
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<EventIcon />}
                  onClick={() => navigate('/referrals', { state: { openForm: true } })}
                  sx={{ mt: 2 }}
                >
                  צור הפניה חדשה
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default UpcomingAndPendingAppointments;