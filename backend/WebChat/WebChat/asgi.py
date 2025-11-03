import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from chat.routing import websocket_urlpatterns as ws_u1
from image_bot.routing import websocket_urlpatterns as ws_u2
from chat.authSocket import JwtAuthSocketMiddleware

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WebChat.settings")
# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

all_websocket_urlpatterns = ws_u1 + ws_u2

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": JwtAuthSocketMiddleware(
            URLRouter(
                all_websocket_urlpatterns)
        ),
    }
)
