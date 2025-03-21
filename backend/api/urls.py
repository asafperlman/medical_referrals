# medical-referrals/backend/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserViewSet,
    ReferralViewSet,
    ReferralDocumentViewSet,
    AuditLogViewSet,
    SystemSettingViewSet,
    DashboardStatsView,
    TeamReferralsView,
    StatusReferralsView,
    UrgentReferralsView,
    UpcomingAppointmentsView,
    LongWaitingReferralsView,
    SoldierListView
)

# יצירת TeamListView כView פשוט (חסר בפונקציות המיובאות)
from rest_framework.views import APIView
from rest_framework.response import Response
from referrals.models import Referral
from training.models import TourniquetTraining
class TeamListView(APIView):
    """
    API להבאת רשימת צוותים ייחודיים מתוך הפניות
    """
    def get(self, request, format=None):
        teams = TourniquetTraining.objects.values_list('team', flat=True).distinct().order_by('team')
        return Response(list(teams))

# הגדרת נתבים עבור מודלי API
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'referrals', ReferralViewSet)
router.register(r'documents', ReferralDocumentViewSet)
router.register(r'audit-logs', AuditLogViewSet)
router.register(r'settings', SystemSettingViewSet)

# הגדרת נתיבי API מלאים
urlpatterns = [
    # נתיבי אימות והרשאות
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # נתיב לרשימת צוותים
    path('teams/', TeamListView.as_view(), name='team-list'),
    
    # נתיבי לוח מחוונים
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # נתיבים לניתוח נתונים
    path('referrals/by-team/', TeamReferralsView.as_view(), name='referrals-by-team'),
    path('referrals/by-status/', StatusReferralsView.as_view(), name='referrals-by-status'),
    path('referrals/urgent/', UrgentReferralsView.as_view(), name='urgent-referrals'),
    path('referrals/upcoming-appointments/', UpcomingAppointmentsView.as_view(), name='upcoming-appointments'),
    path('referrals/long-waiting/', LongWaitingReferralsView.as_view(), name='long-waiting-referrals'),
    
    # כל נתיבי ה-API שהוגדרו ב-Router
    path('', include(router.urls)),
    
    # הוספת נתיב חדש לרשימת חיילים
    path('soldiers/', SoldierListView.as_view(), name='soldier-list'),
]
