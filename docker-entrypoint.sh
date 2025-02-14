#!/bin/sh
set -e

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for database
wait_for_db() {
    echo "Waiting for database to be ready..."
    timeout=30
    counter=0
    while ! pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" >/dev/null 2>&1; do
        counter=$((counter + 1))
        if [ $counter -gt $timeout ]; then
            echo "Error: Database connection timeout after ${timeout} seconds"
            exit 1
        fi
        echo "Waiting for database... ($counter/$timeout)"
        sleep 1
    done
    echo "Database is ready!"
}

# Function to verify application health
verify_app_health() {
    echo "Verifying application health..."
    timeout=30
    counter=0
    while ! wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/api/health >/dev/null 2>&1; do
        counter=$((counter + 1))
        if [ $counter -gt $timeout ]; then
            echo "Error: Application health check failed after ${timeout} seconds"
            exit 1
        fi
        echo "Waiting for application to be healthy... ($counter/$timeout)"
        sleep 1
    done
    echo "Application is healthy!"
}

# Verify required commands
for cmd in wget pg_isready npx node; do
    if ! command_exists $cmd; then
        echo "Error: Required command '$cmd' is not available"
        exit 1
    fi
done

# Wait for database
wait_for_db

# Generate Prisma client
echo "Generating Prisma client..."
if ! npx prisma generate; then
    echo "Error: Failed to generate Prisma client"
    exit 1
fi

# Run migrations
echo "Running database migrations..."
if ! npx prisma migrate deploy; then
    echo "Error: Failed to run database migrations"
    exit 1
fi

# Initialize default data if needed
echo "Checking and initializing default data..."
if ! node /app/scripts/initialize-data.js; then
    echo "Warning: Default data initialization failed, but continuing..."
fi

# Start the application
echo "Starting the application..."
node server.js -H 0.0.0.0 &

# Verify application health
verify_app_health

# Keep the container running
exec "$@"
