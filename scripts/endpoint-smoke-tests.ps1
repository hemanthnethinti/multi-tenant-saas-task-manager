Param(
    [string]$ApiBase = "http://localhost:5001",
    [string]$TenantSubdomain = "acme",
    [string]$AdminEmail = "admin@acme.com",
    [string]$AdminPassword = "Admin@123"
)

Write-Host "Checking health..." -ForegroundColor Cyan
$health = Invoke-WebRequest -Uri "$ApiBase/api/health" -UseBasicParsing -ErrorAction Stop
Write-Host "Health: $($health.Content)" -ForegroundColor Green

Write-Host "Logging in as tenant admin..." -ForegroundColor Cyan
$body = @{ email=$AdminEmail; password=$AdminPassword; tenantSubdomain=$TenantSubdomain } | ConvertTo-Json
$login = Invoke-WebRequest -Uri "$ApiBase/api/auth/login" -Method Post -ContentType "application/json" -Body $body -UseBasicParsing -ErrorAction Stop
$loginJson = $login.Content | ConvertFrom-Json
$token = $loginJson.data.token
Write-Host "Login success. Token length: $($token.Length)" -ForegroundColor Green

# Example: call protected endpoint /api/auth/me
Write-Host "Calling /api/auth/me..." -ForegroundColor Cyan
$headers = @{ Authorization = "Bearer $token" }
$me = Invoke-WebRequest -Uri "$ApiBase/api/auth/me" -Headers $headers -UseBasicParsing -ErrorAction Stop
Write-Host "Me: $($me.Content)" -ForegroundColor Green

Write-Host "Smoke tests completed." -ForegroundColor Green
