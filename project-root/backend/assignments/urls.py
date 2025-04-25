# backend/assignments/urls.py

from rest_framework.routers import DefaultRouter
from .views import AssignmentViewSet

router = DefaultRouter()
router.register(r'assignments', AssignmentViewSet, basename='assignment')

urlpatterns = router.urls  # ✅ Correcto: ES UNA LISTA, no un include()
