// medical-referrals/frontend/src/pages/UserManagement.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Avatar,
  CircularProgress,
  Alert,
  Backdrop,
  FormHelperText,
  InputAdornment,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  const { api, user: currentUser } = useAuth();
  
  // מצבים
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // מצבים לטפסים
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  // מצב הטופס
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'user',
    department: '',
    phone_number: '',
    password: '',
    password_confirm: '',
    is_active: true,
  });
  
  // מצב ולידציה
  const [formErrors, setFormErrors] = useState({});
  
  // טעינת רשימת המשתמשים
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: page + 1, // Django REST מתחיל מעמוד 1
        page_size: rowsPerPage,
        search: searchQuery,
      };
      
      const response = await api.get('/users/', { params });
      
      setUsers(response.data.results);
      setTotalCount(response.data.count);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('אירעה שגיאה בטעינת רשימת המשתמשים');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);
  
  // טיפול בחיפוש
  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };
  
  // ניקוי החיפוש
  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
    setTimeout(() => {
      fetchUsers();
    }, 0);
  };
  
  // טיפול בשינוי עמוד
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // טיפול בשינוי מספר שורות בעמוד
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // פתיחת דיאלוג משתמש חדש
  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      email: '',
      full_name: '',
      role: 'user',
      department: '',
      phone_number: '',
      password: '',
      password_confirm: '',
      is_active: true,
    });
    setFormErrors({});
    setUserDialogOpen(true);
  };
  
  // פתיחת דיאלוג עריכת משתמש
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      department: user.department || '',
      phone_number: user.phone_number || '',
      is_active: user.is_active,
      password: '',
      password_confirm: '',
    });
    setFormErrors({});
    setUserDialogOpen(true);
  };
  
  // פתיחת דיאלוג שינוי סיסמה
  const handleChangePassword = (user) => {
    setSelectedUser(user);
    setFormData(prev => ({
      ...prev,
      password: '',
      password_confirm: '',
    }));
    setFormErrors({});
    setPasswordDialogOpen(true);
  };
  
  // פתיחת דיאלוג מחיקת משתמש
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };
  
  // טיפול בשינויים בטופס
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
  
  // ולידציה של הטופס
  const validateForm = (isPasswordChange = false) => {
    const errors = {};
    
    if (!isPasswordChange) {
      // ולידציה רגילה
      if (!formData.email) {
        errors.email = 'נא להזין כתובת אימייל';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'נא להזין כתובת אימייל תקינה';
      }
      
      if (!formData.full_name) {
        errors.full_name = 'נא להזין שם מלא';
      }
    }
    
    // ולידציה לסיסמה - רק אם זה משתמש חדש או שינוי סיסמה
    if (!selectedUser || isPasswordChange) {
      if (!formData.password) {
        errors.password = 'נא להזין סיסמה';
      } else if (formData.password.length < 8) {
        errors.password = 'הסיסמה חייבת להכיל לפחות 8 תווים';
      }
      
      if (!formData.password_confirm) {
        errors.password_confirm = 'נא לאמת את הסיסמה';
      } else if (formData.password !== formData.password_confirm) {
        errors.password_confirm = 'הסיסמאות אינן תואמות';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // שמירת משתמש
  const handleSaveUser = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (selectedUser) {
        // עדכון משתמש קיים
        const dataToUpdate = { ...formData };
        delete dataToUpdate.password;
        delete dataToUpdate.password_confirm;
        
        await api.put(`/users/${selectedUser.id}/`, dataToUpdate);
      } else {
        // יצירת משתמש חדש
        await api.post('/users/', formData);
      }
      
      setUserDialogOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      
      if (err.response && err.response.data) {
        setFormErrors(err.response.data);
      } else {
        setError('אירעה שגיאה בשמירת המשתמש');
      }
      
      setLoading(false);
    }
  };
  
  // שינוי סיסמה
  const handleSavePassword = async () => {
    if (!validateForm(true)) return;
    
    setLoading(true);
    
    try {
      await api.post(`/users/${selectedUser.id}/change_password/`, {
        old_password: 'admin-override', // במקרה של מנהל מערכת
        new_password: formData.password,
        new_password_confirm: formData.password_confirm,
      });
      
      setPasswordDialogOpen(false);
      setLoading(false);
    } catch (err) {
      console.error('Error changing password:', err);
      
      if (err.response && err.response.data) {
        setFormErrors(err.response.data);
      } else {
        setError('אירעה שגיאה בשינוי הסיסמה');
      }
      
      setLoading(false);
    }
  };
  
  // מחיקת משתמש
  const handleConfirmDelete = async () => {
    setLoading(true);
    
    try {
      await api.delete(`/users/${selectedUser.id}/`);
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('אירעה שגיאה במחיקת המשתמש');
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // פונקציית עזר להצגת שם תפקיד
  const getRoleName = (role) => {
    switch (role) {
      case 'admin':
        return 'מנהל מערכת';
      case 'manager':
        return 'מנהל';
      case 'user':
        return 'משתמש רגיל';
      case 'viewer':
        return 'צופה בלבד';
      default:
        return role;
    }
  };
  
  // פונקציית עזר להצגת צבע תפקיד
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'user':
        return 'primary';
      case 'viewer':
        return 'info';
      default:
        return 'default';
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
          ניהול משתמשים
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
        >
          משתמש חדש
        </Button>
      </Box>
      
      {/* חיפוש */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              label="חיפוש לפי שם או אימייל"
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
              onClick={handleClearSearch}
              startIcon={<ClearIcon />}
            >
              נקה
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* הודעת שגיאה */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* טבלת משתמשים */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>פעולות</TableCell>
              <TableCell>משתמש</TableCell>
              <TableCell>דוא"ל</TableCell>
              <TableCell>תפקיד</TableCell>
              <TableCell>מחלקה</TableCell>
              <TableCell>טלפון</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell>הצטרף בתאריך</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    לא נמצאו משתמשים
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="ערוך משתמש">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleEditUser(user)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="שנה סיסמה">
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => handleChangePassword(user)}
                          sx={{ mr: 1 }}
                        >
                          <LockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="מחק משתמש">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(user)}
                          disabled={user.id === currentUser.id} // לא ניתן למחוק את המשתמש הנוכחי
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={user.profile_image} 
                        alt={user.full_name}
                        sx={{ mr: 2, width: 32, height: 32 }}
                      >
                        {user.full_name.charAt(0)}
                      </Avatar>
                      <Typography>{user.full_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleName(user.role)}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.department || '—'}</TableCell>
                  <TableCell>{user.phone_number || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'פעיל' : 'מושבת'}
                      color={user.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.date_joined)}</TableCell>
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
      
      {/* דיאלוג הוספה/עריכת משתמש */}
      <Dialog 
        open={userDialogOpen} 
        onClose={() => setUserDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedUser ? 'עריכת משתמש' : 'הוספת משתמש חדש'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="דוא״ל"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={!!selectedUser} // לא ניתן לשנות אימייל בעריכה
                InputProps={{
                  dir: 'ltr', // כיוון LTR לאימייל
                }}
              />
            </Grid>
            
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
              <FormControl fullWidth>
                <InputLabel>תפקיד</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  label="תפקיד"
                >
                  <MenuItem value="admin">מנהל מערכת</MenuItem>
                  <MenuItem value="manager">מנהל</MenuItem>
                  <MenuItem value="user">משתמש רגיל</MenuItem>
                  <MenuItem value="viewer">צופה בלבד</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="department"
                label="מחלקה"
                fullWidth
                value={formData.department}
                onChange={handleFormChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone_number"
                label="טלפון"
                fullWidth
                value={formData.phone_number}
                onChange={handleFormChange}
                InputProps={{
                  dir: 'ltr', // כיוון LTR למספרי טלפון
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleFormChange}
                  />
                }
                label="משתמש פעיל"
              />
            </Grid>
            
            {!selectedUser && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    הגדרת סיסמה ראשונית
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="password"
                    label="סיסמה"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    value={formData.password}
                    onChange={handleFormChange}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                    InputProps={{
                      dir: 'ltr', // כיוון LTR לסיסמה
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="password_confirm"
                    label="אימות סיסמה"
                    type={showPasswordConfirm ? 'text' : 'password'}
                    fullWidth
                    required
                    value={formData.password_confirm}
                    onChange={handleFormChange}
                    error={!!formErrors.password_confirm}
                    helperText={formErrors.password_confirm}
                    InputProps={{
                      dir: 'ltr', // כיוון LTR לסיסמה
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                            edge="end"
                          >
                            {showPasswordConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>
            ביטול
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveUser}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'שמור'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* דיאלוג שינוי סיסמה */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => setPasswordDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          שינוי סיסמה למשתמש {selectedUser?.full_name}
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            שינוי סיסמה על ידי מנהל מערכת אינו דורש הזנת סיסמה נוכחית.
          </Alert>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="password"
                label="סיסמה חדשה"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={formData.password}
                onChange={handleFormChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                InputProps={{
                  dir: 'ltr', // כיוון LTR לסיסמה
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="password_confirm"
                label="אימות סיסמה חדשה"
                type={showPasswordConfirm ? 'text' : 'password'}
                fullWidth
                required
                value={formData.password_confirm}
                onChange={handleFormChange}
                error={!!formErrors.password_confirm}
                helperText={formErrors.password_confirm}
                InputProps={{
                  dir: 'ltr', // כיוון LTR לסיסמה
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        edge="end"
                      >
                        {showPasswordConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>
            ביטול
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSavePassword}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'שנה סיסמה'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* דיאלוג מחיקת משתמש */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>מחיקת משתמש</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את המשתמש <b>{selectedUser?.full_name}</b>?
            פעולה זו אינה ניתנת לביטול.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            ביטול
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            מחק
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* מסך טעינה */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading && users.length > 0}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default UserManagement;