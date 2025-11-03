from wave import Error

from django.contrib.auth import user_logged_in
from django.contrib.auth.models import AnonymousUser
from rest_framework.exceptions import ErrorDetail
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status
from rest_framework_simplejwt.exceptions import ExpiredTokenError, TokenError, InvalidToken, AuthenticationFailed
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from django.http import JsonResponse


class AttachTokenMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response


    def __call__(self, request):
        access_token = request.COOKIES.get('access')
        if access_token:
            request.META["HTTP_AUTHORIZATION"] = f"Bearer {access_token}"

        return self.get_response(request)



class RefreshJWTMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        access = request.COOKIES.get('access')
        refresh = request.COOKIES.get('refresh')

        print('access', access)
        user = AnonymousUser()
        new_access = None
        if access:
            try:
                AccessToken(access)
                validated_token = JWTAuthentication().get_validated_token(access)
                user = JWTAuthentication().get_user(validated_token)
            except ExpiredTokenError:
                if refresh:
                    try:
                        refresh = RefreshToken(refresh)
                        new_access = str(refresh.access_token)
                        request.COOKIES["access"] = new_access
                        validated_token = JWTAuthentication().get_validated_token(new_access)
                        user = JWTAuthentication().get_user(validated_token)

                    except TokenError:
                        pass

            except AuthenticationFailed:
                user = AnonymousUser()
                access = None


            except (TokenError, InvalidToken):
                pass

        request.user = user
        response = self.get_response(request)

        if new_access:
            response.set_cookie(
                'access',
                new_access,
                httponly=True,
                secure=False,
                samesite='lax'
            )
        print('user in middlware is ', user)

        # if isinstance(user, AnonymousUser):
        #     response.delete_cookie('access')
        #     response.delete_cookie('refresh')

        return response