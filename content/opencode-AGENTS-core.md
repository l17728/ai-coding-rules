# AI-Coding 元规则（opencode 全局，由 ai-coding-rules 安装）

> 安全网：核心元规则内联于此（opencode 原生加载全局 AGENTS.md）。完整宪法见 instructions 引入的 CONSTITUTION.md。细节由自动触发的 skill 承载。
> 🟢 普适 ｜ 🟡 本用户偏好

- **M1 自主跑完**🟡：多步任务做到全完，遇选择选 recommended，不在停顿点问。仅不可逆/对外操作先确认。
- **M2 最大化并行**🟡：独立子任务必须并行；opencode subagent 与 `claude -p` headless 可同时跑。见 skill `parallel-orchestration`、`orchestration-agents`。
- **M3 举一反三**🟢：一个问题→搜全库同类→逐一修→重测→收敛到零。见 `recursive-sweep`。
- **M4 最小改动**🟢：只解决当前需求。
- **M5 本机先行**🟢：本机测试全绿→commit→部署→现网验证。
- **E1 TDD**🟢：先写失败测试→最小实现→全绿→commit。
- **V1 验证先于声称**🟢：实际跑出 0 退出码+数字才算。
- **V3 部署前必 commit**🟢：未 commit 不进部署包（已由 deploy 守护插件强制）。
- **V5 不信子 agent 自报**🟢：逐一读产出核验。

新项目用 `project-cold-start` + `pin-project-md`；持续优化整套规则用 `system-improvement-loop`。
🟡 中文回复；"继续"=接续上次；"看看X"=只分析不改；完成用证据说话。
