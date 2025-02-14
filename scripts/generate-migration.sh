#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to handle errors
error_handler() {
    echo -e "${RED}Error occurred in script at line $1${NC}"
    docker compose down -v >/dev/null 2>&1 || true
}

trap 'error_handler ${LINENO}' ERR

# Ensure the script is run from the project root
cd "$(dirname "$0")/.."

# Check if migration name was provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Migration name is required${NC}"
    echo "Usage: $0 <migration-name>"
    exit 1
fi

echo -e "${YELLOW}Starting migration generation process...${NC}"

# Ensure clean state
echo -e "${YELLOW}Cleaning up existing containers...${NC}"
docker compose down -v >/dev/null 2>&1 || true

# Start database
echo -e "${YELLOW}Starting database container...${NC}"
docker compose up db -d

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
timeout=30
counter=0
while ! docker compose exec db pg_isready -U postgres >/dev/null 2>&1; do
    counter=$((counter + 1))
    if [ $counter -gt $timeout ]; then
        echo -e "${RED}Error: Database failed to start after ${timeout} seconds${NC}"
        docker compose down -v
        exit 1
    fi
    echo -n "."
    sleep 1
done
echo -e "\n${GREEN}Database is ready!${NC}"

# Generate migration
echo -e "${YELLOW}Generating migration '$1'...${NC}"
docker compose exec -T app npx prisma migrate dev --create-only --name "$1"

# Verify migration files
if [ -d "prisma/migrations" ]; then
    echo -e "${GREEN}Migration files generated successfully!${NC}"
    echo -e "${YELLOW}Generated files:${NC}"
    ls -l "prisma/migrations"
else
    echo -e "${RED}Error: Migration files were not generated${NC}"
    docker compose down -v
    exit 1
fi

# Clean up
echo -e "${YELLOW}Cleaning up...${NC}"
docker compose down -v

echo -e "${GREEN}Migration generation completed successfully!${NC}"
echo -e "${YELLOW}Please review the generated migration files before committing.${NC}"
