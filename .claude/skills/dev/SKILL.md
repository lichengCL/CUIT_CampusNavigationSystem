---
name: dev
description: 显示完整的开发环境启动步骤（后端 + 前端 + Electron）
disable-model-invocation: true
---

向用户展示开发环境的完整启动步骤：

## 开发环境启动

### 1. 启动 PostgreSQL
确保本地 PostgreSQL 正在运行，数据库 `campus_nav` 已创建。

### 2. 启动后端
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
后端运行在 http://localhost:8000

### 3. 启动前端
```bash
cd frontend
npm install
npm run start
```
前端运行在 http://localhost:3000

### 4.（可选）Electron 开发模式
```bash
cd frontend
npm run electron-dev
```
会同时启动 webpack-dev-server 和 Electron 窗口。

提醒用户：这些是长时间运行的命令，需要在各自的终端窗口中手动执行。
