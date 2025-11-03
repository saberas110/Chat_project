from uuid import uuid4

from django.db import models

from accounts.models import User
from chat.models import Conversation


class Tshirt(models.Model):
    image = models.ImageField(upload_to='tshirts')
    name = models.CharField(max_length=20, null=True, blank=True)


    def __str__(self):
        return self.name


class BotMessage(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing',),
        ('done', 'Done'),
        ('failed', 'Failed')

    ]
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='bot_messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_bot_messages')
    text = models.TextField(blank=True, null=True)
    images = models.JSONField( blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='pending')
    task_id = models.CharField(max_length=270, blank=True, null=True)


