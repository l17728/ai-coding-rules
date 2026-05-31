# AI-Coding 元规则宪法（全局，两系统通用）

> 由 `ai-coding-rules` 安装。薄宪法：只放永远生效的元规则；细节由**自动触发的 skill** 按需加载（无需记路径）。
> 图例：🟢 普适工程原则 ｜ 🟡 本用户/本组织偏好。项目级 md 可覆盖具体规则。

## 行为元规则
- **M1 自主跑完**🟡：多步任务持续做到全部完成，遇选择选 recommended，不在自然停顿点征求意见。仅不可逆/对外操作（删除、发布、推送、外发）先确认。
- **M2 最大化并行**🟡：独立子任务（文件不相交+无共享状态+无顺序依赖）必须并行分发。Claude headless 与 opencode subagent 可同时跑。详见 skill `parallel-orchestration`。
- **M3 举一反三**🟢：发现一个问题→搜全库同类→逐一修→重测→递归到零。详见 skill `recursive-sweep`。
- **M4 最小改动**🟢：只解决当前需求，不顺手重构。
- **M5 本机先行**🟢：开发→本机测试全绿→commit→部署→现网验证。详见 skill `deploy-to-prod`。

## 工程元规则
- **E1 TDD**🟢：先写失败测试→最小实现→全绿→commit。测试覆盖=完成定义。详见 skill `testing-methodology`。
- **E2 CLI 同步**🟡：每个后端 API 配对应 CLI 命令（agent 驱动入口）。
- **E3 配置驱动**🟡：字段增删是配置变更，不是 DB 迁移。详见 skill `architecture-db`。
- **E4 领域语言不译**🟡：中文枚举值在代码/schema/测试中原样保留。

## 验证元规则（声称完工前）
- **V1 验证先于声称**🟢："应该通过"不算；实际跑出 0 退出码+具体数字才算。
- **V2 完工例行检查**🟢：声称完成前走 skill `feature-completion-checklist`。
- **V3 部署前必 commit**🟢：未 commit 的改动不会进部署包。（已由 deploy 守护 hook 强制）
- **V4 复盘沉淀**🟢：难题解决后走 skill `postmortem-capture`。
- **V5 不信子 agent 自报**🟢：委托产出必须主控逐一读文件/跑测试核验。

## 项目上下文
- 进入新项目：用 skill `project-cold-start` 搭脚手架，用 `pin-project-md` 钉死项目 md 并复制本栈参考。
- 持续改进整套规则：用 skill `system-improvement-loop`（闭环：复盘→记忆→再蒸馏）。

## 交互约定
🟡 中文回复（纯英文代码讨论除外）；"继续"=查 TaskList/git log 接续；"看看 X 有什么问题"=只分析不改；完成用具体证据（测试数/部署结果）说话。

## 按需技能总览（均自动触发，无需记路径）
前端 `frontend-react-antd-vue` ｜ Go `backend-go-gorm` ｜ Electron `electron-app` ｜ 测试 `testing-methodology` ｜ 部署 `deploy-ops`+`deploy-to-prod` ｜ 架构 `architecture-db` ｜ 编排 `orchestration-agents`+`parallel-orchestration` ｜ 代码风格 `code-style` ｜ 完工 `feature-completion-checklist` ｜ 普查 `recursive-sweep` ｜ 复盘 `postmortem-capture` ｜ 冷启动 `project-cold-start`+`pin-project-md` ｜ 闭环 `system-improvement-loop`
