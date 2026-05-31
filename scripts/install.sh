#!/usr/bin/env bash
# Bootstrap for running ai-coding-rules from a cloned repo (no npm publish needed).
# Usage: scripts/install.sh [install|uninstall|status|manual] [flags]
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if ! command -v node >/dev/null 2>&1; then
  echo "node is required (>=18). Install Node.js first." >&2
  exit 1
fi
exec node "$DIR/bin/cli.js" "${@:-install}"
