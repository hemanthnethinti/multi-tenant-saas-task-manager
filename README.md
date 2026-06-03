# TaskFlow - Multi-Tenant SaaS Task Management Platform

This is a complete task management system for multiple organizations. Built with Node.js, React, PostgreSQL, and Docker. Everything works out of the box with role-based access control and proper data separation between companies.

Repository: https://github.com/hemanthnethinti/multi-tenant-saas-task-manager

## What This Does

- Multi-tenancy with data isolation between organizations
- Three user roles: Super Admin, Tenant Admin, and User with different permissions
- Projects and tasks that you can create, edit, and delete
- User management for adding team members
- Dashboard showing stats and info
- Everything containerized with Docker
- JWT tokens for authentication
- Tracks who did what with audit logs

## Getting Started with Docker

What you need:

- Docker and Docker Compose installed
- Ports 3000, 5000, and 5432 available

Running it:

```bash
# Get the code
git clone https://github.com/hemanthnethinti/multi-tenant-saas-task-manager.git
cd multi-tenant-saas-task-manager

# Start everything
docker-compose up -d

# Check if it's running
docker ps

# Test the backend is working
curl http://localhost:5000/api/health
```

Then open these in your browser:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Check health: http://localhost:5000/api/health

## Test Accounts

Super Admin:

```
Email: superadmin@system.com
Password: SuperAdmin@123
```

Acme Tenant (already set up):

```
Email: admin@acme.com
Password: Admin@123
Subdomain: acme
```

Other Acme users:

```
Email: user1@acme.com / Password: User@123
Email: user2@acme.com / Password: User@123
```

TechStart Tenant (already set up):

```
Email: admin@techstart.com
Password: Admin@123
Subdomain: techstart
```

## Features Implemented

Projects Page (/projects):

- List all projects with details
- Create new project with inline form
- Edit project information
- Delete project with confirmation
- View all tasks in a project

Users Page (/users):

- List all users in your organization
- Add new users with email, password, name, and role
- Edit user information and role
- Remove users with confirmation
- Change user role from User to Tenant Admin

Project Details Page (/projects/:id):

- See all tasks for a project
- Create new task with priority, assignee, and due date
- Change task status from pending to in progress to done
- Edit task details
- Delete task with confirmation
- Assign tasks to team members

Dashboard (/dashboard):

- Shows statistics about your organization
- Displays recent projects
- Quick action buttons
- Shows your subscription plan

## Tech Stack

Backend: Node.js 18 with Express and PostgreSQL 15
Frontend: React 18 with React Router v6 and Axios
Database: PostgreSQL with multi-tenant schema
Deployment: Docker and Docker Compose
Authentication: JWT tokens with role-based access
Styling: CSS Grid and modern CSS

## API Endpoints (19 Total)

Authentication (4 endpoints):
POST /api/auth/register - Create new organization and admin user
POST /api/auth/login - Login with credentials
GET /api/auth/me - Get info about logged in user
POST /api/auth/logout - Logout

Tenants (3 endpoints):
GET /api/tenants - List all organizations (super admin only)
GET /api/tenants/:id - Get details about an organization
PUT /api/tenants/:id - Update organization info

Users (4 endpoints):
GET /api/users/tenants/:tenantId/users - List users in organization
POST /api/users/tenants/:tenantId/users - Add new user
PUT /api/users/:id - Update user info
DELETE /api/users/:id - Remove user

Projects (4 endpoints):
GET /api/projects - Get all projects
POST /api/projects - Create new project
PUT /api/projects/:id - Update project
DELETE /api/projects/:id - Delete project

Tasks (5 endpoints):
GET /api/tasks/projects/:projectId/tasks - Get all tasks in project
POST /api/tasks/projects/:projectId/tasks - Create new task
PUT /api/tasks/:id - Update task details
PATCH /api/tasks/:id/status - Change task status only
DELETE /api/tasks/:id - Delete task

Health (1 endpoint):
GET /api/health - Check if system is working

## Database

Uses PostgreSQL with 5 tables:

- tenants: Organization data with plan info
- users: Team members with roles and passwords
- projects: Project records
- tasks: Individual tasks with status and priority
- audit_logs: History of all actions

## What Makes This Secure

- Passwords are hashed with bcryptjs before storing
- JWT tokens expire after 24 hours
- Each organization only sees their own data
- Different roles have different permissions
- All inputs are validated before processing
- Passwords are checked when logging in
- API calls verify you're allowed to do them

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
- Environment configuration
- Health checks
- Audit logging
- Multi-tenant data isolation
- Responsive UI design

See documentation in the docs/ folder:

- Product Requirements: docs/PRD.md
- System Architecture: docs/architecture.md
- API Documentation: docs/API.md

## Docker Commands

Start everything:
docker-compose up -d

Check status:
docker-compose ps

View logs:
docker-compose logs -f

Stop everything:
docker-compose down

Note: If ports 3000, 5000, or 5432 are already in use, the docker-compose.yml maps to 3001, 5001, and 5433 instead.

For more information, see the docs folder.
