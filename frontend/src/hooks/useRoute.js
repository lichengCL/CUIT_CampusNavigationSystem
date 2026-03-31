import { useState } from "react";

import { fetchMultiRoute, fetchWalkingRoute } from "../api/route";
import { useAppContext } from "../context/AppContext";


function resolveErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.error || fallbackMessage;
}

export function useRoute() {
  const { pois, setActivePoi, setRouteResult } = useAppContext();
  const [routeError, setRouteError] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);

  function findPoi(id) {
    return pois.find((poi) => String(poi.id) === String(id));
  }

  async function planWalkRoute(originId, destinationId) {
    const origin = findPoi(originId);
    const destination = findPoi(destinationId);

    if (!origin || !destination) {
      setRouteError("请选择起点和终点。");
      return false;
    }

    try {
      setIsPlanning(true);
      setRouteError("");
      const result = await fetchWalkingRoute({
        orig_lng: origin.lng,
        orig_lat: origin.lat,
        dest_lng: destination.lng,
        dest_lat: destination.lat
      });
      setRouteResult(result);
      setActivePoi(destination);
      return true;
    } catch (error) {
      setRouteError(resolveErrorMessage(error, "路径规划失败。"));
      return false;
    } finally {
      setIsPlanning(false);
    }
  }

  async function planMultiPointRoute(originId, stopIds, destinationId) {
    const orderedIds = [originId, ...stopIds.filter(Boolean), destinationId];
    const stops = orderedIds.map(findPoi).filter(Boolean);

    if (stops.length < 2) {
      setRouteError("请至少选择起点和终点。");
      return false;
    }

    try {
      setIsPlanning(true);
      setRouteError("");
      const result = await fetchMultiRoute(
        stops.map((poi) => ({
          lng: poi.lng,
          lat: poi.lat
        }))
      );
      setRouteResult(result);
      setActivePoi(stops[stops.length - 1]);
      return true;
    } catch (error) {
      setRouteError(resolveErrorMessage(error, "多点路径规划失败。"));
      return false;
    } finally {
      setIsPlanning(false);
    }
  }

  function clearRoute() {
    setRouteResult(null);
    setRouteError("");
  }

  return {
    isPlanning,
    routeError,
    planWalkRoute,
    planMultiPointRoute,
    clearRoute
  };
}
