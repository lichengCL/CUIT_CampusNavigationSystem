from django.urls import path

from . import views


urlpatterns = [
    path("", views.POIListView.as_view(), name="poi-list"),
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("search/", views.POISearchView.as_view(), name="poi-search"),
]
