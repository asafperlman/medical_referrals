# medical-referrals/backend/training/management/commands/import_training_data.py

import datetime
import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from accounts.models import User
from training.models import TeamTraining, Soldier, TourniquetTraining, Medic, MedicTraining


class Command(BaseCommand):
    help = 'יצירת נתוני תרגולים לדוגמה למערכת'

    def handle(self, *args, **options):
        try:
            # Get a user for created_by fields
            try:
                default_user = User.objects.get(role='admin')
            except User.DoesNotExist:
                default_user = User.objects.filter(is_staff=True).first()
                if not default_user:
                    default_user = User.objects.first()
                    if not default_user:
                        self.stdout.write(self.style.ERROR('לא נמצאו משתמשים במערכת. יש ליצור משתמש לפני ייבוא הנתונים.'))
                        return

            with transaction.atomic():
                # Create sample data
                self._create_soldiers(default_user)
                self._create_medics(default_user)
                self._create_team_trainings(default_user)
                self._create_tourniquet_trainings(default_user)
                self._create_medic_trainings(default_user)

            self.stdout.write(self.style.SUCCESS('נתוני תרגולים לדוגמה נוצרו בהצלחה'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'שגיאה ביצירת נתוני דוגמה: {str(e)}'))

    def _create_soldiers(self, user):
        # Check if soldiers already exist
        if Soldier.objects.exists():
            self.stdout.write(self.style.WARNING('חיילים כבר קיימים במערכת. מדלג על יצירת חיילים.'))
            return

        soldiers_data = [
            {'name': 'נועם עקה זוהר', 'team': 'חוד', 'personal_id': '9114251'},
            {'name': 'נהר שדמי', 'team': 'חוד', 'personal_id': '9292413'},
            {'name': 'יואב אטלן', 'team': 'חוד', 'personal_id': '9067695'},
            {'name': 'בן שטינברג', 'team': 'חוד', 'personal_id': '9180189'},
            {'name': 'יהלי חמו', 'team': 'חוד', 'personal_id': '9407190'},
            {'name': 'שמעון מימון', 'team': 'חוד', 'personal_id': '9409642'},
            {'name': "יונתן ג'יימס", 'team': 'חוד', 'personal_id': '9383684'},
            {'name': 'בן ואקנין', 'team': 'חוד', 'personal_id': '9271688'},
            {'name': 'דניאל רז', 'team': 'מפלג', 'personal_id': '9148536'},
            {'name': 'דרור שוקר', 'team': 'אתק', 'personal_id': '9131984'},
            {'name': 'לידור פיין זילברג', 'team': 'רתק', 'personal_id': '9389221'},
            {'name': 'הלל בן יהודה', 'team': 'רתק', 'personal_id': '9113651'},
            {'name': 'ארתור קנבסקי', 'team': 'אתק', 'personal_id': '9411096'},
            {'name': 'יואב תומר', 'team': 'אתק', 'personal_id': '9387449'},
            {'name': 'הראל טליס', 'team': 'רתק', 'personal_id': '9350120'},
            {'name': 'איתן נוי', 'team': 'אתק', 'personal_id': '9254926'},
            {'name': 'אוהד סולימן', 'team': 'אתק', 'personal_id': '9387008'},
            {'name': 'ישי אלון', 'team': 'רתק', 'personal_id': '9379003'},
            {'name': 'אביב כהן', 'team': 'רתק', 'personal_id': '9356591'},
            {'name': 'עידו כהן', 'team': 'אתק', 'personal_id': '9407286'},
        ]

        soldiers = []
        for data in soldiers_data:
            soldier = Soldier(
                name=data['name'],
                personal_id=data['personal_id'],
                team=data['team'],
            )
            soldiers.append(soldier)

        Soldier.objects.bulk_create(soldiers)
        self.stdout.write(f'נוצרו {len(soldiers)} חיילים')

    def _create_medics(self, user):
        # Check if medics already exist
        if Medic.objects.exists():
            self.stdout.write(self.style.WARNING('חובשים כבר קיימים במערכת. מדלג על יצירת חובשים.'))
            return

        medics_data = [
            {'name': 'דן לוי', 'team': 'אתק', 'role': 'חובש פלוגתי', 'experience': 'מתקדם'},
            {'name': 'עידן כהן', 'team': 'רתק', 'role': 'חובש פלוגתי', 'experience': 'מתחיל'},
            {'name': 'אורי אלון', 'team': 'חוד', 'role': 'חובש פלוגתי', 'experience': 'בכיר'},
            {'name': 'יובל ישראלי', 'team': 'מפלג', 'role': 'חובש גדודי', 'experience': 'בכיר'},
            {'name': 'אוהד נמרי', 'team': 'אתק', 'role': 'חובש פלוגתי', 'experience': 'מתקדם'},
            {'name': 'רועי בן חיים', 'team': 'חוד', 'role': 'חובש פלוגתי', 'experience': 'מתחיל'},
        ]

        medics = []
        for data in medics_data:
            medic = Medic(
                name=data['name'],
                team=data['team'],
                role=data['role'],
                experience=data['experience'],
            )
            medics.append(medic)

        Medic.objects.bulk_create(medics)
        self.stdout.write(f'נוצרו {len(medics)} חובשים')

    def _create_team_trainings(self, user):
        # Check if team trainings already exist
        if TeamTraining.objects.exists():
            self.stdout.write(self.style.WARNING('תרגולי צוות כבר קיימים במערכת. מדלג על יצירת תרגולים.'))
            return

        scenarios = [
            'פציעות הדף',
            'פציעות רסיסים',
            'טיפול בפצוע רב-מערכתי',
            'טיפול בפצועים מרובים',
            'פינוי מרובה פצועים',
            'פריסת נקודת טיפול בשטח',
            'טיפול תחת אש',
            'הערכת חלל רפואי',
        ]

        locations = [
            'אזור אלפא',
            'שטח אימונים',
            'אזור בטא',
            'אזור אימונים C',
            'שדה אימונים ראשי',
            'בסיס אימונים',
            'אזור אורבני',
        ]

        notes = [
            'הצוות תיפקד היטב',
            'נדרש תרגול נוסף בנושא חבישות',
            'טוב מאוד',
            'ביצוע סביר, יש לשפר זמני תגובה',
            'תיאום טוב בין אנשי הצוות',
            'בוצע ריענון הנהלים',
            'יש לשפר תקשורת בין חברי הצוות',
            '',
        ]

        teams = ['חוד', 'אתק', 'רתק', 'מפלג']
        
        # Create trainings for last 3 months
        now = timezone.now().date()
        trainings = []
        
        for i in range(20):
            days_ago = random.randint(0, 90)
            training_date = now - datetime.timedelta(days=days_ago)
            
            training = TeamTraining(
                date=training_date,
                team=random.choice(teams),
                scenario=random.choice(scenarios),
                location=random.choice(locations),
                notes=random.choice(notes),
                performance_rating=random.randint(2, 5),
                created_by=user,
                last_updated_by=user,
            )
            trainings.append(training)

        TeamTraining.objects.bulk_create(trainings)
        self.stdout.write(f'נוצרו {len(trainings)} תרגולי צוות')

    def _create_tourniquet_trainings(self, user):
        # Check if tourniquet trainings already exist
        if TourniquetTraining.objects.exists():
            self.stdout.write(self.style.WARNING('תרגולי חסמי עורקים כבר קיימים במערכת. מדלג על יצירת תרגולים.'))
            return

        # Get all soldiers
        soldiers = Soldier.objects.all()
        if not soldiers:
            self.stdout.write(self.style.ERROR('לא נמצאו חיילים במערכת. לא ניתן ליצור תרגולי חסמי עורקים.'))
            return

        now = timezone.now().date()
        trainings = []
        
        # Create 1-3 trainings per soldier
        for soldier in soldiers:
            num_trainings = random.randint(1, 3)
            
            for i in range(num_trainings):
                days_ago = random.randint(0, 120)
                training_date = now - datetime.timedelta(days=days_ago)
                
                # CAT time - mostly good but sometimes not
                cat_time = str(random.randint(20, 45))
                passed = cat_time < "35"  # Pass if under 35 seconds
                
                notes = ""
                if not passed:
                    notes = "צריך תרגול נוסף, זמן הנחה ארוך מדי"
                elif i > 0:
                    notes = "שיפור ניכר בזמן ההנחה"
                    
                training = TourniquetTraining(
                    soldier=soldier,
                    training_date=training_date,
                    cat_time=cat_time,
                    passed=passed,
                    notes=notes,
                    created_by=user,
                    last_updated_by=user,
                )
                trainings.append(training)

        TourniquetTraining.objects.bulk_create(trainings)
        self.stdout.write(f'נוצרו {len(trainings)} תרגולי חסמי עורקים')

    def _create_medic_trainings(self, user):
        # Check if medic trainings already exist
        if MedicTraining.objects.exists():
            self.stdout.write(self.style.WARNING('תרגולי חובשים כבר קיימים במערכת. מדלג על יצירת תרגולים.'))
            return

        # Get all medics
        medics = Medic.objects.all()
        if not medics:
            self.stdout.write(self.style.ERROR('לא נמצאו חובשים במערכת. לא ניתן ליצור תרגולי חובשים.'))
            return

        training_types = [
            'החייאה',
            'טיפול בפציעות ראש',
            'החדרת נתיב אוויר',
            'עצירת דימומים',
            'טיפול בפגיעות חזה',
            'הנחת עירוי',
            'טיפול בהלם',
            'חבישות',
            'פינוי נפגעים',
            'ציוד רפואי והכרתו',
        ]
        
        locations = [
            'חדר הדרכה',
            'מרפאה',
            'מרכז אימונים',
            'כיתת לימוד',
            'שטח פתוח',
        ]
        
        notes = [
            'ביצוע טוב של פרוטוקול החייאה',
            'הנחת חוסם עורקים בזמן סביר',
            'ביצוע מצוין של תרגול פינוי',
            'יש לשפר את מיומנויות התקשורת',
            'עמידה בלוחות זמנים',
            '',
        ]
        
        recommendations = [
            'לתרגל תקשורת בעת החייאה',
            'נדרש שיפור בטכניקת חבישות לחץ',
            'להמשיך באותה רמה',
            'יש לשפר את זיהוי סימני ההלם',
            'יש להתמקד בהליכי עבודה מסודרים',
            '',
        ]

        now = timezone.now().date()
        trainings = []
        
        # Create 2-5 trainings per medic
        for medic in medics:
            num_trainings = random.randint(2, 5)
            training_types_used = random.sample(training_types, min(num_trainings, len(training_types)))
            
            for i, training_type in enumerate(training_types_used):
                days_ago = random.randint(0, 120)
                training_date = now - datetime.timedelta(days=days_ago)
                
                # More experienced medics tend to get better ratings
                base_rating = 3
                if medic.experience == 'מתקדם':
                    base_rating = 4
                elif medic.experience == 'בכיר':
                    base_rating = 5
                
                # Add some randomness
                performance_rating = max(1, min(5, base_rating + random.randint(-1, 1)))
                
                training = MedicTraining(
                    medic=medic,
                    training_date=training_date,
                    training_type=training_type,
                    performance_rating=performance_rating,
                    attendance=random.random() > 0.1,  # 90% chance of full attendance
                    notes=random.choice(notes),
                    recommendations=random.choice(recommendations),
                    location=random.choice(locations),
                    created_by=user,
                    last_updated_by=user,
                )
                trainings.append(training)

        MedicTraining.objects.bulk_create(trainings)
        self.stdout.write(f'נוצרו {len(trainings)} תרגולי חובשים')