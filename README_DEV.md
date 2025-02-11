# Taschengeld Family Allowance Application - Developer Guide

This guide is for developers who want to contribute to or modify the Taschengeld application.

## Development Prerequisites

- Docker and Docker Compose
- Git
- Node.js 18+ (for local tooling only)
- PostgreSQL 16 (for local tooling only)

## Development Philosophy

We follow a Docker-first development approach to ensure consistency between development and production environments. This means:
- Always develop and test in Docker
- Use the same configuration and processes as production
- Catch deployment issues early in the development cycle

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/barneephife/tgeld.git
   cd tgeld
   ```

2. Install local dependencies (for tooling only):
   ```bash
   npm install
   ```

3. Copy environment files:
   ```bash
   # For Docker development
   cp .env.example .env

   # For local tooling (migrations, etc)
   cp .env.example .env.development
   ```

   Edit `.env` and `.env.development` as needed. The Docker environment uses `db` as the database host, while local tooling uses `localhost`.

## Development Workflow

### 1. Starting the Development Environment

Always use Docker for development:
```bash
# Build the latest image
docker build -f Dockerfile.prod -t tgeld:latest .

# Start the development stack
docker compose up
```

The application will be available at `http://localhost:21971`.

### 2. Making Changes

1. Edit code as needed
2. Rebuild and restart to test changes:
   ```bash
   docker build -f Dockerfile.prod -t tgeld:latest .
   docker compose restart app
   ```

### 3. Database Changes

When making database changes:

1. Create a new migration:
   ```bash
   # Create migration (using local tooling)
   npx prisma migrate dev --create-only --name descriptive_name
   ```

2. Review the generated migration in `prisma/migrations`

3. Test the migration in Docker:
   ```bash
   # Rebuild with new migration
   docker build -f Dockerfile.prod -t tgeld:latest .
   docker compose up --force-recreate
   ```

4. If the migration works, commit both the schema and migration files

### 4. Troubleshooting

If you encounter issues:

1. Check Docker logs:
   ```bash
   docker compose logs -f app
   docker compose logs -f db
   ```

2. Verify database state:
   ```bash
   # Connect to database
   docker compose exec db psql -U postgres -d tgeld
   ```

3. Reset if needed:
   ```bash
   docker compose down -v  # Removes volumes
   docker compose up      # Fresh start
   ```

## Why Docker-First Development?

1. **Environment Parity**
   - Development matches production exactly
   - No "works on my machine" issues
   - All developers use the same setup

2. **Early Problem Detection**
   - Docker-specific issues found immediately
   - Database migration issues caught early
   - Configuration problems visible during development

3. **Simplified Deployment**
   - Same process from development to production
   - Tested container configuration
   - Verified environment variables

## Local Tooling (When Needed)

While development happens in Docker, some tasks require local tooling:

1. **Creating Migrations**
   ```bash
   # Use local environment
   export $(cat .env.development | xargs)
   npx prisma migrate dev --create-only
   ```

2. **Generating Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Database Management**
   ```bash
   # Reset local database (if needed)
   npx prisma migrate reset
   ```

Remember: Local tooling is for development tasks only. Always test changes in Docker before committing.

## Best Practices

1. **Never Skip Docker Testing**
   - Don't rely on local-only testing
   - Always verify in Docker before committing
   - Use the same Docker configuration as production

2. **Migration Management**
   - Create explicit migrations
   - Test migrations in Docker
   - Never rely on automatic migrations

3. **Environment Variables**
   - Keep Docker and local configs separate
   - Use appropriate database hosts
   - Never commit sensitive values

4. **Continuous Testing**
   - Test frequently in Docker
   - Verify all database changes
   - Check logs for potential issues

## Environment Configuration

We maintain two distinct environment configurations:

### Development Environment
```env
# Database Configuration (Local Development)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_local_password
DB_DATABASE=tgeld

# Database URL for Prisma (Local Development)
DATABASE_URL=postgresql://postgres:your_local_password@localhost:5432/tgeld?schema=public
```

### Production Environment (Docker)
```env
# Database Configuration (Docker)
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tgeld_secure_password_2024
DB_DATABASE=tgeld

# Database URL for Prisma (Docker)
DATABASE_URL=postgresql://postgres:tgeld_secure_password_2024@db:5432/tgeld?schema=public
```

## Project Structure

```
tgeld/
├── app/                  # Next.js app directory
├── components/           # React components
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── styles/              # CSS styles
├── Dockerfile.prod      # Production Docker configuration
└── docker-compose.yml   # Development Docker configuration
```

## Building and Publishing Docker Images

### 1. Setting up Multi-Architecture Support

First, create a builder that supports multi-platform builds:
```bash
docker buildx create --name multiarch --driver docker-container --use
```

### 2. Building the Production Image

Build a multi-arch image that supports both ARM64 (M1/M2 Macs) and AMD64 (Intel/AMD) platforms:
```bash
# Build and push multi-arch image
docker buildx build --platform linux/amd64,linux/arm64 \
  -f Dockerfile.prod \
  -t tgeld/tgeld:latest \
  . --push
```

To verify the supported architectures:
```bash
docker buildx imagetools inspect tgeld/tgeld:latest
```

### 3. Version Tagging (for releases)

For release versions, tag the image with both latest and version number:
```bash
# Build and push with version tag
docker buildx build --platform linux/amd64,linux/arm64 \
  -f Dockerfile.prod \
  -t tgeld/tgeld:latest \
  -t tgeld/tgeld:v1.2.x \
  . --push
```

### 4. Running Locally

The image will automatically use the correct architecture for your system:
```bash
docker compose up -d
```

Note: The multi-arch image ensures compatibility across different platforms:
- ARM64: Apple Silicon (M1/M2) Macs
- AMD64: Intel/AMD machines and most cloud servers

## Multi-Architecture Support (ARM64 and AMD64)

### Building Multi-Architecture Images

To support both M1 Macs (ARM64) and traditional machines (AMD64):

1. **Enable BuildKit**
   ```bash
   export DOCKER_BUILDKIT=1
   ```

2. **Create and Use Build Platform**
   ```bash
   # Create a multi-platform builder
   docker buildx create --name multiarch --driver docker-container --use
   
   # Verify it's ready
   docker buildx inspect --bootstrap
   ```

3. **Build Multi-Architecture Image**
   ```bash
   # Build for both ARM64 and AMD64
   docker buildx build \
     --platform linux/amd64,linux/arm64 \
     -f Dockerfile.prod \
     -t tgeld:latest \
     --push .
   ```

### Development Workflow with Multi-Architecture

1. **Local Development (M1 Mac)**
   ```bash
   # Use ARM64 for local development
   docker compose up
   ```

2. **Testing Different Architectures**
   ```bash
   # Test AMD64 version on M1
   docker compose -f docker-compose.yml -f docker-compose.amd64.yml up
   ```

3. **Production Deployment**
   - The multi-arch image will automatically use:
     - ARM64 on M1/M2 Macs
     - AMD64 on traditional servers

### Architecture-Specific docker-compose Files

1. **docker-compose.yml** (Base configuration)
   ```yaml
   services:
     app:
       image: tgeld:latest
       # ... common configuration
   ```

2. **docker-compose.arm64.yml** (M1/M2 Mac specific)
   ```yaml
   services:
     app:
       platform: linux/arm64
     db:
       platform: linux/arm64
   ```

3. **docker-compose.amd64.yml** (Traditional machines)
   ```yaml
   services:
     app:
       platform: linux/amd64
     db:
       platform: linux/amd64
   ```

### Best Practices for Multi-Architecture Support

1. **Always Test Both Architectures**
   - Test on your native architecture first
   - Cross-test on the other architecture
   - Use CI/CD for thorough testing

2. **Version Control**
   - Tag images with version and architecture
   - Use semantic versioning
   - Keep architecture-specific fixes documented

3. **Performance Optimization**
   - Use native architecture when possible
   - Be aware of emulation overhead
   - Monitor resource usage

4. **Troubleshooting**
   ```bash
   # Check image architecture
   docker inspect tgeld:latest | grep Architecture

   # Check available platforms
   docker manifest inspect tgeld:latest

   # Force specific platform
   docker run --platform linux/amd64 tgeld:latest
   ```

Remember: The goal is to provide a seamless development experience regardless of the developer's platform while ensuring production reliability.

## Cross-Platform Development

This project supports development on any platform (Windows, macOS, Linux) using our multi-architecture Docker setup.

### Quick Start

1. **Build Multi-Architecture Image**
   ```bash
   # Build locally
   ./scripts/build-multiarch.sh

   # Build and push to Docker Hub
   ./scripts/build-multiarch.sh --push --tag v1.0.0
   ```

2. **Development on Different Platforms**

   a. **M1/M2 Mac (ARM64)**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.arm64.yml up
   ```

   b. **Windows/Intel Mac (AMD64)**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.amd64.yml up
   ```

### Platform-Specific Notes

1. **Windows**
   - Use WSL2 for best performance
   - Enable BuildKit in Docker Desktop
   - Use PowerShell or WSL terminal

2. **M1/M2 Mac**
   - Native ARM64 support
   - Can run AMD64 via emulation
   - Better performance with ARM64 images

3. **Intel Mac/Linux**
   - Native AMD64 support
   - Can run ARM64 via emulation
   - Better performance with AMD64 images

### Testing Across Architectures

1. **Local Testing**
   ```bash
   # Test AMD64 version (even on M1 Mac)
   docker compose -f docker-compose.yml -f docker-compose.amd64.yml up

   # Test ARM64 version (even on Intel machines)
   docker compose -f docker-compose.yml -f docker-compose.arm64.yml up
   ```

2. **Production Testing**
   ```bash
   # Pull multi-arch image (automatically selects correct architecture)
   docker pull barneephife/tgeld:latest

   # Force specific architecture
   docker pull --platform linux/amd64 barneephife/tgeld:latest
   docker pull --platform linux/arm64 barneephife/tgeld:latest
   ```

### CI/CD Pipeline

Our CI/CD pipeline builds and tests both architectures:
1. Builds multi-arch images
2. Tests on both ARM64 and AMD64
3. Pushes verified images to Docker Hub

### Best Practices

1. **Always Test Both Architectures**
   - Test on your native architecture first
   - Cross-test on the other architecture
   - Use CI/CD for thorough testing

2. **Version Control**
   - Tag images with version and architecture
   - Use semantic versioning
   - Keep architecture-specific fixes documented

3. **Performance Optimization**
   - Use native architecture when possible
   - Be aware of emulation overhead
   - Monitor resource usage

4. **Troubleshooting**
   ```bash
   # Check image architecture
   docker inspect barneephife/tgeld:latest | grep Architecture

   # Check available platforms
   docker manifest inspect barneephife/tgeld:latest

   # Force specific platform
   docker run --platform linux/amd64 barneephife/tgeld:latest
   ```

Remember: The goal is to provide a seamless development experience regardless of the developer's platform while ensuring production reliability.

## Docker Deployment Guidelines

### Environment Variables in Docker

1. Development vs Production:
   - Development: Uses `.env.development` for local development
   - Production: Uses environment variables from Docker Compose
   - Never mix these configurations

2. Database Connection:
   - Development: Uses `localhost` or `127.0.0.1`
   - Production: Uses Docker service name (`db`)
   Example production URL:
   ```
   DATABASE_URL=postgresql://postgres:password@db:5432/tgeld?schema=public
   ```

### Prisma Configuration

1. Binary Targets:
   - The Dockerfile is configured to generate Prisma client with correct binary targets for Alpine Linux
   - Do not modify these settings unless you understand the implications
   - Required targets: `linux-musl` and `linux-musl-openssl-3.0.x`

2. Client Generation:
   - Always run `npx prisma generate` after schema changes
   - The production build handles this automatically

### Database Connection Management

1. Connection Pooling:
   - Use the singleton pool pattern in `db.ts`
   - Never create new pools for each request
   - Do not call `pool.end()` in API routes

2. Error Handling:
   - Always include error logging
   - Handle connection failures gracefully
   - Monitor connection pool metrics

## Database Migration Management

### Overview

We follow strict migration practices to ensure database changes work consistently across all environments:
- Local development tooling
- Docker development environment
- Production deployment

### Migration Workflow

1. **Creating a New Migration**

   ```bash
   # 1. Set up local environment for migration creation
   export DATABASE_URL="postgresql://postgres:tgeld_secure_password_2024@localhost:5432/tgeld"
   
   # 2. Create migration (without applying it)
   npx prisma migrate dev --create-only --name descriptive_name
   
   # 3. Review the generated migration in:
   #    prisma/migrations/YYYYMMDDHHMMSS_descriptive_name/migration.sql
   ```

2. **Testing Migrations**

   ```bash
   # 1. Test locally first
   npx prisma migrate deploy
   
   # 2. Test in Docker environment
   docker compose down -v              # Remove existing volumes
   docker build -f Dockerfile.prod -t tgeld:latest .
   docker compose up -d               # Start fresh environment
   
   # 3. Verify database state in Docker
   docker compose exec db psql -U postgres -d tgeld -c "\dt"
   ```

3. **Troubleshooting Migrations**

   If migrations fail in Docker:
   ```bash
   # 1. Check migration logs
   docker compose logs app
   
   # 2. Connect to database to inspect state
   docker compose exec db psql -U postgres -d tgeld
   
   # 3. If needed, reset and retry
   docker compose down -v
   docker compose up
   ```

### Migration Best Practices

1. **Always Create Explicit Migrations**
   - ❌ Don't use `prisma migrate dev` without `--create-only`
   - ✅ Use `--create-only` and review migrations before applying
   - ✅ Test migrations in both local and Docker environments

2. **Migration Content Guidelines**
   - Keep migrations atomic (one conceptual change per migration)
   - Include both "up" and "down" migration logic when needed
   - Add comments explaining complex migration steps
   - Test data modifications thoroughly

3. **Version Control**
   - Always commit migration files with related schema changes
   - Never modify existing migrations that are in version control
   - Include both schema.prisma and migration files in commits

4. **Production Safety**
   - Test migrations with production-like data volume
   - Consider impact on existing data
   - Plan for rollback scenarios
   - Test rollback procedures in Docker environment

### Common Migration Scenarios

1. **Adding a New Table**
   ```sql
   -- Example migration
   CREATE TABLE "new_feature" (
     "id" SERIAL PRIMARY KEY,
     "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **Modifying Existing Tables**
   ```sql
   -- Always use ALTER TABLE for existing tables
   ALTER TABLE "existing_table" 
   ADD COLUMN "new_column" TEXT;
   ```

3. **Data Migrations**
   ```sql
   -- Include both schema and data changes
   ALTER TABLE "users" 
   ADD COLUMN "display_name" TEXT;
   
   UPDATE "users" 
   SET "display_name" = "username"
   WHERE "display_name" IS NULL;
   ```

### Deployment Considerations

1. **Development Environment**
   - Uses Docker for testing migrations
   - Mirrors production database configuration
   - Allows safe testing of migration procedures

2. **Production Environment**
   - Uses same Docker configuration
   - Runs migrations during deployment
   - Maintains data integrity

3. **Backup Procedures**
   ```bash
   # Always backup before migrations
   docker compose exec db pg_dump -U postgres tgeld > backup.sql
   
   # Restore if needed
   cat backup.sql | docker compose exec -T db psql -U postgres -d tgeld
   ```

### Troubleshooting Guide

1. **Migration Failed to Apply**
   - Check migration logs in Docker
   - Verify database connection settings
   - Ensure migrations are in correct order

2. **Data Inconsistencies**
   - Use transaction blocks in migrations
   - Include validation queries
   - Add data verification steps

3. **Performance Issues**
   - Test with representative data volumes
   - Consider indexing requirements
   - Break large migrations into smaller steps

Remember: The goal is to maintain a reliable and consistent database state across all environments while ensuring safe deployment of changes.

## Development Best Practices

1. Environment Configuration:
   - Always test with production-like settings locally
   - Use Docker Compose to replicate production environment
   - Verify environment variable handling in both contexts

2. Code Changes:
   - Test database connections thoroughly
   - Verify API endpoints in Docker environment
   - Monitor logs for connection issues

3. Deployment Checklist:
   - Build multi-arch Docker images
   - Test on both ARM64 and AMD64 platforms
   - Verify environment variables in production
   - Monitor logs after deployment

4. Common Pitfalls to Avoid:
   - Setting DATABASE_URL in Next.js config
   - Using localhost in production URLs
   - Closing connection pools prematurely
   - Missing error handling in database operations

## Development on Apple Silicon (M1/M2) Macs

### Platform Configuration

1. **Docker Setup**
   ```bash
   # Check your architecture
   uname -m  # Should output 'arm64'
   ```

2. **Update docker-compose.yml for M1**
   ```yaml
   services:
     app:
       platform: linux/arm64  # Specify ARM platform
       # ... other configurations remain the same
     
     db:
       platform: linux/arm64  # PostgreSQL also needs platform specified
       # ... other configurations remain the same
   ```

### Development Workflow on M1

1. **Initial Setup**
   ```bash
   # Create development database (local tooling)
   createdb tgeld
   
   # Set up local environment
   cp .env.example .env.development
   cp .env.example .env
   ```

2. **Building for M1**
   ```bash
   # Build the image for ARM64
   docker build --platform linux/arm64 -f Dockerfile.prod -t tgeld:latest .
   
   # Start the development environment
   docker compose up
   ```

3. **Making Changes**
   - Edit code locally using your preferred editor
   - Docker will use the ARM64-compatible image
   - Changes to Next.js pages will hot-reload

4. **Database Operations**
   ```bash
   # Creating migrations (using local tooling)
   export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tgeld"
   npx prisma migrate dev --create-only --name your_migration_name
   
   # Testing migrations in Docker
   docker compose down -v
   docker build --platform linux/arm64 -f Dockerfile.prod -t tgeld:latest .
   docker compose up
   ```

### Troubleshooting M1-Specific Issues

1. **Architecture Mismatch**
   If you see errors about "wrong architecture" or "exec format error":
   ```bash
   # Verify the image architecture
   docker inspect tgeld:latest | grep Architecture
   
   # Should output: "arm64"
   ```

2. **Performance Optimization**
   - Use volume mounts for node_modules to avoid rebuilding
   - Enable Docker Desktop's new virtualization framework
   - Ensure Docker Desktop is up to date

3. **Database Connection Issues**
   If local tooling can't connect:
   ```bash
   # Check PostgreSQL is running on ARM64
   docker compose exec db psql -U postgres -c "SHOW server_version_num;"
   ```

### Best Practices for M1 Development

1. **Always Specify Platform**
   - Use `--platform linux/arm64` when building
   - Add platform specification in docker-compose.yml
   - Ensure all services use ARM64 images

2. **Local Development Tools**
   - Install ARM64 versions of Node.js
   - Use Homebrew for ARM64 to install PostgreSQL
   - Keep Docker Desktop updated

3. **Testing Process**
   ```bash
   # Full testing cycle
   docker build --platform linux/arm64 -f Dockerfile.prod -t tgeld:latest .
   docker compose down -v
   docker compose up
   
   # Verify all services
   docker compose ps
   ```

Remember: The M1's ARM64 architecture requires explicit platform specifications, but once configured, it provides excellent performance for Docker containers.

## Development Environment Setup

### Prerequisites

1. **Docker**
   - Docker Desktop 4.x or later
   - BuildKit enabled
   - Docker Compose V2

2. **Node.js**
   - Version 18.x or later
   - npm 9.x or later

### Quick Start

1. **Clone Repository**
   ```bash
   git clone https://github.com/barneephife/tgeld.git
   cd tgeld
   ```

2. **Start Development Environment**
   ```bash
   # Build the image
   docker build -f Dockerfile.prod -t barneephife/tgeld:latest .

   # Start services
   docker compose up
   ```

3. **Initialize Database**
   ```bash
   # In a new terminal
   docker compose exec db psql -U postgres -d tgeld -f init.sql
   ```

### Development Workflow

1. **Start Development Server**
   ```bash
   docker compose up
   ```

2. **Run Database Migrations**
   ```bash
   # Create migration
   docker compose exec app npx prisma migrate dev --name your_migration_name

   # Apply migrations
   docker compose exec app npx prisma migrate deploy
   ```

3. **View Logs**
   ```bash
   # All services
   docker compose logs -f

   # Specific service
   docker compose logs -f app
   ```

4. **Access Services**
   - Web App: http://localhost:21971
   - Database: localhost:5432

### Database Management

1. **Connect to Database**
   ```bash
   docker compose exec db psql -U postgres -d tgeld
   ```

2. **Backup Database**
   ```bash
   docker compose exec db pg_dump -U postgres tgeld > backup.sql
   ```

3. **Restore Database**
   ```bash
   cat backup.sql | docker compose exec -T db psql -U postgres -d tgeld
   ```

### Testing

1. **Run Tests**
   ```bash
   docker compose exec app npm test
   ```

2. **Test Production Build**
   ```bash
   # Build production image
   docker build -f Dockerfile.prod -t barneephife/tgeld:latest .

   # Test production setup
   docker compose -f docker-compose.prod.yml up
   ```

### Troubleshooting

1. **Reset Environment**
   ```bash
   # Stop and remove containers
   docker compose down -v

   # Rebuild and start
   docker compose up --build
   ```

2. **Check Service Status**
   ```bash
   docker compose ps
   ```

3. **View Container Logs**
   ```bash
   docker compose logs -f app
   ```
