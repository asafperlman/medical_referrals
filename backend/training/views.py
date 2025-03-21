# medical-referrals/backend/training/views.py

from rest_framework.renderers import JSONRenderer
from rest_framework import viewsets, filters, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg, Q
from django.utils import timezone
import datetime

from .custom_views import APIOnlyViewSet
from .models import TeamTraining, Soldier, TourniquetTraining, Medic, MedicTraining
from .serializers import (
    TeamTrainingSerializer,
    SoldierSerializer,
    TourniquetTrainingSerializer,
    MedicSerializer,
    MedicTrainingSerializer,
    TrainingStatsSerializer,
    SoldierStatsSerializer,
    MedicStatsSerializer,
    TeamStatsSerializer
)


class TeamTrainingViewSet(APIOnlyViewSet):
    """
    API לניהול תרגולי צוות
    """
    queryset = TeamTraining.objects.all()
    serializer_class = TeamTrainingSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['team', 'scenario', 'location', 'notes']
    filterset_fields = {
        'team': ['exact', 'in'],
        'date': ['gte', 'lte'],
        'performance_rating': ['exact', 'gte', 'lte'],
    }
    ordering_fields = ['date', 'team', 'performance_rating']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, last_updated_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(last_updated_by=self.request.user)
        
    @action(detail=False, methods=['get'])
    def stats_by_team(self, request):
        """
        קבלת נתונים סטטיסטיים לפי צוות
        """
        team = request.query_params.get('team')
        if not team:
            return Response({"error": "נדרש פרמטר 'team'"}, status=status.HTTP_400_BAD_REQUEST)
            
        team_trainings = self.get_queryset().filter(team=team)
        
        if not team_trainings.exists():
            return Response({"error": f"לא נמצאו תרגולים לצוות {team}"}, status=status.HTTP_404_NOT_FOUND)
            
        total_trainings = team_trainings.count()
        avg_rating = team_trainings.aggregate(avg=Avg('performance_rating'))['avg'] or 0
        soldiers_count = Soldier.objects.filter(team=team).count()
        
        now = timezone.now().date()
        months_data = []
        for i in range(6):  # 6 חודשים אחרונים
            month_date = now.replace(day=1) - datetime.timedelta(days=30 * i)
            month_start = month_date.replace(day=1)
            if month_date.month == 12:
                next_month = month_date.replace(year=month_date.year+1, month=1, day=1)
            else:
                next_month = month_date.replace(month=month_date.month+1, day=1)
            month_end = next_month - datetime.timedelta(days=1)
            month_trainings = team_trainings.filter(date__gte=month_start, date__lte=month_end)
            month_count = month_trainings.count()
            if month_count > 0:
                avg = month_trainings.aggregate(avg=Avg('performance_rating'))['avg'] or 0
                months_data.append({
                    'month': month_start.strftime('%m/%Y'),
                    'count': month_count,
                    'avg_rating': round(avg, 1)
                })
        
        recent_trainings = TeamTrainingSerializer(
            team_trainings.order_by('-date')[:5], 
            many=True
        ).data
        
        data = {
            'team': team,
            'total_trainings': total_trainings,
            'average_rating': round(avg_rating, 1),
            'members_count': soldiers_count,
            'trainings_by_month': months_data,
            'recent_trainings': recent_trainings
        }
        
        serializer = TeamStatsSerializer(data)
        return Response(serializer.data)


class SoldierViewSet(APIOnlyViewSet):
    """
    API לניהול חיילים
    """
    queryset = Soldier.objects.all().order_by('name')
    serializer_class = SoldierSerializer
    permission_classes = [IsAuthenticated]
    renderer_classes = [JSONRenderer]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'personal_id']
    filterset_fields = {'team': ['exact', 'in']}
    ordering_fields = ['name', 'team']
    
    @action(detail=False, methods=['get'])
    def untrained_this_month(self, request):
        """
        קבלת רשימת חיילים שלא תורגלו החודש
        """
        now = timezone.now().date()
        first_day_of_month = now.replace(day=1)
        current_month_trainings = TourniquetTraining.objects.filter(training_date__gte=first_day_of_month)
        trained_soldier_ids = current_month_trainings.values_list('soldier_id', flat=True).distinct()
        untrained_soldiers = self.get_queryset().exclude(id__in=trained_soldier_ids)
        team = request.query_params.get('team')
        if team:
            untrained_soldiers = untrained_soldiers.filter(team=team)
        page = self.paginate_queryset(untrained_soldiers)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(untrained_soldiers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """
        קבלת סטטיסטיקות עבור חייל ספציפי
        """
        soldier = self.get_object()
        trainings = TourniquetTraining.objects.filter(soldier=soldier).order_by('-training_date')
        stats = {}
        improvement_trend = {}
        if trainings.exists():
            cat_times = [int(t.cat_time) for t in trainings if t.cat_time.isdigit()]
            if cat_times:
                stats['average_cat_time'] = sum(cat_times) / len(cat_times)
                stats['best_cat_time'] = min(cat_times)
                stats['worst_cat_time'] = max(cat_times)
                total_trainings = trainings.count()
                passed_trainings = trainings.filter(passed=True).count()
                stats['pass_rate'] = (passed_trainings / total_trainings) * 100
                stats['total_trainings'] = total_trainings
                last_training = trainings.first()
                stats['last_training'] = {
                    'date': last_training.training_date,
                    'cat_time': last_training.cat_time,
                    'passed': last_training.passed
                }
                now = timezone.now().date()
                first_day_of_month = now.replace(day=1)
                stats['trained_this_month'] = trainings.filter(training_date__gte=first_day_of_month).exists()
                if trainings.count() >= 2:
                    ordered_trainings = list(trainings.order_by('training_date'))
                    cat_times_ordered = [int(t.cat_time) for t in ordered_trainings if t.cat_time.isdigit()]
                    if len(cat_times_ordered) >= 2:
                        first_time = cat_times_ordered[0]
                        last_time = cat_times_ordered[-1]
                        improvement = first_time - last_time
                        improvement_trend['first_time'] = first_time
                        improvement_trend['last_time'] = last_time
                        improvement_trend['improvement'] = improvement
                        improvement_trend['improvement_percent'] = (improvement / first_time) * 100 if first_time > 0 else 0
                        improvement_trend['is_improving'] = improvement > 0
                    else:
                        improvement_trend['is_improving'] = False
                else:
                    improvement_trend['is_improving'] = False
            else:
                stats['average_cat_time'] = 0
                stats['best_cat_time'] = 0
                stats['worst_cat_time'] = 0
                stats['pass_rate'] = 0
                stats['total_trainings'] = trainings.count()
                stats['last_training'] = None
                stats['trained_this_month'] = False
                improvement_trend['is_improving'] = False
        else:
            stats['average_cat_time'] = 0
            stats['best_cat_time'] = 0
            stats['worst_cat_time'] = 0
            stats['pass_rate'] = 0
            stats['total_trainings'] = 0
            stats['last_training'] = None
            stats['trained_this_month'] = False
            improvement_trend['is_improving'] = False
            
        trainings_data = []
        for training in trainings:
            trainings_data.append({
                'id': training.id,
                'date': training.training_date,
                'cat_time': training.cat_time,
                'passed': training.passed,
                'notes': training.notes
            })
        
        data = {
            'soldier_data': SoldierSerializer(soldier).data,
            'trainings': trainings_data,
            'stats': stats,
            'improvement_trend': improvement_trend
        }
        
        serializer = SoldierStatsSerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_team(self, request):
        """
        קבלת רשימת חיילים מסודרת לפי צוות
        """
        team = request.query_params.get('team')
        if not team:
            teams = dict(Soldier.TEAM_CHOICES)
            result = {}
            for team_code in teams.keys():
                team_soldiers = self.get_queryset().filter(team=team_code)
                result[team_code] = {
                    'name': teams[team_code],
                    'count': team_soldiers.count(),
                    'soldiers': SoldierSerializer(team_soldiers, many=True).data
                }
            return Response(result)
        soldiers = self.get_queryset().filter(team=team)
        serializer = self.get_serializer(soldiers, many=True)
        return Response(serializer.data)


class TourniquetTrainingViewSet(APIOnlyViewSet):
    """
    API לניהול תרגולי חסמי עורקים
    """
    queryset = TourniquetTraining.objects.all().order_by('-training_date')
    serializer_class = TourniquetTrainingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['soldier__name', 'notes']
    filterset_fields = ['soldier', 'training_date', 'passed']
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        יצירת מספר תרגולי חסמי עורקים בבת אחת
        """
        serializer = TourniquetTrainingBulkSerializer(data=request.data)
        if serializer.is_valid():
            trainings = []
            for soldier_id in serializer.validated_data['soldiers']:
                try:
                    soldier = Soldier.objects.get(pk=soldier_id)
                    soldier_data = request.data.get('soldier_performances', {}).get(str(soldier_id), {})
                    training = TourniquetTraining(
                        soldier=soldier,
                        training_date=serializer.validated_data['training_date'],
                        cat_time=soldier_data.get('cat_time', '0'),
                        passed=soldier_data.get('passed', True),
                        notes=soldier_data.get('notes', '') or serializer.validated_data.get('general_notes', ''),
                        created_by=request.user,
                        last_updated_by=request.user
                    )
                    trainings.append(training)
                except Soldier.DoesNotExist:
                    pass
            if trainings:
                created_trainings = TourniquetTraining.objects.bulk_create(trainings)
                return Response({
                    'count': len(created_trainings),
                    'message': f'נוצרו {len(created_trainings)} תרגולים בהצלחה'
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'error': 'לא נוצרו תרגולים. ודא שבחרת חיילים תקינים.'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MedicViewSet(APIOnlyViewSet):
    """
    API לניהול חובשים
    """
    queryset = Medic.objects.all().order_by('team', 'name')
    serializer_class = MedicSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['name', 'role']
    filterset_fields = {
        'team': ['exact', 'in'],
        'role': ['exact', 'in'],
        'experience': ['exact', 'in'],
    }
    ordering_fields = ['name', 'team', 'experience']
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """
        קבלת סטטיסטיקות עבור חובש ספציפי
        """
        medic = self.get_object()
        trainings = MedicTraining.objects.filter(medic=medic).order_by('-training_date')
        stats = {}
        if trainings.exists():
            ratings = [t.performance_rating for t in trainings]
            stats['average_rating'] = sum(ratings) / len(ratings) if ratings else 0
            stats['highest_rating'] = max(ratings) if ratings else 0
            stats['lowest_rating'] = min(ratings) if ratings else 0
            total_trainings = trainings.count()
            full_attendance = trainings.filter(attendance=True).count()
            stats['attendance_rate'] = (full_attendance / total_trainings) * 100 if total_trainings > 0 else 0
            stats['total_trainings'] = total_trainings
            last_training = trainings.first()
            stats['last_training'] = {
                'date': last_training.training_date,
                'type': last_training.training_type,
                'rating': last_training.performance_rating,
            }
            now = timezone.now().date()
            first_day_of_month = now.replace(day=1)
            stats['trained_this_month'] = trainings.filter(training_date__gte=first_day_of_month).exists()
            training_types = {}
            for training in trainings:
                training_type = training.training_type
                if training_type not in training_types:
                    training_types[training_type] = {
                        'count': 0,
                        'total_rating': 0,
                        'average_rating': 0
                    }
                training_types[training_type]['count'] += 1
                training_types[training_type]['total_rating'] += training.performance_rating
            for training_type in training_types:
                count = training_types[training_type]['count']
                total = training_types[training_type]['total_rating']
                training_types[training_type]['average_rating'] = total / count if count > 0 else 0
        else:
            stats['average_rating'] = 0
            stats['highest_rating'] = 0
            stats['lowest_rating'] = 0
            stats['attendance_rate'] = 0
            stats['total_trainings'] = 0
            stats['last_training'] = None
            stats['trained_this_month'] = False
            training_types = {}
            
        trainings_data = []
        for training in trainings:
            trainings_data.append({
                'id': training.id,
                'date': training.training_date,
                'type': training.training_type,
                'rating': training.performance_rating,
                'attendance': training.attendance,
                'notes': training.notes,
                'recommendations': training.recommendations
            })
        
        data = {
            'medic_data': MedicSerializer(medic).data,
            'trainings': trainings_data,
            'stats': stats,
            'training_types': training_types
        }
        
        serializer = MedicStatsSerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def untrained_this_month(self, request):
        """
        קבלת רשימת חובשים שלא תורגלו החודש
        """
        now = timezone.now().date()
        first_day_of_month = now.replace(day=1)
        current_month_trainings = MedicTraining.objects.filter(training_date__gte=first_day_of_month)
        trained_medic_ids = current_month_trainings.values_list('medic_id', flat=True).distinct()
        untrained_medics = self.get_queryset().exclude(id__in=trained_medic_ids)
        team = request.query_params.get('team')
        if team:
            untrained_medics = untrained_medics.filter(team=team)
        page = self.paginate_queryset(untrained_medics)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(untrained_medics, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_team(self, request):
        """
        קבלת רשימת חובשים מסודרת לפי צוות
        """
        team = request.query_params.get('team')
        if not team:
            teams = dict(Medic.TEAM_CHOICES)
            result = {}
            for team_code in teams.keys():
                team_medics = self.get_queryset().filter(team=team_code)
                result[team_code] = {
                    'name': teams[team_code],
                    'count': team_medics.count(),
                    'medics': MedicSerializer(team_medics, many=True).data
                }
            return Response(result)
        medics = self.get_queryset().filter(team=team)
        serializer = self.get_serializer(medics, many=True)
        return Response(serializer.data)


class MedicTrainingViewSet(APIOnlyViewSet):
    """
    API לניהול תרגולי חובשים
    """
    queryset = MedicTraining.objects.all().order_by('-training_date')
    serializer_class = MedicTrainingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['medic__name', 'training_type', 'notes', 'recommendations']
    filterset_fields = {
        'medic': ['exact'],
        'medic__team': ['exact', 'in'],
        'training_date': ['gte', 'lte'],
        'training_type': ['exact', 'in'],
        'performance_rating': ['exact', 'gte', 'lte'],
        'attendance': ['exact'],
    }
    ordering_fields = ['training_date', 'training_type', 'performance_rating', 'medic__name']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, last_updated_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(last_updated_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        יצירת מספר רשומות תרגול בבת אחת
        """
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        trainings = []
        for item in serializer.validated_data:
            trainings.append(MedicTraining(
                **item,
                created_by=request.user,
                last_updated_by=request.user
            ))
        MedicTraining.objects.bulk_create(trainings)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def current_month(self, request):
        """
        קבלת תרגולי החודש הנוכחי
        """
        now = timezone.now().date()
        first_day_of_month = now.replace(day=1)
        trainings = MedicTraining.objects.filter(training_date__gte=first_day_of_month).order_by('-training_date')
        team = request.query_params.get('team')
        if team:
            trainings = trainings.filter(medic__team=team)
        page = self.paginate_queryset(trainings)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(trainings, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """
        קבלת תרגולים מקובצים לפי סוג תרגול
        """
        training_type = request.query_params.get('type', None)
        if training_type:
            trainings = MedicTraining.objects.filter(training_type=training_type).order_by('-training_date')
            page = self.paginate_queryset(trainings)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(trainings, many=True)
            return Response(serializer.data)
        else:
            training_types = dict(MedicTraining.TRAINING_TYPE_CHOICES)
            result = {}
            for type_code in training_types.keys():
                type_trainings = MedicTraining.objects.filter(training_type=type_code)
                avg_rating = type_trainings.aggregate(avg=Avg('performance_rating'))['avg'] or 0
                result[type_code] = {
                    'name': training_types[type_code],
                    'count': type_trainings.count(),
                    'average_rating': avg_rating
                }
            return Response(result)


class TrainingStatsView(APIOnlyViewSet):
    """
    API לקבלת סטטיסטיקות אימונים
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TrainingStatsSerializer

    def list(self, request, *args, **kwargs):
        """
        קבלת נתונים סטטיסטיים מפורטים עבור כלל האימונים
        """
        # Timeframe filtering
        period = request.query_params.get('period', 'all')
        team = request.query_params.get('team', None)
        now = timezone.now().date()

        if period == 'week':
            start_date = now - datetime.timedelta(days=7)
        elif period == 'month':
            start_date = now.replace(day=1)
        elif period == 'quarter':
            month = now.month - ((now.month - 1) % 3)
            start_date = now.replace(month=month, day=1)
        elif period == 'year':
            start_date = now.replace(month=1, day=1)
        else:  # 'all' or invalid values
            start_date = None

        # Base querysets with time filtering
        team_training_qs = TeamTraining.objects.all()
        tourniquet_training_qs = TourniquetTraining.objects.all()
        medic_training_qs = MedicTraining.objects.all()

        if start_date:
            team_training_qs = team_training_qs.filter(date__gte=start_date)
            tourniquet_training_qs = tourniquet_training_qs.filter(training_date__gte=start_date)
            medic_training_qs = medic_training_qs.filter(training_date__gte=start_date)

        # Team filtering if specified
        if team:
            team_training_qs = team_training_qs.filter(team=team)
            tourniquet_training_qs = tourniquet_training_qs.filter(soldier__team=team)
            medic_training_qs = medic_training_qs.filter(medic__team=team)

        # Tourniquet training stats
        total_tourniquet = tourniquet_training_qs.count()
        cat_times = []
        for training in tourniquet_training_qs:
            if training.cat_time and training.cat_time.isdigit():
                cat_times.append(int(training.cat_time))
        avg_cat_time = sum(cat_times) / len(cat_times) if cat_times else 0
        passed = tourniquet_training_qs.filter(passed=True).count()
        pass_rate = (passed / total_tourniquet * 100) if total_tourniquet > 0 else 0

        team_performance = {}
        for team_name in dict(TourniquetTraining.objects.model.soldier.field.related_model.TEAM_CHOICES):
            team_trainings = tourniquet_training_qs.filter(soldier__team=team_name)
            team_count = team_trainings.count()
            if team_count > 0:
                team_cat_times = []
                for training in team_trainings:
                    if training.cat_time and training.cat_time.isdigit():
                        team_cat_times.append(int(training.cat_time))
                team_avg = sum(team_cat_times) / len(team_cat_times) if team_cat_times else 0
                team_passed = team_trainings.filter(passed=True).count()
                team_pass_rate = (team_passed / team_count * 100) if team_count > 0 else 0
                team_performance[team_name] = {
                    'avg': round(team_avg, 1),
                    'passRate': round(team_pass_rate, 1)
                }

        monthly_progress = []
        for i in range(5):  # Last 5 months
            month_date = now.replace(day=1) - datetime.timedelta(days=30 * i)
            month_start = month_date.replace(day=1)
            if month_date.month == 12:
                next_month = month_date.replace(year=month_date.year+1, month=1, day=1)
            else:
                next_month = month_date.replace(month=month_date.month+1, day=1)
            month_end = next_month - datetime.timedelta(days=1)
            month_trainings = tourniquet_training_qs.filter(
                training_date__gte=month_start,
                training_date__lte=month_end
            )
            month_count = month_trainings.count()
            if month_count > 0:
                month_cat_times = []
                for training in month_trainings:
                    if training.cat_time and training.cat_time.isdigit():
                        month_cat_times.append(int(training.cat_time))
                month_avg = sum(month_cat_times) / len(month_cat_times) if month_cat_times else 0
                month_passed = month_trainings.filter(passed=True).count()
                month_pass_rate = (month_passed / month_count * 100) if month_count > 0 else 0
                monthly_progress.append({
                    'month': month_start.strftime('%m/%Y'),
                    'avg': round(month_avg, 1),
                    'passRate': round(month_pass_rate, 1)
                })

        tourniquet_stats = {
            'totalTrainings': total_tourniquet,
            'averageTime': round(avg_cat_time, 1),
            'passRate': round(pass_rate, 1),
            'teamPerformance': team_performance,
            'monthlyProgress': monthly_progress
        }

        # Medic training stats
        total_medic = medic_training_qs.count()
        avg_rating = medic_training_qs.aggregate(avg=Avg('performance_rating'))['avg'] or 0
        by_training_type = {}
        for type_code, type_name in MedicTraining.TRAINING_TYPE_CHOICES:
            type_trainings = medic_training_qs.filter(training_type=type_code)
            count = type_trainings.count()
            if count > 0:
                avg = type_trainings.aggregate(avg=Avg('performance_rating'))['avg'] or 0
                by_training_type[type_code] = {
                    'count': count,
                    'avg': round(avg, 1)
                }
        medic_stats = {
            'totalTrainings': total_medic,
            'averageRating': round(avg_rating, 1),
            'byTrainingType': by_training_type
        }

        # Team training stats
        total_team = team_training_qs.count()
        team_avg_rating = team_training_qs.aggregate(avg=Avg('performance_rating'))['avg'] or 0
        team_performance_breakdown = {}
        for team_name in dict(TeamTraining.TEAM_CHOICES):
            team_specific_trainings = team_training_qs.filter(team=team_name)
            count = team_specific_trainings.count()
            if count > 0:
                avg = team_specific_trainings.aggregate(avg=Avg('performance_rating'))['avg'] or 0
                team_performance_breakdown[team_name] = {
                    'count': count,
                    'avg': round(avg, 1)
                }
        team_stats = {
            'totalTrainings': total_team,
            'averageRating': round(team_avg_rating, 1),
            'teamPerformance': team_performance_breakdown
        }

        total_trainings = total_tourniquet + total_medic + total_team

        trainings_by_team = {}
        for team_name in dict(TeamTraining.TEAM_CHOICES):
            team_total = (
                team_training_qs.filter(team=team_name).count() +
                tourniquet_training_qs.filter(soldier__team=team_name).count() +
                medic_training_qs.filter(medic__team=team_name).count()
            )
            if team_total > 0:
                trainings_by_team[team_name] = team_total

        trainings_by_month = []
        for i in range(6):  # Last 6 months
            month_date = now.replace(day=1) - datetime.timedelta(days=30 * i)
            month_start = month_date.replace(day=1)
            if month_date.month == 12:
                next_month = month_date.replace(year=month_date.year+1, month=1, day=1)
            else:
                next_month = month_date.replace(month=month_date.month+1, day=1)
            month_end = next_month - datetime.timedelta(days=1)
            month_team = team_training_qs.filter(date__gte=month_start, date__lte=month_end).count()
            month_tourniquet = tourniquet_training_qs.filter(training_date__gte=month_start, training_date__lte=month_end).count()
            month_medic = medic_training_qs.filter(training_date__gte=month_start, training_date__lte=month_end).count()
            month_total = month_team + month_tourniquet + month_medic
            if month_total > 0:
                trainings_by_month.append({
                    'month': month_start.strftime('%m/%Y'),
                    'total': month_total,
                    'team': month_team,
                    'tourniquet': month_tourniquet,
                    'medic': month_medic
                })

        data = {
            'tourniquet_stats': tourniquet_stats,
            'medic_stats': medic_stats,
            'team_stats': team_stats,
            'total_trainings': total_trainings,
            'trainings_by_team': trainings_by_team,
            'trainings_by_month': trainings_by_month
        }

        serializer = self.get_serializer(data)
        return Response(serializer.data)
