---
name: electron-app
description: Use when developing, packaging, or releasing an Electron desktop app. Covers asar path crashes, CSP/inline handlers, prompt(), dependency pruning, CLAUDECODE env, Windows port detection, and CDP tests.
---

# Electron 桌面应用陷阱

- **打包路径崩溃**：打包后 `__dirname` 在只读 app.asar，写文件抛 ENOTDIR→退出。`app.isPackaged` 时所有写入用 `app.getPath('userData')` 下路径。
- **CSP 阻止 inline handler**：`script-src 'self'` 禁掉 `onclick=`。用 `data-*` + `addEventListener`。
- **`window.prompt()` 抛异常**：用自定义模态框（`confirm()`/`alert()` 可用）。
- **依赖 prune 崩溃**：electron-builder 漏遍历 transitive deps，删一个崩一个（`ms`、`jwa`）。`dependencies` 不要 prune/清理。发布前 asar 运行时缺口检测。
- **CLAUDECODE 环境变量**：从 Claude Code 派生子进程会继承它致拒启动。spawn 前 `delete spawnEnv.CLAUDECODE`。
- **Windows 端口检测**：退出后 CDP 端口 TIME_WAIT，connect 报空闲但 bind 报占用。用实际 bind（`net.createServer().listen`）检测。启动前 `taskkill` 旧 electron.exe。
- **E2E**：Playwright 经 CDP 连**运行中**的 Electron；每文件 `createTestWorkspace()`。
- **发布**：`pnpm build:win`→asar 校验→`gh release create`（fork 加 `--repo <owner>/<repo>`）。
