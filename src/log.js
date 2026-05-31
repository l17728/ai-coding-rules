// Minimal cross-platform logger with dry-run awareness and no external deps.
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);

export const style = {
  bold: (s) => c('1', s),
  dim: (s) => c('2', s),
  green: (s) => c('32', s),
  yellow: (s) => c('33', s),
  red: (s) => c('31', s),
  cyan: (s) => c('36', s),
};

export const log = {
  info: (m) => console.log(m),
  step: (m) => console.log(`${style.cyan('•')} ${m}`),
  ok: (m) => console.log(`${style.green('✓')} ${m}`),
  warn: (m) => console.log(`${style.yellow('!')} ${m}`),
  err: (m) => console.error(`${style.red('✗')} ${m}`),
  plan: (m) => console.log(`${style.dim('[dry-run]')} ${m}`),
  header: (m) => console.log(`\n${style.bold(m)}`),
};
