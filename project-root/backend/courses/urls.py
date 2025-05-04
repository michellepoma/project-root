# backend/courses/urls.py

from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    CourseParticipantViewSet,
    CourseMaterialViewSet,
    AttendanceSessionViewSet,
    AttendanceRecordViewSet,
    ScheduledClassViewSet,
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'participants', CourseParticipantViewSet, basename='participant')
router.register(r'materials', CourseMaterialViewSet, basename='material')
router.register(r'sessions', AttendanceSessionViewSet, basename='session')
router.register(r'records', AttendanceRecordViewSet, basename='record')
router.register(r'scheduled-classes', ScheduledClassViewSet, basename='scheduled-class')

urlpatterns = router.urls  # ✅ ESTA LÍNEA DEBE SER UNA LISTA, NO un include()
