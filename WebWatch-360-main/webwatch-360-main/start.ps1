Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "             WebWatch 360 - Website Maintenance Tracker              " -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[*] Stopping any previous instances on Port 5000 and 5173..." -ForegroundColor Cyan
$p5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($p5000) { Stop-Process -Id $p5000 -Force -ErrorAction SilentlyContinue }

$p5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($p5173) { Stop-Process -Id $p5173 -Force -ErrorAction SilentlyContinue }

Write-Host "[*] Ensuring MySQL Database Schema..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\backend"
node src/database/migrate_mysql.js

Write-Host ""
Write-Host "[1/2] Starting Backend API (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; node src/server.js"

Write-Host "[2/2] Starting Frontend UI (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; node ./node_modules/vite/bin/vite.js --port 5173"

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "  Both servers launched successfully!" -ForegroundColor Green
Write-Host "  Opening http://localhost:5173 in browser..." -ForegroundColor Green
Write-Host "  Admin Email:    admin@webwatch360.com" -ForegroundColor Green
Write-Host "  Admin Password: Admin@123456" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Green
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"
