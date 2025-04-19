#frontend/utils.py
from django.shortcuts import redirect

def jwt_login_required(view_func):
    def wrapper(request, *args, **kwargs):
        if 'access' not in request.session:
            return redirect('login')
        return view_func(request, *args, **kwargs)
    return wrapper
