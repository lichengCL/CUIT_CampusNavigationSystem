import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DIR = ROOT / "frontend"
BACKEND_DIR = ROOT / "backend"


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def build_frontend() -> tuple[bool, str]:
    npm_executable = shutil.which("npm.cmd") or shutil.which("npm")
    if not npm_executable:
        return False, "npm executable was not found on PATH"

    completed = subprocess.run(
        [npm_executable, "run", "build"],
        cwd=FRONTEND_DIR,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        shell=False,
    )
    output = (completed.stdout + completed.stderr).strip()
    return completed.returncode == 0, output


def check_absolute_asset_paths() -> tuple[bool, str]:
    dist_index = FRONTEND_DIR / "dist" / "index.html"
    html = read_text(dist_index)
    if re.search(r'(?:src|href)="/', html):
        return True, "dist/index.html contains root-absolute asset references that break under file://"
    return False, "dist/index.html uses relative asset references"


def check_missing_backend_packaging() -> tuple[bool, str]:
    package_json = json.loads(read_text(FRONTEND_DIR / "package.json"))
    build_files = package_json.get("build", {}).get("files", [])
    extra_resources = package_json.get("build", {}).get("extraResources", [])
    main_js = read_text(FRONTEND_DIR / "electron" / "main.js")
    api_client = read_text(FRONTEND_DIR / "src" / "api" / "client.js")

    backend_in_files = any(
        entry.startswith("backend") or "/backend" in entry or "\\backend" in entry
        for entry in build_files
    )
    backend_in_extra_resources = any(
        (
            isinstance(entry, str)
            and (entry.startswith("../backend") or "/backend" in entry or "\\backend" in entry)
        )
        or (
            isinstance(entry, dict)
            and "backend" in str(entry.get("from", ""))
            and "backend" in str(entry.get("to", ""))
        )
        for entry in extra_resources
    )
    starts_backend = any(token in main_js for token in ("spawn(", "fork(", "execFile("))
    uses_runtime_config = "runtimeConfig" in api_client and "electronAPI" in api_client
    hardcodes_localhost_only = (
        "http://localhost:8000/api" in api_client and not uses_runtime_config
    )

    if (not backend_in_files) and (not backend_in_extra_resources):
        return True, "Electron packaging still does not include the backend runtime resources"

    if not starts_backend:
        return True, "Electron main process still does not start a backend child process"

    if hardcodes_localhost_only:
        return True, "Renderer still hardcodes http://localhost:8000/api without using runtime configuration"

    return False, "Electron package includes backend resources and the renderer now reads runtime API configuration"


def check_map_boundary_dependency() -> tuple[bool, str]:
    use_map = read_text(FRONTEND_DIR / "src" / "hooks" / "useMap.js")
    boundary_effect = re.search(
        r"useEffect\(\(\) => \{\s*if \(!isMapReady \|\| !mapRef\.current \|\| !AMapRef\.current \|\| !mapConfig\) \{\s*return;\s*\}.*?\}, \[(.*?)\]\);",
        use_map,
        re.S,
    )
    if not boundary_effect:
        return True, "Could not locate the boundary drawing effect"

    deps = boundary_effect.group(1).replace(" ", "")
    if deps == "mapConfig":
        return True, "Boundary drawing effect depends only on mapConfig, so it can miss async map initialization"

    if "isMapReady" not in deps:
        return True, f"Boundary drawing effect dependencies are {deps}, which still omit isMapReady"

    return False, f"Boundary drawing effect dependencies are {deps}"


def check_routing_timeout_contract() -> tuple[bool, str]:
    sys.path.insert(0, str(BACKEND_DIR))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "campus_nav.settings")

    import django
    from django.test import RequestFactory
    from requests import Timeout

    django.setup()

    from routing.views import WalkingRouteView

    request = RequestFactory().get(
        "/api/routing/walk/",
        {
            "orig_lng": "103.985",
            "orig_lat": "30.579",
            "dest_lng": "103.989",
            "dest_lat": "30.581",
        },
    )

    with patch("routing.amap_client.requests.get", side_effect=Timeout("boom")):
        try:
            WalkingRouteView.as_view()(request)
        except Timeout:
            return True, "requests.Timeout escapes the API view instead of being converted into JSON {error: ...}"

    return False, "WalkingRouteView already converts upstream timeout failures into JSON errors"


def main() -> int:
    checks = []

    build_ok, build_output = build_frontend()
    checks.append(
        {
            "name": "frontend_build",
            "broken": not build_ok,
            "detail": build_output.splitlines()[-1] if build_output else "no output",
        }
    )
    if not build_ok:
        print(json.dumps({"checks": checks}, ensure_ascii=False, indent=2))
        return 1

    for name, fn in [
        ("absolute_asset_paths", check_absolute_asset_paths),
        ("missing_backend_packaging", check_missing_backend_packaging),
        ("map_boundary_dependency", check_map_boundary_dependency),
        ("routing_timeout_contract", check_routing_timeout_contract),
    ]:
        broken, detail = fn()
        checks.append({"name": name, "broken": broken, "detail": detail})

    print(json.dumps({"checks": checks}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
