// Targeted, backup-safe merges into settings.json (Claude hooks) and
// opencode.json (instructions). We never rewrite unrelated keys.
import fs from 'node:fs';
import { log } from './log.js';
import { readJSON, writeFile } from './util.js';

export const HOOK_MARKER = 'ai-coding-rules'; // present in our hook script paths

// Merge Claude hook definitions into settings.json without duplicating.
// hookDefs: { EventName: [ {matcher?, hooks:[{type:'command',command,args}]} ] }
export function mergeClaudeHooks(settingsFile, hookDefs, ctx) {
  const cfg = readJSON(settingsFile) || {};
  cfg.hooks = cfg.hooks || {};
  let changed = false;

  const entryUsesOurScript = (entry) =>
    (entry.hooks || []).some((h) =>
      (h.args || []).some((a) => String(a).includes(HOOK_MARKER)) ||
      String(h.command || '').includes(HOOK_MARKER));

  for (const [event, defs] of Object.entries(hookDefs)) {
    cfg.hooks[event] = cfg.hooks[event] || [];
    for (const def of defs) {
      if (cfg.hooks[event].some(entryUsesOurScript) && cfg.hooks[event].some(
        (e) => JSON.stringify(e) === JSON.stringify(def))) {
        continue; // identical entry already present
      }
      // Remove any prior version of OUR entry for this event, then add fresh.
      cfg.hooks[event] = cfg.hooks[event].filter((e) => !entryUsesOurScript(e));
      cfg.hooks[event].push(def);
      changed = true;
    }
  }
  if (changed) writeFile(settingsFile, JSON.stringify(cfg, null, 2) + '\n', ctx);
  else log.info('  settings.json hooks already up to date');
  return changed;
}

export function removeClaudeHooks(settingsFile, ctx) {
  const cfg = readJSON(settingsFile);
  if (!cfg || !cfg.hooks) return false;
  let changed = false;
  for (const event of Object.keys(cfg.hooks)) {
    const before = cfg.hooks[event].length;
    cfg.hooks[event] = cfg.hooks[event].filter(
      (entry) => !(entry.hooks || []).some(
        (h) => (h.args || []).some((a) => String(a).includes(HOOK_MARKER)) ||
          String(h.command || '').includes(HOOK_MARKER)));
    if (cfg.hooks[event].length !== before) changed = true;
    if (cfg.hooks[event].length === 0) delete cfg.hooks[event];
  }
  if (changed) writeFile(settingsFile, JSON.stringify(cfg, null, 2) + '\n', ctx);
  return changed;
}

// Add an absolute instructions path to opencode.json (idempotent).
export function addOpencodeInstruction(configFile, instrPath, ctx) {
  let cfg = readJSON(configFile);
  const created = !cfg;
  cfg = cfg || { $schema: 'https://opencode.ai/config.json' };
  cfg.instructions = Array.isArray(cfg.instructions) ? cfg.instructions : [];
  if (!cfg.instructions.includes(instrPath)) {
    cfg.instructions.push(instrPath);
    writeFile(configFile, JSON.stringify(cfg, null, 2) + '\n', ctx);
    return true;
  }
  if (created) writeFile(configFile, JSON.stringify(cfg, null, 2) + '\n', ctx);
  log.info('  opencode.json instructions already up to date');
  return false;
}

export function removeOpencodeInstruction(configFile, instrPath, ctx) {
  const cfg = readJSON(configFile);
  if (!cfg || !Array.isArray(cfg.instructions)) return false;
  const before = cfg.instructions.length;
  cfg.instructions = cfg.instructions.filter((p) => p !== instrPath);
  if (cfg.instructions.length !== before) {
    writeFile(configFile, JSON.stringify(cfg, null, 2) + '\n', ctx);
    return true;
  }
  return false;
}

// Insert/replace a managed block delimited by markers in a markdown file,
// preserving any surrounding user content.
const BEGIN = '<!-- BEGIN ai-coding-rules (managed) -->';
const END = '<!-- END ai-coding-rules (managed) -->';
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const BEGIN_RE = reEsc(BEGIN);
const END_RE = reEsc(END);

export function upsertManagedBlock(mdFile, body, ctx) {
  let existing = '';
  try {
    existing = fs.readFileSync(mdFile, 'utf8');
  } catch {
    /* new file */
  }
  const block = `${BEGIN}\n${body}\n${END}`;
  let next;
  const re = new RegExp(`${BEGIN_RE}[\\s\\S]*?${END_RE}`);
  if (re.test(existing)) {
    next = existing.replace(re, block);
    if (next === existing) {
      log.info(`  ${mdFile} managed block already current`);
      return false;
    }
  } else {
    next = existing ? `${existing.replace(/\s*$/, '')}\n\n${block}\n` : `${block}\n`;
  }
  writeFile(mdFile, next, ctx);
  return true;
}

export function removeManagedBlock(mdFile, ctx) {
  let existing;
  try {
    existing = fs.readFileSync(mdFile, 'utf8');
  } catch {
    return false;
  }
  const re = new RegExp(`\\n*${BEGIN_RE}[\\s\\S]*?${END_RE}\\n*`);
  if (!re.test(existing)) return false;
  const next = existing.replace(re, '\n').replace(/^\n+/, '');
  writeFile(mdFile, next, ctx);
  return true;
}
