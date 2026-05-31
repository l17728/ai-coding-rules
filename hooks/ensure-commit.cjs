#!/usr/bin/env node
/* ai-coding-rules — Claude Code PreToolUse(Bash) hook: block deploy if the
 * working tree has uncommitted changes. `git archive HEAD` and most deploy
 * packers only include COMMITTED files, so uncommitted work silently fails to
 * ship. Conservative: only fires on deploy-like commands, only blocks if dirty.
 * CommonJS (.cjs) so it runs regardless of surrounding package.json type. */
const fs = require('fs');
const { execSync } = require('child_process');

let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8')); } catch (_) {}
const cmd = (input.tool_input && input.tool_input.command) || '';
const cwd = input.cwd || process.cwd();

const DEPLOY = /(deploy-direct|docker\s+cp|gh\s+release\s+create|git\s+push[^\n]*\b(tag|--tags|v\d)|kubectl\s+apply|helm\s+upgrade|systemctl\s+restart|\bdeploy\b)/i;
if (!DEPLOY.test(cmd)) process.exit(0);

try {
  const inRepo = execSync('git rev-parse --is-inside-work-tree', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
    .toString().trim() === 'true';
  if (!inRepo) process.exit(0);
  const dirty = execSync('git status --porcelain', { cwd, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  if (dirty) {
    process.stderr.write(
      '[ai-coding-rules] Deploy blocked: uncommitted changes present.\n' +
      'Deploy packers (git archive HEAD, etc.) only include COMMITTED files — ' +
      'uncommitted work will NOT ship and is the #1 cause of "deployed but nothing changed".\n' +
      'Commit first:  git add -A && git commit -m "..."  then re-run the deploy.\n');
    process.exit(2); // exit 2 = block, stderr shown to the agent
  }
} catch (_) {
  process.exit(0); // git missing or other error: do not block
}
process.exit(0);
