# frontend/views.py

import requests
from django.shortcuts import render, redirect

# LOGIN
def login_view(request):
    if 'access' in request.session:
        return redirect('main')
    
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        response = requests.post('http://localhost:8000/api/token/', json={
            'email': email,
            'password': password
        })

        if response.status_code == 200:
            data = response.json()
            request.session['access'] = data['access']
            request.session['refresh'] = data['refresh']
            return redirect('main')
        else:
            return render(request, 'frontend/login.html', {
                'error': 'Credenciales inválidas'
            })

    return render(request, 'frontend/login.html')


# REGISTER
from django.shortcuts import render, redirect
from django.urls import reverse

def register_view(request):
    if request.method == 'POST':
        password = request.POST.get('password')
        password_confirm = request.POST.get('password_confirm')

        if password != password_confirm:
            request.session['register_error'] = {
                'Confirmar contraseña': ['Las contraseñas no coinciden.']
            }
            return redirect('register')

        data = {
            'email': request.POST.get('email'),
            'name': request.POST.get('name'),
            'ci': request.POST.get('ci'),
            'password': password,
            'password_confirm': password_confirm,
        }

        response = requests.post('http://localhost:8000/api/users/register/', json=data, allow_redirects=False)

        if response.status_code == 201:
            tokens = response.json().get('tokens')
            request.session['access'] = tokens['access']
            request.session['refresh'] = tokens['refresh']
            return redirect('main')

        try:
            error_data = response.json()
        except:
            error_data = {'Error': ['Ocurrió un error desconocido.']}

        request.session['register_error'] = error_data
        return redirect('register')

    # GET normal o después del redirect
    error_data = request.session.pop('register_error', None)
    return render(request, 'frontend/register.html', {
        'error': error_data
    })


# LOGOUT
def logout_view(request):
    request.session.flush()
    return redirect('login')

# MAIN
def main_view(request):
    if 'access' not in request.session:
        return redirect('login')

    # Recuperar el nombre desde el backend (si lo tienes)
    import requests
    headers = {
        'Authorization': f'Bearer {request.session["access"]}'
    }
    try:
        response = requests.get('http://localhost:8000/api/users/profile/', headers=headers)
        if response.status_code == 200:
            user_data = response.json()
        else:
            user_data = {'name': 'Invitado'}
    except:
        user_data = {'name': 'Invitado'}

    return render(request, 'frontend/main.html', {'user': user_data})


