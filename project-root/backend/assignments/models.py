from django.db import models
from courses.models import Course


class Assignment(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateTimeField()
    attachment = models.FileField(upload_to='assignments/', blank=True, null=True)
    link = models.URLField(max_length=300, blank=True, null=True)

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.course.name}"


from django.conf import settings

class Grade(models.Model):
    assignment = models.ForeignKey('Assignment', on_delete=models.CASCADE, related_name='grades')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('assignment', 'student')

    def __str__(self):
        return f"{self.student.name} - {self.assignment.title}: {self.score}"

class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')
    submitted_at = models.DateTimeField(auto_now_add=True)
    content = models.TextField(blank=True, null=True) # Para respuestas de texto
    file = models.FileField(upload_to='submissions/', blank=True, null=True) # Para archivos entregados
    # Podrías añadir un campo de estado, ej. 'entregado', 'calificado'

    class Meta:
        unique_together = ('assignment', 'student') # Un estudiante solo entrega una vez por tarea

    def __str__(self):
        return f"Entrega de {self.student.username} para {self.assignment.title}"