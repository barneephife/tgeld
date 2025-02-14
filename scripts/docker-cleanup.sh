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

# Function to show disk usage
show_disk_usage() {
    echo -e "${YELLOW}Current Docker disk usage:${NC}"
    docker system df
}

# Show initial disk usage
show_disk_usage

echo -e "${YELLOW}Starting Docker cleanup...${NC}"

# Stop all running containers
echo -e "${YELLOW}Stopping all containers...${NC}"
if [ "$(docker ps -q)" ]; then
    docker stop $(docker ps -q)
fi

# Remove development containers and volumes
echo -e "${YELLOW}Removing development resources...${NC}"
docker compose -f docker-compose.dev.yml down -v 2>/dev/null || true

# Remove production containers and volumes if requested
if [ "$1" == "--prod" ]; then
    echo -e "${YELLOW}Removing production resources...${NC}"
    docker compose down -v 2>/dev/null || true
fi

# Remove basic unused resources
echo -e "${YELLOW}Removing unused resources...${NC}"
docker system prune -f

# Remove all unused resources if requested
if [ "$1" == "--all" ]; then
    echo -e "${YELLOW}Removing ALL unused resources (including volumes)...${NC}"
    docker system prune -af --volumes
fi

# Show final disk usage
echo -e "\n${YELLOW}Cleanup completed!${NC}"
show_disk_usage

echo -e "${GREEN}Docker cleanup completed successfully!${NC}"
