---
name: feature-completion-checklist
description: Use before claiming a feature/task is done, before committing, or before reporting completion. Enforces the definition-of-done checklist (tests, CLI, docs, deploy) instead of "should work".
---

# 特性完工清单（V2）

声称完工前逐项核对，每项建成 TodoWrite。任何一项未做 = 未完成。

1. **E2E 测试**：覆盖主路径（创建/编辑/删除），实际跑通（0 退出码+数字）。
2. **后端/单元测试**：新增或改动代码有对应测试，全绿。
3. **CLI 命令**🟡：新后端 API 有配对 CLI 命令。
4. **Mock/seed 脚本**：演示/测试数据可一键生成。
5. **API 文档**：新端点写入参考。
6. **常量/枚举**：新中文枚举已登记（原样保留）。
7. **文档同步**：项目 CLAUDE.md/AGENTS.md 受影响段更新；AGENTS.md 测试状态标记刷新（日期+数量）。
8. **部署**（如需）：走 skill `deploy-to-prod`。

## 铁律
- "应该通过"不算（V1）：每项附实际工具输出。
- 子 agent 实现的：主 agent 亲自读文件、跑测试核验（V5）。

## 报告格式
```
✅ <特性> 完成 — 后端 N/N、E2E M/M 全绿；CLI:<cmd>；文档:<files>；部署:<结果/未部署>
```
