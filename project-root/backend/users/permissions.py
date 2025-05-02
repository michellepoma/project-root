# backend/users/permissions.py
from rest_framework import permissions

class IsAdminOrTeacher(permissions.BasePermission):
    """
    Permite el acceso sólo a superusuarios de Django (is_superuser)
    o a usuarios cuyo campo `role` sea 'teacher'.
    """
    def has_permission(self, request, view):
        u = request.user
        return bool(
            u and u.is_authenticated and
            (u.is_superuser or u.role == 'teacher')
        )
