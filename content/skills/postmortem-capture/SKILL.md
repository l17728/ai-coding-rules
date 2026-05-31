---
name: postmortem-capture
description: Use after solving a non-trivial problem — when it took 2+ attempts, the root cause was counter-intuitive, you discovered unknown system behavior, or a similar issue recurred. Captures the lesson as an enforceable rule and writes it back.
---

# 复盘沉淀（保活闭环的一环）

## 触发（任一）
≥2 方案才解决 ｜ 根因反直觉 ｜ 发现未知系统行为 ｜ 同类问题复现。

## 输出（四段）
```
1. 踩了什么坑：<现象>
2. 根因：<本质，不是症状>
3. 可执行规则：<AI 能直接遵循的一条>
4. 回写位置：<见下>
```

## 回写去向（必须落地）
| 教训性质 | 写到哪 |
|---------|--------|
| 某技术栈 quirk | 对应参考 skill（如 `backend-go-gorm`）的同类清单 / 项目 memory |
| 跨栈通用规则 | 项目 CLAUDE.md/AGENTS.md；重大者上报至 `system-improvement-loop` |
| 项目专属事实 | `.claude/projects/<slug>/memory/feedback_*.md` + AGENTS.md "Hard-Won Discoveries" |

memory 格式：`--- name/description/metadata:{type:feedback} ---` + 踩坑/根因/规则，写前查重。
收口：同类问题接着 `recursive-sweep`；累积成批后用 `system-improvement-loop` 再蒸馏。
