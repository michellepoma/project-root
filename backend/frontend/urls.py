# backend/frontend/urls.py

from django.urls import path
from .views import login_view, register_view, logout_view, main_view, create_course_view

urlpatterns = [
    #path('', lista_cursos, name='home'),  # ya lo tenías
    path('', login_view, name='home'),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('logout/', logout_view, name='logout'),
    path('main/', main_view, name='main'),
    path('create_course/', create_course_view, name='create_course')

]
