from rest_framework import serializers
from .models import Course, CourseParticipant, CourseMaterial, ScheduledClass, CourseSchedule

from django.contrib.auth import get_user_model


User = get_user_model()

class CourseScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseSchedule
        fields = ['day', 'start_time', 'end_time']


class CourseSerializer(serializers.ModelSerializer):
    schedules = CourseScheduleSerializer(many=True)
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id',
            'name',
            'code',
            'description',
            'subject_code',
            'teacher_name',
            'teacher',
            'schedules',
            'created_at',
        ]
        read_only_fields = ['code', 'created_at']

    def get_teacher_name(self, obj):
        if obj.teacher:
            first = obj.teacher.first_name.capitalize()
            last = obj.teacher.last_name.capitalize()
            return f"{first} {last}"
        return ""
    
    def validate_teacher(self, value):
        request = self.context.get('request')
        if request and not request.user.is_superuser:
            raise serializers.ValidationError("Solo los administradores pueden asignar el docente.")
        return value

    def create(self, validated_data):
        schedules_data = validated_data.pop('schedules')
        request = self.context.get('request')

        raw_teacher = validated_data.get('teacher')  # ← no usar pop aquí

        if request and request.user.is_superuser:
            if not raw_teacher:
                raise serializers.ValidationError("Debe seleccionar un docente.")

            if isinstance(raw_teacher, User):
                teacher = raw_teacher
            else:
                try:
                    teacher = User.objects.get(pk=raw_teacher, role='teacher')
                except User.DoesNotExist:
                    raise serializers.ValidationError("El docente no existe o no es válido.")
        else:
            teacher = request.user

        validated_data['teacher'] = teacher  # ← esto se usa para crear el curso

        course = Course.objects.create(**validated_data)

        for sched in schedules_data:
            CourseSchedule.objects.create(course=course, **sched)

        if request.user != teacher:
            CourseParticipant.objects.create(user=request.user, course=course, role='teacher')

        return course

    def update(self, instance, validated_data):
        schedules_data = validated_data.pop('schedules', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if schedules_data is not None:
            # Limpiar horarios anteriores y crear nuevos
            instance.schedules.all().delete()
            for sched in schedules_data:
                CourseSchedule.objects.create(course=instance, **sched)

        return instance



class CourseParticipantSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = CourseParticipant
        fields = ['id', 'user', 'user_name', 'course', 'role', 'joined_at']
        read_only_fields = ['joined_at']

    def get_user_name(self, obj):
        return obj.user.name

class CourseMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseMaterial
        fields = [
            'id',
            'course',
            'title',
            'description',
            'file',
            'link',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

from .models import AttendanceSession, AttendanceRecord


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = ['id', 'session', 'student', 'student_name', 'present']
        read_only_fields = ['id', 'student_name']


class AttendanceSessionSerializer(serializers.ModelSerializer):
    records = AttendanceRecordSerializer(many=True, read_only=True)

    class Meta:
        model = AttendanceSession
        fields = ['id', 'course', 'date', 'created_at', 'records']

class ScheduledClassSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = ScheduledClass
        fields = ['id', 'course_id', 'course_name', 'datetime', 'link', 'created_at']
        read_only_fields = ['id', 'created_at', 'course_name']
