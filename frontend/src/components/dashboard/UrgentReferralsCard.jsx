// frontend/src/components/dashboard/UrgentReferralsCard.jsx

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Grid,
  Typography,
  Badge,
  Stack,
  Chip,
  Avatar,
  Button,
  Alert,
  IconButton,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  PriorityHigh as PriorityHighIcon,
  ArrowForward as ArrowForwardIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  PersonOutline as PersonOutlineIcon,
  LocationOn as LocationOnIcon,
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { 
  formatDateTime, 
  formatDate, 
  formatTime,
  getPriorityLabel, 
  getStatusLabel,
  getInitials
} from '../../utils/helpers';

// כרטיס הפניה דחופה
const UrgentReferralCard = ({ referral, onClick }) => {
  // האם הוגדר תור או לא
  const hasAppointment = Boolean(referral.appointment_date);
  
  return (
    <Card
      variant="outlined"
      sx={{
        position: 'relative',
        borderColor: 'error.main',
        transition: 'all 0.2s',
        '&:hover': { 
          boxShadow: 3,
          transform: 'translateY(-2px)'
        },
        cursor: 'pointer',
        height: '100%'
      }}
      onClick={onClick}
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, pr: 6 }}>
          <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
            {getInitials(referral.full_name)}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {referral.full_name}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
          {referral.referral_details}
        </Typography>
        
        <Stack direction="column" spacing={1}>
          {/* סטטוס */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              label={referral.status_display || getStatusLabel(referral.status)}
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
          {hasAppointment ? (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="body2" color="success.main" noWrap>
                נקבע תור: {formatDate(referral.appointment_date)}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="body2" color="warning.main" noWrap>
                {referral.status === 'requires_coordination' ? 
                  'דרוש תיאום תור' : 
                  referral.status === 'requires_soldier_coordination' ?
                  'דרוש תיאום עם החייל' : 'טרם נקבע תור'}
              </Typography>
            </Box>
          )}
          
          {/* שעת התור אם קיימת */}
          {hasAppointment && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                שעה: {formatTime(referral.appointment_date)}
              </Typography>
            </Box>
          )}
          
          {/* מיקום אם קיים */}
          {referral.appointment_location && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {referral.appointment_location}
              </Typography>
            </Box>
          )}
          
          {/* פרטי צוות */}
          {referral.team && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                צוות: {referral.team}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// רכיב ראשי של הפניות דחופות
const UrgentReferralsCard = ({ referrals, onViewAll, onViewDetails }) => {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);
  
  // נציג רק 6 הפניות דחופות, אלא אם כן המשתמש בחר להציג הכל
  const displayReferrals = showAll ? referrals : referrals.slice(0, 6);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const toggleShowAll = () => {
    setShowAll(!showAll);
  };
  
  if (!referrals || referrals.length === 0) {
    return (
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PriorityHighIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">הפניות דחופות</Typography>
            </Box>
          }
          action={
            <IconButton onClick={toggleExpanded}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          }
        />
        <Divider />
        <Collapse in={expanded}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <PriorityHighIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3 }} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                אין הפניות דחופות כרגע
              </Typography>
            </Box>
          </CardContent>
        </Collapse>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PriorityHighIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="h6">הפניות דחופות</Typography>
            <Chip 
              label={referrals.length} 
              color="error" 
              size="small" 
              sx={{ ml: 1 }}
            />
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="סנן הפניות">
              <IconButton onClick={onViewAll} sx={{ mr: 1 }}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={toggleExpanded}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        }
      />
      <Divider />
      <Collapse in={expanded}>
        <CardContent sx={{ pb: 1 }}>
          {referrals.length > 6 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              יש {referrals.length} הפניות דחופות במערכת הדורשות טיפול
            </Alert>
          )}
          
          <Grid container spacing={2}>
            {displayReferrals.map((referral) => (
              <Grid item xs={12} sm={6} md={4} key={referral.id}>
                <UrgentReferralCard
                  referral={referral}
                  onClick={() => onViewDetails(referral)}
                />
              </Grid>
            ))}
          </Grid>
          
          {referrals.length > 6 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button 
                variant="text" 
                onClick={toggleShowAll}
                endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {showAll ? 'הצג פחות' : `הצג עוד ${referrals.length - 6} הפניות דחופות`}
              </Button>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              onClick={onViewAll}
              endIcon={<ArrowForwardIcon />}
              variant="outlined"
              color="error"
              size="small"
            >
              כל ההפניות הדחופות
            </Button>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default UrgentReferralsCard;