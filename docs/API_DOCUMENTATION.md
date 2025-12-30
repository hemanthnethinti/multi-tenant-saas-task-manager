# API Documentation

Complete API reference for the Multi-Tenant SaaS Task Manager with all 19 endpoints.

---

## Overview

**Base URL:** `http://localhost:5001` (development)

**Response Format:**
All API responses follow a standard format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* Endpoint-specific data */ }
}
```

**Authentication:**
Most endpoints require JWT token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Rate Limiting:**
- 100 requests per 15 minutes per IP address
- Authentication endpoints have stricter limits

---

## 1. Authentication Endpoints

### 1.1 Register New Organization & User

**Endpoint:** `POST /api/auth/register`

**Authentication:** Not required

**Request Body:**
```json
{
  "tenantName": "TechStart Inc.",
  "subdomain": "techstart",
  "email": "admin@techstart.com",
  "name": "Sarah Johnson",
  "password": "SecurePassword123!"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "admin@techstart.com",
      "name": "Sarah Johnson",
      "role": "tenant_admin"
    },
    "tenant": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "TechStart Inc.",
      "subdomain": "techstart",
      "subscriptionPlan": "free",
      "maxUsers": 5,
      "maxProjects": 10,
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Subdomain already taken",
  "data": null
}
```

**Validation Rules:**
- tenantName: Required, 3-100 characters
- subdomain: Required, 3-50 characters, lowercase alphanumeric + hyphens only, must be unique
- email: Required, valid email format, must be unique within tenant
- name: Required, 2-100 characters
- password: Required, min 8 chars, must include uppercase, lowercase, number, special character

---

### 1.2 Login

**Endpoint:** `POST /api/auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "admin@techstart.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "admin@techstart.com",
      "name": "Sarah Johnson",
      "role": "tenant_admin"
    },
    "tenant": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "TechStart Inc.",
      "subdomain": "techstart",
      "subscriptionPlan": "free",
      "maxUsers": 5,
      "maxProjects": 10,
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null
}
```

**Notes:**
- JWT token expires in 24 hours
- Token must be stored in localStorage (frontend)
- Token included in Authorization header for subsequent requests
- Failed login attempts are logged in audit_logs

---

### 1.3 Get Current User & Tenant Info

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required (JWT)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "User data retrieved",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "admin@techstart.com",
      "name": "Sarah Johnson",
      "role": "tenant_admin",
      "isActive": true,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    },
    "tenant": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "TechStart Inc.",
      "subdomain": "techstart",
      "subscriptionPlan": "free",
      "maxUsers": 5,
      "maxProjects": 10,
      "status": "active",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "data": null
}
```

**Notes:**
- Use this to verify JWT is valid and refresh user/tenant data
- Called on application load to restore user session

---

### 1.4 Logout

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Required (JWT)

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

**Notes:**
- JWT is stateless, so server-side logout is minimal
- Client must delete token from localStorage
- No further requests can be made with deleted token

---

## 2. Project Endpoints

### 2.1 Get All Projects

**Endpoint:** `GET /api/projects`

**Authentication:** Required (JWT)

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Results per page (default: 10, max: 100)
- `status` (optional): Filter by status (active, archived)
- `sortBy` (optional): Sort field (createdAt, name, updatedAt) (default: createdAt)
- `sortOrder` (optional): Sort direction (asc, desc) (default: desc)

**Request Example:**
```
GET /api/projects?page=1&limit=10&status=active&sortBy=createdAt&sortOrder=desc
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": {
    "projects": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "tenantId": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Website Redesign",
        "description": "Complete redesign of company website for improved UX",
        "status": "active",
        "createdBy": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2025-01-15T10:30:00Z",
        "updatedAt": "2025-01-15T10:30:00Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440011",
        "tenantId": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Mobile App Development",
        "description": "Develop native iOS and Android apps",
        "status": "active",
        "createdBy": "550e8400-e29b-41d4-a716-446655440002",
        "createdAt": "2025-01-14T09:15:00Z",
        "updatedAt": "2025-01-14T09:15:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

**Notes:**
- Regular users only see projects they created
- Tenant admins see all tenant projects
- Super admins see all projects
- Results are filtered by tenant_id automatically

---

### 2.2 Create New Project

**Endpoint:** `POST /api/projects`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "name": "Website Redesign",
  "description": "Complete redesign of company website for improved UX"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "tenantId": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Website Redesign",
    "description": "Complete redesign of company website for improved UX",
    "status": "active",
    "createdBy": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Project name is required",
  "data": null
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "Project limit exceeded for current subscription plan",
  "data": null
}
```

**Validation Rules:**
- name: Required, 3-255 characters
- description: Optional, max 2000 characters

**Notes:**
- Subscription plan limits are enforced (maxProjects)
- Current user is set as createdBy
- New projects default to "active" status

---

### 2.3 Get Project Details

**Endpoint:** `GET /api/projects/:projectId`

**Authentication:** Required (JWT)

**Path Parameters:**
- `projectId` (required): UUID of the project

**Success Response (200):**
```json
{
  "success": true,
  "message": "Project retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "tenantId": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Website Redesign",
    "description": "Complete redesign of company website for improved UX",
    "status": "active",
    "createdBy": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z",
    "taskCount": 5,
    "teamMembers": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Sarah Johnson",
        "role": "tenant_admin"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "David Patel",
        "role": "user"
      }
    ]
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Project not found",
  "data": null
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Access denied - you don't have permission to view this project",
  "data": null
}
```

---

### 2.4 Update Project

**Endpoint:** `PUT /api/projects/:projectId`

**Authentication:** Required (JWT)

**Authorization:** Project creator or tenant admin

**Request Body:**
```json
{
  "name": "Website Redesign 2025",
  "description": "Updated complete redesign for better user experience"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "tenantId": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Website Redesign 2025",
    "description": "Updated complete redesign for better user experience",
    "status": "active",
    "createdBy": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T11:45:00Z"
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Only project creator or admin can edit this project",
  "data": null
}
```

---

### 2.5 Delete Project

**Endpoint:** `DELETE /api/projects/:projectId`

**Authentication:** Required (JWT)

**Authorization:** Project creator or tenant admin

**Success Response (200):**
```json
{
  "success": true,
  "message": "Project deleted successfully",
  "data": null
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Only project creator or admin can delete this project",
  "data": null
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "Cannot delete project with active tasks",
  "data": null
}
```

**Notes:**
- Deletion is logged in audit_logs
- Related tasks are soft-deleted or reassigned based on policy

---

## 3. Task Endpoints

### 3.1 Get All Tasks

**Endpoint:** `GET /api/tasks`

**Authentication:** Required (JWT)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `projectId` (optional): Filter by project
- `status` (optional): Filter by status (pending, in_progress, completed)
- `priority` (optional): Filter by priority (1-3)
- `assignedTo` (optional): Filter by assignee user ID
- `sortBy` (optional): Sort field (createdAt, dueDate, priority) (default: dueDate)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440020",
        "tenantId": "550e8400-e29b-41d4-a716-446655440001",
        "projectId": "550e8400-e29b-41d4-a716-446655440010",
        "title": "Design homepage mockup",
        "description": "Create high-fidelity mockup for the homepage",
        "status": "in_progress",
        "priority": 3,
        "assignedTo": "550e8400-e29b-41d4-a716-446655440002",
        "dueDate": "2025-02-15",
        "createdBy": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2025-01-15T10:30:00Z",
        "updatedAt": "2025-01-15T14:20:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

**Notes:**
- Regular users only see their own tasks or tasks in projects they created
- Filters are applied with AND logic
- Tasks sorted by dueDate ascending by default

---

### 3.2 Create Task

**Endpoint:** `POST /api/tasks`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440010",
  "title": "Design homepage mockup",
  "description": "Create high-fidelity mockup for the homepage",
  "priority": 3,
  "assignedTo": "550e8400-e29b-41d4-a716-446655440002",
  "dueDate": "2025-02-15"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "tenantId": "550e8400-e29b-41d4-a716-446655440001",
    "projectId": "550e8400-e29b-41d4-a716-446655440010",
    "title": "Design homepage mockup",
    "description": "Create high-fidelity mockup for the homepage",
    "status": "pending",
    "priority": 3,
    "assignedTo": "550e8400-e29b-41d4-a716-446655440002",
    "dueDate": "2025-02-15",
    "createdBy": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

**Validation Rules:**
- projectId: Required, must be valid project in tenant
- title: Required, 3-255 characters
- description: Optional, max 2000 characters
- priority: Required, must be 1 (low), 2 (medium), or 3 (high)
- assignedTo: Optional, must be valid user in tenant
- dueDate: Optional, must be future date in YYYY-MM-DD format

**Error Response (400):**
```json
{
  "success": false,
  "message": "Assigned user must belong to the same tenant",
  "data": null
}
```

---

### 3.3 Get Task Details

**Endpoint:** `GET /api/tasks/:taskId`

**Authentication:** Required (JWT)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "tenantId": "550e8400-e29b-41d4-a716-446655440001",
    "projectId": "550e8400-e29b-41d4-a716-446655440010",
    "title": "Design homepage mockup",
    "description": "Create high-fidelity mockup for the homepage",
    "status": "in_progress",
    "priority": 3,
    "assignedTo": "550e8400-e29b-41d4-a716-446655440002",
    "dueDate": "2025-02-15",
    "createdBy": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T14:20:00Z",
    "project": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "name": "Website Redesign"
    },
    "assignedUser": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "David Patel",
      "email": "david@techstart.com"
    }
  }
}
```

---

### 3.4 Update Task

**Endpoint:** `PUT /api/tasks/:taskId`

**Authentication:** Required (JWT)

**Authorization:** Task creator, project creator, or tenant admin

**Request Body:**
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "priority": 2,
  "assignedTo": "550e8400-e29b-41d4-a716-446655440003",
  "dueDate": "2025-02-20"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "title": "Updated task title",
    "priority": 2,
    "updatedAt": "2025-01-15T15:30:00Z"
  }
}
```

---

### 3.5 Update Task Status

**Endpoint:** `PATCH /api/tasks/:taskId/status`

**Authentication:** Required (JWT)

**Authorization:** Task creator, assigned user, project creator, or admin

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "status": "in_progress",
    "updatedAt": "2025-01-15T14:20:00Z"
  }
}
```

**Valid Status Values:**
- `pending` - Task not started
- `in_progress` - Task is being worked on
- `completed` - Task is finished

**Notes:**
- Users can only update status if they're the assignee, creator, or admin
- Status change triggers notification to team

---

### 3.6 Delete Task

**Endpoint:** `DELETE /api/tasks/:taskId`

**Authentication:** Required (JWT)

**Authorization:** Task creator, project creator, or tenant admin

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": null
}
```

---

## 4. User Management Endpoints

### 4.1 Get All Users

**Endpoint:** `GET /api/users`

**Authentication:** Required (JWT)

**Authorization:** Tenant admin or super admin

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `role` (optional): Filter by role (user, tenant_admin)
- `isActive` (optional): Filter by status (true/false)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "admin@techstart.com",
        "name": "Sarah Johnson",
        "role": "tenant_admin",
        "isActive": true,
        "createdAt": "2025-01-15T10:30:00Z",
        "updatedAt": "2025-01-15T10:30:00Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "email": "david@techstart.com",
        "name": "David Patel",
        "role": "user",
        "isActive": true,
        "createdAt": "2025-01-15T10:35:00Z",
        "updatedAt": "2025-01-15T10:35:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Only tenant admins can view users",
  "data": null
}
```

---

### 4.2 Create User

**Endpoint:** `POST /api/users`

**Authentication:** Required (JWT)

**Authorization:** Tenant admin

**Request Body:**
```json
{
  "email": "david@techstart.com",
  "name": "David Patel",
  "password": "SecurePassword123!",
  "role": "user"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "email": "david@techstart.com",
    "name": "David Patel",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-01-15T10:35:00Z",
    "updatedAt": "2025-01-15T10:35:00Z"
  }
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "User limit exceeded for current subscription plan",
  "data": null
}
```

**Validation Rules:**
- email: Required, valid format, unique within tenant
- name: Required, 2-100 characters
- password: Required, min 8 chars, must include uppercase, lowercase, number, special char
- role: Optional (default: user), must be "user" or "tenant_admin"

---

### 4.3 Get User Details

**Endpoint:** `GET /api/users/:userId`

**Authentication:** Required (JWT)

**Authorization:** Self, tenant admin, or super admin

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "email": "david@techstart.com",
    "name": "David Patel",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-01-15T10:35:00Z",
    "updatedAt": "2025-01-15T10:35:00Z",
    "createdProjects": 3,
    "assignedTasks": 5
  }
}
```

---

### 4.4 Update User

**Endpoint:** `PUT /api/users/:userId`

**Authentication:** Required (JWT)

**Authorization:** Self or tenant admin

**Request Body:**
```json
{
  "name": "David Patel Updated",
  "email": "david.patel@techstart.com",
  "password": "NewPassword123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "email": "david.patel@techstart.com",
    "name": "David Patel Updated",
    "role": "user",
    "isActive": true,
    "updatedAt": "2025-01-15T16:00:00Z"
  }
}
```

**Notes:**
- Users can update their own profile
- Tenant admins can update any user
- Password change is logged in audit trail

---

### 4.5 Change User Role

**Endpoint:** `PUT /api/users/:userId/role`

**Authentication:** Required (JWT)

**Authorization:** Tenant admin only

**Request Body:**
```json
{
  "role": "tenant_admin"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "role": "tenant_admin",
    "updatedAt": "2025-01-15T16:05:00Z"
  }
}
```

**Valid Roles:**
- `user` - Regular user (can create projects, assigned tasks)
- `tenant_admin` - Admin (can manage users, all projects)

---

### 4.6 Delete User

**Endpoint:** `DELETE /api/users/:userId`

**Authentication:** Required (JWT)

**Authorization:** Tenant admin

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "Cannot delete user with active projects assigned",
  "data": null
}
```

**Notes:**
- Cannot delete self (must transfer ownership to another admin first)
- User deletion is soft delete by default (isActive = false)

---

## 5. Tenant Management Endpoints (Admin Only)

### 5.1 Get All Tenants

**Endpoint:** `GET /api/tenants`

**Authentication:** Required (JWT)

**Authorization:** Super admin only

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tenants retrieved successfully",
  "data": {
    "tenants": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "TechStart Inc.",
        "subdomain": "techstart",
        "subscriptionPlan": "free",
        "maxUsers": 5,
        "maxProjects": 10,
        "status": "active",
        "userCount": 2,
        "projectCount": 3,
        "createdAt": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 5.2 Get Tenant Details

**Endpoint:** `GET /api/tenants/:tenantId`

**Authentication:** Required (JWT)

**Authorization:** Super admin or tenant member

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tenant retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "TechStart Inc.",
    "subdomain": "techstart",
    "subscriptionPlan": "free",
    "maxUsers": 5,
    "maxProjects": 10,
    "status": "active",
    "userCount": 2,
    "projectCount": 3,
    "taskCount": 5,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z",
    "usage": {
      "users": 2,
      "projects": 3,
      "storage": "256MB"
    }
  }
}
```

---

### 5.3 Update Tenant Subscription

**Endpoint:** `PUT /api/tenants/:tenantId/subscription`

**Authentication:** Required (JWT)

**Authorization:** Super admin

**Request Body:**
```json
{
  "subscriptionPlan": "pro",
  "maxUsers": 20,
  "maxProjects": 50
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "subscriptionPlan": "pro",
    "maxUsers": 20,
    "maxProjects": 50,
    "status": "active",
    "updatedAt": "2025-01-15T17:00:00Z"
  }
}
```

**Valid Subscription Plans:**
- `free` - maxUsers: 5, maxProjects: 10
- `pro` - maxUsers: 20, maxProjects: 50
- `enterprise` - maxUsers: unlimited, maxProjects: unlimited

---

## 6. Health Check Endpoint

### 6.1 System Health Status

**Endpoint:** `GET /health`

**Authentication:** Not required

**Success Response (200 - Healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T17:30:00Z",
  "uptime": 86400,
  "database": "connected",
  "version": "1.0.0"
}
```

**Error Response (503 - Unhealthy):**
```json
{
  "status": "unhealthy",
  "timestamp": "2025-01-15T17:30:00Z",
  "database": "disconnected",
  "error": "Unable to connect to PostgreSQL database",
  "version": "1.0.0"
}
```

**Notes:**
- Use this endpoint for load balancer health checks
- Response includes database connectivity status
- Uptime in seconds

---

## Error Handling

### Error Response Format

All errors follow standard format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### Common Error Codes

| Status | Code | Message | Cause |
|--------|------|---------|-------|
| 400 | BAD_REQUEST | Validation error | Invalid input data |
| 401 | UNAUTHORIZED | Invalid or expired token | Missing/invalid JWT |
| 403 | FORBIDDEN | Access denied | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found | ID doesn't exist |
| 409 | CONFLICT | Resource already exists | Duplicate entry |
| 429 | TOO_MANY_REQUESTS | Rate limit exceeded | Too many requests |
| 500 | INTERNAL_ERROR | Server error | Unexpected error |

---

## Rate Limiting

**Default Limits:**
- 100 requests per 15 minutes per IP
- Login endpoint: 5 attempts per 15 minutes
- Register endpoint: 10 per hour

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 75
X-RateLimit-Reset: 1642294800
```

**When Limit Exceeded (429):**
```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "data": {
    "retryAfter": 300
  }
}
```

---

## Pagination

Paginated endpoints support:
- `page` - Page number (1-based, default: 1)
- `limit` - Results per page (1-100, default: 10)

**Response includes:**
```json
{
  "data": [
    { /* items */ }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

## Best Practices

1. **Always include JWT in Authorization header**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```

2. **Handle 401 responses by redirecting to login**
   - Token expired - request new login
   - Invalid token - clear localStorage and redirect to login

3. **Implement retry logic for network errors**
   - Exponential backoff recommended
   - Maximum 3 retries

4. **Validate all inputs on client side**
   - Check password requirements before submission
   - Validate email format
   - Validate required fields

5. **Cache responses appropriately**
   - User profile: Cache for 5 minutes
   - Projects list: Cache for 1 minute
   - Tasks: No caching (real-time updates)

---

**Document Version:** 1.0
**Last Updated:** December 27, 2025
**Total Endpoints:** 19 documented
**Status:** Complete - Ready for Integration
