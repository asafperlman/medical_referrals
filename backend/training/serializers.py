# medical-referrals/backend/training/serializers.py

from rest_framework import serializers
from .models import TeamTraining, Soldier, TourniquetTraining, Medic, MedicTraining
from django.utils import timezone
from datetime import timedelta


class TeamTrainingSerializer(serializers.ModelSerializer):
    """
    סריאלייזר לתרגולי צוות
    """
    created_by_name = serializers.SerializerMethodField()
    updated_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = TeamTraining
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
    
    def create(self, validated_data):
        user = self.context['request'].user
        training = TeamTraining.objects.create(**validated_data, created_by=user, last_updated_by=user)
        return training
    
    def update(self, instance, validated_data):
        user = self.context['request'].user
        validated_data['last_updated_by'] = user
        return super().update(instance, validated_data)


class SoldierSerializer(serializers.ModelSerializer):
    """
    סריאלייזר לחיילים
    """
    last_training = serializers.SerializerMethodField()
    last_cat_time = serializers.SerializerMethodField()
    last_passed = serializers.SerializerMethodField()
    is_trained_this_month = serializers.SerializerMethodField()
    
    class Meta:
        model = Soldier
        fields = ['id', 'name', 'personal_id', 'team', 'last_training', 'last_cat_time', 
                 'last_passed', 'is_trained_this_month', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_last_training(self, obj):
        last_training = obj.tourniquet_trainings.order_by('-training_date').first()
        if last_training:
            return last_training.training_date
        return None
    
    def get_last_cat_time(self, obj):
        last_training = obj.tourniquet_trainings.order_by('-training_date').first()
        if last_training:
            return last_training.cat_time
        return None
    
    def get_last_passed(self, obj):
        last_training = obj.tourniquet_trainings.order_by('-training_date').first()
        if last_training:
            return last_training.passed
        return None
    
    def get_is_trained_this_month(self, obj):
        now = timezone.now().date()
        first_day_of_month = now.replace(day=1)
        return obj.tourniquet_trainings.filter(
            training_date__gte=first_day_of_month
        ).exists()


class TourniquetTrainingSerializer(serializers.ModelSerializer):
    """
    סריאלייזר לתרגולי חסם עורקים
    """
    soldier_name = serializers.SerializerMethodField()
    soldier_team = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = TourniquetTraining
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'last_updated_by',
                           'soldier_name', 'soldier_team', 'created_by_name']
    
    def get_soldier_name(self, obj):
        return obj.soldier.name
    
    def get_soldier_team(self, obj):
        return obj.soldier.team
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.full_name
        return None
    
    def create(self, validated_data):
        user = self.context['request'].user
        training = TourniquetTraining.objects.create(**validated_data, created_by=user, last_updated_by=user)
        return training
    
    def update(self, instance, validated_data):
        user = self.context['request'].user
        validated_data['last_updated_by'] = user
        return super().update(instance, validated_data)


class MedicSerializer(serializers.ModelSerializer):
    """
    סריאלייזר לחובשים
    """
    last_training = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    trainings_count = serializers.SerializerMethodField()
    is_trained_this_month = serializers.SerializerMethodField()
    
    class Meta:
        model = Medic
        fields = ['id', 'name', 'team', 'role', 'experience', 'last_training', 
                 'average_rating', 'trainings_count', 'is_trained_this_month', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_last_training(self, obj):
        last_training = obj.trainings.order_by('-training_date').first()
        if last_training:
            return last_training.training_date
        return None
    
    def get_average_rating(self, obj):
        trainings = obj.trainings.all()
        if not trainings:
            return 0
        total_rating = sum(t.performance_rating for t in trainings)
        return round(total_rating / len(trainings), 1)
    
    def get_trainings_count(self, obj):
        return obj.trainings.count()
    
    def get_is_trained_this_month(self, obj):
        now = timezone.now().date()
        first_day_of_month = now.replace(day=1)
        return obj.trainings.filter(
            training_date__gte=first_day_of_month
        ).exists()


class MedicTrainingSerializer(serializers.ModelSerializer):
    """
    סריאלייזר לתרגולי חובשים
    """
    medic_name = serializers.SerializerMethodField()
    medic_team = serializers.SerializerMethodField()
    medic_role = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = MedicTraining
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'last_updated_by',
                           'medic_name', 'medic_team', 'medic_role', 'created_by_name']
    
    def get_medic_name(self, obj):
        return obj.medic.name
    
    def get_medic_team(self, obj):
        return obj.medic.team
    
    def get_medic_role(self, obj):
        return obj.medic.role
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.full_name
        return None
    
    def create(self, validated_data):
        user = self.context['request'].user
        training = MedicTraining.objects.create(**validated_data, created_by=user, last_updated_by=user)
        return training
    
    def update(self, instance, validated_data):
        user = self.context['request'].user
        validated_data['last_updated_by'] = user
        return super().update(instance, validated_data)


class TrainingStatsSerializer(serializers.Serializer):
    """
    סריאלייזר לסטטיסטיקות תרגולים
    """
    # Tourniquet training stats
    tourniquet_stats = serializers.DictField()
    
    # Medic training stats
    medic_stats = serializers.DictField()
    
    # Team training stats
    team_stats = serializers.DictField()
    
    # Combined stats
    total_trainings = serializers.IntegerField()
    trainings_by_team = serializers.DictField()
    trainings_by_month = serializers.ListField()
    

class SoldierStatsSerializer(serializers.Serializer):
    """
    סריאלייזר לסטטיסטיקות חייל בודד
    """
    soldier_data = serializers.DictField()
    trainings = serializers.ListField()
    stats = serializers.DictField()
    improvement_trend = serializers.DictField()


class MedicStatsSerializer(serializers.Serializer):
    """
    סריאלייזר לסטטיסטיקות חובש בודד
    """
    medic_data = serializers.DictField()
    trainings = serializers.ListField()
    stats = serializers.DictField()
    training_types = serializers.DictField()