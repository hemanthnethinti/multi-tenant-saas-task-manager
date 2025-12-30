# 🚀 TaskFlow - Multi-Tenant SaaS Task Management Platform

A production-ready, multi-tenant SaaS application with Node.js, React, PostgreSQL, and Docker. **Fully CRUD-enabled on all pages with complete data binding.**

## ✨ Features

- **Multi-Tenancy**: Complete data isolation between organizations  
- **RBAC**: Super Admin, Tenant Admin, and User roles
- **Subscription Plans**: Free, Pro, Enterprise with limits
- **Project & Task Management**: Complete CRUD (Create, Read, Update, Delete)
- **User Management**: Add, edit, remove team members
- **Dashboard**: Real-time statistics and quick actions
- **Responsive UI**: Modern design with inline forms and confirmations
- **Docker Ready**: One-command deployment

## 🚀 Quick Start

```bash
# Start all services
docker-compose up -d

# Access application
# Frontend: http://localhost:3001
# Backend API: http://localhost:5001
# Database: localhost:5433
# Health Check: http://localhost:5001/api/health
```

## 📋 Default Credentials

**Acme Tenant (test with this)**:
```
Email: admin@acme.com
Password: Admin@123
Subdomain: acme
```

**Additional Users**:
```
user@acme.com / User@123
user2@acme.com / User@123
```

## ✅ Fully Implemented Features

### Projects Page (`/projects`)
- ✅ List all projects with details
- ✅ Create new project (inline form)
- ✅ Edit project (inline form)
- ✅ Delete project (with confirmation)
- ✅ View project tasks

### Users Page (`/users`)
- ✅ List all tenant users
- ✅ Add new user (with email, password, name, role)
- ✅ Edit user (update name and role)
- ✅ Remove user (with confirmation)
- ✅ Role selection (User / Tenant Admin)

### Project Details Page (`/projects/:id`)
- ✅ List all tasks in project
- ✅ Create new task (with priority, assignee, due date)
- ✅ Update task status (To Do → In Progress → Done)
- ✅ Edit task details
- ✅ Delete task (with confirmation)
- ✅ Assign tasks to users

### Dashboard (`/dashboard`)
- ✅ Real-time statistics (Projects, Users, Tasks, Plan)
- ✅ Recent projects widget
- ✅ Quick action buttons
- ✅ Plan display with color coding

## 🛠 Tech Stack

- **Backend**: Node.js 18 + Express + PostgreSQL 15
- **Frontend**: React 18 + React Router v6 + Axios
- **Database**: PostgreSQL with shared-schema multi-tenancy
- **DevOps**: Docker + Docker Compose
- **Auth**: JWT tokens with RBAC
- **Styling**: CSS Grid, modern design system

## 🔌 API Endpoints (19 Total)

### Authentication (4)
```
POST   /api/auth/register     - Register new tenant
POST   /api/auth/login        - Login with credentials
GET    /api/auth/me           - Get current user
POST   /api/auth/logout       - Logout
```

### Tenants (3)
```
GET    /api/tenants           - List all tenants (super admin)
GET    /api/tenants/:id       - Get tenant details
PUT    /api/tenants/:id       - Update tenant
```

### Users (4)
```
GET    /api/users/tenants/:tenantId/users        - List users
POST   /api/users/tenants/:tenantId/users        - Add user
PUT    /api/users/:id                             - Update user
DELETE /api/users/:id                             - Delete user
```

### Projects (4)
```
GET    /api/projects          - List projects
POST   /api/projects          - Create project
PUT    /api/projects/:id      - Update project
DELETE /api/projects/:id      - Delete project
```

### Tasks (5)
```
GET    /api/tasks/projects/:projectId/tasks      - List tasks
POST   /api/tasks/projects/:projectId/tasks      - Create task
PUT    /api/tasks/:id                             - Update task
PATCH  /api/tasks/:id/status                     - Update status only
DELETE /api/tasks/:id                             - Delete task
```

### Health (1)
```
GET    /api/health            - Health check
```

## 📊 Database Schema

**Multi-tenant shared schema** with automatic tenant isolation:

- `tenants` - Organization data (Free/Pro/Enterprise plans)
- `users` - Team members with roles (encrypted passwords)
- `projects` - Project records with status tracking
- `tasks` - Task items with status, priority, assignees
- `audit_logs` - Track all user actions

## 🧪 Testing

See [TEST_ALL_FEATURES.md](TEST_ALL_FEATURES.md) for complete testing guide with scenarios.

## 🔐 Security Features

- ✅ Encrypted passwords with bcryptjs
- ✅ JWT authentication with expiry
- ✅ Multi-tenant data isolation
- ✅ Role-Based Access Control (RBAC)
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Audit logging for compliance
- ✅ Environment-based secrets

## 🚀 Deployment Ready

✅ All features tested and working
✅ Error handling on all endpoints
✅ Input validation (frontend + backend)
✅ Health checks configured
✅ Persistent PostgreSQL database
✅ Docker images optimized
✅ Logging enabled
✅ Database migrations automated
✅ Seed data included
✅ CORS configured for localhost:3001

## 📖 Documentation

- [Research & Architecture](docs/research.md)
- [Testing Guide](TEST_ALL_FEATURES.md)

## 🎯 Production Checklist

- [x] Backend API fully functional (19 endpoints)
- [x] Frontend CRUD on all pages
- [x] Database schema and migrations
- [x] Authentication and RBAC
- [x] Data binding and real-time updates
- [x] Error handling and validation
- [x] Docker containerization
- [x] Environment configuration
- [x] Health checks
- [x] Audit logging
- [x] Multi-tenant isolation
- [x] Responsive UI design
- [PRD](docs/PRD.md)
- [Architecture](docs/architecture.md)
- [API Docs](docs/API.md)

## 🐳 Docker Commands

```bash
docker-compose up -d      # Start
docker-compose ps         # Status
docker-compose logs -f    # Logs
docker-compose down       # Stop
```

### Notes
- If ports `3000`/`5000`/`5432` are occupied locally, this project maps to `3001`/`5001`/`5433` respectively in `docker-compose.yml`.

---

See [docs/](docs/) for complete documentation.