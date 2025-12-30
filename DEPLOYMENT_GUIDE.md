# 🚀 Deployment Guide - Multi-Tenant SaaS Task Manager

## Quick Start (Production Deployment)

### Prerequisites
- Docker (19.03+)
- Docker Compose (1.25+)
- 2GB RAM minimum
- Ports 3001, 5001, 5433 available

### 1. Deploy to Server

```bash
# Clone/download the project
cd multi-tenant-saas-task-manager

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Check health
curl http://localhost:5001/api/health
```

### 2. Access Application

- **Frontend**: http://your-server:3001
- **API**: http://your-server:5001/api
- **Database**: your-server:5433 (internal only)

### 3. Initial Login

```
Email: admin@acme.com
Password: Admin@123
```

---

## Environment Configuration

### Backend Environment Variables

Create `.env` in backend directory (optional - defaults provided):

```env
# Server
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# Database
DB_HOST=saas-database
DB_PORT=5432
DB_NAME=saas_db
DB_USER=postgres
DB_PASSWORD=postgres_password

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=86400

# CORS
FRONTEND_URL=http://localhost:3001

# Features
AUTO_INIT_DB=true
SEED_DATA=true
```

### Frontend Environment Variables

In `docker-compose.yml`:

```yaml
environment:
  - REACT_APP_API_URL=http://localhost:5001
  - NODE_ENV=production
```

---

## Database Management

### Initialize Database

Database initializes automatically on first run. To reset:

```bash
# Backup current database
docker-compose exec database pg_dump -U postgres saas_db > backup.sql

# Stop services
docker-compose down

# Remove database volume
docker volume rm multi-tenant-saas-task-manager_postgres_data

# Restart - database will reinitialize
docker-compose up -d
```

### Access Database

```bash
docker-compose exec database psql -U postgres -d saas_db
```

### Useful SQL Commands

```sql
-- View all users
SELECT email, role, tenant_id FROM users;

-- View all projects
SELECT name, status FROM projects;

-- View all tasks
SELECT title, status, priority FROM tasks;

-- Check audit logs
SELECT * FROM audit_logs LIMIT 10;
```

---

## Monitoring & Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Health Checks

```bash
# Backend health
curl http://localhost:5001/api/health

# Check service status
docker-compose ps
```

---

## Scaling & Performance

### Increase Resources

Edit `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Database Optimization

```bash
# Connect to database
docker-compose exec database psql -U postgres -d saas_db

# Analyze query performance
ANALYZE;
VACUUM;
```

---

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong database password
- [ ] Enable HTTPS (reverse proxy/load balancer)
- [ ] Restrict database access to backend only
- [ ] Set up regular backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep Docker images updated
- [ ] Use secrets management for sensitive data

---

## Backup & Recovery

### Backup Database

```bash
# Daily backup script
docker-compose exec database pg_dump -U postgres saas_db > \
  backups/saas_db_$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
docker-compose exec -T database psql -U postgres saas_db < backup.sql
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Rebuild images
docker-compose build --no-cache

# Restart
docker-compose down && docker-compose up -d
```

### Port Already in Use

Change ports in `docker-compose.yml`:

```yaml
ports:
  - "3002:3000"  # Frontend on 3002
  - "5002:5000"  # Backend on 5002
  - "5434:5432"  # Database on 5434
```

### Database Connection Error

```bash
# Check if database is healthy
docker-compose exec database psql -U postgres -c "SELECT 1"

# Restart database
docker-compose restart database
```

### CORS Errors in Frontend

Update `FRONTEND_URL` in backend environment to match frontend URL

---

## Production Checklist

- [ ] All services running (`docker-compose ps`)
- [ ] Health check passing (`curl /api/health`)
- [ ] Login works with default credentials
- [ ] Create/read/update/delete operations functional
- [ ] Data persists across restarts
- [ ] Logs monitored and clean
- [ ] Backups configured
- [ ] SSL/TLS configured (if public)
- [ ] Rate limiting configured
- [ ] Error tracking enabled
- [ ] Alerts configured

---

## Performance Optimization

### Database Tuning

```sql
-- Add indexes for common queries
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_projects_tenant ON projects(tenant_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
```

### Frontend Optimization

- Assets cached in Docker image
- CSS and JS minified
- Images optimized
- Nginx gzip compression enabled

### Backend Optimization

- Connection pooling configured
- Query optimization in place
- Response caching where applicable

---

## Disaster Recovery

### Automated Backups

```bash
#!/bin/bash
# backup.sh - Add to cron

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

docker-compose exec -T database pg_dump -U postgres saas_db | \
  gzip > $BACKUP_DIR/saas_db_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "saas_db_*.sql.gz" -mtime +30 -delete
```

### Automated Cleanup

```bash
#!/bin/bash
# cleanup.sh

# Remove old logs
docker-compose exec -T database psql -U postgres -d saas_db -c \
  "DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';"

# Vacuum database
docker-compose exec -T database psql -U postgres -d saas_db -c "VACUUM;"
```

---

## Maintenance Tasks

### Weekly
- [ ] Check logs for errors
- [ ] Verify backups
- [ ] Monitor disk space

### Monthly
- [ ] Database optimization (ANALYZE, VACUUM)
- [ ] Review audit logs
- [ ] Test backup restoration

### Quarterly
- [ ] Update Docker images
- [ ] Security audit
- [ ] Performance review

---

## Support

For issues:

1. Check logs: `docker-compose logs -f`
2. Verify containers: `docker-compose ps`
3. Test health: `curl http://localhost:5001/api/health`
4. Check database: `docker-compose exec database psql -U postgres`

---

**Last Updated**: 2025-12-27
**Status**: ✅ Production Ready
