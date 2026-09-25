@echo off
title WebWatch 360 - Starter
color 0b

echo ====================================================================
echo                   WebWatch 360 - Website Maintenance Tracker
echo ====================================================================
echo.
echo [1/2] Starting Backend API Server (Port 5000)...
start "WebWatch 360 - Backend" cmd /k "cd /d %~dp0backend && npm.cmd run dev"

echo [2/2] Starting Frontend Dashboard (Port 5173)...
start "WebWatch 360 - Frontend" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo ====================================================================
echo  Servers started successfully!
echo.
echo  Access your Dashboard here:
echo  URL:      http://localhost:5173
echo  Email:    admin@webwatch360.com
echo  Password: Admin@123456
echo ====================================================================
echo.
timeout /t 5 >nul
start http://localhost:5173
exit
