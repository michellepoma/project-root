from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import Course, CourseParticipant
from .serializers import CourseSerializer, CourseParticipantSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        # CAMBIO DE ROL si aún no es teacher
        if user.role != 'teacher':
            user.role = 'teacher'
            user.save()  # ← ¡Este .save() es necesario para guardar el cambio!

        # Guardar el curso
        course = serializer.save(teacher=user)

        # Añadir al creador como participante con rol de teacher
        CourseParticipant.objects.create(
            user=user,
            course=course,
            role='teacher'
        )

    def get_queryset(self):
        user = self.request.user

        # Ver cursos según participación
        enrolled_courses = CourseParticipant.objects.filter(user=user).values_list('course_id', flat=True)
        return Course.objects.filter(id__in=enrolled_courses)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        course = self.get_object()
        user = request.user

        if CourseParticipant.objects.filter(user=user, course=course).exists():
            return Response({"detail": "Ya estás inscrito en este curso."},
                            status=status.HTTP_400_BAD_REQUEST)

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

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_update(self, serializer):
        # Solo el profesor del curso puede actualizarlo
        course = self.get_object()
        if self.request.user != course.teacher:
            raise PermissionDenied("Solo el profesor puede actualizar este curso.")
        serializer.save()


class CourseParticipantViewSet(viewsets.ModelViewSet):
    queryset = CourseParticipant.objects.all()
    serializer_class = CourseParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return CourseParticipant.objects.filter(user=user)
