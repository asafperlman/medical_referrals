# מערכת לניהול הפניות רפואיות

מערכת Web מתקדמת לניהול ועדכון הפניות רפואיות, מבוססת על פיתוח Full Stack עם Django ו-React. המערכת מאפשרת צפייה, עריכה, ניהול ועדכון סטטוסים בצורה מאובטחת, נגישה ואסתטית.

## תכונות עיקריות

- ניהול הפניות רפואיות (יצירה, עריכה, מחיקה)
- מעקב אחר סטטוס הפניות
- ניהול תורים רפואיים
- לוח בקרה אנליטי עם נתונים סטטיסטיים
- ניהול משתמשים והרשאות
- תיעוד פעולות (Audit Log)
- מערכת אימות וניהול הרשאות מבוססת JWT
- תמיכה מלאה בשפה העברית ובכיוון RTL
- מודול תרגולים רפואיים (חסמי עורקים, תרגולי חובשים, תרגולי צוות)

## ארכיטקטורת המערכת

המערכת בנויה בגישת REST API, עם הפרדה מלאה בין שרת Backend (Django) לבין ממשק המשתמש Frontend (React). מבנה זה מאפשר גמישות בפיתוח, תחזוקה נוחה וביצועים אופטימליים.

### Backend - Django

- **מודל MVC**: שימוש בארכיטקטורת Model-View-Controller
- **ORM**: שימוש במערכת ORM של Django לניהול מודלי נתונים
- **REST API**: שימוש ב-Django REST Framework ליצירת ממשק API מקיף

### Frontend - React

- **Component-based**: ארכיטקטורה מבוססת רכיבים
- **State Management**: ניהול מצב אפליקציה באמצעות React Context API
- **Material Design**: שימוש בספריית Material-UI לעיצוב אחיד וחווית משתמש נוחה

## טכנולוגיות

### Backend (Django)
- Python 3.10+
- Django 4.2+
- Django REST Framework
- PostgreSQL
- JWT Authentication
- Django CORS Headers

### Frontend (React)
- React 18
- Material UI 5
- React Router 6
- Chart.js / React-Chartjs-2
- Axios
- Context API

## ארכיטקטורה

המערכת בנויה בארכיטקטורת MVC עם REST API:

```
medical-referrals/
├── backend/                  # פרויקט Django
│   ├── config/               # הגדרות Django
│   ├── accounts/             # ניהול משתמשים
│   ├── referrals/            # ניהול הפניות רפואיות
│   ├── audit/                # תיעוד פעולות
│   ├── api/                  # ממשק REST API
│   └── requirements.txt      # תלויות Python
│
├── frontend/                 # אפליקציית React
│   ├── public/               # נכסים סטטיים
│   └── src/                  # קוד מקור React
│       ├── components/       # רכיבי UI לשימוש חוזר
│       ├── pages/            # דפי האפליקציה
│       ├── services/         # שירותי API
│       ├── context/          # ספקי Context
│       └── assets/           # נכסים גרפיים
```

## API Endpoints ראשיים

```
# אימות
POST /api/auth/login/
POST /api/auth/refresh/

# משתמשים
GET /api/users/
POST /api/users/
GET /api/users/{id}/
PUT /api/users/{id}/
DELETE /api/users/{id}/

# הפניות רפואיות
GET /api/referrals/
POST /api/referrals/
GET /api/referrals/{id}/
PUT /api/referrals/{id}/
DELETE /api/referrals/{id}/

# מסמכים
POST /api/referrals/{id}/add_document/
GET /api/referrals/{id}/documents/

# דוחות וסטטיסטיקות
GET /api/dashboard/stats/
GET /api/referrals/by-team/
GET /api/referrals/by-status/
```

## מודולים עיקריים בתיקיית `pages`

### AuditLogs.js
```jsx
// מודול תיעוד פעולות המערכת
function AuditLogs() {
  // מנהל מצב לאובייקטי תיעוד, פילטרים וטעינה
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ /* ... */ });
  
  // פונקציות מרכזיות
  const fetchLogs = async () => { /* ... */ };
  const handleFilterChange = (name, value) => { /* ... */ };
  const handleSearch = () => { /* ... */ };
  const handleClearFilters = () => { /* ... */ };
  const handleOpenDetails = (log) => { /* ... */ };
  
  // פיצ'רים:
  // 1. טבלת תיעוד פעולות עם מיון ודפדוף
  // 2. פילטור מתקדם לפי סוג פעולה, משתמש, תאריכים
  // 3. צפייה בפרטי שינויים (ערכים ישנים וחדשים)
  // 4. פורמט JSON לתצוגה נוחה
  
  // נקודות ממשק:
  // - AuthContext (אימות בקשות)
  // - API: GET /api/audit-logs/
}
```

### Dashboard.js
```jsx
// מודול לוח הבקרה המרכזי
function Dashboard() {
  // מצבים לנתונים, טאבים וסינון
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [filterTeam, setFilterTeam] = useState('all');
  
  // פונקציות למשיכת נתונים ואירועים
  const fetchDashboardData = useCallback(async () => { /* ... */ }, [api]);
  const handleTabChange = (event, newValue) => { /* ... */ };
  const handleTeamFilterChange = (event) => { /* ... */ };
  
  // פונקציות עזר לעיבוד נתונים
  const getStatusChartData = () => { /* ... */ };
  const getPriorityChartData = () => { /* ... */ };
  const getMonthlyChartData = () => { /* ... */ };
  
  // רנדור תתי-רכיבים לפי טאב
  const renderOverviewTab = () => { /* ... */ };
  const renderAppointmentsTab = () => { /* ... */ };
  const renderTasksTab = () => { /* ... */ };
  const renderAnalyticsTab = () => { /* ... */ };
  
  // נקודות ממשק:
  // - Chart.js לגרפים
  // - API: GET /api/dashboard/stats/, GET /api/referrals/ (עם פרמטרים)
  // - ניווט ל-/referrals עם פרמטרים
  // - TaskManager כרכיב משנה
}
```

### DoctorVisits.js
```jsx
// מודול ניהול ביקורי רופא
function DoctorVisits() {
  // מצבי נתונים וממשק משתמש
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    is_documented: '',
  });
  const [formData, setFormData] = useState({ /* ... */ });
  
  // פונקציות CRUD
  const fetchVisits = useCallback(async () => { /* ... */ }, [/* ... */]);
  const handleSaveVisit = async () => { /* ... */ };
  const handleConfirmDelete = async () => { /* ... */ };
  
  // פונקציות טיפול בטפסים
  const handleFormChange = (e) => { /* ... */ };
  const validateForm = () => { /* ... */ };
  
  // פונקציות ייעודיות
  const copyPendingVisitsToWhatsApp = () => { /* ... */ };
  const copySingleVisitToWhatsApp = (visit) => { /* ... */ };
  
  // נקודות ממשק:
  // - API: GET/POST/PUT/DELETE /api/doctor-visits/
  // - Navigator Clipboard API ליצוא לווטסאפ
}
```

### Login.js
```jsx
// מסך התחברות למערכת
function Login() {
  // מצב טופס והתחברות
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // טיפול בהתחברות
  const handleSubmit = async (e) => {
    e.preventDefault();
    // ולידציה, שליחת בקשת התחברות וטיפול בתוצאות
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // נקודות ממשק:
  // - AuthContext: login()
  // - ניווט לדף הבית אחרי התחברות מוצלחת
}
```

### NotFound.js
```jsx
// דף שגיאה 404
function NotFound() {
  const navigate = useNavigate();
  
  // נקודות ממשק:
  // - React Router: ניווט חזרה לדף הבית
}
```

### Profile.js
```jsx
// דף פרופיל משתמש
function Profile() {
  // מצבי נתונים וטפסים
  const { api, user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState({ /* ... */ });
  const [editMode, setEditMode] = useState(false);
  const [passwordData, setPasswordData] = useState({ /* ... */ });
  const [formErrors, setFormErrors] = useState({});
  
  // טיפול בעדכון פרופיל
  const handleProfileChange = (e) => { /* ... */ };
  const handleSaveProfile = async () => { /* ... */ };
  const handleCancelEdit = () => { /* ... */ };
  
  // טיפול בשינוי סיסמה
  const handlePasswordChange = (e) => { /* ... */ };
  const handleSavePassword = async () => { /* ... */ };
  
  // טיפול בתמונת פרופיל
  const handleImageUpload = async (e) => { /* ... */ };
  
  // פונקציות עזר
  const getRoleName = (role) => { /* ... */ };
  const getRoleColor = (role) => { /* ... */ };
  
  // נקודות ממשק:
  // - AuthContext: קבלת פרטי משתמש
  // - API: PUT /api/users/{id}/, POST /api/users/{id}/change_password/
}
```

### ReferralDetail.js
```jsx
// דף פרטי הפניה
function ReferralDetail() {
  // מצבי נתונים
  const { id } = useParams();
  const [referral, setReferral] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  
  // פונקציות לטעינת נתונים
  const fetchReferralData = useCallback(async () => { /* ... */ }, [api, id]);
  
  // פונקציות CRUD
  const handleUpdateReferral = async (referralData) => { /* ... */ };
  const handleDelete = async () => { /* ... */ };
  
  // פונקציות לניהול מסמכים
  const handleSaveDocument = async () => { /* ... */ };
  const handleDeleteDocument = async () => { /* ... */ };
  const handleDownloadDocument = async (document) => { /* ... */ };
  
  // פונקציות עזר ותרגום
  const formatDateTime = (dateString) => { /* ... */ };
  const formatDate = (dateString) => { /* ... */ };
  
  // נקודות ממשק:
  // - API: GET/PUT/DELETE /api/referrals/{id}/
  // - API: GET/POST/DELETE /api/referrals/{id}/documents/
  // - ReferralForm לעריכת הפניה
}
```

### ReferralsPage.js
```jsx
// דף ניהול הפניות הראשי
function ReferralsPage() {
  // מצבי נתונים וממשק משתמש
  const [referrals, setReferrals] = useState([]);
  const [currentView, setCurrentView] = useState('list');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ /* ... */ });
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // פונקציות לטעינת נתונים
  const fetchReferrals = useCallback(async () => { /* ... */ }, [/* ... */]);
  
  // פונקציות לעיבוד נתונים  
  const calculateStats = useCallback((refs, total) => { /* ... */ }, [/* ... */]);
  const organizeReferrals = useCallback((refs) => { /* ... */ }, []);
  
  // פונקציות לסינון וחיפוש
  const handleSearch = () => { /* ... */ };
  const handleClearFilters = () => { /* ... */ };
  const handleSort = (field) => { /* ... */ };
  
  // פונקציות CRUD
  const handleAddReferral = () => { /* ... */ };
  const handleEditReferral = (referral) => { /* ... */ };
  const handleSaveReferral = async (referralData) => { /* ... */ };
  const handleConfirmDelete = async () => { /* ... */ };
  
  // פונקציות לייצוא נתונים
  const handleExportCsv = async () => { /* ... */ };
  const handleCopyTable = () => { /* ... */ };
  
  // פונקציות רנדור לתצוגות שונות
  const renderReferralsTable = (referralsToShow = referrals, showPagination = true) => { /* ... */ };
  const renderReferralsByType = () => { /* ... */ };
  const renderReferralsByTeam = () => { /* ... */ };
  const renderReferralsByStatus = () => { /* ... */ };
  const renderStatsDashboard = () => { /* ... */ };
  
  // נקודות ממשק:
  // - API: GET/POST/PUT/DELETE /api/referrals/
  // - ReferralForm לעריכה ויצירה
  // - recharts לגרפים סטטיסטיים
}
```

### SystemSettings.js
```jsx
// דף ניהול הגדרות מערכת
function SystemSettings() {
  // מצבי נתונים
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  
  // פונקציות CRUD
  const fetchSettings = useCallback(async () => { /* ... */ }, [api]);
  const handleSaveSetting = async () => { /* ... */ };
  const handleConfirmDelete = async () => { /* ... */ };
  
  // פונקציות לטיפול בטופס
  const handleAddSetting = () => { /* ... */ };
  const handleEditSetting = (setting) => { /* ... */ };
  const handleFormChange = (e) => { /* ... */ };
  
  // פונקציות עזר
  const getValueType = (value) => { /* ... */ };
  const renderValue = (value) => { /* ... */ };
  
  // נקודות ממשק:
  // - API: GET/POST/PUT/DELETE /api/settings/
}
```

### TrainingManagement.js
```jsx
// דף ניהול תרגולים ואימונים רפואיים
function TrainingManagement() {
  // מצבי נתונים וממשק משתמש
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // טיפול בהחלפת טאבים
  const handleTabChange = (event, newValue) => { /* ... */ };
  
  // תתי-רכיבים
  const TeamTraining = ({ showNotification }) => { /* ... */ };
  const TourniquetTraining = ({ showNotification }) => { /* ... */ };
  const MedicsTraining = ({ showNotification }) => { /* ... */ };
  const TrainingAnalysis = ({ showNotification }) => { /* ... */ };
  
  // נקודות ממשק:
  // - API: /api/trainings/* (לתרגולי צוות, מחצ"ים וחובשים)
}
```

### UserManagement.js
```jsx
// דף ניהול משתמשים
function UserManagement() {
  // מצבי נתונים וטפסים
  const { api, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ /* ... */ });
  const [formErrors, setFormErrors] = useState({});
  
  // פונקציות לטעינת נתונים
  const fetchUsers = async () => { /* ... */ };
  
  // פונקציות חיפוש
  const handleSearch = () => { /* ... */ };
  const handleClearSearch = () => { /* ... */ };
  
  // פונקציות CRUD
  const handleAddUser = () => { /* ... */ };
  const handleEditUser = (user) => { /* ... */ };
  const handleSaveUser = async () => { /* ... */ };
  const handleConfirmDelete = async () => { /* ... */ };
  
  // פונקציות לשינוי סיסמה
  const handleChangePassword = (user) => { /* ... */ };
  const handleSavePassword = async () => { /* ... */ };
  
  // פונקציות ולידציה
  const validateForm = (isPasswordChange = false) => { /* ... */ };
  
  // פונקציות עזר ותרגום
  const getRoleName = (role) => { /* ... */ };
  const getRoleColor = (role) => { /* ... */ };
  
  // נקודות ממשק:
  // - API: GET/POST/PUT/DELETE /api/users/
  // - API: POST /api/users/{id}/change_password/
  // - AuthContext: לקבלת המשתמש הנוכחי
}
```

## מבנה מערכת ה-Context

המערכת משתמשת ב-React Context API לניהול המצב הגלובלי של האפליקציה:

### AuthContext

```jsx
// ניהול אימות משתמש, טוקנים ובקשות API
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = axios.create({ /* ... */ });
  
  // פונקציות ניהול אימות
  const login = async (email, password) => { /* ... */ };
  const logout = () => { /* ... */ };
  const refreshToken = async () => { /* ... */ };
  
  // מקשר interceptors ל-Axios
  useEffect(() => {
    // interceptors.request - הוספת טוקן לכל בקשה
    // interceptors.response - טיפול ברענון טוקן בפקיעת תוקף
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, login, logout, api, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### ReferralsContext

```jsx
// ניהול מצב הפניות
const ReferralsProvider = ({ children }) => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ /* ... */ });
  
  // פונקציות ניהול הפניות
  const fetchReferrals = async (params) => { /* ... */ };
  const createReferral = async (data) => { /* ... */ };
  const updateReferral = async (id, data) => { /* ... */ };
  const deleteReferral = async (id) => { /* ... */ };
  
  return (
    <ReferralsContext.Provider value={{ 
      referrals, loading, filters, setFilters, 
      fetchReferrals, createReferral, updateReferral, deleteReferral 
    }}>
      {children}
    </ReferralsContext.Provider>
  );
};
```

### DashboardContext

```jsx
// ניהול מצב לוח המחוונים
const DashboardProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // פונקציות לקבלת נתוני לוח מחוונים
  const refreshStats = async () => { /* ... */ };
  
  return (
    <DashboardContext.Provider value={{ 
      stats, refreshStats, loading
    }}>
      {children}
    </DashboardContext.Provider>
  );
};
```

### UIContext

```jsx
// ניהול ממשק משתמש כללי
const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  
  // פונקציות לניהול ממשק משתמש
  const showNotification = (message, type) => { /* ... */ };
  
  return (
    <UIContext.Provider value={{ 
      sidebarOpen, setSidebarOpen, notifications, showNotification
    }}>
      {children}
    </UIContext.Provider>
  );
};
```

## פרטי ממשק המשתמש

### מערכת RTL ותמיכה בעברית

האפליקציה תומכת באופן מלא בשפה העברית ובכיוון RTL. הדבר מושג באמצעות:

- הגדרת `direction: 'rtl'` בקונפיגורציית התמה
- שימוש ב-`rtlCache` מבוסס `@emotion/cache` עם `stylis-plugin-rtl`
- גופנים מותאמים לעברית: Assistant ו-Rubik

### תמיכה במצב לילה (Dark Mode)

האפליקציה תומכת במצב יום/לילה (Dark Mode) באמצעות:

- שימוש ב-`ColorModeContext` לשמירת המצב
- הגדרות צבעים נפרדות למצבי יום ולילה
- אפשרות למשתמש לשנות את המצב דרך כפתור בממשק

### מערכת הרשאות

המערכת מגדירה 4 רמות הרשאה:
- `admin` - מנהל מערכת עם הרשאות מלאות
- `manager` - מנהל עם הרשאות נוספות
- `user` - משתמש רגיל
- `viewer` - צופה בלבד

לכל רמת הרשאה מוגדרים דפים וזכויות ייחודיות.

## פירוט מבנה קבצים - Frontend

### קבצי הגדרות

- `frontend/.env` - משתני סביבה של האפליקציה, כולל כתובת ה-API
- `frontend/package.json` - הגדרות פרויקט NPM, תלויות וסקריפטים
- `frontend/public/*` - קבצים סטטיים הנגישים ישירות לדפדפן

### קבצי מקור מרכזיים

- `frontend/src/index.js` - נקודת הכניסה לאפליקציה, מרנדר את האפליקציה ומגדיר טעינת גופנים
- `frontend/src/App.js` - רכיב הראשי, מגדיר ניתובים, תמה, וקונטקסט האפליקציה
- `frontend/src/index.css` - סגנונות CSS גלובליים, כולל תמיכה ב-RTL

### שירותים וקונטקסטים

- `frontend/src/context/AuthContext.js` - ניהול מצב ההרשאות והאימות במערכת, כולל JWT
- `frontend/src/services/apiService.js` - מעטפת ל-Axios לביצוע פניות ל-API וניהול שגיאות
- `frontend/src/services/api.js` - מימוש אלטרנטיבי של השירות API

### תיקיית Components

#### רכיבי Layout וניווט

- `frontend/src/components/Layout.js` - רכיב Layout ראשי עם תפריט צד ותפריט עליון
- `frontend/src/components/LoadingScreen.js` - מסך טעינה להצגה במהלך פעולות אסינכרוניות

#### רכיבי הפניות וטפסים

- `frontend/src/components/ReferralForm.js` - טופס יצירה/עריכה של הפניה רפואית
- `frontend/src/components/PatientAutocomplete.js` - רכיב בחירת מטופל עם השלמה אוטומטית

#### רכיבי תרגולים ואימונים

- `frontend/src/components/MedicsTraining.js` - ניהול תרגולי חובשים
- `frontend/src/components/TeamTraining.js` - ניהול תרגולי צוות
- `frontend/src/components/TourniquetTraining.js` - ניהול תרגולי חסמי עורקים

#### רכיבי לוח בקרה

- `frontend/src/components/dashboard/StatisticsOverview.js` - מציג סטטיסטיקה כללית בלוח הבקרה
- `frontend/src/components/dashboard/UrgentReferralsCard.jsx` - רכיב המציג הפניות דחופות
- `frontend/src/components/dashboard/WeeklyAppointmentsCard.jsx` - רכיב המציג תורים שבועיים
- `frontend/src/components/dashboard/CoordinationNeededCard.jsx` - רכיב המציג הפניות דורשות תיאום
- `frontend/src/components/dashboard/ReferralsByStatus.jsx` - ניתוח הפניות לפי סטטוס
- `frontend/src/components/dashboard/ReferralsByTeam.jsx` - ניתוח הפניות לפי צוות
- `frontend/src/components/dashboard/LongWaitingReferrals.jsx` - הפניות בהמתנה ארוכה
- `frontend/src/components/TaskManager.js` - רכיב לניהול משימות

### תיקיות נוספות

- `frontend/src/data/` - קבצי נתונים סטטיים כמו רשימת מטופלים
- `frontend/src/utils/` - פונקציות עזר שימושיות ושירותים משותפים לכל האפליקציה
  - `frontend/src/utils/helpers.js` - פונקציות עזר לפורמוט תאריכים, טקסט, וכו'
  - `frontend/src/utils/rtlCache.js` - הגדרות תמיכה בכיוון RTL

## API Services בצד Frontend

כל הפונקציות הבאות מוגדרות בתיקיית `src/api/` ומנגישות את ה-API של הבאקאנד:

#### auth.js - ניהול אימות
- `login(email, password)`: התחברות למערכת וקבלת טוקן JWT
- `logout()`: התנתקות מהמערכת וניקוי טוקנים
- `refreshToken()`: רענון טוקן JWT
- `getCurrentUser()`: קבלת פרטי המשתמש המחובר
- `isAuthenticated()`: בדיקה האם המשתמש מחובר
- `hasPermission(permission)`: בדיקה האם למשתמש יש הרשאה מסוימת

#### referrals.js - ניהול הפניות
- `getReferrals(filters)`: קבלת רשימת הפניות עם אפשרות לסינון
- `getReferral(id)`: קבלת פרטי הפניה לפי מזהה
- `createReferral(data)`: יצירת הפניה חדשה
- `updateReferral(id, data)`: עדכון הפניה קיימת
- `deleteReferral(id)`: מחיקת הפניה
- `changeStatus(id, status)`: שינוי סטטוס הפניה
- `uploadDocument(referralId, file, title, description)`: העלאת מסמך להפניה
- `getDocuments(referralId)`: קבלת רשימת מסמכים של הפניה
- `getReferralsByTeam()`: קבלת הפניות מסודרות לפי צוות
- `getReferralsByStatus()`: קבלת הפניות מסודרות לפי סטטוס
- `getUrgentReferrals()`: קבלת הפניות דחופות
- `getUpcomingAppointments()`: קבלת תורים קרובים
- `getLongWaitingReferrals()`: קבלת הפניות הממתינות זמן רב

#### users.js - ניהול משתמשים
- `getUsers()`: קבלת רשימת משתמשים
- `getUser(id)`: קבלת פרטי משתמש לפי מזהה
- `createUser(data)`: יצירת משתמש חדש
- `updateUser(id, data)`: עדכון משתמש קיים
- `deleteUser(id)`: מחיקת משתמש
- `changePassword(id, oldPassword, newPassword)`: שינוי סיסמה

#### training.js - ניהול תרגולים
- `getSoldiers(filters)`: קבלת רשימת חיילים
- `getSoldier(id)`: קבלת פרטי חייל
- `getTourniquetTrainings(filters)`: קבלת רשימת תרגולי חסמי עורקים
- `createTourniquetTraining(data)`: יצירת תרגול חסם עורקים חדש
- `getSoldierStats(id)`: קבלת סטטיסטיקות של חייל
- `getMedics(filters)`: קבלת רשימת חובשים
- `getMedicTrainings(filters)`: קבלת רשימת תרגולי חובשים
- `getTeamTrainings(filters)`: קבלת רשימת תרגולי צוות
- `getTrainingStats()`: קבלת סטטיסטיקות תרגולים

#### dashboard.js - נתוני לוח מחוונים
- `getDashboardStats()`: קבלת כל הסטטיסטיקות של לוח המחוונים
- `getReferralStatsByStatus()`: סטטיסטיקות הפניות לפי סטטוס
- `getReferralStatsByPriority()`: סטטיסטיקות הפניות לפי עדיפות
- `getReferralStatsByTeam()`: סטטיסטיקות הפניות לפי צוות
- `getMonthlyStats()`: סטטיסטיקות חודשיות
- `getTodayReferrals()`: הפניות של היום
- `getUpcomingReferrals()`: הפניות הקרובות
- `getUrgentPendingReferrals()`: הפניות דחופות ממתינות

## פירוט מודולים עיקריים של Backend

### 1. מודול משתמשים (accounts)

מודול זה מנהל את המשתמשים, הרשאות ותהליכי האימות במערכת.

**קבצים מרכזיים**:
- **models.py**: 
  - מודל `User` - מחליף את מודל ברירת המחדל של Django
  - תומך באימות מבוסס אימייל במקום שם משתמש
  - תומך ב-4 רמות הרשאה: admin, manager, user, viewer
  - שדות: email, full_name, role, department, phone_number, profile_image

- **serializers.py** (בתוך api app):
  - `UserSerializer`: המרת מודל משתמש ל/מ-JSON
  - `UserCreateSerializer`: יצירת משתמש חדש כולל וידוא סיסמה
  - `ChangePasswordSerializer`: עדכון סיסמת משתמש

- **views.py** (בתוך api app):
  - `UserViewSet`: נקודות קצה לניהול משתמשים
  - `CustomTokenObtainPairView`: התחברות והנפקת טוקן JWT

### 2. מודול הפניות רפואיות (referrals)

מודול ליבה המנהל את ההפניות הרפואיות, התורים, והמסמכים המצורפים.

**קבצים מרכזיים**:
- **models.py**:
  - `Referral`: מודל הפניה רפואית 
    - שדות: full_name, personal_id, team, referral_type, status, priority, appointment_date וכו'
    - CHOICES: מגדיר ערכים קבועים לסטטוס, עדיפות, וסוגי הפניות
  - `ReferralDocument`: מודל מסמכים מצורפים להפניה
    - שדות: referral, file, title, description, uploaded_by וכו'

- **serializers.py** (בתוך api app):
  - `ReferralSerializer`: המרת מודל הפניה ל/מ-JSON
  - `ReferralListSerializer`: סריאלייזר מורחב לרשימת הפניות
  - `ReferralDocumentSerializer`: סריאלייזר למסמכים מצורפים

- **views.py** (בתוך api app):
  - `ReferralViewSet`: נקודות קצה לניהול הפניות
  - `ReferralDocumentViewSet`: ניהול מסמכים
  - ועוד views ייעודיים: `TeamReferralsView`, `StatusReferralsView`, `UrgentReferralsView`, וכו'

### 3. מודול תרגולים רפואיים (training)

מודול לניהול ותיעוד תרגולים רפואיים של סגל רפואי וחיילים.

**קבצים מרכזיים**:
- **models.py**:
  - `TeamTraining`: תרגולי צוות
  - `Soldier`: פרטי חיילים
  - `TourniquetTraining`: תרגולי חסמי עורקים לחיילים
  - `Medic`: פרטי חובשים
  - `MedicTraining`: תרגולי חובשים

- **serializers.py**:
  - סריאלייזרים עבור כל המודלים
  - סריאלייזרים לסטטיסטיקות וניתוח נתונים

- **views.py**:
  - ViewSets לכל המודלים
  - נקודות קצה לסטטיסטיקות ודוחות

### 4. מודול תיעוד פעולות (audit)

מודול המספק תיעוד מלא של כל הפעולות במערכת.

**קבצים מרכזיים**:
- **models.py**:
  - `AuditLog`: תיעוד פעולות מערכת (CRUD, התחברות, התנתקות)
  - `SystemSetting`: הגדרות מערכת גלובליות

- **middleware.py**:
  - `AuditLogMiddleware`: מידלוור הרושם כל פעולה חשובה במערכת
  - מחלץ נתונים מבקשות למטרות תיעוד

- **serializers.py** (בתוך api app):
  - `AuditLogSerializer`: המרת תיעוד ל/מ-JSON
  - `SystemSettingSerializer`: המרת הגדרות מערכת ל/מ-JSON

- **views.py** (בתוך api app):
  - `AuditLogViewSet`: צפייה בתיעוד פעולות
  - `SystemSettingViewSet`: ניהול הגדרות מערכת

### 5. מודול API (api)

מגדיר את כל נקודות הקצה ואת הממשק בין הלקוח לשרת.

**קבצים מרכזיים**:
- **urls.py**:
  - מגדיר את כל נקודות הקצה של המערכת
  - כולל URLs לאימות, לוח מחוונים, וניתוח נתונים

- **views.py**:
  - מכיל את כל ה-ViewSets וה-Views
  - `DashboardStatsView`: מספק סטטיסטיקות מפורטות ללוח מחוונים

- **serializers.py**:
  - מכיל את כל הסריאלייזרים
  - `DashboardStatsSerializer`: סריאלייזר לנתוני לוח המחוונים

- **permissions.py**:
  - הגדרת הרשאות מותאמות
  - `IsAdminOrManager`, `IsSelfOrAdminOrManager`, וכו'