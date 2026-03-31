# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

成信大（CUIT）航空港校区校园导航系统，采用 Django + React + Electron 架构，集成高德地图 API。

## 项目结构

- `backend/` — Django 后端（DRF API）
  - `pois/` — 兴趣点管理（模型、搜索、序列化）
  - `routing/` — 路径规划（调用高德 API）
  - `config/` — 地图配置接口
  - `campus_nav/` — Django 项目配置（settings、urls）
- `frontend/` — React + Electron 前端
  - `src/components/` — React 组件（MapView、RoutePlanner、SearchBar 等）
  - `src/api/` — API 客户端封装
  - `src/hooks/` — 自定义 hooks（useMap、useRoute）
  - `src/context/` — React Context（AppContext）
  - `electron/` — Electron 主进程（main.js、preload.js）
- `campus_nav/` — 旧版 Flask 应用（已废弃，勿修改）
- `docs/specs/` — 设计文档和需求规格

## 开发命令

### 后端（Django）

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # 启动在 localhost:8000
```

需要本地 PostgreSQL，数据库名 `campus_nav`，默认用户 `postgres`。环境变量可覆盖：`POSTGRES_DB`、`POSTGRES_USER`、`POSTGRES_PASSWORD`、`POSTGRES_HOST`、`POSTGRES_PORT`。

### 前端（React + Webpack）

```bash
cd frontend
npm install
npm run start  # 开发服务器 localhost:3000
npm run build  # 生产构建到 dist/
```

### Electron

```bash
cd frontend
npm run electron-dev    # 开发模式（同时启动 webpack-dev-server + electron）
npm run electron-build  # 打包发布
```

## 关键约定

- 分支命名：`feature/xxx` 或 `fix/xxx`
- 后端 API 前缀：`/api/`，前端通过 `REACT_APP_API_BASE` 环境变量配置 API 地址
- Django settings 中的 `LANGUAGE_CODE = "zh-hans"`，`TIME_ZONE = "Asia/Shanghai"`
- 高德地图 JS Key 和 Web Key 配置在 `backend/campus_nav/settings.py`
- Electron 打包时会将 backend 目录作为 extraResources 打入
- 前端使用 JSX（.jsx 扩展名），Babel 编译，无 TypeScript
