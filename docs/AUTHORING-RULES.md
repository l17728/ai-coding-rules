# 编写你自己的规则集 · Authoring Your Own Ruleset

> 本项目是一个**可复用框架**：安装器（`bin/`、`src/`）和打包机制是通用的；`content/` 与 `hooks/` 里的规则只是**一个实例**——从某个用户的会话/文档蒸馏而来。
> 你可以用同一套机制，从**你自己的**会话/记忆/md 文档蒸馏出规则，替换 `content/` + `hooks/`，以你自己的 npm scope 重新打包发布。
> 本文档就是缺失的那一环：**如何产生这些规则**。

---

## 总览：三步

```
① 蒸馏 Distill   从你的素材 → 规则（宪法/skill/hook/手册）
② 放置 Place     规则放进 content/ 与 hooks/（保持结构/命名约定）
③ 重打包 Repack  改 name、验证、bump、发布
```

> 安装后本包自带的 `system-improvement-loop` skill 就是这条闭环的"产品内"版本——可以直接驱动它来做下面的蒸馏。

---

## 第一步：蒸馏方法论（Distill）

### 1.1 收集素材（扫这些）
一切**正式代码之外的过程性产物**：
- **Claude Code 会话**：`~/.claude/projects/*/` 下的 `*.jsonl`
- **opencode 会话**：`~/.local/share/opencode/storage/`（及 `~/.config/opencode/`）
- 各项目根的 **`CLAUDE.md` / `AGENTS.md`**
- **项目记忆**：`~/.claude/projects/<slug>/memory/*.md`（feedback/reference/design）
- **skills**、`.learnings/`、复盘文档、踩坑记录、部署脚本注释、PRD/DESIGN 文档

### 1.2 分析维度（沿这些轴提炼）
建议先产出一层**分析中间文档**（本项目的规则就来自这样的 `00_..09_` 分析层），再合成。维度：
1. 用户画像与工作模式
2. 核心原则（跨语言/框架/场景都成立的）
3. 话术 / 交互模式（人→agent、agent→子agent）
4. 技术陷阱（**按技术栈分类**）
5. 测试方法论
6. 文档规范
7. 部署与运维
8. Agent 编排 / skill 设计

> 提速：把素材分给**多个 agent 并行**各扫一个维度（见 `parallel-orchestration` skill），最后合成。

### 1.3 分层蒸馏（归到 4 层，并标注来源性质）
| 层 | 是什么 | 落到哪个文件 |
|----|--------|-------------|
| **宪法** | 永远生效的元规则（**薄！~1 屏**） | `content/CONSTITUTION.md` |
| **skill** | 自动触发的流程 + 分栈参考 | `content/skills/<name>/SKILL.md` |
| **hook** | 确定性强制（**少而精**） | `hooks/*.cjs` + `hooks/opencode-plugin.js` |
| **手册** | 面向使用者的说明 | `content/MANUAL.md` |

每条标注 **🟢 普适工程原则** 还是 **🟡 个人/团队偏好**，避免把个人习惯当通用真理。
**落点判断**（什么进宪法、什么进 skill、什么做成 hook）见 `system-improvement-loop` skill 里的"决策落点"表。核心原则：**宪法越薄越好，细节下沉到按需 skill**。

---

## 第二步：把规则放进工程（Place）

替换/新增以下文件，**保持文件名与目录结构**（安装器按结构自动部署，无需改代码）：

| 放什么 | 路径 | 约束 |
|--------|------|------|
| 宪法 | `content/CONSTITUTION.md` | 薄；Claude 端通过 `@import` 引入，所以写成可独立阅读的 md |
| opencode 安全网 | `content/opencode-AGENTS-core.md` | 内联核心元规则（opencode 不支持 @import） |
| 手册 | `content/MANUAL.md` | 面向使用者 |
| 技能 | `content/skills/<kebab-name>/SKILL.md` | 见下方 frontmatter 规范 |
| Claude 钩子 | `hooks/<name>.cjs` | CommonJS；读 stdin JSON；`exit 2`+stderr 阻断 |
| opencode 钩子 | `hooks/opencode-plugin.js` | ESM 插件；`tool.execute.before` / `event` 等 |

### SKILL.md frontmatter 规范（两工具通用）
```yaml
---
name: my-skill           # 必须 ascii 小写字母+数字+单连字符，≤64 字符（opencode 硬性要求）
description: Use when ... # 写成"触发句"——它决定自动触发命中率；正文可中文
---
# 正文：流程/清单（按需加载，不常驻 context）
```
要点：
- **name 必须 ascii kebab**（中文放正文/description）。
- **description 写成"Use when …"场景句**——这是自动触发的关键。
- **增删 skill 不用改代码**：安装器按 `content/skills/` 目录扫描部署；卸载也按此目录清理。

### 增删 hook 时（需要改一点代码）
- **Claude**：在 `src/claude.js` 的 `claudeHookDefs()` 里注册事件（`PreToolUse`/`Stop`/`SessionStart`…），并把脚本放 `hooks/`。
- **opencode**：编辑 `hooks/opencode-plugin.js`（`tool.execute.before` 阻断用 `throw`；`event` 匹配 `session.idle` 等）。
- 钩子契约：Claude 钩子读 stdin 的 JSON（`tool_input` / `cwd` / `stop_hook_active` 等），阻断用 `exit 2`+stderr 或输出 `{"decision":"block","reason":...}`。

---

## 第三步：重打包发布（Repackage）

1. **改 `package.json`**：
   - `name` → 你自己的 scope，如 `@yourname/your-rules`
   - `version` 从 `0.1.0` 起（npm 版本号用过永不可复用）
   - `repository` / `homepage` / `bugs` / `author` 改成你的
2. **改 `README.md` / `LICENSE`** 为你的。
3. **验证（务必先 dry-run）**：
   ```bash
   node bin/cli.js install --dry-run          # 看将写哪些文件，不落盘
   # 真装到临时目录测试（不碰真实配置）：
   CLAUDE_CONFIG_DIR=/tmp/t-claude OPENCODE_CONFIG_DIR=/tmp/t-oc node bin/cli.js install
   CLAUDE_CONFIG_DIR=/tmp/t-claude OPENCODE_CONFIG_DIR=/tmp/t-oc node bin/cli.js uninstall
   ```
4. **发布**：
   ```bash
   npm publish --access public        # scoped 包需要 --access public
   ```
   或**只用 GitHub**：让用户 `git clone` 后 `node bin/cli.js install`（零依赖，不走 npm）。
5. **维护闭环**：以后每次蒸馏出新教训 → 更新 `content/` → bump 版本 → 重发。这就是 `system-improvement-loop`。

---

## 发布前校验清单
- [ ] 每个 skill 的 `name` 全 ascii kebab、`description` 是"Use when…"触发句
- [ ] 宪法保持薄（~1 屏），细节在 skill 里
- [ ] hooks 跨平台正确（Claude `.cjs` / opencode ESM）、stdin & exit 契约对
- [ ] `install --dry-run` 输出符合预期
- [ ] 临时目录真装/卸载验证通过（用户原有 CLAUDE.md/AGENTS.md 内容被保留）
- [ ] `package.json` 的 `name`/`version`/`repository` 已改成你的
- [ ] 🟢/🟡 标注清晰，未把个人偏好当普适真理

---

## 架构速记（为什么这样分）
- **宪法常驻、薄** → 省 context、稳定。
- **skill 按需触发** → 细节不烧 context，命中靠 description。
- **hook 确定性** → 真正不可绕过的纪律（如"部署前必 commit""完工必验证"）才做成 hook，因为它绕过模型判断。
- **opencode 原生读 `~/.claude/skills`** → 双工具并存时技能只装一份。
- **受控块 + JSON 合并 + 备份** → 安装器从不覆盖用户内容，可干净卸载。
