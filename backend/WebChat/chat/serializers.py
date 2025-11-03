import re

from django.conf import settings
from django.db.models import Q
from django.templatetags.static import static
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from WebChat.settings import MEDIA_URL
from accounts.models import User
from chat.exceptions import UserNotFoundError
from chat.models import Conversation, Message, Contact


class MessageSerializer(serializers.ModelSerializer):

    isMe = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    class Meta:
        model = Message
        fields = ['id', 'text', 'isMe', 'created_at']

    def get_isMe(self, obj):
        user = self.context.get('user')
        if obj.sender == user:
            return True
        return False

    def get_created_at(self, obj):
        time = obj.created_at
        new_time = timezone.localtime(time)
        return new_time.strftime('%H:%M')





class ConversationSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    unread = serializers.SerializerMethodField()
    last_seen = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    contact_user = serializers.SerializerMethodField()
    is_bot = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'name', 'last_message', 'unread', 'avatar', 'contact_user', 'is_online', 'last_seen', 'is_bot']

    def _get_users(self, obj):
        user = self.context.get('user')
        other_user = obj.participants.exclude(id=user.id).first() if user else None
        return user, other_user

    def get_is_bot(self, obj):
        _, other_user = self._get_users(obj)
        if other_user.phone_number == settings.BOT_NUMBER:
            return True
        return False


    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return last_message.text
        return None

    def get_name(self, obj):
        user, other_user = self._get_users(obj)
        try:
            other_user_contact = Contact.objects.get(owner=user, contact_user=other_user)
            return other_user_contact.name
        except Contact.DoesNotExist:
            if other_user.phone_number==settings.BOT_NUMBER:
                return 'دستیار هوشمند'
            return other_user.phone_number if other_user else None

    def get_avatar(self, obj):
        user, other_user = self._get_users(obj)
        avatar = other_user.images.filter(is_main=True).first()
        if avatar and avatar.image:
            main_avatar = getattr(avatar, 'image', None)
            return f'{settings.BASE_URL}{main_avatar.url}'
        return f'{settings.BASE_URL}/{MEDIA_URL}profile_images/avatar/default-avatar.jpg'

    def get_unread(self, obj):
        user, _ = self._get_users(obj)
        unread_count = obj.messages.exclude(sender=user).filter(
            ~Q(read_messages__user=user)
        ).count()
        return unread_count

    def get_contact_user(self, obj):
        _, other_user = self._get_users(obj)
        if other_user:
            return other_user.id
        return None

    def get_is_online(self, obj):
        _, other_user = self._get_users(obj)
        if other_user:
            user_profile = getattr(other_user, 'userprofile', None)
            if not user_profile is None:
                return user_profile.is_online
        return None


    def get_last_seen(self, obj):
        _, other_user = self._get_users(obj)
        if other_user:
            user_profile = getattr(other_user, 'userprofile', None)
            if not user_profile is None:
                return user_profile.last_seen.isoformat()
        return None







class ContactsSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    last_seen = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    class Meta:
        model = Contact
        fields = ['id', 'name', 'contact_user', 'avatar', 'last_seen', 'is_online']

    def _get_user(self,obj):
        request = self.context.get('request')
        user = request.user if request else None
        return user

    def get_avatar(self, obj):
        request = self.context.get('request')
        avatar = obj.contact_user.images.filter(is_main=True).first()
        if avatar and avatar.image:
            main_avatar = getattr(avatar, 'image', None)
            return request.build_absolute_uri(main_avatar.url)
        return request.build_absolute_uri(f'{settings.MEDIA_URL}/profile_images/avatar/default-avatar.jpg')


    def get_last_seen(self, obj):
        contact_user = obj.contact_user
        user_profile = getattr(contact_user, 'userprofile', None)
        if user_profile and user_profile.last_seen:
            return user_profile.last_seen
        return None

    def get_is_online(self, obj):
        contact_user = obj.contact_user
        user_profile = getattr(contact_user, 'userprofile', None)
        if user_profile and user_profile.is_online:
            return user_profile.is_online
        return None



class AddContactSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=50)
    phone_number = serializers.CharField(max_length=11, write_only=True)
    contact_user = serializers.PrimaryKeyRelatedField(read_only=True)
    avatar = serializers.SerializerMethodField()
    last_seen = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()

    class Meta:
        model = Contact
        fields = ['id', 'name', 'phone_number', 'contact_user', 'avatar', 'last_seen', 'is_online']


    def validate_name(self, value):
        value = value.strip()

        if value =='':
            raise serializers.ValidationError('فیلد نام خالی است.')

        if len(value) > 50 :
            raise serializers.ValidationError('فیلد نام حد اکثر باید ۵۰ کاراکتر باشد')

        return value

    def validate_phone_number(self, value):
        value = value.strip()


        if len(value) !=11 :
            raise serializers.ValidationError('شماره وارد شده صحیح نمیباشد')

        if not re.match(r"^\d+$", value):
            raise serializers.ValidationError("شماره تلفن باید فقط شامل ارقام باشد.")

        if not value.startswith('09'):
            raise serializers.ValidationError("شماره تلفن معتبر نمیباشد.شماره باید با (9) اغاز شود")

        try:
            contact_user = User.objects.get(phone_number=value)

        except User.DoesNotExist:
            raise UserNotFoundError(f' کاربری با شماره ی: {value} وجود ندارد')

        self._contact_user_instance = contact_user
        return value

    def create(self, validate_data):
        user = self.context.get('user')
        try:
            contact = Contact.objects.get(owner=user, contact_user=self._contact_user_instance)
            contact.name = validate_data['name']
            contact.save()

        except Contact.DoesNotExist:
            contact = Contact.objects.create(
                owner=user,
                contact_user=self._contact_user_instance,
                name=validate_data.get('name')
            )
        return contact

    def get_avatar(self, obj):
        avatar = obj.contact_user.images.filter(is_main=True).first()
        if avatar and avatar.image:
            main_avatar = getattr(avatar, 'image', None)
            return f'{settings.BASE_URL}{main_avatar.url}'
        return f'{settings.BASE_URL}{settings.MEDIA_URL}/profile_images/avatar/default-avatar.jpg'

    def get_last_seen(self, obj):
        contact_user = obj.contact_user
        user_profile = getattr(contact_user, 'userprofile', None)
        if user_profile and user_profile.last_seen:
            return user_profile.last_seen
        return None

    def get_is_online(self, obj):
        contact_user = obj.contact_user
        user_profile = getattr(contact_user, 'userprofile', None)
        if user_profile and user_profile.is_online:
            return user_profile.is_online
        return None



