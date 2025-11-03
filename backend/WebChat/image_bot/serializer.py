from rest_framework import serializers

from image_bot.models import BotMessage


class TaskBotSerializer(serializers.ModelSerializer):
    is_Me = serializers.SerializerMethodField()
    class Meta:
        model = BotMessage
        fields = ['id', 'text', 'status', 'created_at', 'task_id', 'images', "is_Me"]

    def get_is_Me(self, obj):
            user = self.context.get('user')
            if obj.sender == user:
                return True
            return True