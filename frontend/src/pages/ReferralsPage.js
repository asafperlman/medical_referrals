// medical-referrals/frontend/src/pages/ReferralsPage.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Backdrop,
  CircularProgress,
  Divider,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  Badge,
  ListItemText,
  Checkbox,
  Snackbar,
  Menu,
  ListItemIcon,
  Drawer,
  useTheme,
  useMediaQuery,
  Fade,
  Skeleton,
  LinearProgress,
  Avatar,
  Breadcrumbs,
  Link,
  Stack,
} from '@mui/material';

// Icons
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  ContentCopy as ContentCopyIcon,
  FilterAlt as FilterAltIcon,
  FilterList as FilterListIcon,
  ViewList as ViewListIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  MedicalServices as MedicalServicesIcon,
  HourglassEmpty as HourglassEmptyIcon,
  FilterAltOff as FilterAltOffIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  PriorityHigh as PriorityHighIcon,
  Folder as FolderIcon,
  LocalHospital as LocalHospitalIcon,
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';
import ReferralForm from '../components/ReferralForm';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

// Constants
const VIEWS = {
  LIST: 'list',
  BY_TYPE: 'by_type',
  BY_TEAM: 'by_team',
  BY_STATUS: 'by_status',
  CALENDAR: 'calendar',
};

const STATUS_COLORS = {
  appointment_scheduled: '#9c27b0', // purple
  requires_coordination: '#2196f3', // blue
  requires_soldier_coordination: '#ff9800', // orange
  waiting_for_medical_date: '#ffc107', // amber
  completed: '#4caf50', // green
  cancelled: '#f44336', // red
  waiting_for_budget_approval: '#e91e63', // pink
  waiting_for_doctor_referral: '#795548', // brown
  no_show: '#607d8b', // blue-grey
};

const PRIORITY_COLORS = {
  highest: '#d32f2f', // dark red
  urgent: '#f44336', // red
  high: '#ff9800', // orange
  medium: '#2196f3', // blue
  low: '#4caf50', // green
  minimal: '#9e9e9e', // grey
};

const REFERRAL_TYPE_ICONS = {
  specialist: <LocalHospitalIcon />,
  imaging: <AssessmentIcon />,
  lab: <MedicalServicesIcon />,
  procedure: <MedicalServicesIcon />,
  therapy: <MedicalServicesIcon />,
  surgery: <MedicalServicesIcon />,
  consultation: <MedicalServicesIcon />,
  dental: <MedicalServicesIcon />,
  other: <MedicalServicesIcon />,
};

const initialFilters = {
  status: [],
  priority: [],
  referral_details: [],
  team: [],
  referral_type: [],
  has_documents: '',
};

const ReferralsPage = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // States for views and UI
  const [currentView, setCurrentView] = useState(VIEWS.LIST);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // States for referrals data
  const [referrals, setReferrals] = useState([]);
  const [referralsByType, setReferralsByType] = useState({});
  const [referralsByTeam, setReferralsByTeam] = useState({});
  const [referralsByStatus, setReferralsByStatus] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    byPriority: {},
    byType: {},
    byTeam: {},
  });

  // States for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // States for pagination and sorting
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // States for filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [availableReferralDetails, setAvailableReferralDetails] = useState([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  // States for referral form
  const [openForm, setOpenForm] = useState(false);
  const [editingReferral, setEditingReferral] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingReferralId, setDeletingReferralId] = useState(null);

  // Metadata options
  const statusOptions = [
    { value: 'appointment_scheduled', label: 'נקבע תור' },
    { value: 'requires_coordination', label: 'דרוש תיאום' },
    { value: 'requires_soldier_coordination', label: 'דרוש תיאום עם חייל' },
    { value: 'waiting_for_medical_date', label: 'ממתין לתאריך' },
    { value: 'completed', label: 'הושלם' },
    { value: 'cancelled', label: 'בוטל' },
    { value: 'waiting_for_budget_approval', label: 'ממתין לאישור תקציבי' },
    { value: 'waiting_for_doctor_referral', label: 'ממתין להפניה מרופא' },
    { value: 'no_show', label: 'לא הגיע לתור' },
  ];

  const priorityOptions = [
    { value: 'highest', label: 'דחוף ביותר' },
    { value: 'urgent', label: 'דחוף' },
    { value: 'high', label: 'גבוה' },
    { value: 'medium', label: 'בינוני' },
    { value: 'low', label: 'נמוך' },
    { value: 'minimal', label: 'זניח' },
  ];

  const referralTypeOptions = [
    { value: 'specialist', label: 'רופא מומחה' },
    { value: 'imaging', label: 'בדיקות דימות' },
    { value: 'lab', label: 'בדיקות מעבדה' },
    { value: 'therapy', label: 'טיפול' },
    { value: 'procedure', label: 'פרוצדורה' },
    { value: 'surgery', label: 'ניתוח' },
    { value: 'consultation', label: 'ייעוץ' },
    { value: 'dental', label: 'טיפול שיניים' },
    { value: 'other', label: 'אחר' },
  ];

  const teamOptions = [
    { value: 'חוד', label: 'חוד' },
    { value: 'אתק', label: 'אתק' },
    { value: 'רתק', label: 'רתק' },
    { value: 'מפלג', label: 'מפלג' },
  ];

  // Helper to get sort order string for API
  const getSortOrderString = useCallback(() => {
    console.log(`Creating sort order: ${sortDirection === 'desc' ? '-' : ''}${sortBy}`);
    return `${sortDirection === 'desc' ? '-' : ''}${sortBy}`;
  }, [sortBy, sortDirection]);

  // Function to calculate statistics
  const calculateStats = useCallback((refs, total) => {
    // Count by status
    const byStatus = {};
    statusOptions.forEach(option => {
      byStatus[option.value] = 0;
    });
    refs.forEach(ref => {
      if (ref.status) byStatus[ref.status] = (byStatus[ref.status] || 0) + 1;
    });

    // Count by priority
    const byPriority = {};
    priorityOptions.forEach(option => {
      byPriority[option.value] = 0;
    });
    refs.forEach(ref => {
      if (ref.priority) byPriority[ref.priority] = (byPriority[ref.priority] || 0) + 1;
    });

    // Count by type
    const byType = {};
    referralTypeOptions.forEach(option => {
      byType[option.value] = 0;
    });
    refs.forEach(ref => {
      if (ref.referral_type) byType[ref.referral_type] = (byType[ref.referral_type] || 0) + 1;
    });

    // Count by team
    const byTeam = {};
    teamOptions.forEach(option => {
      byTeam[option.value] = 0;
    });
    refs.forEach(ref => {
      if (ref.team) byTeam[ref.team] = (byTeam[ref.team] || 0) + 1;
    });

    setStats({
      total,
      byStatus,
      byPriority,
      byType,
      byTeam,
    });
  }, [statusOptions, priorityOptions, referralTypeOptions, teamOptions]);

  // Function to organize referrals by different categories
  const organizeReferrals = useCallback((refs) => {
    // Group by referral type
    const byType = {};
    refs.forEach(ref => {
      const type = ref.referral_type || 'other';
      if (!byType[type]) byType[type] = [];
      byType[type].push(ref);
    });
    setReferralsByType(byType);

    // Group by team
    const byTeam = {};
    refs.forEach(ref => {
      const team = ref.team || 'unknown';
      if (!byTeam[team]) byTeam[team] = [];
      byTeam[team].push(ref);
    });
    setReferralsByTeam(byTeam);

    // Group by status
    const byStatus = {};
    refs.forEach(ref => {
      const status = ref.status || 'unknown';
      if (!byStatus[status]) byStatus[status] = [];
      byStatus[status].push(ref);
    });
    setReferralsByStatus(byStatus);
  }, []);

  // Helper function to handle API errors
  const handleApiError = useCallback((err) => {
    console.error('API Error details:', err);
    if (err.response) {
      if (err.response.status === 500) {
        setError('אירעה שגיאה בשרת. ייתכן שיש מיגרציות שלא יושמו או בעיה בעיבוד הפרמטרים. נא לפנות למנהל המערכת.');
      } else if (err.response.status === 400) {
        // Bad request - likely an issue with the filtering params
        setError('שגיאה בפרמטרים של הבקשה. ייתכן שיש בעיה באחד מהפרמטרים של הסינון. נסה לנקות את הסינון ולנסות שוב.');
        console.warn('Bad request details:', err.response.data);
      } else {
        setError(`שגיאה בטעינת ההפניות: ${err.response.status}. אנא נסה שוב.`);
      }
    } else if (err.request) {
      setError('לא התקבלה תגובה מהשרת. בדוק את החיבור לאינטרנט ונסה שוב.');
    } else {
      setError('אירעה שגיאה בטעינת הנתונים. אנא נסה שוב.');
    }
  }, []);

  // Function to fetch referrals based on current filters and pagination
  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page + 1, // DRF starts from page 1
        page_size: rowsPerPage,
        search: appliedSearchQuery,
        ordering: getSortOrderString(),
      };

      // Apply filters
      if (appliedFilters.status.length > 0)
        params.status__in = appliedFilters.status.join(',');
      if (appliedFilters.priority.length > 0)
        params.priority__in = appliedFilters.priority.join(',');
      
      // Fix for referral_details filtering - use search instead of referral_details__in
      // which may not be supported by the API
      if (appliedFilters.referral_details.length > 0) {
        // If we're already searching for something, we need to be more specific
        if (appliedSearchQuery) {
          // Combine with existing search
          const detailsSearches = appliedFilters.referral_details.map(detail => 
            `"${detail}"`).join(' OR ');
          params.search = `${appliedSearchQuery} AND (${detailsSearches})`;
        } else {
          // Just search for any of the selected details
          params.search = appliedFilters.referral_details.join(' OR ');
        }
      }
      
      if (appliedFilters.team.length > 0)
        params.team__in = appliedFilters.team.join(',');
      if (appliedFilters.referral_type.length > 0)
        params.referral_type__in = appliedFilters.referral_type.join(',');
      if (appliedFilters.has_documents !== '')
        params.has_documents = appliedFilters.has_documents;

      // Add debugging for API params
      if (process.env.NODE_ENV !== 'production') {
        console.log('API request parameters:', params);
      }

      const response = await api.get('/referrals/', { params });

      if (response.data && 'results' in response.data) {
        const fetchedReferrals = response.data.results || [];
        setReferrals(fetchedReferrals);
        setTotalCount(response.data.count || 0);

        // Extract unique referral details for filter options
        const details = Array.from(
          new Set(fetchedReferrals.map(r => r.referral_details).filter(Boolean))
        ).sort();
        setAvailableReferralDetails(details);

        // Organize referrals by type, team, and status for other views
        organizeReferrals(fetchedReferrals);
        calculateStats(fetchedReferrals, response.data.count);
      } else {
        console.error('Unexpected API response format:', response.data);
        setError('תגובת השרת לא תקינה. אנא פנה לתמיכה.');
      }
    } catch (err) {
      console.error('Error fetching referrals:', err);
      handleApiError(err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [api, page, rowsPerPage, appliedSearchQuery, appliedFilters, getSortOrderString, calculateStats, organizeReferrals, handleApiError]);

  // Initial fetch and updates
  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  // Handle location state (for passing filters from other pages)
  useEffect(() => {
    if (location.state) {
      let newFilters = { ...filters };
      if (location.state.filterPriority) {
        newFilters.priority = [location.state.filterPriority];
      }
      if (location.state.filterType) {
        newFilters.referral_type = [location.state.filterType];
      }
      if (location.state.filterStatus) {
        newFilters.status = [location.state.filterStatus];
      }
      setFilters(newFilters);
      setAppliedFilters(newFilters);
      
      if (location.state.openForm) setOpenForm(true);
      if (location.state.view && Object.values(VIEWS).includes(location.state.view)) {
        setCurrentView(location.state.view);
      }
      
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate, filters]);

  // Search and filter handlers
  const handleSearch = () => {
    setPage(0);
    setAppliedSearchQuery(searchQuery);
    setAppliedFilters(filters);
    showNotification('הסינון עודכן', 'success');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters(initialFilters);
    setAppliedSearchQuery('');
    setAppliedFilters(initialFilters);
    setPage(0);
    showNotification('הסינון נוקה', 'info');
  };

  const handleFilterMenuOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sorting handlers
  const handleSort = (field) => {
    // For status and team fields, ensure we're using the actual field names the API understands
    const fieldMapping = {
      'status': 'status',
      'team': 'team',
      'priority': 'priority',
      'appointment_date': 'appointment_date',
      'created_at': 'created_at',
      'updated_at': 'updated_at',
      'full_name': 'full_name',
      'referral_type': 'referral_type'
    };
    
    const apiField = fieldMapping[field] || field;
    
    if (sortBy === apiField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(apiField);
      setSortDirection('asc');
    }
    setPage(0);
    
    // Debug information
    console.log(`Sorting by: ${apiField}, direction: ${sortDirection === 'asc' ? 'desc' : 'asc'}`);
  };

  // CRUD operations
  const handleAddReferral = () => {
    setEditingReferral(null);
    setOpenForm(true);
  };

  const handleEditReferral = (referral) => {
    setEditingReferral(referral);
    setOpenForm(true);
  };

  const handleSaveReferral = async (referralData) => {
    setLoading(true);
    try {
      if (editingReferral) {
        await api.put(`/referrals/${editingReferral.id}/`, referralData);
        showNotification('ההפניה עודכנה בהצלחה', 'success');
      } else {
        await api.post('/referrals/', referralData);
        showNotification('הפניה חדשה נוצרה בהצלחה', 'success');
      }
      setOpenForm(false);
      fetchReferrals();
    } catch (err) {
      console.error('Error saving referral:', err);
      setError('אירעה שגיאה בשמירת ההפניה');
      showNotification('אירעה שגיאה בשמירת ההפניה', 'error');
      setLoading(false);
      throw err;
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingReferralId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/referrals/${deletingReferralId}/`);
      setDeleteDialogOpen(false);
      showNotification('ההפניה נמחקה בהצלחה', 'success');
      fetchReferrals();
    } catch (err) {
      console.error('Error deleting referral:', err);
      setError('אירעה שגיאה במחיקת ההפניה');
      showNotification('אירעה שגיאה במחיקת ההפניה', 'error');
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // Export and utility functions
  const handleExportCsv = async () => {
    try {
      // Since the export might use the same endpoint with different params
      // we'll use a simple approach - just export what's visible in the current table
      if (referrals.length === 0) {
        showNotification('אין נתונים לייצוא. נסה להרחיב את הסינון תחילה', 'warning');
        return;
      }
      
      // Create CSV content
      const headers = [
        'מספר סידורי', 'שם מלא', 'מספר אישי', 'צוות', 'הפניה מבוקשת', 
        'סטטוס', 'עדיפות', 'תאריך תור', 'מיקום תור', 'נוצר בתאריך', 'עודכן בתאריך'
      ];
      
      const rows = referrals.map((referral, index) => [
        index + 1 + page * rowsPerPage,
        referral.full_name,
        referral.personal_id,
        referral.team,
        referral.referral_details,
        statusOptions.find(o => o.value === referral.status)?.label || referral.status_display || referral.status,
        priorityOptions.find(o => o.value === referral.priority)?.label || referral.priority_display || referral.priority,
        referral.appointment_date ? formatDateTime(referral.appointment_date) : '',
        referral.appointment_location || '',
        formatDateTime(referral.created_at),
        formatDateTime(referral.updated_at)
      ]);
      
      // Convert to CSV
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
          // Escape commas and quotes
          const cellStr = String(cell || '');
          if (cellStr.includes(',') || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(','))
      ].join('\n');
      
      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `referrals_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification('הייצוא הושלם בהצלחה', 'success');
    } catch (err) {
      console.error('Error exporting referrals:', err);
      setError('אירעה שגיאה בייצוא הנתונים');
      showNotification('אירעה שגיאה בייצוא הנתונים', 'error');
    }
  };

  const handleCopyTable = () => {
    const lines = referrals.map((referral, index) => {
      const rowNumber = index + 1 + page * rowsPerPage;
      return `${rowNumber}, ${referral.full_name}, ${referral.personal_id}, ${referral.referral_details || ''}`;
    });
    const tableText = lines.join('\n');
    navigator.clipboard.writeText(tableText);
    showNotification('הנתונים הועתקו ללוח', 'success');
  };

  const showNotification = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Date/time formatting helper
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('he-IL')} ${date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Calculate days since
  const calculateDaysSince = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today - date;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate days until appointment
  const calculateDaysUntil = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Status badge with appointment info
  const StatusBadgeWithInfo = ({ referral }) => {
    const label = statusOptions.find(o => o.value === referral.status)?.label || referral.status_display || referral.status;
    const color = STATUS_COLORS[referral.status] || '#9e9e9e';
    
    let badgeContent = null;
    if (referral.status === 'appointment_scheduled' && referral.appointment_date) {
      const daysUntil = calculateDaysUntil(referral.appointment_date);
      if (daysUntil !== null) {
        if (daysUntil < 0) {
          badgeContent = <Tooltip title="התור כבר עבר"><HourglassEmptyIcon fontSize="small" color="error" /></Tooltip>;
        } else if (daysUntil <= 3) {
          badgeContent = <Tooltip title="תור קרוב!"><PriorityHighIcon fontSize="small" color="warning" /></Tooltip>;
        }
      }
    }
    
    return (
      <Badge
        badgeContent={badgeContent}
        overlap="circular"
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Chip 
          label={label}
          sx={{ 
            bgcolor: color, 
            color: 'white',
            '& .MuiChip-label': { fontWeight: 500 }
          }}
          size="small"
        />
      </Badge>
    );
  };

  // Calculate stats for chart
  const chartData = useMemo(() => {
    if (!stats.byStatus) return [];
    
    return Object.entries(stats.byStatus)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: statusOptions.find(o => o.value === status)?.label || status,
        value: count,
        color: STATUS_COLORS[status] || '#9e9e9e'
      }));
  }, [stats.byStatus, statusOptions]);

  // Calculate stats for priority chart
  const priorityChartData = useMemo(() => {
    if (!stats.byPriority) return [];
    
    return Object.entries(stats.byPriority)
      .filter(([_, count]) => count > 0)
      .map(([priority, count]) => ({
        name: priorityOptions.find(o => o.value === priority)?.label || priority,
        value: count,
        color: PRIORITY_COLORS[priority] || '#9e9e9e'
      }));
  }, [stats.byPriority, priorityOptions]);

  // Get default empty state message based on current view
  const getEmptyStateMessage = () => {
    switch (currentView) {
      case VIEWS.BY_TYPE:
        return 'לא נמצאו הפניות לפי סוג';
      case VIEWS.BY_TEAM:
        return 'לא נמצאו הפניות לפי צוות';
      case VIEWS.BY_STATUS:
        return 'לא נמצאו הפניות לפי סטטוס';
      default:
        return 'לא נמצאו הפניות';
    }
  };

  // Render the main referrals table
  const renderReferralsTable = (referralsToShow = referrals, showPagination = true) => (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size={isMobile ? "small" : "medium"}>
        <TableHead>
          <TableRow>
            <TableCell>מספר</TableCell>
            <TableCell>פעולות</TableCell>
            <TableCell 
              onClick={() => handleSort('full_name')}
              sx={{ cursor: 'pointer' }}
            >
              <Box display="flex" alignItems="center">
                שם מלא
                {sortBy === 'full_name' && (
                  sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                )}
              </Box>
            </TableCell>
            <TableCell>מספר אישי</TableCell>
            <TableCell 
              onClick={() => handleSort('team')}
              sx={{ cursor: 'pointer' }}
            >
              <Box display="flex" alignItems="center">
                צוות
                {sortBy === 'team' && (
                  sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                )}
              </Box>
            </TableCell>
            <TableCell>הפניה מבוקשת</TableCell>
            <TableCell 
              onClick={() => handleSort('status')}
              sx={{ cursor: 'pointer' }}
            >
              <Box display="flex" alignItems="center">
                סטטוס
                {sortBy === 'status' && (
                  sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                )}
              </Box>
            </TableCell>
            <TableCell 
              onClick={() => handleSort('priority')}
              sx={{ cursor: 'pointer' }}
            >
              <Box display="flex" alignItems="center">
                עדיפות
                {sortBy === 'priority' && (
                  sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                )}
              </Box>
            </TableCell>
            <TableCell 
              onClick={() => handleSort('appointment_date')}
              sx={{ cursor: 'pointer' }}
            >
              <Box display="flex" alignItems="center">
                תאריך תור
                {sortBy === 'appointment_date' && (
                  sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                )}
              </Box>
            </TableCell>
            <TableCell 
              onClick={() => handleSort('created_at')}
              sx={{ cursor: 'pointer' }}
            >
              <Box display="flex" alignItems="center">
                גיל הפניה
                {sortBy === 'created_at' && (
                  sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                )}
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && referralsToShow.length === 0 ? (
            Array(5).fill().map((_, idx) => (
              <TableRow key={`skeleton-${idx}`}>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
              </TableRow>
            ))
          ) : referralsToShow.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} align="center">
                <Box sx={{ py: 3 }}>
                  <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary">
                    {getEmptyStateMessage()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    נסה לשנות את הסינון או להוסיף הפניה חדשה
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            referralsToShow.map((referral, index) => {
              const rowNumber = index + 1 + page * rowsPerPage;
              const daysSince = calculateDaysSince(referral.created_at);
              const daysUntil = calculateDaysUntil(referral.appointment_date);
              
              return (
                <TableRow 
                  key={referral.id} 
                  hover
                  sx={{
                    bgcolor: referral.is_urgent ? 'rgba(244, 67, 54, 0.05)' : 'inherit',
                    '&:hover': {
                      bgcolor: referral.is_urgent ? 'rgba(244, 67, 54, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <TableCell>{rowNumber}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="צפה בפרטים">
                        <IconButton color="info" size="small" onClick={() => navigate(`/referrals/${referral.id}`)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ערוך">
                        <IconButton color="primary" size="small" onClick={() => handleEditReferral(referral)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="מחק">
                        <IconButton color="error" size="small" onClick={() => handleDeleteClick(referral.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {referral.full_name}
                    {referral.has_documents && (
                      <Tooltip title="יש מסמכים">
                        <FolderIcon fontSize="small" color="primary" sx={{ ml: 1, verticalAlign: 'middle' }} />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>{referral.personal_id}</TableCell>
                  <TableCell>{referral.team}</TableCell>
                  <TableCell>
                    <Tooltip title={referral.referral_type_display || referralTypeOptions.find(o => o.value === referral.referral_type)?.label || ''}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {REFERRAL_TYPE_ICONS[referral.referral_type] && (
                          <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                            {REFERRAL_TYPE_ICONS[referral.referral_type]}
                          </Box>
                        )}
                        {referral.referral_details}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <StatusBadgeWithInfo referral={referral} />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={referral.priority_display || priorityOptions.find(o => o.value === referral.priority)?.label || referral.priority}
                      sx={{ 
                        bgcolor: PRIORITY_COLORS[referral.priority] || '#9e9e9e',
                        color: 'white',
                        '& .MuiChip-label': { fontWeight: 500 }
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {referral.appointment_date ? (
                      <Tooltip title={`${daysUntil >= 0 ? `עוד ${daysUntil} ימים` : `עבר לפני ${Math.abs(daysUntil)} ימים`}`}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {formatDateTime(referral.appointment_date)}
                          {referral.appointment_location && (
                            <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                              ({referral.appointment_location})
                            </Box>
                          )}
                        </Box>
                      </Tooltip>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {daysSince !== null ? (
                      <Tooltip title={formatDateTime(referral.created_at)}>
                        <Box>
                          {daysSince} ימים
                          {daysSince > 20 && !referral.appointment_date && (
                            <Tooltip title="המתנה ארוכה ללא תור">
                              <HourglassEmptyIcon fontSize="small" color="error" sx={{ ml: 1 }} />
                            </Tooltip>
                          )}
                        </Box>
                      </Tooltip>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {showPagination && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="שורות בעמוד:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} מתוך ${count}`}
        />
      )}
    </TableContainer>
  );

  // Render grouped referrals by type
  const renderReferralsByType = () => (
    <Box>
      {Object.entries(referralsByType).length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            לא נמצאו הפניות לפי סוג
          </Typography>
        </Paper>
      ) : (
        Object.entries(referralsByType).map(([type, refs]) => {
          const typeLabel = referralTypeOptions.find(o => o.value === type)?.label || type;
          return (
            <Fade in key={type}>
              <Paper sx={{ mb: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    {REFERRAL_TYPE_ICONS[type]}
                    <Box component="span" sx={{ ml: 1 }}>{typeLabel}</Box>
                    <Box component="span" sx={{ ml: 2, bgcolor: 'rgba(255,255,255,0.2)', px: 1, py: 0.5, borderRadius: 1 }}>
                      {refs.length} הפניות
                    </Box>
                  </Typography>
                </Box>
                {renderReferralsTable(refs, false)}
              </Paper>
            </Fade>
          );
        })
      )}
    </Box>
  );

  // Render grouped referrals by team
  const renderReferralsByTeam = () => (
    <Box>
      {Object.entries(referralsByTeam).length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <GroupIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            לא נמצאו הפניות לפי צוות
          </Typography>
        </Paper>
      ) : (
        Object.entries(referralsByTeam).map(([team, refs]) => (
          <Fade in key={team}>
            <Paper sx={{ mb: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 2, bgcolor: 'secondary.main', color: 'white' }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <GroupIcon />
                  <Box component="span" sx={{ ml: 1 }}>צוות {team}</Box>
                  <Box component="span" sx={{ ml: 2, bgcolor: 'rgba(255,255,255,0.2)', px: 1, py: 0.5, borderRadius: 1 }}>
                    {refs.length} הפניות
                  </Box>
                </Typography>
              </Box>
              {renderReferralsTable(refs, false)}
            </Paper>
          </Fade>
        ))
      )}
    </Box>
  );

  // Render grouped referrals by status
  const renderReferralsByStatus = () => (
    <Box>
      {Object.entries(referralsByStatus).length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            לא נמצאו הפניות לפי סטטוס
          </Typography>
        </Paper>
      ) : (
        statusOptions
          .filter(option => referralsByStatus[option.value]?.length > 0)
          .map(option => {
            const refs = referralsByStatus[option.value] || [];
            return (
              <Fade in key={option.value}>
                <Paper sx={{ mb: 3, overflow: 'hidden' }}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      bgcolor: STATUS_COLORS[option.value] || 'grey.500', 
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box component="span">{option.label}</Box>
                    </Typography>
                    <Box component="span" sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 1, py: 0.5, borderRadius: 1 }}>
                      {refs.length} הפניות
                    </Box>
                  </Box>
                  {renderReferralsTable(refs, false)}
                </Paper>
              </Fade>
            );
          })
      )}
    </Box>
  );

  // Render stats and dashboard cards
  const renderStatsDashboard = () => (
    <Box>
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>סטטוס הפניות</Typography>
            <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
              {initialLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : (
                chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        isAnimationActive={false}
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value, name) => [value, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">אין נתונים להצגה</Typography>
                  </Box>
                )
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>עדיפות הפניות</Typography>
            <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
              {initialLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : (
                priorityChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        isAnimationActive={false}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {priorityChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value, name, props) => {
                          // Find the original data item
                          const item = priorityChartData[props.payload.payload.index];
                          return [`${value} הפניות`, item.name];
                        }}
                      />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        formatter={(value, entry, index) => {
                          // Return the Hebrew name from our data
                          return priorityChartData[index]?.name || value;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">אין נתונים להצגה</Typography>
                  </Box>
                )
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" color="text.secondary">הפניות פתוחות</Typography>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {initialLoading ? <CircularProgress size={24} color="inherit" /> : (
                    referrals.filter(r => !['completed', 'cancelled', 'no_show'].includes(r.status)).length
                  )}
                </Avatar>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                {initialLoading ? (
                  Array(3).fill().map((_, idx) => (
                    <Skeleton key={`skeleton-${idx}`} variant="text" height={24} />
                  ))
                ) : (
                  Object.entries(stats.byStatus)
                    .filter(([status]) => !['completed', 'cancelled', 'no_show'].includes(status))
                    .filter(([_, count]) => count > 0)
                    .map(([status, count]) => (
                      <Box 
                        key={status} 
                        display="flex" 
                        justifyContent="space-between" 
                        alignItems="center"
                        sx={{ 
                          p: 1, 
                          borderRadius: 1, 
                          '&:hover': { bgcolor: 'action.hover' },
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setFilters({ ...initialFilters, status: [status] });
                          setAppliedFilters({ ...initialFilters, status: [status] });
                          setCurrentView(VIEWS.LIST);
                        }}
                      >
                        <Typography variant="body2">
                          {statusOptions.find(o => o.value === status)?.label || status}
                        </Typography>
                        <Chip size="small" label={count} />
                      </Box>
                    ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" color="text.secondary">הפניות לפי דחיפות</Typography>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  {initialLoading ? <CircularProgress size={24} color="inherit" /> : (
                    referrals.filter(r => ['highest', 'urgent', 'high'].includes(r.priority)).length
                  )}
                </Avatar>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                {initialLoading ? (
                  Array(3).fill().map((_, idx) => (
                    <Skeleton key={`skeleton-${idx}`} variant="text" height={24} />
                  ))
                ) : (
                  Object.entries(stats.byPriority)
                    .filter(([_, count]) => count > 0)
                    .map(([priority, count]) => (
                      <Box 
                        key={priority} 
                        display="flex" 
                        justifyContent="space-between" 
                        alignItems="center"
                        sx={{ 
                          p: 1, 
                          borderRadius: 1, 
                          '&:hover': { bgcolor: 'action.hover' },
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setFilters({ ...initialFilters, priority: [priority] });
                          setAppliedFilters({ ...initialFilters, priority: [priority] });
                          setCurrentView(VIEWS.LIST);
                        }}
                      >
                        <Typography variant="body2">
                          {priorityOptions.find(o => o.value === priority)?.label || priority}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={count} 
                          sx={{ bgcolor: PRIORITY_COLORS[priority], color: 'white' }}
                        />
                      </Box>
                    ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" color="text.secondary">הפניות לפי צוות</Typography>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  {initialLoading ? <CircularProgress size={24} color="inherit" /> : 
                    Object.keys(referralsByTeam).length}
                </Avatar>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                {initialLoading ? (
                  Array(4).fill().map((_, idx) => (
                    <Skeleton key={`skeleton-${idx}`} variant="text" height={24} />
                  ))
                ) : (
                  Object.entries(referralsByTeam)
                    .sort((a, b) => b[1].length - a[1].length)
                    .map(([team, refs]) => (
                      <Box 
                        key={team} 
                        display="flex" 
                        justifyContent="space-between" 
                        alignItems="center"
                        sx={{ 
                          p: 1, 
                          borderRadius: 1, 
                          '&:hover': { bgcolor: 'action.hover' },
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setFilters({ ...initialFilters, team: [team] });
                          setAppliedFilters({ ...initialFilters, team: [team] });
                          setCurrentView(VIEWS.LIST);
                        }}
                      >
                        <Typography variant="body2">
                          {team}
                        </Typography>
                        <Chip size="small" label={refs.length} />
                      </Box>
                    ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Render the current view
  const renderCurrentView = () => {
    switch (currentView) {
      case VIEWS.BY_TYPE:
        return renderReferralsByType();
      case VIEWS.BY_TEAM:
        return renderReferralsByTeam();
      case VIEWS.BY_STATUS:
        return renderReferralsByStatus();
      case VIEWS.LIST:
      default:
        return renderReferralsTable();
    }
  };

  // Render the filters panel
  const renderFiltersPanel = () => (
    <Drawer
      anchor="left"
      open={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}
      PaperProps={{
        sx: { width: { xs: '90%', sm: 350 }, p: 2 }
      }}
    >
      <Typography variant="h6" gutterBottom>סינון הפניות</Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="חיפוש"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
            onKeyPress={(e) => { if (e.key === 'Enter') { handleSearch(); setIsDrawerOpen(false); } }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="status-filter-label">סטטוס</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              multiple
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              input={<OutlinedInput label="סטטוס" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={statusOptions.find(option => option.value === value)?.label || value}
                      sx={{ bgcolor: STATUS_COLORS[value], color: 'white' }}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={filters.status.indexOf(option.value) > -1} />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="priority-filter-label">עדיפות</InputLabel>
            <Select
              labelId="priority-filter-label"
              id="priority-filter"
              multiple
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              input={<OutlinedInput label="עדיפות" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={priorityOptions.find(option => option.value === value)?.label || value}
                      sx={{ bgcolor: PRIORITY_COLORS[value], color: 'white' }}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {priorityOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={filters.priority.indexOf(option.value) > -1} />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="referral-type-filter-label">סוג הפניה</InputLabel>
            <Select
              labelId="referral-type-filter-label"
              id="referral-type-filter"
              multiple
              value={filters.referral_type}
              onChange={(e) => setFilters({ ...filters, referral_type: e.target.value })}
              input={<OutlinedInput label="סוג הפניה" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={referralTypeOptions.find(option => option.value === value)?.label || value}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {referralTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={filters.referral_type.indexOf(option.value) > -1} />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="referral-details-filter-label">הפניה מבוקשת</InputLabel>
            <Select
              labelId="referral-details-filter-label"
              id="referral-details-filter"
              multiple
              value={filters.referral_details}
              onChange={(e) => setFilters({ ...filters, referral_details: e.target.value })}
              input={<OutlinedInput label="הפניה מבוקשת" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {availableReferralDetails.length > 0 ? (
                availableReferralDetails.map((detail) => (
                  <MenuItem key={detail} value={detail}>
                    <Checkbox checked={filters.referral_details.indexOf(detail) > -1} />
                    <ListItemText primary={detail} />
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  <ListItemText primary="טען קודם רשימת הפניות" />
                </MenuItem>
              )}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            * סינון לפי הפניה מבוקשת ישתמש בחיפוש טקסט חופשי
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="team-filter-label">צוות</InputLabel>
            <Select
              labelId="team-filter-label"
              id="team-filter"
              multiple
              value={filters.team}
              onChange={(e) => setFilters({ ...filters, team: e.target.value })}
              input={<OutlinedInput label="צוות" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {teamOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={filters.team.indexOf(option.value) > -1} />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="has-documents-filter-label">יש מסמכים</InputLabel>
            <Select
              labelId="has-documents-filter-label"
              id="has-documents-filter"
              value={filters.has_documents}
              onChange={(e) => setFilters({ ...filters, has_documents: e.target.value })}
              input={<OutlinedInput label="יש מסמכים" />}
            >
              <MenuItem value="">הכל</MenuItem>
              <MenuItem value="true">יש מסמכים</MenuItem>
              <MenuItem value="false">אין מסמכים</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between">
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => { handleSearch(); setIsDrawerOpen(false); }}
              startIcon={<SearchIcon />}
              fullWidth
              sx={{ mr: 1 }}
            >
              החל סינון
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => { handleClearFilters(); setIsDrawerOpen(false); }}
              startIcon={<ClearIcon />}
              fullWidth
              sx={{ ml: 1 }}
            >
              נקה
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Drawer>
  );

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with breadcrumbs */}
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/" underline="hover">
            ראשי
          </Link>
          <Typography color="text.primary">הפניות רפואיות</Typography>
        </Breadcrumbs>
      </Box>

      {/* Title and action buttons */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap">
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <MedicalServicesIcon sx={{ mr: 1 }} />
          הפניות רפואיות
          {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: { xs: 2, sm: 0 } }}>
          <Button
            variant="outlined"
            startIcon={<FilterAltIcon />}
            onClick={() => setIsDrawerOpen(true)}
          >
            סינון
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyTable}
          >
            העתק
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCsv}
          >
            ייצוא CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddReferral}
          >
            הפניה חדשה
          </Button>
        </Box>
      </Box>

      {/* Main content */}
      <Paper sx={{ mb: 3, p: 2 }}>
        {/* Quick search and applied filters */}
        <Grid container spacing={2} alignItems="center" mb={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="חיפוש מהיר"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ 
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                endAdornment: searchQuery && (
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )
              }}
              onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
              size="small"
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
              size="medium"
            >
              חפש
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleFilterMenuOpen}
              startIcon={<FilterListIcon />}
              size="medium"
            >
              הצג לפי
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <MenuItem 
                onClick={() => { setCurrentView(VIEWS.LIST); handleFilterMenuClose(); }}
                selected={currentView === VIEWS.LIST}
              >
                <ListItemIcon>
                  <ViewListIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>רשימת הפניות</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => { setCurrentView(VIEWS.BY_TYPE); handleFilterMenuClose(); }}
                selected={currentView === VIEWS.BY_TYPE}
              >
                <ListItemIcon>
                  <MedicalServicesIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>לפי סוג הפניה</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => { setCurrentView(VIEWS.BY_TEAM); handleFilterMenuClose(); }}
                selected={currentView === VIEWS.BY_TEAM}
              >
                <ListItemIcon>
                  <GroupIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>לפי צוות</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => { setCurrentView(VIEWS.BY_STATUS); handleFilterMenuClose(); }}
                selected={currentView === VIEWS.BY_STATUS}
              >
                <ListItemIcon>
                  <AssignmentIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>לפי סטטוס</ListItemText>
              </MenuItem>
            </Menu>
          </Grid>
          {(appliedFilters.status.length > 0 || 
           appliedFilters.priority.length > 0 || 
           appliedFilters.team.length > 0 || 
           appliedFilters.referral_details.length > 0 ||
           appliedFilters.referral_type.length > 0 ||
           appliedFilters.has_documents !== '') && (
            <Grid item>
              <Tooltip title="נקה סינון">
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearFilters}
                  startIcon={<FilterAltOffIcon />}
                  size="medium"
                >
                  נקה סינון
                </Button>
              </Tooltip>
            </Grid>
          )}
          <Grid item>
            <Tooltip title="רענן">
              <IconButton onClick={fetchReferrals}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>

        {/* Applied filters chips */}
        {(appliedFilters.status.length > 0 || 
          appliedFilters.priority.length > 0 || 
          appliedFilters.team.length > 0 || 
          appliedFilters.referral_details.length > 0 ||
          appliedFilters.referral_type.length > 0 ||
          appliedFilters.has_documents !== '') && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {appliedFilters.status.map(status => (
              <Chip
                key={`status-${status}`}
                label={`סטטוס: ${statusOptions.find(o => o.value === status)?.label || status}`}
                onDelete={() => {
                  const newFilters = { ...appliedFilters, status: appliedFilters.status.filter(s => s !== status) };
                  setFilters(newFilters);
                  setAppliedFilters(newFilters);
                }}
                sx={{ bgcolor: STATUS_COLORS[status], color: 'white' }}
              />
            ))}
            {appliedFilters.priority.map(priority => (
              <Chip
                key={`priority-${priority}`}
                label={`עדיפות: ${priorityOptions.find(o => o.value === priority)?.label || priority}`}
                onDelete={() => {
                  const newFilters = { ...appliedFilters, priority: appliedFilters.priority.filter(p => p !== priority) };
                  setFilters(newFilters);
                  setAppliedFilters(newFilters);
                }}
                sx={{ bgcolor: PRIORITY_COLORS[priority], color: 'white' }}
              />
            ))}
            {appliedFilters.team.map(team => (
              <Chip
                key={`team-${team}`}
                label={`צוות: ${team}`}
                onDelete={() => {
                  const newFilters = { ...appliedFilters, team: appliedFilters.team.filter(t => t !== team) };
                  setFilters(newFilters);
                  setAppliedFilters(newFilters);
                }}
              />
            ))}
            {appliedFilters.referral_type.map(type => (
              <Chip
                key={`type-${type}`}
                label={`סוג: ${referralTypeOptions.find(o => o.value === type)?.label || type}`}
                onDelete={() => {
                  const newFilters = { ...appliedFilters, referral_type: appliedFilters.referral_type.filter(t => t !== type) };
                  setFilters(newFilters);
                  setAppliedFilters(newFilters);
                }}
              />
            ))}
            {appliedFilters.referral_details.map(detail => (
              <Chip
                key={`detail-${detail}`}
                label={`הפניה: ${detail}`}
                onDelete={() => {
                  const newFilters = { ...appliedFilters, referral_details: appliedFilters.referral_details.filter(d => d !== detail) };
                  setFilters(newFilters);
                  setAppliedFilters(newFilters);
                }}
              />
            ))}
            {appliedFilters.has_documents !== '' && (
              <Chip
                label={`מסמכים: ${appliedFilters.has_documents === 'true' ? 'יש' : 'אין'}`}
                onDelete={() => {
                  const newFilters = { ...appliedFilters, has_documents: '' };
                  setFilters(newFilters);
                  setAppliedFilters(newFilters);
                }}
              />
            )}
            {appliedSearchQuery && (
              <Chip
                label={`חיפוש: ${appliedSearchQuery}`}
                onDelete={() => {
                  setSearchQuery('');
                  setAppliedSearchQuery('');
                }}
              />
            )}
          </Box>
        )}

        {/* Error message */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }} 
            action={
              <Button color="inherit" size="small" onClick={fetchReferrals}>
                נסה שוב
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Show statistics dashboard */}
        {currentView === VIEWS.LIST && renderStatsDashboard()}

        {/* Main content based on current view */}
        {initialLoading ? (
          <Box sx={{ width: '100%', mt: 3 }}>
            <LinearProgress />
            <Box sx={{ mt: 2 }}>
              {Array(5).fill().map((_, idx) => (
                <Skeleton key={`skeleton-${idx}`} variant="rectangular" height={40} sx={{ mb: 1 }} />
              ))}
            </Box>
          </Box>
        ) : (
          renderCurrentView()
        )}
      </Paper>

      {/* Dialogs and drawers */}
      {renderFiltersPanel()}

      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">מחיקת הפניה</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            האם אתה בטוח שברצונך למחוק את ההפניה הזו? פעולה זו אינה ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            autoFocus
            startIcon={<DeleteIcon />}
          >
            מחק
          </Button>
        </DialogActions>
      </Dialog>

      {openForm && (
        <ReferralForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSave={handleSaveReferral}
          referral={editingReferral}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={closeSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading && referrals.length > 0}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default ReferralsPage;