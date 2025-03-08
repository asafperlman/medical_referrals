// frontend/src/components/dashboard/UpcomingAndPendingAppointments.js

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  ListItemSecondaryAction, 
  Button, 
  Chip, 
  Grid,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon, 
  Event as EventIcon, 
  CalendarToday as CalendarTodayIcon, 
  Schedule as ScheduleIcon, 
  Person as PersonIcon, 
  MedicalServices as MedicalServicesIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UpcomingAndPendingAppointments = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekAppointments, setWeekAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [pendingByType, setPendingByType] = useState({});
  
  useEffect(() => {
    const fetchAppointmentsData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get appointments for the coming week
        const today = new Date();
        const weekLater = new Date();
        weekLater.setDate(today.getDate() + 7);
        
        const weekResponse = await api.get('/referrals/', {
          params: {
            appointment_date__gte: today.toISOString(),
            appointment_date__lte: weekLater.toISOString(),
            limit: 10
          }
        });
        
        if (weekResponse.data && weekResponse.data.results) {
          setWeekAppointments(weekResponse.data.results);
        }
        
        // Get referrals that need scheduling
        const pendingResponse = await api.get('/referrals/', {
          params: {
            status__in: 'requires_coordination,requires_soldier_coordination,waiting_for_medical_date',
            limit: 50
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
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointments data:', err);
        setError('אירעה שגיאה בטעינת נתוני התורים');
        setLoading(false);
      }
    };
    
    fetchAppointmentsData();
  }, [api]);
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };
  
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
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
      urgent: 'דחוף',
      high: 'גבוה',
      medium: 'בינוני',
      low: 'נמוך',
      minimal: 'זניח'
    };
    return labels[priority] || priority;
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
      <Alert severity="error">{error}</Alert>
    );
  }
  
  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        {/* Upcoming appointments for the week */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="תורים בשבוע הקרוב" 
              avatar={<CalendarTodayIcon color="primary" />}
              action={
                <Button 
                  size="small" 
                  onClick={() => navigate('/referrals', { state: { weekAppointments: true } })}
                  endIcon={<ArrowForwardIcon />}
                >
                  כל התורים
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {weekAppointments.length > 0 ? (
                <List>
                  {weekAppointments.map((appointment) => (
                    <ListItem
                      key={appointment.id}
                      button
                      onClick={() => navigate(`/referrals/${appointment.id}`)}
                      sx={{ 
                        borderRadius: 1,
                        mb: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'translateY(-2px)',
                          transition: 'transform 0.2s'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <EventIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {appointment.full_name}
                            </Typography>
                            <Chip 
                              label={getPriorityLabel(appointment.priority)} 
                              color={getPriorityColor(appointment.priority)}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary" display="block">
                              {appointment.referral_details}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                              <Typography variant="caption">
                                {formatDate(appointment.appointment_date)}
                              </Typography>
                              <Box sx={{ mx: 1 }}>|</Box>
                              <ScheduleIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                              <Typography variant="caption">
                                {formatTime(appointment.appointment_date)}
                              </Typography>
                              {appointment.appointment_location && (
                                <>
                                  <Box sx={{ mx: 1 }}>|</Box>
                                  <Typography variant="caption">
                                    {appointment.appointment_location}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="text.secondary">
                    אין תורים מתוכננים לשבוע הקרוב
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pending referrals that need appointments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="צריך לקבוע תור" 
              avatar={<MedicalServicesIcon color="error" />}
              action={
                <Button 
                  size="small" 
                  onClick={() => navigate('/referrals', { 
                    state: { status: ['requires_coordination', 'requires_soldier_coordination'] } 
                  })}
                  endIcon={<ArrowForwardIcon />}
                >
                  כל ההפניות
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {Object.keys(pendingByType).length > 0 ? (
                <Box>
                  {Object.entries(pendingByType).map(([type, referrals]) => (
                    <Accordion key={type} sx={{ mb: 1, boxShadow: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 'medium' }}>
                          {type} ({referrals.length} הפניות)
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <List dense>
                          {referrals.map(referral => (
                            <ListItem 
                              key={referral.id} 
                              button
                              onClick={() => navigate(`/referrals/${referral.id}`)}
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: 'action.hover',
                                }
                              }}
                            >
                              <ListItemIcon>
                                <PersonIcon color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={referral.full_name}
                                secondary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <Typography variant="caption" component="span" color="text.secondary">
                                      {referral.team} | {referral.status_display || referral.status}
                                    </Typography>
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction>
                                <Chip 
                                  label={getPriorityLabel(referral.priority)}
                                  size="small" 
                                  color={getPriorityColor(referral.priority)}
                                />
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="text.secondary">
                    אין הפניות ממתינות לקביעת תור
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UpcomingAndPendingAppointments;