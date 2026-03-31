import { useEffect, useRef, useState } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";

import categoryColors from "../constants/categoryColors";


function buildInfoContent(poi) {
  return `
    <div style="padding: 6px 8px; font-size: 14px; line-height: 1.6;">
      <div style="font-weight: 700; color: #14344f;">${poi.name}</div>
      <div style="font-size: 12px; color: #5b7388;">${poi.category}</div>
      <div style="margin-top: 4px; color: #1f3f5b;">${poi.description || ""}</div>
    </div>
  `;
}

export function useMap({
  mapConfig,
  pois,
  routeResult,
  activePoi,
  onMarkerClick
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerMapRef = useRef(new Map());
  const polygonRef = useRef(null);
  const routeRef = useRef(null);
  const infoWindowRef = useRef(null);
  const AMapRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    let disposed = false;

    async function initMap() {
      if (!containerRef.current || !mapConfig || mapRef.current) {
        return;
      }

      const AMap = await AMapLoader.load({
        key: mapConfig.amap_js_key,
        version: "2.0"
      });

      if (disposed) {
        return;
      }

      AMapRef.current = AMap;
      const map = new AMap.Map(containerRef.current, {
        viewMode: "2D",
        zoom: mapConfig.zoom,
        center: mapConfig.center
      });

      infoWindowRef.current = new AMap.InfoWindow({
        offset: new AMap.Pixel(0, -26)
      });
      mapRef.current = map;
      setIsMapReady(true);
    }

    initMap();

    return () => {
      disposed = true;
    };
  }, [mapConfig]);

  useEffect(() => {
    if (!mapRef.current || !AMapRef.current || !mapConfig) {
      return;
    }

    if (polygonRef.current) {
      mapRef.current.remove(polygonRef.current);
    }

    polygonRef.current = new AMapRef.current.Polygon({
      path: mapConfig.boundary.map(([lng, lat]) => new AMapRef.current.LngLat(lng, lat)),
      strokeColor: "#1E90FF",
      strokeWeight: 3,
      strokeOpacity: 0.85,
      fillColor: "#1E90FF",
      fillOpacity: 0.12
    });
    mapRef.current.add(polygonRef.current);
  }, [mapConfig]);

  useEffect(() => {
    if (!mapRef.current || !AMapRef.current) {
      return;
    }

    const map = mapRef.current;
    const markers = markerMapRef.current;

    for (const marker of markers.values()) {
      map.remove(marker);
    }
    markers.clear();

    for (const poi of pois) {
      const color = categoryColors[poi.category] || "#4285F4";
      const marker = new AMapRef.current.CircleMarker({
        center: [poi.lng, poi.lat],
        radius: 9,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.95,
        bubble: true,
        cursor: "pointer"
      });

      marker.on("click", () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(buildInfoContent(poi));
          infoWindowRef.current.open(map, [poi.lng, poi.lat]);
        }
        onMarkerClick(poi);
      });

      map.add(marker);
      markers.set(poi.id, marker);
    }
  }, [onMarkerClick, pois]);

  useEffect(() => {
    if (!mapRef.current || !AMapRef.current) {
      return;
    }

    if (routeRef.current) {
      mapRef.current.remove(routeRef.current);
      routeRef.current = null;
    }

    if (!routeResult?.coords?.length) {
      return;
    }

    routeRef.current = new AMapRef.current.Polyline({
      path: routeResult.coords.map(([lng, lat]) => new AMapRef.current.LngLat(lng, lat)),
      strokeColor: "#4285F4",
      strokeWeight: 6,
      strokeOpacity: 0.85,
      lineJoin: "round",
      lineCap: "round"
    });

    mapRef.current.add(routeRef.current);
    mapRef.current.setFitView([routeRef.current, polygonRef.current].filter(Boolean));
  }, [routeResult]);

  useEffect(() => {
    if (!mapRef.current || !infoWindowRef.current || !activePoi) {
      return;
    }

    const marker = markerMapRef.current.get(activePoi.id);
    infoWindowRef.current.setContent(buildInfoContent(activePoi));
    infoWindowRef.current.open(mapRef.current, [activePoi.lng, activePoi.lat]);
    mapRef.current.setCenter([activePoi.lng, activePoi.lat]);
    mapRef.current.setZoom(18);
    if (marker) {
      mapRef.current.setFitView([marker, polygonRef.current].filter(Boolean));
    }
  }, [activePoi]);

  return {
    containerRef,
    isMapReady
  };
}
