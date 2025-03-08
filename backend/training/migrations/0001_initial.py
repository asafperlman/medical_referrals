# Generated by Django 5.1.7 on 2025-03-08 23:25

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Medic',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='שם מלא')),
                ('team', models.CharField(choices=[('חוד', 'חוד'), ('אתק', 'אתק'), ('רתק', 'רתק'), ('מפלג', 'מפלג')], max_length=50, verbose_name='צוות')),
                ('role', models.CharField(choices=[('חובש פלוגתי', 'חובש פלוגתי'), ('חובש גדודי', 'חובש גדודי'), ('חובש חטיבתי', 'חובש חטיבתי')], max_length=50, verbose_name='תפקיד')),
                ('experience', models.CharField(choices=[('מתחיל', 'מתחיל'), ('מתקדם', 'מתקדם'), ('בכיר', 'בכיר')], default='מתחיל', max_length=50, verbose_name='ניסיון')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='נוצר בתאריך')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='עודכן בתאריך')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='medics', to=settings.AUTH_USER_MODEL, verbose_name='משתמש מקושר')),
            ],
            options={
                'verbose_name': 'חובש',
                'verbose_name_plural': 'חובשים',
                'ordering': ['team', 'name'],
            },
        ),
        migrations.CreateModel(
            name='MedicTraining',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('training_date', models.DateField(verbose_name='תאריך תרגול')),
                ('training_type', models.CharField(choices=[('החייאה', 'החייאה'), ('טיפול בפציעות ראש', 'טיפול בפציעות ראש'), ('החדרת נתיב אוויר', 'החדרת נתיב אוויר'), ('עצירת דימומים', 'עצירת דימומים'), ('טיפול בפגיעות חזה', 'טיפול בפגיעות חזה'), ('הנחת עירוי', 'הנחת עירוי'), ('טיפול בהלם', 'טיפול בהלם'), ('חבישות', 'חבישות'), ('פינוי נפגעים', 'פינוי נפגעים'), ('ציוד רפואי והכרתו', 'ציוד רפואי והכרתו')], max_length=100, verbose_name='סוג תרגול')),
                ('performance_rating', models.IntegerField(default=3, verbose_name='דירוג ביצוע')),
                ('attendance', models.BooleanField(default=True, verbose_name='נוכחות מלאה')),
                ('notes', models.TextField(blank=True, verbose_name='הערות')),
                ('recommendations', models.TextField(blank=True, verbose_name='המלצות לשיפור')),
                ('location', models.CharField(blank=True, max_length=255, verbose_name='מיקום')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='נוצר בתאריך')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='עודכן בתאריך')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_medic_trainings', to=settings.AUTH_USER_MODEL, verbose_name='נוצר על ידי')),
                ('last_updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_medic_trainings', to=settings.AUTH_USER_MODEL, verbose_name='עודכן על ידי')),
                ('medic', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trainings', to='training.medic', verbose_name='חובש')),
            ],
            options={
                'verbose_name': 'תרגול חובש',
                'verbose_name_plural': 'תרגולי חובשים',
                'ordering': ['-training_date'],
            },
        ),
        migrations.CreateModel(
            name='Soldier',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='שם מלא')),
                ('personal_id', models.CharField(max_length=20, unique=True, verbose_name='מספר אישי')),
                ('team', models.CharField(choices=[('חוד', 'חוד'), ('אתק', 'אתק'), ('רתק', 'רתק'), ('מפלג', 'מפלג')], max_length=50, verbose_name='צוות')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='נוצר בתאריך')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='עודכן בתאריך')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='soldiers', to=settings.AUTH_USER_MODEL, verbose_name='משתמש מקושר')),
            ],
            options={
                'verbose_name': 'חייל',
                'verbose_name_plural': 'חיילים',
                'ordering': ['team', 'name'],
            },
        ),
        migrations.CreateModel(
            name='TeamTraining',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(verbose_name='תאריך תרגול')),
                ('team', models.CharField(choices=[('חוד', 'חוד'), ('אתק', 'אתק'), ('רתק', 'רתק'), ('מפלג', 'מפלג')], max_length=50, verbose_name='צוות')),
                ('scenario', models.CharField(max_length=255, verbose_name='תרחיש')),
                ('location', models.CharField(blank=True, max_length=255, verbose_name='מיקום')),
                ('notes', models.TextField(blank=True, verbose_name='הערות')),
                ('performance_rating', models.IntegerField(default=3, verbose_name='דירוג ביצוע')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='נוצר בתאריך')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='עודכן בתאריך')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_team_trainings', to=settings.AUTH_USER_MODEL, verbose_name='נוצר על ידי')),
                ('last_updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_team_trainings', to=settings.AUTH_USER_MODEL, verbose_name='עודכן על ידי')),
            ],
            options={
                'verbose_name': 'תרגול צוות',
                'verbose_name_plural': 'תרגולי צוות',
                'ordering': ['-date'],
            },
        ),
        migrations.CreateModel(
            name='TourniquetTraining',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('training_date', models.DateField(verbose_name='תאריך תרגול')),
                ('cat_time', models.CharField(max_length=10, verbose_name='זמן CAT (שניות)')),
                ('passed', models.BooleanField(default=True, verbose_name='עבר')),
                ('notes', models.TextField(blank=True, verbose_name='הערות')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='נוצר בתאריך')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='עודכן בתאריך')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_tourniquet_trainings', to=settings.AUTH_USER_MODEL, verbose_name='נוצר על ידי')),
                ('last_updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_tourniquet_trainings', to=settings.AUTH_USER_MODEL, verbose_name='עודכן על ידי')),
                ('soldier', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tourniquet_trainings', to='training.soldier', verbose_name='חייל')),
            ],
            options={
                'verbose_name': 'תרגול חסם עורקים',
                'verbose_name_plural': 'תרגולי חסם עורקים',
                'ordering': ['-training_date'],
            },
        ),
        migrations.AddIndex(
            model_name='medic',
            index=models.Index(fields=['team'], name='training_me_team_a4be9a_idx'),
        ),
        migrations.AddIndex(
            model_name='medic',
            index=models.Index(fields=['role'], name='training_me_role_52b7ce_idx'),
        ),
        migrations.AddIndex(
            model_name='medic',
            index=models.Index(fields=['experience'], name='training_me_experie_a305ea_idx'),
        ),
        migrations.AddIndex(
            model_name='medictraining',
            index=models.Index(fields=['medic'], name='training_me_medic_i_1e9745_idx'),
        ),
        migrations.AddIndex(
            model_name='medictraining',
            index=models.Index(fields=['training_date'], name='training_me_trainin_20602b_idx'),
        ),
        migrations.AddIndex(
            model_name='medictraining',
            index=models.Index(fields=['training_type'], name='training_me_trainin_bbb6a1_idx'),
        ),
        migrations.AddIndex(
            model_name='medictraining',
            index=models.Index(fields=['performance_rating'], name='training_me_perform_355db5_idx'),
        ),
        migrations.AddIndex(
            model_name='soldier',
            index=models.Index(fields=['team'], name='training_so_team_6f181e_idx'),
        ),
        migrations.AddIndex(
            model_name='soldier',
            index=models.Index(fields=['personal_id'], name='training_so_persona_dfbf93_idx'),
        ),
        migrations.AddIndex(
            model_name='teamtraining',
            index=models.Index(fields=['team'], name='training_te_team_67ab57_idx'),
        ),
        migrations.AddIndex(
            model_name='teamtraining',
            index=models.Index(fields=['date'], name='training_te_date_b694eb_idx'),
        ),
        migrations.AddIndex(
            model_name='teamtraining',
            index=models.Index(fields=['performance_rating'], name='training_te_perform_6d3008_idx'),
        ),
        migrations.AddIndex(
            model_name='tourniquettraining',
            index=models.Index(fields=['soldier'], name='training_to_soldier_78be78_idx'),
        ),
        migrations.AddIndex(
            model_name='tourniquettraining',
            index=models.Index(fields=['training_date'], name='training_to_trainin_92a1e8_idx'),
        ),
        migrations.AddIndex(
            model_name='tourniquettraining',
            index=models.Index(fields=['passed'], name='training_to_passed_ff19ed_idx'),
        ),
    ]
