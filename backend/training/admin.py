# medical-referrals/backend/training/admin.py

from django.contrib import admin
from .models import TeamTraining, Soldier, TourniquetTraining, Medic, MedicTraining


@admin.register(TeamTraining)
class TeamTrainingAdmin(admin.ModelAdmin):
    list_display = ('date', 'team', 'scenario', 'location', 'performance_rating')
    list_filter = ('team', 'date', 'performance_rating')
    search_fields = ('team', 'scenario', 'location', 'notes')
    date_hierarchy = 'date'


@admin.register(Soldier)
class SoldierAdmin(admin.ModelAdmin):
    list_display = ('name', 'personal_id', 'team')
    list_filter = ('team',)
    search_fields = ('name', 'personal_id')


@admin.register(TourniquetTraining)
class TourniquetTrainingAdmin(admin.ModelAdmin):
    list_display = ('soldier', 'training_date', 'cat_time', 'passed')
    list_filter = ('training_date', 'passed')
    search_fields = ('soldier__name', 'soldier__personal_id', 'notes')
    date_hierarchy = 'training_date'


@admin.register(Medic)
class MedicAdmin(admin.ModelAdmin):
    list_display = ('name', 'team', 'role', 'experience')
    list_filter = ('team', 'role', 'experience')
    search_fields = ('name',)


@admin.register(MedicTraining)
class MedicTrainingAdmin(admin.ModelAdmin):
    list_display = ('medic', 'training_date', 'training_type', 'performance_rating', 'attendance')
    list_filter = ('training_date', 'training_type', 'performance_rating', 'attendance')
    search_fields = ('medic__name', 'notes', 'recommendations')
    date_hierarchy = 'training_date'