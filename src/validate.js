// `ai-coding-rules validate` — quality gate for a (re)authored ruleset.
// Checks structure + SKILL.md frontmatter + scans for leaked secrets, so an
// agent that just generated content/ + hooks/ can self-verify before packaging.
import fs from 'node:fs';
import path from 'node:path';
import { log, style } from './log.js';
import { contentDir, hooksSrcDir, exists } from './util.js';

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/; // opencode skill-name rule
// Secret-ish patterns. Tuned to avoid the docs that *talk about* secrets.
const SECRET_RES = [
  /\b(?:sk|pk|rk)-[A-Za-z0-9]{16,}\b/,             // openai-style keys
  /\bnpm_[A-Za-z0-9]{30,}\b/,                       // npm tokens
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,                 // github tokens
  /\bAKIA[0-9A-Z]{16}\b/,                           // aws access key id
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,               // slack tokens
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /["']?(?:api[_-]?key|apikey|secret|password|access[_-]?token|authorization)["']?\s*[:=]\s*["'][A-Za-z0-9._\-\/+]{16,}["']/i,
];

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim();
  }
  return fm;
}

function walkFiles(dir) {
  const out = [];
  if (!exists(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkFiles(p));
    else out.push(p);
  }
  return out;
}

export function runValidate() {
  const errors = [];
  const warnings = [];
  const ok = (m) => log.ok(m);

  // 1) Required top-level content.
  for (const f of ['CONSTITUTION.md', 'opencode-AGENTS-core.md', 'MANUAL.md']) {
    const p = path.join(contentDir, f);
    if (!exists(p)) errors.push(`missing content/${f}`);
    else if (fs.readFileSync(p, 'utf8').trim().length < 50) warnings.push(`content/${f} looks too short`);
  }
  // Constitution should stay thin.
  const constP = path.join(contentDir, 'CONSTITUTION.md');
  if (exists(constP)) {
    const lines = fs.readFileSync(constP, 'utf8').split(/\r?\n/).length;
    if (lines > 120) warnings.push(`CONSTITUTION.md is ${lines} lines — keep the constitution thin (<~120); push detail into skills`);
  }

  // 2) Skills: structure + frontmatter.
  const skillsDir = path.join(contentDir, 'skills');
  if (!exists(skillsDir)) errors.push('missing content/skills/');
  let skillCount = 0;
  if (exists(skillsDir)) {
    for (const dirent of fs.readdirSync(skillsDir, { withFileTypes: true })) {
      if (!dirent.isDirectory()) continue;
      skillCount++;
      const folder = dirent.name;
      const skillFile = path.join(skillsDir, folder, 'SKILL.md');
      if (!exists(skillFile)) { errors.push(`skills/${folder}/ has no SKILL.md`); continue; }
      const fm = parseFrontmatter(fs.readFileSync(skillFile, 'utf8'));
      if (!fm) { errors.push(`skills/${folder}/SKILL.md: missing YAML frontmatter`); continue; }
      if (!fm.name) errors.push(`skills/${folder}: frontmatter has no name`);
      else {
        if (!NAME_RE.test(fm.name)) errors.push(`skills/${folder}: name "${fm.name}" must be ascii lowercase + single hyphens (opencode rule)`);
        if (fm.name.length > 64) errors.push(`skills/${folder}: name >64 chars`);
        if (fm.name !== folder) warnings.push(`skills/${folder}: folder name != frontmatter name "${fm.name}"`);
      }
      if (!fm.description) errors.push(`skills/${folder}: frontmatter has no description (drives auto-trigger)`);
      else if (!/\buse\b|用于|当|使用|触发|before|after|when/i.test(fm.description)) warnings.push(`skills/${folder}: description should read like a trigger ("Use when …")`);
    }
  }
  if (skillCount === 0) errors.push('no skills found under content/skills/');

  // 3) Hooks present.
  for (const h of ['ensure-commit.cjs', 'verify-on-stop.cjs', 'project-md-guard.cjs', 'opencode-plugin.js']) {
    if (!exists(path.join(hooksSrcDir, h))) warnings.push(`hook ${h} not found (ok if you intentionally removed it; update src/claude.js accordingly)`);
  }

  // 4) Secret scan over shipped content + hooks.
  const scanRoots = [contentDir, hooksSrcDir];
  for (const root of scanRoots) {
    for (const file of walkFiles(root)) {
      const text = fs.readFileSync(file, 'utf8');
      for (const re of SECRET_RES) {
        const hit = text.match(re);
        if (hit) {
          errors.push(`possible SECRET in ${path.relative(contentDir, file)}: "${hit[0].slice(0, 24)}…" — never ship credentials in rules`);
          break;
        }
      }
    }
  }

  // Report.
  log.header(`Validation: ${skillCount} skills checked`);
  warnings.forEach((w) => log.warn(w));
  if (errors.length === 0) {
    ok('No blocking issues.' + (warnings.length ? ` (${warnings.length} warning${warnings.length > 1 ? 's' : ''})` : ''));
    log.info('Next: ' + style.cyan('ai-coding-rules install --dry-run') + ' then a temp-dir install to fully verify.');
    return 0;
  }
  log.header(style.red(`${errors.length} blocking issue(s):`));
  errors.forEach((e) => log.err(e));
  return 1;
}
