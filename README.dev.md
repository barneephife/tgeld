# Development Environment Setup

This guide explains how to set up and use the development environment for the Tgeld project.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development tools)
- Git

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tgeld
   ```

2. Start the development environment:
   ```bash
   npm run dev:docker
   ```

   This will:
   - Build the development Docker image
   - Start the application in development mode
   - Start a PostgreSQL database
   - Enable hot reloading
   - Mount your local code into the container

3. Access the application:
   - Web UI: http://localhost:3000
   - Database: localhost:5432 (if you need direct access)

## Development Workflow

1. **Making Changes**
   - Edit files on your local machine
   - Changes will automatically reload in the browser
   - No need to rebuild or restart containers for code changes

2. **Database Changes**
   - Prisma migrations will run automatically
   - Database data persists between restarts

3. **Installing New Dependencies**
   - Add to package.json
   - Run `npm run dev:docker:clean` to rebuild with new dependencies

4. **Troubleshooting**
   - `npm run dev:docker:clean` - Complete reset of development environment
   - Check logs: `docker compose -f docker-compose.dev.yml logs -f app`

## Key Differences from Production

- Hot reloading enabled
- Source code mounted from host
- Development-specific environment variables
- Exposed database port
- Development-only dependencies installed
- No production optimizations

## Common Commands

- `npm run dev:docker` - Start development environment
- `npm run dev:docker:clean` - Reset and restart development environment
- `docker compose -f docker-compose.dev.yml down` - Stop development environment
- `docker compose -f docker-compose.dev.yml logs -f` - View logs
