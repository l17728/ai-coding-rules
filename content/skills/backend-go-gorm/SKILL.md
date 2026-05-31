---
name: backend-go-gorm
description: Use when writing Go code, especially with GORM or goroutines/concurrency. Covers GORM bool zero-value, SQLite UTC, WaitGroup discipline, race testing, route ordering, and ldflags.
---

# Go / GORM / 并发陷阱

## GORM
- **bool 零值被忽略**：`IsActive:false` 在 Create 时当零值跳过，写入默认 true。修复：Create 后显式两步 `SetActive(false)`。举一反三：搜所有 `default:true` bool 字段。
- **SQLite 时区**：非 UTC 系统时间过滤返回 0。强制 `CreatedAt.UTC()`，所有时间过滤统一 `toUTC()`。

## 并发（铁律）
- **WaitGroup 跟踪主循环**：长生命周期 goroutine（含主循环本身）必须 `wg.Add(1)`+入口 `defer wg.Done()`。
- **time.Sleep 不是同步**：race 是架构问题→理解→结构性修复→`go test -race -count=10` 验证。绝不用 Sleep 修 race。
- **测试 goroutine logger** 用 `zap.NewNop()`，不要注入 `zaptest.NewLogger()`（异步写触发 data race）。

## HTTP / 构建
- 参数化路由：更具体的先注册（`/api/nodes/:nodeType` 在 `/api/nodes/:id` 之前）。
- ldflags 模块路径必须与 go.mod 完全一致，否则版本号显示 dev。

## 测试
`setupXxxTest(t)`+`t.Helper()`；三层 E2E（httptest/真实进程/手动）；`-race -count=10`；cleanup 用 `context.WithCancel`+`defer cancel()`，返回前 `cancel()` 后 `Wait()`，`defer srv.Close()`。
