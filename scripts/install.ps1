# Bootstrap for running ai-coding-rules from a cloned repo on Windows.
# Usage: powershell -ExecutionPolicy Bypass -File scripts\install.ps1 [install|uninstall|status|manual] [flags]
$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error 'node is required (>=18). Install Node.js first.'
  exit 1
}
$rest = $args
if (-not $rest -or $rest.Count -eq 0) { $rest = @('install') }
& node (Join-Path $dir 'bin\cli.js') @rest
exit $LASTEXITCODE
