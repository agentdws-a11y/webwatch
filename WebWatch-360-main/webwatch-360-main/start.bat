@echo off
title WebWatch 360 - One Click Launch
color 0b

echo ====================================================================
echo                   WebWatch 360 - Website Maintenance Tracker
echo                   GWS Digital Services - 6-Week Internship
echo ====================================================================
echo.

echo [*] Cleaning up any previous server instances on Port 5000 & 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo [*] Checking and Ensuring MySQL Database Migration...
cd /d "%~dp0backend"
node src/database/migrate_mysql.js

echo.
echo [1/2] Starting Backend API Server (Port 5000)...
start "WebWatch 360 - Backend API (Port 5000)" cmd /k "cd /d ""%~dp0backend"" && node src/server.js"

echo [2/2] Starting Frontend UI (Port 5173)...
start "WebWatch 360 - Frontend UI (Port 5173)" cmd /k "cd /d ""%~dp0frontend"" && node ./node_modules/vite/bin/vite.js --port 5173"

echo.
echo ====================================================================
echo   WebWatch 360 is running!
echo.
echo   Dashboard URL:  http://localhost:5173
echo   Backend API:    http://localhost:5000/api
echo.
echo   Admin Login:
echo     Email:    admin@webwatch360.com
echo     Password: Admin@123456
echo ====================================================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 >nul
start http://localhost:5173
exit
