#!/bin/bash

# Ensure script fails on any error
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Default values
REGISTRY="docker.io"
REPOSITORY="barneephife/tgeld"
TAG="latest"
PUSH=false
LOCAL=false
SKIP_TESTS=false

# Function to test API endpoints
test_endpoint() {
    local endpoint=$1
    local method=$2
    local data=$3
    local expected_status=$4
    local description=$5

    echo -e "${YELLOW}Testing: $description${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -X GET "http://localhost:${PORT:-3000}/api/$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -X $method -H "Content-Type: application/json" -d "$data" "http://localhost:${PORT:-3000}/api/$endpoint")
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

# Function to run API tests
run_api_tests() {
    echo -e "\n${YELLOW}Running API tests...${NC}"
    
    # Wait for application to be ready
    echo -e "${YELLOW}Waiting for application to be ready...${NC}"
    timeout=30
    counter=0
    while ! curl -s http://localhost:${PORT:-3000}/api/health | grep -q "ok"; do
        counter=$((counter + 1))
        if [ $counter -gt $timeout ]; then
            echo -e "${RED}Error: Application failed to start after ${timeout} seconds${NC}"
            return 1
        fi
        echo -n "."
        sleep 1
    done
    echo -e "\n${GREEN}Application is ready!${NC}"

    # Test core endpoints
    test_endpoint "settings" "GET" "" "200" "Get all settings"
    test_endpoint "settings" "PUT" '{"key":"enforce_roles","value":"true"}' "200" "Update enforce_roles setting"
    test_endpoint "settings/currency" "GET" "" "200" "Get currency setting"
    test_endpoint "settings/language" "GET" "" "200" "Get language setting"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --push)
            PUSH=true
            shift
            ;;
        --local)
            LOCAL=true
            shift
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Ensure BuildKit is enabled
export DOCKER_BUILDKIT=1

# Create and use multi-architecture builder if it doesn't exist
if ! docker buildx inspect multiarch >/dev/null 2>&1; then
    echo -e "${YELLOW}Creating multi-architecture builder...${NC}"
    docker buildx create --name multiarch --driver docker-container --use
fi

# Ensure builder is ready
docker buildx inspect --bootstrap

if [ "$LOCAL" = true ]; then
    echo -e "${YELLOW}Building images locally for both architectures...${NC}"
    
    # Build AMD64
    echo -e "${YELLOW}Building AMD64 image...${NC}"
    docker buildx build --platform linux/amd64 -f Dockerfile.prod \
        -t $REGISTRY/$REPOSITORY:$TAG-amd64 --load .
    
    # Build ARM64
    echo -e "${YELLOW}Building ARM64 image...${NC}"
    docker buildx build --platform linux/arm64 -f Dockerfile.prod \
        -t $REGISTRY/$REPOSITORY:$TAG-arm64 --load .
    
    echo -e "${GREEN}Local builds complete!${NC}"
    
    if [ "$SKIP_TESTS" = false ]; then
        # Test AMD64 build
        echo -e "${YELLOW}Testing AMD64 build...${NC}"
        docker tag $REGISTRY/$REPOSITORY:$TAG-amd64 $REGISTRY/$REPOSITORY:$TAG
        docker compose -f docker-compose.yml -f docker-compose.amd64.yml up -d
        run_api_tests
        docker compose -f docker-compose.yml -f docker-compose.amd64.yml down
        
        # Test ARM64 build
        echo -e "${YELLOW}Testing ARM64 build...${NC}"
        docker tag $REGISTRY/$REPOSITORY:$TAG-arm64 $REGISTRY/$REPOSITORY:$TAG
        docker compose -f docker-compose.yml -f docker-compose.arm64.yml up -d
        run_api_tests
        docker compose -f docker-compose.yml -f docker-compose.arm64.yml down
    fi

elif [ "$PUSH" = true ]; then
    echo -e "${YELLOW}Building and pushing multi-architecture image...${NC}"
    docker buildx build --platform linux/amd64,linux/arm64 -f Dockerfile.prod \
        -t $REGISTRY/$REPOSITORY:$TAG --push .
    echo -e "${GREEN}Image pushed to $REGISTRY/$REPOSITORY:$TAG${NC}"

else
    echo -e "${RED}Error: Must specify either --local or --push${NC}"
    exit 1
fi

echo -e "${GREEN}Build process completed successfully!${NC}"
