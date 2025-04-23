from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    CourseParticipantViewSet,
    CourseMaterialViewSet,
    AttendanceSessionViewSet,
    AttendanceRecordViewSet
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'participants', CourseParticipantViewSet, basename='courseparticipant')
router.register(r'materials', CourseMaterialViewSet, basename='coursematerial')
router.register(r'attendance-sessions', AttendanceSessionViewSet, basename='attendance-session')
router.register(r'attendance-records', AttendanceRecordViewSet, basename='attendance-record')

urlpatterns = router.urls
