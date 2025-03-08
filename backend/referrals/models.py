# medical-referrals/backend/referrals/models.py

from django.db import models
from accounts.models import User

class Referral(models.Model):
    """
    מודל המייצג הפניה רפואית
    """
    PRIORITY_CHOICES = [
        ('highest', 'דחוף ביותר'),
        ('urgent', 'דחוף'),
        ('high', 'גבוה'),
        ('medium', 'בינוני'),
        ('low', 'נמוך'),
        ('minimal', 'זניח'),
        ('routine', 'שגרתי'),
        ('elective', 'אלקטיבי'),
        ('emergency', 'חירום'),
    ]
    
    STATUS_CHOICES = [
        ('appointment_scheduled', 'נקבע תור'),
        ('requires_coordination', 'דרוש תיאום'),
        ('requires_soldier_coordination', 'דרוש תיאום עם חייל'),
        ('waiting_for_medical_date', 'ממתין לתאריך מגורם רפואי'),
        ('completed', 'בוצע הושלם'),
        ('cancelled', 'בוטל'),
        ('waiting_for_budget_approval', 'ממתין לאישור תקציבי'),
        ('waiting_for_doctor_referral', 'ממתין להפניה מרופא'),
        ('no_show', 'לא הגיע לתור'),
    ]
    
    REFERRAL_TYPES = [
        ('specialist', 'רופא מומחה'),
        ('imaging', 'בדיקות דימות'),
        ('lab', 'בדיקות מעבדה'),
        ('procedure', 'פרוצדורה'),
        ('therapy', 'טיפול'),
        ('surgery', 'ניתוח'),
        ('consultation', 'ייעוץ'),
        ('dental', 'טיפול שיניים'),
        ('other', 'אחר'),
    ]

    # פרטי מטופל
    full_name = models.CharField(max_length=255, verbose_name='שם מלא')
    personal_id = models.CharField(max_length=20, verbose_name='מספר אישי')
    team = models.CharField(max_length=100, verbose_name='צוות')
    
    # פרטי הפניה
    referral_type = models.CharField(max_length=50, choices=REFERRAL_TYPES, verbose_name='סוג הפנייה')
    referral_details = models.CharField(max_length=255, verbose_name='הפניה מבוקשת')
    has_documents = models.BooleanField(default=False, verbose_name='האם יש אסמכתא')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium', verbose_name='עדיפות')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='appointment_scheduled', verbose_name='סטטוס')
    
    # פרטי תור
    appointment_date = models.DateTimeField(null=True, blank=True, verbose_name='תאריך התור')
    appointment_path = models.CharField(max_length=255, null=True, blank=True, verbose_name='מסלול')
    appointment_location = models.CharField(max_length=255, null=True, blank=True, verbose_name='מיקום התור')
    
    # מידע אדמיניסטרטיבי
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='תאריך כניסה למערכת')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='תאריך עדכון')
    notes = models.TextField(blank=True, verbose_name='הערות')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_referrals', verbose_name='נוצר על ידי')
    last_updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_referrals', verbose_name='עודכן לאחרונה על ידי')
    reference_date = models.DateField(null=True, blank=True, verbose_name='תאריך אסמכתא')

    class Meta:
        verbose_name = 'הפניה רפואית'
        verbose_name_plural = 'הפניות רפואיות'
        ordering = ['-updated_at']
        # הוסף את השורה הבאה:
        unique_together = ('personal_id', 'referral_type', 'referral_details')
        indexes = [

            models.Index(fields=['full_name']),
            models.Index(fields=['personal_id']),
            models.Index(fields=['team']),
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['appointment_date']),
            models.Index(fields=['reference_date']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.full_name} - {self.referral_details} ({self.status})"

    @property
    def is_urgent(self):
        """האם ההפניה דחופה"""
        return self.priority in ['highest', 'urgent', 'high']
    
    @property
    def is_pending(self):
        """האם ההפניה ממתינה לטיפול"""
        return self.status not in ['completed', 'cancelled', 'no_show']
    
    @property
    def waiting_days(self):
        """מספר ימים שההפניה ממתינה במערכת"""
        from django.utils import timezone
        import datetime
        
        if not self.is_pending:
            return 0
            
        now = timezone.now().date()
        delta = now - self.created_at.date()
        return delta.days


class ReferralDocument(models.Model):
    """
    מודל המייצג מסמך המצורף להפניה
    """
    referral = models.ForeignKey(Referral, on_delete=models.CASCADE, related_name='documents', verbose_name='הפניה')
    file = models.FileField(upload_to='referral_documents/%Y/%m/', verbose_name='קובץ')
    title = models.CharField(max_length=255, verbose_name='כותרת')
    description = models.TextField(blank=True, verbose_name='תיאור')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='תאריך העלאה')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='הועלה על ידי')

    class Meta:
        verbose_name = 'מסמך הפניה'
        verbose_name_plural = 'מסמכי הפניה'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.title} - {self.referral}"