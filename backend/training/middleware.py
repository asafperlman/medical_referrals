class DebugAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # רק בנתיבים של training
        if '/api/trainings/' in request.path or '/api/teams/' in request.path or '/api/soldiers/' in request.path:
            print(f"\n[AUTH DEBUG] Path: {request.path}")
            print(f"[AUTH DEBUG] Method: {request.method}")
            auth_header = request.META.get('HTTP_AUTHORIZATION', 'None')
            if hasattr(request, 'user'):
                print(f"[AUTH DEBUG] User: {request.user}")
            else:
                print("[AUTH DEBUG] No user attribute on request")

            # הצג את התחלת הטוקן (אם קיים) בלי לחשוף את כולו
            if auth_header and auth_header.startswith('Bearer '):
                token_preview = auth_header[7:30] + '...' 
                print(f"[AUTH DEBUG] Token: {token_preview}")
            else:
                print(f"[AUTH DEBUG] Auth Header: {auth_header}")
                
            print(f"[AUTH DEBUG] User: {request.user}")
            print(f"[AUTH DEBUG] Is Authenticated: {request.user.is_authenticated}")

        response = self.get_response(request)
        
        # מידע על התשובה
        if '/api/trainings/' in request.path or '/api/teams/' in request.path or '/api/soldiers/' in request.path:
            print(f"[AUTH DEBUG] Response status: {response.status_code}")
            
        return response