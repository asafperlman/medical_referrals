# medical-referrals/backend/accounts/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """
    מנהל מודל משתמש מותאם לשימוש עם אימייל כשדה זיהוי
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('יש לספק כתובת אימייל'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    מודל משתמש מותאם עם אימייל כשדה זיהוי ותמיכה בהרשאות מבוססות תפקידים
    """
    ROLE_CHOICES = [
        ('admin', 'מנהל מערכת'),
        ('manager', 'מנהל'),
        ('user', 'משתמש רגיל'),
        ('viewer', 'צופה בלבד'),
    ]

    username = None  # מבטל את username כשדה זיהוי
    email = models.EmailField(_('כתובת אימייל'), unique=True)
    full_name = models.CharField(_('שם מלא'), max_length=255)
    role = models.CharField(_('תפקיד'), max_length=50, choices=ROLE_CHOICES, default='user')
    department = models.CharField(_('מחלקה'), max_length=100, blank=True)
    phone_number = models.CharField(_('מספר טלפון'), max_length=20, blank=True)
    profile_image = models.ImageField(_('תמונת פרופיל'), upload_to='profile_images/', null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(_('IP התחברות אחרונה'), null=True, blank=True)
    
    # שדות מערכת
    is_active = models.BooleanField(_('פעיל'), default=True)
    date_joined = models.DateTimeField(_('תאריך הצטרפות'), auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = _('משתמש')
        verbose_name_plural = _('משתמשים')

    def __str__(self):
        return self.email

    @property
    def is_admin(self):
        return self.role == 'admin'
    
    @property
    def is_manager(self):
        return self.role == 'manager' or self.role == 'admin'
    
    @property
    def is_viewer(self):
        return self.role == 'viewer'