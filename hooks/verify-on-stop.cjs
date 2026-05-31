#!/usr/bin/env node
/* ai-coding-rules — Claude Code Stop hook: enforce "完工必验证" (verify before
 * claiming done). Generic verification is project-specific, so this runs the
 * command declared in the project's .ai-coding.json {"verify":"npm test"}.
 * If it fails, the turn is blocked so the agent must fix and re-verify.
 * Respects stop_hook_active to avoid loops. CommonJS for portability. */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8')); } catch (_) {}
if (input.stop_hook_active) process.exit(0); // already re-entered; don't loop
const cwd = input.cwd || process.cwd();

let cfg = null;
try { cfg = JSON.parse(fs.readFileSync(path.join(cwd, '.ai-coding.json'), 'utf8')); } catch (_) {}
const verify = cfg && cfg.verify;

if (!verify) {
  // Cannot verify generically — non-blocking reminder only.
  process.stdout.write(JSON.stringify({
    systemMessage: '[ai-coding-rules] Completion not gated: add .ai-coding.json {"verify":"<test cmd>"} to enforce verify-before-done.',
  }));
  process.exit(0);
}

const cmdStr = Array.isArray(verify) ? verify.join(' ') : String(verify);
try {
  execSync(cmdStr, { cwd, stdio: ['ignore', 'pipe', 'pipe'], timeout: cfg.verifyTimeoutMs || 600000 });
  process.exit(0); // verification passed — allow stop
} catch (e) {
  const out = ((e.stdout && e.stdout.toString()) || '') + ((e.stderr && e.stderr.toString()) || '');
  process.stdout.write(JSON.stringify({
    decision: 'block',
    reason: '[ai-coding-rules] Verification "' + cmdStr + '" FAILED. Do not stop — fix and re-verify. Output tail:\n' + out.slice(-1500),
  }));
  process.exit(0);
}
