#
# class ConversationSerializer(serializers.ModelSerializer):
#     last_message = serializers.SerializerMethodField()
#     name = serializers.SerializerMethodField()
#     unread = serializers.SerializerMethodField()
#     last_seen = serializers.SerializerMethodField()
#     is_online = serializers.SerializerMethodField()
#     avatar = serializers.SerializerMethodField()
#     contact_user = serializers.SerializerMethodField()
#
#     class Meta:
#         model = Conversation
#         fields = ['id', 'name', 'last_message', 'unread', 'avatar', 'contact_user', 'is_online', 'last_seen']
#
#     def _get_users(self, obj):
#         request = self.context.get('request')
#         user = request.user if request else None
#         other_user = obj.participants.exclude(id=user.id).first() if user else None
#         return user, other_user
#
#
#     def get_last_message(self, obj):
#         last_message = obj.messages.order_by('-created_at').first()
#         if last_message:
#             return last_message.text
#         return None
#
#     def get_name(self, obj):
#         user, other_user = self._get_users(obj)
#         try:
#             other_user_contact = Contact.objects.get(contact_user=other_user)
#             return other_user_contact.name
#         except Contact.DoesNotExist:
#             return other_user.phone_number if other_user else None
#
#     def get_avatar(self, obj):
#         request = self.context.get('request')
#         user, other_user = self._get_users(obj)
#         avatar = other_user.images.filter(is_main=True).first()
#         if avatar and avatar.image:
#             main_avatar = getattr(avatar, 'image', None)
#             return request.build_absolute_uri(main_avatar.url)
#         return request.build_absolute_uri(f'{settings.MEDIA_URL}/profile_images/avatar/default-avatar.jpg')
#
#     def get_unread(self, obj):
#         user, _ = self._get_users(obj)
#         unread_count = obj.messages.exclude(sender=user).filter(
#             ~Q(read_messages__user=user)
#         ).count()
#         return unread_count
#
#     def get_contact_user(self, obj):
#         _, other_user = self._get_users(obj)
#         if other_user:
#             return other_user.id
#         return None
#
#     def get_is_online(self, obj):
#         _, other_user = self._get_users(obj)
#         return other_user.userprofile.is_online if other_user else None
#
#     def get_last_seen(self, obj):
#         _, other_user = self._get_users(obj)
#         if other_user and not self.get_is_online(obj):
#             return other_user.userprofile.last_seen
#         return None
