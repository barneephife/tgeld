# Taschengeld Family Allowance Application

Taschengeld is an allowance tracker application designed to help families manage chores, tasks, and allowances for children. It features a user-friendly interface for both parents and children to interact with.

Taschengeld is the German word for "pocket money" and was developed for a family in Switzerland. As a result, there are two German words, "Taschengeld" and "Sparkässeli" which means "Piggy-Bank".

## Features

- 👥 **User Management**
  - Create accounts for family members
  - User profiles and preferences
  - Access control

- 📋 **Task Management**
  - Create and manage tasks
  - Set task values and descriptions
  - Track task completion

- 💵 **Payout System**
  - Review completed tasks and allocate payment to accounts
  - Bulk transaction processing

- 💰 **Piggy-Bank Account System**
  - Track account balances and transaction history
  - Manually credit and debit accounts

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- 1GB free RAM
- 2GB free disk space

The application is available as a multi-architecture Docker image supporting both ARM64 (e.g., Apple Silicon) and AMD64 (Intel/AMD) platforms. Docker will automatically select the correct version for your system.

## Quick Start Guide

1. Create a new directory for Taschengeld:
   ```bash
   mkdir tgeld && cd tgeld
   mkdir -p ./data/postgres
   ```

2. Create `.env` file:
   ```bash
   # Copy this template and save as .env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_secure_password  # Change this!
   POSTGRES_DB=tgeld
   DATABASE_URL=postgresql://postgres:your_secure_password@db:5432/tgeld?schema=public
   POSTGRES_DATA_DIR=./data/postgres
   ```
   ⚠️ Replace `your_secure_password` with your chosen password in BOTH places
   ⚠️ Password Requirements:
     - Use only alphanumeric characters (a-z, A-Z, 0-9)
     - Avoid special characters (!@#$%^&*) as they may cause issues with the PostgreSQL connection string
     - Example of a good password: TGeld2025DB

3. Create `docker-compose.yml`:
   ```yaml
   services:
     app:
       image: tgeld/tgeld:latest
       ports:
         - '8071:3000'  # Change 8071 if needed
       environment:
         - DATABASE_URL=${DATABASE_URL}
       depends_on:
         - db
     db:
       image: postgres:16-alpine
       environment:
         - POSTGRES_USER=${POSTGRES_USER}
         - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
         - POSTGRES_DB=${POSTGRES_DB}
       volumes:
         - ${POSTGRES_DATA_DIR}:/var/lib/postgresql/data
   ```

4. Start the application:
   ```bash
   docker compose up -d
   ```

5. Access the application at `http://localhost:8071` (or your configured port)

## Directory Structure

After setup, your directory should look like this:
```
tgeld/
├── data/
│   └── postgres/          # Database files (created by PostgreSQL)
│       └── [db files]     # Various PostgreSQL data files
├── .env                   # Environment configuration
└── docker-compose.yml     # Docker configuration

Additional files created during use:
├── backup.sql            # Database backup (if created)
└── logs/                 # Log files (if enabled)
```

⚠️ Important Notes:
- Never delete the `data/postgres` directory while the application is running
- Always backup both `.env` and `data/postgres` directory
- The `logs` directory is created automatically if logging is enabled

## Important Configuration Notes

### Port Configuration
- Default port is 8071
- To use a different port, change the first number in `docker-compose.yml`:
  ```yaml
  ports:
    - '8072:3000'  # Changed from 8071 to 8072
  ```

### Data Storage
- Database files are stored in `./data/postgres` by default
- Change `POSTGRES_DATA_DIR` in `.env` to use a different location
- Ensure the directory exists before starting
- Include this directory in your backup strategy

### Security
- Always change the default password in `.env`
- Use a strong password (12+ characters, mixed case, numbers, symbols)
- Keep your `.env` file secure and never share it
- Back up your `.env` file - you need it to restore the application

## Maintenance

### Backup Database

Option 1: Command Line
```bash
docker compose exec db pg_dump -U postgres tgeld > backup.sql
```

Option 2: Web Interface
1. Click Global App Settings (top right)
2. Go to Backup and Restore
3. Click "Download" under Full Database Backup

### Restore Database

Option 1: Command Line
```bash
cat backup.sql | docker compose exec -T db psql -U postgres -d tgeld
```

Option 2: Web Interface
1. Click Global App Settings (top right)
2. Go to Backup and Restore
3. Click "Upload" under Full Database Backup

### Update Application

```bash
# Stop application
docker compose down

# Get latest version
docker compose pull

# Start updated application
docker compose up -d
```

### Free Up Disk Space
Remove old, unused Docker images:
```bash
docker image prune -f
```

## Troubleshooting

### Application Won't Start
1. Check if containers are running:
   ```bash
   docker compose ps
   ```

2. Check logs:
   ```bash
   docker compose logs
   ```

3. Verify port availability:
   ```bash
   # On Linux/Mac
   lsof -i :8071
   # On Windows
   netstat -ano | findstr :8071
   ```

### Database Connection Issues
1. Verify environment variables:
   ```bash
   docker compose config
   ```

2. Check database logs:
   ```bash
   docker compose logs db
   ```

### Need More Help?
- Check our [GitHub Issues](https://github.com/barneephife/tgeld/issues)
- Submit a new issue if you can't find a solution

## For Developers
If you're a developer wanting to contribute or modify the application, please see [README_DEV.md](README_DEV.md).

## License
MIT License - See LICENSE file for details
