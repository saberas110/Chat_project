from urllib.parse import parse_qs

import jwt
from asgiref.sync import sync_to_async
from channels.middleware import BaseMiddleware
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.state import token_backend
from accounts.models import User



def _get_token_from_scope(scope, cookie_name='access'):
    headers = dict(scope.get('headers', []))
    cookie_header = headers.get(b"cookie", b"").decode()
    if cookie_header:
        for pair in cookie_header.split("; "):
            if "=" in pair:
                k, v = pair.split("=", 1)
                if k == cookie_name:
                    return v
    qs = scope.get("query_string", b"").decode()
    if qs:
        params = parse_qs(qs)
        token_list = params.get("token") or params.get("access")
        if token_list:
            return token_list[0]
    return None
@sync_to_async
def _get_user_from_payload(payload):
    try:
        user_id = payload.get("user_id") or payload.get('user') or payload.get("uid")
        user =  User.objects.get(id=user_id)
        return user
    except Exception as e:
        print("❌ Error while getting user:", e)
        return AnonymousUser()


class JwtAuthSocketMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        token = _get_token_from_scope(scope, cookie_name=getattr(settings, "JWT_COOKIE_NAME", "access"))
        if token:
            try:
                # token_backend = TokenBackend(signing_key=settings.SECRET_KEY)
                validated_data = token_backend.decode(token, verify=True)
                user = await _get_user_from_payload(validated_data)
                scope["user"] = user
            except Exception as e:
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)




