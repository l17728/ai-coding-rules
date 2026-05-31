// Deploy the rule system into Claude Code (user/global scope).
import fs from 'node:fs';
import path from 'node:path';
import { log } from './log.js';
import { contentDir, hooksSrcDir, copyDir, ensureDir, writeFile, rmrf, exists } from './util.js';
import {
  claudeConfigDir, claudeSkillsDir, claudeSettingsFile, claudeMemoryFile, claudeHooksDir,
} from './paths.js';
import {
  mergeClaudeHooks, removeClaudeHooks, upsertManagedBlock, removeManagedBlock,
} from './jsonmerge.js';

const MANAGED_DIR = 'ai-coding-rules'; // under ~/.claude/

function claudeHookDefs() {
  const dir = claudeHooksDir();
  const node = (script) => ({
    type: 'command',
    command: 'node',
    args: [path.join(dir, script)],
  });
  return {
    PreToolUse: [{ matcher: 'Bash', hooks: [node('ensure-commit.cjs')] }],
    Stop: [{ hooks: [node('verify-on-stop.cjs')] }],
    SessionStart: [{ hooks: [node('project-md-guard.cjs')] }],
  };
}

export function installClaude(ctx) {
  const cfgDir = claudeConfigDir();
  log.step(`Claude Code @ ${cfgDir}`);

  // 1) Constitution as a managed file, imported from CLAUDE.md (no clobber).
  const managedDir = path.join(cfgDir, MANAGED_DIR);
  ensureDir(managedDir, ctx);
  const constitution = fs.readFileSync(path.join(contentDir, 'CONSTITUTION.md'), 'utf8');
  writeFile(path.join(managedDir, 'CONSTITUTION.md'), constitution, ctx, { backupExisting: false });
  // User manual deployed alongside.
  writeFile(path.join(managedDir, 'MANUAL.md'),
    fs.readFileSync(path.join(contentDir, 'MANUAL.md'), 'utf8'), ctx, { backupExisting: false });
  upsertManagedBlock(
    claudeMemoryFile(),
    `# Global AI-coding constitution (managed by ai-coding-rules)\n@${MANAGED_DIR}/CONSTITUTION.md`,
    ctx,
  );
  log.ok('constitution installed (CLAUDE.md @import)');

  // 2) Skills.
  copyDir(path.join(contentDir, 'skills'), claudeSkillsDir(), ctx);
  log.ok(`skills installed -> ${claudeSkillsDir()}`);

  // 3) Hooks: copy scripts then register in settings.json.
  copyDir(hooksSrcDir, claudeHooksDir(), ctx);
  mergeClaudeHooks(claudeSettingsFile(), claudeHookDefs(), ctx);
  log.ok('hooks installed (PreToolUse / Stop / SessionStart)');
}

export function uninstallClaude(ctx) {
  const cfgDir = claudeConfigDir();
  log.step(`Claude Code @ ${cfgDir}`);
  removeManagedBlock(claudeMemoryFile(), ctx);
  rmrf(path.join(cfgDir, MANAGED_DIR), ctx);
  // Remove only our skills (those present in content/skills).
  for (const name of fs.readdirSync(path.join(contentDir, 'skills'))) {
    rmrf(path.join(claudeSkillsDir(), name), ctx);
  }
  removeClaudeHooks(claudeSettingsFile(), ctx);
  rmrf(claudeHooksDir(), ctx);
  log.ok('Claude Code: removed');
}

export function claudeManualPath() {
  return path.join(claudeConfigDir(), MANAGED_DIR, 'MANUAL.md');
}

export function statusClaude() {
  const installed = exists(path.join(claudeConfigDir(), MANAGED_DIR, 'CONSTITUTION.md'));
  const skills = exists(claudeSkillsDir())
    ? fs.readdirSync(path.join(contentDir, 'skills')).filter((n) => exists(path.join(claudeSkillsDir(), n))).length
    : 0;
  return { installed, skills };
}
