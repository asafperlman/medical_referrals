// medical-referrals/frontend/src/pages/ReferralsPage.js

import React, { useState, useEffect } from 'react';
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
  useTheme,
  Alert,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import ReferralForm from '../components/ReferralForm';

const ReferralsPage = () => {
  const { api } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // מצבים עבור הטבלה
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  
  // מצבים עבור החיפוש והסינון
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    referral_type: [],
    team: [],
    created_at_after: '',
    created_at_before: '',
    appointment_date_after: '',
    appointment_date_before: '',
    has_documents: '',
  });
  
  // מצבים עבור הטופס
  const [openForm, setOpenForm] = useState(false);
  const [editingReferral, setEditingReferral] = useState(null);
  
  // רשימות ערכים לתפריטי הסינון
  const statusOptions = [
    { value: 'new', label: 'חדש' },
    { value: 'in_progress', label: 'בטיפול' },
    { value: 'waiting_for_approval', label: 'ממתין לאישור' },
    { value: 'appointment_scheduled', label: 'תור נקבע' },
    { value: 'completed', label: 'הושלם' },
    { value: 'cancelled', label: 'בוטל' },
  ];
  
  const priorityOptions = [
    { value: 'low', label: 'נמוכה' },
    { value: 'medium', label: 'בינונית' },
    { value: 'high', label: 'גבוהה' },
    { value: 'urgent', label: 'דחופה' },
  ];
  
  const referralTypeOptions = [
    { value: 'specialist', label: 'רופא מומחה' },
    { value: 'imaging', label: 'בדיקות דימות' },
    { value: 'lab', label: 'בדיקות מעבדה' },
    { value: 'procedure', label: 'פרוצדורה' },
    { value: 'other', label: 'אחר' },
  ];
  
  // עבור הגדרות לפי צבעים
  const statusColors = {
    new: 'success',
    in_progress: 'info',
    waiting_for_approval: 'warning',
    appointment_scheduled: 'secondary',
    completed: 'default',
    cancelled: 'error',
  };
  
  const priorityColors = {
    low: 'success',
    medium: 'info',
    high: 'warning',
    urgent: 'error',
  };
  
  // טעינת נתונים ראשונית
  useEffect(() => {
    // בדוק אם הגענו מדף אחר עם סינון מוגדר
    if (location.state?.filterPriority) {
      setFilters(prev => ({
        ...prev,
        priority: [location.state.filterPriority]
      }));
    }
    
    fetchReferrals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // לטעון מחדש כאשר עמוד, מספר שורות או סינון משתנים
  useEffect(() => {
    fetchReferrals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);
  
  // פונקציית טעינת ההפניות
  const fetchReferrals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // בניית פרמטרים לבקשה
      const params = {
        page: page + 1, // Django REST framework מתחיל מעמוד 1
        page_size: rowsPerPage,
        search: searchQuery,
      };
      
      // הוספת פרמטרים של סינון
      if (filters.status.length > 0) params.status__in = filters.status.join(',');
      if (filters.priority.length > 0) params.priority__in = filters.priority.join(',');
      if (filters.referral_type.length > 0) params.referral_type__in = filters.referral_type.join(',');
      if (filters.team.length > 0) params.team__in = filters.team.join(',');
      if (filters.created_at_after) params.created_at__gte = filters.created_at_after;
      if (filters.created_at_before) params.created_at__lte = filters.created_at_before;
      if (filters.appointment_date_after) params.appointment_date__gte = filters.appointment_date_after;
      if (filters.appointment_date_before) params.appointment_date__lte = filters.appointment_date_before;
      if (filters.has_documents !== '') params.has_documents = filters.has_documents;
      
      const response = await api.get('/referrals/', { params });
      
      setReferrals(response.data.results);
      setTotalCount(response.data.count);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching referrals:', err);
      setError('אירעה שגיאה בטעינת הנתונים');
      setLoading(false);
    }
  };
  
  // חיפוש והחלת סינון
  const handleSearch = () => {
    setPage(0); // חזרה לעמוד הראשון
    fetchReferrals();
  };
  
  // איפוס הסינון והחיפוש
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      status: [],
      priority: [],
      referral_type: [],
      team: [],
      created_at_after: '',
      created_at_before: '',
      appointment_date_after: '',
      appointment_date_before: '',
      has_documents: '',
    });
    
    setPage(0);
    // הרצת חיפוש אחרי איפוס הערכים
    setTimeout(() => {
      fetchReferrals();
    }, 0);
  };
  
  // שינוי עמוד
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // שינוי מספר שורות בעמוד
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // פתיחת טופס הוספת הפניה חדשה
  const handleAddReferral = () => {
    setEditingReferral(null);
    setOpenForm(true);
  };
  
  // פתיחת טופס עריכת הפניה קיימת
  const handleEditReferral = (referral) => {
    setEditingReferral(referral);
    setOpenForm(true);
  };
  
  // שמירת הפניה (הוספה או עדכון)
  const handleSaveReferral = async (referralData) => {
    setLoading(true);
    
    try {
      if (editingReferral) {
        // עדכון הפניה קיימת
        await api.put(`/referrals/${editingReferral.id}/`, referralData);
      } else {
        // הוספת הפניה חדשה
        await api.post('/referrals/', referralData);
      }
      
      setOpenForm(false);
      fetchReferrals();
    } catch (err) {
      console.error('Error saving referral:', err);
      setError('אירעה שגיאה בשמירת ההפניה');
      setLoading(false);
    }
  };
  
  // מחיקת הפניה
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingReferralId, setDeletingReferralId] = useState(null);
  
  const handleDeleteClick = (id) => {
    setDeletingReferralId(id);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    setLoading(true);
    
    try {
      await api.delete(`/referrals/${deletingReferralId}/`);
      setDeleteDialogOpen(false);
      fetchReferrals();
    } catch (err) {
      console.error('Error deleting referral:', err);
      setError('אירעה שגיאה במחיקת ההפניה');
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // ייצוא לקובץ CSV
  const handleExportCsv = async () => {
    try {
      // ייצור פרמטרים דומים לחיפוש הנוכחי
      const params = {
        format: 'csv',
        search: searchQuery,
      };
      
      // הוספת פרמטרים של סינון
      if (filters.status.length > 0) params.status__in = filters.status.join(',');
      if (filters.priority.length > 0) params.priority__in = filters.priority.join(',');
      // הוספת שאר הפרמטרים...
      
      const response = await api.get('/referrals/export/', { 
        params,
        responseType: 'blob' 
      });
      
      // יצירת URL מהנתונים שהתקבלו
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `referrals_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (err) {
      console.error('Error exporting referrals:', err);
      setError('אירעה שגיאה בייצוא הנתונים');
    }
  };
  
  // עיצוב תאריך
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };
  
  // עיצוב תאריך ושעה
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('he-IL')} ${date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          הפניות רפואיות
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCsv}
            sx={{ mr: 1 }}
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
      
      {/* חיפוש וסינון */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="חיפוש"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </Grid>
          
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
            >
              חפש
            </Button>
          </Grid>
          
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {showFilters ? 'הסתר סינון מתקדם' : 'סינון מתקדם'}
            </Button>
          </Grid>
          
          <Grid item>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
            >
              נקה סינון
            </Button>
          </Grid>
        </Grid>
        
        <Collapse in={showFilters}>
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
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
                            label={statusOptions.find(option => option.value === value)?.label}
                            color={statusColors[value]}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
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
                            label={priorityOptions.find(option => option.value === value)?.label}
                            color={priorityColors[value]}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {priorityOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
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
                            label={referralTypeOptions.find(option => option.value === value)?.label}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {referralTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
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
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="נוצר מתאריך"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={filters.created_at_after}
                  onChange={(e) => setFilters({ ...filters, created_at_after: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="נוצר עד תאריך"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={filters.created_at_before}
                  onChange={(e) => setFilters({ ...filters, created_at_before: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="תור מתאריך"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={filters.appointment_date_after}
                  onChange={(e) => setFilters({ ...filters, appointment_date_after: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="תור עד תאריך"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={filters.appointment_date_before}
                  onChange={(e) => setFilters({ ...filters, appointment_date_before: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>
      
      {/* הודעת שגיאה */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* טבלת הפניות */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>פעולות</TableCell>
              <TableCell>שם מלא</TableCell>
              <TableCell>מספר אישי</TableCell>
              <TableCell>צוות</TableCell>
              <TableCell>הפניה מבוקשת</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell>עדיפות</TableCell>
              <TableCell>תאריך תור</TableCell>
              <TableCell>עודכן לאחרונה</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && referrals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : referrals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Box sx={{ py: 3 }}>
                    <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      לא נמצאו הפניות
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      נסה לשנות את הסינון או להוסיף הפניה חדשה
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              referrals.map((referral) => (
                <TableRow key={referral.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="צפה בפרטים">
                        <IconButton 
                          color="info" 
                          size="small"
                          onClick={() => navigate(`/referrals/${referral.id}`)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ערוך">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleEditReferral(referral)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="מחק">
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDeleteClick(referral.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>{referral.full_name}</TableCell>
                  <TableCell>{referral.personal_id}</TableCell>
                  <TableCell>{referral.team}</TableCell>
                  <TableCell>{referral.referral_details}</TableCell>
                  <TableCell>
                    <Chip 
                      label={referral.status_display}
                      color={statusColors[referral.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={referral.priority_display}
                      color={priorityColors[referral.priority]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDateTime(referral.appointment_date)}</TableCell>
                  <TableCell>{formatDateTime(referral.updated_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
      </TableContainer>
      
      {/* דיאלוג מחיקת הפניה */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>מחיקת הפניה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את ההפניה הזו?
            פעולה זו אינה ניתנת לביטול.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            ביטול
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            מחק
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* טופס הוספה/עריכת הפניה */}
      {openForm && (
        <ReferralForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSave={handleSaveReferral}
          referral={editingReferral}
        />
      )}
      
      {/* מסך טעינה */}
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