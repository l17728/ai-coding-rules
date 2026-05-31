---
name: deploy-ops
description: Use when deploying or operating a service — deployment flows per stack, credential management, logging architecture, systemd, and incremental/hot-patch deploy techniques.
---

# 部署与运维

## 标准流程
开发→本机测试全绿→`git add -A && git commit`→部署脚本→现网验证→关 issue。
- Node SSH：`node deploy-direct.mjs <host> <user> <pass>`（凭据来自 `.env.deploy`）。
- Go：`make fmt && make test-race`→`git tag vX.Y.Z`→push→CI 交叉编译+Docker。
- Python 容器：docker cp 单文件热补丁 / 单服务 build / 全量 build 三档。
- Electron：`pnpm build:win`→asar 校验→`gh release create`。

## 铁律
部署前必 commit（`git archive HEAD` 只打包已提交文件）——已由 deploy 守护 hook 强制。

## 凭据
永不硬编码。`.env.deploy`(gitignored) / `${ENV_VAR}` 引用 / 生产经 systemd EnvironmentFile 注入。

## 日志
三层：结构化(文件)/审计(DB)/操作(DB)。级别 DEBUG/INFO/WARN/ERROR，带上下文字段(user_id,request_id)。查看：`ssh host 'tail -f …'`；`journalctl -u <svc> -n 50`。

## 进程
systemd：`Restart=always`、`EnvironmentFile=`、`NoNewPrivileges=true`、`ProtectSystem=strict`；drop-in 持久化环境变量。Windows：部署前 taskkill 旧进程，端口用 bind 检测。

## 增量
docker cp 热补丁；paramiko 远端 build 用 launch-detached 写哨兵+poll-only 轮询；容器内 npm CLI 可能需 `ln -sf` 软链。
