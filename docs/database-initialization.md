# Database Initialization Process

## Overview

The Taschengeld application includes an automatic database initialization process that runs during container startup. This process ensures that new installations have a minimal working setup while preserving existing data during upgrades.

## How It Works

1. **Startup Process**
   - The initialization check runs automatically as part of the Docker container startup
   - Location: `/app/scripts/initialize-data.js`
   - Executed by: `docker-entrypoint.sh`

2. **Initialization Logic**
   - The script first checks if any users exist in the database
   - If users exist (existing installation):
     - No changes are made
     - Existing data is preserved
   - If no users exist (fresh installation):
     - Creates one example user
     - Sets up a piggy bank account for the user
     - Creates one example task

3. **Default Data Created**
   - Example User:
     - Name: "Example User"
     - Icon: 👤
   - Piggy Bank Account:
     - Account number: 1000000001
     - Initial balance: 0
   - Example Task:
     - Title: "Example Task"
     - Description: "This is an example task. You can edit or delete it, and create new tasks as needed."
     - Icon: 📝
     - Payout value: 1.00

## Usage

### Fresh Installation
1. When you first deploy the application:
   ```bash
   docker compose pull
   docker compose up -d
   ```
2. The database will be automatically initialized with example data
3. Log in and customize the example user and task according to your needs

### Upgrading Existing Installation
1. When you upgrade to a new version:
   ```bash
   docker compose pull
   docker compose up -d
   ```
2. Your existing data will be preserved
3. No example data will be added

## Production Environment Configuration

When deploying in production using Docker Compose, the `.env` file should be configured as follows:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=tgeld
DATABASE_URL=postgresql://postgres:your_secure_password@db:5432/tgeld?schema=public

# Data directory for PostgreSQL
POSTGRES_DATA_DIR=./data/postgres
```

**Important Notes:**
1. The DATABASE_URL should use direct values instead of ${VAR} references
2. Make sure the POSTGRES_DATA_DIR path exists before starting containers
3. Always change the default password in production

Example of correct values:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Marathon123!
POSTGRES_DB=tgeld
DATABASE_URL=postgresql://postgres:Marathon123!@db:5432/tgeld?schema=public
POSTGRES_DATA_DIR=./data/postgres
```

This ensures proper variable expansion in the Docker environment.

## Notes

- The initialization only runs if the database is completely empty (no users)
- You can safely delete or modify the example user and task
- All users have full administrative capabilities
- The initialization process is automatic and requires no configuration
