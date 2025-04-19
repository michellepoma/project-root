# backend/users/views.py
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, authenticate
from .serializers import UserSerializer, UserRegistrationSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generar token JWT
        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {"non_field_errors": ["Debe incluir 'email' y 'password'."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request=request, email=email, password=password)

        if user is None:
            return Response(
                {"non_field_errors": ["No se puede iniciar sesión con las credenciales proporcionadas."]},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generar token JWT
        refresh = RefreshToken.for_user(user)

        # También podemos mantener el token tradicional si se necesita
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "user": UserSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            "token": token.key  # Token tradicional
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user