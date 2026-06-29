$Ports = @(8081, 8082, 8085, 5173, 5174, 5175, 5180, 8090, 8095)

foreach ($Port in $Ports) {
  $Connections = netstat -ano | Select-String ":$Port\s+.*LISTENING"
  foreach ($Line in $Connections) {
    $Parts = ($Line.ToString().Trim() -split "\s+")
    $ProcessIdValue = $Parts[-1]
    if ($ProcessIdValue -match "^\d+$") {
      Stop-Process -Id ([int]$ProcessIdValue) -Force -ErrorAction SilentlyContinue
    }
  }
}

Write-Host "Stopped all University Attendance backend, web, and mobile servers."
