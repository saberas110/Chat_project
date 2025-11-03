from django.db import models
from accounts.models import User
from rest_framework.exceptions import ValidationError


class Conversation(models.Model):
    participants = models.ManyToManyField(User, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        phones = ',,,,,,'.join([user.phone_number for user in self.participants.all()])
        return f"Conversation between  {phones}"



class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


    def clean(self):
        if self.sender not in self.conversation.participants.all():
            raise ValidationError("Sender must be a participant of the conversation.")
        
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.sender} -> {self.conversation.id}: {self.text[:20]}"

class MessageReadStatus(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='read_messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    read_at = models.DateTimeField(null=True, blank=True)


class UserProfileImages(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='profile_images', null=True, blank=True)
    is_main = models.BooleanField(default=False)

    def __str__(self):
        return self.user.phone_number

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    last_seen = models.DateTimeField(null=True, blank=True)
    is_online = models.BooleanField(default=False)
    status_text = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.user.phone_number

class Contact(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacts')
    contact_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contact_of')
    name = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f'{self.owner.phone_number}----> contacts:  {self.contact_user.phone_number}'




