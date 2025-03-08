// frontend/src/components/dashboard/WeeklyAppointmentsCard.jsx
import Tooltip from '@mui/material/Tooltip';
import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Collapse,
  Tabs,
  Tab,
  Button,
  Avatar,
  Badge,
  Grid,
  Paper
} from '@mui/material';
import {
  Event as EventIcon,
  CalendarToday as CalendarTodayIcon,
  ArrowForward as ArrowForwardIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Today as TodayIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  PeopleAlt as PeopleAltIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { 
  formatDate, 
  formatTime, 
  isToday,
  isTomorrow,
  getPriorityLabel,
  getPriorityColor,
  getInitials
} from '../../utils/helpers';

// קומפוננטה להצגת תורים לפי ימים
const AppointmentsByDay = ({ appointments, day, onViewDetails }) => {
  const [expanded, setExpanded] = useState(true);
  
  // פילטור התורים לפי היום המבוקש
  const filteredAppointments = useMemo(() => {
    const today = new Date();
    const targetDate = new Date(today);
    
    targetDate.setHours(0, 0, 0, 0);
    
    // אם ביקשו 'היום'
    if (day === 0) {
      return appointments.filter(appointment => isToday(appointment.appointment_date));
    }
    
    // אם ביקשו 'מחר'
    if (day === 1) {
      return appointments.filter(appointment => isTomorrow(appointment.appointment_date));
    }
    
    // אם ביקשו יום ספציפי אחר
    targetDate.setDate(today.getDate() + day);
    
    return appointments.filter(appointment => {
      if (!appointment.appointment_date) return false;
      
      const appointmentDate = new Date(appointment.appointment_date);
      appointmentDate.setHours(0, 0, 0, 0);
      
      return appointmentDate.getTime() === targetDate.getTime();
    });
  }, [appointments, day]);
  
  // אם אין תורים ליום זה, לא נציג כלום
  if (filteredAppointments.length === 0) {
    return null;
  }
  
  // קביעת כותרת ליום
  const getDayTitle = () => {
    if (day === 0) return 'היום';
    if (day === 1) return 'מחר';
    
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + day);
    
    return formatDate(targetDate);
  };
  
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {day === 0 ? (
              <TodayIcon color="primary" sx={{ mr: 1 }} />
            ) : (
              <CalendarTodayIcon color="info" sx={{ mr: 1 }} />
            )}
            <Typography variant="subtitle1">
              {getDayTitle()}
            </Typography>
            <Chip 
              label={filteredAppointments.length} 
              color={day === 0 ? "primary" : "info"} 
              size="small" 
              sx={{ ml: 1 }}
            />
          </Box>
        }
        action={
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        sx={{ py: 1 }}
      />
      <Divider />
      <Collapse in={expanded}>
        <List disablePadding>
          {filteredAppointments.map((appointment) => (
            <ListItem
              key={appointment.id}
              button
              onClick={() => onViewDetails(appointment)}
              sx={{ 
                borderLeft: `4px solid ${day === 0 ? '#1976d2' : '#29b6f6'}`,
                '&:hover': { 
                  backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                }
              }}
            >
              <ListItemIcon>
                <Avatar sx={{ bgcolor: day === 0 ? 'primary.main' : 'info.main' }}>
                  {getInitials(appointment.full_name)}
                </Avatar>
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1" component="span">
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
                    <Typography variant="body2" color="text.primary" display="block">
                      {appointment.referral_details}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(appointment.appointment_date)}
                        </Typography>
                      </Box>
                      {appointment.appointment_location && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOnIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {appointment.appointment_location}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </>
                }
              />
              
              <ListItemSecondaryAction>
                <IconButton edge="end" sx={{ color: day === 0 ? 'primary.main' : 'info.main' }}>
                  <KeyboardArrowRightIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Card>
  );
};

// כרטיס לריכוז התורים לשבוע הקרוב
const WeeklyAppointmentsCard = ({ appointments, onViewAll, onViewDetails }) => {
  const [expanded, setExpanded] = useState(true);
  const [activeDay, setActiveDay] = useState(0); // 0 = היום, 1 = מחר, וכן הלאה
  
  // חישוב כמות התורים להיום
  const todayCount = useMemo(() => {
    return appointments.filter(apt => isToday(apt.appointment_date)).length;
  }, [appointments]);

  // חישוב כמות התורים למחר
  const tomorrowCount = useMemo(() => {
    return appointments.filter(apt => isTomorrow(apt.appointment_date)).length;
  }, [appointments]);
  
  // בדיקה אם יש תורים בכלל
  if (!appointments || appointments.length === 0) {
    return (
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">תורים לשבוע הקרוב</Typography>
            </Box>
          }
          action={
            <Button
              size="small"
              onClick={onViewAll}
              endIcon={<ArrowForwardIcon />}
            >
              צפה בלוח
            </Button>
          }
        />
        <Divider />
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CalendarTodayIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            אין תורים מתוכננים לשבוע הקרוב
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  // סיכום התורים לשבוע
  const weekSummary = (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={4}>
        <Paper sx={{ 
          p: 2, 
          textAlign: 'center',
          bgcolor: appointments.length > 0 ? 'primary.50' : undefined,
          borderColor: appointments.length > 0 ? 'primary.main' : undefined,
          border: appointments.length > 0 ? 1 : 0
        }}>
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            {appointments.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            סה"כ תורים השבוע
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={4}>
        <Paper sx={{ 
          p: 2, 
          textAlign: 'center',
          bgcolor: todayCount > 0 ? 'error.50' : undefined,
          borderColor: todayCount > 0 ? 'error.main' : undefined,
          border: todayCount > 0 ? 1 : 0
        }}>
          <Typography variant="h4" sx={{ color: 'error.main', fontWeight: todayCount > 0 ? 'bold' : 'normal' }}>
            {todayCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            תורים להיום
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={4}>
        <Paper sx={{ 
          p: 2, 
          textAlign: 'center', 
          bgcolor: tomorrowCount > 0 ? 'info.50' : undefined,
          borderColor: tomorrowCount > 0 ? 'info.main' : undefined,
          border: tomorrowCount > 0 ? 1 : 0
        }}>
          <Typography variant="h4" sx={{ color: 'info.main', fontWeight: tomorrowCount > 0 ? 'bold' : 'normal' }}>
            {tomorrowCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            תורים למחר
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
  
  // ניצור 7 טאבים - לכל יום בשבוע
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => i);
  
  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">תורים לשבוע הקרוב</Typography>
            {todayCount > 0 && (
              <Tooltip title={`${todayCount} תורים להיום`}>
                <Badge 
                  color="error"
                  badgeContent={todayCount}
                  sx={{ ml: 1 }}
                />
              </Tooltip>
            )}
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              size="small"
              onClick={onViewAll}
              endIcon={<ArrowForwardIcon />}
              sx={{ mr: 1 }}
            >
              כל התורים
            </Button>
            <IconButton onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        }
      />
      <Divider />
      <Collapse in={expanded}>
        <CardContent>
          {/* סיכום שבועי */}
          {weekSummary}
          
          {/* תצוגה לפי יום */}
          {daysOfWeek.map(day => (
            <AppointmentsByDay
              key={day}
              appointments={appointments}
              day={day}
              onViewDetails={onViewDetails}
            />
          ))}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default WeeklyAppointmentsCard;