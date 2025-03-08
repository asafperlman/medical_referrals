# medical-referrals/backend/api/serializers.py

from rest_framework import serializers
from referrals.models import Referral, ReferralDocument
from accounts.models import User
from audit.models import AuditLog, SystemSetting
from django.contrib.auth.password_validation import validate_password
from django.contrib.contenttypes.models import ContentType
from django.db.models import Count
from rest_framework.permissions import IsAuthenticated 
from rest_framework.response import Response

class UserSerializer(serializers.ModelSerializer):
    """
    סריאלייזר למודל משתמש
    """
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'department', 'phone_number', 'profile_image', 
                 'is_active', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']


class UserCreateSerializer(serializers.ModelSerializer):
    """
    סריאלייזר ליצירת משתמש חדש
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'full_name', 'role', 'department', 
                 'phone_number', 'profile_image', 'is_active']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "סיסמאות לא תואמות"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """
    סריאלייזר לשינוי סיסמה
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "סיסמאות חדשות לא תואמות"})
        return attrs


class ReferralDocumentSerializer(serializers.ModelSerializer):
    """
    סריאלייזר למסמכים מצורפים להפניה
    """
    uploaded_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ReferralDocument
        fields = ['id', 'referral', 'file', 'title', 'description', 'uploaded_at', 
                 'uploaded_by', 'uploaded_by_name']
        read_only_fields = ['uploaded_at', 'uploaded_by', 'uploaded_by_name']

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return obj.uploaded_by.full_name
        return None


class ReferralSerializer(serializers.ModelSerializer):
    """
    סריאלייזר למודל הפניה רפואית
    """
    created_by_name = serializers.SerializerMethodField()
    updated_by_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    priority_display = serializers.SerializerMethodField()
    documents = ReferralDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Referral
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'last_updated_by',
                           'created_by_name', 'updated_by_name']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.full_name
        return None

    def get_updated_by_name(self, obj):
        if obj.last_updated_by:
            return obj.last_updated_by.full_name
        return None
        
    def get_status_display(self, obj):
        return obj.get_status_display()
        
    def get_priority_display(self, obj):
        return obj.get_priority_display()

    def create(self, validated_data):
        user = self.context['request'].user
        referral = Referral.objects.create(**validated_data, created_by=user, last_updated_by=user)
        return referral

    def update(self, instance, validated_data):
        user = self.context['request'].user
        validated_data['last_updated_by'] = user
        return super().update(instance, validated_data)


class ReferralListSerializer(serializers.ModelSerializer):
    """
    סריאלייזר מורחב לרשימת הפניות רפואיות
    """
    status_display = serializers.SerializerMethodField()
    priority_display = serializers.SerializerMethodField()
    referral_type_display = serializers.SerializerMethodField()
    days_since_create = serializers.SerializerMethodField()
    days_since_update = serializers.SerializerMethodField()
    days_until_appointment = serializers.SerializerMethodField()
    is_urgent = serializers.SerializerMethodField()
    
    class Meta:
        model = Referral
        fields = [
            'id', 'full_name', 'personal_id', 'team', 'referral_type', 'referral_type_display',
            'referral_details', 'has_documents', 'status', 'status_display', 
            'priority', 'priority_display', 'appointment_date', 'appointment_location',
            'created_at', 'updated_at', 'days_since_create', 'days_since_update',
            'days_until_appointment', 'is_urgent', 'notes', 'reference_date'
        ]
    
    def get_status_display(self, obj):
        return obj.get_status_display()
        
    def get_priority_display(self, obj):
        return obj.get_priority_display()
        
    def get_referral_type_display(self, obj):
        return obj.get_referral_type_display()
    
    def get_days_since_create(self, obj):
        from django.utils import timezone
        import datetime
        
        now = timezone.now().date()
        delta = now - obj.created_at.date()
        return delta.days
        
    def get_days_since_update(self, obj):
        from django.utils import timezone
        import datetime
        
        now = timezone.now().date()
        delta = now - obj.updated_at.date()
        return delta.days
        
    def get_days_until_appointment(self, obj):
        from django.utils import timezone
        import datetime
        
        if not obj.appointment_date:
            return None
            
        now = timezone.now().date()
        appointment_date = obj.appointment_date.date()
        
        if appointment_date < now:
            return -1 * (now - appointment_date).days  # שלילי אם התור עבר
            
        return (appointment_date - now).days
    
    def get_is_urgent(self, obj):
        return obj.is_urgent    
    


class AuditLogSerializer(serializers.ModelSerializer):
    """
    סריאלייזר לתיעוד פעולות מערכת
    """
    user_name = serializers.SerializerMethodField()
    action_type_display = serializers.SerializerMethodField()
    content_type_str = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ['id', 'timestamp', 'user', 'user_name', 'action_type_display',
                           'content_type_str']
    
    def get_user_name(self, obj):
        if obj.user:
            return obj.user.full_name
        return None
    
    def get_action_type_display(self, obj):
        return obj.get_action_type_display()
    
    def get_content_type_str(self, obj):
        if obj.content_type:
            return obj.content_type.model
        return None


class SystemSettingSerializer(serializers.ModelSerializer):
    """
    סריאלייזר להגדרות מערכת
    """
    class Meta:
        model = SystemSetting
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'last_updated_by']
    
    def create(self, validated_data):
        user = self.context['request'].user
        setting = SystemSetting.objects.create(**validated_data, created_by=user, last_updated_by=user)
        return setting
    
    def update(self, instance, validated_data):
        user = self.context['request'].user
        validated_data['last_updated_by'] = user
        return super().update(instance, validated_data)

class ReferralSerializer(serializers.ModelSerializer):
    # קוד קיים...
    
    def validate(self, data):
        """
        וודא שאין כפילות של הפניה עבור אותו חייל עם אותו סוג הפניה
        """
        # בודק אם זו עריכה (יש instance) או יצירה חדשה
        instance = getattr(self, 'instance', None)
        personal_id = data.get('personal_id')
        referral_type = data.get('referral_type')
        referral_details = data.get('referral_details')
        
        # בודק אם כבר קיימת הפניה עם אותם פרטים
        existing_referral = Referral.objects.filter(
            personal_id=personal_id,
            referral_type=referral_type,
            referral_details=referral_details
        )
        
        # אם זו עריכה, מוציא את ההפניה הנוכחית מהבדיקה
        if instance:
            existing_referral = existing_referral.exclude(id=instance.id)
        
        if existing_referral.exists():
            raise serializers.ValidationError(
                "כבר קיימת הפניה זהה עבור חייל זה עם אותו סוג הפניה ופרטים."
            )
            
        return data
class DashboardStatsSerializer(serializers.Serializer):
    """
    סריאלייזר לנתוני לוח המחוונים
    """
    total_referrals = serializers.IntegerField()
    open_referrals = serializers.IntegerField()
    urgent_referrals = serializers.IntegerField()
    pending_soldiers = serializers.IntegerField()
    scheduled_appointments = serializers.IntegerField()
    upcoming_appointments = serializers.IntegerField()
    long_waiting_referrals = serializers.IntegerField()
    today_completed = serializers.IntegerField()
    week_completed = serializers.IntegerField()
    today_appointments = serializers.IntegerField()
    week_appointments = serializers.IntegerField()
    overdue_appointments = serializers.IntegerField()
    status_breakdown = serializers.DictField()
    priority_breakdown = serializers.DictField()
    referral_types_breakdown = serializers.DictField()
    team_breakdown = serializers.DictField()
    monthly_stats = serializers.ListField()
    today_referrals = serializers.ListField()
    upcoming_referrals = serializers.ListField()
    urgent_pending_referrals = serializers.ListField()    
    total_referrals = serializers.IntegerField()
    open_referrals = serializers.IntegerField()
    urgent_referrals = serializers.IntegerField()
    pending_soldiers = serializers.IntegerField()
    scheduled_appointments = serializers.IntegerField()
    upcoming_appointments = serializers.IntegerField()
    long_waiting_referrals = serializers.IntegerField()
    today_completed = serializers.IntegerField()
    week_completed = serializers.IntegerField()
    today_appointments = serializers.IntegerField()
    week_appointments = serializers.IntegerField()
    overdue_appointments = serializers.IntegerField()
    status_breakdown = serializers.DictField()
    priority_breakdown = serializers.DictField()
    referral_types_breakdown = serializers.DictField()
    team_breakdown = serializers.DictField()
    monthly_stats = serializers.ListField()
    today_referrals = serializers.ListField()
    upcoming_referrals = serializers.ListField()
    urgent_pending_referrals = serializers.ListField()
    """
    API לקבלת סטטיסטיקות מפורטות עבור לוח המחוונים
    """
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
    """
    סריאלייזר לנתוני לוח המחוונים
    """
    total_referrals = serializers.IntegerField()
    open_referrals = serializers.IntegerField()
    urgent_referrals = serializers.IntegerField()
    today_appointments = serializers.IntegerField()
    week_appointments = serializers.IntegerField()
    overdue_appointments = serializers.IntegerField()
    status_breakdown = serializers.DictField()
    priority_breakdown = serializers.DictField()
    referral_types_breakdown = serializers.DictField()
    monthly_stats = serializers.ListField()