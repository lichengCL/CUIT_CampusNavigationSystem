import React from "react";

import { useAppContext } from "../context/AppContext";


function RouteInfo() {
  const { routeResult } = useAppContext();

  if (!routeResult) {
    return null;
  }

  return (
    <section
      style={{
        marginTop: "20px",
        display: "flex",
        flexWrap: "wrap",
        gap: "10px"
      }}
    >
      <span style={badgeStyle("#dff6ff", "#0e5db8")}>
        距离: {routeResult.distance}m
      </span>
      <span style={badgeStyle("#fff4dc", "#b54708")}>
        步行约: {routeResult.duration} 分钟
      </span>
    </section>
  );
}

function badgeStyle(background, color) {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 14px",
    borderRadius: "999px",
    background,
    color,
    fontWeight: 700
  };
}

export default RouteInfo;
