@echo off
echo ==================================================
echo       🚀 Starting FINDEKA System
echo ==================================================

echo.
echo [1/2] Starting AI Service...
start "Findeka AI Service" cmd /k "call apps\ai-service\run_service.bat"

echo.
echo [2/2] Starting Web Application...
cd apps\web
if not exist node_modules (
    echo 📦 Installing Web Dependencies...
    call npm install
)
start "Findeka Web App" cmd /k "npm run dev"

echo.
echo ✅ System starting...
echo    - Web App: http://localhost:5173
echo    - AI Service: http://localhost:8000
echo.
echo (Close the popup windows to stop the servers)
echo ==================================================
pause
