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

### 1. Building the Production Image

```bash
# Build the image
docker build -f Dockerfile.prod -t tgeld/tgeld:latest .

# Test the image locally (optional)
docker compose -f docker-compose.test.yml up -d
```

### 2. Publishing to Docker Hub

```bash
# Log in to Docker Hub
docker login

# Push the image
docker push tgeld/tgeld:latest
```

### 3. Version Tagging (for releases)

```bash
# Tag the image with a version
docker tag tgeld/tgeld:latest tgeld/tgeld:v1.x.x

# Push the versioned tag
docker push tgeld/tgeld:v1.x.x
```

### 4. Clean up Local Images

```bash
# Remove unused images
docker image prune -f

# Remove all unused containers, networks, and images
docker system prune -f
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

## Environment Variables

Development environment variables should be set in `.env.development`:

```bash
# Database connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/tgeld?schema=public

# Development settings
NODE_ENV=development
```

**Important**: Never commit sensitive information like passwords or API keys to the repository. Always use environment variables for sensitive data.
