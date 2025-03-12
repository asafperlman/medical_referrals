# medical-referrals/backend/training/views.py

from rest_framework import viewsets, filters, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg, Q
from django.utils import timezone
import datetime

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


class TeamTrainingViewSet(viewsets.ModelViewSet):
    """
    API לניהול תרגולי צוות
    """
    queryset = TeamTraining.objects.all().order_by('-date')
    serializer_class = TeamTrainingSerializer
    permission_classes = [IsAuthenticated]
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
            
        # חישוב סטטיסטיקות
        total_trainings = team_trainings.count()
        avg_rating = team_trainings.aggregate(avg=Avg('performance_rating'))['avg'] or 0
        
        # מספר חיילים בצוות
        soldiers_count = Soldier.objects.filter(team=team).count()
        
        # התפלגות לפי חודשים
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
        
        # תרגולים אחרונים
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


class SoldierViewSet(viewsets.ModelViewSet):
    """
    API לניהול חיילים
    """
    queryset = Soldier.objects.all().order_by('team', 'name')
    serializer_class = SoldierSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['name', 'personal_id']
    filterset_fields = {
        'team': ['exact', 'in'],
    }
    ordering_fields = ['name', 'team']
    
    @action(detail=False, methods=['get'])
    def untrained_this_month(self, request):
        """
        קבלת רשימת חיילים שלא תורגלו החודש
        """
        now = timezone.now().date()
        first_day_of_month = now.replace(day=1)
        
        # Get current month trainings
        current_month_trainings = TourniquetTraining.objects.filter(
            training_date__gte=first_day_of_month
        )
        
        # Get soldier IDs that have trainings this month
        trained_soldier_ids = current_month_trainings.values_list('soldier_id', flat=True).distinct()
        
        # Filter soldiers that don't have trainings this month
        untrained_soldiers = self.get_queryset().exclude(id__in=trained_soldier_ids)
        
        # אופציונלי: סינון לפי צוות
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
        
        # Get all trainings for this soldier
        trainings = TourniquetTraining.objects.filter(soldier=soldier).order_by('-training_date')
        
        # Calculate stats
        stats = {}
        improvement_trend = {}
        
        if trainings.exists():
            # CAT time stats
            cat_times = [int(t.cat_time) for t in trainings if t.cat_time.isdigit()]
            
            if cat_times:
                stats['average_cat_time'] = sum(cat_times) / len(cat_times)
                stats['best_cat_time'] = min(cat_times)
                stats['worst_cat_time'] = max(cat_times)
                
                # Pass rate
                total_trainings = trainings.count()
                passed_trainings = trainings.filter(passed=True).count()
                stats['pass_rate'] = (passed_trainings / total_trainings) * 100
                stats['total_trainings'] = total_trainings
                
                # Training recency
                last_training = trainings.first()
                stats['last_training'] = {
                    'date': last_training.training_date,
                    'cat_time': last_training.cat_time,
                    'passed': last_training.passed
                }
                
                # This month training
                now = timezone.now().date()
                first_day_of_month = now.replace(day=1)
                stats['trained_this_month'] = trainings.filter(training_date__gte=first_day_of_month).exists()
                
                # Improvement trend
                if trainings.count() >= 2:
                    # Get chronological order of trainings for trend analysis
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
                # Default values if no valid CAT times
                stats['average_cat_time'] = 0
                stats['best_cat_time'] = 0
                stats['worst_cat_time'] = 0
                stats['pass_rate'] = 0
                stats['total_trainings'] = trainings.count()
                stats['last_training'] = None
                stats['trained_this_month'] = False
                improvement_trend['is_improving'] = False
        else:
            # Default values if no trainings
            stats['average_cat_time'] = 0
            stats['best_cat_time'] = 0
            stats['worst_cat_time'] = 0
            stats['pass_rate'] = 0
            stats['total_trainings'] = 0
            stats['last_training'] = None
            stats['trained_this_month'] = False
            improvement_trend['is_improving'] = False
            
        # Format trainings for response
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
            # אם לא צוין צוות, החזר את כל הצוותים עם כמות חיילים
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
            
        # אם צוין צוות ספציפי, החזר את החיילים של אותו צוות
        soldiers = self.get_queryset().filter(team=team)
        
        serializer = self.get_serializer(soldiers, many=True)
        return Response(serializer.data)


class TourniquetTrainingViewSet(viewsets.ModelViewSet):
    """
    API לניהול תרגולי חסמי עורקים
    """
    queryset = TourniquetTraining.objects.all().order_by('-training_date')
    serializer_class = TourniquetTrainingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['soldier__name', 'soldier__personal_id', 'notes']
    filterset_fields = {
        'soldier': ['exact'],
        'soldier__team': ['exact', 'in'],
        'training_date': ['gte', 'lte'],
        'passed': ['exact'],
    }
    ordering_fields = ['training_date', 'cat_time', 'soldier__name']
    
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
        
        # Add user to each record
        trainings = []
        for item in serializer.validated_data:
            trainings.append(TourniquetTraining(
                **item,
                created_by=request.user,
                last_updated_by=request.user
            ))
        
        # Bulk create the records
        TourniquetTraining.objects.bulk_create(trainings)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def current_month(self, request):
        """
        קבלת תרגולי החודש הנוכחי
        """
        now = timezone.now().date()
        first_day_of_month = now.replace(day=1)
        
        trainings = TourniquetTraining.objects.filter(
            training_date__gte=first_day_of_month
        ).order_by('-training_date')
        
        # אופציונלי: סינון לפי צוות
        team = request.query_params.get('team')
        if team:
            trainings = trainings.filter(soldier__team=team)
        
        page = self.paginate_queryset(trainings)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(trainings, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'])
    def best_times(self, request):
        """
        קבלת זמני ה-CAT הטובים ביותר
        """
        # Create a subquery to get the best time for each soldier
        soldier_best_times = {}
        
        for training in TourniquetTraining.objects.all():
            if not training.cat_time.isdigit():
                continue
                
            soldier_id = training.soldier_id
            cat_time = int(training.cat_time)
            
            if soldier_id not in soldier_best_times or cat_time < soldier_best_times[soldier_id]['time']:
                soldier_best_times[soldier_id] = {
                    'training': training,
                    'time': cat_time
                }
        
        # Sort by time and get the top 10
        sorted_trainings = sorted([item['training'] for item in soldier_best_times.values()], 
                                key=lambda t: int(t.cat_time) if t.cat_time.isdigit() else 999)[:10]
        
        serializer = self.get_serializer(sorted_trainings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_team(self, request):
        """
        קבלת תרגולים מקובצים לפי צוות
        """
        result = {}
        teams = dict(Soldier.TEAM_CHOICES)
        
        for team_code in teams.keys():
            team_trainings = self.get_queryset().filter(soldier__team=team_code)
            
            result[team_code] = {
                'name': teams[team_code],
                'total': team_trainings.count(),
                'passed': team_trainings.filter(passed=True).count(),
                'trainings': self.get_serializer(team_trainings, many=True).data
            }
            
        return Response(result)


class MedicViewSet(viewsets.ModelViewSet):
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
        
        # Get trainings for this medic
        trainings = MedicTraining.objects.filter(medic=medic).order_by('-training_date')
        
        # Calculate stats
        stats = {}
        
        if trainings.exists():
            # Performance rating stats
            ratings = [t.performance_rating for t in trainings]
            stats['average_rating'] = sum(ratings) / len(ratings) if ratings else 0
            stats['highest_rating'] = max(ratings) if ratings else 0
            stats['lowest_rating'] = min(ratings) if ratings else 0
            
            # Attendance rate
            total_trainings = trainings.count()
            full_attendance = trainings.filter(attendance=True).count()
            stats['attendance_rate'] = (full_attendance / total_trainings) * 100 if total_trainings > 0 else 0
            stats['total_trainings'] = total_trainings
            
            # Training recency
            last_training = trainings.first()
            stats['last_training'] = {
                'date': last_training.training_date,
                'type': last_training.training_type,
                'rating': last_training.performance_rating,
            }
            
            # This month training
            now = timezone.now().date()
            first_day_of_month = now.replace(day=1)
            stats['trained_this_month'] = trainings.filter(training_date__gte=first_day_of_month).exists()
            
            # Training types breakdown
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
            
            # Calculate average rating for each type
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
            
        # Format trainings for response
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
        
        # Get current month trainings
        current_month_trainings = MedicTraining.objects.filter(
            training_date__gte=first_day_of_month
        )
        
        # Get medic IDs that have trainings this month
        trained_medic_ids = current_month_trainings.values_list('medic_id', flat=True).distinct()
        
        # Filter medics that don't have trainings this month
        untrained_medics = self.get_queryset().exclude(id__in=trained_medic_ids)
        
        # אופציונלי: סינון לפי צוות
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
            # אם לא צוין צוות, החזר את כל הצוותים עם כמות חובשים
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
            
        # אם צוין צוות ספציפי, החזר את החובשים של אותו צוות
        medics = self.get_queryset().filter(team=team)
        
        serializer = self.get_serializer(medics, many=True)
        return Response(serializer.data)


class MedicTrainingViewSet(viewsets.ModelViewSet):
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
        
        # Add user to each record
        trainings = []
        for item in serializer.validated_data:
            trainings.append(MedicTraining(
                **item,
                created_by=request.user,
                last_updated_by=request.user
            ))
        
        # Bulk create the records
        MedicTraining.objects.bulk_create(trainings)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def current_month(self, request):
        """
        קבלת תרגולי החודש הנוכחי
        """
        now = timezone.now().date()
        first_day_of_month = now.replace(day=1)
        
        trainings = MedicTraining.objects.filter(
            training_date__gte=first_day_of_month
        ).order_by('-training_date')
        
        # אופציונלי: סינון לפי צוות
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
            # Group by training type and return summary
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


class TrainingStatsView(generics.GenericAPIView):
    """
    API לקבלת סטטיסטיקות אימונים
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TrainingStatsSerializer
    
    def get(self, request, *args, **kwargs):
        """
        קבלת נתונים סטטיסטיים מפורטים עבור כלל האימונים
        """
        # Timeframe filtering
        period = request.query_params.get('period', 'all')
        team = request.query_params.get('team', None)
        
        # Calculate date range based on period
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
        
        # Calculate average CAT time - safely handle empty querysets and non-numeric values
        cat_times = []
        for training in tourniquet_training_qs:
            if training.cat_time and training.cat_time.isdigit():
                cat_times.append(int(training.cat_time))
                
        avg_cat_time = sum(cat_times) / len(cat_times) if cat_times else 0
        
        # Calculate pass rate
        passed = tourniquet_training_qs.filter(passed=True).count()
        pass_rate = (passed / total_tourniquet * 100) if total_tourniquet > 0 else 0
        
        # Team performance for tourniquet trainings
        team_performance = {}
        for team_name in dict(TourniquetTraining.objects.model.soldier.field.related_model.TEAM_CHOICES):
            team_trainings = tourniquet_training_qs.filter(soldier__team=team_name)
            team_count = team_trainings.count()
            
            if team_count > 0:
                # Calculate avg CAT time for this team
                team_cat_times = []
                for training in team_trainings:
                    if training.cat_time and training.cat_time.isdigit():
                        team_cat_times.append(int(training.cat_time))
                        
                team_avg = sum(team_cat_times) / len(team_cat_times) if team_cat_times else 0
                
                # Calculate pass rate for this team
                team_passed = team_trainings.filter(passed=True).count()
                team_pass_rate = (team_passed / team_count * 100) if team_count > 0 else 0
                
                team_performance[team_name] = {
                    'avg': round(team_avg, 1),
                    'passRate': round(team_pass_rate, 1)
                }
        
        # Calculate monthly progress
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
                # Calculate avg CAT time for this month
                month_cat_times = []
                for training in month_trainings:
                    if training.cat_time and training.cat_time.isdigit():
                        month_cat_times.append(int(training.cat_time))
                        
                month_avg = sum(month_cat_times) / len(month_cat_times) if month_cat_times else 0
                
                # Calculate pass rate for this month
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
        
        # Training types breakdown
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
        
        # Team performance breakdown
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
        
        # Combined stats
        total_trainings = total_tourniquet + total_medic + total_team
        
        # Training stats by team
        trainings_by_team = {}
        for team_name in dict(TeamTraining.TEAM_CHOICES):
            team_total = (
                team_training_qs.filter(team=team_name).count() +
                tourniquet_training_qs.filter(soldier__team=team_name).count() +
                medic_training_qs.filter(medic__team=team_name).count()
            )
            
            if team_total > 0:
                trainings_by_team[team_name] = team_total
        
        # Monthly stats (all training types combined)
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
            month_tourniquet = tourniquet_training_qs.filter(
                training_date__gte=month_start, training_date__lte=month_end
            ).count()
            month_medic = medic_training_qs.filter(
                training_date__gte=month_start, training_date__lte=month_end
            ).count()
            
            month_total = month_team + month_tourniquet + month_medic
            
            if month_total > 0:
                trainings_by_month.append({
                    'month': month_start.strftime('%m/%Y'),
                    'total': month_total,
                    'team': month_team,
                    'tourniquet': month_tourniquet,
                    'medic': month_medic
                })
        
        # Prepare response data
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