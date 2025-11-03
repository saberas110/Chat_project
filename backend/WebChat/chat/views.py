from pyexpat.errors import messages

from asgiref.sync import async_to_sync
from django.db import transaction
from django.db.models import Count, Q, Max
from redis.commands.search.reducers import count
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from channels.layers import get_channel_layer
from accounts.models import User
from chat.models import Conversation, Contact, Message
from chat.serializers import ConversationSerializer, ContactsSerializer, AddContactSerializer


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):

        user = request.user
        conversations = (
            Conversation.objects
            .filter(participants=user, messages__isnull=False)
            .annotate(last_message_time=Max('messages__created_at'))
            .order_by('-last_message_time')
            .distinct())
        if not conversations.exists():
            return  Response({'message':'empty user conversation'}, status.HTTP_404_NOT_FOUND)
        srz_data = ConversationSerializer(conversations, many=True, context={'user':user})
        return Response(srz_data.data, status=status.HTTP_200_OK)



class TestView(APIView):
    def get(self, request):
        cons = Contact.objects.filter(owner=request.user)
        return Response({'message':'hello'})



class ContactsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        contacts = Contact.objects.filter(owner=user)
        if not contacts.exists():
            return Response({'message':'شما هیچ مخاطبی ندارید'}, status.HTTP_404_NOT_FOUND)

        srz_data = ContactsSerializer(contacts, many=True, context={'request':request})
        return Response(srz_data.data, status.HTTP_200_OK)


class AddContactView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        srz_input = AddContactSerializer(data=request.data, context={'user': user})
        if srz_input.is_valid():
            contact = srz_input.save()
            srz_data = AddContactSerializer(contact)
            return Response(srz_data.data, status.HTTP_201_CREATED)
        return Response(srz_input.errors, status.HTTP_400_BAD_REQUEST)













