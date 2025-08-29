@echo off
echo 🚀 Starting CRM Backend...

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found!
    echo Please copy .env.example to .env and configure your database settings
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
)

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npm run db:generate

REM Check if database is accessible
echo 🔍 Checking database connection...
npm run db:push

REM Seed database if needed
echo 🌱 Seeding database...
npm run db:seed

REM Start development server
echo 🔥 Starting development server...
npm run dev

pause
