# Deployment Plan: Development to Production Docker Transition

## Project Goals

- [x] Maintain local development using `npm run dev` with `.env.local`
- [x] Create production Docker image for easy user deployment
- [x] Implement Docker Compose environment strategy:
  - Use environment references in docker-compose.yml (e.g., DB_PASSWORD=${DB_PASSWORD})
  - Users create their own .env file with actual values
  - Keep secrets separate from compose file
  - Provide .env.example as template
- [x] Ensure database persistence across updates
- [x] Package application and database in a single container
- [x] Simplify user deployment process to `docker compose up -d`
- [x] Use Docker Compose Environment Files for simple secret management

## Environment Strategy

- Development:
  - Developer copies .env.example to .env.local
  - Uses localhost for database
  - Direct file system access
- Production:
  - User copies .env.example to .env
  - Docker Compose loads variables from .env
  - docker-compose.yml references variables using ${VAR_NAME}
  - Secrets stay in user's .env file, never in compose file

### How Docker Compose Environment Works

The docker-compose.yml will configure both services (app and database) to use the same password from the user's .env file:

```yaml
services:
  db:
    image: postgres
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD} # Sets database password on first start

  app:
    image: our-app-image
    environment:
      - DB_PASSWORD=${DB_PASSWORD} # Lets app connect to database
```

When a user:

1. Creates .env with their chosen password:
   ```bash
   DB_PASSWORD=their_secure_password
   ```
2. Runs `docker compose up`

Docker Compose will:

- Read DB_PASSWORD from the user's .env file
- Initialize the Postgres database with this password
- Configure our app container to use the same password
- Both containers can now communicate securely

This approach:

- Keeps passwords out of version control
- Allows users to set their own secure passwords
- Ensures app and database passwords always match
- Works seamlessly when pulling images from Docker Hub

## Phase 0: Cleanup

### 0. Clean Existing Docker Artifacts

- [x] Stop and remove all related containers
- [x] Remove existing images
- [x] Clean up volumes
- [x] Remove unused Docker files:
  - [x] Review and remove redundant Dockerfile variants
  - [x] Review and remove redundant docker-compose files
  - [x] Clean up docker/ directory if not needed
- [x] Clean up environment files:
  - [x] Review all .env\* files
  - [x] Keep only essential .env.example
  - [x] Document any important configurations from removed files
- [x] Verify clean state:
  - [x] No running containers related to project
  - [x] No project images
  - [x] No project volumes
  - [x] Single set of Docker configuration files

## Phase 1: Prepare Development/Production Split

### 1. Test Current Development Setup

- [x] Run `npm run dev`
- [x] Verify hot reloading functionality (Next.js dev server running)
- [x] Test all features in development mode
- [x] Document any issues found

### 2. Create Production Build Test

- [x] Run `npm run build`
- [x] Run `npm start`
- [x] Verify all features in production mode
- [x] Document any issues found:docker
  - ~~Warning: Missing "soundurl" column in database (needs migration)~~ Fixed: Updated column name in backup API
  - ~~Warning: Standalone output configuration requires different start command~~ Fixed: Using node server.js
  - Action Items:
    - ~~Update database schema~~
    - ~~Modify start command to use `node server.js`~~

## Phase 2: Docker Image Setup

### 3. Create New Production Dockerfile

- [x] Create new `Dockerfile.prod` for production deployment
  - Multi-stage build for size optimization
  - First stage: build application
  - Second stage: minimal runtime
- [x] Configure environment handling
- [x] Test local build: `docker build -t tgeld:test -f Dockerfile.prod .`

### 4. Setup Docker Volumes and Environment

- [x] Create PostgreSQL data volume configuration
- [x] Configure upload volume
- [x] Setup environment variable passing
- [x] Test environment variable handling
- [x] Test data persistence across container restarts
- [x] Document volume locations

## Phase 3: Docker Hub Integration

### 5. Create Docker Hub Repository

- [x] Create/verify Docker Hub account
- [x] Create project repository
- [x] Test command line authentication
- [x] Document repository details

### 6. Setup Image Versioning

- [x] Define version tagging strategy
- [x] Test image push to Docker Hub
- [x] Test image pull from Docker Hub
- [x] Verify pulled image functionality

## Docker Hub Repository Details

### Repository Information

- Repository Name: `tgeld/tgeld`
- Repository Type: Public
- Latest Tag: `latest`
- Pull Command: `docker pull tgeld/tgeld:latest`

### Authentication

To authenticate with Docker Hub:

```bash
docker login
```

Use your Docker Hub credentials when prompted.

### Image Management

Building and pushing a new version:

```bash
# Build the image
docker build -t tgeld/tgeld:latest -f Dockerfile.prod .

# Push to Docker Hub
docker push tgeld/tgeld:latest
```

## Environment Setup Process

### 1. Environment File Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Configure the following variables in `.env`:

   ```bash
   # Application
   NODE_ENV=production
   NEXT_PUBLIC_PORT=21971

   # Database Configuration
   DB_HOST=db
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_secure_password
   DB_DATABASE=tgeld

   # Upload Configuration
   UPLOAD_PATH=/app/uploads

   # Prisma database connection
   DATABASE_URL=postgresql://postgres:your_secure_password@db:5432/tgeld?schema=public
   ```

   Important notes:

   - Replace `your_secure_password` with a strong password
   - Keep `DB_HOST=db` as is (this is the Docker service name)
   - The `DATABASE_URL` must match the database credentials

### 2. Directory Structure

Ensure the following directories exist and are writable:

```
tgeld/
├── .env                 # Your environment file
├── docker-compose.yml   # Docker Compose configuration
└── uploads/            # Directory for uploaded files (created by Docker)
```

### 3. Volume Management

The following Docker volumes are automatically created:

- `tgeld_postgres_data`: Persists database data
- `tgeld_uploads`: Stores uploaded files

These volumes persist data across container restarts and updates.

### 4. Initial Deployment

To start the application:

```bash
# Pull the latest images
docker-compose pull

# Start the services
docker-compose up -d
```

The application will be available at:

- Web Interface: `http://localhost:3000`
- API Endpoints: `http://localhost:3000/api/*`

## Phase 4: Production Deployment

### 7. Create New Docker Compose Configuration

- [x] Create production Docker Compose configuration
- [x] Configure volume mounts
- [x] Setup environment variable references
- [x] Ensure `.env.example` contains all needed variables
- [x] Test complete deployment with example values
- [x] Document environment file setup process

### 8. Test Update Procedure

- [x] Deploy initial version
- [x] Create and verify test data
- [x] Deploy update
- [x] Verify data persistence
- [x] Document update process

## Test Results

### Data Persistence Test

1. Initial Data Creation

   - Created two test tasks with specific values
   - Verified tasks were stored in database

2. Application Update

   - Built new Docker image with `is_active` defaulting to true
   - Pushed image to Docker Hub
   - Updated running containers

3. Data Verification
   - Confirmed existing tasks remained unchanged
   - Database structure maintained
   - No data loss during update

### Update Process Test

1. Code Changes

   - Modified task creation API to set `is_active` to true by default
   - Successfully built and pushed new image
   - Smooth deployment with docker-compose

2. Functionality Verification
   - Created new task after update
   - Confirmed `is_active` was set to true
   - All API endpoints remained functional
   - No service interruption during update

### Test Data

```sql
task_id |    title    |     description     | payout_value | is_active
----------------------------------------------------------------------
2       | Test Task 1 | This is a test task | 50.00        | null
3       | Test Task 2 | Another test task   | 75.00        | null
4       | Test Task 3 | Task after update   | 100.00       | true
```

### Update Process Documentation

1. Build new image:

   ```bash
   docker build -t tgeld/tgeld:latest -f Dockerfile.prod .
   ```

2. Push to Docker Hub:

   ```bash
   docker push tgeld/tgeld:latest
   ```

3. Update running containers:

   ```bash
   docker-compose pull && docker-compose up -d
   ```

4. Verify deployment:
   - Check container health: `docker-compose ps`
   - Verify database state
   - Test API functionality

## Phase 5: Documentation

### 9. User Documentation

- [x] Write installation instructions
  - [x] Document `.env` file setup
  - [x] Include example environment values
  - [x] Document required passwords/secrets
- [x] Create configuration guide
- [x] Document update procedures
- [x] Document backup/restore procedures

### 10. Developer Documentation

- [x] Document development setup
- [x] Detail build procedures
- [x] Document release process
- [x] Define testing requirements

## Documentation Status

The following documentation has been completed:

1. **README.md**

   - Project overview
   - Installation instructions
   - Configuration guide
   - API documentation
   - Development setup

2. **Getting Started Guide**

   - Installation process
   - Environment setup
   - Initial configuration
   - Troubleshooting

3. **Architecture Documentation**

   - System overview
   - Component architecture
   - Security considerations
   - Deployment architecture
   - Scalability and monitoring

4. **Development Guide**
   - Development environment setup
   - Workflow guidelines
   - Testing procedures
   - Code quality standards
   - Version control practices

All documentation is now complete and up-to-date with the current state of the project.

## Next.js API Routes in Docker

When running the Next.js application in Docker with standalone output mode, the following configurations are required for API routes to work properly:

1. API Route Configuration:

   - Add `export const dynamic = 'force-dynamic'` to API routes to prevent static generation
   - Example:

     ```typescript
     // app/api/active-tasks/route.ts
     export const dynamic = 'force-dynamic';

     export async function GET() {
       // ... route handler code
     }
     ```

2. Server Configuration:
   - Start the Next.js server with `-H 0.0.0.0` to listen on all interfaces
   - This is configured in `Dockerfile.prod`:
     ```dockerfile
     CMD ["node", "server.js", "-H", "0.0.0.0"]
     ```

These configurations ensure that:

- API routes are properly accessible from both inside and outside the container
- Routes are not statically generated, allowing dynamic data fetching
- The server listens on all network interfaces, enabling proper Docker networking

## Database Migration Strategy

1. The application uses Prisma for database migrations
2. Migrations are automatically handled during container startup
3. The migration process:
   - Waits for the database to be ready
   - Generates Prisma client
   - Applies any pending migrations
   - Optionally seeds the database if SEED_DATABASE=true

## Deployment Steps

1. Build and start the containers:

   ```bash
   docker-compose up --build -d
   ```

2. Monitor the migration process:

   ```bash
   docker-compose logs -f app
   ```

3. Verify the application is running:
   ```bash
   curl http://localhost:3000
   ```

## Backup and Restore

1. Create a database backup:

   ```bash
   docker-compose exec db pg_dump -U ${DB_USER} ${DB_DATABASE} > backup.sql
   ```

2. Restore from backup:
   ```bash
   docker-compose exec -T db psql -U ${DB_USER} ${DB_DATABASE} < backup.sql
   ```

## Troubleshooting

1. If migrations fail:

   - Check the logs: `docker-compose logs app`
   - Verify database connection: `docker-compose exec db pg_isready -U ${DB_USER} -d ${DB_DATABASE}`
   - Manual migration: `docker-compose exec app npx prisma migrate deploy`

2. If the application fails to start:
   - Check container status: `docker-compose ps`
   - View application logs: `docker-compose logs app`
   - Verify environment variables: `docker-compose config`

## Rollback Plan

1. If deployment fails:

   ```bash
   # Stop the containers
   docker-compose down

   # Restore from backup
   docker-compose up -d db
   docker-compose exec -T db psql -U ${DB_USER} ${DB_DATABASE} < backup.sql

   # Start the application
   docker-compose up -d app
   ```

2. If database migration fails:
   ```bash
   # Rollback to previous migration
   docker-compose exec app npx prisma migrate reset
   ```

## Monitoring

1. Container health:

   ```bash
   docker-compose ps
   ```

2. Database status:

   ```bash
   docker-compose exec db pg_isready
   ```

3. Application logs:
   ```bash
   docker-compose logs -f app
   ```

## Documentation Updates

The following project documentation files will need to be updated throughout this process:

- [x] README.md
- [x] docs/1-getting-started/
- [x] docs/2-architecture/
- [x] docs/3-development/
- [x] Any deployment-related documentation

## Progress Tracking

Each step will be marked as complete only after thorough testing and verification. Issues found during each phase will be documented and addressed before moving to the next phase.

## Notes

- All changes will be tested in isolation before integration
- Each phase must be completed and verified before proceeding
- Documentation will be updated continuously throughout the process
- Environment management will use Docker Compose Environment Files for simplicity
- Users will only need to copy `.env.example` to `.env` and update values
