// frontend/src/pages/DoctorVisits.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Backdrop,
  FormHelperText,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  MedicalServices as MedicalServicesIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const DoctorVisits = () => {
  const { api } = useAuth();
  
  // מצבים עבור הטבלה
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // מצבים עבור החיפוש והסינון
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    is_documented: '',
  });
  
  // מצבים עבור הטופס
  const [openForm, setOpenForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingVisitId, setDeletingVisitId] = useState(null);
  
  // מצב הטופס
  const [formData, setFormData] = useState({
    full_name: '',
    personal_id: '',
    details: '',
    is_documented: false,
    status: 'pending',
    doctor_notes: '',
  });
  
  // ולידציה
  const [formErrors, setFormErrors] = useState({});
  
  // טעינת נתונים
  const fetchVisits = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // בפרויקט אמיתי נשתמש ב-API עם אנדפוינט ייעודי
      // כרגע נדמה שהנתונים מגיעים מהAPI
      
      // אילו היה לנו אנדפוינט חדש, היינו עושים קריאה כזו:
      /*
      const params = {
        page: page + 1,
        page_size: rowsPerPage,
        search: searchQuery,
      };
      
      if (filters.status) params.status = filters.status;
      if (filters.is_documented) params.is_documented = filters.is_documented;
      
      const response = await api.get('/doctor-visits/', { params });
      setVisits(response.data.results);
      setTotalCount(response.data.count);
      */
      
      // לצורך הדגמה נשתמש בנתונים לדוגמה
      const mockData = [
        {
          id: 1,
          full_name: 'אלון כהן',
          personal_id: '9876543',
          details: 'כאבי ראש וסחרחורות',
          is_documented: true,
          status: 'completed',
          doctor_notes: 'הומלץ על טיפול תרופתי ומנוחה של יומיים',
          created_at: '2025-03-01T10:30:00Z',
          updated_at: '2025-03-01T11:45:00Z',
        },
        {
          id: 2,
          full_name: 'דניאל לוי',
          personal_id: '8765432',
          details: 'כאבי גב תחתון',
          is_documented: true,
          status: 'pending',
          doctor_notes: '',
          created_at: '2025-03-02T09:15:00Z',
          updated_at: '2025-03-02T09:15:00Z',
        },
        {
          id: 3,
          full_name: 'יוסי אברהם',
          personal_id: '7654321',
          details: 'אלרגיה עונתית',
          is_documented: false,
          status: 'pending',
          doctor_notes: '',
          created_at: '2025-03-03T14:20:00Z',
          updated_at: '2025-03-03T14:20:00Z',
        },
        {
          id: 4,
          full_name: 'רועי גולן',
          personal_id: '6543219',
          details: 'כאבי בטן',
          is_documented: true,
          status: 'completed',
          doctor_notes: 'נבדק ע״י רופאה, נשלח לבדיקות דם',
          created_at: '2025-03-04T11:00:00Z',
          updated_at: '2025-03-04T12:30:00Z',
        },
        {
          id: 5,
          full_name: 'ניר שלום',
          personal_id: '5432198',
          details: 'בעיות שינה',
          is_documented: true,
          status: 'completed',
          doctor_notes: 'קיבל המלצות לשיפור היגיינת השינה',
          created_at: '2025-03-05T15:45:00Z',
          updated_at: '2025-03-05T16:30:00Z',
        },
      ];
      
      // מיון ופילטור על המידע לדוגמה
      let filteredData = [...mockData];
      
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        filteredData = filteredData.filter(visit => 
          visit.full_name.toLowerCase().includes(searchLower) ||
          visit.personal_id.includes(searchQuery) ||
          visit.details.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.status) {
        filteredData = filteredData.filter(visit => visit.status === filters.status);
      }
      
      if (filters.is_documented !== '') {
        const isDocumented = filters.is_documented === 'true';
        filteredData = filteredData.filter(visit => visit.is_documented === isDocumented);
      }
      
      // חישוב עמוד ומספר רשומות
      const start = page * rowsPerPage;
      const end = start + rowsPerPage;
      
      setVisits(filteredData.slice(start, Math.min(end, filteredData.length)));
      setTotalCount(filteredData.length);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching doctor visits:', err);
      setError('אירעה שגיאה בטעינת רשימת הביקורים');
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, filters]);
  
  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);
  
  // טיפול בחיפוש
  const handleSearch = () => {
    setPage(0);
    fetchVisits();
  };
  
  // ניקוי החיפוש
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      status: '',
      is_documented: '',
    });
    setPage(0);
    setTimeout(() => {
      fetchVisits();
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
  
  // פתיחת טופס הוספה
  const handleAddVisit = () => {
    setEditingVisit(null);
    setFormData({
      full_name: '',
      personal_id: '',
      details: '',
      is_documented: false,
      status: 'pending',
      doctor_notes: '',
    });
    setFormErrors({});
    setOpenForm(true);
  };
  
  // פתיחת טופס עריכה
  const handleEditVisit = (visit) => {
    setEditingVisit(visit);
    setFormData({
      full_name: visit.full_name,
      personal_id: visit.personal_id,
      details: visit.details,
      is_documented: visit.is_documented,
      status: visit.status,
      doctor_notes: visit.doctor_notes || '',
    });
    setFormErrors({});
    setOpenForm(true);
  };
  
  // טיפול במחיקה
  const handleDeleteClick = (id) => {
    setDeletingVisitId(id);
    setDeleteDialogOpen(true);
  };
  
  // אישור מחיקה
  const handleConfirmDelete = async () => {
    setLoading(true);
    
    try {
      // בפרויקט אמיתי
      // await api.delete(`/doctor-visits/${deletingVisitId}/`);
      
      // לדוגמה
      setVisits(visits.filter(visit => visit.id !== deletingVisitId));
      setTotalCount(totalCount - 1);
      
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting visit:', err);
      setError('אירעה שגיאה במחיקת הביקור');
    } finally {
      setLoading(false);
    }
  };
  
  // שינוי בטופס
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // נקה שגיאת ולידציה בשדה זה
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // ולידציה
  const validateForm = () => {
    const errors = {};
    
    if (!formData.full_name) {
      errors.full_name = 'נא להזין שם מלא';
    }
    
    if (!formData.personal_id) {
      errors.personal_id = 'נא להזין מספר אישי';
    }
    
    if (!formData.details) {
      errors.details = 'נא לפרט את הצורך';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // שמירת הטופס
  const handleSaveVisit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (editingVisit) {
        // בפרויקט אמיתי
        // await api.put(`/doctor-visits/${editingVisit.id}/`, formData);
        
        // לדוגמה
        const updatedVisits = visits.map(visit => 
          visit.id === editingVisit.id 
            ? { ...visit, ...formData, updated_at: new Date().toISOString() }
            : visit
        );
        setVisits(updatedVisits);
      } else {
        // בפרויקט אמיתי
        // const response = await api.post('/doctor-visits/', formData);
        
        // לדוגמה
        const newVisit = {
          id: Date.now(), // מזהה זמני לדוגמה
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setVisits([...visits, newVisit]);
        setTotalCount(totalCount + 1);
      }
      
      setOpenForm(false);
    } catch (err) {
      console.error('Error saving visit:', err);
      
      if (err.response && err.response.data) {
        setFormErrors(err.response.data);
      } else {
        setError('אירעה שגיאה בשמירת הביקור');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // פורמט תאריך
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          ביקורי רופאה
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddVisit}
        >
          הוספת ביקור חדש
        </Button>
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
          
          <Grid item>
            <Tooltip title="רענן">
              <IconButton onClick={fetchVisits}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
        
        <Collapse in={showFilters}>
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="status-filter-label">סטטוס</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    id="status-filter"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    label="סטטוס"
                  >
                    <MenuItem value="">הכל</MenuItem>
                    <MenuItem value="pending">ממתין</MenuItem>
                    <MenuItem value="completed">הושלם</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="is-documented-filter-label">האם מתועד</InputLabel>
                  <Select
                    labelId="is-documented-filter-label"
                    id="is-documented-filter"
                    value={filters.is_documented}
                    onChange={(e) => setFilters({ ...filters, is_documented: e.target.value })}
                    label="האם מתועד"
                  >
                    <MenuItem value="">הכל</MenuItem>
                    <MenuItem value="true">מתועד</MenuItem>
                    <MenuItem value="false">לא מתועד</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>
      
      {/* הודעת שגיאה */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchVisits}>
              נסה שוב
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* טבלת ביקורים */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>פעולות</TableCell>
              <TableCell>שם מלא</TableCell>
              <TableCell>מספר אישי</TableCell>
              <TableCell>פירוט הצורך</TableCell>
              <TableCell>האם מתועד</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell>הערות רופאה</TableCell>
              <TableCell>תאריך עדכון</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && visits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : visits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box sx={{ py: 3 }}>
                    <MedicalServicesIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      לא נמצאו ביקורים
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      נסה לשנות את הסינון או להוסיף ביקור חדש
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              visits.map((visit) => (
                <TableRow key={visit.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="ערוך">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleEditVisit(visit)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="מחק">
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDeleteClick(visit.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>{visit.full_name}</TableCell>
                  <TableCell>{visit.personal_id}</TableCell>
                  <TableCell>{visit.details}</TableCell>
                  <TableCell>
                    <Chip 
                      label={visit.is_documented ? 'מתועד' : 'לא מתועד'}
                      color={visit.is_documented ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={visit.status === 'completed' ? 'הושלם' : 'ממתין'}
                      color={visit.status === 'completed' ? 'primary' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{visit.doctor_notes || '—'}</TableCell>
                  <TableCell>{formatDate(visit.updated_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
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
      
      {/* טופס הוספה/עריכה */}
      <Dialog
        open={openForm}
        onClose={() => !loading && setOpenForm(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingVisit ? 'עריכת ביקור' : 'הוספת ביקור חדש'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="full_name"
                label="שם מלא"
                fullWidth
                required
                value={formData.full_name}
                onChange={handleFormChange}
                error={!!formErrors.full_name}
                helperText={formErrors.full_name}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="personal_id"
                label="מספר אישי"
                fullWidth
                required
                value={formData.personal_id}
                onChange={handleFormChange}
                error={!!formErrors.personal_id}
                helperText={formErrors.personal_id}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="details"
                label="פירוט הצורך"
                fullWidth
                required
                multiline
                rows={2}
                value={formData.details}
                onChange={handleFormChange}
                error={!!formErrors.details}
                helperText={formErrors.details}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_documented"
                    checked={formData.is_documented}
                    onChange={handleFormChange}
                    color="primary"
                  />
                }
                label="מתועד במערכת"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">סטטוס</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  label="סטטוס"
                >
                  <MenuItem value="pending">ממתין</MenuItem>
                  <MenuItem value="completed">הושלם</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="doctor_notes"
                label="הערות רופאה"
                fullWidth
                multiline
                rows={3}
                value={formData.doctor_notes}
                onChange={handleFormChange}
                error={!!formErrors.doctor_notes}
                helperText={formErrors.doctor_notes}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)} disabled={loading}>
            ביטול
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveVisit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'שמור'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* דיאלוג מחיקה */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !loading && setDeleteDialogOpen(false)}
      >
        <DialogTitle>מחיקת ביקור</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את פרטי הביקור הזה?
            פעולה זו אינה ניתנת לביטול.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            ביטול
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'מחק'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* מסך טעינה */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading && visits.length > 0}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default DoctorVisits;