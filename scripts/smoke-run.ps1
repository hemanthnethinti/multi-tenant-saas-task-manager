$ErrorActionPreference = 'Stop'

$loginBody = @{ 
  email = 'admin@acme.com'
  password = 'Admin@123'
  tenantSubdomain = 'acme'
} | ConvertTo-Json

$token = (Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -ContentType 'application/json' -Body $loginBody).data.token
Write-Host "Token acquired: $token"

$createBody = @{ 
  title = 'CLI Smoke Task Final'
  description = 'End-to-end'
  priority = 'medium'
  status = 'todo'
  due_date = '2026-01-20T00:00:00Z'
} | ConvertTo-Json

$create = Invoke-RestMethod -Uri 'http://localhost:5000/api/tasks/projects/d0000000-0000-0000-0000-000000000001/tasks' -Method Post -ContentType 'application/json' -Body $createBody -Headers @{ Authorization = 'Bearer ' + $token }
$taskId = $create.data.id
Write-Host "Created task: $taskId"

$updateBody = @{ status = 'completed' } | ConvertTo-Json
$update = Invoke-RestMethod -Uri ('http://localhost:5000/api/tasks/' + $taskId + '/status') -Method Patch -ContentType 'application/json' -Body $updateBody -Headers @{ Authorization = 'Bearer ' + $token }
Write-Host "Updated task to completed"

$delete = $null
try {
  $delete = Invoke-RestMethod -Uri ('http://localhost:5000/api/tasks/' + $taskId) -Method Delete -Headers @{ Authorization = 'Bearer ' + $token }
  Write-Host "Deleted task"
} catch {
  Write-Warning "Delete failed: $($_.Exception.Message)"
}

[pscustomobject]@{
  token   = $token
  created = $create
  updated = $update
  deleted = $delete
} | ConvertTo-Json -Depth 6
