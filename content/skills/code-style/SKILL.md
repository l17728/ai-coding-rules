---
name: code-style
description: Use when writing code in any language. Cross-language style: strict typing, no as-any/ts-ignore, import grouping, naming conventions, error wrapping, log levels, and pre-commit quality gates.
---

# 代码风格（跨语言）

## 通用
严格类型检查始终开启；禁 `as any`/`@ts-ignore`/空 catch；导入分组（标准库→外部→内部），类型用 `import type`；行宽 ≤120；不主动加注释除非要求。

## 命名
文件 camelCase(TS/Go)/snake_case(Py) ｜ 组件/类 PascalCase ｜ 函数/变量 camelCase/snake_case ｜ 常量 UPPER_SNAKE_CASE ｜ CLI kebab-case 或 `nodes:list` ｜ 测试 `Test{功能}_{场景}`。

## 错误处理
包装上下文：`fmt.Errorf("ctx: %w", err)` / `new Error("ctx: "+err.message)`；不忽略错误返回值。
日志级别：DEBUG(细节)/INFO(生命周期)/WARN(可恢复)/ERROR(不可恢复)，均带上下文字段。

## commit 前门禁
- [ ] 格式化（`make fmt`/`pnpm format`）
- [ ] 静态分析（`make vet`/`pnpm lint`）
- [ ] 测试通过（`make test`/`pnpm test`）
- [ ] 新功能有测试
- [ ] 配置变更同步 example 文件
- [ ] 删测试通过 CI = 犯规
