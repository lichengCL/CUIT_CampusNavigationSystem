# 校园导航系统 — 成信大航空港校区

基于 Django + React + Electron 的校园导航桌面应用，集成高德地图 API，提供 POI 展示、模糊搜索、步行路径规划等功能。

## 功能

- 校园 POI 地图展示与分类筛选（食堂、教学楼、宿舍、图书馆等）
- POI 模糊搜索（基于 rapidfuzz）
- 两点步行路径规划（调用高德步行导航 API）
- 多点路径规划
- 校区边界绘制
- Electron 桌面应用打包

## 技术栈

| 层 | 技术 |
|---|---|
| 后端 | Django 5.2 + Django REST Framework |
| 前端 | React 18 + Webpack 5 |
| 桌面 | Electron |
| 数据库 | PostgreSQL |
| 地图 | 高德地图 JS API + Web 服务 API |
| 搜索 | rapidfuzz（模糊匹配） |

## 项目结构

```
├── backend/                # Django 后端
│   ├── campus_nav/         # Django 项目配置
│   ├── pois/               # POI 管理（模型、搜索、API）
│   ├── routing/            # 路径规划（高德 API 调用）
│   ├── config/             # 地图配置接口
│   └── requirements.txt
├── frontend/               # React + Electron 前端
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── api/            # API 客户端封装
│   │   ├── hooks/          # 自定义 Hooks
│   │   └── context/        # React Context
│   ├── electron/           # Electron 主进程
│   ├── webpack.config.js
│   └── package.json
├── docs/specs/             # 设计文档与需求规格
└── scripts/                # 辅助脚本
```

## 环境要求

- Python 3.10+
- Node.js 18+
- PostgreSQL

## 快速开始

### 1. 数据库准备

确保 PostgreSQL 正在运行，创建数据库：

```sql
CREATE DATABASE campus_nav;
```

进入后端目录，复制环境变量模板并填写本机数据库密码：

```bash
cd backend
cp .env.example .env
```

至少需要确认以下变量与本机 PostgreSQL 一致：

- `POSTGRES_DB=campus_nav`
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=你的本机数据库密码`
- `POSTGRES_HOST=127.0.0.1`
- `POSTGRES_PORT=5432`

### 2. 启动后端

```bash
pip install -r requirements.txt
python manage.py migrate
python scripts/migrate_poi_data.py
python manage.py runserver
```

后端运行在 http://localhost:8000 ，API 前缀为 `/api/`。

后端会优先读取 `backend/.env` 中的数据库配置；如果 `POSTGRES_PASSWORD` 为空，会在启动时直接提示配置缺失。

### 3. 启动前端

```bash
cd frontend
npm install
npm run start
```

前端开发服务器运行在 http://localhost:3000 。

### 4. 根目录一键联调启动

首次使用前，先确保前端依赖已安装：

```bash
cd frontend
npm install
```

之后回到仓库根目录，直接执行：

```bash
cd ..
npm start
```

该命令会同时启动：

- Django 后端：`http://127.0.0.1:8000`
- React 前端：`http://127.0.0.1:3000`

### 5. Electron 桌面应用（可选）

```bash
cd frontend
npm run electron-dev      # 开发模式
npm run electron-build    # 打包发布
```

## API 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/pois/` | 获取所有 POI |
| GET | `/api/pois/search/?q=关键词` | 模糊搜索 POI |
| GET | `/api/routing/walk/?orig_lng=经度&orig_lat=纬度&dest_lng=经度&dest_lat=纬度` | 两点步行路径规划 |
| POST | `/api/routing/multi/` | 多点路径规划 |
| GET | `/api/config/map/` | 获取地图配置（中心点、缩放、边界、高德 Key） |

## 许可证

本项目仅供学习交流使用。
