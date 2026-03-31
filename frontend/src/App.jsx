import React, { startTransition, useEffect, useState } from "react";

import { fetchMapConfig } from "./api/config";
import CategoryFilter from "./components/CategoryFilter";
import { fetchCategories, fetchPois } from "./api/poi";
import MapView from "./components/MapView";
import Navbar from "./components/Navbar";
import RoutePlanner from "./components/RoutePlanner";
import SearchBar from "./components/SearchBar";
import { AppContext } from "./context/AppContext";


const shellStyle = {
  minHeight: "100vh",
  padding: "48px 20px",
  background:
    "radial-gradient(circle at top, rgba(30, 144, 255, 0.16), transparent 28%), #f3f6fb",
  color: "#17324d",
  fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif'
};

const panelStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "28px",
  borderRadius: "28px",
  background: "rgba(255, 255, 255, 0.92)",
  boxShadow: "0 24px 70px rgba(23, 50, 77, 0.12)"
};

const metaStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px",
  marginTop: "24px"
};

const statCardStyle = {
  padding: "18px",
  borderRadius: "18px",
  background: "#eef5ff"
};

const bodyGridStyle = {
  display: "grid",
  gap: "20px",
  marginTop: "28px"
};

function App() {
  const [pois, setPois] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mapConfig, setMapConfig] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [routeResult, setRouteResult] = useState(null);
  const [activePoi, setActivePoi] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const filteredPois = selectedCategory
    ? pois.filter((poi) => poi.category === selectedCategory)
    : pois;

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        setLoadError("");
        const [poiList, categoryList, config] = await Promise.all([
          fetchPois(),
          fetchCategories(),
          fetchMapConfig()
        ]);
        if (!isMounted) {
          return;
        }
        startTransition(() => {
          setPois(poiList);
          setCategories(categoryList);
          setMapConfig(config);
        });
      } catch (error) {
        if (isMounted) {
          setLoadError("初始化数据加载失败，请确认 Django 后端已启动。");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  const contextValue = {
    pois,
    categories,
    mapConfig,
    selectedCategory,
    setSelectedCategory,
    filteredPois,
    routeResult,
    setRouteResult,
    activePoi,
    setActivePoi,
    isLoading,
    loadError
  };

  return (
    <AppContext.Provider value={contextValue}>
      <main style={shellStyle}>
        <section style={panelStyle}>
          <Navbar />
          <p style={{ marginBottom: 0, lineHeight: 1.7, maxWidth: "760px" }}>
            当前应用已经从 Django 后端加载 POI、分类和地图配置，并开始复刻旧版地图、搜索和筛选交互。
          </p>

          <section style={metaStyle}>
            <article style={statCardStyle}>
              <strong>POI 总数</strong>
              <div style={{ marginTop: "8px", fontSize: "28px" }}>{pois.length}</div>
            </article>
            <article style={statCardStyle}>
              <strong>分类数</strong>
              <div style={{ marginTop: "8px", fontSize: "28px" }}>
                {categories.length}
              </div>
            </article>
            <article style={statCardStyle}>
              <strong>地图中心</strong>
              <div style={{ marginTop: "8px", fontSize: "18px" }}>
                {mapConfig ? mapConfig.center.join(", ") : "加载中"}
              </div>
            </article>
          </section>

          <section style={{ marginTop: "24px" }}>
            {isLoading ? <p>正在加载应用数据...</p> : null}
            {loadError ? (
              <p style={{ color: "#b42318", fontWeight: 600 }}>{loadError}</p>
            ) : null}
            {!isLoading && !loadError ? (
              <p style={{ marginBottom: 0 }}>
                当前筛选结果共 {filteredPois.length} 个地点，已准备好供地图和交互组件使用。
              </p>
            ) : null}
          </section>

          {!loadError ? (
            <section style={bodyGridStyle}>
              <SearchBar />
              <CategoryFilter />
              <MapView />
              <RoutePlanner />
            </section>
          ) : null}
        </section>
      </main>
    </AppContext.Provider>
  );
}

export default App;
