// frontend/src/components/dashboard/StatisticsOverview.js

import React, { useMemo } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Chip,
  Paper 
} from '@mui/material';
import {
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  MedicalServices as MedicalServicesIcon,
  Warning as WarningIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AssignmentLate as AssignmentLateIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { 
  formatDate, 
  getPriorityLabel, 
  getStatusLabel,
  organizeReferralsByCategory,
  getPriorityColor  
} from '../../utils/helpers';

// כרטיס סטטיסטי בסיסי
const StatCard = ({ icon: Icon, title, value, subtitle, color = 'primary', onClick }) => (
  <Card 
    sx={{ 
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
      '&:hover': onClick ? { transform: 'translateY(-3px)', boxShadow: 3 } : {}
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }} color={`${color}.main`}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ 
          backgroundColor: `${color}.lighter`,
          p: 1.5,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center' 
        }}>
          <Icon sx={{ fontSize: 24, color: `${color}.main` }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// כרטיס קטגוריה להפניות דורשות תיאום
const CategoryCard = ({ category, referrals, onClick }) => {
  const hasUrgent = referrals.some(r => r.priority === 'urgent' || r.priority === 'highest');
  
  return (
    <Paper
      variant="outlined"
      sx={{ 
        p: 2,
        textAlign: 'center',
        cursor: 'pointer',
        borderColor: hasUrgent ? 'error.main' : 'divider',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 2,
          transform: 'translateY(-2px)'
        }
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <CategoryIcon color="primary" />
        {hasUrgent && <Chip label="כולל דחופים" color="error" size="small" />}
      </Box>
      <Typography variant="h5" fontWeight="medium">{referrals.length}</Typography>
      <Typography variant="body1" color="text.secondary">{category}</Typography>
    </Paper>
  );
};

// רכיב הסטטיסטיקה הראשי
const StatisticsOverview = ({ stats, pendingReferrals, todayAppointments, onNavigate }) => {
  // ארגון ההפניות הדורשות תיאום לפי קטגוריות
  const categorizedReferrals = useMemo(() => {
    return organizeReferralsByCategory(pendingReferrals);
  }, [pendingReferrals]);
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>סטטיסטיקה כללית</Typography>
      </Grid>
      
      {/* שורת סטטיסטיקה עליונה */}
      <Grid item xs={6} sm={4} md={2}>
        <StatCard
          icon={MedicalServicesIcon}
          title="סה״כ הפניות פעילות"
          value={stats?.active_referrals || 0}
          subtitle="במערכת כרגע"
          color="primary"
          onClick={() => onNavigate('/referrals')}
        />
      </Grid>
      
      <Grid item xs={6} sm={4} md={2}>
        <StatCard
          icon={CalendarTodayIcon}
          title="תורים להיום"
          value={todayAppointments?.length || 0}
          subtitle={formatDate(new Date())}
          color="info"
          onClick={() => onNavigate('/referrals', { todayAppointments: true })}
        />
      </Grid>
      
      <Grid item xs={6} sm={4} md={2}>
        <StatCard
          icon={AccessTimeIcon}
          title="דורשים תיאום"
          value={pendingReferrals?.length || 0}
          subtitle={`${Object.keys(categorizedReferrals).length} קטגוריות`}
          color="warning"
          onClick={() => onNavigate('/referrals', { status: ['requires_coordination', 'requires_soldier_coordination'] })}
        />
      </Grid>
      
      <Grid item xs={6} sm={4} md={2}>
        <StatCard
          icon={WarningIcon}
          title="הפניות דחופות"
          value={stats?.urgent_referrals || 0}
          subtitle="דורשות טיפול"
          color="error"
          onClick={() => onNavigate('/referrals', { filterPriority: ['urgent', 'highest'] })}
        />
      </Grid>
      
      <Grid item xs={6} sm={4} md={2}>
        <StatCard
          icon={AssignmentTurnedInIcon}
          title="הושלמו החודש"
          value={stats?.completed_this_month || 0}
          subtitle="הפניות שטופלו"
          color="success"
          onClick={() => onNavigate('/referrals', { status: 'completed' })}
        />
      </Grid>
      
      <Grid item xs={6} sm={4} md={2}>
        <StatCard
          icon={AssignmentLateIcon}
          title="ממתינות לאישור"
          value={stats?.waiting_for_approval || 0}
          subtitle="הפניות בהמתנה"
          color="secondary"
          onClick={() => onNavigate('/referrals', { status: 'waiting_for_approval' })}
        />
      </Grid>
      
      {/* הפניות לפי קטגוריות */}
      {Object.keys(categorizedReferrals).length > 0 && (
        <>
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              הפניות הדורשות תיאום לפי קטגוריות
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {Object.entries(categorizedReferrals).map(([category, referrals]) => (
                <Grid item xs={6} sm={4} md={2} key={category}>
                  <CategoryCard
                    category={category}
                    referrals={referrals}
                    onClick={() => onNavigate('/referrals', { 
                      status: ['requires_coordination', 'requires_soldier_coordination'],
                      searchText: category === 'בודדים' ? '' : category
                    })}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default StatisticsOverview;