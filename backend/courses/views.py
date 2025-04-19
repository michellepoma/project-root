# backend/courses/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Course, CourseParticipant
from .serializers import CourseSerializer, CourseParticipantSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class IsTeacherOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'teacher'


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        # Si el usuario crea un curso, se convierte en profesor
        if user.role != 'teacher':
            user.role = 'teacher'
            user.save()

        course = serializer.save(teacher=user)

        # Añadimos al creador como participante con rol de profesor
        CourseParticipant.objects.create(
            user=user,
            course=course,
            role='teacher'
        )

    def get_queryset(self):
        user = self.request.user
        if user.role == 'teacher':
            # Los profesores ven los cursos que crearon
            return Course.objects.filter(teacher=user)
        else:
            # Los estudiantes ven los cursos en los que están matriculados
            enrolled_courses = CourseParticipant.objects.filter(user=user).values_list('course_id', flat=True)
            return Course.objects.filter(id__in=enrolled_courses)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        course = self.get_object()
        user = request.user

        # Verificar si el usuario ya es participante
        if CourseParticipant.objects.filter(user=user, course=course).exists():
            return Response({"detail": "Ya estás inscrito en este curso."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Crear participante con rol de estudiante y actualizar el rol del usuario si es necesario
        if user.role != 'student' and user != course.teacher:
            user.role = 'student'
            user.save()

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

    @action(detail=False, methods=['post'])
    def join_by_code(self, request):
        code = request.data.get('code')
        if not code:
            return Response({"detail": "Se requiere el código del curso."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            course = Course.objects.get(code=code)
        except Course.DoesNotExist:
            return Response({"detail": "Código de curso inválido."},
                            status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if CourseParticipant.objects.filter(user=user, course=course).exists():
            return Response({"detail": "Ya estás inscrito en este curso."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Si un usuario se une a un curso por código, se convierte en estudiante
        if user.role != 'student' and user != course.teacher:
            user.role = 'student'
            user.save()

        participant = CourseParticipant.objects.create(
            user=user,
            course=course,
            role='student'
        )

        return Response(CourseParticipantSerializer(participant).data,
                        status=status.HTTP_201_CREATED)


class CourseParticipantViewSet(viewsets.ModelViewSet):
    queryset = CourseParticipant.objects.all()
    serializer_class = CourseParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'teacher':
            # Profesores pueden ver todos los participantes de sus cursos
            return CourseParticipant.objects.filter(course__teacher=user)
        else:
            # Estudiantes solo pueden verse a sí mismos
            return CourseParticipant.objects.filter(user=user)