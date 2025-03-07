# Generated by Django 5.1.7 on 2025-03-07 20:04

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('referrals', '0002_add_reference_date'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameIndex(
            model_name='referral',
            new_name='referrals_r_referen_e4d77d_idx',
            old_name='referrals_r_referen_123456_idx',
        ),
        migrations.AlterField(
            model_name='referral',
            name='priority',
            field=models.CharField(choices=[('highest', 'דחוף ביותר'), ('urgent', 'דחוף'), ('high', 'גבוה'), ('medium', 'בינוני'), ('low', 'נמוך'), ('minimal', 'זניח'), ('routine', 'שגרתי'), ('elective', 'אלקטיבי'), ('emergency', 'חירום')], default='medium', max_length=20, verbose_name='עדיפות'),
        ),
        migrations.AlterField(
            model_name='referral',
            name='referral_type',
            field=models.CharField(choices=[('specialist', 'רופא מומחה'), ('imaging', 'בדיקות דימות'), ('lab', 'בדיקות מעבדה'), ('procedure', 'פרוצדורה'), ('therapy', 'טיפול'), ('surgery', 'ניתוח'), ('consultation', 'ייעוץ'), ('dental', 'טיפול שיניים'), ('other', 'אחר')], max_length=50, verbose_name='סוג הפנייה'),
        ),
        migrations.AlterField(
            model_name='referral',
            name='status',
            field=models.CharField(choices=[('appointment_scheduled', 'נקבע תור'), ('requires_coordination', 'דרוש תיאום'), ('requires_soldier_coordination', 'דרוש תיאום עם חייל'), ('waiting_for_medical_date', 'ממתין לתאריך מגורם רפואי'), ('completed', 'בוצע הושלם'), ('cancelled', 'בוטל'), ('waiting_for_budget_approval', 'ממתין לאישור תקציבי'), ('waiting_for_doctor_referral', 'ממתין להפניה מרופא'), ('no_show', 'לא הגיע לתור')], default='appointment_scheduled', max_length=50, verbose_name='סטטוס'),
        ),
        migrations.AddIndex(
            model_name='referral',
            index=models.Index(fields=['created_at'], name='referrals_r_created_81091c_idx'),
        ),
    ]
