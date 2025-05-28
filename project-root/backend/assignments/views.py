from django.utils import timezone

from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from courses.models import CourseParticipant

from .models import Assignment, Grade, Submission
from .serializers import AssignmentSerializer, GradeSerializer, SubmissionSerializer


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Assignment.objects.filter(course__participants__user=user).prefetch_related('submissions', 'grades')

        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)

        return qs.order_by('-due_date')



    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data.get('course')
        if course.teacher != user:
            raise PermissionDenied("Solo el profesor puede crear tareas en este curso.")
        serializer.save()


class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Grade.objects.filter(student=user)
        if user.role == 'teacher':
            return Grade.objects.filter(assignment__course__teacher=user)
        if user.is_superuser:
            return Grade.objects.all()
        return Grade.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        assignment = serializer.validated_data.get('assignment')
        student = serializer.validated_data.get('student')
        score = serializer.validated_data.get('score')
        feedback = serializer.validated_data.get('feedback', '')

        if not user.is_superuser and assignment.course.teacher != user:
            raise PermissionDenied("Solo el profesor puede calificar esta tarea.")

        if not CourseParticipant.objects.filter(user=student, course=assignment.course).exists():
            raise PermissionDenied("El estudiante no está inscrito en este curso.")

        # Si ya existe la calificación, actualízala
        grade, created = Grade.objects.update_or_create(
            assignment=assignment,
            student=student,
            defaults={
                'score': score,
                'feedback': feedback
            }
        )
        # Asignamos la instancia de calificación creada o actualizada al serializer para que DRF la maneje correctamente
        serializer.instance = grade


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Submission.objects.all()

        if user.role == 'student':
            qs = qs.filter(student=user)
        elif user.role == 'teacher':
            qs = qs.filter(assignment__course__teacher=user)
        else:
            return Submission.objects.none()

        assignment_id = self.request.query_params.get('assignment')
        if assignment_id:
            qs = qs.filter(assignment_id=assignment_id)

        return qs.order_by('-submitted_at')


    def perform_create(self, serializer):
        user = self.request.user
        assignment = serializer.validated_data.get('assignment')

        if user.role != 'student':
            raise PermissionDenied("Solo los estudiantes pueden entregar tareas.")

        if not CourseParticipant.objects.filter(user=user, course=assignment.course).exists():
            raise PermissionDenied("No estás inscrito en el curso de esta tarea.")

        if Submission.objects.filter(assignment=assignment, student=user).exists():
            raise PermissionDenied("Ya has realizado una entrega para esta tarea.")

        if assignment.due_date < timezone.now():
            raise PermissionDenied("La fecha de entrega para esta tarea ha pasado.")

        serializer.save(student=user)

    def perform_update(self, serializer):
        submission = self.get_object()
        if submission.student != self.request.user:
            raise PermissionDenied("No puedes modificar la entrega de otro estudiante.")

        # Validar fecha de entrega
        if submission.assignment.due_date < timezone.now():
            raise PermissionDenied("La fecha de entrega ya venció. No puedes modificar la entrega.")

        serializer.save()

    def perform_destroy(self, instance):
        is_owner = instance.student == self.request.user
        is_course_teacher = instance.assignment.course.teacher == self.request.user

        if not (is_owner or is_course_teacher):
            raise PermissionDenied("No tienes permiso para borrar esta entrega.")

        instance.delete()