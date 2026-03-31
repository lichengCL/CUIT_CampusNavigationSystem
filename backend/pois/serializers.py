from rest_framework import serializers

from .models import POI


class POISerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.name", read_only=True)
    lng = serializers.FloatField()
    lat = serializers.FloatField()

    class Meta:
        model = POI
        fields = ["id", "name", "category", "lng", "lat", "description"]


class POISearchSerializer(POISerializer):
    category = serializers.CharField()
    lng = serializers.FloatField()
    lat = serializers.FloatField()
    score = serializers.IntegerField()

    class Meta(POISerializer.Meta):
        fields = POISerializer.Meta.fields + ["score"]
