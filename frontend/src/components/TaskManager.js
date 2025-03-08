// frontend/src/components/TaskManager.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Chip,
  Tooltip,
  Divider,
  Grid,
  Alert,
  CircularProgress,
  Collapse,
  Fab,
  FormControlLabel,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Assignment as AssignmentIcon,
  EventAvailable as EventAvailableIcon,
  PersonOutline as PersonOutlineIcon,
  LocalHospital as LocalHospitalIcon,
  Healing as HealingIcon,
  FilterList as FilterListIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Flag as FlagIcon,
  FormatListBulleted as FormatListBulletedIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// Task manager component for use anywhere in the application
const TaskManager = ({ showTitle = true, maxHeight = null, standalone = false }) => {
  // State
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    due_date: '',
    completed: false,
    related_soldier: '',
  });
  
  // Edit state
  const [editingTask, setEditingTask] = useState(null);
  
  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState(null);
  
  // Load tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real project we would make an API call to the server
        // const response = await api.get('/tasks/');
        // setTasks(response.data);
        
        // Using sample data
        const mockTasks = [
          {
            id: 1,
            title: 'מדידת לחץ דם לאלון כהן',
            description: 'בדיקת לחץ דם שבועית',
            category: 'medical',
            priority: 'high',
            due_date: '2025-03-15',
            completed: false,
            created_at: '2025-03-07',
            related_soldier: 'אלון כהן'
          },
          {
            id: 2,
            title: 'תיאום תור פיזיותרפיה',
            description: 'לתאם תור פיזיותרפיה עבור דני לוי',
            category: 'referral',
            priority: 'medium',
            due_date: '2025-03-12',
            completed: false,
            created_at: '2025-03-06',
            related_soldier: 'דני לוי'
          },
          {
            id: 3,
            title: 'לוודא שחיילי אתק ביצעו תרגול חסם עורקים',
            description: 'לבדוק מול המפקד אילו חיילים לא ביצעו',
            category: 'training',
            priority: 'high',
            due_date: '2025-03-10',
            completed: false,
            created_at: '2025-03-05',
            related_soldier: ''
          },
          {
            id: 4,
            title: 'בדיקת מלאי ערכות עזרה ראשונה',
            description: 'לבדוק את כל הערכות ולדווח על ציוד חסר',
            category: 'general',
            priority: 'low',
            due_date: '2025-03-20',
            completed: true,
            created_at: '2025-03-04',
            related_soldier: ''
          },
          {
            id: 5,
            title: 'ישיבה עם רופאת היחידה',
            description: 'סקירת מקרים מיוחדים',
            category: 'meeting',
            priority: 'high',
            due_date: '2025-03-09',
            completed: false,
            created_at: '2025-03-03',
            related_soldier: ''
          }
        ];
        
        setTasks(mockTasks);
        setFilteredTasks(mockTasks);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('אירעה שגיאה בטעינת המשימות');
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  // Filter tasks
  useEffect(() => {
    let filtered = [...tasks];
    
    // Filter by status
    if (filterStatus === 'completed') {
      filtered = filtered.filter(task => task.completed);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(task => !task.completed);
    }
    
    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(task => task.category === filterCategory);
    }
    
    // Sort by completion, due date, and priority
    filtered.sort((a, b) => {
      // First sort by completion
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      
      // Then by due date
      if (!a.completed) {
        const dateA = new Date(a.due_date);
        const dateB = new Date(b.due_date);
        
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
      }
      
      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    setFilteredTasks(filtered);
  }, [tasks, filterStatus, filterPriority, filterCategory]);
  
  // Open add form
  const handleAddTask = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      category: 'general',
      priority: 'medium',
      due_date: '',
      completed: false,
      related_soldier: '',
    });
    setOpenForm(true);
  };
  
  // Open edit form
  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      due_date: task.due_date || '',
      completed: task.completed,
      related_soldier: task.related_soldier || '',
    });
    setOpenForm(true);
  };
  
  // Form change handler
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  // Save task
  const handleSaveTask = async () => {
    if (!formData.title) {
      return; // Don't save task without title
    }
    
    try {
      setLoading(true);
      
      if (editingTask) {
        // Update existing task
        // In a real project:
        // await api.put(`/tasks/${editingTask.id}/`, formData);
        
        // Local update:
        const updatedTasks = tasks.map(task =>
          task.id === editingTask.id ? { ...task, ...formData } : task
        );
        setTasks(updatedTasks);
      } else {
        // Create new task
        // In a real project:
        // const response = await api.post('/tasks/', formData);
        // const newTask = response.data;
        
        // Local creation:
        const newTask = {
          id: Math.max(0, ...tasks.map(t => t.id)) + 1,
          ...formData,
          created_at: new Date().toISOString().split('T')[0],
        };
        
        setTasks([...tasks, newTask]);
      }
      
      setOpenForm(false);
      setLoading(false);
    } catch (err) {
      console.error('Error saving task:', err);
      setError('אירעה שגיאה בשמירת המשימה');
      setLoading(false);
    }
  };
  
  // Handle delete click
  const handleDeleteClick = (taskId) => {
    setTaskIdToDelete(taskId);
    setDeleteDialogOpen(true);
  };
  
  // Delete task
  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      
      // In a real project:
      // await api.delete(`/tasks/${taskIdToDelete}/`);
      
      // Local deletion:
      const updatedTasks = tasks.filter(task => task.id !== taskIdToDelete);
      setTasks(updatedTasks);
      
      setDeleteDialogOpen(false);
      setLoading(false);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('אירעה שגיאה במחיקת המשימה');
      setLoading(false);
    }
  };
  
  // Toggle task completion
  const handleToggleComplete = async (taskId) => {
    try {
      // Find the relevant task
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) return;
      
      // Toggle status
      const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
      
      // In a real project:
      // await api.patch(`/tasks/${taskId}/`, { completed: updatedTask.completed });
      
      // Local update:
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? updatedTask : task
      );
      
      setTasks(updatedTasks);
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('אירעה שגיאה בעדכון סטטוס המשימה');
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };
  
  // Get priority label
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'גבוהה';
      case 'medium': return 'בינונית';
      case 'low': return 'נמוכה';
      default: return priority;
    }
  };
  
  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'medical':
        return <LocalHospitalIcon color="primary" />;
      case 'training':
        return <EventAvailableIcon color="secondary" />;
      case 'meeting':
        return <PersonOutlineIcon color="info" />;
      case 'referral':
        return <HealingIcon color="warning" />;
      default:
        return <AssignmentIcon />;
    }
  };
  
  // Get category label
  const getCategoryLabel = (category) => {
    switch (category) {
      case 'medical': return 'רפואי';
      case 'training': return 'אימון';
      case 'meeting': return 'פגישה';
      case 'referral': return 'הפניה';
      case 'general': return 'כללי';
      default: return category;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };
  
  // Check if task is overdue
  const isOverdue = (task) => {
    if (task.completed || !task.due_date) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  };
  
  // Calculate task statistics
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(task => isOverdue(task)).length;
    const highPriority = tasks.filter(task => !task.completed && task.priority === 'high').length;
    
    return { total, completed, pending, overdue, highPriority };
  };
  
  const taskStats = getTaskStats();
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Title and actions (in standalone mode) */}
      {standalone && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            משימות
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTask}
          >
            משימה חדשה
          </Button>
        </Box>
      )}
      
      {/* Main panel */}
      <Paper
        elevation={standalone ? 1 : 0}
        sx={{ 
          p: standalone ? 2 : 1,
          background: standalone ? undefined : 'transparent'
        }}
      >
        {/* Title (not in standalone mode) */}
        {!standalone && showTitle && (
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ mr: 1 }} /> משימות נדרשות
            </Typography>
            <Box>
              {!standalone && (
                <Tooltip title="הוסף משימה">
                  <IconButton size="small" color="primary" onClick={handleAddTask}>
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="סינון">
                <IconButton 
                  size="small" 
                  color={showFilters ? "primary" : "default"}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="רענן">
                <IconButton 
                  size="small" 
                  onClick={() => setFilteredTasks([...tasks])}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
        
        {/* Task stats */}
        {standalone && (
          <Box mb={3}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 1.5, 
                    textAlign: 'center',
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h5">{taskStats.total}</Typography>
                  <Typography variant="body2">סה"כ משימות</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 1.5, 
                    textAlign: 'center',
                    bgcolor: 'success.light',
                    color: 'success.contrastText',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h5">{taskStats.completed}</Typography>
                  <Typography variant="body2">הושלמו</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 1.5, 
                    textAlign: 'center',
                    bgcolor: 'warning.light',
                    color: 'warning.contrastText',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h5">{taskStats.pending}</Typography>
                  <Typography variant="body2">ממתינות</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 1.5, 
                    textAlign: 'center',
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                    borderRadius: 2
                  }}
                >
                  <Badge badgeContent={taskStats.overdue} color="error">
                    <Typography variant="h5">{taskStats.highPriority}</Typography>
                  </Badge>
                  <Typography variant="body2">דחופות</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Filter options */}
        <Collapse in={showFilters}>
          <Box sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>סטטוס</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="סטטוס"
                  >
                    <MenuItem value="all">הכל</MenuItem>
                    <MenuItem value="pending">ממתינות</MenuItem>
                    <MenuItem value="completed">הושלמו</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>עדיפות</InputLabel>
                  <Select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    label="עדיפות"
                  >
                    <MenuItem value="all">הכל</MenuItem>
                    <MenuItem value="high">גבוהה</MenuItem>
                    <MenuItem value="medium">בינונית</MenuItem>
                    <MenuItem value="low">נמוכה</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>קטגוריה</InputLabel>
                  <Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    label="קטגוריה"
                  >
                    <MenuItem value="all">הכל</MenuItem>
                    <MenuItem value="medical">רפואי</MenuItem>
                    <MenuItem value="training">אימון</MenuItem>
                    <MenuItem value="meeting">פגישה</MenuItem>
                    <MenuItem value="referral">הפניה</MenuItem>
                    <MenuItem value="general">כללי</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
        
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Task list */}
        {loading && filteredTasks.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredTasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <AssignmentIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              אין משימות להצגה
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddTask}
              sx={{ mt: 2 }}
            >
              הוסף משימה חדשה
            </Button>
          </Box>
        ) : (
          <List 
            sx={{ 
              maxHeight: maxHeight, 
              overflowY: maxHeight ? 'auto' : 'visible',
              pr: 1
            }}
          >
            {filteredTasks.map((task) => (
              <ListItem
                key={task.id}
                disablePadding
                sx={{
                  mb: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  ...(task.completed ? {
                    opacity: 0.7,
                  } : {}),
                  ...(isOverdue(task) ? {
                    borderLeft: '4px solid',
                    borderLeftColor: 'error.main',
                  } : {}),
                }}
              >
                <Box sx={{ display: 'flex', width: '100%', p: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Checkbox
                      edge="start"
                      checked={task.completed}
                      icon={<UncheckedIcon />}
                      checkedIcon={<CheckIcon />}
                      onChange={() => handleToggleComplete(task.id)}
                      sx={{ color: getPriorityColor(task.priority) + '.main' }}
                    />
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: task.completed ? 'normal' : 'medium',
                            textDecoration: task.completed ? 'line-through' : 'none',
                          }}
                        >
                          {task.title}
                        </Typography>
                        
                        {isOverdue(task) && !task.completed && (
                          <Chip
                            label="באיחור"
                            color="error"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        {task.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              textDecoration: task.completed ? 'line-through' : 'none',
                              mb: 0.5,
                            }}
                          >
                            {task.description}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Chip
                            icon={getCategoryIcon(task.category)}
                            label={getCategoryLabel(task.category)}
                            size="small"
                            variant="outlined"
                          />
                          
                          <Chip
                            label={getPriorityLabel(task.priority)}
                            size="small"
                            color={getPriorityColor(task.priority)}
                          />
                          
                          {task.due_date && (
                            <Chip
                              icon={<AccessTimeIcon fontSize="small" />}
                              label={formatDate(task.due_date)}
                              size="small"
                              variant="outlined"
                              color={isOverdue(task) && !task.completed ? "error" : "default"}
                            />
                          )}
                          
                          {task.related_soldier && (
                            <Chip
                              icon={<PersonOutlineIcon fontSize="small" />}
                              label={task.related_soldier}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="ערוך">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleEditTask(task)}
                          sx={{ mr: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="מחק">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleDeleteClick(task.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      
      {/* Floating button in standalone mode */}
      {standalone && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleAddTask}
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
          }}
        >
          <AddIcon />
        </Fab>
      )}
      
      {/* Add/Edit form */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingTask ? 'עריכת משימה' : 'הוספת משימה חדשה'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="כותרת המשימה"
                fullWidth
                required
                value={formData.title}
                onChange={handleFormChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="תיאור"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={handleFormChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>קטגוריה</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  label="קטגוריה"
                >
                  <MenuItem value="general">כללי</MenuItem>
                  <MenuItem value="medical">רפואי</MenuItem>
                  <MenuItem value="training">אימון</MenuItem>
                  <MenuItem value="meeting">פגישה</MenuItem>
                  <MenuItem value="referral">הפניה</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>עדיפות</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleFormChange}
                  label="עדיפות"
                >
                  <MenuItem value="low">נמוכה</MenuItem>
                  <MenuItem value="medium">בינונית</MenuItem>
                  <MenuItem value="high">גבוהה</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="due_date"
                label="תאריך יעד"
                type="date"
                fullWidth
                value={formData.due_date}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="related_soldier"
                label="חייל קשור"
                fullWidth
                value={formData.related_soldier}
                onChange={handleFormChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="completed"
                    checked={formData.completed}
                    onChange={handleFormChange}
                  />
                }
                label="משימה הושלמה"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>
            ביטול
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveTask}
            disabled={!formData.title}
          >
            {editingTask ? 'עדכן' : 'הוסף'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* דיאלוג מחיקה */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>מחיקת משימה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את המשימה הזו?
            פעולה זו אינה ניתנת לביטול.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            ביטול
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskManager;