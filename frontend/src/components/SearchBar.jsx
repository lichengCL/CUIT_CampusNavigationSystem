import React, { startTransition, useState } from "react";

import { searchPois } from "../api/poi";
import { useAppContext } from "../context/AppContext";


function SearchBar() {
  const { setActivePoi, setSelectedCategory } = useAppContext();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  async function handleSearch() {
    const query = keyword.trim();
    if (!query) {
      startTransition(() => {
        setResults([]);
        setSearchError("");
      });
      return;
    }

    try {
      setIsSearching(true);
      setSearchError("");
      const response = await searchPois(query);
      startTransition(() => {
        setResults(response);
      });
    } catch (error) {
      setSearchError("搜索失败，请稍后重试。");
    } finally {
      setIsSearching(false);
    }
  }

  function handleSelect(poi) {
    setSelectedCategory(null);
    setActivePoi(poi);
    setKeyword(poi.name);
    setResults([]);
  }

  return (
    <section style={{ position: "relative" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "12px"
        }}
      >
        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSearch();
            }
          }}
          placeholder="搜索地点（如：食堂、图书馆）"
          style={{
            padding: "14px 16px",
            borderRadius: "16px",
            border: "1px solid rgba(26, 60, 89, 0.16)",
            fontSize: "15px"
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          style={{
            padding: "0 20px",
            border: 0,
            borderRadius: "16px",
            background: "#0e5db8",
            color: "#ffffff",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          {isSearching ? "搜索中..." : "搜索"}
        </button>
      </div>

      {searchError ? (
        <p style={{ marginBottom: 0, color: "#b42318", fontWeight: 600 }}>
          {searchError}
        </p>
      ) : null}

      {results.length > 0 ? (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 20,
            borderRadius: "16px",
            background: "#ffffff",
            boxShadow: "0 18px 48px rgba(17, 43, 66, 0.18)",
            overflow: "hidden"
          }}
        >
          {results.map((poi) => (
            <button
              key={poi.id}
              type="button"
              onClick={() => handleSelect(poi)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "14px 16px",
                border: 0,
                borderBottom: "1px solid rgba(17, 43, 66, 0.08)",
                background: "#ffffff",
                cursor: "pointer"
              }}
            >
              <strong>{poi.name}</strong>
              <span style={{ marginLeft: "8px", color: "#60758a" }}>
                {poi.category}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default SearchBar;
