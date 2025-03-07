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
    DashboardStatsView
)

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
    
    # נתיבי לוח מחוונים
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # כל שאר נתיבי ה-API שהוגדרו ב-Router
    path('', include(router.urls)),
]