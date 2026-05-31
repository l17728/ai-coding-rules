---
name: frontend-react-antd-vue
description: Use when writing or testing frontend code with React + Ant Design 5 or Vue3, especially Playwright E2E selectors. Covers AntD quirks (Chinese button spacing, portal dropdowns), table layout, and role-gated pages.
---

# 前端栈陷阱（React + AntDesign 5 / Vue3）

## Ant Design 5（Playwright 重灾区）
- **2 字符中文按钮自动插空格**（"导出"→"导 出"）→ `getByText('导出')` 失败。选择器用 `\s?` 正则：`/导\s?出/`、`/确\s?定/`、`/删\s?除/`。4 字符按钮不受影响。
- **Select/DatePicker portal 下拉** `.click()` 报 "outside of viewport" → 用 `dispatchEvent('click')`；用 `.ant-select-dropdown:not(.ant-select-dropdown-hidden)` 定位活动下拉。
- **多 Toast** → 选择器用 `.first()` 或精确匹配。

## 布局
- 表格列「主信息+辅助说明」纵向堆叠（`<div>`），禁止 `<Space>` 横排（换行致行高不齐）。

## E2E 选择器
- 行内定位用限定 helper（`opsCell(row)`）替代宽匹配 `row.locator('a')`。
- 角色门控页：E2E 用 `page.addInitScript` 预置角色（如 `combat-role=leader`），否则后端 `gradeGate()` 返回 403。

## 领域语言
中文枚举在 UI/代码/测试原样保留，不翻译。

## Vue3（ChatLab/RippleFlow）
Vue3 + Pinia + (NuxtUI)；前端 E2E 用 mock fixture/route 拦截，不连真实后端；Electron 场景用 CDP 连运行中实例（见 skill `electron-app`）。
