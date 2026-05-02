@echo off
REM Task Manager - Complete Setup Script for Windows

echo.
echo 🚀 Task Manager Setup Script
echo ==============================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js version: %NODE_VERSION%
echo.

REM Backend Setup
echo 📦 Setting up Backend...
cd backend
call npm install
echo ✓ Backend dependencies installed
echo.

REM Frontend Setup
echo 📦 Setting up Frontend...
cd ..\frontend
call npm install
echo ✓ Frontend dependencies installed
echo.

cd ..

REM Create .env files if they don't exist
if not exist "backend\.env" (
    echo 📝 Creating backend\.env
    (
        echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/task_manager
        echo JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
        echo JWT_EXPIRE=7d
        echo PORT=5000
        echo NODE_ENV=development
    ) > backend\.env
)

if not exist "frontend\.env" (
    echo 📝 Creating frontend\.env
    (
        echo VITE_API_URL=http://localhost:5000/api
    ) > frontend\.env
)

echo.
echo ✅ Setup Complete!
echo.
echo Next Steps:
echo ===========
echo.
echo 1. Set up a PostgreSQL database:
echo    Option A: Install PostgreSQL locally (https://www.postgresql.org/)
echo    Option B: Use Docker: docker-compose up -d
echo    Option C: Create a database on Railway for production
echo.
echo 2. Update backend\.env with your DATABASE_URL
echo.
echo 3. Start the backend:
echo    cd backend && npm run dev
echo.
echo 4. Start the frontend (in another terminal):
echo    cd frontend && npm run dev
echo.
echo 5. Open http://localhost:5173 in your browser
echo.
echo 6. (Optional) Seed the database with sample data:
echo    cd backend && npm run seed
echo.
pause
