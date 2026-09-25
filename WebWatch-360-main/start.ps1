Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "             WebWatch 360 - Website Maintenance Tracker              " -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1/2] Starting Backend API (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm.cmd run dev"

Write-Host "[2/2] Starting Frontend UI (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm.cmd run dev"

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "  Both servers launched successfully!" -ForegroundColor Green
Write-Host "  Opening http://localhost:5173 in browser..." -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Green
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"
