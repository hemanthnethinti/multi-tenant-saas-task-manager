# Architecture Document

## System Architecture Overview

The Multi-Tenant SaaS Task Manager is built on a modern, scalable three-tier architecture consisting of frontend, backend API, and data persistence layers.

---

## 1. High-Level System Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Web Browser                                              │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  React 18 Application (Single Page Application)     │ │  │
│  │  │  ├─ Pages: Dashboard, Projects, Tasks, Users        │ │  │
│  │  │  ├─ Components: Layout, Navigation, Forms           │ │  │
│  │  │  ├─ State: Context API (Authentication)             │ │  │
│  │  │  └─ HTTP Client: Axios                              │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│                     Runs on http://localhost:3001                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              │ JWT Authentication
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Node.js 18 + Express.js API Server                      │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  Middleware Stack                                    │ │  │
│  │  │  ├─ CORS Configuration                               │ │  │
│  │  │  ├─ Body Parser & JSON                               │ │  │
│  │  │  ├─ Authentication (JWT verification)                │ │  │
│  │  │  ├─ Authorization (Role-based access control)        │ │  │
│  │  │  └─ Error Handler                                    │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  REST API Endpoints (19 endpoints)                   │ │  │
│  │  │  ├─ Authentication: /api/auth/*                      │ │  │
│  │  │  ├─ Projects: /api/projects/*                        │ │  │
│  │  │  ├─ Tasks: /api/tasks/*                              │ │  │
│  │  │  ├─ Users: /api/users/*                              │ │  │
│  │  │  ├─ Tenants: /api/tenants/* (admin only)             │ │  │
│  │  │  └─ Health: /health                                  │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  Controllers                                         │ │  │
│  │  │  ├─ authController.js (Login, Register, Logout)     │ │  │
│  │  │  ├─ projectController.js (Project CRUD)             │ │  │
│  │  │  ├─ taskController.js (Task CRUD)                   │ │  │
│  │  │  ├─ userController.js (User CRUD)                   │ │  │
│  │  │  └─ tenantController.js (Tenant Management)         │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  Business Logic                                      │ │  │
│  │  │  ├─ Service Classes (for complex operations)         │ │  │
│  │  │  ├─ Validation Logic (input/data validation)         │ │  │
│  │  │  └─ Authorization Checks (multi-tenant isolation)    │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  Utilities & Helpers                                 │ │  │
│  │  │  ├─ JWT Token Generator & Verifier                   │ │  │
│  │  │  ├─ Password Hashing (bcryptjs)                      │ │  │
│  │  │  ├─ Error Handlers                                   │ │  │
│  │  │  └─ Logger                                           │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│                  Runs on http://localhost:5001                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ PostgreSQL Protocol
                              │ Connection Pooling
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL 15 Database                                  │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  Multi-Tenant Schema Design                          │ │  │
│  │  │  ┌──────────────┐      ┌──────────────┐             │ │  │
│  │  │  │  tenants     │      │  audit_logs  │             │ │  │
│  │  │  │  (id)        │◄─────│  (id)        │             │ │  │
│  │  │  │  (name)      │      │  (tenant_id) │             │ │  │
│  │  │  │  (subdomain) │      │  (action)    │             │ │  │
│  │  │  └──────────────┘      └──────────────┘             │ │  │
│  │  │         △                                             │ │  │
│  │  │         │ (1:N)                                       │ │  │
│  │  │         │                                             │ │  │
│  │  │  ┌──────────────┐      ┌──────────────┐             │ │  │
│  │  │  │    users     │      │  projects    │             │ │  │
│  │  │  │  (id)        │      │  (id)        │             │ │  │
│  │  │  │  (tenant_id) │      │  (tenant_id) │             │ │  │
│  │  │  │  (email)     │      │  (created_by)┼─────────┐   │ │  │
│  │  │  │  (role)      │      │  (name)      │         │   │ │  │
│  │  │  └──────────────┘      └──────────────┘         │   │ │  │
│  │  │         △                      △                │   │ │  │
│  │  │         │                      │                │   │ │  │
│  │  │         └─────────────────┬────┘                │   │ │  │
│  │  │                           │                     │   │ │  │
│  │  │                    ┌──────────────┐             │   │ │  │
│  │  │                    │    tasks     │             │   │ │  │
│  │  │                    │  (id)        │             │   │ │  │
│  │  │                    │  (tenant_id) │             │   │ │  │
│  │  │                    │  (project_id)├─────────────┘   │ │  │
│  │  │                    │  (assigned_to)                 │ │  │
│  │  │                    │  (status)    │                 │ │  │
│  │  │                    │  (priority)  │                 │ │  │
│  │  │                    └──────────────┘                 │ │  │
│  │  │  ┌─────────────────────────────────────────────┐   │ │  │
│  │  │  │  Indexes                                     │   │ │  │
│  │  │  │  ├─ (tenant_id) on all tables               │   │ │  │
│  │  │  │  ├─ (tenant_id, email) UNIQUE on users      │   │ │  │
│  │  │  │  ├─ (tenant_id) on projects, tasks          │   │ │  │
│  │  │  │  └─ (project_id) on tasks                   │   │ │  │
│  │  │  └─────────────────────────────────────────────┘   │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  ORM (Sequelize)                                    │ │  │
│  │  │  ├─ Model Definitions (User, Project, Task, etc.)   │ │  │
│  │  │  ├─ Migrations (version control for schema)         │ │  │
│  │  │  ├─ Query Builder (type-safe queries)               │ │  │
│  │  │  └─ Association Handling (relationships)            │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│             Runs on postgresql://localhost:5433                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Entity Relationship Diagram (ERD)

### ERD Visual

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│   ┌────────────────────────────────────────────────────────────┐  │
│   │ TENANTS (Root Entity)                                      │  │
│   ├────────────────────────────────────────────────────────────┤  │
│   │ PK: id (UUID)                                              │  │
│   │    name (VARCHAR) - Organization name                      │  │
│   │    subdomain (VARCHAR UNIQUE) - Tenant URL identifier      │  │
│   │    subscription_plan (VARCHAR) - free/pro/enterprise       │  │
│   │    max_users (INTEGER) - Subscription limit                │  │
│   │    max_projects (INTEGER) - Subscription limit             │  │
│   │    status (VARCHAR) - active/suspended/inactive            │  │
│   │    created_at (TIMESTAMP)                                  │  │
│   │    updated_at (TIMESTAMP)                                  │  │
│   └────────────────────────────────────────────────────────────┘  │
│                          │                                         │
│                 ┌────────┴────────┐                                │
│                 │ 1:N Relationship│                                │
│                 ▼                 ▼                                │
│   ┌─────────────────────────┐ ┌────────────────────────────────┐  │
│   │ USERS                   │ │ PROJECTS                       │  │
│   ├─────────────────────────┤ ├────────────────────────────────┤  │
│   │ PK: id (UUID)           │ │ PK: id (UUID)                  │  │
│   │ FK: tenant_id (UUID)    │ │ FK: tenant_id (UUID)           │  │
│   │    email (VARCHAR)      │ │ FK: created_by (UUID -> users) │  │
│   │    name (VARCHAR)       │ │    name (VARCHAR)              │  │
│   │    password_hash (TEXT) │ │    description (TEXT)          │  │
│   │    role (VARCHAR)       │ │    status (VARCHAR)            │  │
│   │    is_active (BOOLEAN)  │ │    created_at (TIMESTAMP)      │  │
│   │    created_at (TIMESTAMP│ │    updated_at (TIMESTAMP)      │  │
│   │    updated_at (TIMESTAMP│ │                                │  │
│   │                         │ │    UNI: (tenant_id, email)     │  │
│   │    UNIQUE (tenant_id,   │ │                                │  │
│   │            email)       │ │ UNI: (tenant_id, name)         │  │
│   └─────────────────────────┘ └────────────────────────────────┘  │
│        △              │                    △                       │
│        │ FK           │                    │ FK (created_by)       │
│        │ assigned_to  │                    │                       │
│        └──────────────┼────────────────────┘                       │
│                       │                                            │
│                       ▼                                            │
│   ┌────────────────────────────────────────────────────────────┐  │
│   │ TASKS                                                      │  │
│   ├────────────────────────────────────────────────────────────┤  │
│   │ PK: id (UUID)                                              │  │
│   │ FK: tenant_id (UUID)                                       │  │
│   │ FK: project_id (UUID) -> PROJECTS(id)                      │  │
│   │ FK: assigned_to (UUID) -> USERS(id)                        │  │
│   │    title (VARCHAR)                                         │  │
│   │    description (TEXT)                                      │  │
│   │    status (VARCHAR) - pending/in_progress/completed        │  │
│   │    priority (INTEGER) - 1 (low), 2 (medium), 3 (high)      │  │
│   │    due_date (DATE)                                         │  │
│   │    created_by (UUID) -> USERS(id)                          │  │
│   │    created_at (TIMESTAMP)                                  │  │
│   │    updated_at (TIMESTAMP)                                  │  │
│   │                                                            │  │
│   │    INDEX: (tenant_id)                                      │  │
│   │    INDEX: (project_id)                                     │  │
│   │    INDEX: (assigned_to)                                    │  │
│   └────────────────────────────────────────────────────────────┘  │
│                       ▲                                            │
│                       │ 1:N Relationship                           │
│                       │                                            │
│   ┌────────────────────────────────────────────────────────────┐  │
│   │ AUDIT_LOGS                                                 │  │
│   ├────────────────────────────────────────────────────────────┤  │
│   │ PK: id (UUID)                                              │  │
│   │ FK: tenant_id (UUID)                                       │  │
│   │ FK: user_id (UUID) -> USERS(id)                            │  │
│   │    action (VARCHAR) - CREATE/UPDATE/DELETE/LOGIN           │  │
│   │    entity_type (VARCHAR) - user/project/task               │  │
│   │    entity_id (UUID)                                        │  │
│   │    old_values (JSONB) - Previous state                     │  │
│   │    new_values (JSONB) - Current state                      │  │
│   │    ip_address (VARCHAR)                                    │  │
│   │    user_agent (TEXT)                                       │  │
│   │    created_at (TIMESTAMP)                                  │  │
│   │                                                            │  │
│   │    INDEX: (tenant_id)                                      │  │
│   │    INDEX: (user_id)                                        │  │
│   │    INDEX: (created_at)                                     │  │
│   │    INDEX: (action)                                         │  │
│   └────────────────────────────────────────────────────────────┘  │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘

Data Isolation:
- Every row in users, projects, tasks has tenant_id
- Queries filter by tenant_id to ensure isolation
- Audit logs track all changes for compliance
- Foreign keys ensure referential integrity
- Indexes optimize multi-tenant queries
```

---

## 3. API Architecture

### API Endpoints Reference

#### 3.1 Authentication Endpoints

| Method | Endpoint | Auth Required | Role Required | Purpose |
|--------|----------|---------------|---------------|---------|
| POST | `/api/auth/register` | No | - | Register new organization and user |
| POST | `/api/auth/login` | No | - | Login and receive JWT token |
| POST | `/api/auth/logout` | Yes | Any | Logout (client-side token removal) |
| GET | `/api/auth/me` | Yes | Any | Get current user and tenant info |

**Register Request:**
```json
{
  "tenantName": "TechStart Inc.",
  "subdomain": "techstart",
  "email": "admin@techstart.com",
  "name": "John Doe",
  "password": "SecurePassword123!"
}
```

**Register Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@techstart.com",
      "name": "John Doe",
      "role": "tenant_admin"
    },
    "tenant": {
      "id": "uuid",
      "name": "TechStart Inc.",
      "subdomain": "techstart",
      "subscriptionPlan": "free",
      "maxUsers": 5,
      "maxProjects": 10
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Login Request:**
```json
{
  "email": "admin@techstart.com",
  "password": "SecurePassword123!"
}
```

**Login Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@techstart.com",
      "name": "John Doe",
      "role": "tenant_admin"
    },
    "tenant": {
      "id": "uuid",
      "name": "TechStart Inc.",
      "subdomain": "techstart",
      "subscriptionPlan": "free",
      "maxUsers": 5,
      "maxProjects": 10,
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 3.2 Project Endpoints

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| GET | `/api/projects` | Yes | Any | Get all tenant projects (user isolation) |
| POST | `/api/projects` | Yes | Any | Create new project |
| GET | `/api/projects/:id` | Yes | Any | Get project details |
| PUT | `/api/projects/:id` | Yes | tenant_admin, creator | Update project |
| DELETE | `/api/projects/:id` | Yes | tenant_admin, creator | Delete project |
| GET | `/api/projects/stats` | Yes | Any | Get project statistics |

**Create Project Request:**
```json
{
  "name": "Website Redesign",
  "description": "Redesign company website for better UX"
}
```

**Create Project Response:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "name": "Website Redesign",
    "description": "Redesign company website...",
    "createdBy": "uuid",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

#### 3.3 Task Endpoints

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| GET | `/api/tasks` | Yes | Any | Get all tenant tasks (user isolation) |
| POST | `/api/tasks` | Yes | Any | Create new task |
| GET | `/api/tasks/:id` | Yes | Any | Get task details |
| PUT | `/api/tasks/:id` | Yes | creator, assignee, admin | Update task |
| PATCH | `/api/tasks/:id/status` | Yes | creator, assignee, admin | Update task status |
| DELETE | `/api/tasks/:id` | Yes | creator, admin | Delete task |
| GET | `/api/projects/:projectId/tasks` | Yes | Any | Get project tasks |

**Create Task Request:**
```json
{
  "projectId": "uuid",
  "title": "Design homepage mockup",
  "description": "Create high-fidelity mockup for homepage",
  "priority": 3,
  "assignedTo": "uuid",
  "dueDate": "2025-02-15"
}
```

**Create Task Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "projectId": "uuid",
    "title": "Design homepage mockup",
    "description": "Create high-fidelity mockup...",
    "status": "pending",
    "priority": 3,
    "assignedTo": "uuid",
    "dueDate": "2025-02-15",
    "createdBy": "uuid",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

**Update Task Status Request:**
```json
{
  "status": "in_progress"
}
```

#### 3.4 User Endpoints (Admin Only)

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| GET | `/api/users` | Yes | tenant_admin, super_admin | Get all tenant users |
| POST | `/api/users` | Yes | tenant_admin | Create new user |
| GET | `/api/users/:id` | Yes | tenant_admin, super_admin, self | Get user details |
| PUT | `/api/users/:id` | Yes | tenant_admin, self | Update user |
| DELETE | `/api/users/:id` | Yes | tenant_admin | Delete user |
| PUT | `/api/users/:id/role` | Yes | tenant_admin | Change user role |

**Create User Request:**
```json
{
  "email": "david@techstart.com",
  "name": "David Patel",
  "password": "SecurePassword123!",
  "role": "user"
}
```

**Create User Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "email": "david@techstart.com",
    "name": "David Patel",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

#### 3.5 Tenant Endpoints (Super Admin Only)

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| GET | `/api/tenants` | Yes | super_admin | Get all tenants |
| POST | `/api/tenants` | Yes | super_admin | Create new tenant |
| GET | `/api/tenants/:id` | Yes | super_admin | Get tenant details |
| PUT | `/api/tenants/:id` | Yes | super_admin | Update tenant |
| DELETE | `/api/tenants/:id` | Yes | super_admin | Delete tenant |
| PUT | `/api/tenants/:id/subscription` | Yes | super_admin | Update subscription |

#### 3.6 Health & Status Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/health` | No | System health check |

**Health Response (Healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "uptime": 3600,
  "database": "connected",
  "version": "1.0.0"
}
```

**Health Response (Unhealthy):**
```json
{
  "status": "unhealthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "uptime": 3600,
  "database": "disconnected",
  "error": "Unable to connect to database",
  "version": "1.0.0"
}
```

---

## 4. Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                              │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 1. User enters credentials (email, password)          │   │
│ └───────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP POST /api/auth/login
                         │ { email, password }
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ SERVER (Node.js + Express)                                   │
│                                                               │
│ 2. Receive login request                                     │
│ 3. Validate input (email format, password exists)            │
│ 4. Query database for user by email                          │
│ 5. Compare password hash using bcrypt.compare()             │
│    ├─ Hash mismatch → Return 401 Unauthorized               │
│    └─ Hash match → Continue to step 6                       │
│ 6. Create JWT token containing:                             │
│    {                                                         │
│      userId: user.id,                                        │
│      tenantId: user.tenant_id,                               │
│      role: user.role,                                        │
│      iat: currentTime,                                       │
│      exp: currentTime + 24 hours                             │
│    }                                                         │
│ 7. Return 200 with JWT token + user + tenant data           │
└────────────────────────────────────────────────────────────┘
                         │ HTTP 200 OK
                         │ {
                         │   token: "jwt_token...",
                         │   user: { id, email, role },
                         │   tenant: { id, name, plan }
                         │ }
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                              │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 8. Receive JWT token                                  │   │
│ │ 9. Store token in localStorage                        │   │
│ │ 10. Store user + tenant in Context API state          │   │
│ │ 11. Redirect to Dashboard                             │   │
│ └───────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
                         │
                ┌────────┴────────┐
                │ Subsequent API  │
                │ Requests        │
                ▼
┌─────────────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                              │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 12. Every API call includes JWT in Authorization header:  │
│ │     Authorization: Bearer eyJhbGciOiJIUzI1NiIs...        │
│ └───────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
                         │ HTTP GET /api/projects
                         │ Headers: { Authorization: Bearer ... }
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ SERVER (Node.js + Express)                                   │
│                                                               │
│ 13. Middleware receives request                              │
│ 14. Extract JWT from Authorization header                    │
│ 15. Verify JWT signature using JWT_SECRET                    │
│     ├─ Invalid signature → Return 401 Unauthorized           │
│     ├─ Expired token → Return 401 Unauthorized               │
│     └─ Valid token → Extract payload                         │
│ 16. Attach decoded user info to req.user:                    │
│     req.user = {                                             │
│       userId: "...",                                         │
│       tenantId: "...",                                       │
│       role: "..."                                            │
│     }                                                        │
│ 17. Continue to route handler                                │
│ 18. Route handler validates tenant_id on all queries:        │
│     const projects = await db.projects.findAll({            │
│       where: { tenant_id: req.user.tenantId }               │
│     })                                                       │
└────────────────────────────────────────────────────────────┘
                         │ HTTP 200 OK
                         │ { data: projects }
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                              │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 19. Receive response with user's tenant projects      │   │
│ │ 20. Render projects in UI                             │   │
│ └───────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Multi-Tenancy Data Isolation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ TENANT A (Acme Corp)           │ TENANT B (TechStart Inc.)       │
│ ┌────────────────────────────┐  │ ┌─────────────────────────────┐ │
│ │ users@acme.com            │  │ │ admin@techstart.com          │ │
│ │ → Login                    │  │ │ → Login                      │ │
│ │                            │  │ │                              │ │
│ │ JWT Token A:               │  │ │ JWT Token B:                 │ │
│ │ {                          │  │ │ {                            │ │
│ │   tenantId: "acme-uuid"    │  │ │   tenantId: "techstart-uuid" │ │
│ │ }                          │  │ │ }                            │ │
│ └────────────────────────────┘  │ └─────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                   │                              │
       ┌───────────┴──────────────────────────────┴──────────────┐
       │ Both make request to: GET /api/projects                 │
       ▼                                                         ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│ REQUEST A                            │  │ REQUEST B                    │
│ Authorization: Bearer TokenA         │  │ Authorization: Bearer TokenB │
└──────────────────────────────────────┘  └──────────────────────────────┘
       │                                              │
       └──────────────────────┬───────────────────────┘
                              │
                    ┌─────────▼────────┐
                    │ SERVER Receives  │
                    │ Both Requests    │
                    └─────────┬────────┘
                              │
        ┌─────────────────────┴──────────────────────┐
        │                                            │
   REQ A                                        REQ B
   │                                            │
   ▼                                            ▼
Verify Token A             ├─ Verify Token B
Extract tenantId: acme-uuid    Extract tenantId: techstart-uuid
   │                                │
   └────────────────────┬───────────┘
                        ▼
        ┌───────────────────────────────┐
        │ Query Database:               │
        │ SELECT * FROM projects        │
        │ WHERE tenant_id = ?           │
        │                               │
        │ REQ A: ? = "acme-uuid"        │
        │ REQ B: ? = "techstart-uuid"   │
        └───────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
   ┌────▼─────────────────┐   ┌────────▼───────────────┐
   │ Returns only Acme    │   │ Returns only TechStart  │
   │ projects (3)         │   │ projects (5)            │
   │                      │   │                         │
   │ ✓ Project A          │   │ ✓ Project X             │
   │ ✓ Project B          │   │ ✓ Project Y             │
   │ ✓ Project C          │   │ ✓ Project Z             │
   │ ✗ Project X (denied) │   │ ✗ Project A (denied)    │
   │ ✗ Project Y (denied) │   │ ✗ Project B (denied)    │
   │ ✗ Project Z (denied) │   │ ✗ Project C (denied)    │
   └────┬─────────────────┘   └────────┬───────────────┘
        │                              │
        │  Response A:                 │  Response B:
        │  [                           │  [
        │    { id: "project-a", ...}  │    { id: "project-x", ...}
        │    { id: "project-b", ...}  │    { id: "project-y", ...}
        │    { id: "project-c", ...}  │    { id: "project-z", ...}
        │  ]                           │  ]
        └──────────┬────────────────────┘
                   │
           Complete Data Isolation
           Each tenant sees only their data
```

---

## 6. Deployment Architecture

### Docker Compose Setup

```yaml
version: '3.8'

services:
  # Database Layer
  db:
    image: postgres:15-alpine
    ports:
      - "5433:5432"
    environment:
      POSTGRES_DB: saas_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - ./backend/db/init.sql:/docker-entrypoint-initdb.d/init.sql
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API Layer
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5001:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/saas_db
      JWT_SECRET: your-secret-key
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Frontend Layer
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3001:80"
    environment:
      REACT_APP_API_URL: http://localhost:5001
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Container Interactions

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Host Network                     │
│                                                               │
│  ┌──────────────────┐    ┌──────────────────┐                │
│  │   Frontend       │    │    Backend       │                │
│  │   Container      │    │    Container     │                │
│  │  (React + nginx) │    │  (Node.js)       │                │
│  │   port: 3001     │    │   port: 5001     │                │
│  │   :80 internally │    │   :3000 internal │                │
│  │                  │    │                  │                │
│  │  ┌────────────┐  │    │  ┌────────────┐  │                │
│  │  │ http://    │  │    │  │ express    │  │                │
│  │  │ localhost: │  │    │  │ app.js     │  │                │
│  │  │ 3001       │  │    │  │            │  │                │
│  │  └────────────┘  │    │  │ API Routes │  │                │
│  │                  │    │  │            │  │                │
│  │ AXIOS requests   │    │  │ Middleware │  │                │
│  │ to backend:      │    │  │ - Auth     │  │                │
│  │ http://backend   │    │  │ - CORS     │  │                │
│  │ :5001/api        │    │  │ - Logging  │  │                │
│  └──────────────────┘    └────────┬───────┘                 │
│                                   │                          │
│                           queries database                   │
│                                   │                          │
│                          ┌────────▼────────┐                 │
│                          │   Database      │                 │
│                          │   Container     │                 │
│                          │  (PostgreSQL)   │                 │
│                          │   port: 5433    │                 │
│                          │   :5432 internal│                 │
│                          │                 │                 │
│                          │ postgres://db   │                 │
│                          │ :5432/saas_db   │                 │
│                          │                 │                 │
│                          │ Tables:         │                 │
│                          │ - tenants       │                 │
│                          │ - users         │                 │
│                          │ - projects      │                 │
│                          │ - tasks         │                 │
│                          │ - audit_logs    │                 │
│                          └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Scalability Considerations

### Horizontal Scaling Strategy

```
┌──────────────────────────────────────────────────────┐
│ Load Balancer (e.g., nginx, AWS ELB)                 │
│                                                       │
│ Distributes traffic based on:                        │
│ - Round-robin                                        │
│ - Least connections                                  │
│ - IP hash (sticky sessions)                          │
└──────────────┬──────────────────────────────────────┘
               │
    ┌──────────┼──────────┬──────────┐
    │          │          │          │
    ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Backend │ │Backend │ │Backend │ │Backend │
│API #1  │ │API #2  │ │API #3  │ │API #N  │
│        │ │        │ │        │ │        │
│Node.js │ │Node.js │ │Node.js │ │Node.js │
└───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
    │          │          │          │
    └──────────┼──────────┼──────────┘
               │
        ┌──────▼────────┐
        │ PostgreSQL    │
        │ Primary DB    │
        │              │
        │ Connection   │
        │ Pool: 20     │
        └──────┬───────┘
               │
        ┌──────▼───────┐
        │ PostgreSQL   │
        │ Replica      │
        │ (Read-Only)  │
        └──────────────┘
```

### Database Scaling

**Read Replicas:**
- Configure PostgreSQL replication for read-heavy workloads
- Distribute SELECT queries to replicas
- Write operations always go to primary

**Caching Layer:**
- Redis for frequently accessed data
- Cache user roles and permissions
- Cache project list summaries
- 5-minute TTL for consistency

**Database Optimization:**
- Indexes on tenant_id (all tables)
- Indexes on project_id (tasks table)
- Indexes on status, priority, due_date (tasks table)
- Regular VACUUM and ANALYZE

---

## 8. Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ HTTPS Only                                       │   │
│  │ Secure Cookies (HttpOnly, Secure flags)         │   │
│  │ Content Security Policy (CSP) Headers           │   │
│  │ X-Frame-Options: DENY                           │   │
│  │ X-Content-Type-Options: nosniff                 │   │
│  └──────────────────────────────────────────────────┘   │
│                         │                                │
│              HTTPS/TLS Encrypted                        │
│                         │                                │
└─────────────────────────┼────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────┐
│  API Gateway / WAF      │ (Web Application Firewall)     │
│                         │                                │
│  ✓ Rate Limiting        │ Blocks malicious requests      │
│  ✓ IP Whitelisting      │ DDoS protection                │
│  ✓ Request Validation   │ SQL Injection blocking         │
│  ✓ Signature Validation │ XSS blocking                   │
└─────────────────────────┼────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────┐
│             Express Server                               │
│                         │                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Security Middleware (helmet.js)                   │  │
│  │ ├─ Strict-Transport-Security                      │  │
│  │ ├─ X-Frame-Options                               │  │
│  │ ├─ Content-Security-Policy                       │  │
│  │ └─ Other security headers                        │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Authentication Middleware                         │  │
│  │ ├─ JWT Verification                              │  │
│  │ ├─ Token Expiration Check                        │  │
│  │ └─ Signature Validation                          │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Authorization Middleware                          │  │
│  │ ├─ Role-based Access Control                      │  │
│  │ ├─ Tenant Isolation Checks                        │  │
│  │ └─ Resource Ownership Validation                  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Input Validation & Sanitization                   │  │
│  │ ├─ Schema Validation (express-validator)          │  │
│  │ ├─ SQL Injection Prevention (parameterized)       │  │
│  │ ├─ XSS Prevention (escaping)                      │  │
│  │ └─ CSRF Protection                                │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Audit Logging                                     │  │
│  │ ├─ All database modifications logged              │  │
│  │ ├─ User authentication logged                     │  │
│  │ ├─ Failed access attempts logged                  │  │
│  │ └─ Immutable audit trail                          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
            Encrypted Connection (SSL/TLS)
                         │
┌─────────────────────────┼────────────────────────────────┐
│          PostgreSQL Database                              │
│                                                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Database Level Security                          │   │
│  │ ├─ User authentication required                  │   │
│  │ ├─ Password hashed with SHA-256                  │   │
│  │ ├─ Principle of least privilege (app user)       │   │
│  │ ├─ Row-Level Security (RLS) policies             │   │
│  │ └─ No direct internet access                     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Data Encryption                                  │   │
│  │ ├─ Password fields hashed (bcrypt)               │   │
│  │ ├─ Sensitive data at rest encrypted              │   │
│  │ └─ Backup encryption enabled                     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Audit Trail (audit_logs table)                   │   │
│  │ ├─ All modifications recorded                    │   │
│  │ ├─ User and timestamp tracked                    │   │
│  │ ├─ Before/after values stored                    │   │
│  │ └─ Compliance evidence collection                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Backups                                          │   │
│  │ ├─ Daily automated backups                       │   │
│  │ ├─ 7-day retention                               │   │
│  │ ├─ Encrypted storage                             │   │
│  │ └─ Tested restore procedures                     │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## 9. Technology Stack Summary

| Layer | Component | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 18.2.0 | UI Framework |
| | React Router | 6.x | Client-side routing |
| | Axios | 1.x | HTTP client |
| | CSS3 | Latest | Styling |
| **Backend** | Node.js | 18.x | Runtime |
| | Express.js | 4.x | Web framework |
| | Sequelize | 6.x | ORM |
| | bcryptjs | 2.x | Password hashing |
| | jsonwebtoken | 9.x | JWT handling |
| **Database** | PostgreSQL | 15.x | Relational database |
| | pg | 8.x | Database driver |
| **Deployment** | Docker | Latest | Containerization |
| | Docker Compose | 3.8 | Container orchestration |
| **Security** | helmet | 7.x | Security headers |
| | express-validator | 7.x | Input validation |
| | cors | 2.x | CORS handling |

---

## 10. Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time | < 500ms | 95th percentile |
| Page Load Time | < 2s | 4G network |
| Database Query Time | < 100ms | Average |
| Concurrent Users | 1000+ | Load test |
| Uptime | 99.9% | Monthly |
| Error Rate | < 0.1% | All requests |
| Database Replication Lag | < 1s | Real-time |

---

**Document Version:** 1.0
**Last Updated:** December 27, 2025
**Status:** Complete - Ready for Implementation
