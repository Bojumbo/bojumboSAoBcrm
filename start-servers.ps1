# Start CRM Servers Script
Write-Host "🚀 Starting CRM System..." -ForegroundColor Green

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Function to start backend
function Start-Backend {
    Write-Host "🔧 Starting Backend Server..." -ForegroundColor Yellow
    
    if (Test-Port -Port 3001) {
        Write-Host "⚠️  Port 3001 is already in use. Backend might be running." -ForegroundColor Yellow
        return
    }
    
    Start-Process -FilePath "node" -ArgumentList "test-server.mjs" -WorkingDirectory "backend" -WindowStyle Minimized
    Write-Host "✅ Backend server started in background" -ForegroundColor Green
}

# Function to start frontend
function Start-Frontend {
    Write-Host "🌐 Starting Frontend Server..." -ForegroundColor Yellow
    
    if (Test-Port -Port 5173) {
        Write-Host "⚠️  Port 5173 is already in use. Frontend might be running." -ForegroundColor Yellow
        return
    }
    
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "." -WindowStyle Minimized
    Write-Host "✅ Frontend server started in background" -ForegroundColor Green
}

# Function to wait for server to be ready
function Wait-ForServer {
    param([int]$Port, [string]$ServerName)
    
    Write-Host "⏳ Waiting for $ServerName to be ready..." -ForegroundColor Cyan
    $attempts = 0
    $maxAttempts = 30
    
    while ($attempts -lt $maxAttempts) {
        if (Test-Port -Port $Port) {
            Write-Host "✅ $ServerName is ready on port $Port" -ForegroundColor Green
            return $true
        }
        
        $attempts++
        Start-Sleep -Seconds 2
        Write-Host "   Attempt $attempts/$maxAttempts..." -ForegroundColor Gray
    }
    
    Write-Host "❌ $ServerName failed to start after $maxAttempts attempts" -ForegroundColor Red
    return $false
}

# Main execution
try {
    # Start backend
    Start-Backend
    Start-Sleep -Seconds 3
    
    # Wait for backend
    if (Wait-ForServer -Port 3001 -ServerName "Backend") {
        # Start frontend
        Start-Frontend
        Start-Sleep -Seconds 3
        
        # Wait for frontend
        if (Wait-ForServer -Port 5173 -ServerName "Frontend") {
            Write-Host "`n🎉 CRM System is ready!" -ForegroundColor Green
            Write-Host "`n📱 Frontend: http://localhost:5173" -ForegroundColor Cyan
            Write-Host "🔧 Backend: http://localhost:3001" -ForegroundColor Cyan
            Write-Host "`n💡 Test credentials:" -ForegroundColor Yellow
            Write-Host "   Admin: admin@example.com / admin123" -ForegroundColor Gray
            Write-Host "   Head: ivan.p@example.com / head123" -ForegroundColor Gray
            Write-Host "   Manager: maria.i@example.com / manager123" -ForegroundColor Gray
            Write-Host "`n🔄 To stop servers, close the terminal windows or use Ctrl+C" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Frontend failed to start" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Backend failed to start" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error starting servers: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
