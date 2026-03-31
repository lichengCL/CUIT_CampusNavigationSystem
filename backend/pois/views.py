from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, POI
from .search import search_pois
from .serializers import POISearchSerializer, POISerializer


class POIListView(APIView):
    def get(self, request):
        queryset = POI.objects.select_related("category").all()
        category_name = request.query_params.get("category")
        if category_name:
            queryset = queryset.filter(category__name=category_name)
        serializer = POISerializer(queryset, many=True)
        return Response(serializer.data)


class CategoryListView(APIView):
    def get(self, request):
        categories = list(Category.objects.order_by("name").values_list("name", flat=True))
        return Response(categories)


class POISearchView(APIView):
    def get(self, request):
        keyword = (request.query_params.get("q") or "").strip()
        if not keyword:
            return Response([])

        queryset = POI.objects.select_related("category").all()
        matches = search_pois(queryset, keyword)
        payload = [
            {
                "id": poi.id,
                "name": poi.name,
                "category": poi.category.name,
                "lng": poi.lng,
                "lat": poi.lat,
                "description": poi.description,
                "score": score,
            }
            for poi, score in matches
        ]
        serializer = POISearchSerializer(payload, many=True)
        return Response(serializer.data)
