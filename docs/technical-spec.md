# Technical Specification

## Project Overview

**Project Name:** Multi-Tenant SaaS Task Manager
**Version:** 1.0.0
**Status:** Production Ready
**Platform:** Web-based (Browser + API)
**Architecture:** 3-tier (Frontend, Backend API, Database)

---

## 1. Project Structure

### Root Directory

```
multi-tenant-saas-task-manager/
├── backend/                    # Node.js/Express Backend
├── frontend/                   # React Frontend
├── docs/                       # Documentation
├── docker-compose.yml          # Docker orchestration
├── README.md                   # Project overview
└── .gitignore                  # Git ignore rules
```

### Backend Directory Structure

```
backend/
├── src/
│   ├── controllers/            # Request handlers
│   │   ├── authController.js       - Authentication endpoints
│   │   ├── projectController.js    - Project CRUD operations
│   │   ├── taskController.js       - Task CRUD operations
│   │   ├── userController.js       - User management (admin)
│   │   └── tenantController.js     - Tenant management (admin)
│   │
│   ├── models/                 # Database models (Sequelize)
│   │   ├── User.js                 - User model definition
│   │   ├── Project.js              - Project model definition
│   │   ├── Task.js                 - Task model definition
│   │   ├── Tenant.js               - Tenant model definition
│   │   ├── AuditLog.js             - Audit log model definition
│   │   └── associations.js         - Model relationships
│   │
│   ├── middleware/             # Express middleware
│   │   ├── authenticate.js         - JWT verification
│   │   ├── authorize.js            - Role-based access control
│   │   ├── errorHandler.js         - Centralized error handling
│   │   └── validator.js            - Input validation
│   │
│   ├── config/                 # Configuration files
│   │   ├── database.js             - Database connection settings
│   │   ├── jwt.js                  - JWT configuration
│   │   └── sequelize.js            - Sequelize configuration
│   │
│   ├── utils/                  # Utility functions
│   │   ├── logger.js               - Logging utility
│   │   ├── tokenGenerator.js       - JWT token generation
│   │   ├── passwordHash.js         - Password hashing utility
│   │   └── audit.js                - Audit logging utility
│   │
│   ├── routes/                 # API route definitions
│   │   ├── auth.js                 - Authentication routes
│   │   ├── projects.js             - Project routes
│   │   ├── tasks.js                - Task routes
│   │   ├── users.js                - User routes
│   │   ├── tenants.js              - Tenant routes
│   │   └── health.js               - Health check routes
│   │
│   ├── db/                     # Database initialization
│   │   ├── init.sql                - Initial schema + seed data
│   │   ├── migrations/             - Schema migrations
│   │   └── seeders/               - Sample data seeders
│   │
│   └── app.js                  # Express app setup
│
├── .env.example               # Environment variables template
├── package.json               # Node.js dependencies
├── Dockerfile                 # Docker container definition
├── docker-entrypoint.sh       # Container startup script
└── server.js                  # Application entry point
```

### Frontend Directory Structure

```
frontend/
├── src/
│   ├── components/            # Reusable React components
│   │   ├── Layout.js              - Master layout component
│   │   ├── ProtectedRoute.js       - Route protection wrapper
│   │   ├── Navigation.js           - Navigation bar component
│   │   ├── LoadingSpinner.js       - Loading indicator
│   │   ├── Modal.js               - Modal dialog component
│   │   ├── Form.js                - Reusable form component
│   │   └── Card.js                - Card display component
│   │
│   ├── pages/                 # Page components (routes)
│   │   ├── Dashboard.js            - Dashboard overview
│   │   ├── Projects.js             - Projects list & CRUD
│   │   ├── ProjectDetails.js       - Project details & tasks
│   │   ├── Users.js               - User management (admin)
│   │   ├── Login.js               - Login page
│   │   ├── Register.js            - Registration page
│   │   └── NotFound.js            - 404 page
│   │
│   ├── context/               # React Context API
│   │   └── AuthContext.js         - Authentication state
│   │
│   ├── services/              # API service layer
│   │   ├── apiClient.js            - Axios configuration
│   │   ├── authService.js          - Authentication API calls
│   │   ├── projectService.js       - Project API calls
│   │   ├── taskService.js          - Task API calls
│   │   └── userService.js          - User API calls
│   │
│   ├── styles/                # Global stylesheets
│   │   ├── index.css               - Global styles
│   │   ├── components.css          - Component styles
│   │   ├── pages.css               - Page styles
│   │   └── responsive.css          - Mobile responsive styles
│   │
│   ├── utils/                 # Frontend utilities
│   │   ├── dateFormatter.js        - Date formatting helper
│   │   ├── validation.js           - Form validation
│   │   └── storage.js              - LocalStorage helper
│   │
│   ├── App.js                 # Main app component
│   ├── App.css                # App styles
│   ├── index.js               # React entry point
│   └── index.css              # Index styles
│
├── public/
│   ├── index.html             # HTML template
│   ├── favicon.ico            - Favicon
│   └── manifest.json          - PWA manifest
│
├── .env.example               # Environment variables template
├── package.json               # npm dependencies
├── Dockerfile                 # Docker container definition
├── nginx.conf                 # nginx configuration
└── .gitignore                 # Git ignore rules
```

### Documentation Directory Structure

```
docs/
├── README.md                  # Quick start guide
├── research.md                # Multi-tenancy & tech stack analysis
├── PRD.md                     # Product requirements document
├── architecture.md            # System architecture documentation
├── technical-spec.md          # This file
├── API_DOCUMENTATION.md       # Complete API reference
├── SETUP_GUIDE.md             # Developer setup instructions
├── DEPLOYMENT_GUIDE.md        # Production deployment guide
├── TESTING_GUIDE.md           # Testing procedures
│
└── images/
    ├── system-architecture.png     - System architecture diagram
    ├── database-erd.png            - Database entity relationship
    ├── deployment-flow.png         - Deployment flow diagram
    └── data-flow.png               - Data flow diagram
```

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
```

**Database ORM (Sequelize):**
```javascript
// Version 6.x
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DATABASE_URL,
  {
    dialect: 'postgres',
    logging: false
  }
);

// Models automatically managed
// Relationships automatically enforced
// Migrations for schema changes
```

**Authentication:**
```javascript
// JWT with 24-hour expiry
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  {
    userId: user.id,
    tenantId: user.tenant_id,
    role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

**Password Security:**
```javascript
// bcryptjs with 10+ rounds
const bcrypt = require('bcryptjs');

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
import React, { useContext, useState } from 'react';

// Hooks usage
const [projects, setProjects] = useState([]);
const { user, logout } = useContext(AuthContext);

// Functional components
function ProjectList({ projects }) {
  return (
    <div>
      {projects.map(p => <ProjectCard key={p.id} project={p} />)}
    </div>
  );
}
```

**React Router v6:**
```javascript
// React Router 6.x
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}
```

**HTTP Client (Axios):**
```javascript
// Axios 1.x
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000
});

// Interceptor for JWT
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
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
  host: 'localhost',       // Docker: 'db'
  port: 5433,              // Docker-compose remapped port
  database: 'saas_db',
  username: 'postgres',
  password: 'postgres',
  dialect: 'postgres',
  logging: console.log,    // Set to false in production
  pool: {
    max: 20,               // Maximum connections
    min: 2,                // Minimum connections
    idle: 10000,           // Idle connection timeout
    acquire: 30000         // Connection acquire timeout
  }
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
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}  # Use secrets
    volumes:
      - db_data:/var/lib/postgresql/data
    restart: always

  backend:
    image: your-registry/backend:latest
    environment:
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}         # Use secrets
      DATABASE_URL: ${DATABASE_URL}     # Use managed database
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
const logger = require('./utils/logger');

logger.info('Server started', { port: 3000 });
logger.warn('High memory usage', { memory: process.memoryUsage() });
logger.error('Database error', { error: err.message });
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
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
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
