# medical-referrals/backend/config/urls.py

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/trainings/', include('training.urls')),  # Added training app URLs

    # Agregar una ruta para el frontend, cualquier ruta no reconocida será manejada por React
    re_path(r'^$', TemplateView.as_view(template_name='index.html')),
    re_path(r'^(?:.*)/?$', TemplateView.as_view(template_name='index.html')),
]

# הוסף נתיבים לקבצים סטטיים ומדיה בסביבת פיתוח
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)