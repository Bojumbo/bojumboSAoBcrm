#!/bin/bash

echo "🚀 Starting CRM System Integration..."
echo

echo "📋 Checking prerequisites..."

# Check if backend dependencies exist
if [ ! -d "backend/node_modules" ]; then
    echo "⚠️  Backend dependencies not found. Installing..."
    cd backend
    npm install
    cd ..
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend dependencies found"
fi

# Check if frontend dependencies exist
if [ ! -d "node_modules" ]; then
    echo "⚠️  Frontend dependencies not found. Installing..."
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies found"
fi

echo
echo "🔧 Starting Backend Server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

echo "⏳ Waiting for backend to start..."
sleep 5

echo
echo "🌐 Starting Frontend Development Server..."
npm run dev &
FRONTEND_PID=$!

echo
echo "🎉 CRM System Integration Started!"
echo
echo "📱 Frontend: http://localhost:5173 (or check terminal for actual port)"
echo "🔌 Backend: http://localhost:3001"
echo
echo "💡 Both servers are running in the background"
echo "📊 Backend PID: $BACKEND_PID"
echo "📊 Frontend PID: $FRONTEND_PID"
echo
echo "🛑 To stop both servers, run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo
echo "🔍 To view logs, run:"
echo "   tail -f backend/logs/app.log"
echo
echo "Press Ctrl+C to stop this script (servers will continue running)"
echo

# Wait for user interrupt
trap "echo 'Script stopped. Servers are still running.'; exit" INT
wait
