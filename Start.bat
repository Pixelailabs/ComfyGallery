@echo off
REM Check if Node.js is installed
where node >nul 2>&1
IF ERRORLEVEL 1 (
    echo Node.js is not installed. Please install Node.js to continue.
    pause
    exit /b 1
)

REM Change directory to the location of the script
cd /d "%~dp0"

REM Navigate to the ComfyGallerie directory
cd App

REM Install dependencies
echo Installing dependencies...
call npm install
IF ERRORLEVEL 1 (
    echo Failed to install dependencies.
    pause
    exit /b 1
)

REM Start the Next.js app
echo Starting ComfyGallerie...
call npm run dev
IF ERRORLEVEL 1 (
    echo Failed to start the Next.js app.
    pause
    exit /b 1
)

pause
