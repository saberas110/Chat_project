import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.conf import settings
from django.utils import timezone
from chat.models import Message, Conversation
from chat.serializers import MessageSerializer, ConversationSerializer


class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if self.user is None or self.user.is_anonymous:
            await self.close()
            return

        self.group_name = 'presence'
        self.user_group_name = f"user_{self.user.id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        await self.accept()

        await self.set_online(self.user, True)

        bot_conversation = await self.get_or_create_bot_conversation()

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "presence.update",
                "user_id": self.user.id,
                "username": getattr(self.user, "username", None),
                "status": "online",
            }
        )

        srz_conversations = await self.get_conversations(self.user)
        print('srz_conv', srz_conversations)

        await self.channel_layer.group_send(
            self.user_group_name,
            {
                "type": "chat.list",
                "conversations": srz_conversations
            }
        )

    async def disconnect(self, code):
        if self.user is None or self.user.is_anonymous:
            return

        await self.set_last_seen(self.user)
        await self.set_online(self.user, False)
        await self.channel_layer.group_send(
            self.group_name, {
                "type": "presence.update",
                "user_id": self.user.id,
                "username": getattr(self.user, 'username', None),
                "status": "offline",
            }
        )
        await self.channel_layer.group_discard(self.group_name, self.channel_name)



    async def new_chat(self, event):
        await self.send(text_data=json.dumps({
            "type": "new_chat",
            "conversation": event["conversation"]
        }))


    async def read_message(self, event):
        print('calling new read_message', event)
        await self.send(text_data=json.dumps({
            "type": 'read_message',
            "conversation": event["conversation"]
        }))


    async def presence_update(self, event):
        await self.send(text_data=json.dumps(event))


    async def chat_list(self, event):
        await self.send(text_data=json.dumps({
            "type": 'chat_list',
            'conversations': event['conversations']
        }))


    @database_sync_to_async
    def get_or_create_bot_conversation(self):
        from chat.models import Conversation
        from accounts.models import User
        from django.conf import settings



        try:

            bot = User.objects.get(phone_number=settings.BOT_NUMBER)
        except User.DoesNotExist:
            bot = User.objects.create(phone_number=settings.BOT_NUMBER)


        conv = Conversation.objects.filter(participants=self.user).filter(participants=bot).distinct().first()
        if  conv is None:
            conv = Conversation.objects.create()
            conv.participants.add(self.user, bot)

        return conv



    @database_sync_to_async
    def set_online(self, user, val: bool):
        profile = getattr(user, "userprofile", None)
        if profile:
            profile.is_online = val
            profile.save(update_fields=['is_online', 'last_seen'])

    @database_sync_to_async
    def set_last_seen(self, user):
        profile = getattr(user, "userprofile", None)
        if profile:
            profile.last_seen = timezone.now()
            profile.save(update_fields=["last_seen", "is_online"])

    @database_sync_to_async
    def get_conversations(self, user):
        from django.db.models import Max, Q
        from accounts.models import User

        bot_user = User.objects.get(phone_number=settings.BOT_NUMBER)

        bot_conversation = Conversation.objects.filter(participants=user).filter(participants=bot_user).distinct().first()


        cvs = (
            Conversation.objects
            .filter(
                Q(participants=user, messages__isnull=False) |
                Q(id=bot_conversation.id)
            )
            .annotate(last_message_time=Max('messages__created_at'))
            .order_by('-last_message_time')
            .distinct())
        if cvs.exists():
            print('srz get convs:,', user)
            srz_cvs = ConversationSerializer(cvs, many=True, context={'user': user})

            return srz_cvs.data
        return None



class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']

        if self.user is None or self.user.is_anonymous:
            await self.close(code=4001, reason='token_expired')
            return

        self.conversation_id = self.scope["url_route"]["kwargs"].get("conversation_id", None)
        self.other_user_id = self.scope["url_route"]["kwargs"].get("other_user_id", None)

        if not self.conversation_id:
            if not self.other_user_id:
                await self.send(text_data=json.dumps({
                    "type": "error",
                    "message": "Missing other_user_id"
                }))
                return

        self.room_chat_name = f"chat_{self.conversation_id}" if self.conversation_id else f"temp_chat_{self.user.id}"

        await self.channel_layer.group_add(self.room_chat_name, self.channel_name)
        await self.accept()


        if self.conversation_id:
            old_message = await self.get_old_message(self.conversation_id)
            await self.send(text_data=json.dumps({
                'type': 'init_message',
                'messages': old_message
            }))
        else:
            conversationـid = await self.get_or_create_conversation(self.user.id, self.other_user_id)
            old_message = await self.get_old_message(conversationـid)
            await self.send(text_data=json.dumps({
                'type': 'init_message',
                'messages': old_message,
                'waiting_for_first_message': True
            }))


    async def receive(self, text_data=None):
        data = json.loads(text_data)
        message_type = data.get("type")



        if message_type == "read_messages":

            if not self.conversation_id:
                self.conversation_id = await self.get_or_create_conversation(self.user.id, self.other_user_id)
            srz_conv = await self.read_message(self.conversation_id)
            if srz_conv is not None:
                print(f'im {self.user} open ther socket for ', srz_conv)

                await self.channel_layer.group_send(f'user_{self.user.id}', {
                    "type": "read.message",
                    'conversation': srz_conv
                })



        if message_type == "chat_message":
            message_text = data.get("messages")

            if not self.conversation_id:
                self.conversation_id = await self.get_or_create_conversation(self.user.id, self.other_user_id)


            self.room_chat_name = f"chat_{self.conversation_id}"

            await self.channel_layer.group_add(self.room_chat_name, self.channel_name)

            message, srz_msg = await self.create_message(self.user, self.conversation_id, message_text)
            await self.channel_layer.group_send(self.room_chat_name, {
                "type": "chat.message",
                "message": srz_msg,
                "sender_id": self.user.id,
            })

            self.srz_user_conv, self.srz_other_user_conv = await self.serialized_both_conversation(self.conversation_id, self.user)

            await self.channel_layer.group_send(f'user_{self.user.id}', {
                "type": "new.chat",
                "conversation": self.srz_user_conv
            })

            await self.channel_layer.group_send(f'user_{self.other_user_id}', {
                "type": "new.chat",
                "conversation": self.srz_other_user_conv
            })






    @database_sync_to_async
    def get_or_create_conversation(self, user_id, other_user_id):
        from chat.models import Conversation
        from accounts.models import User

        try:
            self.other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return None

        conv = Conversation.objects.filter(participants__id=user_id).filter(participants__id=other_user_id).first()
        if not conv:
            conv = Conversation.objects.create()
            conv.participants.add(user_id, other_user_id)

        return conv.id

    @database_sync_to_async
    def serialized_both_conversation(self, conv_id, user):
        from .serializers import ConversationSerializer

        try:
            conv = Conversation.objects.get(id=conv_id)
            other_user = conv.participants.exclude(id=self.user.id).first()
            self.other_user_id = other_user.id


        except Conversation.DoesNotExist:
            return None

        srz_user_conv = ConversationSerializer(conv, context={'user': user}).data
        srz_other_user_conv = ConversationSerializer(conv, context={'user': other_user}).data
        return srz_user_conv, srz_other_user_conv


    async def chat_message(self, event):
        message = event["message"]
        sender_id = event["sender_id"]
        is_me = (self.user.id == sender_id)
        message["isMe"] = is_me
        await self.send(text_data=json.dumps({
            "type": "new_message",
            "message": event["message"]
        }))



    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_chat_name, self.channel_name)



    @database_sync_to_async
    def get_old_message(self, conversation_id):
        Conversation.objects.filter(id = conversation_id)
        query = Message.objects.filter(conversation_id=conversation_id).order_by('created_at')
        return MessageSerializer(query, many=True, context={'user':self.scope['user']}).data

    @database_sync_to_async
    def create_message(self, user, conversation_id, text):
        message = Message.objects.create(sender=user, conversation_id=conversation_id, text=text)
        srz_msg = MessageSerializer(message, context={'user': self.user}).data

        return message, srz_msg

    @database_sync_to_async
    def read_message(self,conversation_id ):
        from .models import MessageReadStatus


        try:
            conv = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return None

        unread_messages = conv.messages.exclude(sender=self.user).exclude(read_messages__user=self.user)
        if unread_messages.exists():
            read_statuses = [ MessageReadStatus.objects.create(message=msg, user=self.user, read_at=timezone.now()
                                                               ) for msg in unread_messages]
            MessageReadStatus.objects.bulk_create(read_statuses, ignore_conflicts=True)

            srz_conv = ConversationSerializer(conv, context={'user': self.user}).data
            return srz_conv
        return None

