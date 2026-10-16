@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24 LTS from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)
where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Repair your Node.js installation and run this file again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing project dependencies...
  call npm.cmd ci
  if errorlevel 1 goto failed
)
echo Building Tag Quest...
call npm.cmd run build
if errorlevel 1 goto failed
echo.
echo Starting Tag Quest for other devices on your local network.
echo Open the Network address printed below on a device connected to the same Wi-Fi.
echo Keep this window open while playing. Press Ctrl+C to stop sharing.
echo If Windows asks, allow Node.js access on your private network.
echo.
call npm.cmd run lan
if errorlevel 1 goto failed
echo The local network server has stopped.
pause
exit /b 0
:failed
echo.
echo Tag Quest could not start. Read the message above, then try again.
echo If port 4173 is already in use, close the other Tag Quest server first.
pause
exit /b 1
