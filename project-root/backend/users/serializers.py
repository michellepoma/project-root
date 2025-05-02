# backend/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _

User = get_user_model()
# backend/users/serializers.py (abajo del todo)

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Puedes agregar claims personalizados aquí si quieres
        token['email'] = user.email
        token['name'] = user.name
        return token

    def validate(self, attrs):
        # Modificamos para autenticar por email
        credentials = {
            'email': attrs.get('email'),
            'password': attrs.get('password')
        }

        user = authenticate(**credentials)

        if user is None:
            raise serializers.ValidationError('Invalid credentials.')

        refresh = self.get_token(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'ci', 'profile_picture', 'created_at']
        read_only_fields = ['created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'name', 'ci', 'password', 'password_confirm']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields don't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class CustomAuthTokenSerializer(serializers.Serializer):
    email = serializers.CharField(label=_("Email"))
    password = serializers.CharField(
        label=_("Password"),
        style={'input_type': 'password'},
        trim_whitespace=False,
        write_only=True
    )

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'),
                                email=email, password=password)

            # Si la autenticación falla, proporciona un mensaje claro
            if not user:
                msg = _('Unable to log in with provided credentials.')
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = _('Must include "email" and "password".')
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs

class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)  # ahora el admin lo define

    class Meta:
        model = User
        fields = ['email', 'name', 'ci', 'password', 'password_confirm', 'role']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Los campos de contraseña no coinciden."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        pwd = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(pwd)
        user.save()
        return user
