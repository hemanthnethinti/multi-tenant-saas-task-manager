# 🚀 QUICK REFERENCE CARD

## START APP (One Command)
```bash
cd z:\GPP\week@5\multi-tenant-saas-task-manager
docker-compose up -d
```

## ACCESS APPLICATION
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5001
- **API Docs**: http://localhost:5001/api

## LOGIN CREDENTIALS
```
Email:    admin@acme.com
Password: Admin@123
```

## WHAT YOU CAN DO
✅ Create, edit, delete **projects**
✅ Create, edit, delete **tasks**
✅ Create, edit, delete **users**
✅ Update task **status** (inline)
✅ Assign tasks to **team members**
✅ View **dashboard** with stats
✅ Set task **priority** and **due date**

## USEFUL COMMANDS
```bash
# Check services
docker-compose ps

# View logs
docker-compose logs -f backend

# Access database
docker-compose exec database psql -U postgres -d saas_db

# Stop services
docker-compose down

# Rebuild frontend
docker-compose build frontend

# Restart backend
docker-compose restart backend
```

## PAGES & FEATURES
| Page | Features |
|------|----------|
| Dashboard | Stats, recent projects, quick actions |
| Projects | Create, edit, delete, view tasks |
| Project Details | Full task CRUD, status updates |
| Users | Add, edit, remove users, assign roles |

## API ENDPOINTS (19 total)
- **Auth**: Login, Register, Get User, Logout
- **Projects**: CRUD operations
- **Users**: Add, List, Update, Delete
- **Tasks**: CRUD + Status updates
- **Tenants**: List, Get, Update
- **Health**: Check API status

## DATABASE
- **Type**: PostgreSQL
- **Host**: localhost:5433
- **Database**: saas_db
- **User**: postgres
- **Password**: postgres_password

## TROUBLESHOOTING
| Issue | Solution |
|-------|----------|
| Ports in use | Change ports in docker-compose.yml |
| DB not starting | Check disk space, restart Docker |
| CORS errors | Verify FRONTEND_URL in backend env |
| No data showing | Check backend logs: `docker-compose logs backend` |

## DEFAULT SAMPLE DATA
- **Tenant**: Acme Corp (acme subdomain)
- **Users**: admin@acme.com, user@acme.com, user2@acme.com
- **Projects**: Website Redesign, Mobile App Launch
- **Tasks**: Multiple with different statuses

## PRODUCTION DEPLOYMENT
1. Update JWT_SECRET in backend
2. Change database password
3. Configure HTTPS/SSL
4. Set up automated backups
5. Configure monitoring and alerts
6. Deploy with `docker-compose up -d`

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2025-12-27
