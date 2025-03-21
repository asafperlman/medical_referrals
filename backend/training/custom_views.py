from rest_framework import viewsets
from rest_framework.renderers import JSONRenderer
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name='dispatch')
class APIOnlyViewSet(viewsets.ModelViewSet):
    """
    ViewSet בסיסי שמחזיר רק JSON ללא רנדור HTML
    """
    renderer_classes = [JSONRenderer]
    permission_classes = [IsAuthenticated]
    # אם נעשה שימוש ישיר בקלאס זה, יש להגדיר גם queryset או לספק basename בעת רישום ב-router
