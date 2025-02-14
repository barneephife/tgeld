# Taschengeld Family Allowance Application - Developer Guide

This guide provides step-by-step instructions for the development workflow. For detailed architecture decisions and principles, see `docs/docker-development-principles.md`.

## Development Prerequisites

- Docker Desktop with BuildKit support
- Git
- Node.js 18+ (for local tooling only)
- MacOS with M1/ARM64 architecture

## Quick Start

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
   cp .env.example .env
   ```

   Configure your environment file:
   ```bash
   # Required settings for development
   DB_HOST=db                    # Use Docker service name
   DB_PASSWORD=your_secure_pass  # Set a secure password
   NODE_ENV=development
   ```

## Development Workflow

### 1. Start Development Environment
```bash
# Start the development stack
docker compose -f docker-compose.dev.yml up --build
```

✅ Verify:
- Application runs at http://localhost:3000
- Database connection is successful
- No architecture-related errors in logs

### 2. Make and Test Changes
Your local changes will automatically reflect due to volume mounting and hot reloading.

When adding new dependencies:
```bash
# Add dependency
npm install new-package

# Rebuild to verify it works in Docker
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up --build
```

✅ Verify:
- New features work as expected
- No new architecture-specific dependencies added
- All API endpoints function correctly
- Database operations work properly

### 3. Database Changes
When making database changes:

1. Create migration:
   ```bash
   npx prisma migrate dev --create-only --name descriptive_name
   ```

2. Review migration in `prisma/migrations`

3. Test in Docker:
   ```bash
   docker compose -f docker-compose.dev.yml down
   docker compose -f docker-compose.dev.yml up --build
   ```

✅ Verify:
- Migration applies successfully
- Data model works as expected
- No data loss or corruption

### 4. Commit Changes
```bash
git add .
git commit -m "descriptive message"
git push
```

✅ Verify:
- All necessary files included
- No sensitive data in commit
- Documentation updated if needed

### 5. Build Production Image
```bash
# Build and test both architectures locally
docker buildx build --platform linux/amd64 -f Dockerfile.prod -t tgeld:amd64-test . --load
docker buildx build --platform linux/arm64 -f Dockerfile.prod -t tgeld:arm64-test . --load

# Test the builds
docker compose -f docker-compose.yml up
```

✅ Verify:
- Builds succeed for both architectures
- All features work in production build
- No development dependencies included
- Environment variables properly set

### 6. Push to Docker Hub
```bash
# Build and push multi-arch image
docker buildx build --platform linux/amd64,linux/arm64 \
  -f Dockerfile.prod \
  -t barneephife/tgeld:latest \
  --push .
```

✅ Verify:
- Both architecture variants pushed successfully
- Tags are correct
- Image can be pulled and run on different architectures

## Troubleshooting

### Check Logs
```bash
docker compose -f docker-compose.dev.yml logs -f app
docker compose -f docker-compose.dev.yml logs -f db
```

### Verify Database
```bash
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d tgeld
```

### Reset Environment
```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build
```

For more detailed information about architecture decisions, risk areas, and design principles, please refer to `docs/docker-development-principles.md`.

## Development vs Production

### Development Environment

- Uses hot reloading for rapid development
- Mounts source code as volume
- Runs with development tools and debugging enabled
- Uses development-specific environment variables

### Production Build

- Multi-stage build process
- Optimized for production
- No source code access or development tools
- Supports both ARM64 and AMD64 architectures

## Best Practices

1. **Always Use Docker for Development**
   - Don't rely on local-only testing
   - Always verify changes in Docker environment
   - Use development compose file for all testing

2. **Migration Management**
   - Create explicit migrations using local tooling
   - Test migrations in Docker environment
   - Never rely on automatic migrations
   - Always version control your migrations

3. **Environment Variables**
   - Use `.env` for development configuration
   - Never commit any `.env` files
   - Keep passwords and secrets secure

4. **Testing**
   - Test frequently in development environment
   - Always test production builds before pushing
   - Verify features work identically in both environments
   - Check logs for potential issues

## Project Structure

```bash
tgeld/
├── app/                      # Next.js app directory
├── components/              # React components
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
├── styles/                  # CSS styles
├── Dockerfile.dev          # Development configuration
├── Dockerfile.prod         # Production configuration
├── docker-compose.dev.yml  # Development environment
└── docker-compose.yml      # Production environment
```

Remember: The goal is to ensure that any feature working in development will work identically in production. Always test production builds before pushing changes.

## Local Tooling (When Needed)

While development happens in Docker, some tasks require local tooling:

1. **Creating Migrations**

   ```bash
   # Use local environment
   export $(cat .env.development | xargs)
   npx prisma migrate dev --create-only --name your_migration_name
   ```

2. **Database Management**

   ```bash
   # Reset development database
   docker compose -f docker-compose.dev.yml down -v
   docker compose -f docker-compose.dev.yml up --build
   ```

Remember: Local tooling is only for creating migrations. All testing and verification should be done in Docker.

## Building Docker Images

### Development Images

For local development, the image is built automatically:

```bash
# Start development environment (includes build)
docker compose -f docker-compose.dev.yml up --build
```

### Production Images

Production builds are handled by the CI/CD pipeline, but can be tested locally:

1. **Build Production Image**

   ```bash
   # Build for your local architecture
   docker build -f Dockerfile.prod -t tgeld:prod-test .

   # Test the production build
   docker compose -f docker-compose.prod.yml up
   ```

2. **Multi-Architecture Builds** (if needed)

   ```bash
   # Create multi-arch builder
   docker buildx create --name multiarch --driver docker-container --use

   # Build for multiple architectures
   docker buildx build \
     --platform linux/amd64,linux/arm64 \
     -f Dockerfile.prod \
     -t tgeld:latest \
     .
   ```

Note: Multi-architecture builds are typically handled by CI/CD and are not needed for local development.

## Architecture Support

The development environment automatically uses your local architecture:

- ARM64 (Apple Silicon M1/M2 Macs)
- AMD64 (Intel/AMD machines)

No special configuration is needed as Docker will use the appropriate architecture for your system.

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

   ```yaml
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
   - Web App: <http://localhost:21971>
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
