from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .amap_client import AMapAPIError, AMapClient


def parse_float(params, key):
    value = params.get(key)
    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError("参数错误") from exc


class WalkingRouteView(APIView):
    client = AMapClient()

    def get(self, request):
        try:
            result = self.client.walking_route(
                parse_float(request.query_params, "orig_lng"),
                parse_float(request.query_params, "orig_lat"),
                parse_float(request.query_params, "dest_lng"),
                parse_float(request.query_params, "dest_lat"),
            )
            return Response(result)
        except ValueError:
            return Response({"error": "参数错误"}, status=status.HTTP_400_BAD_REQUEST)
        except AMapAPIError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MultiRouteView(APIView):
    client = AMapClient()

    def post(self, request):
        stops = request.data.get("stops", [])
        if len(stops) < 2:
            return Response({"error": "至少需要两个途经点"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            parsed_stops = [
                {"lng": float(stop["lng"]), "lat": float(stop["lat"])}
                for stop in stops
            ]
        except (KeyError, TypeError, ValueError):
            return Response({"error": "参数错误"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            return Response(self.client.multi_stop_route(parsed_stops))
        except AMapAPIError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
