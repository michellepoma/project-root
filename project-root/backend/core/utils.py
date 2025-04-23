# backend/core/utils.py
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    # Primero, obtenemos la respuesta estándar
    response = exception_handler(exc, context)

    # Si obtenemos una respuesta None, hubo una excepción no manejada por DRF
    if response is None:
        if isinstance(exc, Exception):
            data = {
                'error': True,
                'message': str(exc)
            }
            return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return None

    # Formatear los errores de validación para que sean más fáciles de manejar en el frontend
    if response.status_code == 400:
        # Obtener los errores originales
        errors = response.data

        # Crear una estructura más amigable para el frontend
        formatted_errors = {}

        # Si errors es un dict, procesar cada campo
        if isinstance(errors, dict):
            for field, error_list in errors.items():
                # Si el error es una lista, tomar el primer mensaje
                if isinstance(error_list, list):
                    formatted_errors[field] = error_list[0]
                else:
                    formatted_errors[field] = str(error_list)

        # Si errors es una lista, asumimos errores no relacionados con un campo específico
        elif isinstance(errors, list):
            formatted_errors['non_field_errors'] = errors[0]

        # Si errors es un string u otro tipo, lo convertimos a string
        else:
            formatted_errors['non_field_errors'] = str(errors)

        # Actualizar la respuesta con los errores formateados
        response.data = {
            'error': True,
            'errors': formatted_errors
        }

    # Para errores de autenticación
    elif response.status_code in [401, 403]:
        response.data = {
            'error': True,
            'message': response.data.get('detail', 'Authentication error')
        }

    return response