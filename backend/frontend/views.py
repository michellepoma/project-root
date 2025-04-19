# frontend/views.py

import requests
from django.shortcuts import render, redirect

# LOGIN
def login_view(request):
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
            return redirect('home')
        else:
            return render(request, 'frontend/login.html', {
                'error': 'Credenciales inválidas'
            })

    return render(request, 'frontend/login.html')


# REGISTER
def register_view(request):
    if request.method == 'POST':
        data = {
            'email': request.POST.get('email'),
            'name': request.POST.get('name'),
            'ci': request.POST.get('ci'),
            'password': request.POST.get('password'),
            'password_confirm': request.POST.get('password_confirm'),
        }

        response = requests.post('http://localhost:8000/api/users/register/', json=data)

        if response.status_code == 201:
            tokens = response.json().get('tokens')
            request.session['access'] = tokens['access']
            request.session['refresh'] = tokens['refresh']
            return redirect('home')

        # Manejo más seguro de errores
        try:
            error_data = response.json()
        except:
            error_data = {'error': ['Ocurrió un error desconocido.']}

        return render(request, 'frontend/register.html', {
            'error': error_data
        })


    return render(request, 'frontend/register.html')



# LOGOUT
def logout_view(request):
    request.session.flush()
    return redirect('login')
