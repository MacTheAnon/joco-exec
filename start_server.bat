@echo off
title JOCO EXEC SERVER
echo 🚀 Starting Johnson County Executive Server...

:: Check if node_modules exists, if not, install them
if not exist "node_modules" (
    echo 📦 Server dependencies missing. Installing...
    call npm install
)

:: Check if the frontend build exists
if not exist "build" (
    echo 🏗️  Frontend build missing. Generating...
    cd client
    call npm install
    call npm run build
    move build ..\
    cd ..
)

echo 🔗 Checking Local IP...
ipconfig | findstr /i "IPv4"

echo.
echo 🟢 Server is going live!
node server.js
pause