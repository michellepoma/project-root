from rest_framework import serializers
from .models import Assignment

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = [
            'id',
            'title',
            'description',
            'due_date',
            'attachment',
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
