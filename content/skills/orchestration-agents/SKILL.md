---
name: orchestration-agents
description: Use when orchestrating multiple agents in opencode (Sisyphus/oh-my-openagent) — the agent selection matrix, multi-model strategy, MCP tools, memory tiers, and orchestration anti-patterns. Complements parallel-orchestration.
---

# 编排：Agent 矩阵 / 多模型（🟡 本组织 opencode 栈）

## 双轨
opencode 主控 + `claude --dangerously-skip-permissions -p`（headless，可与 opencode subagent 并行不阻塞）。

## Agent 选择矩阵
| 任务 | Agent |
|------|-------|
| 前端 UI/设计 | `visual-engineering` |
| 单文件简单改 | `quick` |
| 复杂逻辑/架构 | `ultrabrain` |
| 深度研究+实现 | `deep` |
| 代码探索 | `explore`(后台) |
| 外部文档/API | `librarian`(后台) |
| 架构/调试咨询 | `oracle`(后台) |
| 计划评审 | `momus` |

## 反模式
❌ 串行等待（应同时发多个 explore+librarian）｜❌ 重复搜索（信任 explore 结果）｜❌ 盲信 subagent（逐一读产出验证，V5）｜❌ 阻塞在 oracle（后台跑，先做不依赖的活）｜❌ 单文件改用 heavy agent。

## 多模型
主 GLM-5 / 轻 GLM-4.5-air / 大 Qwen3-Coder-480B / 视觉 Kimi-K2.6。任务难度匹配档位。

## 记忆层级
项目 memory（`.claude/projects/<slug>/memory/`）｜跨项目（self-improvement LEARNINGS.md）｜会话。流转：项目教训→feedback_*.md；跨项目→LEARNINGS.md。
