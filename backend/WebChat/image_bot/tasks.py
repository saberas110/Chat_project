import os.path
from asgiref.sync import async_to_sync
from celery import shared_task
from PIL import Image, ImageDraw, ImageFont
from channels.layers import get_channel_layer
from django.conf import settings
from image_bot.models import BotMessage, Tshirt


@shared_task(bind=True)
def add_text_to_tshirts(self, message_id, text, user_id):
    try:
        print('task id is: ', self.request.id)
        msg = BotMessage.objects.get(id=message_id, text=text, task_id=self.request.id)
        msg.status = 'processing'
        msg.save()
        tshirts = Tshirt.objects.all()
        result_path = []
        output_dir = os.path.join(settings.MEDIA_ROOT, 'edited')
        os.makedirs(output_dir, exist_ok=True)

        font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        font = ImageFont.truetype(font_path, size=40)

        for tshirt in tshirts:
            img = Image.open(tshirt.image.path)
            print_text = ImageDraw.Draw(img)
            print_text.text((50, 50), text, fill='black', font=font)
            output_path = os.path.join(output_dir, f'{msg.id}{tshirt.name}_edited.png')
            img.save(output_path)
            result_path.append(f"{settings.BASE_URL}{settings.MEDIA_URL}edited/{msg.id}{tshirt.name}_edited.png")
            print(result_path)

        msg.status = 'done'
        msg.images = result_path
        msg.save()

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"bot_{user_id}",

            {
                "type": "send.generated_image",
                "message": {
                    "id": msg.id,
                    "images": msg.images,
                }
            }
        )

    except Exception as e:
        print('exception in celery task is:', e)
