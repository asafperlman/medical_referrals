import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  Chip,
  Button,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Badge
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarTodayIcon,
  MedicalServices as MedicalServicesIcon,
  People as PeopleIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  LocationOn as LocationOnIcon,
  Category as CategoryIcon,
  PriorityHigh as PriorityHighIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import TaskManager from '../components/TaskManager';

// רישום רכיבי Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// רכיב המציג כרטיס סטטיסטי
const StatCard = ({ icon: Icon, value, label, iconColor }) => (
  <Card raised>
    <CardContent sx={{ textAlign: 'center', py: 3 }}>
      <Icon sx={{ fontSize: 48, mb: 1 }} color={iconColor} />
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }} color={iconColor}>
        {value || 0}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {label}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { api } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();

  // מצבים
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [urgentReferrals, setUrgentReferrals] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [weekAppointments, setWeekAppointments] = useState([]);
  const [pendingReferrals, setPendingReferrals] = useState([]);
  const [pendingByCategory, setPendingByCategory] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [filterTeam, setFilterTeam] = useState('all');

  // סינון הפניות דחופות לפי צוות
  const filteredUrgentReferrals = useMemo(() => {
    if (filterTeam === 'all') return urgentReferrals;
    return urgentReferrals.filter(ref => ref.team === filterTeam);
  }, [urgentReferrals, filterTeam]);

  // שליפת נתוני לוח הבקרה
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statsResponse = await api.get('/dashboard/stats/');
      setStats(statsResponse.data);

      const urgentResponse = await api.get('/referrals/', {
        params: {
          priority__in: 'urgent,highest',
          status__in: 'new,in_progress,waiting_for_approval,appointment_scheduled,requires_coordination,requires_soldier_coordination',
          limit: 10
        }
      });
      setUrgentReferrals(urgentResponse.data.results || []);

      const today = new Date().toISOString().split('T')[0];
      const todayResponse = await api.get('/referrals/', {
        params: {
          appointment_date__gte: `${today}T00:00:00`,
          appointment_date__lte: `${today}T23:59:59`,
          limit: 5
        }
      });
      setTodayAppointments(todayResponse.data.results || []);

      const weekLater = new Date();
      weekLater.setDate(weekLater.getDate() + 7);
      const weekResponse = await api.get('/referrals/', {
        params: {
          appointment_date__gte: new Date(today).toISOString(),
          appointment_date__lte: weekLater.toISOString(),
          limit: 8
        }
      });
      setWeekAppointments(weekResponse.data.results || []);

      const pendingResponse = await api.get('/referrals/', {
        params: {
          status__in: 'requires_coordination,requires_soldier_coordination',
          limit: 20
        }
      });
      
      const pendingData = pendingResponse.data.results || [];
      setPendingReferrals(pendingData);
      
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

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err.response) {
        if (err.response.status === 500) {
          setError('אירעה שגיאה בשרת. ייתכן ויש בעיית מיגרציות. נא לפנות למנהל המערכת.');
        } else {
          setError(`שגיאה בטעינת הנתונים: ${err.response.status}. אנא נסה שוב.`);
        }
      } else if (err.request) {
        setError('לא התקבלה תגובה מהשרת. בדוק את החיבור לאינטרנט ונסה שוב.');
      } else {
        setError('אירעה שגיאה בטעינת הנתונים. אנא נסה שוב.');
      }
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // הגדרות גרפים בהתאם למצב תצוגה
  const isDarkMode = theme.palette.mode === 'dark';
  const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: {
            family: 'Rubik, Assistant, sans-serif'
          }
        }
      },
      tooltip: {
        rtl: true,
        textDirection: 'rtl'
      }
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
          font: {
            family: 'Rubik, Assistant, sans-serif'
          }
        },
        grid: { color: gridColor }
      },
      y: {
        ticks: {
          color: textColor,
          font: { family: 'Rubik, Assistant, sans-serif' }
        },
        grid: { color: gridColor }
      }
    }
  };

  const statusColors = {
    appointment_scheduled: '#9C27B0',
    requires_coordination: '#2196F3',
    requires_soldier_coordination: '#FF9800',
    completed: '#4CAF50',
    waiting_for_budget_approval: '#FF9800',
    waiting_for_doctor_referral: '#F44336'
  };

  const priorityColors = {
    low: '#8BC34A',
    medium: '#FFEB3B',
    high: '#FFC107',
    urgent: '#F44336',
    highest: '#B71C1C'
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTeamFilterChange = (event) => {
    setFilterTeam(event.target.value);
  };

  // עדכון תוויות עדיפות לפי הדרישות החדשות
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

  // פונקציות לקבלת נתוני גרפים
  const getStatusChartData = () => {
    if (!stats || !stats.status_breakdown) return { labels: [], datasets: [{ label: 'הפניות לפי סטטוס', data: [], backgroundColor: [] }] };

    const statusLabels = {
      new: 'חדש',
      in_progress: 'בטיפול',
      waiting_for_approval: 'ממתין לאישור',
      appointment_scheduled: 'תור נקבע',
      completed: 'הושלם',
      cancelled: 'בוטל',
      requires_coordination: 'דרוש תיאום',
      requires_soldier_coordination: 'תיאום עם חייל',
      waiting_for_medical_date: 'ממתין לתאריך',
      waiting_for_budget_approval: 'ממתין לאישור',
      waiting_for_doctor_referral: 'ממתין להפניה',
      no_show: 'לא הגיע'
    };

    const labels = Object.keys(stats.status_breakdown).map(key => statusLabels[key] || key);
    const data = Object.values(stats.status_breakdown);
    const backgroundColor = Object.keys(stats.status_breakdown).map(key => statusColors[key] || '#999');
    return { labels, datasets: [{ label: 'הפניות לפי סטטוס', data, backgroundColor }] };
  };

  const getPriorityChartData = () => {
    if (!stats || !stats.priority_breakdown) return { labels: [], datasets: [{ label: 'הפניות לפי עדיפות', data: [], backgroundColor: [] }] };

    const priorityLabels = {
      low: 'נמוכה',
      medium: 'בינונית',
      high: 'גבוהה',
      urgent: 'דחופה',
      highest: 'דחוף ביותר',
      minimal: 'זניח'
    };

    const labels = Object.keys(stats.priority_breakdown).map(key => priorityLabels[key] || key);
    const data = Object.values(stats.priority_breakdown);
    const backgroundColor = Object.keys(stats.priority_breakdown).map(key => priorityColors[key] || '#999');
    return { labels, datasets: [{ label: 'הפניות לפי עדיפות', data, backgroundColor }] };
  };

  const getMonthlyChartData = () => {
    if (!stats || !stats.monthly_stats) return {
      labels: [],
      datasets: [
        {
          label: 'הפניות חדשות',
          data: [],
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          tension: 0.3
        },
        {
          label: 'הפניות שהושלמו',
          data: [],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          tension: 0.3
        }
      ]
    };

    return {
      labels: stats.monthly_stats.map(item => item.month_display),
      datasets: [
        {
          label: 'הפניות חדשות',
          data: stats.monthly_stats.map(item => item.created),
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          tension: 0.3
        },
        {
          label: 'הפניות שהושלמו',
          data: stats.monthly_stats.map(item => item.completed),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          tension: 0.3
        }
      ]
    };
  };

  const getReferralTypesChartData = () => {
    if (!stats || !stats.referral_types_breakdown) return { labels: [], datasets: [{ label: 'סוגי הפניות', data: [], backgroundColor: [] }] };

    const typeLabels = {
      specialist: 'רופא מומחה',
      imaging: 'בדיקות דימות',
      lab: 'בדיקות מעבדה',
      procedure: 'פרוצדורה',
      therapy: 'טיפול',
      surgery: 'ניתוח',
      consultation: 'ייעוץ',
      dental: 'טיפול שיניים',
      other: 'אחר'
    };

    const labels = Object.keys(stats.referral_types_breakdown).map(key => typeLabels[key] || key);
    const data = Object.values(stats.referral_types_breakdown);
    const backgroundColor = [
      '#3F51B5', '#E91E63', '#00BCD4', '#FFC107',
      '#9C27B0', '#8BC34A', '#FF5722', '#607D8B', '#795548'
    ];
    return { labels, datasets: [{ label: 'סוגי הפניות', data, backgroundColor }] };
  };

  // עיצוב תאריך ושעה - כולל יום בשבוע
  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    
    const days = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];
    const date = new Date(dateString);
    const dayOfWeek = days[date.getDay()];
    
    return `${dayOfWeek}, ${date.toLocaleDateString('he-IL')} ${date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    
    const days = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];
    const date = new Date(dateString);
    const dayOfWeek = days[date.getDay()];
    
    return `${dayOfWeek}, ${date.toLocaleDateString('he-IL')}`;
  };
  
  const formatTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  // תצוגות תתי-רכיבים לפי טאב
  const renderOverviewTab = () => (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* תורים לשבוע הקרוב */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="תורים לשבוע הקרוב"
              action={
                <Button
                  size="small"
                  onClick={() => navigate('/referrals', { state: { filterAppointmentWeek: true } })}
                  endIcon={<ArrowForwardIcon />}
                >
                  כל התורים
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {weekAppointments.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {weekAppointments.map(appointment => (
                    <React.Fragment key={appointment.id}>
                      <ListItem
                        button
                        onClick={() => navigate(`/referrals/${appointment.id}`)}
                        sx={{ borderRadius: 1 }}
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
                                size="small"
                                sx={{ ml: 1 }}
                                color={getPriorityColor(appointment.priority)}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary" display="block">
                                {appointment.referral_details}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <CalendarTodayIcon sx={{ mr: 0.5, fontSize: 14 }} />
                                <Typography variant="caption">
                                  {formatDate(appointment.appointment_date)}
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
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="text.secondary">
                    אין תורים מתוכננים לשבוע הקרוב
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    sx={{ mt: 1 }}
                    onClick={() => navigate('/referrals', { state: { openForm: true } })}
                  >
                    הוסף הפניה חדשה
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* הפניות הדורשות תיאום - סיכום לפי קטגוריות */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="הפניות הדורשות תיאום"
              action={
                <Button
                  size="small"
                  onClick={() => navigate('/referrals', { state: { status: ['requires_coordination', 'requires_soldier_coordination'] } })}
                  endIcon={<ArrowForwardIcon />}
                >
                  כל ההפניות
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {Object.keys(pendingByCategory).length > 0 ? (
                <Grid container spacing={2}>
                  {Object.entries(pendingByCategory).map(([category, referrals]) => (
                    <Grid item xs={6} md={4} key={category}>
                      <Paper
                        variant="outlined"
                        sx={{ 
                          p: 2,
                          textAlign: 'center',
                          cursor: 'pointer',
                          borderColor: referrals.some(r => r.priority === 'urgent' || r.priority === 'highest') ? 
                            'error.main' : 'divider',
                          '&:hover': {
                            boxShadow: 1
                          }
                        }}
                        onClick={() => navigate('/referrals', { 
                          state: { 
                            status: ['requires_coordination', 'requires_soldier_coordination'],
                            searchText: category === 'בודדים' ? '' : category
                          } 
                        })}
                      >
                        <Typography variant="h5" fontWeight="medium">{referrals.length}</Typography>
                        <Typography variant="body1" color="text.secondary">{category}</Typography>
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
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="text.secondary">
                    אין הפניות הדורשות תיאום כרגע
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* הפניות דחופות - עם מידע נוסף */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PriorityHighIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">הפניות דחופות</Typography>
                </Box>
              }
              action={
                <Button
                  size="small"
                  onClick={() => navigate('/referrals', { state: { filterPriority: ['urgent', 'highest'] } })}
                  endIcon={<ArrowForwardIcon />}
                >
                  כל ההפניות הדחופות
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {filteredUrgentReferrals.length > 0 ? (
                <Grid container spacing={2} sx={{ p: 2 }}>
                  {filteredUrgentReferrals.map(referral => (
                    <Grid item xs={12} sm={6} md={4} key={referral.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          position: 'relative',
                          borderColor: 'error.main',
                          '&:hover': { boxShadow: 3 },
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/referrals/${referral.id}`)}
                      >
                        <Badge 
                          badgeContent={getPriorityLabel(referral.priority)} 
                          color="error"
                          sx={{ 
                            position: 'absolute', 
                            top: 10, 
                            right: 10,
                            '& .MuiBadge-badge': {
                              fontSize: '0.7rem',
                              height: 'auto',
                              padding: '0 6px'
                            }
                          }}
                        />
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, pr: 7 }}>
                            {referral.full_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {referral.referral_details}
                          </Typography>
                          
                          <Stack direction="column" spacing={1}>
                            {/* סטטוס */}
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Chip
                                label={referral.status_display || referral.status}
                                size="small"
                                color={
                                  referral.status === 'requires_soldier_coordination' ? 'warning' :
                                  referral.status === 'requires_coordination' ? 'info' :
                                  referral.status === 'appointment_scheduled' ? 'success' : 'default'
                                }
                                variant="outlined"
                              />
                            </Box>
                            
                            {/* מידע על התור אם קיים */}
                            {referral.appointment_date ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
                                <Typography variant="body2" color="success.main">
                                  נקבע תור: {formatDateTime(referral.appointment_date)}
                                </Typography>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
                                <Typography variant="body2" color="warning.main">
                                  {referral.status === 'requires_coordination' ? 
                                    'דרוש תיאום תור' : 
                                    referral.status === 'requires_soldier_coordination' ?
                                    'דרוש תיאום עם החייל' : 'טרם נקבע תור'}
                                </Typography>
                              </Box>
                            )}
                            
                            {/* מיקום אם קיים */}
                            {referral.appointment_location && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {referral.appointment_location}
                                </Typography>
                              </Box>
                            )}
                            
                            {/* פרטי צוות */}
                            {referral.team && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <PeopleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  צוות: {referral.team}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="text.secondary">
                    אין הפניות דחופות כרגע
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderAppointmentsTab = () => (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* תורים להיום */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="תורים להיום" />
            <Divider />
            <CardContent>
              {todayAppointments.length > 0 ? (
                <List>
                  {todayAppointments.map(appointment => (
                    <React.Fragment key={appointment.id}>
                      <ListItem
                        button
                        onClick={() => navigate(`/referrals/${appointment.id}`)}
                        sx={{ borderRadius: 1 }}
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
                                size="small"
                                sx={{ ml: 1 }}
                                color={getPriorityColor(appointment.priority)}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {appointment.referral_details}
                              </Typography>
                              {appointment.appointment_date && ` — ${formatTime(appointment.appointment_date)}`}
                              {appointment.appointment_location && ` — ${appointment.appointment_location}`}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    אין תורים מתוכננים להיום
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* פעילות אחרונה – דוגמה סטטית לשיפור החווייה */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="פעילות אחרונה" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      <CalendarTodayIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      היום, 09:45
                    </Typography>
                    <Typography variant="body1">
                      נקבע תור חדש עבור "אלון כהן"
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      <CalendarTodayIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      היום, 08:30
                    </Typography>
                    <Typography variant="body1">
                      נוספה הפניה חדשה עבור "דני לוי"
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      <CalendarTodayIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      אתמול, 15:20
                    </Typography>
                    <Typography variant="body1">
                      עודכן סטטוס ההפניה עבור "רון גולן"
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderTasksTab = () => (
    <Box p={3}>
      <TaskManager showFilters={true} standalone={true} />
    </Box>
  );

  const renderAnalyticsTab = () => (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              התפלגות הפניות לפי סטטוס
            </Typography>
            <Box sx={{ height: 290 }}>
              <Bar options={chartOptions} data={getStatusChartData()} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              התפלגות הפניות לפי עדיפות
            </Typography>
            <Box sx={{ height: 290 }}>
              <Doughnut
                options={{ ...chartOptions, maintainAspectRatio: false }}
                data={getPriorityChartData()}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              הפניות חדשות והפניות שהושלמו לפי חודשים
            </Typography>
            <Box sx={{ height: 340 }}>
              <Line options={chartOptions} data={getMonthlyChartData()} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              התפלגות לפי סוג הפניה
            </Typography>
            <Box sx={{ height: 290 }}>
              <Bar options={chartOptions} data={getReferralTypesChartData()} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              סטטיסטיקה לפי צוות
            </Typography>
            <TableContainer sx={{ height: 290, overflow: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>צוות</TableCell>
                    <TableCell align="center">הפניות פתוחות</TableCell>
                    <TableCell align="center">תורים לשבוע</TableCell>
                    <TableCell align="center">דורש תיאום</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">אתק</TableCell>
                    <TableCell align="center">12</TableCell>
                    <TableCell align="center">5</TableCell>
                    <TableCell align="center">3</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">רתק</TableCell>
                    <TableCell align="center">8</TableCell>
                    <TableCell align="center">3</TableCell>
                    <TableCell align="center">1</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">חוד</TableCell>
                    <TableCell align="center">15</TableCell>
                    <TableCell align="center">7</TableCell>
                    <TableCell align="center">4</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">מפלג</TableCell>
                    <TableCell align="center">10</TableCell>
                    <TableCell align="center">2</TableCell>
                    <TableCell align="center">2</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
  
  // פונקציה לקבלת צבע הצ'יפ
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
              נסה שוב
            </Button>
          }
        >
          {error}
        </Alert>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" align="center" gutterBottom>
            לא ניתן להציג את הנתונים כרגע
          </Typography>
          <Typography align="center">
            אנא ודא שכל המיגרציות בשרת הושלמו בהצלחה.
          </Typography>
          <Box display="flex" justifyContent="center" mt={3}>
            <Button variant="contained" color="primary" onClick={fetchDashboardData} startIcon={<RefreshIcon />}>
              רענן נתונים
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {/* כותרת ולחצני סינון */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          לוח בקרה
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
            <IconButton onClick={fetchDashboardData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* לחצנים לפעולות מהירות */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<MedicalServicesIcon />}
          onClick={() => navigate('/referrals', { state: { openForm: true } })}
        >
          הפניה חדשה
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<CalendarTodayIcon />}
          onClick={() => navigate('/referrals', { state: { todayAppointments: true } })}
        >
          תורים להיום ({stats?.today_appointments || 0})
        </Button>
        <Button
          variant="outlined"
          color="warning"
          startIcon={<AccessTimeIcon />}
          onClick={() => navigate('/referrals', { state: { status: ['requires_coordination', 'requires_soldier_coordination'] } })}
        >
          דורש תיאום ({stats?.coordination_required || '—'})
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<WarningIcon />}
          onClick={() => navigate('/referrals', { state: { filterPriority: ['urgent', 'highest'] } })}
        >
          הפניות דחופות ({stats?.urgent_referrals || '—'})
        </Button>
      </Box>

      {/* טאב ראשי */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="סקירה כללית" />
          <Tab label="תורים ופעילות" />
          <Tab label="משימות" />
          <Tab label="ניתוח נתונים" />
        </Tabs>

        {activeTab === 0 && renderOverviewTab()}
        {activeTab === 1 && renderAppointmentsTab()}
        {activeTab === 2 && renderTasksTab()}
        {activeTab === 3 && renderAnalyticsTab()}
      </Paper>
    </Box>
  );
};

export default Dashboard;