from rest_framework import viewsets, permissions
from .models import Assignment
from .serializers import AssignmentSerializer

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Filtrar solo las tareas de los cursos donde el usuario es participante
        return Assignment.objects.filter(course__participants__user=user)

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data.get('course')

        # Solo el teacher del curso puede crear tareas
        if course.teacher != user:
            raise permissions.PermissionDenied("Solo el profesor puede crear tareas en este curso.")

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

        # Los estudiantes solo pueden ver sus propias notas
        if user.role == 'student':
            return Grade.objects.filter(student=user)

        # Los profesores pueden ver todas las calificaciones
        return Grade.objects.all()

    def perform_create(self, serializer):
        user = self.request.user

        # Solo el profesor debe poder asignar calificaciones
        assignment = serializer.validated_data.get('assignment')
        if assignment.course.teacher != user:
            raise permissions.PermissionDenied("Solo el profesor puede calificar esta tarea.")

        serializer.save()
