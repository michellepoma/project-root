from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from decouple import config

User = get_user_model()

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{config('FRONTEND_URL')}/reset-password/{uid}/{token}/"
            send_mail(
                subject='Restablecer contraseña',
                message=f'Restablece tu contraseña aquí: {reset_url}',
                from_email=config('DEFAULT_FROM_EMAIL'),
                recipient_list=[email],
            )
            return Response({'message': 'Correo enviado correctamente'})
        except User.DoesNotExist:
            return Response({'error': 'El correo no está registrado'}, status=404)

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            if default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return Response({"message": "Contraseña cambiada correctamente"})
            else:
                return Response({"error": "Token inválido"}, status=400)
        except Exception as e:
            return Response({"error": f"Solicitud inválida: {str(e)}"}, status=400)
