from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # API de usuarios
    path('api/', include('users.urls')),

    # API de cursos, materiales, participantes, asistencia
    path('api/', include('courses.urls')),

    # API de tareas y calificaciones
    path('api/', include('assignments.urls')),
]
