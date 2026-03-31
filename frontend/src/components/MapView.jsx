import React from "react";

import { useAppContext } from "../context/AppContext";
import { useMap } from "../hooks/useMap";


const mapCardStyle = {
  overflow: "hidden",
  borderRadius: "24px",
  background: "#ffffff",
  boxShadow: "0 22px 60px rgba(18, 48, 77, 0.12)"
};

const mapHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 20px",
  borderBottom: "1px solid rgba(20, 52, 79, 0.08)"
};

function MapView() {
  const { filteredPois, mapConfig, routeResult, activePoi, setActivePoi } =
    useAppContext();
  const { containerRef, isMapReady } = useMap({
    mapConfig,
    pois: filteredPois,
    routeResult,
    activePoi,
    onMarkerClick: setActivePoi
  });

  return (
    <section style={mapCardStyle}>
      <div style={mapHeaderStyle}>
        <div>
          <strong>校园地图</strong>
          <p style={{ margin: "4px 0 0", color: "#60758a" }}>
            高德地图已接入，当前展示 {filteredPois.length} 个地点。
          </p>
        </div>
        <span
          style={{
            padding: "8px 12px",
            borderRadius: "999px",
            background: isMapReady ? "#e8fff1" : "#fff4dc",
            color: isMapReady ? "#067647" : "#b54708",
            fontSize: "13px",
            fontWeight: 700
          }}
        >
          {isMapReady ? "地图已就绪" : "地图初始化中"}
        </span>
      </div>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "56vh",
          minHeight: "460px"
        }}
      />
    </section>
  );
}

export default MapView;
