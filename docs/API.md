API Documentation - TaskFlow Multi-Tenant SaaS

Complete API reference for the task manager with all 19 endpoints.

---

## Overview

Base URL: http://localhost:5000/api

All responses have this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* Endpoint-specific data */
  }
}
```

**Authentication:**
Most endpoints require JWT token in Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## Authentication Endpoints (4)

### 1. Register New Tenant & Admin User

**Endpoint:** `POST /api/auth/register`

**Authentication:** Not required

**Request Body:**

```json
{
  "tenantName": "Acme Corporation",
  "subdomain": "acme",
  "adminEmail": "admin@acme.com",
  "adminFullName": "John Doe",
  "adminPassword": "Admin@123"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenantId": "uuid-here",
    "subdomain": "acme",
    "adminUser": {
      "id": "user-uuid",
      "email": "admin@acme.com",
      "fullName": "John Doe",
      "role": "tenant_admin"
    }
  }
}
```

---

### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "admin@acme.com",
  "password": "Admin@123",
  "tenantSubdomain": "acme"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-uuid",
      "email": "admin@acme.com",
      "fullName": "John Doe",
      "role": "tenant_admin",
      "tenantId": "tenant-uuid"
    }
  }
}
```

---

### 3. Get Current User

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required (Bearer Token)

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "user-uuid",
    "email": "admin@acme.com",
    "fullName": "John Doe",
    "role": "tenant_admin",
    "tenantId": "tenant-uuid",
    "isActive": true
  }
}
```

---

### 4. User Logout

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Required (Bearer Token)

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Tenant Management Endpoints (3)

### 5. List All Tenants (Super Admin Only)

**Endpoint:** `GET /api/tenants`

**Authentication:** Required (Bearer Token - Super Admin only)

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Records per page (default: 10)
- `search`: Search by tenant name

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Tenants retrieved successfully",
  "data": {
    "tenants": [
      {
        "id": "tenant-uuid",
        "name": "Acme Corporation",
        "subdomain": "acme",
        "status": "active",
        "subscriptionPlan": "pro",
        "maxUsers": 10,
        "maxProjects": 5,
        "createdAt": "2025-12-30T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pages": 1
  }
}
```

---

### 6. Get Tenant Details

**Endpoint:** `GET /api/tenants/:tenantId`

**Authentication:** Required (Bearer Token)

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Tenant retrieved successfully",
  "data": {
    "id": "tenant-uuid",
    "name": "Acme Corporation",
    "subdomain": "acme",
    "status": "active",
    "subscriptionPlan": "pro",
    "maxUsers": 10,
    "maxProjects": 5,
    "userCount": 5,
    "projectCount": 3
  }
}
```

---

### 7. Update Tenant

**Endpoint:** `PUT /api/tenants/:tenantId`

**Authentication:** Required (Bearer Token - Tenant Admin or Super Admin)

**Request Body:**

```json
{
  "name": "Acme Corp Updated",
  "status": "active",
  "subscriptionPlan": "enterprise",
  "maxUsers": 50,
  "maxProjects": 20
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Tenant updated successfully",
  "data": {
    "id": "tenant-uuid",
    "name": "Acme Corp Updated",
    "subscriptionPlan": "enterprise"
  }
}
```

---

## User Management Endpoints (4)

### 8. List Users in Tenant

**Endpoint:** `GET /api/users/tenants/:tenantId/users`

**Authentication:** Required (Bearer Token)

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Records per page (default: 10)
- `role`: Filter by role (user, tenant_admin)

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "user-uuid",
        "email": "admin@acme.com",
        "fullName": "John Doe",
        "role": "tenant_admin",
        "isActive": true,
        "createdAt": "2025-12-30T10:00:00Z"
      }
    ],
    "total": 1
  }
}
```

---

### 9. Add New User

**Endpoint:** `POST /api/users/tenants/:tenantId/users`

**Authentication:** Required (Bearer Token - Tenant Admin or Super Admin)

**Request Body:**

```json
{
  "email": "newuser@acme.com",
  "password": "NewUser@123",
  "fullName": "Alice Smith",
  "role": "user"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "new-user-uuid",
    "email": "newuser@acme.com",
    "fullName": "Alice Smith",
    "role": "user"
  }
}
```

---

### 10. Update User

**Endpoint:** `PUT /api/users/:userId`

**Authentication:** Required (Bearer Token - Tenant Admin, Super Admin, or own user)

**Request Body:**

```json
{
  "fullName": "Alice Smith Updated",
  "role": "tenant_admin",
  "isActive": true
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user-uuid",
    "email": "alice@acme.com",
    "fullName": "Alice Smith Updated",
    "role": "tenant_admin"
  }
}
```

---

### 11. Delete User

**Endpoint:** `DELETE /api/users/:userId`

**Authentication:** Required (Bearer Token - Tenant Admin or Super Admin)

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Project Management Endpoints (4)

### 12. List Projects

**Endpoint:** `GET /api/projects`

**Authentication:** Required (Bearer Token)

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Records per page (default: 10)
- `status`: Filter by status (active, archived)

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": {
    "projects": [
      {
        "id": "project-uuid",
        "name": "Website Redesign",
        "description": "Redesign company website",
        "status": "active",
        "createdAt": "2025-12-30T10:00:00Z",
        "taskCount": 5
      }
    ],
    "total": 1
  }
}
```

---

### 13. Create Project

**Endpoint:** `POST /api/projects`

**Authentication:** Required (Bearer Token)

**Request Body:**

```json
{
  "name": "Website Redesign",
  "description": "Redesign company website with modern UI"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "new-project-uuid",
    "name": "Website Redesign",
    "description": "Redesign company website with modern UI",
    "status": "active",
    "createdBy": "admin@acme.com"
  }
}
```

---

### 14. Update Project

**Endpoint:** `PUT /api/projects/:projectId`

**Authentication:** Required (Bearer Token - Project creator, Tenant Admin, or Super Admin)

**Request Body:**

```json
{
  "name": "Website Redesign 2025",
  "description": "Updated description",
  "status": "active"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "project-uuid",
    "name": "Website Redesign 2025",
    "status": "active"
  }
}
```

---

### 15. Delete Project

**Endpoint:** `DELETE /api/projects/:projectId`

**Authentication:** Required (Bearer Token - Project creator, Tenant Admin, or Super Admin)

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Task Management Endpoints (5)

### 16. List Tasks in Project

**Endpoint:** `GET /api/tasks/projects/:projectId/tasks`

**Authentication:** Required (Bearer Token)

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Records per page (default: 10)
- `status`: Filter by status (pending, in_progress, completed)
- `priority`: Filter by priority (low, medium, high)

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [
      {
        "id": "task-uuid",
        "title": "Design mockups",
        "description": "Create initial design mockups",
        "status": "in_progress",
        "priority": "high",
        "assignedTo": "alice@acme.com",
        "dueDate": "2025-01-15T00:00:00Z",
        "createdAt": "2025-12-30T10:00:00Z"
      }
    ],
    "total": 1
  }
}
```

---

### 17. Create Task

**Endpoint:** `POST /api/tasks/projects/:projectId/tasks`

**Authentication:** Required (Bearer Token)

**Request Body:**

```json
{
  "title": "Design mockups",
  "description": "Create initial design mockups",
  "priority": "high",
  "status": "pending",
  "assignedTo": "alice@acme.com",
  "dueDate": "2025-01-15T00:00:00Z"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "new-task-uuid",
    "title": "Design mockups",
    "status": "pending",
    "priority": "high",
    "projectId": "project-uuid"
  }
}
```

---

### 18. Update Task

**Endpoint:** `PUT /api/tasks/:taskId`

**Authentication:** Required (Bearer Token)

**Request Body:**

```json
{
  "title": "Design mockups - Updated",
  "description": "Create initial design mockups with feedback",
  "status": "in_progress",
  "priority": "high",
  "assignedTo": "bob@acme.com",
  "dueDate": "2025-01-20T00:00:00Z"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "task-uuid",
    "title": "Design mockups - Updated",
    "status": "in_progress"
  }
}
```

---

### 19. Delete Task

**Endpoint:** `DELETE /api/tasks/:taskId`

**Authentication:** Required (Bearer Token)

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## Health Check Endpoint (1)

### 20. Health Check

**Endpoint:** `GET /api/health`

**Authentication:** Not required

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Health check passed",
  "timestamp": "2025-12-30T12:00:00Z",
  "database": "connected"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Field is required", "Invalid email format"]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid credentials or token expired"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "Resource already exists"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Testing with Postman

1. Import [TaskFlow_Postman_Collection.json](../TaskFlow_Postman_Collection.json)
2. Set environment variables:
   - `base_url`: http://localhost:5000/api
   - `token`: (obtained from login endpoint)
3. Test endpoints in order

---

## Rate Limiting

- **Standard endpoints:** 100 requests per 15 minutes
- **Authentication endpoints:** 10 requests per 15 minutes
- **Response headers include:**
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp for reset
