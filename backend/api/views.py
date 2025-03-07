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
    API לקבלת סטטיסטיקות עבור לוח המחוונים
    """
    serializer_class = DashboardStatsSerializer
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        """
        קבל נתונים סטטיסטיים עבור לוח המחוונים
        """
        # סך כל ההפניות
        total_referrals = Referral.objects.count()
        
        # הפניות פתוחות (כל מה שלא הושלם)
        open_referrals = Referral.objects.exclude(status='completed').count()
        
        # הפניות דחופות
        urgent_referrals = Referral.objects.filter(priority='urgent').exclude(status__in=['completed', 'cancelled']).count()
        
        # תורים להיום
        today = timezone.now().date()
        today_appointments = Referral.objects.filter(appointment_date__date=today).count()
        
        # תורים לשבוע הקרוב
        week_later = today + datetime.timedelta(days=7)
        week_appointments = Referral.objects.filter(
            appointment_date__date__gte=today,
            appointment_date__date__lte=week_later
        ).count()
        
        # תורים שעברו והסטטוס לא "הושלם"
        overdue_appointments = Referral.objects.filter(
            appointment_date__lt=timezone.now(),
            status__in=['new', 'in_progress', 'waiting_for_approval', 'appointment_scheduled']
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
        
        # הכן את המידע לסריאלייזר
        data = {
            'total_referrals': total_referrals,
            'open_referrals': open_referrals,
            'urgent_referrals': urgent_referrals,
            'today_appointments': today_appointments,
            'week_appointments': week_appointments,
            'overdue_appointments': overdue_appointments,
            'status_breakdown': status_breakdown,
            'priority_breakdown': priority_breakdown,
            'referral_types_breakdown': referral_types_breakdown,
            'monthly_stats': monthly_stats
        }
        
        serializer = self.get_serializer(data)
        return Response(serializer.data)