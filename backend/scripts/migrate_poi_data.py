import json
import os
import sys
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "campus_nav.settings")

import django


django.setup()

from django.db import transaction

from pois.models import Category, POI


CATEGORY_COLORS = {
    "食堂": "#FF4444",
    "教学楼": "#4285F4",
    "宿舍": "#34A853",
    "图书馆": "#9C27B0",
    "运动场所": "#FF9800",
    "行政": "#607D8B",
    "医疗": "#E91E63",
    "餐饮": "#FF6D00",
    "其他": "#795548",
    "生活服务": "#00BCD4",
}

POI_SOURCE = ROOT_DIR / "campus_nav" / "data" / "poi.json"


def load_source_data() -> list[dict]:
    with POI_SOURCE.open("r", encoding="utf-8") as file:
        return json.load(file)


@transaction.atomic
def migrate() -> None:
    pois = load_source_data()
    seen_categories = set()
    seen_pois = set()

    for record in pois:
        category_name = record["category"]
        seen_categories.add(category_name)
        category, _ = Category.objects.update_or_create(
            name=category_name,
            defaults={"color": CATEGORY_COLORS.get(category_name, "#4285F4")},
        )
        POI.objects.update_or_create(
            name=record["name"],
            category=category,
            defaults={
                "lng": record["lng"],
                "lat": record["lat"],
                "description": record.get("description", ""),
            },
        )
        seen_pois.add((record["name"], category_name))

    for poi in POI.objects.select_related("category"):
        key = (poi.name, poi.category.name)
        if key not in seen_pois:
            poi.delete()

    Category.objects.exclude(name__in=seen_categories).delete()

    print(f"Imported {len(pois)} POIs into PostgreSQL.")
    print(f"Synchronized {len(seen_categories)} categories.")


if __name__ == "__main__":
    migrate()
