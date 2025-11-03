import re
from django.utils import timezone

from django.template.context_processors import request
from rest_framework import serializers


from accounts.models import OTP, User


class PhoneSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=10)

    def validate_phone(self, value):
        value = value.strip()

        if not re.match(r"^\d+$", value):
            raise serializers.ValidationError("شماره تلفن باید فقط شامل ارقام باشد.")

        if len(value) != 10:
            raise serializers.ValidationError("شماره تلفن باید دقیقا ۱۱ رقم باشد.")

        if not value.startswith('9'):
            raise serializers.ValidationError("شماره تلفن معتبر نمیباشد.شماره باید با (9) اغاز شود")

        return f'0{value}'

class OtpSerializer(serializers.Serializer):
    otp_code = serializers.CharField(max_length=6)

    def validate_otp_code(self, value):
        value = value.strip()
        request = self.context['request']
        phone = request.session['phone']

        if phone == None:
            raise serializers.ValidationError('شماره ای وارد نشده است.')

        try:
            otp = OTP.objects.get(phone=phone)
            if otp.code != value:
                raise serializers.ValidationError("کد وارد شده اشتباه است")

            if otp.expired_time < timezone.now():
                raise serializers.ValidationError("کد وارد شده منقضی شده است")
            otp.delete()
            return phone
        except OTP.DoesNotExist:
            raise serializers.ValidationError("هیچ کدی برای این شماره در سیستم ثبت نشده است")




class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['phone_number']