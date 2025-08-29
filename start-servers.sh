#!/bin/bash

# Start CRM Servers Script for Linux/macOS
echo "🚀 Starting CRM System..."

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to start backend
start_backend() {
    echo "🔧 Starting Backend Server..."
    
    if check_port 3001; then
        echo "⚠️  Port 3001 is already in use. Backend might be running."
        return
    fi
    
    cd backend
    node test-server.mjs &
    BACKEND_PID=$!
    cd ..
    echo "✅ Backend server started (PID: $BACKEND_PID)"
}

# Function to start frontend
start_frontend() {
    echo "🌐 Starting Frontend Server..."
    
    if check_port 5173; then
        echo "⚠️  Port 5173 is already in use. Frontend might be running."
        return
    fi
    
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend server started (PID: $FRONTEND_PID)"
}

# Function to wait for server to be ready
wait_for_server() {
    local port=$1
    local server_name=$2
    
    echo "⏳ Waiting for $server_name to be ready..."
    local attempts=0
    local max_attempts=30
    
    while [ $attempts -lt $max_attempts ]; do
        if check_port $port; then
            echo "✅ $server_name is ready on port $port"
            return 0
        fi
        
        attempts=$((attempts + 1))
        sleep 2
        echo "   Attempt $attempts/$max_attempts..."
    done
    
    echo "❌ $server_name failed to start after $max_attempts attempts"
    return 1
}

# Function to cleanup on exit
cleanup() {
    echo "🔄 Stopping servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend stopped"
    fi
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Main execution
start_backend
sleep 3

if wait_for_server 3001 "Backend"; then
    start_frontend
    sleep 3
    
    if wait_for_server 5173 "Frontend"; then
        echo ""
        echo "🎉 CRM System is ready!"
        echo ""
        echo "📱 Frontend: http://localhost:5173"
        echo "🔧 Backend: http://localhost:3001"
        echo ""
        echo "💡 Test credentials:"
        echo "   Admin: admin@example.com / admin123"
        echo "   Head: ivan.p@example.com / head123"
        echo "   Manager: maria.i@example.com / manager123"
        echo ""
        echo "🔄 To stop servers, press Ctrl+C"
        echo ""
        
        # Keep script running
        while true; do
            sleep 1
        done
    else
        echo "❌ Frontend failed to start"
        cleanup
    fi
else
    echo "❌ Backend failed to start"
    cleanup
fi
