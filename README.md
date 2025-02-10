# Taschengeld Family Allowance Application

Taschengeld is an allowance tracker application designed to help families manage chores, tasks, and allowances for children. It features a user-friendly interface for both parents and children to interact with.

Taschengeld is the German word for "pocket money" and was developed for a family in Switzerland.  As a result, there are two German words, "Taschengeld" and "Sparkässeli" which means "Piggy-Bank".

A modern task management system built with Next.js, PostgreSQL, and Docker.

## Features

    👥 User Management
        - Create accounts for family members
        - User profiles and preferences
        - Access control

    📋 Task Management
        - Create and manage tasks
        - Set task values and descriptions
        - Track task completion

    💵 Payout System
        - Review completed tasks and allocate payment to accounts
        - Bulk transaction processing

    💰 Piggy-Bank Account System
        Track account balances and transaction history
        Manually credit and debit accounts

- Docker-based
- PostgreSQL database for data persistence

## Prerequisites

For Production:
- Docker and Docker Compose

For Development (software developers):
- See [README_DEV.md](README_DEV.md)

The rest of this document is for users of the application (AKA: "Production").

## Quick Start

1. Create directory structure
2. Create docker-compose.yml and .env and set variables (port and password)
3. Execute: docker compose up -d

### Detailed Setup Steps

1. Create a new directory for your Tgeld installation and database storage:
   ```bash
   mkdir tgeld && cd tgeld
   mkdir -p ./data/postgres
   ```

2. Create a `.env` file with your configuration.  Copy the following into your .env:
   ```bash
   # Database
   POSTGRES_USER=postgres  #keep or change
   POSTGRES_PASSWORD=your_secure_password  #CHANGE THIS
   POSTGRES_DB=tgeld  #keep or change
   DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public  ##do not change

   # Data directory for PostgreSQL (adjust path as needed)
   POSTGRES_DATA_DIR=./data/postgres  #change to your preferred backup location.  If you change this, be sure the folder/path exists before starting the container.
   ```

3. Create a `docker-compose.yml` file with the following content.  Change only the ports if needed:
   ```yaml
   services:
     app:
       image: tgeld/tgeld:latest
       ports:
         - "8071:3000"  #change left number if port 8071 is already in use on your system (e.g., "8072:3000")
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

The application will be available at `http://localhost:8071` (or whichever port you configured in `docker-compose.yml`).

> **Note about ports**: In the `docker-compose.yml` file, the ports are configured as `HOST_PORT:CONTAINER_PORT`. If port 8071 is already in use on your system, change the left number to an available port (e.g., "8072:3000"). The right number must remain 3000 as that's the port the application uses inside the container.

> **Note about data storage**: PostgreSQL data is stored in the directory specified by `POSTGRES_DATA_DIR` in your `.env` file. By default, this is `./data/postgres` relative to your docker-compose.yml file. You can change this to any location on your system (e.g., `/home/user/backups/tgeld/postgres` or `C:\tgeld\data\postgres`) to better integrate with your backup system. Just make sure the directory exists before starting the containers.

## Database Management

### Create a database backup:
#### From outside the application:
```bash
docker-compose exec db pg_dump -U postgres tgeld > backup.sql
```
or
#### From within the application:
   - Click the Global App Settings icon found on the top right corner.
   - Scroll to the Backup and Restore Section.
   - Locate Full Database Backup and click the "Download" button.  Save file to your preferred location.

### Restore a database backup:
#### From outside the application:
```bash
cat backup.sql | docker-compose exec -T db psql -U postgres -d tgeld
```
or
#### From within the application:
   - Click the Global App Settings icon found on the top right corner.
   - Scroll to the Backup and Restore Section.
   - Locate Full Database Backup and click the "Upload" button.  Find the saved file to your preferred location.


## Updating the Application

To update to the latest version (Docker image):
```bash
docker compose down    # Stop and remove existing containers
docker compose pull   # Get the latest version of the image
docker compose up -d  # Start containers with the new version
```

> **Note about disk space**: The update process keeps old versions of the images on your system. If you want to clean up old, unused images to free up disk space, you can run:
```bash
docker image prune -f  # Remove unused images
```
Or to see how much space can be freed first:
```bash
docker image prune -f --dry-run  # Show what would be removed
```

## License

MIT License - See LICENSE file for details
