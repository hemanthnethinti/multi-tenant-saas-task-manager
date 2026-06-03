# Technical Specification - TaskFlow Multi-Tenant SaaS

## Project Overview

**Project Name:** TaskFlow - Multi-Tenant SaaS Task Manager
**Version:** 1.0.0
**Status:** Production Ready
**Platform:** Web-based (Browser + API)
**Architecture:** 3-tier (Frontend, Backend API, Database)
**Deployment:** Docker Compose (all-in-one)

---

## 1. Tech Stack Summary

| Layer                 | Technology     | Version   | Purpose                       |
| --------------------- | -------------- | --------- | ----------------------------- |
| **Frontend**          | React          | 18.2.0    | Single Page Application       |
| **Frontend Router**   | React Router   | 6.20.0    | Client-side routing           |
| **Frontend HTTP**     | Axios          | 1.6.2     | API requests                  |
| **Backend**           | Node.js        | 18-alpine | Runtime environment           |
| **Backend Framework** | Express.js     | Latest    | REST API server               |
| **Database**          | PostgreSQL     | 15-alpine | Data persistence              |
| **Authentication**    | JWT            | -         | Token-based auth              |
| **Password Hashing**  | bcryptjs       | -         | Secure passwords              |
| **DevOps**            | Docker         | Latest    | Containerization              |
| **Orchestration**     | Docker Compose | 3.8       | Multi-container orchestration |

---

## 2. Project Structure

### Root Directory

```
multi-tenant-saas-task-manager/
├── backend/                    # Node.js/Express Backend
│   ├── src/
│   │   ├── server.js              - Express app entry point
│   │   ├── config/                - Configuration files
│   │   ├── controllers/           - Request handlers
│   │   ├── middleware/            - Express middleware
│   │   ├── routes/                - API routes
│   │   ├── database/              - Database initialization
│   │   └── utils/                 - Utility functions
│   ├── Dockerfile                 - Container image definition
│   └── package.json               - Dependencies
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── App.jsx               - Root React component
│   │   ├── index.js              - React DOM rendering
│   │   ├── pages/                - Page components
│   │   ├── components/           - Reusable components
│   │   ├── context/              - React context (auth)
│   │   ├── services/             - API service layer
│   │   └── styles/               - CSS stylesheets
│   ├── public/
│   │   └── index.html            - HTML template
│   ├── Dockerfile                - Container image definition
│   ├── nginx.conf                - Nginx configuration
│   └── package.json              - Dependencies
│
├── docs/                       # Documentation
│   ├── API.md                    - Complete API reference
│   ├── architecture.md           - System architecture
│   ├── PRD.md                    - Product requirements
│   ├── research.md               - Technology research
│   ├── technical-spec.md         - This file
│   └── images/                   - Diagrams and screenshots
│
├── scripts/                    # Utility scripts
│   └── [shell scripts]           - Database setup, cleanup, etc.
│
├── docker-compose.yml          # Multi-container orchestration
├── README.md                   # Project overview & quick start
├── submission.json             # Test credentials & setup info
├── TaskFlow_Postman_Collection.json  - Postman API tests
└── .gitignore                  # Git ignore rules
```

### Backend Directory Structure

```
backend/src/
├── server.js                   # Express application setup
│
├── config/
│   ├── database.js             - PostgreSQL connection pool
│   └── jwt.js                  - JWT configuration
│
├── controllers/
│   ├── authController.js       - Register, Login, Logout, CurrentUser
│   ├── projectController.js    - Project CRUD operations
│   ├── taskController.js       - Task CRUD & status updates
│   ├── userController.js       - User management (tenant admin)
│   └── tenantController.js     - Tenant management (super admin)
│
├── middleware/
│   ├── auth.js                 - JWT token verification
│   └── authorize.js            - Role-based access control
│
├── routes/
│   ├── auth.js                 - Authentication routes
│   ├── projects.js             - Project routes
│   ├── tasks.js                - Task routes
│   ├── users.js                - User routes
│   └── tenants.js              - Tenant routes
│
├── database/
│   ├── init.js                 - Database initialization
│   ├── migrations/
│   │   └── 001_create_tables.sql  - Database schema
│   └── seeds/
│       └── seed_data.sql       - Sample data for testing
│
└── utils/
    ├── validation.js           - Input validation functions
    └── auditLog.js             - Audit logging utility
```

### Frontend Directory Structure

```
frontend/src/
├── App.jsx                     - Root component & routing
├── index.js                    - React DOM entry point
├── index.css                   - Global styles
│
├── pages/
│   ├── Login.jsx               - Login page
│   ├── Register.jsx            - Registration page
│   ├── Dashboard.jsx           - Dashboard with stats
│   ├── Projects.jsx            - Projects list & CRUD
│   ├── ProjectDetails.jsx      - Tasks for project
│   └── Users.jsx               - User management
│
├── components/
│   └── Layout.jsx              - Navbar & layout wrapper
│
├── context/
│   └── AuthContext.jsx         - Authentication state & methods
│
├── services/
│   └── api.jsx                 - Axios instance & API calls
│
└── styles/
    └── Auth.css                - Authentication pages styling
```

---

## 3. Docker Setup & Configuration

### Docker Compose Configuration

**File:** `docker-compose.yml`

Three services configured:

```yaml
services:
  database:
    image: postgres:15-alpine
    container_name: database
    ports: ["5432:5432"]
    environment:
      POSTGRES_USER: saas_user
      POSTGRES_PASSWORD: saas_password_2024
      POSTGRES_DB: multi_tenant_saas
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck: Database connection check

  backend:
    build: ./backend
    container_name: backend
    ports: ["5000:5000"]
    depends_on:
      database: service_healthy
    environment:
      DATABASE_HOST: database
      DATABASE_PORT: 5432
      DATABASE_NAME: multi_tenant_saas
      DATABASE_USER: saas_user
      DATABASE_PASSWORD: saas_password_2024
      JWT_SECRET: super_secret_jwt_key_change_in_production_2024
      JWT_EXPIRES_IN: 24h
      FRONTEND_URL: http://localhost:3000

  frontend:
    build: ./frontend
    container_name: frontend
    ports: ["3000:3000"]
    depends_on:
      backend: service_started
    environment:
      REACT_APP_API_URL: http://localhost:5000
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database

# Stop services
docker-compose down

# Remove volumes (database data)
docker-compose down -v

# Rebuild images
docker-compose up -d --build

# Check service health
docker ps
```

### Port Mappings

| Service  | External Port | Internal Port | Purpose     |
| -------- | ------------- | ------------- | ----------- |
| Frontend | 3000          | 3000          | React app   |
| Backend  | 5000          | 5000          | Express API |
| Database | 5432          | 5432          | PostgreSQL  |

---

## 4. Database Schema

### Tables Structure

**tenants** - Organization records

- id (UUID, PK)
- name (VARCHAR)
- subdomain (VARCHAR, UNIQUE)
- status (ENUM: active, inactive)
- subscription_plan (ENUM: free, pro, enterprise)
- max_users (INTEGER)
- max_projects (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**users** - Team members & admins

- id (UUID, PK)
- tenant_id (UUID, FK → tenants)
- email (VARCHAR, UNIQUE per tenant)
- password_hash (VARCHAR)
- full_name (VARCHAR)
- role (ENUM: user, tenant_admin, super_admin)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)

**projects** - Project records

- id (UUID, PK)
- tenant_id (UUID, FK → tenants)
- name (VARCHAR)
- description (TEXT)
- status (ENUM: active, archived)
- created_by (UUID, FK → users)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**tasks** - Task items

- id (UUID, PK)
- project_id (UUID, FK → projects)
- title (VARCHAR)
- description (TEXT)
- status (ENUM: pending, in_progress, completed)
- priority (ENUM: low, medium, high)
- assigned_to (UUID, FK → users)
- due_date (TIMESTAMP)
- created_at (TIMESTAMP)

**audit_logs** - Activity tracking

- id (UUID, PK)
- tenant_id (UUID, FK → tenants)
- user_id (UUID, FK → users)
- action (VARCHAR)
- resource_type (VARCHAR)
- resource_id (UUID)
- created_at (TIMESTAMP)

---

## 5. Development Setup (Local)

### Prerequisites

- Node.js 18+
- PostgreSQL 15
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure if needed
npm run migrate       # Run migrations
npm run seed          # Load seed data
npm start             # Start server on port 5000
```

### Frontend Setup

```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:5000 npm start
# Opens http://localhost:3000
```

---

## 6. Database Initialization

### Automatic Initialization (Docker)

When containers start:

1. Database service initializes PostgreSQL
2. Backend waits for database health check
3. Backend runs migrations automatically
4. Seed data loads automatically
5. Health endpoint becomes available

### Manual Database Setup (Local)

```bash
# Connect to PostgreSQL
psql -U saas_user -d multi_tenant_saas

# Run migrations
npm run migrate

# Load seed data
npm run seed
```

---

## 7. Environment Variables

### Backend (.env or docker-compose.yml)

```env
NODE_ENV=production
PORT=5000
DATABASE_HOST=database
DATABASE_PORT=5432
DATABASE_NAME=multi_tenant_saas
DATABASE_USER=saas_user
DATABASE_PASSWORD=saas_password_2024
JWT_SECRET=super_secret_jwt_key_change_in_production_2024
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info
```

### Frontend (.env or docker-compose.yml)

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 8. API Endpoints Summary

Total: **19 Endpoints**

| Category       | Count | Details                                    |
| -------------- | ----- | ------------------------------------------ |
| Authentication | 4     | Register, Login, Me, Logout                |
| Tenants        | 3     | List, Get, Update                          |
| Users          | 4     | List, Create, Update, Delete               |
| Projects       | 4     | List, Create, Update, Delete               |
| Tasks          | 5     | List, Create, Update, Delete, Patch Status |
| Health         | 1     | Health check endpoint                      |

See [API.md](API.md) for complete endpoint documentation.

---

## 9. Security Implementation

### Authentication

- JWT tokens issued on login with 24h expiry
- Tokens required in Authorization header
- Passwords hashed with bcryptjs (salt rounds: 10)

### Authorization

- Role-based access control (RBAC)
- Three roles: user, tenant_admin, super_admin
- Middleware checks roles before operation

### Multi-Tenancy

- Automatic tenant_id injection from user context
- All queries filtered by tenant_id
- No cross-tenant data access possible

### Input Validation

- Email format validation
- Password strength requirements
- Required field checks
- SQL injection prevention (parameterized queries)

---

## 10. Performance Considerations

### Database

- Connection pooling (pg-pool)
- Indexed on frequently queried columns
- Proper foreign key relationships
- ENUM types for fixed values

### Caching

- JWT tokens cached in localStorage (frontend)
- User context cached in React Context

### Pagination

- 10 items per page default
- Offset-based pagination for lists

---

## 11. Testing

### Test Credentials (from submission.json)

**Super Admin:**

- Email: superadmin@system.com
- Password: SuperAdmin@123

**Acme Tenant:**

- Email: admin@acme.com
- Password: Admin@123
- Subdomain: acme

**TechStart Tenant:**

- Email: admin@techstart.com
- Password: Admin@123
- Subdomain: techstart

### Testing Steps

1. Start with `docker-compose up -d`
2. Wait 10-15 seconds for all services
3. Test health endpoint: http://localhost:5000/api/health
4. Test login with credentials above
5. Use Postman collection for API testing

---

## 12. Deployment Considerations

### Production Checklist

- [ ] Change JWT_SECRET to random value
- [ ] Use strong database password
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up monitoring/logging
- [ ] Regular database backups
- [ ] Use environment variables for secrets
- [ ] Update dependencies regularly
- [ ] Enable rate limiting
- [ ] Implement CDN for static assets

### Scaling Strategy

- Horizontal scaling: Multiple backend instances with load balancer
- Database: Connection pooling, read replicas
- Caching: Redis for sessions/tokens
- Static assets: CDN delivery

---

## 13. Support & Troubleshooting

### Common Issues

**"ENOTFOUND database"** → Database not healthy, check `docker ps`
**"Port already in use"** → Kill process or use different port
**"401 Unauthorized"** → Token expired or missing, login again
**"403 Forbidden"** → Insufficient permissions for operation

### Debug Mode

```bash
# View detailed logs
docker-compose logs -f

# Check database connection
docker exec database psql -U saas_user -d multi_tenant_saas -c "SELECT 1"
```

│ │ └── validator.js - Input validation
│ │
│ ├── config/ # Configuration files
│ │ ├── database.js - Database connection settings
│ │ ├── jwt.js - JWT configuration
│ │ └── sequelize.js - Sequelize configuration
│ │
│ ├── utils/ # Utility functions
│ │ ├── logger.js - Logging utility
│ │ ├── tokenGenerator.js - JWT token generation
│ │ ├── passwordHash.js - Password hashing utility
│ │ └── audit.js - Audit logging utility
│ │
│ ├── routes/ # API route definitions
│ │ ├── auth.js - Authentication routes
│ │ ├── projects.js - Project routes
│ │ ├── tasks.js - Task routes
│ │ ├── users.js - User routes
│ │ ├── tenants.js - Tenant routes
│ │ └── health.js - Health check routes
│ │
│ ├── db/ # Database initialization
│ │ ├── init.sql - Initial schema + seed data
│ │ ├── migrations/ - Schema migrations
│ │ └── seeders/ - Sample data seeders
│ │
│ └── app.js # Express app setup
│
├── .env.example # Environment variables template
├── package.json # Node.js dependencies
├── Dockerfile # Docker container definition
├── docker-entrypoint.sh # Container startup script
└── server.js # Application entry point

```

### Frontend Directory Structure

```

frontend/
├── src/
│ ├── components/ # Reusable React components
│ │ ├── Layout.js - Master layout component
│ │ ├── ProtectedRoute.js - Route protection wrapper
│ │ ├── Navigation.js - Navigation bar component
│ │ ├── LoadingSpinner.js - Loading indicator
│ │ ├── Modal.js - Modal dialog component
│ │ ├── Form.js - Reusable form component
│ │ └── Card.js - Card display component
│ │
│ ├── pages/ # Page components (routes)
│ │ ├── Dashboard.js - Dashboard overview
│ │ ├── Projects.js - Projects list & CRUD
│ │ ├── ProjectDetails.js - Project details & tasks
│ │ ├── Users.js - User management (admin)
│ │ ├── Login.js - Login page
│ │ ├── Register.js - Registration page
│ │ └── NotFound.js - 404 page
│ │
│ ├── context/ # React Context API
│ │ └── AuthContext.js - Authentication state
│ │
│ ├── services/ # API service layer
│ │ ├── apiClient.js - Axios configuration
│ │ ├── authService.js - Authentication API calls
│ │ ├── projectService.js - Project API calls
│ │ ├── taskService.js - Task API calls
│ │ └── userService.js - User API calls
│ │
│ ├── styles/ # Global stylesheets
│ │ ├── index.css - Global styles
│ │ ├── components.css - Component styles
│ │ ├── pages.css - Page styles
│ │ └── responsive.css - Mobile responsive styles
│ │
│ ├── utils/ # Frontend utilities
│ │ ├── dateFormatter.js - Date formatting helper
│ │ ├── validation.js - Form validation
│ │ └── storage.js - LocalStorage helper
│ │
│ ├── App.js # Main app component
│ ├── App.css # App styles
│ ├── index.js # React entry point
│ └── index.css # Index styles
│
├── public/
│ ├── index.html # HTML template
│ ├── favicon.ico - Favicon
│ └── manifest.json - PWA manifest
│
├── .env.example # Environment variables template
├── package.json # npm dependencies
├── Dockerfile # Docker container definition
├── nginx.conf # nginx configuration
└── .gitignore # Git ignore rules

```

### Documentation Directory Structure

```

docs/
├── README.md # Quick start guide
├── research.md # Multi-tenancy & tech stack analysis
├── PRD.md # Product requirements document
├── architecture.md # System architecture documentation
├── technical-spec.md # This file
├── API_DOCUMENTATION.md # Complete API reference
├── SETUP_GUIDE.md # Developer setup instructions
├── DEPLOYMENT_GUIDE.md # Production deployment guide
├── TESTING_GUIDE.md # Testing procedures
│
└── images/
├── system-architecture.png - System architecture diagram
├── database-erd.png - Database entity relationship
├── deployment-flow.png - Deployment flow diagram
└── data-flow.png - Data flow diagram

````

---

## 2. Technology Stack Details

### Backend

**Node.js Runtime:**
- Version: 18.x LTS
- Engine: V8 JavaScript engine
- Event loop for async operations

**Express.js Framework:**
```javascript
// Version 4.18.x
const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(errorHandler);
````

**Database ORM (Sequelize):**

```javascript
// Version 6.x
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

// Models automatically managed
// Relationships automatically enforced
// Migrations for schema changes
```

**Authentication:**

```javascript
// JWT with 24-hour expiry
const jwt = require("jsonwebtoken");

const token = jwt.sign(
  {
    userId: user.id,
    tenantId: user.tenant_id,
    role: user.role,
  },
  process.env.JWT_SECRET,
  { expiresIn: "24h" },
);
```

**Password Security:**

```javascript
// bcryptjs with 10+ rounds
const bcrypt = require("bcryptjs");

// Hashing
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);

// Verification
const isValid = await bcrypt.compare(password, hash);
```

### Frontend

**React 18:**

```javascript
// React 18.2.x
import React, { useContext, useState } from "react";

// Hooks usage
const [projects, setProjects] = useState([]);
const { user, logout } = useContext(AuthContext);

// Functional components
function ProjectList({ projects }) {
  return (
    <div>
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}
```

**React Router v6:**

```javascript
// React Router 6.x
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

**HTTP Client (Axios):**

```javascript
// Axios 1.x
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
});

// Interceptor for JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Database

**PostgreSQL 15:**

- Port: 5432 (internal), 5433 (docker-compose)
- Database: saas_db
- Connection pooling: 20 connections

**Key Features Used:**

- UUID data type for IDs
- JSON data type for audit logs
- Constraints (PRIMARY KEY, FOREIGN KEY)
- Indexes for performance optimization
- Transactions for data consistency

---

## 3. Development Environment Setup

### Prerequisites

**Required Software:**

- Node.js 18.x (https://nodejs.org/)
- PostgreSQL 15.x (https://www.postgresql.org/)
- Docker & Docker Compose (https://www.docker.com/)
- Git (https://git-scm.com/)

**System Requirements:**

- 4GB RAM minimum
- 10GB disk space minimum
- Internet connection
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation Steps

#### Step 1: Clone Repository

```bash
# Clone from GitHub
git clone https://github.com/yourusername/multi-tenant-saas-task-manager.git
cd multi-tenant-saas-task-manager
```

#### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values
# DATABASE_URL=postgresql://user:password@localhost:5432/saas_db
# JWT_SECRET=your-secret-key-change-in-production
# NODE_ENV=development
# PORT=3000

# Run database migrations (if using migrations)
npm run migrate

# Seed initial data (optional)
npm run seed
```

#### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values
# REACT_APP_API_URL=http://localhost:5001

# Build for development
npm run build
```

#### Step 4: Start with Docker Compose (Recommended)

```bash
# From root directory
docker-compose up -d

# Check services are running
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Verify health
curl http://localhost:5001/health
curl http://localhost:3001
```

#### Step 5: Access Application

```
Frontend: http://localhost:3001
Backend API: http://localhost:5001
Database: postgresql://postgres:postgres@localhost:5433/saas_db
```

### Alternative: Local Development (Without Docker)

```bash
# Terminal 1: Start PostgreSQL
brew services start postgresql@15
# or on Windows/Linux: pg_ctl -D /path/to/data start

# Terminal 2: Start Backend
cd backend
npm install
npm start

# Terminal 3: Start Frontend
cd frontend
npm install
npm start
```

---

## 4. Running & Testing

### Starting the Application

**With Docker Compose:**

```bash
docker-compose up -d

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

**Without Docker:**

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm start
```

### Development Mode

**Backend Development:**

```bash
cd backend
npm run dev
# Automatically restarts on file changes (nodemon)
```

**Frontend Development:**

```bash
cd frontend
npm start
# Hot reload enabled (Create React App)
```

### Running Tests

**Backend Unit Tests:**

```bash
cd backend
npm test
# Runs all tests in __tests__ directories
```

**Backend Integration Tests:**

```bash
cd backend
npm run test:integration
# Tests API endpoints with live database
```

**Frontend Unit Tests:**

```bash
cd frontend
npm test
# Runs Jest tests for React components
```

**Full Test Suite:**

```bash
npm run test:all
# Runs all tests across backend and frontend
```

### Linting & Code Quality

**Backend:**

```bash
cd backend
npm run lint
npm run lint:fix
```

**Frontend:**

```bash
cd frontend
npm run lint
npm run lint:fix
```

### API Testing

**Using cURL:**

```bash
# Register new user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Test Inc",
    "subdomain": "test",
    "email": "admin@test.com",
    "name": "Admin User",
    "password": "TestPassword123!"
  }'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "TestPassword123!"
  }'

# Get projects (with token)
curl -X GET http://localhost:5001/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Using Postman:**

1. Import collection from `docs/postman_collection.json`
2. Set variables: base_url, token
3. Run requests in sequence
4. Verify responses match expected format

---

## 5. Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/saas_db

# JWT
JWT_SECRET=your-super-secret-key-min-32-characters-long

# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# CORS
CORS_ORIGIN=http://localhost:3001

# Email (for future notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# File Storage (for future file uploads)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
```

### Frontend (.env)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5001

# Environment
REACT_APP_ENV=development

# Analytics (optional)
REACT_APP_GA_ID=your-google-analytics-id

# Feature Flags (optional)
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
```

---

## 6. Database Configuration

### Connection Parameters

```javascript
// Database connection (Sequelize)
const sequelize = new Sequelize({
  host: "localhost", // Docker: 'db'
  port: 5433, // Docker-compose remapped port
  database: "saas_db",
  username: "postgres",
  password: "postgres",
  dialect: "postgres",
  logging: console.log, // Set to false in production
  pool: {
    max: 20, // Maximum connections
    min: 2, // Minimum connections
    idle: 10000, // Idle connection timeout
    acquire: 30000, // Connection acquire timeout
  },
});
```

### Initial Schema

The database schema is automatically created by:

1. `backend/db/init.sql` - Initial setup and seed data
2. Or Sequelize models + migrations

**Tables Created:**

- `tenants` - Organization data
- `users` - User accounts
- `projects` - Project data
- `tasks` - Task data
- `audit_logs` - Audit trail

### Backup & Restore

**Backup Database:**

```bash
# Local
pg_dump -h localhost -U postgres -d saas_db > backup.sql

# Docker container
docker-compose exec db pg_dump -U postgres saas_db > backup.sql
```

**Restore Database:**

```bash
# Local
psql -h localhost -U postgres saas_db < backup.sql

# Docker container
docker-compose exec db psql -U postgres saas_db < backup.sql
```

---

## 7. Deployment Configuration

### Docker Build

```bash
# Build images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build with no cache
docker-compose build --no-cache
```

### Production Deployment

**Recommended Platforms:**

- AWS (EC2, ECS, RDS)
- Azure (App Service, Container Instances, Database for PostgreSQL)
- Google Cloud (Cloud Run, Cloud SQL)
- DigitalOcean (Apps Platform, Managed Database)
- Heroku (Container deployment with addon databases)

**Key Configuration Changes for Production:**

```yaml
# docker-compose.prod.yml
version: "3.8"
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD} # Use secrets
    volumes:
      - db_data:/var/lib/postgresql/data
    restart: always

  backend:
    image: your-registry/backend:latest
    environment:
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET} # Use secrets
      DATABASE_URL: ${DATABASE_URL} # Use managed database
    restart: always

  frontend:
    image: your-registry/frontend:latest
    restart: always

volumes:
  db_data:
```

### Environment-Specific Settings

**Development:**

- NODE_ENV=development
- LOG_LEVEL=debug
- Database: Local PostgreSQL

**Staging:**

- NODE_ENV=staging
- LOG_LEVEL=info
- Database: AWS RDS (test instance)

**Production:**

- NODE_ENV=production
- LOG_LEVEL=warn
- Database: AWS RDS (production instance)
- HTTPS enabled
- Rate limiting enabled
- Monitoring enabled

---

## 8. Monitoring & Logging

### Backend Logging

```javascript
// Winston logger setup
const logger = require("./utils/logger");

logger.info("Server started", { port: 3000 });
logger.warn("High memory usage", { memory: process.memoryUsage() });
logger.error("Database error", { error: err.message });
```

### Application Monitoring

**Health Check Endpoint:**

```bash
GET http://localhost:5001/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "database": "connected",
  "version": "1.0.0",
  "uptime": 3600
}
```

### Database Monitoring

```sql
-- Query count by user
SELECT user_id, COUNT(*) as query_count
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id;

-- Failed logins
SELECT COUNT(*) as failed_logins
FROM audit_logs
WHERE action = 'LOGIN_FAILED'
AND created_at > NOW() - INTERVAL '1 hour';

-- Slow queries
EXPLAIN ANALYZE
SELECT * FROM tasks
WHERE tenant_id = $1 AND status = $2
ORDER BY created_at DESC;
```

---

## 9. Troubleshooting

### Common Issues

**Port Already in Use:**

```bash
# Find process using port
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill process
kill -9 <PID>
```

**Database Connection Failed:**

```bash
# Check PostgreSQL is running
psql -h localhost -U postgres -c "SELECT version();"

# Check environment variables
env | grep DATABASE_URL

# Test connection
psql postgresql://postgres:postgres@localhost:5433/saas_db
```

**JWT Token Invalid:**

```bash
# Token has expired (24 hours)
# Solution: Login again to get new token

# Token signature invalid
# Cause: Different JWT_SECRET in frontend and backend
# Solution: Ensure same JWT_SECRET in both
```

**API CORS Error:**

```
Access to XMLHttpRequest from origin blocked by CORS policy
```

**Solution:**

```javascript
// Check CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
```

---

## 10. Useful Commands

### Docker Commands

```bash
# List containers
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Execute command in container
docker-compose exec backend npm test
docker-compose exec db psql -U postgres -d saas_db

# Rebuild specific service
docker-compose build --no-cache backend

# Remove containers and volumes
docker-compose down -v
```

### npm Commands

```bash
# Backend
cd backend
npm start              # Start server
npm run dev            # Start with nodemon
npm test              # Run tests
npm run lint          # Check code style
npm run lint:fix      # Fix code style

# Frontend
cd frontend
npm start              # Start dev server
npm run build          # Build for production
npm test              # Run tests
npm run eject         # Expose CRA config (irreversible)
```

### Database Commands

```bash
# Connect to database
psql postgresql://postgres:postgres@localhost:5433/saas_db

# List tables
\dt

# Describe table
\d users

# View data
SELECT * FROM tenants;
SELECT * FROM audit_logs LIMIT 10;

# Backup
pg_dump -U postgres saas_db > backup.sql

# Restore
psql -U postgres saas_db < backup.sql
```

---

## 11. Security Checklist

- [x] Password hashing with bcrypt (10+ rounds)
- [x] JWT authentication with 24-hour expiry
- [x] HTTPS recommended in production
- [x] SQL injection prevention (parameterized queries)
- [x] XSS prevention (input sanitization)
- [x] CSRF protection (token validation)
- [x] Rate limiting on auth endpoints
- [x] CORS properly configured
- [x] Security headers (helmet.js)
- [x] Audit logging enabled
- [x] Data isolation per tenant
- [x] Role-based access control (RBAC)
- [x] Environment variables for secrets
- [x] Regular security updates
- [x] Penetration testing planned

---

## 12. Performance Optimization Tips

**Backend:**

- Enable database query caching
- Use Redis for session storage
- Implement pagination for large datasets
- Add database indexes on frequently queried columns
- Monitor slow queries with EXPLAIN ANALYZE
- Use connection pooling

**Frontend:**

- Code splitting with React.lazy()
- Image optimization
- CSS minification
- JavaScript bundle analysis
- Service workers for offline support
- Virtual scrolling for large lists

**Database:**

- Regular VACUUM and ANALYZE
- Index maintenance
- Query optimization
- Connection pooling
- Read replicas for heavy reads

---

**Document Version:** 1.0
**Last Updated:** December 27, 2025
**Status:** Complete - Ready for Development
