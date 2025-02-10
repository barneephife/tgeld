# Installation Guide

This guide will walk you through the process of installing and setting up the Tgeld Task Management System.

## Prerequisites

Before you begin, ensure you have the following installed:

For Development:

- Node.js 18 or later
- Git
- PostgreSQL 16

For Production:

- Docker Engine (24.0.0 or later)
- Docker Compose V2
- Git

## Installation Steps

### Development Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/barneephife/tgeld.git
   cd tgeld
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment**

   ```bash
   # Copy example environment file
   cp .env.example .env
   ```

   Edit `.env` and configure:

   ```bash
   # Database
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/tgeld?schema=public
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   ```

   Access the application at:

   ```
   http://localhost:3000
   ```

### Production Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/barneephife/tgeld.git
   cd tgeld
   ```

2. **Configure Environment**

   ```bash
   # Copy example environment file
   cp .env.example .env
   ```

   Edit `.env` and configure:

   ```bash
   # Application
   NODE_ENV=production
   NEXT_PUBLIC_PORT=21971

   # Database
   DB_HOST=db
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_secure_password
   DB_DATABASE=tgeld

   # Prisma
   DATABASE_URL=postgresql://postgres:your_secure_password@db:5432/tgeld?schema=public
   ```

3. **Start the Application**

   ```bash
   # Pull the latest images
   docker-compose pull

   # Start the services
   docker-compose up -d
   ```

4. **Verify Installation**

   - Check container status:

     ```bash
     docker-compose ps
     ```

   - Access the application:
     ```
     http://localhost:3000
     ```

## Post-Installation

### Development Environment

1. **Create Initial Task**

   ```bash
   curl -X POST http://localhost:3000/api/tasks \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Task","description":"Testing the installation","payout_value":10}'
   ```

2. **Verify Database**
   ```bash
   psql -U postgres -d tgeld -c "SELECT * FROM tasks;"
   ```

### Production Environment

1. **Create Initial Task**

   ```bash
   curl -X POST http://localhost:3000/api/tasks \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Task","description":"Testing the installation","payout_value":10}'
   ```

2. **Verify Database**
   ```bash
   docker-compose exec db psql -U postgres -d tgeld -c "SELECT * FROM tasks;"
   ```

## Troubleshooting

### Development Environment Issues

1. **Database Connection**

   - Error: `connection refused`
   - Solution: Ensure PostgreSQL is running and accessible

   ```bash
   # Check PostgreSQL status
   pg_isready
   ```

2. **Build Issues**
   ```bash
   # Clear Next.js cache and node_modules
   rm -rf .next node_modules
   npm install
   ```

### Production Environment Issues

1. **Port Conflicts**

   - Error: `port is already allocated`
   - Solution: Change the port in `.env` and `docker-compose.yml`

2. **Database Connection**

   - Error: `connection refused`
   - Solution: Wait a few seconds for the database to initialize

3. **Permission Issues**
   - Error: `permission denied`
   - Solution: Ensure proper file permissions in the mounted volumes

### Getting Help

If you encounter any issues:

1. Check application logs:

   ```bash
   # Development
   npm run dev

   # Production
   docker-compose logs
   ```

2. Verify environment variables:

   ```bash
   # Development
   cat .env

   # Production
   docker-compose config
   ```

## Next Steps

After successful installation:

1. Read the [User Guide](../2-user-guide/basics.md)
2. Configure [Backup Settings](../5-maintenance/backup-restore.md)
3. Review [Security Best Practices](../2-architecture/security.md)
