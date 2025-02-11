# Taschengeld Family Allowance Application - Developer Guide

This guide is for developers who want to contribute to or modify the Taschengeld application.

## Development Prerequisites

- Node.js 18+
- PostgreSQL 16
- Git
- Docker (for building and testing production images)

## Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/barneephife/tgeld.git
   cd tgeld
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables (for new developers only):

   ```bash
   # Create your development environment file by copying the example
   cp .env.example .env.development
   ```

   Then edit `.env.development` and update the following values:

   - `DB_PASSWORD`: Set to your local PostgreSQL password
   - Adjust other values as needed for your development environment

   > **Note**: Never commit `.env.development` to version control or share it with other developers. Each developer should maintain their own local configuration.

4. Initialize the database (for new developers or after schema changes):

   ```bash
   # Generate Prisma client (required after any schema changes)
   npx prisma generate

   # For new developers or if you want a fresh database:
   npx prisma migrate dev

   # For existing developers after pulling schema changes:
   npx prisma migrate deploy  # This applies any new migrations without resetting the database
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Development Workflow

### Code Style and Linting

- Run linting:
  ```bash
  npm run lint
  ```

### Database Management

Create a database backup:

```bash
pg_dump -U postgres tgeld > dev_backup.sql
```

Restore from backup:

```bash
psql -U postgres -d tgeld < dev_backup.sql
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
  -t tgeld/tgeld:v1.x.x \
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

## Environment Variables

Development environment variables should be set in `.env.development`:

```bash
# Database connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/tgeld?schema=public

# Development settings
NODE_ENV=development
```

**Important Notes:**
1. Never commit sensitive information like passwords or API keys to the repository.
2. Always use environment variables for sensitive data.
3. Do NOT set DATABASE_URL in `next.config.js`. This would override runtime environment variables in production.
4. The production DATABASE_URL should point to the Docker container name (e.g., `db`) not `localhost`.

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
