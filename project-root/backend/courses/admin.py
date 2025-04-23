# backend/courses/admin.py
from django.contrib import admin
from .models import Course, CourseParticipant

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'teacher', 'created_at']
    search_fields = ['name', 'code', 'teacher__email']
    list_filter = ['created_at']

@admin.register(CourseParticipant)
class CourseParticipantAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'role', 'joined_at']
    search_fields = ['user__email', 'user__name', 'course__name']
    list_filter = ['role', 'joined_at']