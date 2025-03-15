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
        """
        עדכון הפניה קיימת עם טיפול טוב יותר בשדות
        """
        user = self.context['request'].user
        validated_data['last_updated_by'] = user
        
        # עדכן את כל השדות שהועברו בבקשה
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
        
    def validate(self, data):
        """
        וודא שאין כפילות של הפניה עבור אותו חייל עם אותו סוג הפניה
        """
        # בודק אם זו עריכה (יש instance) או יצירה חדשה
        instance = getattr(self, 'instance', None)
        
        # אם זו עריכה, משתמשים בערכים מהמופע הקיים אם לא סופקו בנתונים החדשים
        if instance:
            personal_id = data.get('personal_id', instance.personal_id)
            referral_type = data.get('referral_type', instance.referral_type)
            referral_details = data.get('referral_details', instance.referral_details)
        else:
            # אם זו יצירה חדשה, נשתמש רק בנתונים שסופקו
            personal_id = data.get('personal_id')
            referral_type = data.get('referral_type')
            referral_details = data.get('referral_details')
        
        # אם חסרים נתונים חיוניים לבדיקה, נחזיר את הנתונים כמו שהם
        if not all([personal_id, referral_type, referral_details]):
            return data
        
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