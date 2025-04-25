# backend/courses/serializers.py
from rest_framework import serializers
from .models import Course, CourseParticipant
from django.contrib.auth import get_user_model

User = get_user_model()


class CourseSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'description', 'semester', 'teacher', 'teacher_name', 'created_at']
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