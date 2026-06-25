@echo off
echo Stopping old servers...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3003" ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

cd /d "%~dp0.."
echo Starting Morgan Wallen fan site (dev mode)...
echo.
echo Open the URL shown below in your browser.
echo.
call npm.cmd run dev
