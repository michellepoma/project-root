from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

from users.permissions import IsAdminOrTeacher
from .models import (
    Course,
    CourseParticipant,
    CourseMaterial,
    AttendanceSession,
    AttendanceRecord
)
from .serializers import (
    CourseSerializer,
    CourseParticipantSerializer,
    CourseMaterialSerializer,
    AttendanceSessionSerializer,
    AttendanceRecordSerializer
)

User = get_user_model()


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        # Students can join courses
        if self.action in ('join', 'join_by_code'):
            return [IsAuthenticated()]
        # Any authenticated user can list/retrieve their courses
        if self.action in ('list', 'retrieve'):
            return [IsAuthenticated()]
        # Creation, updates, deletions, participants listing and promotion require teacher/admin
        return [IsAuthenticated(), IsAdminOrTeacher()]

    def perform_create(self, serializer):
        # Only teacher/admin creates courses
        serializer.save(teacher=self.request.user)
        # Enroll the creator as teacher in the course
        CourseParticipant.objects.create(
            user=self.request.user,
            course=serializer.instance,
            role='teacher'
        )

    def get_queryset(self):
        user = self.request.user
        enrolled_ids = CourseParticipant.objects.filter(user=user).values_list('course_id', flat=True)
        return Course.objects.filter(id__in=enrolled_ids)

    def update(self, request, *args, **kwargs):
        course = self.get_object()
        if course.teacher != request.user:
            raise PermissionDenied("Solo el profesor puede editar este curso.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        course = self.get_object()
        if course.teacher != request.user:
            raise PermissionDenied("Solo el profesor puede eliminar este curso.")
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        course = self.get_object()
        user = request.user
        if CourseParticipant.objects.filter(user=user, course=course).exists():
            return Response({"detail": "Ya estás inscrito en este curso."}, status=status.HTTP_400_BAD_REQUEST)
        participant = CourseParticipant.objects.create(
            user=user,
            course=course,
            role='student'
        )
        return Response(CourseParticipantSerializer(participant).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def join_by_code(self, request):
        code = request.data.get('code')
        if not code:
            return Response({"detail": "Se requiere el código del curso."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            course = Course.objects.get(code=code)
        except Course.DoesNotExist:
            return Response({"detail": "Código de curso inválido."}, status=status.HTTP_404_NOT_FOUND)
        user = request.user
        if CourseParticipant.objects.filter(user=user, course=course).exists():
            return Response({"detail": "Ya estás inscrito en este curso."}, status=status.HTTP_400_BAD_REQUEST)
        participant = CourseParticipant.objects.create(
            user=user,
            course=course,
            role='student'
        )
        return Response(CourseParticipantSerializer(participant).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        course = self.get_object()
        participants = CourseParticipant.objects.filter(course=course)
        serializer = CourseParticipantSerializer(participants, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def promote(self, request, pk=None):
        course = self.get_object()
        user_id = request.data.get('user_id')
        try:
            target = User.objects.get(pk=user_id)
            participation = CourseParticipant.objects.get(course=course, user=target)
        except (User.DoesNotExist, CourseParticipant.DoesNotExist):
            return Response({"detail": "Usuario o participación inválida."}, status=status.HTTP_400_BAD_REQUEST)
        participation.role = 'assistant'
        participation.save()
        return Response(CourseParticipantSerializer(participation).data)


class CourseParticipantViewSet(viewsets.ModelViewSet):
    queryset = CourseParticipant.objects.all()
    serializer_class = CourseParticipantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return CourseParticipant.objects.filter(user=user)


class CourseMaterialViewSet(viewsets.ModelViewSet):
    queryset = CourseMaterial.objects.all()
    serializer_class = CourseMaterialSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course_id = self.request.query_params.get('course')
        if course_id:
            return self.queryset.filter(course__id=course_id)
        return self.queryset


class AttendanceSessionViewSet(viewsets.ModelViewSet):
    queryset = AttendanceSession.objects.all()
    serializer_class = AttendanceSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return AttendanceSession.objects.filter(course__participants__user=user)

    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        if course.teacher != self.request.user:
            raise PermissionDenied("Solo el profesor puede registrar asistencia.")
        serializer.save()


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return AttendanceRecord.objects.filter(session__course__participants__user=user)
