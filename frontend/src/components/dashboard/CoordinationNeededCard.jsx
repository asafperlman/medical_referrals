// frontend/src/components/dashboard/CoordinationNeededCard.jsx

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Grid,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Button,
  Avatar,
  IconButton,
  Collapse,
  Paper,
  Tooltip,
  Badge
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  ArrowForward as ArrowForwardIcon,
  Category as CategoryIcon,
  PeopleAlt as PeopleAltIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { 
  getPriorityLabel, 
  getPriorityColor, 
  getStatusLabel,
  organizeReferralsByCategory,
  getInitials
} from '../../utils/helpers';

// רכיב להצגת רשימת הפניות
const ReferralsList = ({ referrals, onViewDetails }) => {
  return (
    <List disablePadding>
      {referrals.map((referral) => (
        <ListItem
          key={referral.id}
          button
          onClick={() => onViewDetails(referral)}
          divider
          sx={{ 
            borderRight: `4px solid ${
              referral.priority === 'urgent' || referral.priority === 'highest' 
                ? '#f44336' 
                : '#ff9800'
            }`,
            transition: 'background-color 0.2s',
            '&:hover': { 
              backgroundColor: 'rgba(0, 0, 0, 0.04)' 
            },
            position: 'relative'
          }}
        >
          <ListItemIcon>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                referral.status === 'requires_soldier_coordination' ? (
                  <Tooltip title="דרוש תיאום עם חייל">
                    <PeopleAltIcon 
                      fontSize="small" 
                      sx={{ 
                        color: 'warning.main',
                        bgcolor: 'background.paper',
                        borderRadius: '50%',
                      }}
                    />
                  </Tooltip>
                ) : null
              }
            >
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                {getInitials(referral.full_name)}
              </Avatar>
            </Badge>
          </ListItemIcon>
          
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" component="span">
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
              <>
                <Typography variant="body2" color="text.primary" component="span">
                  {referral.referral_details}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Chip
                    label={getStatusLabel(referral.status)}
                    size="small"
                    variant="outlined"
                    color={referral.status === 'requires_soldier_coordination' ? 'warning' : 'info'}
                  />
                  {referral.team && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      צוות: {referral.team}
                    </Typography>
                  )}
                </Box>
              </>
            }
          />
          
          <ListItemSecondaryAction>
            <IconButton edge="end" color="inherit">
              <KeyboardArrowRightIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

// רכיב להצגת הפניות לפי קטגוריה
const CategoryPanel = ({ category, referrals, onViewDetails, expanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  
  // בדיקה אם יש הפניות דחופות בקטגוריה זו
  const hasUrgentReferrals = useMemo(() => {
    return referrals.some(r => r.priority === 'urgent' || r.priority === 'highest');
  }, [referrals]);
  
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CategoryIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1">
              {category}
            </Typography>
            <Chip 
              label={referrals.length} 
              color={hasUrgentReferrals ? "error" : "warning"} 
              size="small" 
              sx={{ ml: 1 }}
            />
            {hasUrgentReferrals && (
              <Tooltip title="כולל הפניות דחופות">
                <WarningIcon color="error" sx={{ ml: 1, fontSize: 18 }} />
              </Tooltip>
            )}
          </Box>
        }
        action={
          <IconButton onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        sx={{ py: 1 }}
      />
      <Divider />
      <Collapse in={isExpanded}>
        <ReferralsList referrals={referrals} onViewDetails={onViewDetails} />
      </Collapse>
    </Card>
  );
};

// רכיב ראשי להפניות דורשות תיאום
const CoordinationNeededCard = ({ referrals, onViewAll, onViewDetails }) => {
  const [expanded, setExpanded] = useState(true);
  
  // ארגון ההפניות לפי קטגוריות
  const categorizedReferrals = useMemo(() => {
    return organizeReferralsByCategory(referrals || []);
  }, [referrals]);
  
  // בדיקה אם יש הפניות דחופות - הועבר לפני ה-early return כדי לציית לחוקי Hooks
  const hasUrgentReferrals = useMemo(() => {
    return (referrals || []).some(r => r.priority === 'urgent' || r.priority === 'highest');
  }, [referrals]);
  
  // כמות הפניות דורשות תיאום עם חייל - הועבר לפני ה-early return כדי לציית לחוקי Hooks
  const soldierCoordinationCount = useMemo(() => {
    return (referrals || []).filter(r => r.status === 'requires_soldier_coordination').length;
  }, [referrals]);
  
  // בדיקה אם יש הפניות בכלל
  if (!referrals || referrals.length === 0) {
    return (
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">הפניות דורשות תיאום</Typography>
            </Box>
          }
          action={
            <Button
              size="small"
              onClick={onViewAll}
              endIcon={<ArrowForwardIcon />}
            >
              צפה ברשימה
            </Button>
          }
        />
        <Divider />
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <AccessTimeIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            אין הפניות הדורשות תיאום כרגע
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  // סיכום קטגוריות
  const categorySummary = (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={4}>
        <Paper sx={{ 
          p: 2, 
          textAlign: 'center',
          bgcolor: 'warning.50',
          borderColor: 'warning.main',
          border: 1
        }}>
          <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
            {referrals.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            סה"כ הפניות לתיאום
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <Paper sx={{ 
          p: 2, 
          textAlign: 'center',
          bgcolor: hasUrgentReferrals ? 'error.50' : undefined,
          borderColor: hasUrgentReferrals ? 'error.main' : undefined,
          border: hasUrgentReferrals ? 1 : 0
        }}>
          <Typography variant="h4" sx={{ color: 'error.main', fontWeight: hasUrgentReferrals ? 'bold' : 'normal' }}>
            {referrals.filter(r => r.priority === 'urgent' || r.priority === 'highest').length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            הפניות דחופות
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <Paper sx={{ 
          p: 2, 
          textAlign: 'center', 
          bgcolor: soldierCoordinationCount > 0 ? 'info.50' : undefined,
          borderColor: soldierCoordinationCount > 0 ? 'info.main' : undefined,
          border: soldierCoordinationCount > 0 ? 1 : 0
        }}>
          <Typography variant="h4" sx={{ color: 'info.main', fontWeight: soldierCoordinationCount > 0 ? 'bold' : 'normal' }}>
            {soldierCoordinationCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            דורשות תיאום עם חייל
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
  
  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="h6">הפניות דורשות תיאום</Typography>
            {hasUrgentReferrals && (
              <Tooltip title="הפניות דחופות לתיאום">
                <Badge 
                  color="error"
                  badgeContent={referrals.filter(r => r.priority === 'urgent' || r.priority === 'highest').length}
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
              כל ההפניות
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
          {/* סיכום קטגוריות */}
          {categorySummary}
          
          {/* הצגת הפניות לפי קטגוריות */}
          {Object.entries(categorizedReferrals).map(([category, categoryReferrals], index) => (
            <CategoryPanel
              key={category}
              category={category}
              referrals={categoryReferrals}
              onViewDetails={onViewDetails}
              expanded={index === 0} // פתח רק את הקטגוריה הראשונה כברירת מחדל
            />
          ))}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              color="warning"
              onClick={onViewAll}
              endIcon={<ArrowForwardIcon />}
            >
              צפה בכל ההפניות הדורשות תיאום
            </Button>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default CoordinationNeededCard;