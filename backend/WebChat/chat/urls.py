from django.urls import path

from chat import views

urlpatterns = [
    path('cvs', views.ConversationListView.as_view()),
    path('test', views.TestView.as_view()),
    path('contacts', views.ContactsView.as_view()),
    path('addcontact', views.AddContactView.as_view()),
    # path('cv', views.ConversationView.as_view()),
]