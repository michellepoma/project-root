from django.utils import timezone
from rest_framework import serializers
from .models import Assignment, Submission


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = [
            'id',
            'title',
            'description',
            'due_date',
            'attachment',
            'link',
            'course',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

from .models import Grade

class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)

    class Meta:
        model = Grade
        fields = [
            'id',
            'assignment',
            'assignment_title',
            'student',
            'student_name',
            'score',
            'feedback',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True) # o 'student.name' si tienes ese campo
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)

    class Meta:
        model = Submission
        fields = [
            'id',
            'assignment',
            'assignment_title',
            'student',
            'student_name',
            'submitted_at',
            'content',
            'file'
        ]
        read_only_fields = ['id', 'submitted_at', 'student'] # El estudiante se tomará del usuario autenticado

    # Opcional: validación para asegurar que la fecha de entrega no ha pasado
    def validate_assignment(self, assignment):
         if assignment.due_date < timezone.now():
             raise serializers.ValidationError("La fecha de entrega para esta tarea ha pasado.")
         return assignment