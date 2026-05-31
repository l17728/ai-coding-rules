---
name: deploy-to-prod
description: Use when deploying to production / 现网, or when the user says "部署"/"上线"/"deploy". Enforces commit-first, runs the stack-appropriate deploy, and smoke-verifies on prod.
---

# 上线部署

细节见 skill `deploy-ops`。骨架与铁律：

1. **确认测试全绿**（实际跑，不靠记忆）。
2. **git commit**（铁律 V3）：`git add -A && git commit -m "…"`。未 commit 的改动不会进部署包。（已由 deploy 守护 hook 强制拦截）
3. **执行部署**（按栈）：Node SSH `deploy-direct.mjs` ｜ Go `git tag && push`(CI) ｜ Python `docker cp` 热补丁/build ｜ Electron `build:win`→asar 校验→`gh release create`（fork 加 `--repo`）。
4. **现网冒烟**：Playwright 冒烟 / curl 关键端点 / 看日志。
5. **报告 + 关 issue**，附现网证据。

不可逆/对外步骤（发布、推送）属 M1 例外：执行前确认。
```
✅ 已部署 <host/tag> — commit:<sha>；现网验证:<结果>
```
