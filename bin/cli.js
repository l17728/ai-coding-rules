#!/usr/bin/env node
// ai-coding-rules — deploy a dual-system (Claude Code + opencode) AI-coding rule
// system globally: constitution + auto-triggering skills + enforcement hooks.
import { detectAll } from '../src/detect.js';
import { log, style } from '../src/log.js';

function parseArgs(argv) {
  const args = { _: [], tools: null, dryRun: false, yes: false, force: false };
  for (const a of argv) {
    if (a === '--dry-run' || a === '-n') args.dryRun = true;
    else if (a === '--yes' || a === '-y') args.yes = true;
    else if (a === '--force' || a === '-f') args.force = true;
    else if (a.startsWith('--tools=')) args.tools = a.slice(8).split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--help' || a === '-h') args._.push('help');
    else args._.push(a);
  }
  return args;
}

function installHints() {
  log.info('No Claude Code or opencode installation was detected. Install one (or both):');
  log.info(`  ${style.bold('Claude Code')}: npm i -g @anthropic-ai/claude-code   ${style.dim('(then run: claude)')}`);
  log.info(`  ${style.bold('opencode')}   : npm i -g opencode-ai                 ${style.dim('(or: curl -fsSL https://opencode.ai/install | bash)')}`);
  log.info(`Then re-run ${style.cyan('ai-coding-rules install')}.`);
  log.info(`Or pre-stage rules now to default config dirs with ${style.cyan('ai-coding-rules install --force')}`);
  log.info(`(they will be picked up once the tool is installed).`);
}

function printStatus(det) {
  log.header('Detected tools');
  for (const t of [det.claude, det.opencode]) {
    const tag = t.present ? style.green('present') : style.dim('not found');
    const ver = t.version ? style.dim(`(${t.version})`) : '';
    log.info(`  ${style.bold(t.tool.padEnd(9))} ${tag} ${ver}`);
    log.info(`    ${style.dim('config:')} ${t.configDir}`);
  }
}

function selectedTools(det, requested, force = false) {
  const chosen = [];
  const want = requested || ['claude', 'opencode'];
  if (want.includes('claude') && (det.claude.present || force)) chosen.push('claude');
  if (want.includes('opencode') && (det.opencode.present || force)) chosen.push('opencode');
  return chosen;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0] || 'help';
  const det = detectAll();

  if (cmd === 'help') {
    log.info(`${style.bold('ai-coding-rules')} — dual-system AI-coding rule installer

Usage:
  ai-coding-rules <command> [options]

Commands:
  install      Deploy global constitution, skills, hooks, and manual into detected tools
  uninstall    Remove everything this installer added
  status       Show detected tools and what is currently installed
  validate     Check a (re)authored ruleset: skill frontmatter, structure, secret scan
  manual       Show the path to the installed user manual

Options:
  --tools=claude,opencode   Limit to specific tools (default: all detected)
  --force, -f               Install even if a tool is not detected (pre-stage to default dir)
  --dry-run, -n             Print actions without writing anything
  --yes, -y                 Skip confirmation prompts
  --help, -h                Show this help

Examples:
  npx ai-coding-rules status
  npx ai-coding-rules install --dry-run
  npx ai-coding-rules install
  npx ai-coding-rules install --tools=opencode`);
    return;
  }

  if (cmd === 'status') {
    printStatus(det);
    const { reportInstalled } = await import('../src/install.js');
    reportInstalled(det);
    return;
  }

  if (cmd === 'install') {
    printStatus(det);
    const tools = selectedTools(det, args.tools, args.force);
    if (tools.length === 0) {
      log.header('Nothing to install');
      installHints();
      process.exitCode = 1;
      return;
    }
    if (args.force) {
      const forced = tools.filter((t) => !det[t].present);
      if (forced.length) log.warn(`--force: pre-staging into default config dir for not-yet-installed: ${forced.join(', ')}`);
    }
    const ctx = { dryRun: args.dryRun };
    log.header(`Installing into: ${tools.join(', ')}${args.dryRun ? style.dim(' (dry-run)') : ''}`);
    const { runInstall } = await import('../src/install.js');
    await runInstall(tools, det, ctx);
    return;
  }

  if (cmd === 'validate') {
    const { runValidate } = await import('../src/validate.js');
    process.exitCode = runValidate();
    return;
  }

  if (cmd === 'manual') {
    const { claudeManualPath } = await import('../src/claude.js');
    const { opencodeManualPath } = await import('../src/opencode.js');
    const fs = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    log.header('User manual');
    for (const [tool, p] of [['claude', claudeManualPath()], ['opencode', opencodeManualPath()]]) {
      const ok = fs.existsSync(p);
      log.info(`  ${style.bold(tool.padEnd(9))} ${ok ? p : style.dim(p + ' (not installed)')}`);
    }
    log.info(`\nPackage copy: ${fileURLToPath(new URL('../content/MANUAL.md', import.meta.url))}`);
    return;
  }

  if (cmd === 'uninstall') {
    const tools = selectedTools(det, args.tools);
    const ctx = { dryRun: args.dryRun };
    log.header(`Uninstalling from: ${tools.join(', ') || '(none)'}${args.dryRun ? style.dim(' (dry-run)') : ''}`);
    const { runUninstall } = await import('../src/install.js');
    await runUninstall(tools, det, ctx);
    return;
  }

  log.err(`Unknown command: ${cmd}`);
  process.exitCode = 1;
}

main().catch((e) => {
  log.err(e?.stack || String(e));
  process.exitCode = 1;
});
