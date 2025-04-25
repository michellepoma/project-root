from rest_framework import serializers
from .models import Course, CourseParticipant, CourseMaterial

from django.contrib.auth import get_user_model


User = get_user_model()


class CourseSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id',
            'name',
            'code',
            'description',
            'subject_code',     # Nuevo campo
            'semester',         # Nuevo campo
            'teacher_name',     # Mostrado al frontend
            'teacher',
            'created_at',
        ]
        read_only_fields = ['code', 'created_at', 'teacher']

    def get_teacher_name(self, obj):
        return obj.teacher.name


class CourseParticipantSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = CourseParticipant
        fields = ['id', 'user', 'user_name', 'course', 'role', 'joined_at']
        read_only_fields = ['joined_at']

    def get_user_name(self, obj):
        return obj.user.name

class CourseMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseMaterial
        fields = [
            'id',
            'course',
            'title',
            'file',
            'link',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

from .models import AttendanceSession, AttendanceRecord


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = ['id', 'student', 'student_name', 'present']


class AttendanceSessionSerializer(serializers.ModelSerializer):
    records = AttendanceRecordSerializer(many=True, read_only=True)

    class Meta:
        model = AttendanceSession
        fields = ['id', 'course', 'date', 'created_at', 'records']
