import React from "react";

import { useAppContext } from "../context/AppContext";


function CategoryFilter() {
  const { categories, selectedCategory, setSelectedCategory } = useAppContext();

  return (
    <section
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px"
      }}
    >
      <button
        type="button"
        onClick={() => setSelectedCategory(null)}
        style={buildButtonStyle(!selectedCategory)}
      >
        全部
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => setSelectedCategory(category)}
          style={buildButtonStyle(selectedCategory === category)}
        >
          {category}
        </button>
      ))}
    </section>
  );
}

function buildButtonStyle(isActive) {
  return {
    padding: "10px 14px",
    borderRadius: "999px",
    border: isActive ? "1px solid #0e5db8" : "1px solid rgba(17, 43, 66, 0.12)",
    background: isActive ? "#0e5db8" : "#ffffff",
    color: isActive ? "#ffffff" : "#284760",
    fontWeight: 700,
    cursor: "pointer"
  };
}

export default CategoryFilter;
