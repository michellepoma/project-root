import secrets

import pandas as pd
from rest_framework import viewsets, status
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model
from rest_framework import filters
from rest_framework.views import APIView
from users.permissions import IsAdminOrTeacher

from .models import (
    Course,
    CourseParticipant,
    CourseMaterial,
    AttendanceSession,
    AttendanceRecord,
    ScheduledClass,
    CourseSchedule
)
from .serializers import (
    CourseSerializer,
    CourseParticipantSerializer,
    CourseMaterialSerializer,
    AttendanceSessionSerializer,
    AttendanceRecordSerializer,
    ScheduledClassSerializer,
    CourseScheduleSerializer
)

User = get_user_model()


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description', 'subject_code', 'teacher__name', 'code']

    def get_permissions(self):
        # Students can join courses
        if self.action in ('join', 'join_by_code'):
            return [IsAuthenticated()]
        # Any authenticated user can list/retrieve their courses
        if self.action in ('list', 'retrieve'):
            return [IsAuthenticated()]
        # Creation, updates, deletions, participants listing and promotion require teacher/admin
        return [IsAuthenticated(), IsAdminOrTeacher()]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Course.objects.all()

        enrolled_ids = CourseParticipant.objects.filter(user=user).values_list('course_id', flat=True)
        return Course.objects.filter(id__in=enrolled_ids)


    def update(self, request, *args, **kwargs):
        course = self.get_object()
        user = request.user

        if not user.is_superuser and course.teacher != user:
            raise PermissionDenied("Solo el profesor asignado o un administrador puede editar este curso.")

        return super().update(request, *args, **kwargs)
    
    def perform_update(self, serializer):
        course = self.get_object()
        request = self.request
        old_teacher = course.teacher
        new_teacher_id = request.data.get("teacher")

        updated_course = serializer.save()

        if new_teacher_id and str(old_teacher.id) != str(new_teacher_id):
            try:
                new_teacher = User.objects.get(pk=new_teacher_id, role='teacher')
            except User.DoesNotExist:
                raise PermissionDenied("El nuevo docente no es válido.")

            CourseParticipant.objects.filter(
                course=course, user=old_teacher, role='teacher'
            ).delete()

            CourseParticipant.objects.get_or_create(
                course=course,
                user=new_teacher,
                defaults={"role": "teacher"}
            )

        return updated_course
    
    def retrieve(self, request, *args, **kwargs):
        course = self.get_object()
        user = request.user

        if user.is_superuser:
            return super().retrieve(request, *args, **kwargs)

        if not CourseParticipant.objects.filter(course=course, user=user).exists():
            raise PermissionDenied("No tienes acceso a este curso.")

        return super().retrieve(request, *args, **kwargs)


    def destroy(self, request, *args, **kwargs):
        course = self.get_object()
        user = request.user

        if not user.is_superuser and course.teacher != user:
            raise PermissionDenied("Solo el profesor asignado o un administrador puede eliminar este curso.")

        return super().destroy(request, *args, **kwargs)


    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        course = self.get_object()
        user = request.user
        if CourseParticipant.objects.filter(user=user, course=course).exists():
            return Response({"detail": "Ya estás inscrito en este curso."}, status=status.HTTP_400_BAD_REQUEST)
        participant = CourseParticipant.objects.create(
            user=user,
            course=course,
            role='student'
        )
        return Response(CourseParticipantSerializer(participant).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def join_by_code(self, request):
        code = request.data.get('code')
        if not code:
            return Response({"detail": "Se requiere el código del curso."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            course = Course.objects.get(code=code)
        except Course.DoesNotExist:
            return Response({"detail": "Código de curso inválido."}, status=status.HTTP_404_NOT_FOUND)
        user = request.user
        if CourseParticipant.objects.filter(user=user, course=course).exists():
            return Response({"detail": "Ya estás inscrito en este curso."}, status=status.HTTP_400_BAD_REQUEST)
        participant = CourseParticipant.objects.create(
            user=user,
            course=course,
            role='student'
        )
        return Response(CourseParticipantSerializer(participant).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        course = self.get_object()
        participants = CourseParticipant.objects.filter(course=course)
        serializer = CourseParticipantSerializer(participants, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def promote(self, request, pk=None):
        course = self.get_object()
        user_id = request.data.get('user_id')
        try:
            target = User.objects.get(pk=user_id)
            participation = CourseParticipant.objects.get(course=course, user=target)
        except (User.DoesNotExist, CourseParticipant.DoesNotExist):
            return Response({"detail": "Usuario o participación inválida."}, status=status.HTTP_400_BAD_REQUEST)
        participation.role = 'assistant'
        participation.save()
        return Response(CourseParticipantSerializer(participation).data)


class CourseParticipantViewSet(viewsets.ModelViewSet):
    queryset = CourseParticipant.objects.all()
    serializer_class = CourseParticipantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        course_id = self.request.query_params.get("course")

        if not course_id:
            return CourseParticipant.objects.none()

        is_participant = CourseParticipant.objects.filter(user=user, course_id=course_id).exists()
        if not is_participant:
            return CourseParticipant.objects.none()

        return CourseParticipant.objects.filter(course_id=course_id)

    @action(detail=False, methods=['post'], url_path='add-by-email')
    def add_by_email(self, request):
        email = request.data.get("email")
        course_id = request.data.get("course_id")

        if not email or not course_id:
            return Response({"detail": "Se requieren 'email' y 'course_id'"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Usuario no encontrado"}, status=404)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"detail": "Curso no encontrado"}, status=404)

        # Verificar si ya es participante
        if CourseParticipant.objects.filter(user=user, course=course).exists():
            return Response({"detail": "Este usuario ya está inscrito."}, status=400)

        participant = CourseParticipant.objects.create(
            user=user,
            course=course,
            role="student"
        )
        return Response(CourseParticipantSerializer(participant).data, status=201)

from django.db import models

class CourseMaterialViewSet(viewsets.ModelViewSet):
    serializer_class = CourseMaterialSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        course_id = self.request.query_params.get("course")

        # Si se está listando por curso (ej. /materials/?course=18)
        if course_id:
            if CourseParticipant.objects.filter(user=user, course_id=course_id).exists():
                return CourseMaterial.objects.filter(course_id=course_id)
            return CourseMaterial.objects.none()

        # Si es un acceso directo por ID (ej. /materials/3/), verificar que el usuario tenga acceso
        return CourseMaterial.objects.filter(
            course__participants__user=user
        ).distinct()


    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        user = self.request.user
        if course.teacher != user:
            raise PermissionDenied("Solo el profesor puede subir materiales.")
        serializer.save()

    def perform_update(self, serializer):
        course = serializer.validated_data.get('course', serializer.instance.course)
        user = self.request.user
        if course.teacher != user:
            raise PermissionDenied("Solo el profesor puede editar este material.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if instance.course.teacher != user:
            raise PermissionDenied("Solo el profesor puede eliminar este material.")
        instance.delete()


class AttendanceSessionViewSet(viewsets.ModelViewSet):
    queryset = AttendanceSession.objects.all()
    serializer_class = AttendanceSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return AttendanceSession.objects.filter(course__participants__user=user)

    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        if course.teacher != self.request.user:
            raise PermissionDenied("Solo el profesor puede registrar asistencia.")
        serializer.save()


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return AttendanceRecord.objects.filter(session__course__participants__user=user)

class ScheduledClassViewSet(viewsets.ModelViewSet):
    queryset = ScheduledClass.objects.all()
    serializer_class = ScheduledClassSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ScheduledClass.objects.filter(course__participants__user=user)

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data.get('course')

        if not course:
            raise PermissionDenied("Falta el campo 'course' o no es válido.")

        if course.teacher != user:
            raise PermissionDenied("Solo el profesor puede programar clases.")

        serializer.save()


    def perform_update(self, serializer):
        course = serializer.validated_data.get('course', serializer.instance.course)
        if course.teacher != self.request.user:
            raise PermissionDenied("Solo el profesor puede editar esta clase.")
        serializer.save()

class StudentImportExcelView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAdminUser]

    def post(self, request):
        excel     = request.FILES.get('file')
        course_id = request.data.get('course_id')
        if not excel or not course_id:
            return Response(
                {"detail": "Se requieren 'file' (Excel) y 'course_id'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist:
            return Response({"detail": "Curso no encontrado."}, status=404)

        df = pd.read_excel(excel)
        imported = []

        for _, row in df.iterrows():
            email      = row.get('email')
            first_name = (row.get('first_name') or '').strip()
            last_name  = (row.get('last_name')  or '').strip()
            ci         = (str(row.get('ci'))    or '').strip()

            if not email or not ci or not first_name:
                # saltamos filas con datos incompletos
                continue

            # Buscamos usuario existente por email o CI
            user = User.objects.filter(email=email).first()
            if not user:
                user = User.objects.filter(ci=ci).first()

            if user:
                # Si ya existía, podemos actualizar nombres/CI si quieres...
                updated = False
                if user.first_name != first_name:
                    user.first_name = first_name; updated = True
                if user.last_name  != last_name:
                    user.last_name  = last_name;  updated = True
                if user.ci         != ci:
                    user.ci         = ci;         updated = True
                if updated:
                    user.save()
            else:
                # Generamos contraseña = ci + first_name
                raw_password = f"{ci}{first_name}"

                user = User.objects.create_user(
                    email=email,
                    name=f"{first_name} {last_name}".strip(),
                    password=raw_password,
                    first_name=first_name,
                    last_name=last_name,
                    role='student',
                    ci=ci
                )

            # Inscribimos al curso (no duplica gracias a get_or_create)
            CourseParticipant.objects.get_or_create(
                user=user,
                course=course,
                defaults={'role': 'student'}
            )

            imported.append({
                "email": email,
                "password": f"{ci}{first_name}"
            })

        return Response(
            {"imported": imported, "count": len(imported)},
            status=status.HTTP_201_CREATED
        )