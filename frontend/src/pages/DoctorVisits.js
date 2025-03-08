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
  Divider,
  Collapse,
  Snackbar,
  Card,
  CardContent,
  useTheme,
  Fade,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  MedicalServices as MedicalServicesIcon,
  ContentCopy as ContentCopyIcon,
  WhatsApp as WhatsAppIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

const DoctorVisits = () => {
  const theme = useTheme();
  
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
  const [viewVisitDetails, setViewVisitDetails] = useState(null);
  
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
  
  // הודעות למשתמש
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // טעינת נתונים
  const fetchVisits = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // בפרויקט אמיתי נשתמש ב-API עם אנדפוינט ייעודי
      // כרגע נדמה שהנתונים מגיעים מהAPI
      
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
        {
          id: 6,
          full_name: 'שירה לוי',
          personal_id: '4321987',
          details: 'כאבי ברכיים',
          is_documented: false,
          status: 'pending',
          doctor_notes: '',
          created_at: '2025-03-06T13:10:00Z',
          updated_at: '2025-03-06T13:10:00Z',
        },
        {
          id: 7,
          full_name: 'טל אביבי',
          personal_id: '3219876',
          details: 'שיעול וחום',
          is_documented: false,
          status: 'pending',
          doctor_notes: '',
          created_at: '2025-03-07T10:20:00Z',
          updated_at: '2025-03-07T10:20:00Z',
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
      
      // הצג הודעת הצלחה
      setSnackbar({
        open: true,
        message: 'הביקור נמחק בהצלחה',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting visit:', err);
      setError('אירעה שגיאה במחיקת הביקור');
      setSnackbar({
        open: true,
        message: 'אירעה שגיאה במחיקת הביקור',
        severity: 'error'
      });
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
        
        // הצג הודעת הצלחה
        setSnackbar({
          open: true,
          message: 'הביקור עודכן בהצלחה',
          severity: 'success'
        });
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
        
        // הצג הודעת הצלחה
        setSnackbar({
          open: true,
          message: 'ביקור חדש נוסף בהצלחה',
          severity: 'success'
        });
      }
      
      setOpenForm(false);
    } catch (err) {
      console.error('Error saving visit:', err);
      
      if (err.response && err.response.data) {
        setFormErrors(err.response.data);
      } else {
        setError('אירעה שגיאה בשמירת הביקור');
        setSnackbar({
          open: true,
          message: 'אירעה שגיאה בשמירת הביקור',
          severity: 'error'
        });
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

  // העתקה לווטסאפ
  const copyPendingVisitsToWhatsApp = () => {
    const pendingVisits = visits.filter(visit => visit.status === 'pending');
    
    if (pendingVisits.length === 0) {
      setSnackbar({
        open: true,
        message: 'אין ביקורים בסטטוס "ממתין" להעתקה',
        severity: 'info'
      });
      return;
    }
    
    let textToCopy = "רשימת ממתינים לביקור רופאה:\n\n";
    
    pendingVisits.forEach((visit, index) => {
      textToCopy += `${index + 1}. ${visit.full_name}, ${visit.personal_id}, ${visit.details}\n`;
    });
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setSnackbar({
          open: true,
          message: 'רשימת הממתינים הועתקה בהצלחה. ניתן להדביק בווטסאפ',
          severity: 'success'
        });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setSnackbar({
          open: true,
          message: 'אירעה שגיאה בהעתקת הרשימה',
          severity: 'error'
        });
      });
  };
  
  // העתקה של ביקור בודד
  const copySingleVisitToWhatsApp = (visit) => {
    if (visit.status !== 'pending') {
      setSnackbar({
        open: true,
        message: 'ניתן להעתיק רק ביקורים בסטטוס "ממתין"',
        severity: 'info'
      });
      return;
    }
    
    const textToCopy = `ממתין לביקור רופאה:\n${visit.full_name}, ${visit.personal_id}, ${visit.details}`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setSnackbar({
          open: true,
          message: 'פרטי הביקור הועתקו בהצלחה. ניתן להדביק בווטסאפ',
          severity: 'success'
        });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setSnackbar({
          open: true,
          message: 'אירעה שגיאה בהעתקת הפרטים',
          severity: 'error'
        });
      });
  };
  
  // הצגת פרטי ביקור
  const handleViewDetails = (visit) => {
    setViewVisitDetails(visit);
  };
  
  // סגירת סנאקבר
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  return (
    <Box>
      <Card 
        sx={{ 
          mb: 3, 
          borderRadius: 2, 
          boxShadow: 3,
          backgroundImage: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
          color: 'white'
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" fontWeight="500">
              ביקורי רופאה
            </Typography>
            <Box>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<WhatsAppIcon />}
                onClick={copyPendingVisitsToWhatsApp}
                sx={{ ml: 1, bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                העתק לווטסאפ
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={handleAddVisit}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                הוספת ביקור חדש
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {/* חיפוש וסינון */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: 2, boxShadow: 2 }}>
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
              startIcon={showFilters ? <ExpandLessIcon /> : <FilterListIcon />}
            >
              {showFilters ? 'הסתר סינון' : 'סינון מתקדם'}
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
              <IconButton onClick={fetchVisits} color="primary">
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
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchVisits}>
              נסה שוב
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* סטטיסטיקה */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#f0f7ff', boxShadow: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 1, color: theme.palette.primary.main }}>
              סך הכל ביקורים
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {totalCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#fff8e1', boxShadow: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 1, color: theme.palette.warning.main }}>
              ממתינים
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {visits.filter(v => v.status === 'pending').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#f0fff4', boxShadow: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 1, color: theme.palette.success.main }}>
              טופלו
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {visits.filter(v => v.status === 'completed').length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* טבלת ביקורים */}
      <Paper sx={{ borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.primary.light }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>פעולות</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>שם מלא</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>מספר אישי</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>פירוט הצורך</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>האם מתועד</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>סטטוס</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>תאריך עדכון</TableCell>
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
                    <Box sx={{ py: 5 }}>
                      <MedicalServicesIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        לא נמצאו ביקורים
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        נסה לשנות את הסינון או להוסיף ביקור חדש
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<AddIcon />} 
                        onClick={handleAddVisit}
                        sx={{ mt: 2 }}
                      >
                        הוסף ביקור חדש
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                visits.map((visit) => (
                  <TableRow 
                    key={visit.id} 
                    hover 
                    sx={{
                      bgcolor: visit.status === 'pending' ? alpha(theme.palette.warning.light, 0.1) : 'inherit',
                      '&:hover': {
                        bgcolor: visit.status === 'pending' ? alpha(theme.palette.warning.light, 0.2) : alpha(theme.palette.action.hover, 0.1)
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <Tooltip title="צפה בפרטים">
                          <IconButton 
                            color="info" 
                            size="small"
                            onClick={() => handleViewDetails(visit)}
                            sx={{ mr: 1 }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
                            sx={{ mr: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {visit.status === 'pending' && (
                          <Tooltip title="העתק לווטסאפ">
                            <IconButton 
                              color="success" 
                              size="small"
                              onClick={() => copySingleVisitToWhatsApp(visit)}
                            >
                              <WhatsAppIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{visit.full_name}</TableCell>
                    <TableCell>{visit.personal_id}</TableCell>
                    <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {visit.details}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={visit.is_documented ? 'מתועד' : 'לא מתועד'}
                        color={visit.is_documented ? 'success' : 'default'}
                        size="small"
                        sx={{ borderRadius: '4px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={visit.status === 'completed' ? 'הושלם' : 'ממתין'}
                        color={visit.status === 'completed' ? 'primary' : 'warning'}
                        size="small"
                        sx={{ borderRadius: '4px' }}
                      />
                    </TableCell>
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
            sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
          />
        </TableContainer>
      </Paper>
      
      {/* טופס הוספה/עריכה */}
      <Dialog
        open={openForm}
        onClose={() => !loading && setOpenForm(false)}
        fullWidth
        maxWidth="md"
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
          {editingVisit ? 'עריכת ביקור' : 'הוספת ביקור חדש'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
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
                variant="outlined"
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
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="details"
                label="פירוט הצורך"
                fullWidth
                required
                multiline
                rows={3}
                value={formData.details}
                onChange={handleFormChange}
                error={!!formErrors.details}
                helperText={formErrors.details}
                variant="outlined"
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
              <FormControl fullWidth variant="outlined">
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
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setOpenForm(false)} 
            disabled={loading}
            variant="outlined"
          >
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
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.error.main, color: 'white' }}>מחיקת ביקור</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" gutterBottom>
              האם אתה בטוח שברצונך למחוק את פרטי הביקור הזה?
            </Typography>
            <Typography variant="body2" color="error">
              פעולה זו אינה ניתנת לביטול.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={loading}
            variant="outlined"
          >
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
      
      {/* דיאלוג צפייה בפרטים */}
      <Dialog
        open={!!viewVisitDetails}
        onClose={() => setViewVisitDetails(null)}
        fullWidth
        maxWidth="md"
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.info.main, color: 'white' }}>פרטי ביקור</DialogTitle>
        <DialogContent dividers>
          {viewVisitDetails && (
            <Grid container spacing={3} sx={{ pt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">שם מלא</Typography>
                <Typography variant="body1">{viewVisitDetails.full_name}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">מספר אישי</Typography>
                <Typography variant="body1">{viewVisitDetails.personal_id}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">פירוט הצורך</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', mt: 1 }}>
                  <Typography variant="body1">{viewVisitDetails.details}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">האם מתועד</Typography>
                <Chip 
                  label={viewVisitDetails.is_documented ? 'מתועד' : 'לא מתועד'}
                  color={viewVisitDetails.is_documented ? 'success' : 'default'}
                  size="small"
                  sx={{ mt: 1, borderRadius: '4px' }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">סטטוס</Typography>
                <Chip 
                  label={viewVisitDetails.status === 'completed' ? 'הושלם' : 'ממתין'}
                  color={viewVisitDetails.status === 'completed' ? 'primary' : 'warning'}
                  size="small"
                  sx={{ mt: 1, borderRadius: '4px' }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">הערות רופאה</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', mt: 1 }}>
                  <Typography variant="body1">{viewVisitDetails.doctor_notes || '—'}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">תאריך יצירה</Typography>
                <Typography variant="body1">{formatDate(viewVisitDetails.created_at)}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">תאריך עדכון</Typography>
                <Typography variant="body1">{formatDate(viewVisitDetails.updated_at)}</Typography>
              </Grid>
              
              {viewVisitDetails.status === 'pending' && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<WhatsAppIcon />}
                      onClick={() => {
                        copySingleVisitToWhatsApp(viewVisitDetails);
                      }}
                    >
                      העתק לווטסאפ
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setViewVisitDetails(null)}
          >
            סגור
          </Button>
          {viewVisitDetails && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setViewVisitDetails(null);
                handleEditVisit(viewVisitDetails);
              }}
            >
              ערוך
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* מסך טעינה */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading && visits.length > 0}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      
      {/* סנאקבר להודעות */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Helper function for alpha color
const alpha = (color, opacity) => {
  return color + opacity.toString(16).padStart(2, '0');
};

export default DoctorVisits;