---
name: project-cold-start
description: Use when starting a new project, or when a project lacks CLAUDE.md/AGENTS.md/tests/deploy scaffolding. Sets up the standard scaffold so any agent gets full context in 5 minutes. Pair with pin-project-md.
---

# 项目冷启动

新项目按此初始化（全局元规则已自动继承，项目 md 只写专属事实）。

1. **CLAUDE.md**：建项目根 CLAUDE.md，填技术栈表/仓库结构/构建测试命令/架构/本项目 Hard-Won Discoveries。
2. **AGENTS.md**：建项目根 AGENTS.md，填编排契约 + 测试状态标记区（日期+数量）。
3. **memory/**：建 `.claude/projects/<slug>/memory/` + `MEMORY.md` 索引。
4. **测试框架**：搭 UT/IT/ST/E2E 骨架（见 `testing-methodology`），写第一个 failing test 验证链路。
5. **CLI 入口**🟡：建 CLI 脚手架（每个 API 配 CLI）。
6. **部署脚本**：建 `.env.deploy`（gitignored）+ 部署骨架（见 `deploy-ops`）。
7. **.ai-coding.json**：写 `{"verify":"<test cmd>"}` 以启用"完工必验证"hook。
8. **config/schemas/**（如适用）：config-driven 实体 schema。

完成后用 skill `pin-project-md` 把本栈参考钉进项目 md。
验收：md 就位且填了专属段；第一个测试能跑；部署骨架就位；memory 建好。
