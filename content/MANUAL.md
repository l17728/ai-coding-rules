# AI-Coding 规则系统 · 使用手册（Manual）

> 由 `ai-coding-rules` 安装。本手册随安装部署到本机，路径见安装结尾输出，或运行 `ai-coding-rules manual`。

## 1. 这套系统是什么
一套**双系统（Claude Code + opencode）通用**的 AI-coding 工程控制层，分四层：
- **宪法**（全局元规则，常驻）：M1 自主跑完 / M2 并行 / M3 举一反三 / M4 最小改动 / M5 本机先行 / E1 TDD / V1 验证先于声称 / V5 不信子 agent 自报…
- **技能（skills，自动触发）**：16 个。流程类 6 + 冷启动/盯死/闭环 3 + 分栈参考 7（见下）。
- **钩子（hooks，确定性强制）**：部署前必 commit（拦截脏树部署）、完工必验证（`.ai-coding.json` 配 verify）、SessionStart 盯死项目 md。
- **手册**：本文件。

## 2. 安装后怎么生效
- **元规则**：每个新会话自动加载（Claude 读 `~/.claude/CLAUDE.md` 的 @import；opencode 读全局 `AGENTS.md` + instructions）。零配置。
- **技能**：harness 按 description 自动触发；也可显式调用（Claude `/技能名`；opencode 经 skill 工具）。
- **钩子**：Claude 走 `settings.json`；opencode 走 `plugin/ai-coding-rules.js`。

## 3. 在新项目里怎么用
1. 进入项目目录，开新会话——**全局元规则已生效**。
2. SessionStart 守护会提示：缺项目 md → 调 `project-cold-start` 搭脚手架，再调 `pin-project-md` 把本栈参考钉进项目 md（两工具都钉）。
3. 想强制"完工必验证"：在项目根放 `.ai-coding.json`：
   ```json
   { "verify": "npm test" }
   ```
   Stop 时自动跑，失败则不允许结束。
4. 项目专属事实写项目 `CLAUDE.md`/`AGENTS.md`；它们**叠加**在全局之上，冲突时项目优先。

## 4. 16 个技能速查
| 技能 | 何时触发 |
|------|---------|
| `feature-completion-checklist` | 声称完工前 |
| `recursive-sweep` | 修 bug / 测试失败 |
| `deploy-to-prod` / `deploy-ops` | 部署 / 上线 |
| `postmortem-capture` | 难题解决后 |
| `parallel-orchestration` / `orchestration-agents` | 多 agent 编排 |
| `project-cold-start` / `pin-project-md` | 新项目 / 项目缺 md |
| `system-improvement-loop` | 持续优化整套规则（闭环） |
| `frontend-react-antd-vue` | 写前端 |
| `backend-go-gorm` | 写 Go |
| `electron-app` | 写 Electron |
| `testing-methodology` | 写测试 |
| `architecture-db` | 设计架构/库 |
| `code-style` | 写代码 |

## 5. 钩子行为
- **部署守护**（PreToolUse/Bash；opencode tool.execute.before）：检测 deploy 类命令（deploy-direct/docker cp/gh release/git push tag/kubectl/systemctl restart/含 deploy 字样），若 git 工作树有未提交改动→**拦截**，提示先 commit。git 缺失或非 deploy 命令不拦。
- **完工验证**（Stop）：读项目 `.ai-coding.json` 的 `verify` 命令，失败则阻止结束（用 `stop_hook_active` 防死循环）；无配置则仅提醒。
- **项目 md 守护**（SessionStart）：是项目却缺 md → 注入上下文提示调冷启动/盯死技能。

## 6. 常用命令
```
ai-coding-rules status                # 看检测到的工具 + 已安装状态
ai-coding-rules install [--dry-run]   # 安装（--dry-run 只预览不写）
ai-coding-rules install --tools=opencode
ai-coding-rules install --force       # 工具未检测到也按默认路径预置
ai-coding-rules uninstall             # 干净卸载（含 settings.json 内的 hook 条目）
ai-coding-rules manual                # 打印本手册路径
```

## 7. 升级与闭环
改进内容后：bump 版本 → 重跑 `install`（受控块/条目幂等更新，旧文件自动备份为 `*.bak-ai-coding-rules`）。用 `system-improvement-loop` 技能驱动"复盘→落点→再发布"的保活闭环。

## 8. 卸载与回滚
`uninstall` 移除：CLAUDE.md/AGENTS.md 内的受控块、managed 目录、本系统的 16 个技能、settings.json 内本系统 hook 条目、opencode 插件与 instructions 条目。手动改过的文件有 `*.bak-ai-coding-rules` 备份可回滚。
