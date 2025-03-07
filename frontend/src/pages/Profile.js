// medical-referrals/frontend/src/pages/Profile.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Tooltip,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Info as InfoIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { api, user: currentUser, logout } = useAuth();
  const theme = useTheme();
  
  // מצבים לפרופיל
  const [profileData, setProfileData] = useState({
    email: '',
    full_name: '',
    department: '',
    phone_number: '',
    role: '',
    date_joined: '',
    last_login: '',
    profile_image: null,
  });
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // מצבים לשינוי סיסמה
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  
  // העלאת תמונת פרופיל
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // טעינת פרטי המשתמש
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        email: currentUser.email || '',
        full_name: currentUser.full_name || '',
        department: currentUser.department || '',
        phone_number: currentUser.phone_number || '',
        role: currentUser.role || '',
        date_joined: currentUser.date_joined || '',
        last_login: currentUser.last_login || '',
        profile_image: currentUser.profile_image || null,
      });
    }
  }, [currentUser]);
  
  // טיפול בעדכון פרופיל
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // שמירת פרופיל
  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put(`/users/${currentUser.id}/`, {
        full_name: profileData.full_name,
        department: profileData.department,
        phone_number: profileData.phone_number,
      });
      
      // עדכון פרטי משתמש
      // ייתכן שתצטרך לעדכן את ה-context גם כן בפרויקט אמיתי
      setProfileData(prev => ({
        ...prev,
        ...response.data,
      }));
      
      setEditMode(false);
      setSuccessMessage('הפרופיל עודכן בהצלחה');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('אירעה שגיאה בעדכון הפרופיל');
    } finally {
      setLoading(false);
    }
  };
  
  // ביטול עריכת פרופיל
  const handleCancelEdit = () => {
    // החזרת הנתונים המקוריים
    if (currentUser) {
      setProfileData({
        email: currentUser.email || '',
        full_name: currentUser.full_name || '',
        department: currentUser.department || '',
        phone_number: currentUser.phone_number || '',
        role: currentUser.role || '',
        date_joined: currentUser.date_joined || '',
        last_login: currentUser.last_login || '',
        profile_image: currentUser.profile_image || null,
      });
    }
    setEditMode(false);
  };
  
  // טיפול בשינוי סיסמה
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // נקה שגיאות
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // שמירת סיסמה חדשה
  const handleSavePassword = async () => {
    // ולידציה בסיסית
    const errors = {};
    
    if (!passwordData.old_password) {
      errors.old_password = 'נא להזין סיסמה נוכחית';
    }
    
    if (!passwordData.new_password) {
      errors.new_password = 'נא להזין סיסמה חדשה';
    } else if (passwordData.new_password.length < 8) {
      errors.new_password = 'הסיסמה חייבת להכיל לפחות 8 תווים';
    }
    
    if (!passwordData.new_password_confirm) {
      errors.new_password_confirm = 'נא לאמת את הסיסמה החדשה';
    } else if (passwordData.new_password !== passwordData.new_password_confirm) {
      errors.new_password_confirm = 'הסיסמאות אינן תואמות';
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    setLoading(true);
    
    try {
      await api.post(`/users/${currentUser.id}/change_password/`, {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        new_password_confirm: passwordData.new_password_confirm,
      });
      
      setPasswordDialogOpen(false);
      setPasswordData({
        old_password: '',
        new_password: '',
        new_password_confirm: '',
      });
      setSuccessMessage('הסיסמה שונתה בהצלחה');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      
      if (err.response && err.response.data) {
        setPasswordErrors(err.response.data);
      } else {
        setPasswordErrors({ general: 'אירעה שגיאה בשינוי הסיסמה' });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // העלאת תמונת פרופיל
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingImage(true);
    
    const formData = new FormData();
    formData.append('profile_image', file);
    
    try {
      const response = await api.put(`/users/${currentUser.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // עדכון נתוני תמונת הפרופיל
      setProfileData(prev => ({
        ...prev,
        profile_image: response.data.profile_image,
      }));
      
      setSuccessMessage('תמונת הפרופיל עודכנה בהצלחה');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error uploading profile image:', err);
      setError('אירעה שגיאה בהעלאת תמונת הפרופיל');
    } finally {
      setUploadingImage(false);
    }
  };
  
  // תצוגת תפקיד
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
  
  // צבע תפקיד
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
    return date.toLocaleDateString('he-IL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        פרופיל אישי
      </Typography>
      
      <Grid container spacing={3}>
        {/* כרטיס פרופיל */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Box position="relative" display="inline-block" mb={2}>
                <Avatar
                  src={profileData.profile_image}
                  alt={profileData.full_name}
                  sx={{ width: 120, height: 120, mx: 'auto', fontSize: 40 }}
                >
                  {profileData.full_name?.charAt(0) || <PersonIcon />}
                </Avatar>
                
                <Box 
                  position="absolute" 
                  bottom={0} 
                  right={0}
                  borderRadius="50%"
                  bgcolor={theme.palette.background.paper}
                  boxShadow={1}
                >
                  <Tooltip title="החלף תמונה">
                    <label>
                      <input
                        accept="image/*"
                        type="file"
                        hidden
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      <IconButton 
                        component="span"
                        color="primary"
                        size="small"
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? (
                          <CircularProgress size={20} />
                        ) : (
                          <PhotoCameraIcon />
                        )}
                      </IconButton>
                    </label>
                  </Tooltip>
                </Box>
              </Box>
              
              <Typography variant="h5" gutterBottom>
                {profileData.full_name}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {profileData.email}
              </Typography>
              
              <Chip 
                label={getRoleName(profileData.role)}
                color={getRoleColor(profileData.role)}
                sx={{ mt: 1 }}
              />
              
              <Divider sx={{ my: 2 }} />
              
              <Box textAlign="right">
                <Typography variant="subtitle2" gutterBottom>
                  <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  הצטרף/ה למערכת:
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {formatDate(profileData.date_joined)}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  התחברות אחרונה:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(profileData.last_login)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* פרטי משתמש */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" component="h2">
                פרטים אישיים
              </Typography>
              
              {editMode ? (
                <Box>
                  <Button 
                    onClick={handleCancelEdit}
                    sx={{ mr: 1 }}
                    disabled={loading}
                  >
                    ביטול
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    שמור
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                >
                  ערוך
                </Button>
              )}
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="דואר אלקטרוני"
                  value={profileData.email}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                    readOnly: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="שם מלא"
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleProfileChange}
                  disabled={!editMode || loading}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="מחלקה"
                  name="department"
                  value={profileData.department}
                  onChange={handleProfileChange}
                  disabled={!editMode || loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="מספר טלפון"
                  name="phone_number"
                  value={profileData.phone_number}
                  onChange={handleProfileChange}
                  disabled={!editMode || loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                    dir: 'ltr',
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              אבטחה
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      שינוי סיסמה
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      מומלץ לשנות סיסמה לעיתים קרובות ולהשתמש בסיסמה מורכבת
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    שנה סיסמה
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      {/* דיאלוג שינוי סיסמה */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => !loading && setPasswordDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>שינוי סיסמה</DialogTitle>
        <DialogContent dividers>
          {passwordErrors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordErrors.general}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="סיסמה נוכחית"
                name="old_password"
                type={showPassword.old ? 'text' : 'password'}
                value={passwordData.old_password}
                onChange={handlePasswordChange}
                error={!!passwordErrors.old_password}
                helperText={passwordErrors.old_password}
                disabled={loading}
                required
                InputProps={{
                  dir: 'ltr',
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
                        edge="end"
                      >
                        {showPassword.old ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="סיסמה חדשה"
                name="new_password"
                type={showPassword.new ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                error={!!passwordErrors.new_password}
                helperText={passwordErrors.new_password}
                disabled={loading}
                required
                InputProps={{
                  dir: 'ltr',
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                        edge="end"
                      >
                        {showPassword.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="אימות סיסמה חדשה"
                name="new_password_confirm"
                type={showPassword.confirm ? 'text' : 'password'}
                value={passwordData.new_password_confirm}
                onChange={handlePasswordChange}
                error={!!passwordErrors.new_password_confirm}
                helperText={passwordErrors.new_password_confirm}
                disabled={loading}
                required
                InputProps={{
                  dir: 'ltr',
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                        edge="end"
                      >
                        {showPassword.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)} disabled={loading}>
            ביטול
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSavePassword}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            שנה סיסמה
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* הודעת הצלחה */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
    </Box>
  );
};

export default Profile;