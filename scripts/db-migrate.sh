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
    exit 1
}

trap 'error_handler ${LINENO}' ERR

# Function to wait for database to be ready
wait_for_db() {
    echo -e "${YELLOW}Waiting for database to be ready...${NC}"
    timeout=30
    counter=0
    while ! pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" >/dev/null 2>&1; do
        counter=$((counter + 1))
        if [ $counter -gt $timeout ]; then
            echo -e "${RED}Error: Database connection timeout after ${timeout} seconds${NC}"
            exit 1
        fi
        echo -n "."
        sleep 1
    done
    echo -e "\n${GREEN}Database is ready!${NC}"
}

# Function to verify database connection
verify_connection() {
    echo -e "${YELLOW}Verifying database connection...${NC}"
    if ! psql -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "${DB_DATABASE:-tgeld}" -c "SELECT 1" >/dev/null 2>&1; then
        echo -e "${RED}Error: Could not connect to database${NC}"
        exit 1
    fi
    echo -e "${GREEN}Database connection verified!${NC}"
}

# Main migration logic
main() {
    # Check environment variables
    if [ -z "${DATABASE_URL}" ]; then
        echo -e "${RED}Error: DATABASE_URL is not set${NC}"
        exit 1
    fi

    wait_for_db
    verify_connection

    echo -e "${YELLOW}Running database migrations...${NC}"
    
    # Generate Prisma client
    echo -e "${YELLOW}Generating Prisma client...${NC}"
    if ! npx prisma generate; then
        echo -e "${RED}Error: Failed to generate Prisma client${NC}"
        exit 1
    fi
    
    # Apply migrations
    echo -e "${YELLOW}Applying migrations...${NC}"
    if ! npx prisma migrate deploy; then
        echo -e "${RED}Error: Failed to apply migrations${NC}"
        exit 1
    fi

    # Seed the database if requested
    if [ "${SEED_DATABASE}" = "true" ]; then
        echo -e "${YELLOW}Seeding database...${NC}"
        if ! npx prisma db seed; then
            echo -e "${RED}Warning: Database seeding failed${NC}"
            # Don't exit here as seeding is optional
        fi
    fi

    echo -e "${GREEN}Database migration completed successfully!${NC}"
}

main
