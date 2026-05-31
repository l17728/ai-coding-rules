---
name: pin-project-md
description: Use at project entry / cold-start, or whenever a project's CLAUDE.md/AGENTS.md does not yet pin its per-stack references. Detects the stack and pins (copies the relevant reference content into) the project md, for BOTH Claude Code and opencode. Triggered by the SessionStart guard.
---

# 盯死项目 md（钉死本栈参考，两工具通用）

目的：让"按需软触发"的分栈参考，在本项目里变成**常驻硬上下文**——把相关参考钉进项目 md，两个工具都生效。

## 流程
1. **探测技术栈**：
   - `package.json` → react/antd/vue ⇒ `frontend-react-antd-vue`；electron ⇒ `electron-app`；express/fastify/better-sqlite3 ⇒ `testing-methodology`
   - `go.mod` ⇒ `backend-go-gorm`
   - `pyproject.toml`/`requirements.txt` ⇒ `architecture-db`
   - 多 agent 项目 ⇒ `orchestration-agents`
2. **确保项目 md 存在**：缺 CLAUDE.md/AGENTS.md 先用 skill `project-cold-start` 建。
3. **钉死参考（复制冷启动参考）**：在**项目 CLAUDE.md 和 AGENTS.md** 各插入一个"本栈必读"块，把相关参考 skill 的**核心规则摘录**复制进去（不是只留路径——要把内容钉进来），并标注"完整见 skill `<name>`"。
   - 用受控标记包裹，便于更新：`<!-- BEGIN pinned-refs -->` … `<!-- END pinned-refs -->`。
4. **两工具一致**：Claude 读项目 `CLAUDE.md`，opencode 读项目 `AGENTS.md`（也回退读 CLAUDE.md）；两份都钉，确保并存时都生效。
5. **登记**：在项目 AGENTS.md 记录"已钉栈：<列表>（日期）"。

## 验收
- [ ] 项目 CLAUDE.md 与 AGENTS.md 都含 pinned-refs 块
- [ ] 块内是本栈参考的实际规则摘录，非空路径
- [ ] 栈变化时可重跑本 skill 更新块
