// Orchestrates install / uninstall / status across detected tools.
import { log, style } from './log.js';
import { installClaude, uninstallClaude, statusClaude, claudeManualPath } from './claude.js';
import { installOpencode, uninstallOpencode, statusOpencode, opencodeManualPath } from './opencode.js';

export async function runInstall(tools, det, ctx) {
  const claudeInstalled = tools.includes('claude');
  if (claudeInstalled) installClaude(ctx);
  if (tools.includes('opencode')) installOpencode(ctx, { claudeInstalled });

  log.header(ctx.dryRun ? 'Dry-run complete — nothing was written.' : 'Install complete.');
  if (!ctx.dryRun) {
    log.info('Manual:');
    if (claudeInstalled) log.info('  ' + claudeManualPath());
    if (tools.includes('opencode')) log.info('  ' + opencodeManualPath());
    log.info('Verify with: ' + style.cyan('ai-coding-rules status') + '  (or: ai-coding-rules manual)');
    log.info('Open a NEW session in each tool; ask "list your core meta-rules" to confirm.');
  }
}

export async function runUninstall(tools, det, ctx) {
  if (tools.includes('claude')) uninstallClaude(ctx);
  if (tools.includes('opencode')) uninstallOpencode(ctx);
  log.header(ctx.dryRun ? 'Dry-run complete.' : 'Uninstall complete.');
}

export function reportInstalled(det) {
  log.header('Installed state');
  if (det.claude.present) {
    const s = statusClaude();
    log.info(`  ${style.bold('claude')}    constitution: ${s.installed ? style.green('yes') : style.dim('no')}  skills: ${s.skills}`);
  }
  if (det.opencode.present) {
    const s = statusOpencode();
    log.info(`  ${style.bold('opencode')}  constitution: ${s.installed ? style.green('yes') : style.dim('no')}  plugin: ${s.plugin ? style.green('yes') : style.dim('no')}`);
  }
}
