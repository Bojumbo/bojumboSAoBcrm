# API Test Script for CRM Backend
Write-Host "🧪 Testing CRM Backend API..." -ForegroundColor Green

$baseUrl = "http://localhost:3001"

# Test 1: Health Check
Write-Host "`n1️⃣ Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/health" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health Check: OK" -ForegroundColor Green
        Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Health Check: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Login
Write-Host "`n2️⃣ Testing Login..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "admin@example.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Login: SUCCESS" -ForegroundColor Green
        $loginResponse = $response.Content | ConvertFrom-Json
        $token = $loginResponse.token
        Write-Host "   User: $($loginResponse.user.first_name) $($loginResponse.user.last_name)" -ForegroundColor Gray
        Write-Host "   Role: $($loginResponse.user.role)" -ForegroundColor Gray
        Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Login: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $token = $null
}

# Test 3: Get Current User (if login was successful)
if ($token) {
    Write-Host "`n3️⃣ Testing Get Current User..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/me" -Method GET -Headers $headers
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Get Current User: SUCCESS" -ForegroundColor Green
            $userData = $response.Content | ConvertFrom-Json
            Write-Host "   User: $($userData.first_name) $($userData.last_name)" -ForegroundColor Gray
            Write-Host "   Email: $($userData.email)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Get Current User: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Get Managers
Write-Host "`n4️⃣ Testing Get Managers..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/managers" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Get Managers: SUCCESS" -ForegroundColor Green
        $managersData = $response.Content | ConvertFrom-Json
        Write-Host "   Total Managers: $($managersData.total)" -ForegroundColor Gray
        foreach ($manager in $managersData.data) {
            Write-Host "   - $($manager.first_name) $($manager.last_name) ($($manager.role))" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Get Managers: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get Projects
Write-Host "`n5️⃣ Testing Get Projects..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/projects" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Get Projects: SUCCESS" -ForegroundColor Green
        $projectsData = $response.Content | ConvertFrom-Json
        Write-Host "   Total Projects: $($projectsData.total)" -ForegroundColor Gray
        foreach ($project in $projectsData.data) {
            Write-Host "   - $($project.name) (₴$($project.forecast_amount))" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Get Projects: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Logout (if login was successful)
if ($token) {
    Write-Host "`n6️⃣ Testing Logout..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/logout" -Method POST -Headers $headers
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Logout: SUCCESS" -ForegroundColor Green
            Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Logout: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🏁 API Testing Complete!" -ForegroundColor Green
Write-Host "`n📱 Frontend is available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend is available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "`n💡 You can now test the full integration in your browser!" -ForegroundColor Yellow
