from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("api/pois/", include("pois.urls")),
    path("api/routing/", include("routing.urls")),
    path("api/config/", include("config.urls")),
    path("admin/", admin.site.urls),
]
