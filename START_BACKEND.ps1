$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Backend = Join-Path $Root "backend"

Set-Location $Backend
mvn -q spring-boot:run
