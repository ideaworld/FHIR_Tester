from django.conf.urls import include, url
from django.contrib import admin
from home import views

urlpatterns = [
    url(r'^submit$', views.submit_task),
]