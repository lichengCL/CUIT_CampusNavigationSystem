import React from "react";


function MultiStopPlanner({ pois, stopIds, setStopIds, disabled }) {
  return (
    <section style={{ marginTop: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px"
        }}
      >
        <strong>多点路径</strong>
        <button
          type="button"
          onClick={() => setStopIds([...stopIds, ""])}
          disabled={disabled}
          style={actionButtonStyle("#eef5ff", "#0e5db8")}
        >
          + 添加途经点
        </button>
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
        {stopIds.length === 0 ? (
          <p style={{ margin: 0, color: "#60758a" }}>未添加额外途经点。</p>
        ) : null}
        {stopIds.map((stopId, index) => (
          <div
            key={`${index}-${stopId}`}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "10px"
            }}
          >
            <select
              value={stopId}
              disabled={disabled}
              onChange={(event) => {
                const nextStopIds = [...stopIds];
                nextStopIds[index] = event.target.value;
                setStopIds(nextStopIds);
              }}
              style={selectStyle}
            >
              <option value="">选择途经点 {index + 1}</option>
              {pois.map((poi) => (
                <option key={poi.id} value={poi.id}>
                  {poi.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                setStopIds(stopIds.filter((_, stopIndex) => stopIndex !== index))
              }
              style={actionButtonStyle("#fff1f3", "#b42318")}
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

const selectStyle = {
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(17, 43, 66, 0.14)",
  background: "#ffffff"
};

function actionButtonStyle(background, color) {
  return {
    padding: "10px 12px",
    borderRadius: "14px",
    border: 0,
    background,
    color,
    fontWeight: 700,
    cursor: "pointer"
  };
}

export default MultiStopPlanner;
