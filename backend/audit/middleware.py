# medical-referrals/backend/audit/middleware.py

import json
from django.contrib.contenttypes.models import ContentType
from django.utils.deprecation import MiddlewareMixin
from .models import AuditLog

class AuditLogMiddleware(MiddlewareMixin):
    """
    מידלוור שאחראי על תיעוד פעולות במערכת
    """
    def __init__(self, get_response):
        super().__init__(get_response)
        self.get_response = get_response
        # רשימת נתיבים שלא נרצה לתעד
        self.IGNORED_PATHS = [
            '/admin/jsi18n/',
            '/static/',
            '/media/',
            '/favicon.ico',
        ]
        # סוגי בקשות שנרצה לתעד
        self.AUDIT_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

    def process_request(self, request):
        # שמור את גוף הבקשה המקורי (לפני עיבוד)
        if request.method in self.AUDIT_METHODS:
            # שמור את הבקשה המקורית לשימוש בהמשך
            request._body = request.body

    def process_response(self, request, response):
        # בדוק אם צריך לתעד את הבקשה
        if self._should_log_request(request):
            try:
                # קבל פרטי משתמש
                user = request.user if request.user.is_authenticated else None
                
                # קבל כתובת IP
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    ip_address = x_forwarded_for.split(',')[0].strip()
                else:
                    ip_address = request.META.get('REMOTE_ADDR')
                
                # קבע סוג פעולה לפי סוג בקשה
                action_type = self._get_action_type(request)
                
                # נתח את גוף הבקשה
                request_body = self._parse_request_body(request)
                
                # צור רשומת אודיט לוג
                AuditLog.objects.create(
                    user=user,
                    ip_address=ip_address,
                    action_type=action_type,
                    action_detail=f"{request.method} {request.path}",
                    new_values=request_body,
                    notes=f"Status code: {response.status_code}"
                )
            except Exception as e:
                # תפוס שגיאות כדי לא לשבור את המערכת
                print(f"Error logging audit: {str(e)}")
                
        return response

    def _should_log_request(self, request):
        """
        בדוק אם צריך לתעד את הבקשה
        """
        # אל תתעד בקשות סטטיות ולא רלוונטיות
        for path in self.IGNORED_PATHS:
            if request.path.startswith(path):
                return False
        
        # תעד רק בקשות שמשנות מידע
        if request.method not in self.AUDIT_METHODS:
            # תעד גם בקשות התחברות/התנתקות
            if '/api/auth/' in request.path and request.method == 'POST':
                return True
            return False
            
        return True
        
    def _get_action_type(self, request):
        """
        קבל את סוג הפעולה לפי סוג הבקשה
        """
        if request.method == 'POST':
            if '/login/' in request.path:
                return 'login'
            if '/logout/' in request.path:
                return 'logout'
            return 'create'
        elif request.method in ['PUT', 'PATCH']:
            return 'update'
        elif request.method == 'DELETE':
            return 'delete'
        else:
            return 'other'
            
    def _parse_request_body(self, request):
        """
        נתח את גוף הבקשה לפורמט JSON
        """
        try:
            if hasattr(request, '_body'):
                body = request._body
                if body:
                    try:
                        # נסה לפענח JSON
                        return json.loads(body.decode('utf-8'))
                    except (ValueError, UnicodeDecodeError):
                        # אם זה לא JSON, החזר כמחרוזת
                        return {'raw_data': str(body)}
                        
            # נסה לקבל מידע מה-POST או ה-FILES
            if request.method == 'POST':
                post_data = {key: value for key, value in request.POST.items()}
                files_data = {key: f"{value.name} ({value.size} bytes)" for key, value in request.FILES.items()}
                return {**post_data, **files_data}
                
            return None
        except Exception as e:
            return {'error': str(e)}