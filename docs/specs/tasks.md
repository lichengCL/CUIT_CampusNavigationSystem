# Design-First 任务清单 (Task Breakdown)

> **功能名称：** 校园导航系统前后端分离重构
> **关联规范：** `docs/specs/design.md` · `docs/specs/requirements.md`
> **最后更新：** 2026-03-30
> **进度：** 15 / 15 已完成

---

## 执行规则

1. **设计优先：** 任务必须首先满足 `design.md` 中已批准的约束与边界
2. **需求从设计派生：** 若 `requirements.md` 与 `design.md` 冲突，先回退修改文档
3. **严格顺序执行：** 从上到下，一次只处理一个 `- [ ]` 复选框
4. **单任务约束：** 每个复选框完成后必须经过验证，才可标记为 `- [x]`
5. **禁止越界：** 不得实现未在 `design.md` 明确支撑的能力

---

## 阶段 1：项目脚手架 (Project Scaffolding)

- [x] **T-001:** 创建 Monorepo 目录结构 + Django 项目初始化
  - 📁 涉及文件：`backend/manage.py`, `backend/campus_nav/settings.py`, `backend/campus_nav/urls.py`, `backend/campus_nav/wsgi.py`, `backend/requirements.txt`
  - ✅ 验证标准：
    - `cd backend && python manage.py check` 无报错
    - `backend/requirements.txt` 包含 django, djangorestframework, django-cors-headers, psycopg2-binary, rapidfuzz, requests
  - ⏱️ 预估工程量：0.5 小时
  - 🔗 依赖：无

- [x] **T-002:** 创建 React + Electron 前端项目初始化
  - 📁 涉及文件：`frontend/package.json`, `frontend/public/index.html`, `frontend/src/index.jsx`, `frontend/src/App.jsx`, `frontend/electron/main.js`, `frontend/electron/preload.js`, `frontend/.env`
  - ✅ 验证标准：
    - `cd frontend && npm install` 成功
    - `npm start` 能启动 React dev server（localhost:3000）
    - `npm run electron-dev` 能启动 Electron 窗口加载 localhost:3000
  - ⏱️ 预估工程量：1 小时
  - 🔗 依赖：无

- [x] **T-003:** 配置 CORS 和开发环境联通
  - 📁 涉及文件：`backend/campus_nav/settings.py`（CORS_ALLOWED_ORIGINS, INSTALLED_APPS, MIDDLEWARE）, `frontend/.env`（REACT_APP_API_BASE）
  - ✅ 验证标准：
    - React 前端能成功调用 Django 后端 API（无 CORS 报错）
    - `frontend/.env` 中 `REACT_APP_API_BASE=http://localhost:8000/api`
  - ⏱️ 预估工程量：0.5 小时
  - 🔗 依赖：T-001, T-002

---

## 阶段 2：后端核心实现 (Backend Core)

- [x] **T-004:** 实现 Category 和 POI 数据模型 + Django migration
  - 📁 涉及文件：`backend/pois/__init__.py`, `backend/pois/models.py`, `backend/pois/admin.py`, `backend/pois/apps.py`
  - ✅ 验证标准：
    - `python manage.py makemigrations pois` 生成迁移文件
    - `python manage.py migrate` 成功创建 category 和 poi 表
    - Django admin 中可查看 Category 和 POI 模型
  - ⏱️ 预估工程量：0.5 小时
  - 🔗 依赖：T-001

- [x] **T-005:** 编写 poi.json → PostgreSQL 数据迁移脚本
  - 📁 涉及文件：`backend/scripts/migrate_poi_data.py`
  - ✅ 验证标准：
    - 运行脚本后 PostgreSQL 中 category 表包含所有分类及对应颜色
    - poi 表包含 52 条记录，字段值与 poi.json 完全一致
    - 脚本可重复运行（幂等性）
  - ⏱️ 预估工程量：0.5 小时
  - 🔗 依赖：T-004

- [x] **T-006:** 实现 POI 列表、分类列表、模糊搜索 API
  - 📁 涉及文件：`backend/pois/serializers.py`, `backend/pois/views.py`, `backend/pois/urls.py`, `backend/pois/search.py`
  - ✅ 验证标准：
    - `GET /api/pois/` 返回全部 POI（JSON 数组）
    - `GET /api/pois/?category=食堂` 仅返回食堂分类 POI
    - `GET /api/pois/categories/` 返回分类名称数组
    - `GET /api/pois/search/?q=食堂` 返回匹配结果，含 score 字段，按 score 降序
    - `GET /api/pois/search/?q=` 返回空数组
  - ⏱️ 预估工程量：1.5 小时
  - 🔗 依赖：T-005

- [x] **T-007:** 实现路径规划 API（walk + multi）
  - 📁 涉及文件：`backend/routing/__init__.py`, `backend/routing/views.py`, `backend/routing/urls.py`, `backend/routing/amap_client.py`
  - ✅ 验证标准：
    - `GET /api/routing/walk/?orig_lng=103.985&orig_lat=30.579&dest_lng=103.989&dest_lat=30.581` 返回 coords/distance/duration
    - `POST /api/routing/multi/` 传入 3 个 stops 返回合并路线
    - 参数缺失返回 400，高德 API 异常返回 500
  - ⏱️ 预估工程量：1 小时
  - 🔗 依赖：T-001

- [x] **T-008:** 实现地图配置 API
  - 📁 涉及文件：`backend/config/__init__.py`, `backend/config/views.py`, `backend/config/urls.py`
  - ✅ 验证标准：
    - `GET /api/config/map/` 返回 amap_js_key, center, zoom, boundary
    - boundary 包含 22 个坐标点
  - ⏱️ 预估工程量：0.5 小时
  - 🔗 依赖：T-001

---

## 阶段 3：前端核心实现 (Frontend Core)

- [x] **T-009:** 实现 API 调用层 + 全局状态管理 (AppContext)
  - 📁 涉及文件：`frontend/src/api/client.js`, `frontend/src/api/poi.js`, `frontend/src/api/route.js`, `frontend/src/api/config.js`, `frontend/src/App.jsx`
  - ✅ 验证标准：
    - axios client baseURL 从环境变量读取
    - AppContext 提供 pois, categories, mapConfig, selectedCategory, routeResult
    - 应用启动时自动加载 POI 列表、分类列表和地图配置
  - ⏱️ 预估工程量：1 小时
  - 🔗 依赖：T-003, T-006, T-008

- [x] **T-010:** 实现 MapView 组件（高德地图集成 + useMap Hook）
  - 📁 涉及文件：`frontend/src/components/MapView.jsx`, `frontend/src/hooks/useMap.js`, `frontend/src/constants/categoryColors.js`
  - ✅ 验证标准：
    - 地图以 [103.988471, 30.581856] 为中心、缩放 16 初始化
    - 校区边界多边形正确绘制（22 个坐标点）
    - POI 标记按分类颜色显示
    - 点击标记弹出信息窗口（名称、分类、描述）
  - ⏱️ 预估工程量：2 小时
  - 🔗 依赖：T-009

- [x] **T-011:** 实现 SearchBar + CategoryFilter 组件
  - 📁 涉及文件：`frontend/src/components/SearchBar.jsx`, `frontend/src/components/CategoryFilter.jsx`, `frontend/src/components/Navbar.jsx`
  - ✅ 验证标准：
    - 输入关键词后调用搜索 API，下拉显示结果
    - 点击搜索结果，地图定位到对应 POI 并打开信息窗口
    - 点击分类按钮筛选地图标记，点击"全部"恢复
  - ⏱️ 预估工程量：1.5 小时
  - 🔗 依赖：T-010

- [x] **T-012:** 实现 RoutePlanner + MultiStopPlanner + RouteInfo 组件
  - 📁 涉及文件：`frontend/src/components/RoutePlanner.jsx`, `frontend/src/components/MultiStopPlanner.jsx`, `frontend/src/components/RouteInfo.jsx`, `frontend/src/hooks/useRoute.js`
  - ✅ 验证标准：
    - 选择起点终点后调用 walk API，地图绘制蓝色路线
    - 显示距离（米）和时间（分钟）
    - 可动态添加途经点，调用 multi API 绘制多段路线
    - 清除路线功能正常
  - ⏱️ 预估工程量：2 小时
  - 🔗 依赖：T-010

---

## 阶段 4：Electron 集成 (Electron Integration)

- [x] **T-013:** 配置 Electron 主进程 + 开发/生产模式切换
  - 📁 涉及文件：`frontend/electron/main.js`, `frontend/electron/preload.js`, `frontend/package.json`（scripts: electron-dev, electron-build）
  - ✅ 验证标准：
    - 开发模式：`npm run electron-dev` 启动 Electron 加载 localhost:3000
    - 生产模式：`npm run build && npm run electron-build` 生成可执行文件
    - 窗口尺寸 1200x800，最小 900x600
    - 标题"校园导航系统 - 成信大航空港校区"
    - contextIsolation: true, nodeIntegration: false
  - ⏱️ 预估工程量：1 小时
  - 🔗 依赖：T-002

---

## 阶段 5：联调与验证 (Integration & Verification)

- [x] **T-014:** 前后端联调 + 全功能验证
  - 📁 涉及文件：所有前后端文件
  - ✅ 验证标准：
    - 启动 Django 后端 + React 前端，所有 6 个 API 端点正常工作
    - POI 展示、分类筛选、模糊搜索、两点路径、多点路径、地图交互全部功能与现有系统一致
    - 搜索"食堂"返回结果与现有系统一致（rapidfuzz 语义一致性）
    - 路径规划返回的 coords/distance/duration 格式正确
  - ⏱️ 预估工程量：1.5 小时
  - 🔗 依赖：T-006, T-007, T-008, T-011, T-012

- [x] **T-015:** Electron 打包测试
  - 📁 涉及文件：`frontend/package.json`（electron-builder 配置）
  - ✅ 验证标准：
    - electron-builder 成功输出 Windows 安装包
    - 安装后启动应用，所有功能正常
    - 窗口标题、尺寸约束正确
  - ⏱️ 预估工程量：1 小时
  - 🔗 依赖：T-013, T-014

---

## 风险标记

| 任务 ID | 风险类别 | 风险描述 |
|:---|:---|:---|
| T-010 | 兼容性 | 高德地图 JS API 在 Electron 渲染进程中可能需要额外配置（CSP、协议） |
| T-013 | 兼容性 | Electron 生产模式下 file:// 协议加载时 CORS 和高德 API 行为可能不同 |
| T-005 | 数据迁移 | 需确保分类-颜色映射完整，原系统中未定义颜色的分类需补充 |
| T-014 | 一致性 | rapidfuzz 搜索结果需与现有系统逐条对比验证 |

---

## 完成日志

| 任务 ID | 完成时间 | Commit Hash | 备注 |
|:---|:---|:---|:---|
| T-001 | 2026-03-30 23:58 | — | Django 后端脚手架已建立，`manage.py check` 通过 |
| T-002 | 2026-03-31 00:03 | — | React dev server 与 Electron 开发壳可启动 |
| T-003 | 2026-03-31 00:14 | — | CORS 已配置，接口响应含 `Access-Control-Allow-Origin` |
| T-004 | 2026-03-31 00:12 | — | `pois` 模型、迁移文件和 PostgreSQL 表已创建 |
| T-005 | 2026-03-31 00:13 | — | `poi.json` 已幂等导入临时 PostgreSQL，实际记录数为 52 |
| T-006 | 2026-03-31 00:14 | — | POI 列表、分类和搜索接口联调通过 |
| T-007 | 2026-03-31 00:15 | — | 两点/多点路径规划接口联调通过 |
| T-008 | 2026-03-31 00:14 | — | 地图配置接口返回中心点、缩放和 22 点边界 |
| T-009 | 2026-03-31 00:21 | — | Axios API 层和 `AppContext` 已接入并完成启动加载 |
| T-010 | 2026-03-31 00:24 | — | 高德地图、边界、多色标记和信息窗已在前端渲染 |
| T-011 | 2026-03-31 00:31 | — | 搜索和分类筛选已通过 Playwright 交互验证 |
| T-012 | 2026-03-31 00:37 | — | 单点、多点导航和清除路线已通过 Playwright 交互验证 |
| T-013 | 2026-03-31 00:40 | — | Electron 开发壳和生产打包配置可用 |
| T-014 | 2026-03-31 00:37 | — | 前后端 UI/API 联调通过，核心交互链路完整 |
| T-015 | 2026-03-31 00:40 | — | `electron-builder` 产出安装包并成功启动 `win-unpacked` 应用 |
