$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend-web"
$Mobile = Join-Path $Root "frontend-mobile"
$BackendPort = 8085
$FrontendPort = 5180
$MobilePort = 8095

$Ports = @(8081, 8082, 8085, 5173, 5174, 5175, 5180, 8090, 8095)
foreach ($Port in $Ports) {
  $Lines = netstat -ano | Select-String ":$Port\s+.*LISTENING"
  foreach ($Line in $Lines) {
    $Parts = ($Line.ToString().Trim() -split "\s+")
    $ProcessIdValue = $Parts[-1]
    if ($ProcessIdValue -match "^\d+$") {
      Stop-Process -Id ([int]$ProcessIdValue) -Force -ErrorAction SilentlyContinue
    }
  }
}

Start-Sleep -Seconds 2
Start-Process -FilePath "mvn.cmd" -ArgumentList "-q", "spring-boot:run" -WorkingDirectory $Backend -WindowStyle Hidden

$BackendReady = $false
for ($Attempt = 0; $Attempt -lt 45; $Attempt++) {
  Start-Sleep -Seconds 1
  try {
    Invoke-RestMethod "http://localhost:$BackendPort/api/reports/dashboard" -TimeoutSec 2 | Out-Null
    $BackendReady = $true
    break
  } catch {
  }
}

if (-not $BackendReady) {
  throw "Backend failed to start on port $BackendPort."
}

Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev", "--", "--port", "$FrontendPort", "--strictPort" -WorkingDirectory $Frontend -WindowStyle Hidden
Start-Process -FilePath "npx.cmd" -ArgumentList "expo", "start", "--web", "--port", "$MobilePort", "--clear" -WorkingDirectory $Mobile -WindowStyle Hidden

Write-Host ""
Write-Host "All servers started successfully."
Write-Host "Backend API:    http://localhost:$BackendPort/api"
Write-Host "Desktop Web:    http://localhost:$FrontendPort"
Write-Host "Mobile Preview: http://localhost:$MobilePort"
Write-Host ""
Write-Host "Use only these URLs. Close old 5173/5174/5175/8090 browser tabs."
