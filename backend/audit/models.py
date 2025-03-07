# medical-referrals/backend/audit/models.py

from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from accounts.models import User


class AuditLog(models.Model):
    """
    מודל לתיעוד פעולות במערכת
    """
    ACTION_TYPES = [
        ('create', 'יצירה'),
        ('update', 'עדכון'),
        ('delete', 'מחיקה'),
        ('login', 'התחברות'),
        ('logout', 'התנתקות'),
        ('view', 'צפייה'),
        ('export', 'ייצוא'),
        ('other', 'אחר'),
    ]

    # מי ביצע את הפעולה
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs', verbose_name='משתמש')
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name='כתובת IP')
    
    # מתי בוצעה הפעולה
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='תאריך ושעה')
    
    # איזו פעולה בוצעה
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES, verbose_name='סוג פעולה')
    action_detail = models.CharField(max_length=255, verbose_name='פרטי פעולה')
    
    # על איזה אובייקט בוצעה הפעולה (קישור גנרי)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True, verbose_name='סוג תוכן')
    object_id = models.PositiveIntegerField(null=True, blank=True, verbose_name='מזהה אובייקט')
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # מידע נוסף
    old_values = models.JSONField(null=True, blank=True, verbose_name='ערכים ישנים')
    new_values = models.JSONField(null=True, blank=True, verbose_name='ערכים חדשים')
    notes = models.TextField(blank=True, verbose_name='הערות')

    class Meta:
        verbose_name = 'תיעוד פעולה'
        verbose_name_plural = 'תיעוד פעולות'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['action_type']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self):
        user_str = self.user.email if self.user else 'אנונימי'
        return f"{self.get_action_type_display()} - {user_str} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"


class SystemSetting(models.Model):
    """
    מודל להגדרות מערכת
    """
    key = models.CharField(max_length=100, unique=True, verbose_name='מפתח')
    value = models.JSONField(verbose_name='ערך')
    description = models.TextField(blank=True, verbose_name='תיאור')
    
    # תיעוד שינויים
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='נוצר בתאריך')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='עודכן לאחרונה בתאריך')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_settings', verbose_name='נוצר על ידי')
    last_updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_settings', verbose_name='עודכן לאחרונה על ידי')

    class Meta:
        verbose_name = 'הגדרת מערכת'
        verbose_name_plural = 'הגדרות מערכת'

    def __str__(self):
        return self.key