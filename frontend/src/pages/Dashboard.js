// medical-referrals/frontend/src/pages/Dashboard.js
import { Chip } from '@mui/material';

import React, { useState, useEffect, useCallback } from 'react';
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
  useTheme
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Refresh as RefreshIcon,
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

const Dashboard = () => {
  const { api } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [urgentReferrals, setUrgentReferrals] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  
  // useCallback to prevent the function from being recreated on every render
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // קבלת סטטיסטיקות כלליות
      const statsResponse = await api.get('/dashboard/stats/');
      setStats(statsResponse.data);
      
      // קבלת הפניות דחופות
      const urgentResponse = await api.get('/referrals/', {
        params: {
          priority: 'urgent',
          status__in: 'new,in_progress,waiting_for_approval,appointment_scheduled',
          limit: 5
        }
      });
      setUrgentReferrals(urgentResponse.data.results);
      
      // קבלת תורים להיום
      const todayResponse = await api.get('/referrals/', {
        params: {
          today_appointments: true,
          limit: 5
        }
      });
      setTodayAppointments(todayResponse.data.results);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('אירעה שגיאה בטעינת הנתונים. אנא נסה שוב.');
      setLoading(false);
    }
  }, [api]); // Include api in dependencies
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  // עיצוב משתנים וצבעים לגרפים
  const isDarkMode = theme.palette.mode === 'dark';
  const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  // הגדרות משותפות לגרפים
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
        grid: {
          color: gridColor
        }
      },
      y: {
        ticks: {
          color: textColor,
          font: {
            family: 'Rubik, Assistant, sans-serif'
          }
        },
        grid: {
          color: gridColor
        }
      }
    }
  };
  
  // צבעים עבור סוגי הסטטוסים
  const statusColors = {
    appointment_scheduled: '#9C27B0', // סגול
    requires_coordination: '#2196F3', // כחול
    completed: '#4CAF50', // ירוק
    waiting_for_budget_approval: '#FF9800', // כתום
    waiting_for_doctor_referral: '#F44336', // אדום
  };
  
  // צבעים עבור עדיפויות
  const priorityColors = {
    low: '#8BC34A', // ירוק בהיר
    medium: '#FFEB3B', // צהוב
    high: '#FFC107', // כתום
    urgent: '#F44336', // אדום
  };
  
  // נתונים לגרף סטטוסים
  const getStatusChartData = () => {
    if (!stats) return { labels: [], datasets: [] };
    
    const statusLabels = {
      new: 'חדש',
      in_progress: 'בטיפול',
      waiting_for_approval: 'ממתין לאישור',
      appointment_scheduled: 'תור נקבע',
      completed: 'הושלם',
      cancelled: 'בוטל',
    };
    
    const labels = Object.keys(stats.status_breakdown).map(key => statusLabels[key] || key);
    const data = Object.values(stats.status_breakdown);
    const backgroundColor = Object.keys(stats.status_breakdown).map(key => statusColors[key] || '#999');
    
    return {
      labels,
      datasets: [
        {
          label: 'הפניות לפי סטטוס',
          data,
          backgroundColor,
        }
      ]
    };
  };
  
  // נתונים לגרף עדיפויות
  const getPriorityChartData = () => {
    if (!stats) return { labels: [], datasets: [] };
    
    const priorityLabels = {
      low: 'נמוכה',
      medium: 'בינונית',
      high: 'גבוהה',
      urgent: 'דחופה',
    };
    
    const labels = Object.keys(stats.priority_breakdown).map(key => priorityLabels[key] || key);
    const data = Object.values(stats.priority_breakdown);
    const backgroundColor = Object.keys(stats.priority_breakdown).map(key => priorityColors[key] || '#999');
    
    return {
      labels,
      datasets: [
        {
          label: 'הפניות לפי עדיפות',
          data,
          backgroundColor,
        }
      ]
    };
  };
  
  // נתונים לגרף הפניות חודשי
  const getMonthlyChartData = () => {
    if (!stats || !stats.monthly_stats) return { labels: [], datasets: [] };
    
    return {
      labels: stats.monthly_stats.map(item => item.month_display),
      datasets: [
        {
          label: 'הפניות חדשות',
          data: stats.monthly_stats.map(item => item.created),
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          tension: 0.3,
        },
        {
          label: 'הפניות שהושלמו',
          data: stats.monthly_stats.map(item => item.completed),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          tension: 0.3,
        }
      ]
    };
  };
  
  // נתונים לגרף סוגי הפניות
  const getReferralTypesChartData = () => {
    if (!stats) return { labels: [], datasets: [] };
    
    const typeLabels = {
      specialist: 'רופא מומחה',
      imaging: 'בדיקות דימות',
      lab: 'בדיקות מעבדה',
      procedure: 'פרוצדורה',
      other: 'אחר',
    };
    
    const labels = Object.keys(stats.referral_types_breakdown).map(key => typeLabels[key] || key);
    const data = Object.values(stats.referral_types_breakdown);
    const backgroundColor = [
      '#3F51B5', '#E91E63', '#00BCD4', '#FFC107', '#9C27B0', '#8BC34A'
    ];
    
    return {
      labels,
      datasets: [
        {
          label: 'סוגי הפניות',
          data,
          backgroundColor,
        }
      ]
    };
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
      <Alert 
        severity="error" 
        action={
          <IconButton color="inherit" size="small" onClick={fetchDashboardData}>
            <RefreshIcon />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          לוח בקרה
        </Typography>
        <Tooltip title="רענן נתונים">
          <IconButton onClick={fetchDashboardData}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* כרטיסי סיכום */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card raised>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <AssignmentIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
                {stats?.total_referrals || 0}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                סה"כ הפניות
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card raised>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <AccessTimeIcon color="info" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" component="div" color="info.main" sx={{ fontWeight: 'bold' }}>
                {stats?.open_referrals || 0}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                הפניות פתוחות
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card raised>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <WarningIcon color="error" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" component="div" color="error" sx={{ fontWeight: 'bold' }}>
                {stats?.urgent_referrals || 0}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                הפניות דחופות
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card raised>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <EventIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" component="div" color="success.main" sx={{ fontWeight: 'bold' }}>
                {stats?.today_appointments || 0}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                תורים להיום
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* גרפים */}
      <Grid container spacing={3}>
        {/* גרף עמודות של הפניות לפי סטטוס */}
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
        
        {/* גרף עוגה של הפניות לפי עדיפות */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              התפלגות הפניות לפי עדיפות
            </Typography>
            <Box sx={{ height: 290 }}>
              <Doughnut 
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false,
                }} 
                data={getPriorityChartData()} 
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* גרף קווי של הפניות לפי חודשים */}
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
        
        {/* גרף עמודות של סוגי הפניות */}
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
        
        {/* רשימת הפניות דחופות */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 350 }}>
            <CardHeader 
              title="הפניות דחופות" 
              action={
                <Tooltip title="צפה בכל ההפניות הדחופות">
                  <IconButton 
                    onClick={() => navigate('/referrals', { state: { filterPriority: 'urgent' } })}
                  >
                    <PriorityHighIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent sx={{ overflowY: 'auto', maxHeight: 265, px: 1 }}>
              {urgentReferrals.length > 0 ? (
                <List>
                  {urgentReferrals.map((referral) => (
                    <React.Fragment key={referral.id}>
                      <ListItem 
                        button 
                        onClick={() => navigate(`/referrals/${referral.id}`)}
                        sx={{ borderRadius: 1 }}
                      >
                        <ListItemIcon>
                          <WarningIcon color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={referral.full_name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {referral.referral_details}
                              </Typography>
                              {` — ${referral.status_display}`}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                  <Typography variant="body1" color="text.secondary">
                    אין הפניות דחופות כרגע
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* רשימת התורים להיום */}
        <Grid item xs={12}>
          <Card sx={{ mt: 3 }}>
            <CardHeader 
              title="תורים להיום" 
              action={
                <Tooltip title="צפה בכל התורים להיום">
                  <IconButton 
                    onClick={() => navigate('/referrals', { state: { todayAppointments: true } })}
                  >
                    <EventIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent>
              {todayAppointments.length > 0 ? (
                <List>
                  {todayAppointments.map((appointment) => (
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
                          primary={appointment.full_name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {appointment.referral_details}
                              </Typography>
                              {appointment.appointment_date && ` — ${new Date(appointment.appointment_date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`}
                              {appointment.appointment_location && ` — ${appointment.appointment_location}`}
                            </>
                          }
                        />
                        <Chip 
                          label={appointment.priority_display}
                          color={priorityColors[appointment.priority] || 'default'}
                          size="small"
                          sx={{ ml: 1 }}
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
      </Grid>
    </Box>
  );
};

export default Dashboard;