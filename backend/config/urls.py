from django.urls import path

from .views import MapConfigView


urlpatterns = [
    path("map/", MapConfigView.as_view(), name="map-config"),
]
