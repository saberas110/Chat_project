from rest_framework import status
from rest_framework.exceptions import APIException


class UserNotFoundError(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_code = 'کاربری با این شماره یافت نشد.'
    default_detail = 'user_not_found'