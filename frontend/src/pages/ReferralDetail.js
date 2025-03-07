// medical-referrals/frontend/src/pages/ReferralDetail.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Divider,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  EventNote as EventNoteIcon,
  Notes as NotesIcon,
  Attachment as AttachmentIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  Delete as RemoveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import ReferralForm from '../components/ReferralForm';

// רכיב שדה עם תווית ומידע
const InfoField = ({ label, value, icon, chipColor }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        {icon && <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>{icon}</Box>}
        {label}
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          wordBreak: 'break-word',
          ...(chipColor ? {
            display: 'inline-block',
            bgcolor: theme.palette[chipColor].main,
            color: theme.palette[chipColor].contrastText,
            borderRadius: 1,
            px: 1,
            py: 0.5,
          } : {})
        }}
      >
        {value || '—'}
      </Typography>
    </Box>
  );
};

// כפתור העלאת קובץ עם סגנון מותאם
const UploadButton = styled('label')(({ theme }) => ({
  display: 'inline-block',
  cursor: 'pointer',
}));

const ReferralDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const theme = useTheme();
  
  // מצבים
  const [referral, setReferral] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentDeleting, setDocumentDeleting] = useState(null);
  const [documentDeleteDialogOpen, setDocumentDeleteDialogOpen] = useState(false);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUploadError, setFileUploadError] = useState(null);
  
  // צבעים עבור סטטוסים
  const statusColors = {
    new: 'success',
    in_progress: 'info',
    waiting_for_approval: 'warning',
    appointment_scheduled: 'secondary',
    completed: 'success',
    cancelled: 'error',
    requires_coordination: 'info',
    requires_soldier_coordination: 'warning',
    waiting_for_medical_date: 'warning',
    waiting_for_budget_approval: 'warning',
    waiting_for_doctor_referral: 'error',
    no_show: 'error',
  };
  
  // צבעים עבור עדיפויות
  const priorityColors = {
    highest: 'error',
    urgent: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success',
    minimal: 'default',
  };
  
  // טעינת נתוני ההפניה
  const fetchReferralData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // קבלת פרטי ההפניה
      const referralResponse = await api.get(`/referrals/${id}/`);
      setReferral(referralResponse.data);
      
      // קבלת רשימת המסמכים
      const documentsResponse = await api.get(`/referrals/${id}/documents/`);
      setDocuments(documentsResponse.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching referral data:', err);
      // שיפור הודעת שגיאה
      if (err.response) {
        if (err.response.status === 404) {
          setError('ההפניה לא נמצאה. ייתכן שהיא נמחקה או שהקישור שגוי.');
        } else if (err.response.status === 500) {
          setError('אירעה שגיאה בשרת. ייתכן שיש מיגרציות שלא יושמו. נא לפנות למנהל המערכת.');
        } else {
          setError(`שגיאה בטעינת פרטי ההפניה: ${err.response.status}. אנא נסה שוב.`);
        }
      } else if (err.request) {
        setError('לא התקבלה תגובה מהשרת. בדוק את החיבור לאינטרנט ונסה שוב.');
      } else {
        setError('אירעה שגיאה בטעינת נתוני ההפניה');
      }
      setLoading(false);
    }
  }, [api, id]);
  
  useEffect(() => {
    fetchReferralData();
  }, [id, fetchReferralData]);
  
  // עיצוב התאריך
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };
  
  // עיצוב התאריך והשעה
  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('he-IL')} ${date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  // טיפול במחיקת הפניה
  const handleDelete = async () => {
    try {
      await api.delete(`/referrals/${id}/`);
      navigate('/referrals');
    } catch (err) {
      console.error('Error deleting referral:', err);
      setError('אירעה שגיאה במחיקת ההפניה');
    }
  };
  
  // טיפול בעדכון הפניה
  const handleUpdateReferral = async (referralData) => {
    try {
      const response = await api.put(`/referrals/${id}/`, referralData);
      setReferral(response.data);
      setEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating referral:', err);
      throw err;
    }
  };
  
  // טיפול בהעלאת מסמך
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setFileUploadError(null);
  };
  
  const handleUploadDocument = async () => {
    if (!selectedFile) {
      setFileUploadError('נא לבחור קובץ להעלאה');
      return;
    }
    
    if (!documentTitle.trim()) {
      setFileUploadError('נא להזין כותרת למסמך');
      return;
    }
    
    setDocumentUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', documentTitle);
      formData.append('description', documentDescription);
      formData.append('referral', id);
      
      const response = await api.post('/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // הוסף את המסמך החדש לרשימה
      setDocuments(prev => [...prev, response.data]);
      
      // נקה את טופס ההעלאה
      setSelectedFile(null);
      setDocumentTitle('');
      setDocumentDescription('');
      setFileUploadError(null);
      
      setDocumentUploading(false);
    } catch (err) {
      console.error('Error uploading document:', err);
      setFileUploadError('אירעה שגיאה בהעלאת המסמך');
      setDocumentUploading(false);
    }
  };
  
  // טיפול במחיקת מסמך
  const handleDeleteDocument = async () => {
    if (!documentDeleting) return;
    
    try {
      await api.delete(`/documents/${documentDeleting}/`);
      
      // הסר את המסמך מהרשימה
      setDocuments(prev => prev.filter(doc => doc.id !== documentDeleting));
      
      setDocumentDeleteDialogOpen(false);
      setDocumentDeleting(null);
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('אירעה שגיאה במחיקת המסמך');
    }
  };
  
  // טיפול בהורדת מסמך
  const handleDownloadDocument = async (document) => {
    try {
      const response = await api.get(`/documents/${document.id}/download/`, {
        responseType: 'blob',
      });
      
      // יצירת URL מהנתונים שהתקבלו
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('אירעה שגיאה בהורדת המסמך');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/referrals')}
          sx={{ mb: 2 }}
        >
          חזור לרשימה
        </Button>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchReferralData}>
              נסה שוב
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }
  
  if (!referral) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/referrals')}
          sx={{ mb: 2 }}
        >
          חזור לרשימה
        </Button>
        <Alert severity="warning">ההפניה לא נמצאה</Alert>
      </Box>
    );
  }
  
  // כותרות עבור סטטוסים
  const statusLabels = {
    new: 'חדש',
    in_progress: 'בטיפול',
    waiting_for_approval: 'ממתין לאישור',
    appointment_scheduled: 'נקבע תור',
    completed: 'הושלם',
    cancelled: 'בוטל',
    requires_coordination: 'דרוש תיאום',
    requires_soldier_coordination: 'דרוש תיאום עם חייל',
    waiting_for_medical_date: 'ממתין לתאריך',
    waiting_for_budget_approval: 'ממתין לאישור תקציבי',
    waiting_for_doctor_referral: 'ממתין להפניה מרופא',
    no_show: 'לא הגיע לתור',
  };
  
  // כותרות עבור עדיפויות
  const priorityLabels = {
    highest: 'דחוף ביותר',
    urgent: 'דחוף',
    high: 'גבוה',
    medium: 'בינוני',
    low: 'נמוך',
    minimal: 'זניח',
  };
  
  // כותרות עבור סוגי הפניות
  const referralTypeLabels = {
    specialist: 'רופא מומחה',
    imaging: 'בדיקות דימות',
    lab: 'בדיקות מעבדה',
    procedure: 'פרוצדורה',
    therapy: 'טיפול',
    surgery: 'ניתוח',
    consultation: 'ייעוץ',
    dental: 'טיפול שיניים',
    other: 'אחר',
  };
  
  return (
    <Box>
      {/* כפתור חזרה לרשימה וכותרת */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/referrals')}
            sx={{ mb: 1 }}
          >
            חזור לרשימה
          </Button>
          <Typography variant="h4" component="h1">
            {referral.full_name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {referralTypeLabels[referral.referral_type] || referral.referral_type} - {referral.referral_details}
          </Typography>
        </Box>
        
        <Box>
          <Tooltip title="רענן">
            <IconButton onClick={fetchReferralData} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="ערוך הפניה">
            <IconButton 
              color="primary" 
              onClick={() => setEditDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="מחק הפניה">
            <IconButton 
              color="error" 
              onClick={() => setDeleteDialogOpen(true)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* מידע על המטופל */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <PersonIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                פרטי מטופל
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoField 
                  label="שם מלא" 
                  value={referral.full_name} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoField 
                  label="מספר אישי" 
                  value={referral.personal_id} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoField 
                  label="צוות" 
                  value={referral.team} 
                />
              </Grid>
              {referral.reference_date && (
                <Grid item xs={12} sm={6}>
                  <InfoField 
                    label="תאריך אסמכתא" 
                    value={formatDate(referral.reference_date)} 
                  />
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
        
        {/* מידע על ההפניה */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <AssignmentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                פרטי הפניה
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoField 
                  label="סוג הפניה" 
                  value={referralTypeLabels[referral.referral_type] || referral.referral_type} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoField 
                  label="הפניה מבוקשת" 
                  value={referral.referral_details} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoField 
                  label="סטטוס" 
                  value={referral.status_display || statusLabels[referral.status] || referral.status} 
                  chipColor={statusColors[referral.status] || 'default'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoField 
                  label="עדיפות" 
                  value={referral.priority_display || priorityLabels[referral.priority] || referral.priority} 
                  chipColor={priorityColors[referral.priority] || 'default'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoField 
                  label="יש אסמכתאות" 
                  value={referral.has_documents ? 'כן' : 'לא'} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoField 
                  label="תאריך יצירה" 
                  value={formatDateTime(referral.created_at)} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoField 
                  label="עדכון אחרון" 
                  value={formatDateTime(referral.updated_at)} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoField 
                  label="נוצר על ידי" 
                  value={referral.created_by_name} 
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* מידע על התור */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <EventNoteIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                פרטי התור
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoField 
                  label="תאריך ושעת התור" 
                  value={formatDateTime(referral.appointment_date)} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoField 
                  label="מסלול" 
                  value={referral.appointment_path} 
                />
              </Grid>
              <Grid item xs={12}>
                <InfoField 
                  label="מיקום התור" 
                  value={referral.appointment_location} 
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* הערות */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <NotesIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                הערות
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {referral.notes || 'אין הערות'}
            </Typography>
          </Paper>
        </Grid>
        
        {/* מסמכים מצורפים */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <AttachmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  מסמכים מצורפים
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {/* רשימת מסמכים */}
            {documents.length > 0 ? (
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {documents.map((doc) => (
                  <Box 
                    component="li" 
                    key={doc.id} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      bgcolor: 'background.paper', 
                      mb: 1, 
                      p: 2,
                      borderRadius: 1,
                      boxShadow: 1
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachmentIcon sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="subtitle1" fontWeight="medium">
                          {doc.title}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {formatDateTime(doc.uploaded_at)}
                        {doc.description && ` — ${doc.description}`}
                        {doc.uploaded_by_name && ` | הועלה על ידי: ${doc.uploaded_by_name}`}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Tooltip title="הורד מסמך">
                        <IconButton onClick={() => handleDownloadDocument(doc)}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="מחק מסמך">
                        <IconButton 
                          color="error"
                          onClick={() => {
                            setDocumentDeleting(doc.id);
                            setDocumentDeleteDialogOpen(true);
                          }}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
                אין מסמכים מצורפים
              </Typography>
            )}
            
            {/* טופס העלאת מסמך */}
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  <AddIcon sx={{ mr: 1 }} />
                  העלה מסמך חדש
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {fileUploadError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {fileUploadError}
                  </Alert>
                )}
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="כותרת המסמך"
                      required
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      disabled={documentUploading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="תיאור (אופציונלי)"
                      value={documentDescription}
                      onChange={(e) => setDocumentDescription(e.target.value)}
                      disabled={documentUploading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<AttachmentIcon />}
                        sx={{ mr: 2 }}
                        disabled={documentUploading}
                      >
                        בחר קובץ
                        <input
                          type="file"
                          hidden
                          onChange={handleFileChange}
                        />
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        {selectedFile ? selectedFile.name : 'לא נבחר קובץ'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={documentUploading ? <CircularProgress size={20} /> : <SendIcon />}
                      onClick={handleUploadDocument}
                      disabled={documentUploading || !selectedFile || !documentTitle.trim()}
                    >
                      {documentUploading ? 'מעלה...' : 'העלה מסמך'}
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>
      </Grid>
      
      {/* דיאלוג עריכת הפניה */}
      {editDialogOpen && (
        <ReferralForm
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleUpdateReferral}
          referral={referral}
        />
      )}
      
      {/* דיאלוג מחיקת הפניה */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>מחיקת הפניה</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את ההפניה של {referral.full_name}?
            פעולה זו אינה ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            ביטול
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            מחק
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* דיאלוג מחיקת מסמך */}
      <Dialog
        open={documentDeleteDialogOpen}
        onClose={() => setDocumentDeleteDialogOpen(false)}
      >
        <DialogTitle>מחיקת מסמך</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את המסמך?
            פעולה זו אינה ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentDeleteDialogOpen(false)}>
            ביטול
          </Button>
          <Button onClick={handleDeleteDocument} color="error" autoFocus>
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReferralDetail;