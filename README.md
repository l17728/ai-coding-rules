# ai-coding-rules

A cross-platform (**Windows / Linux / macOS**) installer that deploys a **dual-system AI-coding engineering rule system** into **Claude Code** and **opencode** — globally, for all projects. If both tools are present, both are configured.

It installs four layers:

| Layer | What | How it lands |
|-------|------|--------------|
| **Constitution** | ~15 always-on meta-rules (parallelize, recursive-fix, TDD, verify-before-claim, commit-before-deploy…) | Claude `~/.claude/CLAUDE.md` `@import`; opencode global `AGENTS.md` + `instructions` |
| **Skills (16)** | Auto-triggering procedures + per-stack references | `~/.claude/skills/` (opencode reads this dir natively) |
| **Hooks** | Deterministic enforcement: block-deploy-if-uncommitted, verify-before-done, project-md guard | Claude `settings.json`; opencode `plugin/` |
| **Manual** | On-machine user guide | deployed per tool; `ai-coding-rules manual` |

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

## Publish
```bash
npm version patch
npm publish --access public
```
Iterate content under `content/` (constitution, skills, manual) and `hooks/`, bump version, republish; users re-run `install` (idempotent, backs up).

## Uninstall / rollback
`uninstall` removes the managed block, managed dir, the 16 skills, our hook entries from `settings.json`, the opencode plugin, and our `instructions` entry. Manually-edited files keep a `*.bak-ai-coding-rules` backup.

MIT.
