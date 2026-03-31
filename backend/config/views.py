from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView


class MapConfigView(APIView):
    def get(self, request):
        return Response(
            {
                "amap_js_key": settings.AMAP_JS_KEY,
                "center": settings.MAP_CENTER,
                "zoom": settings.MAP_ZOOM,
                "boundary": settings.CAMPUS_BOUNDARY,
            }
        )
