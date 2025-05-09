# backend/assignments/urls.py

from rest_framework.routers import DefaultRouter
from .views import AssignmentViewSet

from rest_framework.routers import DefaultRouter
from .views import AssignmentViewSet, GradeViewSet, SubmissionViewSet # Añadir SubmissionViewSet

router = DefaultRouter()
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'grades', GradeViewSet, basename='grade') # Asumiendo que lo añades aquí o ya lo tienes en otro lado
router.register(r'submissions', SubmissionViewSet, basename='submission') # Nueva ruta

urlpatterns = router.urls