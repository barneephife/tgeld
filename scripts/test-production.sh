#!/bin/bash
set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting production testing process...${NC}"

# Function to check if a command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        exit 1
    fi
}

# 1. Build production image
echo -e "\n${YELLOW}1. Building production image...${NC}"
docker build -f Dockerfile.prod -t tgeld:latest .
check_status "Production image build"

# 2. Stop any running containers and clean volumes
echo -e "\n${YELLOW}2. Cleaning environment...${NC}"
docker compose down -v
check_status "Environment cleanup"

# 3. Start with production configuration
echo -e "\n${YELLOW}3. Starting production environment...${NC}"
docker compose -f docker-compose.yml up -d
check_status "Production environment startup"

# 4. Wait for services to be ready
echo -e "\n${YELLOW}4. Waiting for services to be ready...${NC}"
sleep 10  # Initial wait

# Test database connection
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:8071/api/health | grep -q "ok"; then
        echo -e "${GREEN}✓ Services are ready${NC}"
        break
    fi
    echo -n "."
    sleep 2
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        echo -e "\n${RED}✗ Services failed to start properly${NC}"
        exit 1
    fi
done

# 5. Run API tests
echo -e "\n${YELLOW}5. Testing API endpoints...${NC}"

# Test settings endpoints
test_endpoint() {
    local endpoint=$1
    local method=$2
    local data=$3
    local expected_status=$4
    local description=$5

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -X GET "http://localhost:8071/api/$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -X $method -H "Content-Type: application/json" -d "$data" "http://localhost:8071/api/$endpoint")
    fi

    status_code=${response: -3}
    response_body=${response:0:${#response}-3}

    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ $description${NC}"
    else
        echo -e "${RED}✗ $description (Expected: $expected_status, Got: $status_code)${NC}"
        echo "Response: $response_body"
        return 1
    fi
}

# Test settings endpoints
test_endpoint "settings" "GET" "" "200" "Get all settings"
test_endpoint "settings" "PUT" '{"key":"enforce_roles","value":"true"}' "200" "Update enforce_roles setting"
test_endpoint "settings/currency" "GET" "" "200" "Get currency setting"
test_endpoint "settings/language" "GET" "" "200" "Get language setting"

# 6. Build multi-architecture images
echo -e "\n${YELLOW}6. Setting up multi-architecture build...${NC}"
docker buildx create --use
check_status "Buildx setup"

echo -e "\n${YELLOW}7. Building multi-architecture images...${NC}"
./scripts/build-multiarch.sh
check_status "Multi-architecture build"

echo -e "\n${GREEN}Production testing completed successfully!${NC}"

# Optional: Clean up
echo -e "\n${YELLOW}Cleaning up...${NC}"
docker compose down
check_status "Cleanup"

echo -e "\n${GREEN}All tests passed! Ready for production deployment.${NC}"
