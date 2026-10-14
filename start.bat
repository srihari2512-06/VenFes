@echo off
title Venfes - Multi-Vendor E-Commerce Platform
color 0B
echo ========================================================
echo        Starting Venfes Multi-Vendor E-Commerce
echo ========================================================
echo.

cd /d "%~dp0"

REM Check if dependencies exist
if not exist "node_modules" (
    echo [INFO] First time run detected. Installing dependencies...
    call npm install
    echo.
)

REM Open browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5173"

REM Start server and client concurrently
echo [INFO] Starting Backend Server and Frontend Client...
call npm run dev

pause
