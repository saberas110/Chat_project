from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views
from .views import  UserView

urlpatterns = [
    path('csrf', views.CSRFTokenView.as_view()),
    path('otp', views.OtpView.as_view()),
    path('register', views.RegisterView.as_view()),
    path('get/user', UserView.as_view()),
]