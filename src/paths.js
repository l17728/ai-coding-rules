// Cross-platform resolution of tool config directories.
// Claude Code: CLAUDE_CONFIG_DIR || ~/.claude
// opencode:    OPENCODE_CONFIG_DIR || (parsed from `opencode debug paths`) ||
//              XDG_CONFIG_HOME/opencode || ~/.config/opencode || %APPDATA%/opencode
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const home = os.homedir();

export function claudeConfigDir() {
  return process.env.CLAUDE_CONFIG_DIR
    ? path.resolve(process.env.CLAUDE_CONFIG_DIR)
    : path.join(home, '.claude');
}

// Parse the config dir out of `opencode debug paths` output (best, version-proof).
function opencodeDebugConfigDir() {
  try {
    const r = process.platform === 'win32'
      ? spawnSync('opencode debug paths', { encoding: 'utf8', timeout: 8000, shell: true })
      : spawnSync('opencode', ['debug', 'paths'], { encoding: 'utf8', timeout: 8000 });
    if (r.status !== 0 || !r.stdout) return null;
    // Output is key/path lines or JSON-ish; find a line mentioning "config".
    for (const line of r.stdout.split(/\r?\n/)) {
      const m = line.match(/config[^\S\r\n]*[:=]?\s*(.+)$/i);
      if (m) {
        const p = m[1].trim().replace(/^["']|["',]+$/g, '');
        // We want the directory, not a file.
        if (p && fs.existsSync(p)) {
          return fs.statSync(p).isDirectory() ? p : path.dirname(p);
        }
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function opencodeConfigDir() {
  if (process.env.OPENCODE_CONFIG_DIR) return path.resolve(process.env.OPENCODE_CONFIG_DIR);

  const fromDebug = opencodeDebugConfigDir();
  if (fromDebug) return fromDebug;

  const candidates = [];
  if (process.env.XDG_CONFIG_HOME) candidates.push(path.join(process.env.XDG_CONFIG_HOME, 'opencode'));
  candidates.push(path.join(home, '.config', 'opencode')); // opencode uses XDG layout even on Windows
  if (process.platform === 'win32' && process.env.APPDATA) {
    candidates.push(path.join(process.env.APPDATA, 'opencode'));
  }
  // Prefer an existing one (with opencode.json), else first candidate.
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'opencode.json')) || fs.existsSync(path.join(dir, 'opencode.jsonc'))) {
      return dir;
    }
  }
  return candidates[0];
}

export const claudeSkillsDir = () => path.join(claudeConfigDir(), 'skills');
export const claudeSettingsFile = () => path.join(claudeConfigDir(), 'settings.json');
export const claudeMemoryFile = () => path.join(claudeConfigDir(), 'CLAUDE.md');
export const claudeHooksDir = () => path.join(claudeConfigDir(), 'hooks', 'ai-coding-rules');

export const opencodeSkillsDir = () => path.join(opencodeConfigDir(), 'skills');
export const opencodeAgentsFile = () => path.join(opencodeConfigDir(), 'AGENTS.md');
export const opencodePluginDir = () => path.join(opencodeConfigDir(), 'plugin');
export const opencodeConfigFile = () => path.join(opencodeConfigDir(), 'opencode.json');
