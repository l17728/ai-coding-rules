---
name: system-improvement-loop
description: Use to continuously sediment, optimize and improve the WHOLE rule system — periodically, after accumulating lessons, when a rule proves wrong/stale, or when the user asks to evolve/re-distill the AI-coding rules. This is the closed feedback loop that keeps the constitution and skills alive.
---

# 闭环：持续沉淀 / 优化 / 改进整套系统

蒸馏出的宪法与 skill 是快照，会漂移。本 skill 是让它**保活进化**的闭环主控。

## 闭环四步
1. **采集**：汇总自上次以来的输入——各项目 `memory/feedback_*.md`、`postmortem-capture` 产出、`.learnings/`、被 hook 拦截的高频事件、用户纠正。
2. **归类去重**：按类别合并（前端/后端/Electron/并发/部署/编排/流程）。同一教训只留一条最强表述。
3. **决策落点**（关键——别什么都塞进宪法）：
   | 性质 | 落点 |
   |------|------|
   | 永远生效的元规则 | `CONSTITUTION.md` / `opencode-AGENTS-core.md` |
   | 某技术栈硬知识 | 对应参考 skill（`backend-go-gorm` 等） |
   | 可程序化的纪律 | 升级为 hook（如部署守护、完工验证） |
   | 判断性流程 | 新增/修订流程 skill |
   4. **发布与版本**：更新 `ai-coding-rules` 包内容→bump version→重装（`npx ai-coding-rules install`）→在两工具新会话验证生效。记录变更日志。

## 触发再蒸馏的条件
- 新增 ≥20 条 feedback memory；或跨过一个大版本；或某规则被证伪。

## 反模式
- ❌ 把项目专属 quirk 塞进全局宪法（污染、过期）。→ 放参考 skill 或项目 md。
- ❌ 只记不落点（复盘不回写=没复盘）。
- ❌ 宪法越长越好。→ 薄宪法，细节下沉到按需 skill。

## 健康检查（自检本系统是否仍闭环）
- [ ] 复盘有没有真的回写？（抽查近 N 条 memory 是否进了 skill/宪法）
- [ ] 有没有规则已被证伪却仍在？（删之）
- [ ] hook 是否拦了大量同类事件？（说明该把规则前移/自动化）
- [ ] 参考 skill 的 description 触发是否准确？（误触发/漏触发→改 description）
