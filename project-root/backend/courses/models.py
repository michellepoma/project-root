# backend/courses/models.py
from django.db import models
from django.conf import settings
import random
import string

AUTH_USER_MODEL = 'users.User'

def generate_course_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


DAYS_OF_WEEK = [
    ("mon", "Lunes"),
    ("tue", "Martes"),
    ("wed", "Miércoles"),
    ("thu", "Jueves"),
    ("fri", "Viernes"),
    ("sat", "Sábado"),
    ("sun", "Domingo"),
]

class Course(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True, default=generate_course_code)
    description = models.TextField(blank=True, null=True)

    subject_code = models.CharField(max_length=20, blank=True, null=True)  # Siglas del curso
    teacher_name = models.CharField(max_length=100, blank=True, null=True) # Nombre del docente

    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_courses'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class CourseSchedule(models.Model):
    course = models.ForeignKey(Course, related_name='schedules', on_delete=models.CASCADE)
    day = models.CharField(max_length=3, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ('course', 'day', 'start_time', 'end_time')
        ordering = ['day', 'start_time']

    def __str__(self):
        return f"{self.get_day_display()} {self.start_time} - {self.end_time}"

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

class CourseMaterial(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=100)
    description = models.CharField(blank=True, null=True)
    file = models.FileField(upload_to='course_materials/', blank=True, null=True)
    link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.course.name}"

class AttendanceSession(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendance_sessions')
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Asistencia {self.course.name} - {self.date}"

class AttendanceRecord(models.Model):
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='records')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    present = models.BooleanField(default=False)

    class Meta:
        unique_together = ('session', 'student')

    def __str__(self):
        return f"{self.student.name} - {'Presente' if self.present else 'Ausente'}"

class ScheduledClass(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='scheduled_classes')
    datetime = models.DateTimeField()
    link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.course.name} - {self.datetime.strftime('%Y-%m-%d %H:%M')}"

