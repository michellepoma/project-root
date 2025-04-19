# backend/courses/models.py
from django.db import models
from django.conf import settings
import random
import string

AUTH_USER_MODEL = 'users.User'

def generate_course_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Course(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True, default=generate_course_code)
    description = models.TextField(blank=True, null=True)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                related_name='created_courses')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class CourseParticipant(models.Model):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('assistant', 'Assistant'),
        ('teacher', 'Teacher'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='participants')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.name} in {self.course.name} as {self.role}"