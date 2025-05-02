from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView,
    UserProfileView,
    CustomTokenObtainPairView,
    AdminUserCreateView
)

urlpatterns = [
    # Login normal por email+password
    path('login/', LoginView.as_view(), name='login'),

    # Perfil del usuario autenticado
    path('profile/', UserProfileView.as_view(), name='profile'),

    # Sólo superusuario crea usuarios y define rol
    path('admin/users/', AdminUserCreateView.as_view(), name='admin-user-create'),

    # JWT
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
