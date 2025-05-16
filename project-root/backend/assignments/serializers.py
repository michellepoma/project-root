from rest_framework import serializers
from .models import Assignment, Submission, Grade
from django.utils import timezone

class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
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
        read_only_fields = ['id', 'submitted_at', 'student']

    def get_student_name(self, obj):
        return f"{obj.student.last_name} {obj.student.first_name}".strip()
    
    def validate_assignment(self, assignment):
        if assignment.due_date < timezone.now():
            raise serializers.ValidationError("La fecha de entrega para esta tarea ha pasado.")
        return assignment

class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
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
    def get_student_name(self, obj):
        return f"{obj.student.last_name} {obj.student.first_name}".strip()

class AssignmentSerializer(serializers.ModelSerializer):
    submissions = SubmissionSerializer(many=True, read_only=True)
    grades = GradeSerializer(many=True, read_only=True)

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
            'submissions',  # 👈 Entregas relacionadas
            'grades'        # 👈 Calificaciones relacionadas
        ]
        read_only_fields = ['id', 'created_at']
