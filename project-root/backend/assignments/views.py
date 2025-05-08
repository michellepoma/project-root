from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Assignment
from .serializers import AssignmentSerializer
from courses.models import CourseParticipant

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_qs = Assignment.objects.filter(course__participants__user=user)

        course_id = self.request.query_params.get("course")
        if course_id:
            base_qs = base_qs.filter(course_id=course_id)

        return base_qs



    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data.get('course')

        # Solo el teacher del curso puede crear tareas
        if course.teacher != user:
            raise PermissionDenied("Solo el profesor puede crear tareas en este curso.")

        serializer.save()

from rest_framework import viewsets, permissions
from .models import Grade
from .serializers import GradeSerializer

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Grade.objects.none()

        if user.role == 'student':
            qs = Grade.objects.filter(student=user)

        elif user.role == 'teacher':
            qs = Grade.objects.filter(assignment__course__teacher=user)

        course_id = self.request.query_params.get("course")
        if course_id:
            qs = qs.filter(assignment__course_id=course_id)

        return qs


    def perform_create(self, serializer):
        user = self.request.user
        assignment = serializer.validated_data.get('assignment')
        student = serializer.validated_data.get('student')

        # Validar que solo el teacher del curso pueda calificar
        if assignment.course.teacher != user:
            raise PermissionDenied("Solo el profesor puede calificar esta tarea.")

        # Asegurar que el estudiante esté inscrito en el curso
        if not assignment.course.participants.filter(user=student).exists():
            raise PermissionDenied("El estudiante no está inscrito en este curso.")

        serializer.save()

