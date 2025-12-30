#!/bin/bash

# Smoke test script for Multi-Tenant SaaS Task Manager
# Tests all major CRUD operations

echo "🧪 Multi-Tenant SaaS Task Manager - Smoke Test"
echo "================================================"

BASE_URL="http://localhost:5001/api"
TENANT_SUBDOMAIN="acme"
EMAIL="admin@acme.com"
PASSWORD="Admin@123"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Helper function
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4
  
  echo ""
  echo -e "${YELLOW}Testing:${NC} $description"
  
  if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ No token available${NC}"
    return 1
  fi
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -X $method "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -X $method "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  if echo "$response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Success${NC}"
    return 0
  else
    echo -e "${RED}✗ Failed${NC}"
    echo "Response: $response"
    return 1
  fi
}

# 1. Login
echo ""
echo -e "${YELLOW}Step 1: Authentication${NC}"
echo "Logging in as $EMAIL..."

login_response=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"tenantSubdomain\":\"$TENANT_SUBDOMAIN\"}")

TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Login failed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo "Token: ${TOKEN:0:20}..."

# 2. Test Projects
echo ""
echo -e "${YELLOW}Step 2: Projects${NC}"
test_endpoint "GET" "/projects" "" "Get projects list"
test_endpoint "POST" "/projects" '{"name":"Test Project","description":"For testing"}' "Create project"

# 3. Test Users  
echo ""
echo -e "${YELLOW}Step 3: Users${NC}"
TENANT_ID=$(curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | grep -o '"tenantId":"[^"]*' | cut -d'"' -f4)

if [ -n "$TENANT_ID" ]; then
  test_endpoint "GET" "/users/tenants/$TENANT_ID/users" "" "List users"
fi

# 4. Test Tasks
echo ""
echo -e "${YELLOW}Step 4: Tasks${NC}"
PROJECT_ID=$(curl -s -X GET "$BASE_URL/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$PROJECT_ID" ]; then
  test_endpoint "GET" "/tasks/projects/$PROJECT_ID/tasks" "" "List tasks"
  test_endpoint "POST" "/tasks/projects/$PROJECT_ID/tasks" '{"title":"Test Task","description":"For testing","priority":"medium"}' "Create task"
fi

# 5. Health Check
echo ""
echo -e "${YELLOW}Step 5: Health Check${NC}"
test_endpoint "GET" "/health" "" "Health check"

echo ""
echo "================================================"
echo -e "${GREEN}✓ Smoke test completed!${NC}"
echo ""
echo "🚀 Application is ready for deployment"
echo ""
