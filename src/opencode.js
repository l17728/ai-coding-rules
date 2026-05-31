// Deploy the rule system into opencode (user/global scope).
import fs from 'node:fs';
import path from 'node:path';
import { log } from './log.js';
import { contentDir, hooksSrcDir, copyDir, ensureDir, writeFile, rmrf, exists } from './util.js';
import {
  opencodeConfigDir, opencodeSkillsDir, opencodeAgentsFile, opencodePluginDir, opencodeConfigFile,
} from './paths.js';
import {
  addOpencodeInstruction, removeOpencodeInstruction, upsertManagedBlock, removeManagedBlock,
} from './jsonmerge.js';
import { claudeSkillsDir } from './paths.js';

const MANAGED_DIR = 'ai-coding-rules';
const PLUGIN_NAME = 'ai-coding-rules.js';

// opencode natively reads ~/.claude/skills. If Claude already got the skills,
// installing again into opencode's own dir would double-register them.
function opencodeNeedsOwnSkills(claudeInstalled) {
  return !claudeInstalled;
}

export function installOpencode(ctx, { claudeInstalled }) {
  const cfgDir = opencodeConfigDir();
  log.step(`opencode @ ${cfgDir}`);

  // 1) Constitution: managed file + opencode.json instructions + AGENTS.md safety net.
  const managedDir = path.join(cfgDir, MANAGED_DIR);
  ensureDir(managedDir, ctx);
  const constitution = fs.readFileSync(path.join(contentDir, 'CONSTITUTION.md'), 'utf8');
  const constFile = path.join(managedDir, 'CONSTITUTION.md');
  writeFile(constFile, constitution, ctx, { backupExisting: false });
  writeFile(path.join(managedDir, 'MANUAL.md'),
    fs.readFileSync(path.join(contentDir, 'MANUAL.md'), 'utf8'), ctx, { backupExisting: false });
  addOpencodeInstruction(opencodeConfigFile(), constFile, ctx);
  // AGENTS.md safety net (inline core rules so it works even if instructions is ignored).
  const agentsCore = fs.readFileSync(path.join(contentDir, 'opencode-AGENTS-core.md'), 'utf8');
  upsertManagedBlock(opencodeAgentsFile(), agentsCore, ctx);
  log.ok('constitution installed (instructions + AGENTS.md)');

  // 2) Skills.
  if (opencodeNeedsOwnSkills(claudeInstalled)) {
    copyDir(path.join(contentDir, 'skills'), opencodeSkillsDir(), ctx);
    log.ok(`skills installed -> ${opencodeSkillsDir()}`);
  } else {
    log.ok(`skills shared from Claude (${claudeSkillsDir()}) — opencode reads it natively`);
  }

  // 3) Hooks via plugin (auto-loaded from plugin/ dir).
  ensureDir(opencodePluginDir(), ctx);
  const plugin = fs.readFileSync(path.join(hooksSrcDir, 'opencode-plugin.js'), 'utf8');
  writeFile(path.join(opencodePluginDir(), PLUGIN_NAME), plugin, ctx, { backupExisting: false });
  log.ok('hooks installed (opencode plugin: tool.execute.before + session.idle)');
}

export function uninstallOpencode(ctx) {
  const cfgDir = opencodeConfigDir();
  log.step(`opencode @ ${cfgDir}`);
  removeManagedBlock(opencodeAgentsFile(), ctx);
  removeOpencodeInstruction(opencodeConfigFile(), path.join(cfgDir, MANAGED_DIR, 'CONSTITUTION.md'), ctx);
  rmrf(path.join(cfgDir, MANAGED_DIR), ctx);
  if (exists(opencodeSkillsDir())) {
    for (const name of fs.readdirSync(path.join(contentDir, 'skills'))) {
      rmrf(path.join(opencodeSkillsDir(), name), ctx);
    }
  }
  rmrf(path.join(opencodePluginDir(), PLUGIN_NAME), ctx);
  log.ok('opencode: removed');
}

export function opencodeManualPath() {
  return path.join(opencodeConfigDir(), MANAGED_DIR, 'MANUAL.md');
}

export function statusOpencode() {
  const installed = exists(path.join(opencodeConfigDir(), MANAGED_DIR, 'CONSTITUTION.md'));
  const plugin = exists(path.join(opencodePluginDir(), PLUGIN_NAME));
  return { installed, plugin };
}
