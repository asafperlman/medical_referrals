# מערכת לניהול הפניות רפואיות
# מערכת לניהול הפניות רפואיות

מערכת Web מתקדמת לניהול ועדכון הפניות רפואיות, אשר מחליפה את טבלת Google Sheets הנוכחית. המערכת מאפשרת צפייה, עריכה, ניהול ועדכון סטטוסים בצורה מאובטחת, נגישה ואסתטית.

## תכונות עיקריות

- ניהול הפניות רפואיות (יצירה, עריכה, מחיקה)
- מעקב אחר סטטוס הפניות
- ניהול תורים רפואיים
- לוח בקרה אנליטי עם נתונים סטטיסטיים
- ניהול משתמשים והרשאות
- תיעוד פעולות (Audit Log)
- מערכת אימות וניהול הרשאות מבוססת JWT
- תמיכה מלאה בשפה העברית ובכיוון RTL

## טכנולוגיות

### צד שרת (Backend)

- Python 3.10+
- Django 4.2+
- Django REST Framework
- PostgreSQL
- JWT Authentication
- Django CORS Headers

### צד לקוח (Frontend)

- React 18
- Material UI 5
- React Router 6
- Chart.js / React-Chartjs-2
- Axios
- JWT Decode

## דרישות מערכת

- Python 3.10+
- Node.js 16+
- npm 8+
- PostgreSQL 13+

## התקנה והגדרה

### הגדרת סביבת פיתוח

1. קלונן את המאגר:

```bash
git clone https://github.com/your-username/medical-referrals.git
cd medical-referrals
```

### הגדרת Backend (Django)

1. צור והפעל סביבה וירטואלית:

```bash
python -m venv backend/venv
source backend/venv/bin/activate  # Linux/Mac
# או
backend\venv\Scripts\activate  # Windows
```

2. התקן את החבילות הנדרשות:

```bash
pip install -r backend/requirements.txt
```

3. צור את קובץ `.env` בתיקיית `backend` והגדר את המשתנים הבאים:

```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=medical_referrals
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

4. צור את בסיס הנתונים והרץ מיגרציות:

```bash
cd backend
python manage.py migrate
```

5. צור משתמש מנהל:

```bash
python manage.py createsuperuser
```

6. הרץ את השרת:

```bash
python manage.py runserver
```

השרת יפעל בכתובת `http://localhost:8000`.

### הגדרת Frontend (React)

1. התקן את חבילות ה-npm:

```bash
cd frontend
npm install
```

2. צור קובץ `.env` בתיקיית `frontend` והגדר את המשתנים הבאים:

```
REACT_APP_API_URL=http://localhost:8000/api
```

3. הרץ את יישום הפיתוח:

```bash
npm start
```

היישום יפעל בכתובת `http://localhost:3000`.

## פריסה לייצור

### Backend (Django)

1. הגדר את משתני הסביבה בהתאם לסביבת הייצור:

```
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DB_NAME=your_production_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
CORS_ALLOWED_ORIGINS=https://your-domain.com
```

2. הגדר את Gunicorn כשרת WSGI והשתמש ב-Nginx כפרוקסי הפוך.

### Frontend (React)

1. בנה את האפליקציה לייצור:

```bash
cd frontend
npm run build
```

2. העבר את התיקייה `build` לשרת הווב שלך.

## מבנה הפרויקט

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
│
└── README.md                 # תיעוד הפרויקט
```

## רישיון

מערכת זו הינה פרויקט קוד פתוח המשוחרר תחת רישיון MIT.

## יצירת קשר

לשאלות או הצעות לשיפור, אנא פנה אל [your-email@example.com](mailto:your-email@example.com).