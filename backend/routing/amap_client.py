import requests
from django.conf import settings


class AMapAPIError(Exception):
    pass


class AMapClient:
    def __init__(self) -> None:
        self.base_url = settings.AMAP_BASE_URL
        self.api_key = settings.AMAP_WEB_KEY

    def walking_route(self, orig_lng, orig_lat, dest_lng, dest_lat):
        response = requests.get(
            f"{self.base_url}/direction/walking",
            params={
                "key": self.api_key,
                "origin": f"{orig_lng},{orig_lat}",
                "destination": f"{dest_lng},{dest_lat}",
            },
            timeout=10,
        ).json()
        if response.get("status") != "1":
            raise AMapAPIError(response.get("info", "路径规划失败"))

        path = response["route"]["paths"][0]
        coords = []
        for step in path["steps"]:
            for point in step["polyline"].split(";"):
                lng, lat = point.split(",")
                coords.append([float(lng), float(lat)])

        return {
            "coords": coords,
            "distance": int(path["distance"]),
            "duration": round(int(path["duration"]) / 60, 1),
        }

    def multi_stop_route(self, stops):
        all_coords = []
        total_distance = 0
        total_duration = 0.0

        for index in range(len(stops) - 1):
            result = self.walking_route(
                stops[index]["lng"],
                stops[index]["lat"],
                stops[index + 1]["lng"],
                stops[index + 1]["lat"],
            )
            if index > 0:
                result["coords"] = result["coords"][1:]
            all_coords.extend(result["coords"])
            total_distance += result["distance"]
            total_duration += result["duration"]

        return {
            "coords": all_coords,
            "distance": total_distance,
            "duration": round(total_duration, 1),
        }
