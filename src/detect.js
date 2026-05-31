// Detect installed tools and where they store config.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import {
  claudeConfigDir,
  opencodeConfigDir,
} from './paths.js';

function tryVersion(bin) {
  const win = process.platform === 'win32';
  try {
    // On Windows, pass a single command string (avoids DEP0190 from args+shell).
    const r = win
      ? spawnSync(`${bin} --version`, { encoding: 'utf8', timeout: 8000, shell: true })
      : spawnSync(bin, ['--version'], { encoding: 'utf8', timeout: 8000 });
    if (r.status === 0 && r.stdout) return r.stdout.trim().split(/\r?\n/)[0];
  } catch {
    /* ignore */
  }
  return null;
}

export function detectClaude() {
  const dir = claudeConfigDir();
  const version = tryVersion('claude');
  const present = version != null || fs.existsSync(dir);
  return { tool: 'claude', present, version, configDir: dir };
}

export function detectOpencode() {
  const dir = opencodeConfigDir();
  const version = tryVersion('opencode');
  const present = version != null || fs.existsSync(dir);
  return { tool: 'opencode', present, version, configDir: dir };
}

export function detectAll() {
  return { claude: detectClaude(), opencode: detectOpencode() };
}
