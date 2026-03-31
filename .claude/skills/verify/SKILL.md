---
name: verify
description: 验证后端和前端代码的正确性（Django check + Webpack 构建）
---

运行以下验证步骤，按顺序执行，任一步骤失败则停止并报告错误：

1. 后端 Django 检查：
   ```bash
   cd backend && python manage.py check
   ```

2. 前端生产构建：
   ```bash
   cd frontend && npx webpack --mode production
   ```

报告每个步骤的结果。如果全部通过，简要确认即可。
