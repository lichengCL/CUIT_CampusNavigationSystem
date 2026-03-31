import React from "react";


function Navbar() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        marginBottom: "20px"
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            letterSpacing: "0.18em",
            fontSize: "12px",
            color: "#55718f",
            textTransform: "uppercase"
          }}
        >
          Campus Navigation
        </p>
        <h1 style={{ margin: "10px 0 0", fontSize: "38px" }}>
          校园导航系统
        </h1>
      </div>
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "18px",
          background: "#eef5ff",
          color: "#1d4568",
          fontWeight: 700
        }}
      >
        成信大航空港校区
      </div>
    </header>
  );
}

export default Navbar;
