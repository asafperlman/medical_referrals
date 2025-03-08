# medical-referrals/backend/training/models.py

from django.db import models
from accounts.models import User


class TeamTraining(models.Model):
    """
    מודל לתרגולי צוות (אר"ן צוותי)
    """
    TEAM_CHOICES = [
        ('חוד', 'חוד'),
        ('אתק', 'אתק'),
        ('רתק', 'רתק'),
        ('מפלג', 'מפלג'),
    ]

    date = models.DateField(verbose_name='תאריך תרגול')
    team = models.CharField(max_length=50, choices=TEAM_CHOICES, verbose_name='צוות')
    scenario = models.CharField(max_length=255, verbose_name='תרחיש')
    location = models.CharField(max_length=255, blank=True, verbose_name='מיקום')
    notes = models.TextField(blank=True, verbose_name='הערות')
    performance_rating = models.IntegerField(default=3, verbose_name='דירוג ביצוע')
    
    # Administrative fields
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='נוצר בתאריך')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_team_trainings', verbose_name='נוצר על ידי')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='עודכן בתאריך')
    last_updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_team_trainings', verbose_name='עודכן על ידי')

    class Meta:
        verbose_name = 'תרגול צוות'
        verbose_name_plural = 'תרגולי צוות'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['team']),
            models.Index(fields=['date']),
            models.Index(fields=['performance_rating']),
        ]

    def __str__(self):
        return f"{self.team} - {self.scenario} ({self.date})"


class Soldier(models.Model):
    """
    מודל לחיילים שמשתתפים בתרגולים
    """
    TEAM_CHOICES = [
        ('חוד', 'חוד'),
        ('אתק', 'אתק'),
        ('רתק', 'רתק'),
        ('מפלג', 'מפלג'),
    ]

    name = models.CharField(max_length=255, verbose_name='שם מלא')
    personal_id = models.CharField(max_length=20, unique=True, verbose_name='מספר אישי')
    team = models.CharField(max_length=50, choices=TEAM_CHOICES, verbose_name='צוות')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='soldiers', verbose_name='משתמש מקושר')
    
    # Administrative fields
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='נוצר בתאריך')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='עודכן בתאריך')

    class Meta:
        verbose_name = 'חייל'
        verbose_name_plural = 'חיילים'
        ordering = ['team', 'name']
        indexes = [
            models.Index(fields=['team']),
            models.Index(fields=['personal_id']),
        ]

    def __str__(self):
        return f"{self.name} ({self.personal_id}) - {self.team}"


class TourniquetTraining(models.Model):
    """
    מודל לתרגולי חסם עורקים (מחצ"ים)
    """
    soldier = models.ForeignKey(Soldier, on_delete=models.CASCADE, related_name='tourniquet_trainings', verbose_name='חייל')
    training_date = models.DateField(verbose_name='תאריך תרגול')
    cat_time = models.CharField(max_length=10, verbose_name='זמן CAT (שניות)')
    passed = models.BooleanField(default=True, verbose_name='עבר')
    notes = models.TextField(blank=True, verbose_name='הערות')
    
    # Administrative fields
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='נוצר בתאריך')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_tourniquet_trainings', verbose_name='נוצר על ידי')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='עודכן בתאריך')
    last_updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_tourniquet_trainings', verbose_name='עודכן על ידי')

    class Meta:
        verbose_name = 'תרגול חסם עורקים'
        verbose_name_plural = 'תרגולי חסם עורקים'
        ordering = ['-training_date']
        indexes = [
            models.Index(fields=['soldier']),
            models.Index(fields=['training_date']),
            models.Index(fields=['passed']),
        ]

    def __str__(self):
        return f"{self.soldier.name} - {self.training_date} ({self.cat_time} שניות)"

    @property
    def is_current_month(self):
        """האם התרגול בוצע בחודש הנוכחי"""
        from django.utils import timezone
        import datetime
        
        now = timezone.now().date()
        return (self.training_date.month == now.month and 
                self.training_date.year == now.year)


class Medic(models.Model):
    """
    מודל לחובשים
    """
    TEAM_CHOICES = [
        ('חוד', 'חוד'),
        ('אתק', 'אתק'),
        ('רתק', 'רתק'),
        ('מפלג', 'מפלג'),
    ]
    
    EXPERIENCE_CHOICES = [
        ('מתחיל', 'מתחיל'),
        ('מתקדם', 'מתקדם'),
        ('בכיר', 'בכיר'),
    ]
    
    ROLE_CHOICES = [
        ('חובש פלוגתי', 'חובש פלוגתי'),
        ('חובש גדודי', 'חובש גדודי'),
        ('חובש חטיבתי', 'חובש חטיבתי'),
    ]

    name = models.CharField(max_length=255, verbose_name='שם מלא')
    team = models.CharField(max_length=50, choices=TEAM_CHOICES, verbose_name='צוות')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, verbose_name='תפקיד')
    experience = models.CharField(max_length=50, choices=EXPERIENCE_CHOICES, default='מתחיל', verbose_name='ניסיון')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='medics', verbose_name='משתמש מקושר')
    
    # Administrative fields
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='נוצר בתאריך')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='עודכן בתאריך')

    class Meta:
        verbose_name = 'חובש'
        verbose_name_plural = 'חובשים'
        ordering = ['team', 'name']
        indexes = [
            models.Index(fields=['team']),
            models.Index(fields=['role']),
            models.Index(fields=['experience']),
        ]

    def __str__(self):
        return f"{self.name} - {self.role} ({self.team})"


class MedicTraining(models.Model):
    """
    מודל לתרגולי חובשים
    """
    TRAINING_TYPE_CHOICES = [
        ('החייאה', 'החייאה'),
        ('טיפול בפציעות ראש', 'טיפול בפציעות ראש'),
        ('החדרת נתיב אוויר', 'החדרת נתיב אוויר'),
        ('עצירת דימומים', 'עצירת דימומים'),
        ('טיפול בפגיעות חזה', 'טיפול בפגיעות חזה'),
        ('הנחת עירוי', 'הנחת עירוי'),
        ('טיפול בהלם', 'טיפול בהלם'),
        ('חבישות', 'חבישות'),
        ('פינוי נפגעים', 'פינוי נפגעים'),
        ('ציוד רפואי והכרתו', 'ציוד רפואי והכרתו'),
    ]

    medic = models.ForeignKey(Medic, on_delete=models.CASCADE, related_name='trainings', verbose_name='חובש')
    training_date = models.DateField(verbose_name='תאריך תרגול')
    training_type = models.CharField(max_length=100, choices=TRAINING_TYPE_CHOICES, verbose_name='סוג תרגול')
    performance_rating = models.IntegerField(default=3, verbose_name='דירוג ביצוע')
    attendance = models.BooleanField(default=True, verbose_name='נוכחות מלאה')
    notes = models.TextField(blank=True, verbose_name='הערות')
    recommendations = models.TextField(blank=True, verbose_name='המלצות לשיפור')
    location = models.CharField(max_length=255, blank=True, verbose_name='מיקום')
    
    # Administrative fields
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='נוצר בתאריך')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_medic_trainings', verbose_name='נוצר על ידי')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='עודכן בתאריך')
    last_updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_medic_trainings', verbose_name='עודכן על ידי')

    class Meta:
        verbose_name = 'תרגול חובש'
        verbose_name_plural = 'תרגולי חובשים'
        ordering = ['-training_date']
        indexes = [
            models.Index(fields=['medic']),
            models.Index(fields=['training_date']),
            models.Index(fields=['training_type']),
            models.Index(fields=['performance_rating']),
        ]

    def __str__(self):
        return f"{self.medic.name} - {self.training_type} ({self.training_date})"

    @property
    def is_current_month(self):
        """האם התרגול בוצע בחודש הנוכחי"""
        from django.utils import timezone
        import datetime
        
        now = timezone.now().date()
        return (self.training_date.month == now.month and 
                self.training_date.year == now.year)