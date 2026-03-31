# Bugfix 任务清单

> **主题：** 修复 Django + React + Electron 重构后的生产可用性回归
> **关联规范：** `docs/specs/bugfix.md` · `docs/specs/design.md`
> **最后更新：** 2026-03-31
> **进度：** 5 / 5 已完成

---

## 执行规则

1. 严格按顺序执行，一次只处理一个未完成复选框。
2. 优先建立可复现证据和回归验证，再做修复。
3. 所有实现必须围绕已确认根因，不允许顺手扩大重构。
4. 不允许用隐藏回退、静默重试、空数据成功返回等方式掩盖失败。

---

## 任务列表

- [x] **B-001:** 建立当前缺陷的最强可用回归证据
  - 📁 涉及文件：`frontend/webpack.config.js`, `frontend/public/index.html`, `frontend/electron/main.js`, `frontend/src/hooks/useMap.js`, `backend/routing/amap_client.py`, `backend/routing/views.py`
  - ✅ 验证标准：
    - 有可重复的方式证明构建产物资源路径是绝对路径
    - 有可重复的方式证明生产态未提供本地 Django 运行链路
    - 有可重复的方式证明地图边界因初始化时序缺失
    - 有可重复的方式证明路径规划异常未返回稳定 JSON
  - ⏱️ 预估工程量：0.5 小时
  - 🔗 依赖：无

- [x] **B-002:** 修复 Electron 生产态资源加载与运行时 API 配置
  - 📁 涉及文件：`frontend/webpack.config.js`, `frontend/public/index.html`, `frontend/src/api/client.js`, `frontend/electron/preload.js`
  - ✅ 验证标准：
    - `npm run build` 后 `dist/index.html` 中静态资源引用为相对路径
    - 渲染进程从单一配置入口读取 API 基地址
    - 开发态仍能继续使用 `localhost:3000` + 外部 Django
  - ⏱️ 预估工程量：1 小时
  - 🔗 依赖：B-001

- [x] **B-003:** 建立 Electron 生产态本地 Django 编排链路
  - 📁 涉及文件：`frontend/electron/main.js`, `frontend/package.json`, `backend/manage.py` 及最小必要启动辅助文件
  - ✅ 验证标准：
    - 生产态启动时 Electron 能拉起本地 Django 子进程并等待健康检查通过
    - 渲染进程通过运行时注入地址访问后端成功
    - 应用退出后 Django 子进程被清理
    - 打包资源包含实现该链路所需的最小后端文件
  - ⏱️ 预估工程量：1.5 小时
  - 🔗 依赖：B-002

- [x] **B-004:** 修复地图边界初始化时序与路径规划错误契约
  - 📁 涉及文件：`frontend/src/hooks/useMap.js`, `backend/routing/amap_client.py`, `backend/routing/views.py`
  - ✅ 验证标准：
    - 地图就绪后边界一定绘制成功
    - 搜索、筛选、路线绘制不会破坏边界显示
    - 路径规划网络失败、超时、非法 JSON 时均返回 JSON `{error: ...}`
  - ⏱️ 预估工程量：1 小时
  - 🔗 依赖：B-001

- [x] **B-005:** 完成打包态回归验证并更新规范进度
  - 📁 涉及文件：上述所有受影响文件与 `docs/specs/tasks.md`
  - ✅ 验证标准：
    - 后端 `manage.py check` 通过
    - 前端 `npm run build` 通过
    - Electron 生产态 smoke 验证通过
    - 本文档中的已完成任务被逐项勾选并写明验证结果
  - ⏱️ 预估工程量：0.5 小时
  - 🔗 依赖：B-003, B-004

---

## 风险标记

| 任务 ID | 风险类别 | 风险描述 |
|:---|:---|:---|
| B-003 | 运行时集成 | Electron 主进程引入 Django 子进程，必须避免僵尸进程和端口漂移 |
| B-003 | 环境依赖 | 本次修复仍建立在本机存在 Python 与 PostgreSQL 的前提下 |
| B-004 | 行为一致性 | 错误契约修复不能改变成功路径的返回结构 |

---

## 完成日志

| 任务 ID | 完成时间 | Commit Hash | 备注 |
|:---|:---|:---|:---|
| B-001 | 2026-03-31 | — | 新增 `scripts/collect_bugfix_evidence.py`，已能重复证明 4 个已确认问题存在 |
| B-002 | 2026-03-31 | — | 生产构建改为相对静态资源路径，preload 暴露运行时 API 配置，客户端改为单一入口解析 |
| B-003 | 2026-03-31 | — | Electron 生产态可从 `resources/backend` 启动 Django 子进程，支持 `CAMPUS_NAV_PYTHON` 与固定端口验证 |
| B-004 | 2026-03-31 | — | 地图依赖补齐 `isMapReady`；高德网络/JSON 异常统一转换为 JSON 错误契约 |
| B-005 | 2026-03-31 | — | `manage.py check`、`npm run build`、证据脚本、`electron-builder`、`win-unpacked` + 临时 PostgreSQL smoke 均完成 |
