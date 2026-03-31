import React, { useState } from "react";

import { useAppContext } from "../context/AppContext";
import { useRoute } from "../hooks/useRoute";
import MultiStopPlanner from "./MultiStopPlanner";
import RouteInfo from "./RouteInfo";


function RoutePlanner() {
  const { pois } = useAppContext();
  const { clearRoute, isPlanning, planMultiPointRoute, planWalkRoute, routeError } =
    useRoute();
  const [originId, setOriginId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [stopIds, setStopIds] = useState([]);

  return (
    <section
      style={{
        padding: "22px",
        borderRadius: "24px",
        background: "#ffffff",
        boxShadow: "0 22px 60px rgba(18, 48, 77, 0.12)"
      }}
    >
      <header style={{ marginBottom: "16px" }}>
        <strong>路径规划</strong>
        <p style={{ marginBottom: 0, color: "#60758a" }}>
          选择起点、终点和可选途经点，路线会直接绘制到地图上。
        </p>
      </header>

      <div style={{ display: "grid", gap: "12px" }}>
        <select
          value={originId}
          disabled={isPlanning}
          onChange={(event) => setOriginId(event.target.value)}
          style={selectStyle}
        >
          <option value="">选择起点</option>
          {pois.map((poi) => (
            <option key={poi.id} value={poi.id}>
              {poi.name}
            </option>
          ))}
        </select>

        <select
          value={destinationId}
          disabled={isPlanning}
          onChange={(event) => setDestinationId(event.target.value)}
          style={selectStyle}
        >
          <option value="">选择终点</option>
          {pois.map((poi) => (
            <option key={poi.id} value={poi.id}>
              {poi.name}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "16px"
        }}
      >
        <button
          type="button"
          disabled={isPlanning}
          onClick={() => planWalkRoute(originId, destinationId)}
          style={primaryButtonStyle}
        >
          {isPlanning ? "规划中..." : "开始导航"}
        </button>
        <button
          type="button"
          disabled={isPlanning}
          onClick={() => planMultiPointRoute(originId, stopIds, destinationId)}
          style={secondaryButtonStyle}
        >
          多点导航
        </button>
        <button
          type="button"
          disabled={isPlanning}
          onClick={() => {
            clearRoute();
            setStopIds([]);
          }}
          style={ghostButtonStyle}
        >
          清除路线
        </button>
      </div>

      <MultiStopPlanner
        pois={pois}
        stopIds={stopIds}
        setStopIds={setStopIds}
        disabled={isPlanning}
      />

      {routeError ? (
        <p style={{ marginTop: "16px", marginBottom: 0, color: "#b42318" }}>
          {routeError}
        </p>
      ) : null}

      <RouteInfo />
    </section>
  );
}

const selectStyle = {
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(17, 43, 66, 0.14)",
  background: "#ffffff"
};

const primaryButtonStyle = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: 0,
  background: "#1a7f37",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer"
};

const secondaryButtonStyle = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: 0,
  background: "#0e5db8",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer"
};

const ghostButtonStyle = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(17, 43, 66, 0.12)",
  background: "#ffffff",
  color: "#284760",
  fontWeight: 700,
  cursor: "pointer"
};

export default RoutePlanner;
