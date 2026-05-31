# ai-coding-rules

A cross-platform (**Windows / Linux / macOS**) installer that deploys a **dual-system AI-coding engineering rule system** into **Claude Code** and **opencode** — globally, for all projects. If both tools are present, both are configured.

It installs four layers:

| Layer | What | How it lands |
|-------|------|--------------|
| **Constitution** | ~15 always-on meta-rules (parallelize, recursive-fix, TDD, verify-before-claim, commit-before-deploy…) | Claude `~/.claude/CLAUDE.md` `@import`; opencode global `AGENTS.md` + `instructions` |
| **Skills (16)** | Auto-triggering procedures + per-stack references | `~/.claude/skills/` (opencode reads this dir natively) |
| **Hooks** | Deterministic enforcement: block-deploy-if-uncommitted, verify-before-done, project-md guard | Claude `settings.json`; opencode `plugin/` |
| **Manual** | On-machine user guide | deployed per tool; `ai-coding-rules manual` |

## Overview / 全景

**Provenance.** This ruleset wasn't hand-written — it was *distilled* from real Claude Code + opencode sessions, project `CLAUDE.md`/`AGENTS.md`, memories, and post-mortems, then layered. Every rule is tagged **🟢 universal engineering principle** or **🟡 this author's preference**, so forks can keep the former and re-tune the latter.

**The full pipeline:**

```
distill (sessions · project md · memories · post-mortems)
  → 4-layer ruleset (constitution · skills · hooks · manual)
    → installer (this npm tool — dual-system: Claude Code + opencode)
      → open source (npm + GitHub)
        → meta-production (clone → docs/AUTHORING-RULES.md + `validate` + agent Runbook → your own ruleset)
          → token-free CI (GitHub Release → OIDC Trusted Publishing, with provenance)
            → fork identity isolation (publish under your own account/scope)
```

The loop closes with the **`system-improvement-loop`** skill: new lessons → distill again → bump → republish.

> 中文：本规则集**并非手写**，而是从真实的 Claude Code + opencode 会话、项目 `CLAUDE.md`/`AGENTS.md`、记忆与复盘中**蒸馏**并分层而来；每条标注 **🟢 普适工程原则** 或 **🟡 本作者偏好**，便于 fork 时保留前者、重调后者。
> 全链路：**蒸馏（会话/项目文档/记忆/复盘）→ 四层规则（宪法·技能·钩子·手册）→ 安装器（双系统：Claude Code + opencode）→ npm/GitHub 开源 → 元生产（clone + `validate` + Agent Runbook）→ 免 token CI（Release → OIDC Trusted Publishing，带 provenance）→ fork 身份隔离（用你自己的账户/scope 发布）**。
> 闭环由 **`system-improvement-loop`** 技能驱动：新教训 → 再蒸馏 → 升版 → 重发。

## Install

### From npm

```bash
# one-off
npx @decklijia/ai-coding-rules install

# or globally, for a persistent command
npm i -g @decklijia/ai-coding-rules
ai-coding-rules install
```

### From a GitHub clone

No npm install needed — the program is zero-dependency (pure Node built-ins).

```bash
git clone https://github.com/l17728/ai-coding-rules.git
cd ai-coding-rules

# Linux / macOS
node bin/cli.js install          # or: scripts/install.sh install
# Windows (PowerShell)
node bin\cli.js install          # or: powershell -ExecutionPolicy Bypass -File scripts\install.ps1 install
```

The bootstrap scripts (`scripts/install.sh`, `scripts/install.ps1`) just forward to `bin/cli.js`, so any command/flag works: `install`, `uninstall`, `status`, `manual`, `--dry-run`, `--tools=`, `--force`. Requires Node >= 18.

Preview first with `--dry-run`. The installer **never clobbers** your files: it edits markdown via a managed block, merges JSON keys only, and backs up any touched file to `*.bak-ai-coding-rules`.

## Commands

```
ai-coding-rules status                 # detected tools + install state
ai-coding-rules install [--dry-run]    # deploy (preview with -n)
ai-coding-rules install --tools=opencode
ai-coding-rules install --force        # pre-stage even if a tool isn't detected yet
ai-coding-rules uninstall              # clean removal (restores via managed-block/JSON edits)
ai-coding-rules manual                 # path to the installed manual
ai-coding-rules validate               # authoring: lint ruleset frontmatter/structure + secret scan
```

## What "no tool detected" does
If neither Claude Code nor opencode is found, `install` prints how to install each (`npm i -g @anthropic-ai/claude-code`, `npm i -g opencode-ai`) and exits non-zero. Use `--force` to pre-stage the rules into the default config dirs so they activate as soon as the tool is installed.

## How it works per tool

**Claude Code** (`CLAUDE_CONFIG_DIR` or `~/.claude`)
- `CLAUDE.md` ← managed block `@import ai-coding-rules/CONSTITUTION.md`
- `skills/<16>/SKILL.md` ← auto-triggering skills
- `hooks/ai-coding-rules/*.cjs` + `settings.json` hooks (PreToolUse / Stop / SessionStart)

**opencode** (resolved via `opencode debug paths`, `OPENCODE_CONFIG_DIR`, or `~/.config/opencode`)
- global `AGENTS.md` ← managed core rules; `opencode.json` `instructions` ← CONSTITUTION.md
- skills: shared from `~/.claude/skills` when Claude is present (opencode reads it natively); otherwise copied to opencode's own `skills/`
- `plugin/ai-coding-rules.js` ← deploy-safety hook (`tool.execute.before`)

## Per-project verification gate (optional)
Drop `.ai-coding.json` in a project root to make the Stop hook enforce "verify before done":
```json
{ "verify": "npm test" }
```
On stop, the command runs; if it fails, the turn is blocked until fixed (loop-guarded).

## Cross-platform notes
- Hooks for Claude are `.cjs` (run as CommonJS regardless of surrounding `package.json`), invoked as `node <script>` (exec form) — portable across Windows/POSIX.
- opencode's Windows config dir varies by version; the installer resolves it via `opencode debug paths` and falls back to `OPENCODE_CONFIG_DIR` / XDG / `%APPDATA%`.

## Build your own ruleset (meta-production — clone this repo)

This published npm package is **the tool itself**. Authoring a *new* ruleset is a separate, repo-only workflow: **`git clone` this project**, distill rules from your own data, and republish **under your own identity**. Full methodology + an agent Runbook: **[docs/AUTHORING-RULES.md](https://github.com/l17728/ai-coding-rules/blob/main/docs/AUTHORING-RULES.md)**.

### Quick start

```bash
git clone https://github.com/l17728/ai-coding-rules.git && cd ai-coding-rules
# 1) Distill rules into content/ + hooks/ (follow docs/AUTHORING-RULES.md, or feed the Runbook to an agent)
# 2) Validate: structure + skill frontmatter + secret scan
node bin/cli.js validate
# 3) Dry-run install (writes nothing) to self-check
node bin/cli.js install --dry-run
# 4) Make it YOURS (see checklist below), then publish
npm version patch && npm publish --access public      # or via CI / GitHub Release
```

### ⚠️ Make it yours before publishing — do NOT reuse the original author's identity

Forking means **publishing under your own account**, not `@decklijia` / `l17728`. Change all of:

- **`package.json` → `name`**: use **your own npm scope/name**, e.g. `@youruser/your-rules` (publishing to `@decklijia/...` will be rejected — you don't own it).
- **`package.json` → `author` / `repository` / `homepage` / `bugs`**: point to **your** name and **your** GitHub repo.
- **GitHub repo**: push to **your own** repo (`git remote set-url origin https://github.com/youruser/your-repo.git`).
- **npm account**: log in as **yourself** (`npm login`) — or, for CI, configure **Trusted Publishing on *your* npm package** pointing at **your** repo + `publish.yml` (see the Publish section; the bundled workflow's example owner/repo must be replaced with yours).
- **`LICENSE`**: update the copyright holder.

> 中文：fork 后必须**用你自己的身份发布**，不要沿用原作者（`@decklijia` / `l17728`）。务必修改：
> - `package.json` 的 **`name`** 改成**你自己的 npm scope**（如 `@你的用户名/你的包名`；发到 `@decklijia/...` 会被拒，你没有权限）。
> - `package.json` 的 **`author`/`repository`/`homepage`/`bugs`** 指向**你的**名字和**你的** GitHub 仓库。
> - **GitHub 远程**改成你自己的仓库（`git remote set-url origin <你的仓库>`）。
> - **npm 账户**用你自己的（`npm login`）；若走 CI，在**你自己的 npm 包**上配 Trusted Publisher，指向**你的**仓库与 `publish.yml`（`.github/workflows/publish.yml` 里示例的 owner/repo 也要换成你的）。
> - 更新 **`LICENSE`** 的版权人。

(The authoring **guide** lives in the git repo only — `docs/` is excluded from the npm tarball, keeping the published package = the tool. `validate` ships in the package but is meaningful only when authoring.)

## Publish

Automated (recommended): a GitHub Actions workflow (`.github/workflows/publish.yml`) publishes via **npm Trusted Publishing (OIDC) — no token**. One-time setup on npmjs.com (package → Settings → Trusted Publisher → GitHub Actions: `l17728/ai-coding-rules`, workflow `publish.yml`). Then:
```bash
npm version patch && git push --follow-tags     # bump + tag
# create a GitHub Release for that tag → CI validates + publishes
```

Manual:
```bash
npm version patch
npm publish --access public
```
Iterate content under `content/` (constitution, skills, manual) and `hooks/`, bump version, republish; users re-run `install` (idempotent, backs up).

## Uninstall / rollback
`uninstall` removes the managed block, managed dir, the 16 skills, our hook entries from `settings.json`, the opencode plugin, and our `instructions` entry. Manually-edited files keep a `*.bak-ai-coding-rules` backup.

MIT.
