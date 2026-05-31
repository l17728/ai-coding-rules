/* ai-coding-rules — opencode plugin (ESM, loaded by opencode from plugin/).
 * Parity with the Claude PreToolUse deploy guard: block deploy-like bash
 * commands when the git working tree is dirty. opencode auto-triggers the
 * skills for the rest (verify, project-md guard), which carry the workflows. */
const DEPLOY = /(deploy-direct|docker\s+cp|gh\s+release\s+create|git\s+push[^\n]*\b(tag|--tags|v\d)|kubectl\s+apply|helm\s+upgrade|systemctl\s+restart|\bdeploy\b)/i;

export const AiCodingRules = async ({ $, directory }) => {
  return {
    'tool.execute.before': async (input, output) => {
      if (input.tool !== 'bash') return;
      const cmd = (output.args && (output.args.command || output.args.cmd)) || '';
      if (!DEPLOY.test(cmd)) return;
      try {
        const inRepo = (await $`git rev-parse --is-inside-work-tree`.cwd(directory).quiet().text()).trim() === 'true';
        if (!inRepo) return;
        const dirty = (await $`git status --porcelain`.cwd(directory).quiet().text()).trim();
        if (dirty) {
          throw new Error(
            '[ai-coding-rules] Deploy blocked: uncommitted changes. Deploy packages only include ' +
            'COMMITTED files. Run `git add -A && git commit`, then redeploy.');
        }
      } catch (e) {
        if (String((e && e.message) || '').startsWith('[ai-coding-rules]')) throw e;
        // git missing / shell error — do not block
      }
    },
  };
};
