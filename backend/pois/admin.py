from django.contrib import admin

from .models import Category, POI


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "color")
    search_fields = ("name",)


@admin.register(POI)
class POIAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "category", "lng", "lat")
    list_filter = ("category",)
    search_fields = ("name", "description")
