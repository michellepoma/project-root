# backend/frontend/urls.py

from django.urls import path
from .views import login_view, register_view, logout_view

urlpatterns = [
    #path('', lista_cursos, name='home'),  # ya lo tenías
    path('', login_view, name='home'),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='regiter'),
    path('logout/', logout_view, name='logout'),
]
