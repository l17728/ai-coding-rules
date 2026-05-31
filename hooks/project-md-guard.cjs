#!/usr/bin/env node
/* ai-coding-rules — Claude Code SessionStart hook: "盯死项目 md". When the cwd
 * is a real project but lacks CLAUDE.md/AGENTS.md (or its per-stack references
 * aren't pinned), inject context nudging the agent to run project-cold-start /
 * pin-project-md so the cold-start references get copied in. Non-blocking. */
const fs = require('fs');
const path = require('path');

let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8')); } catch (_) {}
const cwd = input.cwd || process.cwd();
const has = (f) => { try { return fs.existsSync(path.join(cwd, f)); } catch (_) { return false; } };

const isProject = has('.git') || has('package.json') || has('go.mod') ||
  has('pyproject.toml') || has('requirements.txt') || has('Cargo.toml') || has('pom.xml');
if (!isProject) process.exit(0);

const stack = [];
if (has('package.json')) {
  try {
    const p = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
    const d = Object.assign({}, p.dependencies, p.devDependencies);
    if (d.electron) stack.push('electron-app');
    if (d.react || d.antd || d['ant-design'] || d.vue) stack.push('frontend-react-antd-vue');
    if (d.express || d.fastify || d['better-sqlite3']) stack.push('testing-methodology');
  } catch (_) {}
}
if (has('go.mod')) stack.push('backend-go-gorm');
if (has('pyproject.toml') || has('requirements.txt')) stack.push('architecture-db');

const hasMd = has('CLAUDE.md') || has('AGENTS.md');
const stackStr = stack.length ? ' Detected stack → pin: ' + [...new Set(stack)].join(', ') + '.' : '';
const msg = hasMd
  ? '[ai-coding-rules] Project md present. If per-stack references are not pinned, invoke `pin-project-md`.' + stackStr
  : '[ai-coding-rules] This project has NO CLAUDE.md/AGENTS.md. Invoke `project-cold-start` to scaffold them, then `pin-project-md` to copy/pin the per-stack reference skills.' + stackStr +
    ' (Global meta-rules already apply regardless.)';

process.stdout.write(JSON.stringify({
  hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: msg },
}));
process.exit(0);
