// medical-referrals/frontend/src/pages/ReferralsPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { Assignment as AssignmentIcon } from '@mui/icons-material';
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
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useAuth } from '../context/AuthContext';
import ReferralForm from '../components/ReferralForm';

const initialFilters = {
  status: [],
  priority: [],
  referral_details: [],
  team: [],
  has_documents: '',
};

const ReferralsPage = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // מצבי טבלה
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  // מצבי קלט (עד לחיצה על "חפש")
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(false);

  // ערכי חיפוש מופעלים (המשמשים לשליחת בקשה)
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  // רשימת "הפניה מבוקשת" (מופקת מהנתונים)
  const [availableReferralDetails, setAvailableReferralDetails] = useState([]);

  // מצב מיון לפי צוות (למשל, "team" לעולה, "-team" לירידה)
  const [sortOrder, setSortOrder] = useState('');

  // מצבי טופס הפניה
  const [openForm, setOpenForm] = useState(false);
  const [editingReferral, setEditingReferral] = useState(null);

  // דיאלוג מחיקה
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingReferralId, setDeletingReferralId] = useState(null);

  // הגדרות אפשרויות סטטוס ועדיפות
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

  const statusColors = {
    new: 'success',
    in_progress: 'info',
    waiting_for_approval: 'warning',
    appointment_scheduled: 'secondary',
    completed: 'default',
    cancelled: 'error',
    requires_coordination: 'info',
    requires_soldier_coordination: 'warning',
    waiting_for_medical_date: 'warning',
    waiting_for_budget_approval: 'warning',
    waiting_for_doctor_referral: 'error',
    no_show: 'error',
  };
  const priorityColors = {
    highest: 'error',
    urgent: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success',
    minimal: 'default',
  };

  // פונקציה לטעינת ההפניות – חשוב לשים לב לפרמטר "referral_details__in" ולפרמטר המיון "ordering"
  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page + 1, // DRF מתחיל מעמוד 1
        page_size: rowsPerPage,
        search: appliedSearchQuery,
      };

      if (appliedFilters.status.length > 0)
        params.status__in = appliedFilters.status.join(',');
      if (appliedFilters.priority.length > 0)
        params.priority__in = appliedFilters.priority.join(',');
      if (appliedFilters.referral_details.length > 0)
        params.referral_details__in = appliedFilters.referral_details.join(',');
      if (appliedFilters.team.length > 0)
        params.team__in = appliedFilters.team.join(',');
      if (appliedFilters.has_documents !== '')
        params.has_documents = appliedFilters.has_documents;
      if (sortOrder) params.ordering = sortOrder;

      const response = await api.get('/referrals/', { params });
      if (response.data && 'results' in response.data) {
        setReferrals(response.data.results || []);
        setTotalCount(response.data.count || 0);
        // הפקת רשימת הערכים הייחודיים לשדה "הפניה מבוקשת"
        const details = Array.from(new Set(response.data.results.map(r => r.referral_details).filter(Boolean)));
        setAvailableReferralDetails(details);
      } else {
        console.error('Unexpected API response format:', response.data);
        setError('תגובת השרת לא תקינה. אנא פנה לתמיכה.');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching referrals:', err);
      if (err.response) {
        if (err.response.status === 500) {
          setError('אירעה שגיאה בשרת. ייתכן שיש מיגרציות שלא יושמו. נא לפנות למנהל המערכת.');
        } else {
          setError(`שגיאה בטעינת ההפניות: ${err.response.status}. אנא נסה שוב.`);
        }
      } else if (err.request) {
        setError('לא התקבלה תגובה מהשרת. בדוק את החיבור לאינטרנט ונסה שוב.');
      } else {
        setError('אירעה שגיאה בטעינת הנתונים. אנא נסה שוב.');
      }
      setLoading(false);
    }
  }, [api, page, rowsPerPage, appliedSearchQuery, appliedFilters, sortOrder]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  useEffect(() => {
    if (location.state) {
      let newFilters = { ...filters };
      if (location.state.filterPriority) {
        newFilters.priority = [location.state.filterPriority];
      }
      setFilters(newFilters);
      setAppliedFilters(newFilters);
      if (location.state.openForm) setOpenForm(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate, filters]);

  const handleSearch = () => {
    setPage(0);
    setAppliedSearchQuery(searchQuery);
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters(initialFilters);
    setAppliedSearchQuery('');
    setAppliedFilters(initialFilters);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
      } else {
        await api.post('/referrals/', referralData);
      }
      setOpenForm(false);
      fetchReferrals();
    } catch (err) {
      console.error('Error saving referral:', err);
      setError('אירעה שגיאה בשמירת ההפניה');
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
      fetchReferrals();
    } catch (err) {
      console.error('Error deleting referral:', err);
      setError('אירעה שגיאה במחיקת ההפניה');
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const params = {
        format: 'csv',
        search: appliedSearchQuery,
      };
      if (appliedFilters.status.length > 0)
        params.status__in = appliedFilters.status.join(',');
      if (appliedFilters.priority.length > 0)
        params.priority__in = appliedFilters.priority.join(',');
      if (appliedFilters.referral_details.length > 0)
        params.referral_details__in = appliedFilters.referral_details.join(',');
      if (appliedFilters.team.length > 0)
        params.team__in = appliedFilters.team.join(',');
      if (appliedFilters.has_documents !== '')
        params.has_documents = appliedFilters.has_documents;
      if (sortOrder) params.ordering = sortOrder;

      const response = await api.get('/referrals/export/', { params, responseType: 'blob' });
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

  // העתקת טבלה – כל שורה: מספור, שם מלא, מספר אישי והפניה מבוקשת (ללא כותרות)
  const handleCopyTable = () => {
    const lines = referrals.map((referral, index) => {
      const rowNumber = index + 1 + page * rowsPerPage;
      return `${rowNumber}, ${referral.full_name}, ${referral.personal_id}, ${referral.referral_details || ''}`;
    });
    const tableText = lines.join('\n');
    navigator.clipboard.writeText(tableText);
    alert('הנתונים הועתקו ללוח');
  };

  // שינוי מיון לפי צוות – לחיצה על כותרת "צוות" תעביר בין "team" ל-" -team"
  const handleSortByTeam = () => {
    setSortOrder((prev) => (prev === 'team' ? '-team' : 'team'));
    setPage(0);
  };

  // עיצוב תאריך (למקרה שיש צורך)
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('he-IL')} ${date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* כותרת ראשית וכפתורי פעולה */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          הפניות רפואיות
        </Typography>
        <Box>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportCsv} sx={{ mr: 1 }}>
            ייצוא CSV
          </Button>
          <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopyTable} sx={{ mr: 1 }}>
            העתק טבלה
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddReferral}>
            הפניה חדשה
          </Button>
        </Box>
      </Box>

      {/* סריקה וסינון */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="חיפוש"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
              onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
            />
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleSearch} startIcon={<SearchIcon />}>
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
            <Button variant="outlined" color="error" onClick={handleClearFilters} startIcon={<ClearIcon />}>
              נקה סינון
            </Button>
          </Grid>
          <Grid item>
            <Tooltip title="רענן">
              <IconButton onClick={fetchReferrals}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>

        <Collapse in={showFilters}>
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              {/* סינון לפי סטטוס */}
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
                            label={statusOptions.find(option => option.value === value)?.label || value}
                            color={statusColors[value] || 'default'}
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

              {/* סינון לפי עדיפות */}
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
                            label={priorityOptions.find(option => option.value === value)?.label || value}
                            color={priorityColors[value] || 'default'}
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

              {/* סינון לפי "הפניה מבוקשת" */}
              <Grid item xs={12} sm={6} md={3}>
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
                    {availableReferralDetails.map((detail) => (
                      <MenuItem key={detail} value={detail}>
                        {detail}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* סינון לפי צוות */}
              <Grid item xs={12} sm={6} md={3}>
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
                    {[
                      { value: 'חוד', label: 'חוד' },
                      { value: 'אתק', label: 'אתק' },
                      { value: 'רתק', label: 'רתק' },
                      { value: 'מפלג', label: 'מפלג' },
                    ].map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* סינון לפי קיום מסמכים */}
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
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} 
          action={<Button color="inherit" size="small" onClick={fetchReferrals}>נסה שוב</Button>}
        >
          {error}
        </Alert>
      )}

      {/* טבלת הפניות */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>מספר</TableCell>
              <TableCell>פעולות</TableCell>
              <TableCell>שם מלא</TableCell>
              <TableCell>מספר אישי</TableCell>
              <TableCell onClick={handleSortByTeam} sx={{ cursor: 'pointer' }}>
                צוות&nbsp;
                {sortOrder === 'team' ? (
                  <ArrowUpwardIcon fontSize="small" />
                ) : sortOrder === '-team' ? (
                  <ArrowDownwardIcon fontSize="small" />
                ) : null}
              </TableCell>
              <TableCell>הפניה מבוקשת</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell>עדיפות</TableCell>
              <TableCell>תאריך תור</TableCell>
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
                    <Typography variant="h6" color="text.secondary">
                      לא נמצאו הפניות
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      נסה לשנות את הסינון או להוסיף הפניה חדשה
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              referrals.map((referral, index) => {
                const rowNumber = index + 1 + page * rowsPerPage;
                return (
                  <TableRow key={referral.id} hover>
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
                    <TableCell>{referral.full_name}</TableCell>
                    <TableCell>{referral.personal_id}</TableCell>
                    <TableCell>{referral.team}</TableCell>
                    <TableCell>{referral.referral_details}</TableCell>
                    <TableCell>
                      <Chip 
                        label={referral.status_display || statusOptions.find(o => o.value === referral.status)?.label || referral.status}
                        color={statusColors[referral.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={referral.priority_display || priorityOptions.find(o => o.value === referral.priority)?.label || referral.priority}
                        color={priorityColors[referral.priority] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(referral.appointment_date)}</TableCell>
                  </TableRow>
                );
              })
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

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>מחיקת הפניה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את ההפניה הזו? פעולה זו אינה ניתנת לביטול.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
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

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading && referrals.length > 0}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default ReferralsPage;
