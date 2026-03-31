# Bugfix 规范

> **主题：** 修复 Django + React + Electron 重构后的生产可用性回归
> **状态：** 草稿
> **最后更新：** 2026-03-31
> **关联审查：** PR `Refactor campus navigation to Django + React + Electron`

---

## 1. 缺陷摘要

本次 bugfix 用于修复重构分支中已经声称“完成并可打包交付”的桌面端与地图初始化回归。目标是恢复已在原设计与任务清单中声明的正确行为，而不是新增能力。

确认的问题共 4 项：

1. Electron 生产模式通过 `loadFile()` 打开的前端页面使用绝对资源路径，导致渲染进程 bundle 在 `file://` 场景下无法加载，应用白屏。
2. Electron 打包产物没有启动或编排 Django 后端，前端仍固定请求 `http://localhost:8000/api`，导致安装包不具备自足运行链路。
3. 地图边界多边形的 effect 依赖错误，异步地图初始化完成后不会再次触发边界绘制，校区轮廓缺失。
4. 路径规划接口未统一捕获 `requests` 层异常和非 JSON 上游响应，调用失败时会直接抛出 Django 500 页面级异常，而不是前端约定的 JSON 错误。

---

## 2. 当前错误行为

### BUG-001: Electron 生产包白屏

- `frontend/webpack.config.js` 将 `output.publicPath` 固定为 `/`
- `frontend/public/index.html` 使用 `/favicon.svg`
- 生产模式 `electron/main.js` 通过 `loadFile()` 加载本地 `dist/index.html`
- 实际构建产物中的脚本地址形如 `/bundle.<hash>.js`
- 在 `file://.../dist/index.html` 中，该路径解析到磁盘根而不是应用目录，React 应用无法启动

### BUG-002: 打包桌面端没有后端运行链路

- `frontend/.env` 与 `frontend/src/api/client.js` 固定访问 `http://localhost:8000/api`
- `frontend/package.json` 的 electron-builder 仅打包前端静态文件和 Electron 入口
- `frontend/electron/main.js` 未启动、等待或停止 Django 子进程
- 安装包运行后，即使前端页面可见，也无法访问 API，核心导航功能不可用

### BUG-003: 校区边界不显示

- `useMap` 中边界绘制 effect 只依赖 `mapConfig`
- 首次执行时地图实例通常尚未准备完成，effect 提前返回
- 后续地图实例创建成功后，因依赖未变化，边界绘制不再重跑

### BUG-004: 路径规划错误返回不稳定

- `routing/amap_client.py` 直接对 `requests.get(...).json()` 取值
- 网络失败、超时、上游返回非法 JSON 时，会抛出库异常或解析异常
- `routing/views.py` 仅捕获 `AMapAPIError`
- 前端收到的是未结构化的 500，而不是 `{"error": "..."}`

---

## 3. 期望行为

### FIX-001: Electron 生产模式可正常加载前端

- 打包后的 `dist/index.html` 只能引用相对静态资源路径
- Electron 生产模式打开本地 HTML 后，React 渲染进程必须正常启动

### FIX-002: 打包桌面端具备受支持的本地后端运行链路

- 生产模式下 Electron 主进程必须显式负责本地 Django 后端的启动和停止
- 前端 API 地址必须来源于运行时注入，而不是硬编码到 `localhost:8000`
- 启动链路失败时应给出明确失败信号，不允许静默降级到一个未声明的远程或外部服务

### FIX-003: 地图初始化后稳定绘制边界

- 只要地图实例和地图配置都已就绪，校区边界必须被绘制
- 该行为不能依赖偶然的 effect 执行顺序

### FIX-004: 路径规划错误始终返回结构化 JSON

- 参数错误继续返回 400 + `{"error": "参数错误"}`
- 高德或网络调用失败统一返回 500 + `{"error": "<可读消息>"}`
- 不将 Django HTML 500 页面暴露给前端

---

## 4. 必须保持不变的行为

1. 技术栈不变，仍为 Django + DRF、React、Electron、PostgreSQL。
2. 开发态联调方式不变，仍允许 React `localhost:3000` 对接 Django `localhost:8000`。
3. 搜索语义、路径规划返回格式、窗口尺寸和标题不变。
4. 不引入与问题无关的大规模状态管理、构建工具迁移或后端重构。

---

## 5. 范围与非目标

### 本次范围

- 修复 Electron 生产模式静态资源寻址
- 建立 Electron 生产模式下的本地 Django 子进程编排
- 修复地图边界 effect 时序问题
- 统一路径规划错误契约
- 增补与上述问题直接对应的回归验证

### 非目标

- 不做 Python 运行时打包器替换
- 不引入 Docker、服务管理器或远程 API 网关
- 不改变 PostgreSQL 依赖前提
- 不新增用户可感知功能

---

## 6. 环境与假设

1. 支持环境仍以设计文档中的 Windows 桌面环境为准。
2. 生产模式的“可运行”定义限定在当前项目已接受的前提下：
   - 本机存在可调用的 Python 解释器
   - PostgreSQL 可达且已完成迁移与数据导入
3. 若未来需要“无 Python / 无 PostgreSQL 预装的一键安装包”，那是新的交付特性，不属于本次 bugfix。

---

## 7. 证据

1. `npm run build` 生成的 `frontend/dist/index.html` 实际引用 `/bundle.<hash>.js`，与 `file://` 生产加载方式冲突。
2. `frontend/package.json` 打包清单未包含后端运行资源，也未声明后端启动流程。
3. `frontend/src/api/client.js` 与 `frontend/.env` 将 API 固定到 `http://localhost:8000/api`。
4. `frontend/src/hooks/useMap.js` 中边界 effect 只依赖 `mapConfig`，未依赖地图实例就绪状态。
5. `backend/routing/amap_client.py` 和 `backend/routing/views.py` 的异常边界不闭合。

---

## 8. 风险与约束

- Electron 主进程引入后端子进程后，必须确保退出时清理，避免僵尸进程。
- 运行时注入 API 地址必须保持单一真相源，避免开发态 / 生产态 / preload 三份配置相互漂移。
- 不允许用“请求失败后悄悄再试另一个地址”“捕获所有异常后返回成功空数据”这类兜底式做法掩盖真实故障。

---

## 9. 审批记录

| 日期 | 审批人 | 决定 | 备注 |
|:---|:---|:---|:---|
| — | — | 待审批 | — |
