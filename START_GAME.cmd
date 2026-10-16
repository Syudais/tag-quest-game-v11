@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24 LTS from https://nodejs.org/ and run this file again.
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
echo Keep this window open while playing. Close it to stop the local game server.
call npm.cmd run preview -- --port 4173 --open
if errorlevel 1 goto failed
exit /b 0
:failed
echo The game could not start. Read the message above, then try again.
pause
exit /b 1
