param(
  [string]$ApiUrl = "http://localhost:8085/api",
  [int]$Port = 8095
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Mobile = Join-Path $Root "frontend-mobile"

Set-Location $Mobile
$env:EXPO_PUBLIC_API_URL = $ApiUrl
npx expo start --web --port $Port --clear
