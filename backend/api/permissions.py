# medical-referrals/backend/api/permissions.py

from rest_framework import permissions


class IsAdminOrManager(permissions.BasePermission):
    """
    מאפשר גישה רק למנהלי מערכת ומנהלים
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_admin or request.user.is_manager


class IsSelfOrAdminOrManager(permissions.BasePermission):
    """
    מאפשר למשתמש לגשת רק לנתונים שלו עצמו, או למנהלים
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
            
        # אם המשתמש הוא מנהל או מנהל מערכת, אפשר גישה מלאה
        if request.user.is_admin or request.user.is_manager:
            return True
            
        # אם זה המשתמש עצמו, אפשר לו גישה לפרטים שלו
        return obj.id == request.user.id


class IsViewerOnly(permissions.BasePermission):
    """
    מאפשר רק קריאת נתונים (ללא עדכון, הוספה או מחיקה)
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        # אם המשתמש הוא צופה בלבד, מאפשר רק פעולות קריאה
        if request.user.is_viewer:
            return request.method in permissions.SAFE_METHODS
            
        # לכל שאר סוגי המשתמשים, אפשר הכל
        return True
        

class FullAccessOrReadOnly(permissions.BasePermission):
    """
    גישה מלאה למשתמשים רגילים, מנהלים, ומנהלי מערכת
    גישה לקריאה בלבד לצופים
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        # אם המשתמש הוא צופה בלבד, מאפשר רק פעולות קריאה
        if request.user.is_viewer:
            return request.method in permissions.SAFE_METHODS
            
        # לכל שאר סוגי המשתמשים, אפשר הכל
        return True


class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    גישה מלאה למנהלי מערכת בלבד, גישה לקריאה לכל השאר
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        # קריאה מותרת לכולם
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # עדכון, הוספה ומחיקה רק למנהלי מערכת
        return request.user.is_admin