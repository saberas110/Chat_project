import json
from time import timezone

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from image_bot.tasks import add_text_to_tshirts

User = get_user_model()


class BotConsumers(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if not self.user or self.user.is_anonymous:
            await self.close(code=4001, reason='not user')
            return

        print('from cons user is', self.user)

        self.room_chat_name = f'bot_{self.user.id}'
        await self.channel_layer.group_add(self.room_chat_name, self.channel_name)

        await self.accept()

        # old_messages = await self.get_old_messages()

        # await self.send(text_data=json.dumps({
        #
        #     "type": "init_message",
        #     "message": old_messages
        #
        # }))

        await self.send(text_data=json.dumps({
            'type': 'guide',
            'message':{
                'id': 1,
                'text':'for use the bot type like this pattern:'
                       '1) for print text on tshirts:  print=hello world   .'
                       '2) see status task: task=<task_id>   .'
                       '3) see all tasks and images : all',
                'is_Me': False,
                "created_at": timezone.now().strftime('%H:%M')
            }

        }))



    async def bot_guide(self, event):
        await self.send(text_data=json.dumps({
            'type': 'guide',
            'message': 'for use the bot type like this pattern:  1) for print text on tshirts:  print=hello world'
                       '2) see status task: task=<task_id>'
                       '3) see all tasks and images : all'

        }))

    async def receive(self, text_data=None):
        data = json.loads(text_data)
        type = data.get('type')
        text = data.get('messages')
        if text is None:
            return
        if type == 'print_text':
            message =await self.create_message(text)

            task = add_text_to_tshirts.delay(message.id, text, self.user.id)
            message.task_id = task.id

            await self.save_message(message)

            await self.send(text_data=json.dumps({
                "type": "task_started",
                "message": {
                    "id": 1,
                    "is_Me": False,
                    "created_at": timezone.now().strftime('%H:%M'),
                    "text": f"The images for task ID <<{task.id}>> are being prepared"
                }
            }))
        if type == 'task_result':
            task_id = text
            srz_task = await self.get_task(task_id)

            await self.send(text_data=json.dumps({
                "type": "task_result",
                "message": srz_task
            }))

        if type == 'all_tasks':
            print('started all')
            all_task = await self.get_old_messages()
            await self.send(text_data=json.dumps({

                "type": "all_tasks",
                "message": all_task

            }))


    async def send_generated_image(self, event):
        await self.send(text_data=json.dumps({
            "type": "generated_images",
            "message": event['message']

        }))

    @database_sync_to_async
    def get_old_messages(self):
        from django.conf import settings
        from .models import BotMessage
        from .serializer import TaskBotSerializer
        from chat.models import Conversation

        bot = User.objects.get(phone_number=settings.BOT_NUMBER)

        conv = (Conversation.objects
                .filter(participants=self.user)
                .filter(participants=bot).distinct())
        if conv.exists():
            conv = conv.first()
            bot_messages = BotMessage.objects.filter(conversation=conv).order_by('created_at')
            if bot_messages.exists():
                srz_tasks = TaskBotSerializer(bot_messages,many=True, context={'user': self.user})
                print('srzdata', srz_tasks.data)
                return srz_tasks.data
        return None



    @database_sync_to_async
    def get_task(self, task_id):
        from .models import BotMessage
        from .serializer import TaskBotSerializer

        task = BotMessage.objects.filter(task_id=task_id)
        if task.exists():
            task = task.first()
            srz_task = TaskBotSerializer(task, context={'user': self.user})
            return srz_task.data
        return None



    @database_sync_to_async
    def create_message(self, text):
        from chat.models import Conversation
        from accounts.models import User
        from django.conf import settings
        from .models import BotMessage


        try:
            bot = User.objects.get(phone_number=settings.BOT_NUMBER)
        except User.DoesNotExist:
            raise ValidationError('ساخت بات ناموفق بوده است')

        conv = Conversation.objects.filter(participants=self.user).filter(participants=bot).distinct().first()
        if  conv is None:
            raise ValidationError(f'کانورسیشن این کاربر {self.user}با بات هنوز ساخته نشده است.')

        message = BotMessage.objects.create(
            conversation=conv, sender=self.user, text=text
        )
        return message


    @database_sync_to_async
    def save_message(self, msg):
        msg.save()



