$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Frontend = Join-Path $Root "frontend-web"

Set-Location $Frontend
npm run dev -- --port 5180 --strictPort
