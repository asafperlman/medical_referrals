# medical-referrals/backend/training/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    TeamTrainingViewSet,
    SoldierViewSet,
    TourniquetTrainingViewSet,
    MedicViewSet,
    MedicTrainingViewSet,
    TrainingStatsView
)

# Define the router
router = DefaultRouter()

# הנתיבים צריכים להיות מותאמים למה שמצופה ב-Frontend
router.register(r'team', TeamTrainingViewSet)
router.register(r'soldiers', SoldierViewSet)
router.register(r'tourniquet', TourniquetTrainingViewSet)
router.register(r'medics', MedicViewSet)
router.register(r'medic', MedicTrainingViewSet)  # שינוי: medic במקום medic-training

# Define the URL patterns
urlpatterns = [
    # Include the router URLs
    path('', include(router.urls)),
    
    # Custom views
    path('stats/', TrainingStatsView.as_view(), name='training-stats'),
]