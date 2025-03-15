# medical-referrals/backend/referrals/management/commands/import_new_referrals.py

import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from referrals.models import Referral
from accounts.models import User

class Command(BaseCommand):
    help = 'ייבוא הפניות רפואיות, מפגשי רופאה וטיפולי שיניים חדשים'

    def handle(self, *args, **options):
        # קבלת משתמש ברירת מחדל ליצירת הרשומות
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
            'בוצע - הושלם': 'completed',
            'ממתין לאישור תקציבי/רופא': 'waiting_for_budget_approval',
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
        
        # רשימת מפגשי רופאה
        doctor_visits = [
            {"full_name": "עמית רווח", "team": "חוד", "personal_id": "9347766", "referral_details": "לאחר בדיקת אלרגולוג"},
            {"full_name": "טל קונפינו", "team": "חוד", "personal_id": "9390442", "referral_details": "פצעים בזקן"},
            {"full_name": "אביב כהן", "team": "רתק", "personal_id": "9356591", "referral_details": "כאבי גב תחתון וכתף"},
            {"full_name": "רז קורצטג", "team": "מפלג", "personal_id": "9185941", "referral_details": "פצעונים באיזור הצוואר"},
            {"full_name": "בן שטינברג", "team": "חוד", "personal_id": "9180189", "referral_details": "כאבי גב תחתון, ובעית אסתטיקה בפציעה באיזור המשעפה"},
            {"full_name": "ניר פוני", "team": "אתק", "personal_id": "9287484", "referral_details": "מחלה ויראלית, הגיע עם חום, שיעולים נמכים"},
            {"full_name": "נועם שר", "team": "מפלג", "personal_id": "9252070", "referral_details": "כאבים בזרוע יד ימין"},
            {"full_name": "יובל מנגד", "team": "", "personal_id": "0000000", "referral_details": "אסמכתא לרופא עור (פטור תמידי)"},
            {"full_name": "הלל בן יהודה", "team": "נשק", "personal_id": "0000001", "referral_details": "להוציא אסמכתא לרופא עור בשיבא"},
            {"full_name": "איתי סיגאוי", "team": "(לא בפלוגה)", "personal_id": "0000002", "referral_details": "אסבמכתא למיון בדיעבד"},
        ]
        
        # רשימת טיפולי שיניים
        dental_treatments = [
            {"full_name": "מקסים ויקול", "team": "רתק", "personal_id": "9175977", "referral_details": "טיפול שורש"},
            {"full_name": "משה בן שושן", "team": "רתק", "personal_id": "9673275", "referral_details": "בדיקת שיניים כללית"},
            {"full_name": "אורי דנגוט", "team": "חוד", "personal_id": "9199379", "referral_details": "בדיקת שיניים כללית"},
            {"full_name": "ישי אלון", "team": "רתק", "personal_id": "9379003", "referral_details": "השלמת שן"},
            {"full_name": "אדם אברמוביץ", "team": "רתק", "personal_id": "9397348", "referral_details": "בדיקת שיניים כללית"},
            {"full_name": "אבנר קולודנר", "team": "אתק", "personal_id": "9074792", "referral_details": "בדיקת שיניים כללית"},
        ]
        
        # רשימת הפניות רפואיות
        referrals = [
            {"created_at": "14/02/2025", "full_name": "לידור פיין זילברג", "team": "רתק", "personal_id": "9389221", "referral_details": "אף אוזן גרון", "has_documents": True, "appointment_date": "30/03/2025 11:00:00", "appointment_path": "", "appointment_location": "רבקה זיו", "priority": "גבוה", "status": "נקבע תור"},
            {"created_at": "04/03/2025", "full_name": "הלל בן יהודה", "team": "רתק", "personal_id": "9113651", "referral_details": "בדיקת הישמניה", "has_documents": True, "appointment_date": "11/03/2025 11:00:00", "appointment_path": "", "appointment_location": "שיבא", "priority": "גבוה", "status": "בוצע - הושלם"},
            {"created_at": "01/01/2025", "full_name": "ארתור קנבסקי", "team": "אתק", "personal_id": "9411096", "referral_details": "אורתופד", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "בינוני", "status": "דרוש תיאום עם חייל"},
            {"created_at": "01/01/2025", "full_name": "יואב תומר", "team": "אתק", "personal_id": "9387449", "referral_details": "אורתופד", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "נמוך", "status": "דרוש תיאום עם חייל"},
            {"created_at": "01/01/2025", "full_name": "בן שטינברג", "team": "חוד", "personal_id": "9180189", "referral_details": "אורתופד", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "נמוך", "status": "דרוש תיאום עם חייל"},
            {"created_at": "02/01/2025", "full_name": "הראל טליס", "team": "רתק", "personal_id": "9350120", "referral_details": "אורתופד", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "זניח", "status": "דרוש תיאום עם חייל"},
            {"created_at": "14/01/2025", "full_name": "אביב כהן", "team": "רתק", "personal_id": "9356591", "referral_details": "אורתופד", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "נמוך", "status": "דרוש תיאום עם חייל"},
            {"created_at": "16/01/2025", "full_name": "איתן נוי", "team": "אתק", "personal_id": "9254926", "referral_details": "בדיקת דם", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "נמוך", "status": "דרוש תיאום עם חייל"},
            {"created_at": "09/01/2025", "full_name": "הלל בן יהודה", "team": "רתק", "personal_id": "9113651", "referral_details": "פיזיותרפיה", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "בינוני", "status": "דרוש תיאום עם חייל"},
            {"created_at": "17/01/2025", "full_name": "אוהד סולימן", "team": "אתק", "personal_id": "9387008", "referral_details": "פיזיותרפיה", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "גבוה", "status": "דרוש תיאום עם חייל"},
            {"created_at": "19/01/2025", "full_name": "ישי אלון", "team": "רתק", "personal_id": "9379003", "referral_details": "פיזיותרפיה", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "בינוני", "status": "דרוש תיאום עם חייל"},
            {"created_at": "19/01/2025", "full_name": "אביב כהן", "team": "רתק", "personal_id": "9356591", "referral_details": "פיזיותרפיה", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "בינוני", "status": "דרוש תיאום עם חייל"},
            {"created_at": "23/01/2025", "full_name": "עידו כהן", "team": "אתק", "personal_id": "9407286", "referral_details": "פיזיותרפיה", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "נמוך", "status": "דרוש תיאום עם חייל"},
            {"created_at": "17/01/2025", "full_name": "ישי אלון", "team": "רתק", "personal_id": "9379003", "referral_details": "רופא עור", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "בינוני", "status": "דרוש תיאום עם חייל"},
            {"created_at": "18/01/2025", "full_name": "ישי דוד", "team": "רתק", "personal_id": "9077955", "referral_details": "רופא עור", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "בית חולים 10", "priority": "בינוני", "status": "דרוש תיאום עם חייל"},
            {"created_at": "29/01/2025", "full_name": "שי לבוביץ", "team": "רתק", "personal_id": "9416291", "referral_details": "רופא עור", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "בינוני", "status": "דרוש תיאום עם חייל"},
            {"created_at": "06/01/2025", "full_name": "ניר פוני", "team": "אתק", "personal_id": "9287484", "referral_details": "תור לבירור לפני ניתוח", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "בינוני", "status": "ממתין לתאריך מגורם רפואי"},
            {"created_at": "11/02/2025", "full_name": "מקסים ויקול", "team": "רתק", "personal_id": "9175977", "referral_details": "אורולוג", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "חר״פ צריפין", "priority": "בינוני", "status": "דרוש תיאום עם חייל"},
            {"created_at": "11/02/2025", "full_name": "שי וייסמרק", "team": "חוד", "personal_id": "9334741", "referral_details": "בדיקת שמיעה מקיפה", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "בינוני", "status": "דרוש תיאום עם חייל"},
            {"created_at": "13/02/2025", "full_name": "בן ואקנין", "team": "חוד", "personal_id": "9271688", "referral_details": "פיזיותרפיה", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "נמוך", "status": "דרוש תיאום עם חייל"},
            {"created_at": "14/02/2025", "full_name": "יואב אטלן", "team": "חוד", "personal_id": "9067695", "referral_details": "אף אוזן גרון", "has_documents": True, "appointment_date": "23/03/2025 15:00:00", "appointment_path": "", "appointment_location": "אסותא אשדוד", "priority": "בינוני", "status": "נקבע תור"},
            {"created_at": "05/03/2025", "full_name": "הראל טליס", "team": "רתק", "personal_id": "9350120", "referral_details": "אולטראסונד אשכים", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "דחוף ביותר", "status": "דרוש תיאום עם חייל"},
            {"created_at": "05/03/2025", "full_name": "הראל טליס", "team": "רתק", "personal_id": "9350120", "referral_details": "בדיקת דם ובדיקת שתן", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "דחוף ביותר", "status": "דרוש תיאום עם חייל"},
            {"created_at": "05/03/2025", "full_name": "הראל טליס", "team": "רתק", "personal_id": "9350120", "referral_details": "אורולוג", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "בינוני", "status": "דרוש תיאום עם חייל"},
            {"created_at": "05/03/2025", "full_name": "אדם אברמוביץ", "team": "רתק", "personal_id": "9397348", "referral_details": "פיזיותרפיה", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "בינוני", "status": "דרוש תיאום עם חייל"},
            {"created_at": "05/03/2025", "full_name": "יואב רוזנר", "team": "מפלג", "personal_id": "9316943", "referral_details": "אורולוג", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "בינוני", "status": "דרוש תיאום עם חייל"},
            {"created_at": "05/03/2025", "full_name": "אייל ברטל", "team": "אתק", "personal_id": "9327250", "referral_details": "ביופסיה", "has_documents": True, "appointment_date": "10/03/2025 14:00:00", "appointment_path": "", "appointment_location": "", "priority": "דחוף ביותר", "status": "בוצע - הושלם"},
            {"created_at": "05/03/2025", "full_name": "טל ריגר", "team": "חוד", "personal_id": "9417483", "referral_details": "אורתופד כף יד", "has_documents": True, "appointment_date": "13/03/2025 18:12:00", "appointment_path": "", "appointment_location": "", "priority": "דחוף ביותר", "status": "בוצע - הושלם"},
            {"created_at": "12/03/2025", "full_name": "אלעד סטולרו", "team": "חוד", "personal_id": "9397140", "referral_details": "אורתופד כתף", "has_documents": True, "appointment_date": "20/04/2025 11:30:00", "appointment_path": "", "appointment_location": "", "priority": "בינוני", "status": "דרוש תיאום עם חייל"},
            {"created_at": "15/03/2025", "full_name": "ישי אלון", "team": "רתק", "personal_id": "9379003", "referral_details": "צילום חזה", "has_documents": True, "appointment_date": "17/03/2025 00:00:00", "appointment_path": "", "appointment_location": "", "priority": "גבוה", "status": "נקבע תור"},
            {"created_at": "15/03/2025", "full_name": "הלל בן יהודה", "team": "רתק", "personal_id": "9113651", "referral_details": "רופא עור", "has_documents": False, "appointment_date": "11/03/2025 12:00:00", "appointment_path": "", "appointment_location": "", "priority": "דחוף ביותר", "status": "בוצע - הושלם"},
            {"created_at": "15/03/2025", "full_name": "טל ריגר", "team": "חוד", "personal_id": "9417483", "referral_details": "ריפוי בעיסוק", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "גבוה", "status": "נקבע תור"},
            {"created_at": "15/03/2025", "full_name": "גילעד ברנע", "team": "חוד", "personal_id": "8866417", "referral_details": "אורולוג", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "דחוף ביותר", "status": "ממתין לאישור תקציבי/רופא"},
            {"created_at": "15/03/2025", "full_name": "אורי לביא", "team": "אתק", "personal_id": "9223847", "referral_details": "פיזיותרפיה", "has_documents": True, "appointment_date": "", "appointment_path": "", "appointment_location": "", "priority": "גבוה", "status": "דרוש תיאום עם חייל"},
        ]
        
        # עיבוד מפגשי רופאה
        self.stdout.write("מעבד מפגשי רופאה...")
        count = 0
        for visit in doctor_visits:
            try:
                # וידוא שיש מספר אישי
                # בדוק אם יש רשומה קיימת
                existing_referral = Referral.objects.filter(
                    full_name=visit["full_name"],
                    referral_details=visit["referral_details"],
                    referral_type="consultation"
                ).first()
                
                if existing_referral:
                    self.stdout.write(self.style.WARNING(
                        f'דילוג על מפגש רופאה כפול: {visit["full_name"]}, {visit["referral_details"]}'
                    ))
                    continue
                
                # יצירת רשומה חדשה בתוך חוסם עסקאות
                with transaction.atomic():
                    referral = Referral(
                        full_name=visit["full_name"],
                        personal_id=visit["personal_id"],  # לא יכול להיות null, הוספנו קודם מספרים לכולם
                        team=visit["team"] if visit["team"] else "",
                        referral_type="consultation",
                        referral_details=visit["referral_details"],
                        has_documents=False,
                        priority="medium",
                        status="completed",
                        created_by=default_user,
                        last_updated_by=default_user,
                    )
                    
                    # שמירה עם צביעת תאריכים עם אזור זמן
                    current_time = timezone.now()
                    referral.created_at = current_time
                    referral.updated_at = current_time
                    referral.save()
                    
                    count += 1
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'שגיאה בייבוא מפגש רופאה: {e}'))
        
        self.stdout.write(self.style.SUCCESS(f"יובאו {count} מפגשי רופאה בהצלחה"))
        
        # עיבוד טיפולי שיניים
        self.stdout.write("מעבד טיפולי שיניים...")
        count = 0
        for treatment in dental_treatments:
            try:
                # בדיקה אם יש רשומה קיימת
                existing_referral = Referral.objects.filter(
                    full_name=treatment["full_name"],
                    personal_id=treatment["personal_id"],
                    referral_details=treatment["referral_details"],
                    referral_type="dental"
                ).first()
                
                if existing_referral:
                    self.stdout.write(self.style.WARNING(
                        f'דילוג על טיפול שיניים כפול: {treatment["full_name"]}, {treatment["referral_details"]}'
                    ))
                    continue
                
                # יצירת רשומה חדשה בתוך חוסם עסקאות
                with transaction.atomic():
                    referral = Referral(
                        full_name=treatment["full_name"],
                        personal_id=treatment["personal_id"],
                        team=treatment["team"],
                        referral_type="dental",
                        referral_details=treatment["referral_details"],
                        has_documents=False,
                        priority="medium",
                        status="requires_coordination",
                        created_by=default_user,
                        last_updated_by=default_user,
                    )
                    
                    # שמירה עם צביעת תאריכים
                    current_time = timezone.now()
                    referral.created_at = current_time
                    referral.updated_at = current_time
                    referral.save()
                    
                    count += 1
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'שגיאה בייבוא טיפול שיניים: {e}'))
        
        self.stdout.write(self.style.SUCCESS(f"יובאו {count} טיפולי שיניים בהצלחה"))
        
        # עיבוד הפניות רפואיות
        self.stdout.write("מעבד הפניות רפואיות...")
        count = 0
        for ref in referrals:
            try:
                # מיפוי סטטוס ועדיפות
                status_key = status_mapping.get(ref["status"], "requires_coordination")
                priority_key = priority_mapping.get(ref["priority"], "medium") if ref.get("priority") else "medium"
                
                # קביעת סוג ההפניה
                referral_type = self.determine_referral_type(ref["referral_details"])
                
                # בדיקה אם הפניה זו כבר קיימת
                existing_referral = Referral.objects.filter(
                    personal_id=ref["personal_id"],
                    referral_type=referral_type,
                    referral_details=ref["referral_details"]
                ).first()
                
                if existing_referral:
                    self.stdout.write(self.style.WARNING(
                        f'דילוג על הפניה כפולה: {ref["full_name"]}, {ref["personal_id"]}, {ref["referral_details"]}'
                    ))
                    continue
                
                # עיבוד תאריכים
                created_date = None
                if ref.get("created_at"):
                    try:
                        # התחלה עם תאריך naive
                        naive_dt = datetime.datetime.strptime(ref["created_at"], '%d/%m/%Y')
                        # הוספת זמן 00:00:00 והפיכה ל-aware
                        aware_dt = timezone.make_aware(naive_dt)
                        created_date = aware_dt
                    except ValueError:
                        self.stdout.write(self.style.WARNING(f"תאריך לא תקין: {ref['created_at']}, משתמש בתאריך נוכחי"))
                        created_date = timezone.now()
                else:
                    created_date = timezone.now()
                
                appointment_date = None
                if ref.get("appointment_date") and ref["appointment_date"].strip():
                    try:
                        # ניסיון פרסור בפורמט המלא
                        naive_dt = datetime.datetime.strptime(ref["appointment_date"], '%d/%m/%Y %H:%M:%S')
                        appointment_date = timezone.make_aware(naive_dt)
                    except ValueError:
                        try:
                            # ניסיון פרסור בפורמט ללא שניות
                            naive_dt = datetime.datetime.strptime(ref["appointment_date"], '%d/%m/%Y %H:%M')
                            appointment_date = timezone.make_aware(naive_dt)
                        except ValueError:
                            self.stdout.write(self.style.WARNING(f"תאריך תור לא תקין: {ref['appointment_date']}, משאיר ריק"))
                            appointment_date = None
                
                # יצירת רשומה חדשה בתוך חוסם עסקאות
                with transaction.atomic():
                    referral = Referral(
                        full_name=ref["full_name"],
                        personal_id=ref["personal_id"],
                        team=ref["team"],
                        referral_type=referral_type,
                        referral_details=ref["referral_details"],
                        has_documents=ref.get("has_documents", False),
                        priority=priority_key,
                        status=status_key,
                        appointment_date=appointment_date,
                        appointment_path=ref.get("appointment_path", ""),
                        appointment_location=ref.get("appointment_location", ""),
                        notes=ref.get("notes", ""),
                        created_by=default_user,
                        last_updated_by=default_user,
                        created_at=created_date,
                        updated_at=created_date,
                    )
                    
                    # שמירה עם תאריך יצירה מוגדר
                    referral.save()
                    
                    count += 1
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'שגיאה בייבוא הפניה: {e}'))
        
        self.stdout.write(self.style.SUCCESS(f"יובאו {count} הפניות רפואיות בהצלחה"))
    
    def determine_referral_type(self, referral_details):
        """קביעת סוג ההפניה על פי הפרטים"""
        referral_details_lower = referral_details.lower()
        
        if 'שיניים' in referral_details_lower or 'שן' in referral_details_lower or 'שורש' in referral_details_lower:
            return 'dental'
        elif 'אורתופד' in referral_details_lower:
            return 'specialist'
        elif 'פיזיותרפיה' in referral_details_lower or 'ריפוי בעיסוק' in referral_details_lower:
            return 'therapy'
        elif 'אף אוזן גרון' in referral_details_lower or 'עור' in referral_details_lower or 'אורולוג' in referral_details_lower or 'אלרגולוג' in referral_details_lower:
            return 'specialist'
        elif 'דם' in referral_details_lower or 'שתן' in referral_details_lower or 'הישמניה' in referral_details_lower or 'שמיעה' in referral_details_lower:
            return 'lab'
        elif 'אולטראסונד' in referral_details_lower or 'ביופסיה' in referral_details_lower or 'צילום' in referral_details_lower:
            return 'imaging'
        elif 'ניתוח' in referral_details_lower:
            return 'surgery'
        else:
            return 'other'