# Docker Deployment Guide

This guide explains how to deploy the Laundry Management System using Docker.

## Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)

## Quick Start

1. **Clone the repository and navigate to the project directory**
   ```bash
   cd laundry-system
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the values, especially:
   - `JWT_SECRET` - Use a strong random string in production
   - `DB_PASSWORD` - Set a secure database password
   - `DB_ROOT_PASSWORD` - Set a secure root password

3. **Build and start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - Database: localhost:3306

## Docker Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop services and remove volumes (WARNING: deletes all data)
```bash
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Rebuild after code changes
```bash
docker-compose up -d --build
```

### Restart a specific service
```bash
docker-compose restart backend
```

## Production Deployment

For production deployments:

1. **Update environment variables**
   - Set strong passwords
   - Configure `NEXT_PUBLIC_API_URL` to your backend URL
   - Set `NODE_ENV=production`

2. **Use external database (recommended)**
   - Comment out the `db` service in docker-compose.yml
   - Update backend environment variables to point to your external database

3. **Enable SSL/HTTPS**
   - Use a reverse proxy like Nginx or Traefik
   - Configure SSL certificates

4. **Resource limits**
   Add resource limits to services in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

## Troubleshooting

### Database connection issues
```bash
# Check if database is healthy
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Port conflicts
If ports 3000, 5001, or 3306 are already in use, update the port mappings in `.env`:
```
FRONTEND_PORT=3001
BACKEND_PORT=5002
DB_PORT=3307
```

### Clear and rebuild
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │ ───────>│   Backend   │ ───────>│   MySQL DB  │
│  (Next.js)  │         │  (Express)  │         │             │
│   :3000     │         │    :5001    │         │   :3306     │
└─────────────┘         └─────────────┘         └─────────────┘
```

## Development

For development with hot-reload:

1. Use the regular npm commands instead of Docker
2. Or modify docker-compose.yml to mount volumes:
   ```yaml
   backend:
     volumes:
       - ./backend:/app
       - /app/node_modules
     command: npm run dev
   ```

## Backup Database

```bash
# Create backup
docker exec laundry-db mysqldump -u root -p<password> laundry > backup.sql

# Restore backup
docker exec -i laundry-db mysql -u root -p<password> laundry < backup.sql
```
