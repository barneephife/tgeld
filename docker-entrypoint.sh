#!/bin/sh
set -e

# Wait for the database to be ready
echo "Waiting for database to be ready..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is ready!"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Initialize default data if needed
echo "Checking and initializing default data..."
node /app/scripts/initialize-data.js

# Start the application
echo "Starting the application..."
exec node server.js -H 0.0.0.0
