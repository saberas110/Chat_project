from django.contrib.auth.models import BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, phone_number, password):
        if not phone_number:
            raise ValueError('user must have phone_number')
        user = self.model(phone_number=phone_number)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password, email):
        user = self.create_user(phone_number, password)
        user.email = self.normalize_email(email)
        user.is_admin = True
        user.save(using=self._db)
        return user

