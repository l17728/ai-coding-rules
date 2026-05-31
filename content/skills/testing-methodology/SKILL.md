---
name: testing-methodology
description: Use when writing tests or deciding test strategy. Covers the 4-layer model (UT/IT/ST/E2E), test isolation, no external services, naming, anti-regression checklist, and "verify, don't assume".
---

# 测试方法论

测试覆盖是交付的定义标准，不是事后补。先写失败测试，再写最小实现。

## 四层模型
UT 单函数(毫秒,同目录) ｜ IT 模块间(秒) ｜ ST 完整流程(秒,`tests/system/`) ｜ E2E 用户场景(分钟,`tests/e2e/`)。

## E2E 设计
- 不依赖外部服务：DB 用 `:memory:`；HTTP mock 用 `httptest.NewServer`；前端 route 拦截 mock。
- 隔离：每测试独立环境（库/workspace/schema），无共享状态，顺序不敏感。
- 命名按场景：`TC-{模块}-{序号}` / `Test{功能}_{场景}`。

## 各栈
Node：Vitest+supertest，`makeTestApp()` 内存库。Go：testify，`-race -count=10`。Electron：Playwright+CDP，`createTestWorkspace()`。

## 防回归清单
- Once-set 语义：测"写入不被覆盖"时后续输入须带不同值。
- Provider 对称性：正常流/malformed/非流式各覆盖。
- 新增 exported 方法同 PR 内必须含测试。
- 多 toast 用 `.first()`。

## 状态管理
AGENTS.md 记测试日期+数量；今天+一致→可跳过，有改动→重跑更新。Schema 测试间重置（`git checkout -- config/schemas/`）。

## 铁律（V1）
"应该通过"不算验证。验证=实际跑，0 退出码+具体数字。可在项目 `.ai-coding.json` 配 `{"verify":"<cmd>"}` 让 Stop hook 强制门禁。
