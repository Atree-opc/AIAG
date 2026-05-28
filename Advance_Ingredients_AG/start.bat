@echo off
setlocal

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not in PATH.
  echo Install Node.js 20+ from https://nodejs.org/ and try again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is not available in PATH.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [INFO] node_modules not found. Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo [ERROR] Dependency installation failed.
    pause
    exit /b 1
  )
) else (
  echo [INFO] Dependencies are already installed.
)

if not exist ".env.local" (
  echo [WARN] .env.local was not found.
  echo [WARN] Public pages may work, but login, database, upload, and PDF features may fail.
)

echo [INFO] Starting development server on http://localhost:3050
call npm run dev
set EXIT_CODE=%ERRORLEVEL%

if not "%EXIT_CODE%"=="0" (
  echo.
  echo [ERROR] The development server exited with code %EXIT_CODE%.
  pause
)

exit /b %EXIT_CODE%
