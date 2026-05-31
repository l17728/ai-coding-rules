// Filesystem helpers shared by deployers. All respect ctx.dryRun.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { log } from './log.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const pkgRoot = path.resolve(__dirname, '..');
export const contentDir = path.join(pkgRoot, 'content');
export const hooksSrcDir = path.join(pkgRoot, 'hooks');

export function ensureDir(dir, ctx) {
  if (fs.existsSync(dir)) return;
  if (ctx.dryRun) return log.plan(`mkdir -p ${dir}`);
  fs.mkdirSync(dir, { recursive: true });
}

// Backup a file once before first modification this run.
function backup(file, ctx) {
  if (!fs.existsSync(file)) return;
  const bak = `${file}.bak-ai-coding-rules`;
  if (fs.existsSync(bak)) return;
  if (ctx.dryRun) return log.plan(`backup ${file} -> ${bak}`);
  fs.copyFileSync(file, bak);
}

export function writeFile(file, data, ctx, { backupExisting = true } = {}) {
  if (backupExisting) backup(file, ctx);
  if (ctx.dryRun) return log.plan(`write ${file} (${Buffer.byteLength(data)} bytes)`);
  ensureDir(path.dirname(file), ctx);
  fs.writeFileSync(file, data);
}

// Recursively copy a directory tree (used for skills). Overwrites files.
export function copyDir(src, dst, ctx) {
  if (!fs.existsSync(src)) throw new Error(`source missing: ${src}`);
  if (ctx.dryRun) {
    log.plan(`copy dir ${src} -> ${dst}`);
    return;
  }
  ensureDir(dst, ctx);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d, ctx);
    else fs.copyFileSync(s, d);
  }
}

export function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

export function rmrf(target, ctx) {
  if (!fs.existsSync(target)) return;
  if (ctx.dryRun) return log.plan(`remove ${target}`);
  fs.rmSync(target, { recursive: true, force: true });
}

export function exists(p) {
  return fs.existsSync(p);
}
