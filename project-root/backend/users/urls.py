from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views_password_reset import PasswordResetRequestView, PasswordResetConfirmView
from .views import (
    LoginView,
    UserProfileView,
    CustomTokenObtainPairView,
    AdminUserCreateView,
    AdminUserDetailView,
    UserListView  # ✅ Importación correcta
)

urlpatterns = [
    # Login normal por email+password
    path('login/', LoginView.as_view(), name='login'),

    # Perfil del usuario autenticado
    path('profile/', UserProfileView.as_view(), name='profile'),

    # Sólo superusuario crea usuarios y define rol
    path('admin/users/', AdminUserCreateView.as_view(), name='admin-user-create'),

    # Listado de todos los usuarios (admin-only)
    path('all/', UserListView.as_view(), name='user-list'),
    
    # Editar/eliminar Usuario (admin-only)
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    # JWT
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Recuperación de contraseña
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]
