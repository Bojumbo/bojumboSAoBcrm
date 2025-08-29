@echo off
echo 🚀 Starting CRM System Integration...
echo.

echo 📋 Checking prerequisites...
if not exist "backend\node_modules" (
    echo ⚠️  Backend dependencies not found. Installing...
    cd backend
    call npm install
    cd ..
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies found
)

if not exist "node_modules" (
    echo ⚠️  Frontend dependencies not found. Installing...
    call npm install
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies found
)

echo.
echo 🔧 Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Starting Frontend Development Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 🎉 CRM System Integration Started!
echo.
echo 📱 Frontend: http://localhost:5173 (or check terminal for actual port)
echo 🔌 Backend: http://localhost:3001
echo.
echo 💡 Keep both terminal windows open to monitor the servers
echo 🚪 Close this window when done
echo.
pause
