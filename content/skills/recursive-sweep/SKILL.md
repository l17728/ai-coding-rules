---
name: recursive-sweep
description: Use when fixing any bug, handling a test failure, or reviewing code — fix the whole CLASS of the problem, not just the one instance. Search the entire codebase for the same pattern and converge to zero.
---

# 举一反三普查（递归收敛）

发现一个问题，修复整类，不是修一个就走。

1. **识别根因模式**（不是症状）。
2. **搜全库同类**：Grep / ast-grep 搜该模式所有出现处。
   - 例：GORM bool 零值 bug → 搜所有 `default:true` bool 字段的 Create 路径。
   - 例：`row.locator('a')` 匹配冲突 → 搜所有宽匹配定位。
3. **逐一修复**每个实例。
4. **检查是否引入新问题**：重跑相关测试。
5. **有新问题→回 1**，递归。
6. **收敛到零失败才停**。

## 输出
```
根因模式：… ｜ 搜索范围：<grep/文件数> ｜ 修复：<N 处 file:line> ｜ 回归：<N/N 全绿>
```
满足复盘条件的，接着用 skill `postmortem-capture`。
