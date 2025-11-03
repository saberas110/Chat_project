from django.db import models
from django.contrib.auth.models import AbstractBaseUser,AbstractUser
from .managers import UserManager



class User(AbstractBaseUser):
    phone_number = models.CharField(unique=True, max_length=11)
    first_name = models.CharField(max_length=50,null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default = False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['email']
    objects = UserManager()

    def has_perm(self,perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin

    def __str__(self):
        return f'{self.phone_number}'


class OTP(models.Model):
    code = models.CharField(max_length=6)
    phone = models.CharField(max_length=11)
    expired_time = models.DateTimeField()

    def save(self, *args, **kwargs):
        OTP.objects.filter(phone=self.phone).delete()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.code}----{self.phone}'


