import React, { useState, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Button,
  useTheme,
  useMediaQuery,
  Tooltip,
  Badge,
  Chip,
  Paper,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarTodayIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { ColorModeContext } from '../App';

const drawerWidth = 260;

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // פונקציית פתיחה/סגירת תפריט
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // סגירת התפריט במובייל בעת ניווט
  const handleCloseDrawer = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  // ניווט ולחיצה שמבצעת גם סגירה של התפריט
  const handleNavigate = (path, state) => {
    navigate(path, state ? { state } : undefined);
    handleCloseDrawer();
  };
  
  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };
  
  const navItems = [
    { text: 'לוח בקרה', path: '/', icon: <DashboardIcon />, notification: null },
    { text: 'הפניות רפואיות', path: '/referrals', icon: <MedicalServicesIcon />, notification: null },
    { text: 'הוספת הפניה', path: '/referrals', state: { openForm: true }, icon: <AddIcon />, notification: null },
    { text: 'תורים להיום', path: '/referrals', state: { todayAppointments: true }, icon: <CalendarTodayIcon />, notification: 3 },
  ];
  
  // פריטי ניווט למנהלים בלבד
  const adminNavItems = [
    { text: 'ניהול משתמשים', path: '/users', icon: <PeopleIcon />, notification: null },
    { text: 'תיעוד פעולות', path: '/audit-logs', icon: <HistoryIcon />, notification: null },
  ];
  
  // פריטי ניווט למנהלי מערכת בלבד
  const superAdminNavItems = [
    { text: 'הגדרות מערכת', path: '/settings', icon: <SettingsIcon />, notification: null },
  ];
  
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'admin' || user?.role === 'manager';
  
  // הרכיב שמייצג את תפריט הצד (Drawer)
  const drawer = (
    <div>
      {/* כותרת התפריט עם כפתור סגירה במובייל */}
      <Toolbar 
        sx={{ 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 1.5,
          backgroundColor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.primary.main, 0.15)
            : alpha(theme.palette.primary.main, 0.05)
        }}
      >
        <Typography variant="h6" component="div" sx={{ 
          fontWeight: 'bold',
          color: theme.palette.primary.main,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <LocalHospitalIcon color="primary" />
          מערכת הפניות רפואיות
        </Typography>
        
        {isMobile && (
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={handleCloseDrawer}
            aria-label="סגור תפריט"
          >
            <CloseIcon />
          </IconButton>
        )}
      </Toolbar>
      
      {/* פרטי המשתמש */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, 0.3)
            : alpha(theme.palette.background.paper, 0.5),
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Avatar
          src={user?.profile_image}
          alt={user?.full_name}
          sx={{ 
            width: 64, 
            height: 64,
            mb: 1,
            border: `2px solid ${theme.palette.primary.main}`,
          }}
        >
          {user?.full_name?.charAt(0) || 'U'}
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600}>
          {user?.full_name}
        </Typography>
        <Chip 
          label={user?.role === 'admin' ? 'מנהל מערכת' : user?.role === 'manager' ? 'מנהל' : 'משתמש'} 
          size="small"
          color={user?.role === 'admin' ? 'primary' : user?.role === 'manager' ? 'secondary' : 'default'}
          sx={{ mt: 0.5 }}
        />
      </Box>
      
      {/* תפריט ניווט ראשי */}
      <List sx={{ pt: 1, pb: isMobile ? 10 : 0 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path && !item.state}
              onClick={() => handleNavigate(item.path, item.state)}
              sx={{
                borderRadius: '0 20px 20px 0',
                mr: 1,
                transition: 'all 0.2s',
                position: 'relative',
                '&.Mui-selected': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.primary.main, 0.1),
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.primary.main, 0.3)
                      : alpha(theme.palette.primary.main, 0.2),
                  }
                },
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.1)
                    : alpha(theme.palette.background.paper, 0.8),
                }
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 40,
                  color: location.pathname === item.path && !item.state ? theme.palette.primary.main : 'inherit' 
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography 
                    variant="body2" 
                    fontWeight={location.pathname === item.path && !item.state ? 600 : 400}
                  >
                    {item.text}
                  </Typography>
                } 
              />
              {location.pathname === item.path && !item.state && (
                <KeyboardArrowRightIcon 
                  fontSize="small" 
                  sx={{ color: theme.palette.primary.main }}
                />
              )}
              {item.notification && (
                <Badge 
                  badgeContent={item.notification} 
                  color="error" 
                  sx={{ ml: 1 }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {isManager && (
        <>
          <Divider sx={{ my: 2, mx: 2 }} />
          <Typography variant="overline" sx={{ px: 3, color: theme.palette.text.secondary }}>
            הגדרות ניהול
          </Typography>
          <List>
            {adminNavItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: '0 20px 20px 0',
                    mr: 1,
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.secondary.main, 0.2)
                        : alpha(theme.palette.secondary.main, 0.1),
                      borderLeft: `4px solid ${theme.palette.secondary.main}`,
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.secondary.main, 0.3)
                          : alpha(theme.palette.secondary.main, 0.2),
                      }
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 40,
                      color: location.pathname === item.path ? theme.palette.secondary.main : 'inherit' 
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography 
                        variant="body2" 
                        fontWeight={location.pathname === item.path ? 600 : 400}
                      >
                        {item.text}
                      </Typography>
                    }
                  />
                  {location.pathname === item.path && (
                    <KeyboardArrowRightIcon 
                      fontSize="small" 
                      sx={{ color: theme.palette.secondary.main }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
      
      {isAdmin && (
        <>
          <Divider sx={{ my: 2, mx: 2 }} />
          <Typography variant="overline" sx={{ px: 3, color: theme.palette.text.secondary }}>
            ניהול מערכת
          </Typography>
          <List>
            {superAdminNavItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: '0 20px 20px 0',
                    mr: 1,
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.warning.main, 0.2)
                        : alpha(theme.palette.warning.main, 0.1),
                      borderLeft: `4px solid ${theme.palette.warning.main}`,
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.warning.main, 0.3)
                          : alpha(theme.palette.warning.main, 0.2),
                      }
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 40,
                      color: location.pathname === item.path ? theme.palette.warning.main : 'inherit' 
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography 
                        variant="body2" 
                        fontWeight={location.pathname === item.path ? 600 : 400}
                      >
                        {item.text}
                      </Typography>
                    }
                  />
                  {location.pathname === item.path && (
                    <KeyboardArrowRightIcon 
                      fontSize="small" 
                      sx={{ color: theme.palette.warning.main }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
      
      {/* כפתור התנתקות בתחתית התפריט */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 0, 
        width: drawerWidth, 
        p: 2, 
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        zIndex: 1
      }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          sx={{ justifyContent: 'flex-start', py: 1 }}
        >
          התנתקות
        </Button>
      </Box>
    </div>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* AppBar עם מרווחי צד ימין (במקום שמאל) בהתאם למיקום התפריט */}
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mr: { md: `${drawerWidth}px` },
          backgroundColor: theme.palette.mode === 'dark' 
            ? theme.palette.background.default 
            : theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(20px)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div" fontWeight={600} color="primary">
            {location.pathname === '/' && 'לוח בקרה'}
            {location.pathname === '/referrals' && 'הפניות רפואיות'}
            {location.pathname.includes('/referrals/') && location.pathname !== '/referrals/new' && 'פרטי הפניה'}
            {location.pathname === '/users' && 'ניהול משתמשים'}
            {location.pathname === '/audit-logs' && 'תיעוד פעולות'}
            {location.pathname === '/settings' && 'הגדרות מערכת'}
            {location.pathname === '/profile' && 'פרופיל משתמש'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* כפתור פתיחת תפריט במובייל – מיקום בצד ימין */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="פתח תפריט"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Tooltip title="התראות">
              <IconButton color="inherit" sx={{ mr: 1 }}>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title={theme.palette.mode === 'dark' ? 'מצב יום' : 'מצב לילה'}>
              <IconButton onClick={colorMode.toggleColorMode} color="inherit" sx={{ mr: 1 }}>
                {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            {/* פרופיל משתמש */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{ 
                  textTransform: 'none',
                  borderRadius: '20px',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.05),
                  }
                }}
                startIcon={
                  <Avatar
                    alt={user?.full_name}
                    src={user?.profile_image}
                    sx={{ width: 32, height: 32 }}
                  >
                    {user?.full_name?.charAt(0) || 'U'}
                  </Avatar>
                }
              >
                {!isMobile && (
                  <Box sx={{ textAlign: 'right', mr: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.full_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.role === 'admin' ? 'מנהל מערכת' : user?.role === 'manager' ? 'מנהל' : 'משתמש'}
                    </Typography>
                  </Box>
                )}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                sx={{ mt: 1 }}
                PaperProps={{
                  elevation: 2,
                  sx: { borderRadius: 2, minWidth: 180 }
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    מחובר כ
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {user?.full_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>פרופיל אישי</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>הגדרות</ListItemText>
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText primaryTypographyProps={{ color: 'error' }}>התנתקות</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* תפריט ניווט צדדי – מוגדר להיות מימין */}
      <Box
        component="nav"
        sx={{ 
          width: { md: drawerWidth }, 
          flexShrink: { md: 0 }
        }}
        aria-label="תפריט ניווט"
      >
        {/* תפריט מובייל */}
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleCloseDrawer}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              left: 'auto'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* תפריט למסכים גדולים */}
        <Drawer
          variant="permanent"
          anchor="right"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderLeft: 'none',
              left: 'auto',
              backgroundImage: theme.palette.mode === 'dark' 
                ? 'linear-gradient(to bottom, rgba(10, 10, 10, 0.8), rgba(0, 0, 0, 0.9))'
                : 'linear-gradient(to bottom, rgba(250, 250, 253, 0.8), rgba(244, 245, 250, 0.9))',
              boxShadow: theme.palette.mode === 'dark' 
                ? '-1px 0 10px rgba(0, 0, 0, 0.2)'
                : '-1px 0 10px rgba(0, 0, 0, 0.05)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* תוכן ראשי */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3 },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          transition: 'all 0.3s',
          backgroundColor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.default, 0.9)
            : alpha(theme.palette.background.default, 0.8),
        }}
      >
        <Toolbar />
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.5)
              : alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(10px)',
            minHeight: 'calc(100vh - 110px)',
          }}
        >
          <Outlet />
        </Paper>
      </Box>
    </Box>
  );
};

export default Layout;
