# Developer Notes - TaskFlow SaaS Project

For junior developers and people new to this codebase.

This file explains how the project works in simple terms. Hopefully it makes sense.

---

## What is TaskFlow?

TaskFlow is basically a task management app, but it can be used by multiple companies at the same time. Here's what that means:

Multi-Tenant: Multiple organizations can use the same app
SaaS: It's a web application, not something you install
Task Management: You can create projects, add tasks, assign them to people

Real example: Google Docs works the same way. Your company can use it, and another company can use the same Google Docs service, but your documents don't mix with theirs.

## Project Components

### Frontend (The React App)

This is what you see in your browser at http://localhost:3000

Technology: React (JavaScript)
Location: frontend/src/

What happens when you use it:

1. You go to the website
2. React loads and shows a login page
3. You enter your email and password
4. JavaScript sends this to the backend
5. Backend checks if it's correct
6. You get back a token (like a ticket)
7. Every time you do something, the token proves who you are

Pages in the app:

- Login.jsx: Where you log in
- Register.jsx: Where you sign up for a new organization
- Dashboard.jsx: Shows stats and information
- Projects.jsx: List of projects
- ProjectDetails.jsx: Shows tasks in a project
- Users.jsx: Manage team members

How data flows:
Browser shows something -> You click a button -> JavaScript sends request -> Backend answers -> Screen updates

### Backend (Node.js with Express)

This is the "brain" of the application. It runs at http://localhost:5000

Technology: Node.js and Express (JavaScript on the server)
Location: backend/src/

What happens:

1. Frontend sends a request like "Give me all projects"
2. Backend checks if you're logged in by looking at your token
3. Backend asks the database for the projects
4. Database sends back the data
5. Backend sends data back to frontend as JSON
6. Frontend displays it on screen

Main folders:

- controllers/: Handle the requests (like projectController.js)
- routes/: Map URLs to controllers (like /api/projects goes to projectController)
- middleware/: Check if you're allowed (like auth.js checks if you're logged in)
- database/: Database setup and test data
- utils/: Helper functions like checking email format

Flow:
Request comes in -> Check if logged in -> Check if allowed -> Get data -> Send back

### Database (PostgreSQL)

This stores all the data. Think of it like a giant spreadsheet.

Technology: PostgreSQL
Location: Data stored on disk in Docker volume

Tables:

- tenants: Organizations/companies
- users: Team members
- projects: Project records
- tasks: Individual tasks
- audit_logs: History of what happened

Example - tenants table:
ID | Name | Subdomain | Plan
1 | Acme Corp | acme | pro
2 | TechStart | techstart | free

---

## How Login Works

Think of it like airport security:

Step 1: You show up

- Bring passport (email and password)
- Security checks if it's real

Step 2: You get a boarding pass

- This is a JWT token (a special code)
- Says "This person is John from Acme, good until tomorrow"

Step 3: Use boarding pass

- Every time you do something, show your boarding pass
- No need to show passport again

In code:

1. User enters email and password on login page
2. Frontend sends to backend
3. Backend checks database for that email
4. Backend checks if password matches
5. Backend creates JWT token (special string)
6. Token is stored in browser's localStorage
7. Every request includes token in header
8. Backend verifies token, then responds

JWT token example:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE...

It has three parts:

1. Header (says what algorithm)
2. Payload (your information)
3. Signature (proof it's real)

---

## File Structure

### Frontend Files

frontend/
├── src/
│ ├── App.jsx: Main component that handles routing
│ ├── index.js: Entry point
│ │
│ ├── pages/: These are the screens users see
│ │ ├── Login.jsx: Login screen
│ │ ├── Register.jsx: Sign up screen  
│ │ ├── Dashboard.jsx: Home screen
│ │ ├── Projects.jsx: List of projects
│ │ ├── ProjectDetails.jsx: Tasks in a project
│ │ └── Users.jsx: Team management
│ │
│ ├── components/: Reusable pieces
│ │ └── Layout.jsx: Header and navigation
│ │
│ ├── context/: Shared data between components
│ │ └── AuthContext.jsx: Stores who's logged in
│ │
│ ├── services/: Functions that talk to backend
│ │ └── api.jsx: All the API calls
│ │
│ └── styles/: CSS styling
│ └── Auth.css: Styling for login/signup
│
├── Dockerfile: Instructions to package the app
├── nginx.conf: Web server configuration
└── package.json: List of libraries needed

### Backend Files

backend/
├── src/
│ ├── server.js: Starts the backend
│ │
│ ├── controllers/: Handle requests
│ │ ├── authController.js: Login/Register/Logout
│ │ ├── projectController.js: Create/Edit/Delete projects
│ │ ├── taskController.js: Create/Edit/Delete tasks
│ │ ├── userController.js: Manage team members
│ │ └── tenantController.js: Manage organizations
│ │
│ ├── routes/: Map URLs to functions
│ │ ├── auth.js: Routes for login
│ │ ├── projects.js: Routes for projects
│ │ ├── tasks.js: Routes for tasks
│ │ ├── users.js: Routes for users
│ │ └── tenants.js: Routes for organizations
│ │
│ ├── middleware/: Safety checks
│ │ ├── auth.js: Check if logged in
│ │ └── authorize.js: Check if allowed
│ │
│ ├── config/: Settings
│ │ ├── database.js: Database connection
│ │ └── jwt.js: Token settings
│ │
│ ├── database/: Database setup
│ │ ├── init.js: Initialize database
│ │ ├── migrations/: Create tables
│ │ └── seeds/: Test data
│ │
│ └── utils/: Helper functions
│ ├── validation.js: Check if email is valid
│ └── auditLog.js: Record what people did
│
├── Dockerfile: How to package backend
├── package.json: Libraries needed
└── server.js: Starts everything

---

## Running the Project

### Using Docker (Easiest)

Go to the project folder:
cd multi-tenant-saas-task-manager

Start everything:
docker-compose up -d

What happens:

- Docker creates 3 containers (mini computers)
- One runs PostgreSQL (database)
- One runs Node.js (backend)
- One runs React (frontend)
- They connect to each other

Open http://localhost:3000

### Running Locally

Terminal 1 - Database:

- PostgreSQL must be installed first
- psql -U saas_user -d multi_tenant_saas

Terminal 2 - Backend:
cd backend
npm install
npm start

Terminal 3 - Frontend:
cd frontend
npm install
npm start

---

## API Calls

An API is like ordering at a restaurant. You ask, kitchen processes, you get food.

Frontend asks -> Backend processes -> Sends response

Frontend code example (frontend/src/services/api.jsx):
export const registerTenant = (data) =>
api.post('/api/auth/register', data);

When you click Create Account:

1. Get form data
2. Call registerTenant function
3. Send to backend /api/auth/register
4. Backend processes
5. Response comes back
6. Page updates

Request format (Frontend to Backend):
POST /api/auth/register
{
"tenantName": "My Company",
"subdomain": "mycompany",
"adminEmail": "john@company.com",
"adminPassword": "SecurePass@123"
}

Response format (Backend to Frontend):
{
"success": true,
"message": "Tenant registered successfully",
"data": {
"tenantId": "abc123",
"subdomain": "mycompany",
"adminUser": {
"email": "john@company.com"
}
}
}

---

## Complete Login Flow

Step by step of what happens when you log in:

Step 1: Click Login
Button click in Login.jsx
Get email and password from form
Call: api.post('/api/auth/login', {email, password})

Step 2: Request sent to backend
HTTP POST to http://localhost:5000/api/auth/login
Headers say it's JSON
Body has email and password

Step 3: Backend processes
Express route gets the request (routes/auth.js)
Calls loginController function
Finds user in database by email
Checks if password matches (using bcrypt)
Creates JWT token
Sends back: { success: true, token: "xyz...", user: {...} }

Step 4: Frontend gets response
Response arrives and is handled
Token is saved to localStorage
User info is saved to React context
Redirects to Dashboard

Step 5: Dashboard loads
Page requests /api/projects
Token automatically included in header
Backend sees token, knows who you are
Returns only YOUR company's projects
(Other companies' projects are hidden)

Step 6: Dashboard displays data
Your projects show on screen
Other company data never visible
Multi-tenancy works

---

## User Roles and Permissions

Three types of users in the system:

Super Admin:
Email: superadmin@system.com
Password: SuperAdmin@123
Can see all organizations
Can manage everything
Access to admin features

Tenant Admin (Example: Acme):
Email: admin@acme.com
Password: Admin@123
Subdomain: acme
Can manage only their organization
Can add/remove team members
Can create projects
Can manage organization settings

Regular User (Example: Alice at Acme):
Email: user1@acme.com
Password: User@123
Subdomain: acme
Can see/use what tenant admin allows
Can view projects
Can create/edit tasks
Can assign tasks to themselves

How permissions check works:

User wants to delete a project
Check 1: Is token valid? Yes
Check 2: Is user tenant_admin or super_admin? Yes
Check 3: Does project belong to their tenant? Yes
Allow delete

If any check fails: 403 Forbidden

---

## Common Development Tasks

Adding a new field to the form

Example: Add phone number to registration

Edit these files:

1. frontend/src/pages/Register.jsx - Add input field
2. backend/src/controllers/authController.js - Validate and save
3. backend/src/database/migrations/001_create_tables.sql - Add column

Creating a new API endpoint

Steps:

1. Write function in backend/src/controllers/taskController.js
2. Add route in backend/src/routes/tasks.js
3. Add function in frontend/src/services/api.jsx
4. Use it in a component

Fixing a bug

Example: Users can see other companies' projects

Debug:

1. Open browser F12
2. Network tab
3. Make request to get projects
4. Check response - other companies' projects included?
5. Check backend GET /api/projects route
6. Check query - filtering by tenant_id?

Fix: Add WHERE clause to database query
SELECT \* FROM projects
WHERE tenant_id = $1

---

## Test Credentials

Super Admin:
Email: superadmin@system.com
Password: SuperAdmin@123

Acme Tenant:
Email: admin@acme.com
Password: Admin@123
Subdomain: acme

Also in Acme:
user1@acme.com / User@123
user2@acme.com / User@123

TechStart Tenant:
Email: admin@techstart.com
Password: Admin@123
Subdomain: techstart

---

## Daily Development

Morning:

1. Start Docker: docker-compose up -d
2. Check backend: docker-compose logs -f backend
3. Open browser: http://localhost:3000

During work:

1. Make code changes
2. Save file (auto reload happens)
3. Test in browser
4. Check browser console (F12) for errors
5. Check terminal for backend errors

End of day:

1. Stop Docker: docker-compose down
2. Commit: git add . && git commit -m "message"
3. Push: git push

When something breaks:

Check in order:

1. Browser Console F12 - Frontend errors
2. Backend Logs - docker-compose logs backend
3. Database - docker exec database psql ...
4. Network Tab F12 - Check API requests
5. Code - Look for syntax errors

---

## Code Examples

Get Projects (Frontend)

In component (frontend/src/pages/Projects.jsx):
import { useState, useEffect } from 'react';
import { listProjects } from '../services/api.jsx';

function Projects() {
const [projects, setProjects] = useState([]);

useEffect(() => {
const getProjects = async () => {
try {
const response = await listProjects();
setProjects(response.data.projects);
} catch (error) {
console.error('Error:', error);
}
};

    getProjects();

}, []);

return (
<div>
{projects.map(project => (
<div key={project.id}>{project.name}</div>
))}
</div>
);
}

In API service (frontend/src/services/api.jsx):
export const listProjects = () =>
api.get('/api/projects');

Get Projects (Backend)

In controller (backend/src/controllers/projectController.js):
const getProjects = async (req, res) => {
try {
const tenantId = req.user.tenantId;

    const projects = await query(
      'SELECT * FROM projects WHERE tenant_id = $1',
      [tenantId]
    );

    res.json({
      success: true,
      data: { projects: projects.rows }
    });

} catch (error) {
res.status(500).json({ success: false, message: error.message });
}
};

In route (backend/src/routes/projects.js):
const express = require('express');
const { getProjects } = require('../controllers/projectController');
const auth = require('../middleware/auth');

const router = express.Router();
router.get('/', auth, getProjects);

module.exports = router;

---

## Learning Path

Week 1: Understand basics
Read this file
Understand what each folder does
Run docker-compose up -d
Log in with test credentials
Explore the UI
Open DevTools and inspect requests

Week 2: Understand code
Read Login.jsx
Read authController.js
Understand JWT tokens
Understand middleware
Understand how auth works

Week 3: Make changes
Change button color in CSS
Change message text
Add validation rule
Test your changes

Week 4: Add feature
Add new form field
Save to database
Display on frontend
Test everything

---

## Useful Links

React: https://react.dev/
React Router: https://reactrouter.com/
Axios: https://axios-http.com/
Express: https://expressjs.com/
PostgreSQL: https://www.postgresql.org/docs/
JWT: https://jwt.io/
Postman: https://www.postman.com/
Git: https://git-scm.com/doc
Docker: https://docs.docker.com/

---

## Troubleshooting

Problem: Cannot connect to database

Check:
docker ps

Are database container running?

Fix:
docker-compose down
docker-compose up -d

Problem: Port 3000 already in use

Find process:
lsof -i :3000

Kill it:
kill -9 <PID>

Or restart:
docker-compose restart

Problem: Token expired error

Just log out and log in again
Token lasts 24 hours

Problem: Cannot find module

Frontend:
cd frontend && npm install

Backend:
cd backend && npm install

Problem: Form data not saving

Check:

1. Is validation passing? (browser console)
2. Is backend receiving request? (backend logs)
3. Is database connected? (docker logs)
4. Any SQL errors? (docker logs)

---

## Tips

Use DevTools (F12):

- Network tab shows API requests
- Console shows JavaScript errors
- Application tab shows localStorage data

Read error messages. They tell you what's wrong.

Use Docker logs:
docker-compose logs backend -f
docker-compose logs frontend -f

Test API with Postman using TaskFlow_Postman_Collection.json

Read the code and follow the flow

---

## Summary

Frontend: What user sees (React)
Backend: Business logic (Node.js)
Database: Stores data (PostgreSQL)
Docker: Packages everything

Flow: Click -> Frontend -> API Call -> Backend -> Database -> Response -> Display

Security: Token -> Middleware -> Authorization -> Database Query -> Only your data

Multi-tenancy: Every query filtered by tenant_id -> Each company only sees their data

---

## Next Steps

1. Run: docker-compose up -d
2. Login: admin@acme.com / Admin@123
3. Click around and explore
4. Open controller files and read code
5. Understand the flow
6. Make a small change
7. Ask questions when stuck

Good luck! 2. React loads and shows the login page 3. You type your email and password 4. JavaScript (in your browser) sends this to the backend 5. Backend checks if credentials are correct 6. If correct, your browser gets a token (like a ticket) 7. All future requests use this token to prove who you are

**Key Pages**:

- `Login.jsx` → Login page
- `Register.jsx` → Sign up for new organization
- `Dashboard.jsx` → Shows stats and info
- `Projects.jsx` → List of projects
- `ProjectDetails.jsx` → Tasks in a project
- `Users.jsx` → Team members management

**Frontend Flow**:

```
Browser → Component → API Call → Backend → Response → Update Screen
```

### 2. **Backend (Node.js + Express)**

**What it does**: The "brain" of the application - stores data and processes requests

**Technology**: Node.js with Express (JavaScript on server)

**Files Location**: `backend/src/`

**What happens**:

1. Frontend sends a request (e.g., "Get all projects")
2. Backend receives it and checks if you're logged in (using token)
3. Backend queries the database (PostgreSQL)
4. Database returns the data
5. Backend sends data back to frontend as JSON
6. Frontend displays it on the screen

**Key Folders**:

| Folder         | What it does                  | Example                                         |
| -------------- | ----------------------------- | ----------------------------------------------- |
| `controllers/` | Handles requests              | `projectController.js` handles project requests |
| `routes/`      | Maps URLs to controllers      | `/api/projects` → projectController             |
| `middleware/`  | Checks requests (like guards) | `auth.js` checks if you're logged in            |
| `database/`    | Database setup                | Migrations & seed data                          |
| `utils/`       | Helper functions              | Validation, password hashing                    |

**Backend Flow**:

```
Request → Route → Middleware (Auth) → Controller → Database Query → Response
```

### 3. **Database (PostgreSQL)**

**What it does**: Stores all the data

**Technology**: PostgreSQL (a database)

**Think of it like**: A giant Excel spreadsheet with multiple sheets

**Tables (Sheets)**:

| Table        | What it stores          |
| ------------ | ----------------------- |
| `tenants`    | Companies/Organizations |
| `users`      | Team members            |
| `projects`   | Projects                |
| `tasks`      | Tasks in projects       |
| `audit_logs` | Activity history        |

**Example - Tenant Table**:

```
ID | Name | Subdomain | Plan
1  | Acme Corp | acme | pro
2  | TechStart | techstart | free
```

**Example - Users Table**:

```
ID | Email | Name | Tenant_ID | Role
1  | admin@acme.com | John | 1 | tenant_admin
2  | user1@acme.com | Alice | 1 | user
```

---

## 🔐 How Authentication Works (Simple Explanation)

Think of it like airport security:

```
Step 1: You arrive at airport
│
├─ Show passport (credentials)
├─ Security checks if valid
│
Step 2: Get boarding pass (token)
│
├─ Use boarding pass to enter areas
├─ No need to show passport every time
│
Step 3: Board plane
```

**In TaskFlow**:

```
Step 1: Login Page
│
├─ Enter email & password
├─ Send to backend
│
Step 2: Backend validates
│
├─ Check if email exists
├─ Check if password is correct
├─ Create JWT token (special string)
│
Step 3: Use token
│
├─ Token stored in browser (localStorage)
├─ Every request includes token in header
├─ Backend verifies token = you're logged in
```

**JWT Token** (What is it?):

```
A special code that says: "This person is John from Acme Corp, logged in until tomorrow"

It looks like:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRlbmFudElkIjo...

Three parts:
1. Header (what algorithm)
2. Payload (your info)
3. Signature (proof it's real)
```

---

## 🏗️ File Structure Explained

### Frontend Structure

```
frontend/
├── src/
│   ├── App.jsx ......................... Main component (routes)
│   ├── index.js ........................ Entry point
│   │
│   ├── pages/ .......................... Pages (screens users see)
│   │   ├── Login.jsx ................... Login screen
│   │   ├── Register.jsx ................ Sign up screen
│   │   ├── Dashboard.jsx ............... Home screen with stats
│   │   ├── Projects.jsx ................ List of projects
│   │   ├── ProjectDetails.jsx .......... Tasks in project
│   │   └── Users.jsx ................... Team management
│   │
│   ├── components/ ..................... Reusable pieces
│   │   └── Layout.jsx .................. Header/Navigation
│   │
│   ├── context/ ........................ Shared data
│   │   └── AuthContext.jsx ............. Who's logged in
│   │
│   ├── services/ ....................... API calls
│   │   └── api.jsx ..................... Functions to talk to backend
│   │
│   └── styles/ ......................... CSS files
│       └── Auth.css .................... Styling for login/signup
│
├── Dockerfile .......................... How to package frontend
├── nginx.conf .......................... Web server config
└── package.json ........................ Dependencies (libraries)
```

**How it works**:

1. `App.jsx` is loaded first
2. It uses React Router to show the right page
3. Each page is in `pages/`
4. Components in `context/` share data (like "who's logged in")
5. Services in `services/` make API calls to backend
6. CSS in `styles/` makes it look nice

### Backend Structure

```
backend/
├── src/
│   ├── server.js ...................... Starts the backend
│   │
│   ├── controllers/ ................... Handles requests
│   │   ├── authController.js ......... Login/Register/Logout
│   │   ├── projectController.js ...... Create/Edit/Delete projects
│   │   ├── taskController.js ......... Create/Edit/Delete tasks
│   │   ├── userController.js ......... Manage team members
│   │   └── tenantController.js ....... Manage organizations
│   │
│   ├── routes/ ........................ Maps URLs
│   │   ├── auth.js ................... Routes for login
│   │   ├── projects.js ............... Routes for projects
│   │   ├── tasks.js .................. Routes for tasks
│   │   ├── users.js .................. Routes for users
│   │   └── tenants.js ................ Routes for organizations
│   │
│   ├── middleware/ .................... Safety checks
│   │   ├── auth.js ................... Checks if logged in
│   │   └── authorize.js .............. Checks if allowed to do this
│   │
│   ├── config/ ........................ Settings
│   │   ├── database.js ............... How to connect to database
│   │   └── jwt.js .................... Token settings
│   │
│   ├── database/ ..................... Database setup
│   │   ├── init.js ................... Initialize database
│   │   ├── migrations/ ............... Schema setup
│   │   │   └── 001_create_tables.sql . Create all tables
│   │   └── seeds/ .................... Test data
│   │       └── seed_data.sql ......... Add fake users/projects
│   │
│   └── utils/ ........................ Helper functions
│       ├── validation.js ............. Check if email is valid
│       └── auditLog.js ............... Record who did what
│
├── Dockerfile ......................... How to package backend
├── package.json ....................... Dependencies (libraries)
└── server.js .......................... Starts everything
```

**How it works**:

1. `server.js` starts the backend on port 5000
2. Routes in `routes/` map URLs to functions
3. Controllers in `controllers/` handle the logic
4. Middleware checks if you're allowed
5. Utils help with common tasks
6. Database stores/retrieves data

---

## 🚀 How to Run the Project

### Option 1: Using Docker (Easiest)

```bash
# Go to project folder
cd multi-tenant-saas-task-manager

# Start everything
docker-compose up -d

# Open browser
http://localhost:3000
```

**What's happening**:

1. Docker creates 3 containers (mini computers)
2. One runs PostgreSQL (database)
3. One runs Node.js backend
4. One runs React frontend
5. They're connected so they can talk to each other

### Option 2: Running Locally (More Control)

**Terminal 1 - Start Database**:

```bash
# PostgreSQL must be installed
psql -U saas_user -d multi_tenant_saas
```

**Terminal 2 - Start Backend**:

```bash
cd backend
npm install          # Download libraries
npm start            # Start server on port 5000
```

**Terminal 3 - Start Frontend**:

```bash
cd frontend
npm install          # Download libraries
npm start            # Start on port 3000
```

---

## 💻 Understanding API Calls

### What's an API?

Think of API like ordering at a restaurant:

```
You (Client/Frontend) → Waiter (Request) → Kitchen (Backend) → Response (Food)
```

### How Frontend talks to Backend

**In Frontend Code**:

```javascript
// frontend/src/services/api.jsx

// This function makes an API call
export const registerTenant = (data) => api.post("/api/auth/register", data);

// When you click "Create Account" button:
// 1. User fills form
// 2. This function is called
// 3. Data is sent to backend at /api/auth/register
// 4. Backend processes it
// 5. Response comes back
// 6. Page updates
```

### Request & Response Format

**Request (Frontend → Backend)**:

```json
POST /api/auth/register
{
  "tenantName": "My Company",
  "subdomain": "mycompany",
  "adminEmail": "john@company.com",
  "adminPassword": "SecurePass@123"
}
```

**Response (Backend → Frontend)**:

```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenantId": "abc123",
    "subdomain": "mycompany",
    "adminUser": {
      "email": "john@company.com"
    }
  }
}
```

---

## 🔄 Complete Flow: Logging In

Let's trace what happens when you log in:

### Step 1: You click Login Button

```
Button Click (Login.jsx)
    ↓
Get email & password from form
    ↓
Call: api.post('/api/auth/login', {email, password})
```

### Step 2: Frontend Sends Request

```
HTTP Request to Backend
POST http://localhost:5000/api/auth/login
Headers: { "Content-Type": "application/json" }
Body: { "email": "admin@acme.com", "password": "Admin@123" }
```

### Step 3: Backend Receives Request

```
Express Route (backend/src/routes/auth.js)
    ↓
router.post('/login', loginController)
    ↓
Controller (backend/src/controllers/authController.js)
    ↓
Find user in database
    ↓
Check if password matches (using bcrypt)
    ↓
Create JWT token
    ↓
Send response: { success: true, token: "xyz...", user: {...} }
```

### Step 4: Frontend Gets Response

```
Response arrives (AuthContext.jsx)
    ↓
Save token to localStorage
    ↓
Save user info to context
    ↓
Redirect to Dashboard
    ↓
Dashboard loads
    ↓
Makes API call: api.get('/api/projects')
    ↓
This request includes token in header
    ↓
Backend sees token, knows who you are
    ↓
Returns only YOUR company's projects
```

### Step 5: Dashboard Shows Your Data

```
Projects are displayed
    ↓
You see only Acme Corp projects
    ↓
TechStart Inc projects are hidden
    ↓
(Multi-tenancy in action!)
```

---

## 🧑‍💼 User Roles & Permissions

### Three Types of Users

#### 1. Super Admin

- Can see all organizations
- Can manage everything system-wide
- Email: `superadmin@system.com`
- Password: `SuperAdmin@123`

**What they can do**:

- View all tenants
- Create/edit/delete tenants
- Access admin features

#### 2. Tenant Admin

- Can manage only their organization
- Can add/remove team members
- Can create projects
- Email (example): `admin@acme.com`
- Password: `Admin@123`

**What they can do**:

- Create/edit/delete projects
- Add/remove users
- Manage team
- Update organization settings

#### 3. Regular User

- Can only see/use what tenant admin allows
- Can view/edit projects and tasks
- Email (example): `user1@acme.com`
- Password: `User@123`

**What they can do**:

- View projects
- Create/edit tasks
- Assign tasks to themselves

### How Permissions Work

```
Middleware checks:
1. Is token valid? (auth.js)
2. Is user allowed to do this? (authorize.js)

Example:
User wants to DELETE a project
    ↓
Is token valid? ✓ Yes
    ↓
Is user tenant_admin or super_admin? ✓ Yes (tenant_admin)
    ↓
Does project belong to their tenant? ✓ Yes
    ↓
Allow DELETE ✓
    ↓
If any check fails → 403 Forbidden
```

---

## 🐛 Common Tasks & Where to Find Code

### Task 1: Add a New Field to a Form

**Example**: Add "Phone Number" to registration

**Files to Edit**:

1. `frontend/src/pages/Register.jsx` - Add input field
2. `backend/src/controllers/authController.js` - Add validation & save to database
3. `backend/src/database/migrations/001_create_tables.sql` - Add column to users table

### Task 2: Create a New API Endpoint

**Example**: Get user's tasks

**Steps**:

1. Create controller function in `backend/src/controllers/taskController.js`
2. Add route in `backend/src/routes/tasks.js`
3. Call it from frontend in `frontend/src/services/api.jsx`
4. Use it in a component

### Task 3: Fix a Bug

**Example**: Users can see other tenant's projects

**Debug Process**:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Make request (get projects)
4. Check response - are other tenants' projects included?
5. Check backend: `GET /api/projects` route
6. Check query: Is it filtering by tenant_id?

**Fix**: Add WHERE clause in database query

```sql
SELECT * FROM projects
WHERE tenant_id = $1  ← This filters by tenant
```

---

## 🔑 Test Credentials (For Testing)

### Super Admin

```
Email: superadmin@system.com
Password: SuperAdmin@123
Subdomain: (leave empty for super admin)
```

### Acme Tenant

```
Email: admin@acme.com
Password: Admin@123
Subdomain: acme
```

Supports also:

- `user1@acme.com` / `User@123` (Regular User)
- `user2@acme.com` / `User@123` (Regular User)

### TechStart Tenant

```
Email: admin@techstart.com
Password: Admin@123
Subdomain: techstart
```

---

## 🛠️ Development Workflow

### Day-to-Day Work

```
Morning:
  1. Start Docker: docker-compose up -d
  2. Check backend logs: docker-compose logs -f backend
  3. Open browser: http://localhost:3000

During Work:
  1. Make code changes
  2. Save file (hot reload happens automatically)
  3. Test in browser
  4. Check browser console (F12) for errors
  5. Check terminal for backend errors

End of Day:
  1. Stop Docker: docker-compose down
  2. Commit changes: git add . && git commit -m "message"
  3. Push: git push
```

### When Something Breaks

```
Check in this order:
1. Browser Console (F12) - Frontend errors
2. Backend Logs - docker-compose logs backend
3. Database - docker exec database psql ...
4. Network Tab (F12) - API request/response
5. Code - Look for syntax errors
```

---

## 📝 Code Examples

### Frontend Example: Get Projects

**In Component** (`frontend/src/pages/Projects.jsx`):

```javascript
import { useState, useEffect } from "react";
import { listProjects } from "../services/api.jsx";

function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Get projects when page loads
    const getProjects = async () => {
      try {
        const response = await listProjects();
        setProjects(response.data.projects);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    getProjects();
  }, []); // Empty array means run once

  return (
    <div>
      {projects.map((project) => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

**In API Service** (`frontend/src/services/api.jsx`):

```javascript
// This function calls backend
export const listProjects = () => api.get("/api/projects"); // Token automatically included
```

### Backend Example: Get Projects

**In Controller** (`backend/src/controllers/projectController.js`):

```javascript
const getProjects = async (req, res) => {
  try {
    // req.user.tenantId comes from token
    const tenantId = req.user.tenantId;

    // Query only this tenant's projects
    const projects = await query(
      "SELECT * FROM projects WHERE tenant_id = $1",
      [tenantId],
    );

    res.json({
      success: true,
      data: { projects: projects.rows },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

**In Route** (`backend/src/routes/projects.js`):

```javascript
const express = require("express");
const { getProjects } = require("../controllers/projectController");
const auth = require("../middleware/auth");

const router = express.Router();

// /api/projects route
router.get("/", auth, getProjects); // 'auth' middleware checks token

module.exports = router;
```

---

## 🎓 Learning Path for Freshers

### Week 1: Understand the Basics

- [ ] Read this DEVNOTES.md file
- [ ] Understand what each folder does
- [ ] Run `docker-compose up -d` and explore
- [ ] Try logging in with test credentials
- [ ] Open browser DevTools and inspect requests

### Week 2: Understand the Code

- [ ] Read Login.jsx and understand the flow
- [ ] Read authController.js and understand backend
- [ ] Understand JWT tokens
- [ ] Understand middleware (auth.js)

### Week 3: Make Your First Change

- [ ] Change button color in CSS
- [ ] Change a message text
- [ ] Add a new validation rule
- [ ] Test your changes

### Week 4: Add a New Feature

- [ ] Add a new form field
- [ ] Save it to database
- [ ] Display it on frontend
- [ ] Test everything works

---

## 📚 Useful Resources

### Frontend

- React Docs: https://react.dev/
- React Router: https://reactrouter.com/
- Axios: https://axios-http.com/

### Backend

- Express Docs: https://expressjs.com/
- PostgreSQL: https://www.postgresql.org/docs/
- JWT: https://jwt.io/

### Tools

- Postman: https://www.postman.com/ (Test API)
- Git: https://git-scm.com/doc (Version control)
- Docker: https://docs.docker.com/ (Containers)

---

## 🆘 Troubleshooting Guide

### Problem: "Cannot connect to database"

**Solution**:

```bash
# Check if database container is running
docker ps

# Restart containers
docker-compose down
docker-compose up -d
```

### Problem: "Port 3000 already in use"

**Solution**:

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or restart Docker
docker-compose restart
```

### Problem: "Token expired" error

**Solution**:

```
Log out and log in again
The token lasts 24 hours
```

### Problem: "Cannot find module" error

**Solution**:

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

### Problem: Form data not saving

**Check**:

1. Is validation passing? (Check browser console)
2. Is backend receiving request? (Check backend logs)
3. Is database connected? (Check docker-compose logs database)
4. Any SQL errors? (Check Docker logs)

---

## 💡 Pro Tips

1. **Use DevTools** (F12 in browser)
   - Network tab: See API requests
   - Console: See JavaScript errors
   - Application: See localStorage data

2. **Read Error Messages**
   - They usually tell you the problem
   - Don't ignore them!

3. **Use Docker Logs**

   ```bash
   docker-compose logs backend -f  # See backend logs in real-time
   docker-compose logs frontend -f # See frontend logs
   ```

4. **Test with Postman**
   - Use `TaskFlow_Postman_Collection.json`
   - Test API without frontend
   - Easier debugging

5. **Read the Code**
   - Start from routes
   - Follow the flow
   - Add comments as you learn

---

## 🎯 Summary

| Component | Does What           | Language             |
| --------- | ------------------- | -------------------- |
| Frontend  | What user sees      | React (JavaScript)   |
| Backend   | Business logic      | Node.js (JavaScript) |
| Database  | Stores data         | PostgreSQL (SQL)     |
| Docker    | Packages everything | YAML                 |

**Flow**: User clicks → Frontend → API Call → Backend → Database → Response → Display

**Security**: Token → Middleware → Authorization → Database Query → Only your data

**Multi-Tenancy**: Every query filtered by tenant_id → Each company sees only their data

---

## 🚀 Next Steps

1. **Run the project**: `docker-compose up -d`
2. **Login**: admin@acme.com / Admin@123
3. **Explore**: Click around, see what works
4. **Read code**: Open controller files, understand flow
5. **Make changes**: Try changing something small
6. **Ask questions**: Read documentation, Google, ask senior devs

**Good Luck!** 🎉
