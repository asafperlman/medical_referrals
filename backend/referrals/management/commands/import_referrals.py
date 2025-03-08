# medical-referrals/backend/referrals/management/commands/import_referrals.py

import csv
import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from referrals.models import Referral
from accounts.models import User

class Command(BaseCommand):
    help = 'ייבוא נתוני הפניות רפואיות מקובץ CSV'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        
        # קבל משתמש ברירת מחדל ליצירת ההפניות
        try:
            default_user = User.objects.get(role='admin')
        except User.DoesNotExist:
            default_user = User.objects.filter(is_staff=True).first()
            if not default_user:
                default_user = User.objects.first()
                if not default_user:
                    self.stdout.write(self.style.ERROR('לא נמצאו משתמשים במערכת. יש ליצור משתמש לפני ייבוא הנתונים.'))
                    return
        
        # מיפוי ערכי סטטוס
        status_mapping = {
            'נקבע תור': 'appointment_scheduled',
            'דרוש תיאום': 'requires_coordination',
            'דרוש תיאום עם חייל': 'requires_soldier_coordination',
            'בוצע הושלם': 'completed',
            'ממתין לאישור תקציבי': 'waiting_for_budget_approval',
            'ממתין להפניה מרופא': 'waiting_for_doctor_referral',
            'ממתין לתאריך מגורם רפואי': 'waiting_for_medical_date',
        }
        
        # מיפוי ערכי דחיפות
        priority_mapping = {
            'דחוף ביותר': 'highest',
            'דחוף': 'urgent',
            'גבוה': 'high',
            'בינוני': 'medium',
            'נמוך': 'low',
            'זניח': 'minimal',
        }
        
        # קרא את קובץ ה-CSV
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.reader(f, delimiter='\t')
            
            # דלג על שורת כותרות אם קיימת
            # next(reader, None)
            
            count = 0
            for row in reader:
                if len(row) >= 12:  # וודא שיש מספיק שדות בשורה
                    try:
                        # חילוץ ערכים מהשורה
                        update_date = row[0]  # תאריך עדכון
                        reference_date = row[1]  # תאריך אסמכתא
                        full_name = row[2]  # שם מלא
                        team = row[3]  # צוות
                        personal_id = row[4]  # מספר אישי
                        referral_details = row[5]  # הפניה מבוקשת
                        has_documents = row[6].upper() == 'TRUE'  # האם יש אסמכתא
                        appointment_date = row[7]  # תאריך תור
                        appointment_path = row[8]  # מסלול
                        appointment_location = row[9]  # מיקום התור
                        priority = row[10]  # עדיפות
                        status = row[11]  # סטטוס
                        notes = row[12] if len(row) > 12 else ''  # הערות
                        
                        # המרת תאריכים
                        try:
                            updated_at = datetime.datetime.strptime(update_date, '%d/%m/%Y %H:%M')
                        except ValueError:
                            updated_at = timezone.now()
                            
                        try:
                            ref_date = datetime.datetime.strptime(reference_date, '%d/%m/%Y').date()
                        except ValueError:
                            ref_date = None
                            
                        try:
                            if appointment_date and len(appointment_date.strip()) > 0:
                                appt_date = datetime.datetime.strptime(appointment_date, '%d/%m/%Y %H:%M:%S')
                            else:
                                appt_date = None
                        except ValueError:
                            try:
                                # נסה פורמט אחר
                                appt_date = datetime.datetime.strptime(appointment_date, '%d/%m/%Y %H:%M')
                            except ValueError:
                                appt_date = None
                        
                        # קבע סוג הפניה לפי הפניה מבוקשת
                        if 'שיניים' in referral_details or 'כתרים' in referral_details:
                            referral_type = 'dental'
                        elif 'אורתופד' in referral_details:
                            referral_type = 'specialist'
                        elif 'פיזיותרפיה' in referral_details:
                            referral_type = 'therapy'
                        elif 'אף אוזן גרון' in referral_details or 'רופא עור' in referral_details or 'אורולוג' in referral_details:
                            referral_type = 'specialist'
                        elif 'בדיקת דם' in referral_details or 'שתן' in referral_details or 'הישמניה' in referral_details:
                            referral_type = 'lab'
                        elif 'אולטראסונד' in referral_details or 'ביופסיה' in referral_details:
                            referral_type = 'imaging'
                        elif 'ניתוח' in referral_details:
                            referral_type = 'surgery'
                        else:
                            referral_type = 'other'
                        
                        # המרת סטטוס ודחיפות למפתחות המודל
                        status_key = status_mapping.get(status, 'requires_coordination')
                        priority_key = priority_mapping.get(priority, 'medium')
                        existing_referral = Referral.objects.filter(
                            personal_id=personal_id,
                            referral_type=referral_type,
                            referral_details=referral_details
                        ).first()
            
                        if existing_referral:
                            self.stdout.write(self.style.WARNING(
                                f'דילוג על הפניה כפולה: {full_name}, {personal_id}, {referral_details}'
                            ))
                            continue
                        
                        else:
                            # יצירת ההפניה
                            referral = Referral(
                                full_name=full_name,
                                personal_id=personal_id,
                                team=team,
                                referral_type=referral_type,
                                referral_details=referral_details,
                                has_documents=has_documents,
                                priority=priority_key,
                                status=status_key,
                                appointment_date=appt_date,
                                appointment_path=appointment_path,
                                appointment_location=appointment_location,
                                notes=notes,
                                created_by=default_user,
                                last_updated_by=default_user,
                                reference_date=ref_date
                            )
                        
                        # שמירה עם תאריכי יצירה ועדכון מותאמים
                        referral.save()
                        
                        # עדכון תאריכי יצירה ועדכון
                        if ref_date:
                            created_at = datetime.datetime.combine(ref_date, datetime.time.min)
                            Referral.objects.filter(id=referral.id).update(created_at=created_at)
                        
                        if updated_at:
                            Referral.objects.filter(id=referral.id).update(updated_at=updated_at)
                        
                        count += 1
                        
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'שגיאה בייבוא שורה: {e}'))
                        continue
            
            self.stdout.write(self.style.SUCCESS(f'יובאו בהצלחה {count} הפניות'))