@echo off
echo 🎅 Setting up Secret Santa Backend...

cd backend
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed!

if not exist "uploads" mkdir uploads
echo 📁 Uploads directory created!

echo 🚀 Backend setup complete!
echo.
echo To start the backend server:
echo   cd backend
echo   npm run dev
echo.
echo Backend will run on: http://localhost:3001
echo Health check: http://localhost:3001/api/health
pause