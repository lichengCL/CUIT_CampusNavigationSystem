from django.urls import path

from . import views


urlpatterns = [
    path("walk/", views.WalkingRouteView.as_view(), name="walking-route"),
    path("multi/", views.MultiRouteView.as_view(), name="multi-route"),
]
