// medical-referrals/frontend/src/pages/AuditLogs.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Collapse,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  RestartAlt as RestartAltIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { he } from 'date-fns/locale';

const AuditLogs = () => {
  const { api } = useAuth();
  const theme = useTheme();
  
  // מצבים
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  
  // מצבי סינון
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    action_type: [],
    timestamp_after: null,
    timestamp_before: null,
    user: '',
    search: '',
  });
  
  // מצב דיאלוג פרטים
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  
  // אפשרויות סינון
  const actionTypeOptions = [
    { value: 'create', label: 'יצירה' },
    { value: 'update', label: 'עדכון' },
    { value: 'delete', label: 'מחיקה' },
    { value: 'login', label: 'התחברות' },
    { value: 'logout', label: 'התנתקות' },
    { value: 'view', label: 'צפייה' },
    { value: 'export', label: 'ייצוא' },
    { value: 'other', label: 'אחר' },
  ];
  
  // צבעים לפי סוג פעולה
  const actionTypeColors = {
    create: 'success',
    update: 'info',
    delete: 'error',
    login: 'primary',
    logout: 'default',
    view: 'secondary',
    export: 'warning',
    other: 'default',
  };
  
  // טעינת תיעוד פעולות
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // בניית פרמטרים לבקשה
      const params = {
        page: page + 1, // Django REST framework מתחיל מעמוד 1
        page_size: rowsPerPage,
      };
      
      // הוספת פילטרים
      if (filters.action_type.length > 0) {
        params.action_type__in = filters.action_type.join(',');
      }
      
      if (filters.timestamp_after) {
        params.timestamp__gte = filters.timestamp_after.toISOString();
      }
      
      if (filters.timestamp_before) {
        params.timestamp__lte = filters.timestamp_before.toISOString();
      }
      
      if (filters.user) {
        params.user = filters.user;
      }
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      const response = await api.get('/audit-logs/', { params });
      
      setLogs(response.data.results);
      setTotalCount(response.data.count);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('אירעה שגיאה בטעינת תיעוד פעולות');
      setLoading(false);
    }
  };
  
  // טעינה ראשונית
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);
  
  // עדכון הסינון
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // חיפוש והחלת סינון
  const handleSearch = () => {
    setPage(0); // חזרה לעמוד הראשון
    fetchLogs();
  };
  
  // איפוס הסינון
  const handleClearFilters = () => {
    setFilters({
      action_type: [],
      timestamp_after: null,
      timestamp_before: null,
      user: '',
      search: '',
    });
    
    setPage(0);
    // הרצת חיפוש אחרי איפוס הערכים
    setTimeout(() => {
      fetchLogs();
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
  
  // פתיחת דיאלוג פרטים
  const handleOpenDetails = (log) => {
    setSelectedLog(log);
    setDetailsDialogOpen(true);
  };
  
  // עיצוב תאריך
  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL') + ' ' + date.toLocaleTimeString('he-IL');
  };
  
  // עיצוב JSON
  const formatJSON = (json) => {
    if (!json) return null;
    
    try {
      if (typeof json === 'string') {
        json = JSON.parse(json);
      }
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return JSON.stringify(json);
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          תיעוד פעולות מערכת
        </Typography>
        <Tooltip title="רענן נתונים">
          <IconButton onClick={fetchLogs}>
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* חיפוש וסינון */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="חיפוש"
              variant="outlined"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
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
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="action-type-filter-label">סוג פעולה</InputLabel>
                  <Select
                    labelId="action-type-filter-label"
                    id="action-type-filter"
                    multiple
                    value={filters.action_type}
                    onChange={(e) => handleFilterChange('action_type', e.target.value)}
                    label="סוג פעולה"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={actionTypeOptions.find(option => option.value === value)?.label || value}
                            color={actionTypeColors[value] || 'default'}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {actionTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="משתמש (ID)"
                  value={filters.user}
                  onChange={(e) => handleFilterChange('user', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
                  <DatePicker
                    label="מתאריך"
                    value={filters.timestamp_after}
                    onChange={(date) => handleFilterChange('timestamp_after', date)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
                  <DatePicker
                    label="עד תאריך"
                    value={filters.timestamp_before}
                    onChange={(date) => handleFilterChange('timestamp_before', date)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </LocalizationProvider>
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
      
      {/* טבלת תיעוד פעולות */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>פעולות</TableCell>
              <TableCell>תאריך ושעה</TableCell>
              <TableCell>משתמש</TableCell>
              <TableCell>סוג פעולה</TableCell>
              <TableCell>פרטי פעולה</TableCell>
              <TableCell>כתובת IP</TableCell>
              <TableCell>ישות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box sx={{ py: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <HistoryIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      לא נמצאו פעולות
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      נסה לשנות את פרמטרי החיפוש
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Tooltip title="צפה בפרטים">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDetails(log)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell nowrap="nowrap">{formatDateTime(log.timestamp)}</TableCell>
                  <TableCell>{log.user_name || 'אנונימי'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={log.action_type_display || log.action_type}
                      color={actionTypeColors[log.action_type] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.action_detail}</TableCell>
                  <TableCell>{log.ip_address || '—'}</TableCell>
                  <TableCell>
                    {log.content_type_str ? (
                      <Typography variant="body2" nowrap="nowrap">
                        {log.content_type_str} 
                        {log.object_id && `#${log.object_id}`}
                      </Typography>
                    ) : (
                      '—'
                    )}
                  </TableCell>
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
      
      {/* דיאלוג פרטי פעולה */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          פרטי פעולה
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  תאריך ושעה
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(selectedLog.timestamp)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  משתמש
                </Typography>
                <Typography variant="body1">
                  {selectedLog.user_name || 'אנונימי'} (ID: {selectedLog.user || 'N/A'})
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  סוג פעולה
                </Typography>
                <Chip 
                  label={selectedLog.action_type_display || selectedLog.action_type}
                  color={actionTypeColors[selectedLog.action_type] || 'default'}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  כתובת IP
                </Typography>
                <Typography variant="body1">
                  {selectedLog.ip_address || '—'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  פרטי פעולה
                </Typography>
                <Typography variant="body1">
                  {selectedLog.action_detail}
                </Typography>
              </Grid>
              
              {selectedLog.content_type_str && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    ישות
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.content_type_str} 
                    {selectedLog.object_id && `#${selectedLog.object_id}`}
                  </Typography>
                </Grid>
              )}
              
              {selectedLog.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    הערות
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.notes}
                  </Typography>
                </Grid>
              )}
              
              {selectedLog.old_values && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    ערכים ישנים
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 1, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                      maxHeight: 300,
                      overflow: 'auto'
                    }}
                  >
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
                      {formatJSON(selectedLog.old_values)}
                    </pre>
                  </Paper>
                </Grid>
              )}
              
              {selectedLog.new_values && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    ערכים חדשים
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 1, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                      maxHeight: 300,
                      overflow: 'auto'
                    }}
                  >
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
                      {formatJSON(selectedLog.new_values)}
                    </pre>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            סגור
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLogs;