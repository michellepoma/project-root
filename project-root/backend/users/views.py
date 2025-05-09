# backend/users/views.py
from .serializers import CustomTokenObtainPairSerializer, AdminUserCreateSerializer, AdminUserUpdateSerializer, PasswordChangeSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, authenticate
from .serializers import UserSerializer, UserRegistrationSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .pagination import StandardResultsSetPagination
from rest_framework import filters
# users/views.py
from rest_framework import generics, permissions
from django.contrib.auth import get_user_model

User = get_user_model()
# backend/users/views.py


User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


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
                {"non_field_errors": [
                    "No se puede iniciar sesión con las credenciales proporcionadas."]},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generar token JWT
        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserSerializer(user).data,
            "token": str(refresh.access_token)  # Solo devolver el access token
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

class PasswordChangeView(generics.UpdateAPIView):
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        new_password = serializer.validated_data['new_password']
        user = request.user
        user.set_password(new_password)
        user.save()

        return Response({"detail": "Contraseña actualizada correctamente."}, status=status.HTTP_200_OK)

class AdminUserCreateView(generics.CreateAPIView):
    """
    Sólo un superusuario puede llamar aquí para crear usuarios
    y asignarles rol (student o teacher).
    """
    queryset = User.objects.all()
    serializer_class = AdminUserCreateSerializer
    permission_classes = [permissions.IsAdminUser]


class UserListView(generics.ListAPIView):
    """
    Solo los administradores pueden ver la lista completa de usuarios.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['ci', 'first_name', 'last_name', 'email', 'name']
    
    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get("role")
        is_superuser = self.request.query_params.get("is_superuser")

        if role:
            queryset = queryset.filter(role__iexact=role)
        if is_superuser is not None:
            queryset = queryset.filter(is_superuser=is_superuser.lower() == "true")

        return queryset

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserUpdateSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'pk'
