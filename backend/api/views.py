# medical-referrals/backend/api/views.py

from rest_framework import viewsets, filters, status, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from django.utils import timezone
import datetime
from django.db.models import Count
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count

from .serializers import (
    UserSerializer, UserCreateSerializer, ChangePasswordSerializer,
    ReferralSerializer, ReferralListSerializer, ReferralDocumentSerializer,
    AuditLogSerializer, SystemSettingSerializer, DashboardStatsSerializer
)
from accounts.models import User
from referrals.models import Referral, ReferralDocument
from audit.models import AuditLog, SystemSetting
from .permissions import IsAdminOrManager, IsSelfOrAdminOrManager


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    התחברות מותאמת אישית הכוללת נתוני משתמש
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # הוסף מידע על המשתמש לתשובה
            user = User.objects.get(email=request.data.get('email'))
            user_data = UserSerializer(user).data
            response.data['user'] = user_data
            
            # שמור את כתובת ה-IP של ההתחברות האחרונה
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            
            user.last_login_ip = ip_address
            user.save(update_fields=['last_login_ip'])
            
        return response


class UserViewSet(viewsets.ModelViewSet):
    """
    API לניהול משתמשים
    """
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [IsAuthenticated, IsAdminOrManager]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['email', 'full_name', 'department']
    filterset_fields = ['role', 'is_active']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return [IsAuthenticated(), IsSelfOrAdminOrManager()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        קבל מידע על המשתמש המחובר
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], serializer_class=ChangePasswordSerializer)
    def change_password(self, request, pk=None):
        """
        שינוי סיסמה
        """
        user = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            # בדוק אם הסיסמה הנוכחית נכונה
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": ["סיסמה נוכחית שגויה"]}, status=status.HTTP_400_BAD_REQUEST)
            
            # עדכן את הסיסמה
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "הסיסמה שונתה בהצלחה"}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReferralViewSet(viewsets.ModelViewSet):
    """
    API לניהול הפניות רפואיות
    """
    queryset = Referral.objects.all().order_by('-updated_at')
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['full_name', 'personal_id', 'referral_details', 'notes']
    filterset_fields = {
        'status': ['exact', 'in'],
        'priority': ['exact', 'in'],
        'team': ['exact', 'in'],
        'referral_type': ['exact', 'in'],
        'has_documents': ['exact'],
        'created_at': ['gte', 'lte'],
        'updated_at': ['gte', 'lte'],
        'appointment_date': ['gte', 'lte', 'isnull'],
    }
    ordering_fields = ['full_name', 'updated_at', 'created_at', 'priority', 'appointment_date']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ReferralListSerializer
        return ReferralSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # מסנן לפי תורים שעוד לא היו (תאריך התור בעתיד)
        future_appointments = self.request.query_params.get('future_appointments')
        if future_appointments == 'true':
            queryset = queryset.filter(appointment_date__gt=timezone.now())
        
        # מסנן לפי תורים שכבר היו (תאריך התור בעבר)
        past_appointments = self.request.query_params.get('past_appointments')
        if past_appointments == 'true':
            queryset = queryset.filter(appointment_date__lt=timezone.now())
        
        # מסנן לפי תורים להיום
        today_appointments = self.request.query_params.get('today_appointments')
        if today_appointments == 'true':
            today = timezone.now().date()
            queryset = queryset.filter(appointment_date__date=today)
        
        # מסנן לפי תורים לשבוע הנוכחי
        week_appointments = self.request.query_params.get('week_appointments')
        if week_appointments == 'true':
            today = timezone.now().date()
            week_later = today + datetime.timedelta(days=7)
            queryset = queryset.filter(appointment_date__date__gte=today, appointment_date__date__lte=week_later)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def add_document(self, request, pk=None):
        """
        הוספת מסמך להפניה
        """
        referral = self.get_object()
        serializer = ReferralDocumentSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(referral=referral, uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """
        קבל רשימת מסמכים להפניה
        """
        referral = self.get_object()
        documents = referral.documents.all()
        serializer = ReferralDocumentSerializer(documents, many=True)
        return Response(serializer.data)


class ReferralDocumentViewSet(viewsets.ModelViewSet):
    """
    API לניהול מסמכים מצורפים להפניות
    """
    queryset = ReferralDocument.objects.all()
    serializer_class = ReferralDocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API לצפייה בתיעוד פעולות מערכת (קריאה בלבד)
    """
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManager]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['action_detail', 'ip_address']
    filterset_fields = {
        'user': ['exact'],
        'action_type': ['exact', 'in'],
        'timestamp': ['gte', 'lte'],
        'content_type': ['exact'],
    }


class SystemSettingViewSet(viewsets.ModelViewSet):
    """
    API לניהול הגדרות מערכת
    """
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['key', 'description']


class DashboardStatsView(generics.GenericAPIView):
    """
    API לקבלת סטטיסטיקות מפורטות עבור לוח המחוונים
    """
    serializer_class = DashboardStatsSerializer
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        """
        קבל נתונים סטטיסטיים מפורטים עבור לוח המחוונים
        """
        from django.utils import timezone
        import datetime
        
        today = timezone.now().date()
        
        # סך כל ההפניות
        total_referrals = Referral.objects.count()
        
        # הפניות פתוחות (כל מה שלא הושלם/בוטל)
        open_referrals = Referral.objects.exclude(status__in=['completed', 'cancelled', 'no_show']).count()
        
        # מספר חיילים ממתינים לטיפול (הפניות פתוחות לפי מספר אישי ייחודי)
        pending_soldiers = Referral.objects.exclude(
            status__in=['completed', 'cancelled', 'no_show']
        ).values('personal_id').distinct().count()
        
        # מספר תורים שנקבעו
        scheduled_appointments = Referral.objects.filter(
            status='appointment_scheduled'
        ).count()
        
        # תורים דחופים (לפי סטטוס דחיפות)
        urgent_referrals = Referral.objects.filter(
            priority__in=['highest', 'urgent', 'high']
        ).exclude(
            status__in=['completed', 'cancelled', 'no_show']
        ).count()
        
        # תורים קרובים (3 ימים הקרובים)
        three_days_later = today + datetime.timedelta(days=3)
        upcoming_appointments = Referral.objects.filter(
            appointment_date__date__gte=today,
            appointment_date__date__lte=three_days_later
        ).count()
        
        # תורים עם המתנה ארוכה ללא תור (מעל 20 ימים)
        twenty_days_ago = today - datetime.timedelta(days=20)
        long_waiting_referrals = Referral.objects.filter(
            created_at__date__lte=twenty_days_ago,
            appointment_date__isnull=True
        ).exclude(
            status__in=['completed', 'cancelled', 'no_show']
        ).count()
        
        # תורים שבוצעו היום
        today_completed = Referral.objects.filter(
            status='completed',
            updated_at__date=today
        ).count()
        
        # תורים שבוצעו בשבוע האחרון
        week_ago = today - datetime.timedelta(days=7)
        week_completed = Referral.objects.filter(
            status='completed',
            updated_at__date__gte=week_ago,
            updated_at__date__lte=today
        ).count()
        
        # תורים להיום
        today_appointments = Referral.objects.filter(
            appointment_date__date=today
        ).count()
        
        # תורים לשבוע הקרוב
        week_later = today + datetime.timedelta(days=7)
        week_appointments = Referral.objects.filter(
            appointment_date__date__gte=today,
            appointment_date__date__lte=week_later
        ).count()
        
        # תורים שעברו והסטטוס לא "הושלם"
        overdue_appointments = Referral.objects.filter(
            appointment_date__lt=timezone.now(),
            status__in=['appointment_scheduled', 'requires_coordination', 'requires_soldier_coordination', 'waiting_for_medical_date']
        ).count()
        
        # התפלגות לפי סטטוס
        status_counts = Referral.objects.values('status').annotate(count=Count('status'))
        status_breakdown = {item['status']: item['count'] for item in status_counts}
        
        # התפלגות לפי עדיפות
        priority_counts = Referral.objects.values('priority').annotate(count=Count('priority'))
        priority_breakdown = {item['priority']: item['count'] for item in priority_counts}
        
        # התפלגות לפי סוג הפניה
        referral_types_counts = Referral.objects.values('referral_type').annotate(count=Count('referral_type'))
        referral_types_breakdown = {item['referral_type']: item['count'] for item in referral_types_counts}
        
        # התפלגות לפי צוות
        team_counts = Referral.objects.values('team').annotate(count=Count('team'))
        team_breakdown = {item['team']: item['count'] for item in team_counts}
        
        # סטטיסטיקות חודשיות (6 חודשים אחרונים)
        six_months_ago = timezone.now() - datetime.timedelta(days=180)
        monthly_stats = []
        
        current_date = six_months_ago
        while current_date <= timezone.now():
            month_start = current_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if current_date.month == 12:
                month_end = current_date.replace(year=current_date.year+1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0) - datetime.timedelta(seconds=1)
            else:
                month_end = current_date.replace(month=current_date.month+1, day=1, hour=0, minute=0, second=0, microsecond=0) - datetime.timedelta(seconds=1)
            
            created_count = Referral.objects.filter(created_at__gte=month_start, created_at__lte=month_end).count()
            completed_count = Referral.objects.filter(status='completed', updated_at__gte=month_start, updated_at__lte=month_end).count()
            
            monthly_stats.append({
                'month': month_start.strftime('%Y-%m'),
                'month_display': month_start.strftime('%m/%Y'),
                'created': created_count,
                'completed': completed_count
            })
            
            # עבור לחודש הבא
            if current_date.month == 12:
                current_date = current_date.replace(year=current_date.year+1, month=1)
            else:
                current_date = current_date.replace(month=current_date.month+1)
        
        # רשימת הפניות מסודרות לפי תאריך
        today_referrals = Referral.objects.filter(
            appointment_date__date=today
        ).order_by('appointment_date')[:10]
        
        upcoming_referrals = Referral.objects.filter(
            appointment_date__date__gt=today,
            appointment_date__date__lte=week_later
        ).order_by('appointment_date')[:10]
        
        urgent_pending_referrals = Referral.objects.filter(
            priority__in=['highest', 'urgent', 'high'],
            status__in=['requires_coordination', 'requires_soldier_coordination', 'waiting_for_medical_date']
        ).order_by('-updated_at')[:10]
        
        # הכן את המידע לסריאלייזר
        data = {
            'total_referrals': total_referrals,
            'open_referrals': open_referrals,
            'urgent_referrals': urgent_referrals,
            'pending_soldiers': pending_soldiers,
            'scheduled_appointments': scheduled_appointments,
            'upcoming_appointments': upcoming_appointments,
            'long_waiting_referrals': long_waiting_referrals,
            'today_completed': today_completed,
            'week_completed': week_completed,
            'today_appointments': today_appointments,
            'week_appointments': week_appointments,
            'overdue_appointments': overdue_appointments,
            'status_breakdown': status_breakdown,
            'priority_breakdown': priority_breakdown,
            'referral_types_breakdown': referral_types_breakdown,
            'team_breakdown': team_breakdown,
            'monthly_stats': monthly_stats,
            'today_referrals': ReferralListSerializer(today_referrals, many=True).data,
            'upcoming_referrals': ReferralListSerializer(upcoming_referrals, many=True).data,
            'urgent_pending_referrals': ReferralListSerializer(urgent_pending_referrals, many=True).data
        }
        
        serializer = self.get_serializer(data)
        return Response(serializer.data)


class TeamReferralsView(generics.GenericAPIView):
    """
    API לקבלת הפניות מסודרות לפי צוות
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        """
        קבל רשימת הפניות מסודרות לפי צוות
        """
        # קבל את כל הצוותים הקיימים
        teams = Referral.objects.values_list('team', flat=True).distinct().order_by('team')
        
        result = {}
        
        for team in teams:
            # קבל את כל ההפניות לצוות
            referrals = Referral.objects.filter(team=team).exclude(
                status__in=['completed', 'cancelled', 'no_show']
            ).order_by('-priority', 'created_at')
            
            # סדר את ההפניות לפי סטטוס
            result[team] = {
                'total': referrals.count(),
                'urgent': referrals.filter(priority__in=['highest', 'urgent', 'high']).count(),
                'needs_coordination': referrals.filter(status__in=['requires_coordination', 'requires_soldier_coordination']).count(),
                'scheduled': referrals.filter(status='appointment_scheduled').count(),
                'waiting': referrals.filter(status__in=['waiting_for_medical_date', 'waiting_for_budget_approval', 'waiting_for_doctor_referral']).count(),
                'referrals': ReferralListSerializer(referrals, many=True).data
            }
        
        return Response(result)


class StatusReferralsView(generics.GenericAPIView):
    """
    API לקבלת הפניות מסודרות לפי סטטוס
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        """
        קבל רשימת הפניות מסודרות לפי סטטוס
        """
        # קבל את כל הסטטוסים הקיימים (למעט אלה שהסתיימו)
        active_statuses = [status for status, _ in Referral.STATUS_CHOICES if status not in ['completed', 'cancelled', 'no_show']]
        
        result = {}
        
        for status in active_statuses:
            # קבל את כל ההפניות בסטטוס
            referrals = Referral.objects.filter(status=status).order_by('-priority', 'created_at')
            
            # סדר את ההפניות לפי צוות
            teams = {}
            for team in referrals.values_list('team', flat=True).distinct():
                team_referrals = referrals.filter(team=team)
                teams[team] = {
                    'count': team_referrals.count(),
                    'referrals': ReferralListSerializer(team_referrals, many=True).data
                }
            
            result[status] = {
                'display': dict(Referral.STATUS_CHOICES).get(status, status),
                'total': referrals.count(),
                'urgent': referrals.filter(priority__in=['highest', 'urgent', 'high']).count(),
                'by_team': teams,
                'referrals': ReferralListSerializer(referrals, many=True).data
            }
        
        return Response(result)


class UrgentReferralsView(generics.GenericAPIView):
    """
    API לקבלת הפניות דחופות
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        """
        קבל רשימת הפניות דחופות
        """
        # קבל את כל ההפניות הדחופות שעדיין לא הסתיימו
        referrals = Referral.objects.filter(
            priority__in=['highest', 'urgent', 'high']
        ).exclude(
            status__in=['completed', 'cancelled', 'no_show']
        ).order_by('created_at')
        
        # סדר לפי זמן ההמתנה
        result = {
            'total': referrals.count(),
            'by_priority': {
                'highest': referrals.filter(priority='highest').count(),
                'urgent': referrals.filter(priority='urgent').count(),
                'high': referrals.filter(priority='high').count()
            },
            'by_status': {
                status: referrals.filter(status=status).count() 
                for status in referrals.values_list('status', flat=True).distinct()
            },
            'by_team': {
                team: referrals.filter(team=team).count()
                for team in referrals.values_list('team', flat=True).distinct()
            },
            'oldest': ReferralListSerializer(referrals.order_by('created_at')[:10], many=True).data,
            'no_appointment': ReferralListSerializer(
                referrals.filter(appointment_date__isnull=True).order_by('created_at'),
                many=True
            ).data,
            'all_referrals': ReferralListSerializer(referrals, many=True).data
        }
        
        return Response(result)


class UpcomingAppointmentsView(generics.GenericAPIView):
    """
    API לקבלת תורים קרובים
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        """
        קבל רשימת תורים קרובים
        """
        from django.utils import timezone
        import datetime
        
        today = timezone.now().date()
        week_later = today + datetime.timedelta(days=7)
        
        # תורים להיום
        today_appointments = Referral.objects.filter(
            appointment_date__date=today
        ).order_by('appointment_date')
        
        # תורים בשבוע הקרוב (לא כולל היום)
        week_appointments = Referral.objects.filter(
            appointment_date__date__gt=today,
            appointment_date__date__lte=week_later
        ).order_by('appointment_date')
        
        # תורים ליום מסוים בשבוע הקרוב
        days_appointments = {}
        for i in range(8):  # היום + 7 ימים קדימה
            day = today + datetime.timedelta(days=i)
            day_str = day.strftime('%Y-%m-%d')
            day_display = day.strftime('%d/%m/%Y')
            day_appointments = Referral.objects.filter(appointment_date__date=day).order_by('appointment_date')
            
            if day_appointments.exists():
                days_appointments[day_str] = {
                    'date_display': day_display,
                    'count': day_appointments.count(),
                    'appointments': ReferralListSerializer(day_appointments, many=True).data
                }
        
        result = {
            'today': {
                'date': today.strftime('%Y-%m-%d'),
                'date_display': today.strftime('%d/%m/%Y'),
                'count': today_appointments.count(),
                'by_team': {
                    team: today_appointments.filter(team=team).count()
                    for team in today_appointments.values_list('team', flat=True).distinct()
                },
                'by_location': {
                    loc: today_appointments.filter(appointment_location=loc).count()
                    for loc in today_appointments.values_list('appointment_location', flat=True).distinct()
                    if loc  # רק מיקומים שאינם ריקים
                },
                'appointments': ReferralListSerializer(today_appointments, many=True).data
            },
            'week': {
                'start_date': today.strftime('%Y-%m-%d'),
                'end_date': week_later.strftime('%Y-%m-%d'),
                'count': week_appointments.count(),
                'by_team': {
                    team: week_appointments.filter(team=team).count()
                    for team in week_appointments.values_list('team', flat=True).distinct()
                },
                'by_location': {
                    loc: week_appointments.filter(appointment_location=loc).count()
                    for loc in week_appointments.values_list('appointment_location', flat=True).distinct()
                    if loc  # רק מיקומים שאינם ריקים
                },
                'appointments': ReferralListSerializer(week_appointments, many=True).data
            },
            'by_day': days_appointments
        }
        
        return Response(result)


class LongWaitingReferralsView(generics.GenericAPIView):
    """
    API לקבלת הפניות עם זמן המתנה ארוך
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        """
        קבל רשימת הפניות עם זמן המתנה ארוך
        """
        from django.utils import timezone
        import datetime
        
        today = timezone.now().date()
        
        # הפניות שממתינות מעל 20 יום ללא תור
        twenty_days_ago = today - datetime.timedelta(days=20)
        long_waiting_referrals = Referral.objects.filter(
            created_at__date__lte=twenty_days_ago,
            appointment_date__isnull=True
        ).exclude(
            status__in=['completed', 'cancelled', 'no_show']
        ).order_by('created_at')
        
        # קטגוריות זמן המתנה
        waiting_categories = {
            '20-30': (20, 30),
            '31-60': (31, 60),
            '61-90': (61, 90),
            '91+': (91, 1000)
        }
        
        by_waiting_time = {}
        for category, (min_days, max_days) in waiting_categories.items():
            min_date = today - datetime.timedelta(days=max_days)
            max_date = today - datetime.timedelta(days=min_days)
            
            category_referrals = Referral.objects.filter(
                created_at__date__gt=min_date,
                created_at__date__lte=max_date,
                appointment_date__isnull=True
            ).exclude(
                status__in=['completed', 'cancelled', 'no_show']
            ).order_by('created_at')
            
            if category_referrals.exists():
                by_waiting_time[category] = {
                    'count': category_referrals.count(),
                    'referrals': ReferralListSerializer(category_referrals, many=True).data
                }
        
        result = {
            'total': long_waiting_referrals.count(),
            'by_team': {
                team: long_waiting_referrals.filter(team=team).count()
                for team in long_waiting_referrals.values_list('team', flat=True).distinct()
            },
            'by_status': {
                status: long_waiting_referrals.filter(status=status).count()
                for status in long_waiting_referrals.values_list('status', flat=True).distinct()
            },
            'by_priority': {
                priority: long_waiting_referrals.filter(priority=priority).count()
                for priority in long_waiting_referrals.values_list('priority', flat=True).distinct()
            },
            'by_waiting_time': by_waiting_time,
            'all_referrals': ReferralListSerializer(long_waiting_referrals, many=True).data
        }
        
        return Response(result)