// frontend/src/utils/helpers.js

/**
 * מחלקת עזר עם פונקציות שימושיות לכל המערכת
 */

// פורמט תאריך כולל יום בשבוע
export const formatDate = (dateString) => {
    if (!dateString) return '—';
    
    const days = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];
    const date = new Date(dateString);
    const dayOfWeek = days[date.getDay()];
    
    return `${dayOfWeek}, ${date.toLocaleDateString('he-IL')}`;
  };
  
  // פורמט שעה בלבד
  export const formatTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };
  
  // פורמט תאריך ושעה מלאים
  export const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    
    const days = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];
    const date = new Date(dateString);
    const dayOfWeek = days[date.getDay()];
    
    return `${dayOfWeek}, ${date.toLocaleDateString('he-IL')} ${formatTime(dateString)}`;
  };
  
  // בדיקה אם התאריך הוא היום
  export const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    
    return date.getTime() === today.getTime();
  };
  
  // בדיקה אם התאריך הוא מחר
  export const isTomorrow = (dateString) => {
    if (!dateString) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    
    return date.getTime() === tomorrow.getTime();
  };
  
  // בדיקה אם התאריך הוא אתמול
  export const isYesterday = (dateString) => {
    if (!dateString) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    
    return date.getTime() === yesterday.getTime();
  };
  
  // בדיקה אם התאריך בשבוע הנוכחי
  export const isThisWeek = (dateString) => {
    if (!dateString) return false;
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // start of the week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // end of the week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);
    
    const date = new Date(dateString);
    return date >= startOfWeek && date <= endOfWeek;
  };
  
  // תווית עדיפות בעברית
  export const getPriorityLabel = (priority) => {
    const labels = {
      highest: 'דחוף ביותר',
      urgent: 'דחופה',
      high: 'גבוהה',
      medium: 'בינונית',
      low: 'נמוכה',
      minimal: 'זניח'
    };
    return labels[priority] || priority;
  };
  
  // תווית סטטוס בעברית
  export const getStatusLabel = (status) => {
    const labels = {
      new: 'חדש',
      in_progress: 'בטיפול',
      waiting_for_approval: 'ממתין לאישור',
      appointment_scheduled: 'תור נקבע',
      completed: 'הושלם',
      cancelled: 'בוטל',
      requires_coordination: 'דרוש תיאום',
      requires_soldier_coordination: 'תיאום עם חייל',
      waiting_for_medical_date: 'ממתין לתאריך',
      waiting_for_budget_approval: 'ממתין לאישור',
      waiting_for_doctor_referral: 'ממתין להפניה',
      no_show: 'לא הגיע'
    };
    return labels[status] || status;
  };
  
  // מיפוי צבעים לעדיפויות
  export const priorityColors = {
    highest: 'error',
    urgent: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success',
    minimal: 'default'
  };
  
  // קבלת צבע לפי עדיפות
  export const getPriorityColor = (priority) => {
    return priorityColors[priority] || 'default';
  };
  
  // מיפוי צבעים לסטטוסים
  export const statusColors = {
    new: 'info',
    in_progress: 'info',
    waiting_for_approval: 'warning',
    appointment_scheduled: 'success',
    completed: 'success',
    cancelled: 'error',
    requires_coordination: 'warning',
    requires_soldier_coordination: 'warning',
    waiting_for_medical_date: 'info',
    waiting_for_budget_approval: 'warning',
    waiting_for_doctor_referral: 'warning',
    no_show: 'error'
  };
  
  // קבלת צבע לפי סטטוס
  export const getStatusColor = (status) => {
    return statusColors[status] || 'default';
  };
  
  // פונקציה להפיכת מחרוזת לפורמט של שם תקין
  // לדוגמה: "john doe" -> "John Doe"
  export const capitalizeFullName = (name) => {
    if (!name) return '';
    
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // חישוב ימים נותרים
  export const getRemainingDays = (targetDate) => {
    if (!targetDate) return null;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // ארגון רשימת ההפניות לפי קטגוריות
  export const organizeReferralsByCategory = (referrals) => {
    if (!referrals || !Array.isArray(referrals) || referrals.length === 0) {
      return {};
    }
    
    const byCategory = {
      "פיזיותרפיה": [],
      "רופא עור": [],
      "רופא מומחה": [],
      "בדיקות דם": [],
      "דימות רפואי": [],
      "בודדים": []
    };
    
    // Categorize based on referral_details text
    referrals.forEach(item => {
      const details = item.referral_details?.toLowerCase() || '';
      
      if (details.includes('פיזיו') || details.includes('פיסיותרפיה')) {
        byCategory["פיזיותרפיה"].push(item);
      } else if (details.includes('עור') || details.includes('דרמטולוג')) {
        byCategory["רופא עור"].push(item);
      } else if (details.includes('רופא') || details.includes('ייעוץ')) {
        byCategory["רופא מומחה"].push(item);
      } else if (details.includes('דם') || details.includes('מעבדה')) {
        byCategory["בדיקות דם"].push(item);
      } else if (details.includes('רנטגן') || details.includes('אולטרה') || 
                details.includes('ct') || details.includes('mri')) {
        byCategory["דימות רפואי"].push(item);
      } else {
        byCategory["בודדים"].push(item);
      }
    });
    
    // Remove empty categories
    Object.keys(byCategory).forEach(key => {
      if (byCategory[key].length === 0) {
        delete byCategory[key];
      }
    });
    
    return byCategory;
  };
  
  // פונקציה לארגון נתונים לפי צוות
  export const organizeByTeam = (items) => {
    if (!items || !Array.isArray(items)) return {};
    
    const result = {};
    
    items.forEach(item => {
      const team = item.team || 'ללא צוות';
      
      if (!result[team]) {
        result[team] = {
          count: 0,
          urgent: 0,
          items: []
        };
      }
      
      result[team].count += 1;
      
      if (item.priority === 'urgent' || item.priority === 'highest') {
        result[team].urgent += 1;
      }
      
      result[team].items.push(item);
    });
    
    return result;
  };
  
  // פונקציה לדירוג עדיפות (לצורך מיון)
  export const getPriorityRank = (priority) => {
    const ranks = {
      highest: 5,
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
      minimal: 0
    };
    
    return ranks[priority] || 0;
  };
  
  // פונקציה למיון הפניות לפי עדיפות (הדחופות ראשונות)
  export const sortByPriority = (referrals) => {
    if (!referrals || !Array.isArray(referrals)) return [];
    
    return [...referrals].sort((a, b) => {
      return getPriorityRank(b.priority) - getPriorityRank(a.priority);
    });
  };
  
  // פונקציה למיון הפניות לפי תאריך (החדשות ראשונות)
  export const sortByDate = (referrals, dateField = 'created_at') => {
    if (!referrals || !Array.isArray(referrals)) return [];
    
    return [...referrals].sort((a, b) => {
      if (!a[dateField]) return 1;
      if (!b[dateField]) return -1;
      
      return new Date(b[dateField]) - new Date(a[dateField]);
    });
  };
  
  // פונקציה לקיצור טקסט ארוך
  export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    
    return `${text.substring(0, maxLength).trim()}...`;
  };
  
  // פונקציה לחילוץ אותיות ראשונות משם מלא (לאווטאר)
  export const getInitials = (fullName) => {
    if (!fullName) return '';
    
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // פונקציה להצגת הזמן שחלף מתאריך מסוים
  export const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) {
      return 'לפני זמן קצר';
    } else if (diffMin < 60) {
      return `לפני ${diffMin} דקות`;
    } else if (diffHour < 24) {
      return `לפני ${diffHour} שעות`;
    } else if (diffDay < 7) {
      return `לפני ${diffDay} ימים`;
    } else {
      return formatDate(dateString);
    }
  };
  
  // פונקציה לזיהוי אם המשתמש הוא מנהל
  export const isAdmin = (user) => {
    return user?.role === 'admin';
  };
  
  // פונקציה לזיהוי אם המשתמש הוא מנהל או מפקד
  export const isManager = (user) => {
    return user?.role === 'admin' || user?.role === 'manager';
  };