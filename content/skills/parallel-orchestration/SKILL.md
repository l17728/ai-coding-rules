---
name: parallel-orchestration
description: Use when facing 2+ independent tasks, when the user asks to "use multiple agents in parallel"/"并行", or when orchestrating multiple code agents to deliver. Split into independent subtasks, dispatch concurrently, then verify each.
---

# 并行编排（M2 执行细则）

控制多个 code agent 交付的核心动作。

1. **判断可并行** ⟺ 文件不相交 + 无共享状态 + 无顺序依赖。多 worktree 避免互踩。
2. **拆分**：切成自包含、可独立验收的子任务。
3. **分发（双轨并行，不阻塞）**：
   ```bash
   claude --dangerously-skip-permissions -p "<子任务>" --cwd <project>   # Claude headless
   ```
   opencode 侧用 task subagent。子 prompt 必须自包含：范围（仅限哪些文件）、约束、交付标准、要求回报具体数字。
4. **收口验证（关键，V5）**：子 agent 自报不可信；主控逐一读产出、跑测试核验；合并、处理交叉影响、全量回归。

opencode 的 agent 选择矩阵/多模型见 skill `orchestration-agents`。只在真正独立时并行；有依赖排成阶段。
