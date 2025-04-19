# backend/courses/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, CourseParticipantViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'participants', CourseParticipantViewSet)

urlpatterns = [
    path('', include(router.urls)),
]