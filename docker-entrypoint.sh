#!/bin/sh
set -e

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate environment variables
validate_env() {
    required_vars="DB_USER DB_PASSWORD DB_HOST DB_PORT DB_DATABASE"
    for var in $required_vars; do
        if [ -z "$(eval echo \$$var)" ]; then
            echo "Error: Required environment variable $var is not set"
            exit 1
        fi
    done
}

# Function to validate database connection string
validate_db_url() {
    if [ -z "${DATABASE_URL}" ]; then
        echo "Constructing DATABASE_URL from environment variables..."
        export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?schema=public"
    fi

    # Validate DATABASE_URL format
    if ! echo "$DATABASE_URL" | grep -qE "^postgresql://[^:]+:[^@]+@[^:]+:[0-9]+/[^?]+(\?.*)?$"; then
        echo "Error: Invalid DATABASE_URL format"
        exit 1
    fi
}

# Function to wait for database with improved retry logic
wait_for_db() {
    echo "Waiting for database to be ready..."
    max_retries=30
    retry_interval=2
    retries=0

    while [ $retries -lt $max_retries ]; do
        if pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" >/dev/null 2>&1; then
            echo "Database is ready!"
            return 0
        fi

        retries=$((retries + 1))
        remaining=$((max_retries - retries))
        echo "Waiting for database... (Attempt $retries/$max_retries, $remaining attempts remaining)"
        sleep $retry_interval
    done

    echo "Error: Database connection timeout after $((max_retries * retry_interval)) seconds"
    exit 1
}

# Function to verify application health with improved error handling
verify_app_health() {
    echo "Verifying application health..."
    max_retries=30
    retry_interval=2
    retries=0

    while [ $retries -lt $max_retries ]; do
        if curl -s -f "http://localhost:${PORT:-3000}/api/health" >/dev/null 2>&1; then
            echo "Application is healthy!"
            return 0
        fi

        retries=$((retries + 1))
        remaining=$((max_retries - retries))
        echo "Waiting for application to be healthy... (Attempt $retries/$max_retries, $remaining attempts remaining)"
        sleep $retry_interval
    done

    echo "Error: Application health check failed after $((max_retries * retry_interval)) seconds"
    exit 1
}

# Function to handle Prisma migrations with retry logic
run_migrations() {
    echo "Running database migrations..."
    max_retries=3
    retries=0

    while [ $retries -lt $max_retries ]; do
        if npx prisma migrate deploy; then
            echo "Migrations completed successfully!"
            return 0
        fi

        retries=$((retries + 1))
        remaining=$((max_retries - retries))
        echo "Migration attempt failed. Retrying... ($remaining attempts remaining)"
        sleep 5
    done

    echo "Error: Failed to run database migrations after $max_retries attempts"
    exit 1
}

# Function to initialize application data with error handling
initialize_app_data() {
    echo "Checking and initializing default data..."
    if ! node /app/scripts/initialize-data.js; then
        echo "Warning: Default data initialization failed"
        # Don't exit, as this is not critical
        return 1
    fi
    echo "Default data initialization completed!"
    return 0
}

# Verify required commands
for cmd in curl pg_isready npx node; do
    if ! command_exists $cmd; then
        echo "Error: Required command '$cmd' is not available"
        exit 1
    fi
done

# Validate environment
validate_env
validate_db_url

# Wait for database
wait_for_db

# Run migrations with retry logic
run_migrations

# Initialize application data
initialize_app_data

# Start the application
echo "Starting the application..."
node server.js -H "${HOST:-0.0.0.0}" &

# Verify application health
verify_app_health

# Keep the container running
exec "$@"
