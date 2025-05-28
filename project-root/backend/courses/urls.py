from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    CourseParticipantViewSet,
    CourseMaterialViewSet,
    AttendanceSessionViewSet,
    AttendanceRecordViewSet,
    ScheduledClassViewSet,
    StudentImportExcelView,
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'participants', CourseParticipantViewSet, basename='participant')
router.register(r'materials', CourseMaterialViewSet, basename='material')
router.register(r'sessions', AttendanceSessionViewSet, basename='session')
router.register(r'records', AttendanceRecordViewSet, basename='record')
router.register(r'scheduled-classes', ScheduledClassViewSet, basename='scheduled-class')

# Definimos la ruta del import por Excel ANTES de sumar el router.urls
urlpatterns = [
    path(
        'participants/import-excel/',
        StudentImportExcelView.as_view(),
        name='participants-import-excel'
    ),
] + router.urls
