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
REPOSITORY="tgeld/tgeld"
VERSION=$(cat version.txt 2>/dev/null || echo "1.0.0")
TAG="latest"
PUSH=false
LOCAL=false
SKIP_TESTS=false
TEST_TIMEOUT=300  # 5 minutes timeout for tests

# Function to log messages with timestamp
log() {
    local level=$1
    shift
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] [$level]${NC} $*"
}

# Function to increment version
increment_version() {
    local version_type=$1
    local current_version=$2
    local major minor patch
    
    # Split version into components
    IFS='.' read -r major minor patch <<< "$current_version"
    
    case $version_type in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        patch)
            patch=$((patch + 1))
            ;;
        *)
            echo "Invalid version type. Use: major, minor, or patch"
            exit 1
            ;;
    esac
    
    echo "$major.$minor.$patch"
}

# Function to update version file
update_version() {
    local new_version=$1
    echo "$new_version" > version.txt
    log "INFO" "Updated version.txt to $new_version"
}

# Function to validate environment
validate_environment() {
    log "INFO" "Validating build environment..."
    
    # Check Docker installation
    if ! command -v docker >/dev/null 2>&1; then
        log "ERROR" "Docker is not installed"
        exit 1
    fi

    # Check Docker Compose installation
    if ! command -v docker compose >/dev/null 2>&1; then
        log "ERROR" "Docker Compose is not installed"
        exit 1
    }

    # Check BuildKit support
    if ! docker buildx version >/dev/null 2>&1; then
        log "ERROR" "Docker BuildKit is not available"
        exit 1
    }

    # Validate required files exist
    required_files=("Dockerfile.prod" "docker-compose.yml" "docker-compose.amd64.yml" "docker-compose.arm64.yml")
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log "ERROR" "Required file $file not found"
            exit 1
        fi
    done

    log "INFO" "Environment validation completed successfully"
}

# Function to test API endpoints with improved error handling
test_endpoint() {
    local endpoint=$1
    local method=$2
    local data=$3
    local expected_status=$4
    local description=$5
    local max_retries=3
    local retry_count=0

    log "INFO" "Testing: $description"
    
    while [ $retry_count -lt $max_retries ]; do
        if [ "$method" = "GET" ]; then
            response=$(curl -s -w "%{http_code}" -X GET "http://localhost:${PORT:-3000}/api/$endpoint")
        else
            response=$(curl -s -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "http://localhost:${PORT:-3000}/api/$endpoint")
        fi

        status_code=${response: -3}
        response_body=${response:0:${#response}-3}

        if [ "$status_code" = "$expected_status" ]; then
            log "SUCCESS" "✓ $description"
            return 0
        fi

        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $max_retries ]; then
            log "WARN" "Retrying... (Attempt $retry_count/$max_retries)"
            sleep 2
        fi
    done

    log "ERROR" "✗ $description (Expected: $expected_status, Got: $status_code)"
    log "ERROR" "Response: $response_body"
    return 1
}

# Function to run comprehensive API tests
run_api_tests() {
    log "INFO" "Running comprehensive API tests..."
    
    # Wait for application with timeout
    local timeout=$TEST_TIMEOUT
    local elapsed=0
    local interval=5

    log "INFO" "Waiting for application to be ready (timeout: ${timeout}s)..."
    while [ $elapsed -lt $timeout ]; do
        if curl -s http://localhost:${PORT:-3000}/api/health | grep -q "ok"; then
            log "SUCCESS" "Application is ready!"
            break
        fi
        elapsed=$((elapsed + interval))
        echo -n "."
        sleep $interval
    done

    if [ $elapsed -ge $timeout ]; then
        log "ERROR" "Application failed to start after ${timeout} seconds"
        return 1
    fi

    # Core API Tests
    test_endpoint "health" "GET" "" "200" "Health check endpoint"
    test_endpoint "settings" "GET" "" "200" "Get all settings"
    test_endpoint "settings" "PUT" '{"key":"enforce_roles","value":"true"}' "200" "Update enforce_roles setting"
    test_endpoint "settings/currency" "GET" "" "200" "Get currency setting"
    test_endpoint "settings/language" "GET" "" "200" "Get language setting"

    # Backup/Restore Tests
    test_endpoint "backup/tasks" "GET" "" "200" "Backup tasks"
    test_endpoint "backup/piggybank" "GET" "" "200" "Backup piggy bank"
    
    # User Management Tests
    test_endpoint "users" "GET" "" "200" "Get users list"
    
    # Task Management Tests
    test_endpoint "tasks" "GET" "" "200" "Get tasks list"

    log "INFO" "API tests completed successfully"
}

# Function to test database connectivity
test_database() {
    log "INFO" "Testing database connectivity..."
    
    local max_retries=5
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        if docker compose exec -T db pg_isready -U postgres; then
            log "SUCCESS" "Database is ready and accepting connections"
            return 0
        fi
        retry_count=$((retry_count + 1))
        log "WARN" "Database not ready, retrying... ($retry_count/$max_retries)"
        sleep 5
    done
    
    log "ERROR" "Database failed to become ready"
    return 1
}

# Function to tag images with improved error handling
tag_images() {
    local base_tag="$1"
    local version="$2"
    local arch="$3"
    
    log "INFO" "Tagging images for version $version${arch:+ ($arch)}"
    
    if [ -n "$arch" ]; then
        if ! docker tag "$REGISTRY/$REPOSITORY:$base_tag" "$REGISTRY/$REPOSITORY:v$version-$arch"; then
            log "ERROR" "Failed to tag image for $arch"
            return 1
        fi
    else
        if ! docker tag "$REGISTRY/$REPOSITORY:$base_tag" "$REGISTRY/$REPOSITORY:v$version"; then
            log "ERROR" "Failed to tag version"
            return 1
        fi
    fi
    
    log "SUCCESS" "Image tagged successfully"
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
        --version)
            VERSION="$2"
            shift 2
            ;;
        --increment)
            VERSION=$(increment_version "$2" "$VERSION")
            update_version "$VERSION"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        *)
            log "ERROR" "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate environment before proceeding
validate_environment

# Ensure BuildKit is enabled
export DOCKER_BUILDKIT=1

# Create and use multi-architecture builder if it doesn't exist
if ! docker buildx inspect multiarch >/dev/null 2>&1; then
    log "INFO" "Creating multi-architecture builder..."
    docker buildx create --name multiarch --driver docker-container --use
fi

# Ensure builder is ready
docker buildx inspect --bootstrap

if [ "$LOCAL" = true ]; then
    log "INFO" "Building images locally for both architectures..."
    
    # Build AMD64
    log "INFO" "Building AMD64 image..."
    if ! docker buildx build --platform linux/amd64 -f Dockerfile.prod \
        -t "$REGISTRY/$REPOSITORY:$TAG-amd64" --load .; then
        log "ERROR" "AMD64 build failed"
        exit 1
    fi
    tag_images "$TAG-amd64" "$VERSION" "amd64"
    
    # Build ARM64
    log "INFO" "Building ARM64 image..."
    if ! docker buildx build --platform linux/arm64 -f Dockerfile.prod \
        -t "$REGISTRY/$REPOSITORY:$TAG-arm64" --load .; then
        log "ERROR" "ARM64 build failed"
        exit 1
    fi
    tag_images "$TAG-arm64" "$VERSION" "arm64"
    
    log "SUCCESS" "Local builds completed!"
    
    if [ "$SKIP_TESTS" = false ]; then
        # Set test environment variables
        export DB_PASSWORD=TGeld2025DB
        export DB_USER=postgres
        export DB_DATABASE=tgeld
        export DB_PORT=5432
        
        # Create environment file for docker-compose
        cat > .env.test << EOF
DB_PASSWORD=$DB_PASSWORD
DB_USER=$DB_USER
DB_DATABASE=$DB_DATABASE
DB_PORT=$DB_PORT
EOF
        
        # Test AMD64 build
        log "INFO" "Testing AMD64 build..."
        docker tag "$REGISTRY/$REPOSITORY:$TAG-amd64" "$REGISTRY/$REPOSITORY:$TAG"
        if ! docker compose --env-file .env.test -f docker-compose.yml -f docker-compose.amd64.yml up -d; then
            log "ERROR" "Failed to start AMD64 containers"
            exit 1
        fi
        
        if ! test_database; then
            log "ERROR" "Database tests failed for AMD64"
            docker compose --env-file .env.test -f docker-compose.yml -f docker-compose.amd64.yml down
            exit 1
        fi
        
        if ! run_api_tests; then
            log "ERROR" "API tests failed for AMD64"
            docker compose --env-file .env.test -f docker-compose.yml -f docker-compose.amd64.yml down
            exit 1
        fi
        
        docker compose --env-file .env.test -f docker-compose.yml -f docker-compose.amd64.yml down
        
        # Test ARM64 build
        log "INFO" "Testing ARM64 build..."
        docker tag "$REGISTRY/$REPOSITORY:$TAG-arm64" "$REGISTRY/$REPOSITORY:$TAG"
        if ! docker compose --env-file .env.test -f docker-compose.yml -f docker-compose.arm64.yml up -d; then
            log "ERROR" "Failed to start ARM64 containers"
            exit 1
        fi
        
        if ! test_database; then
            log "ERROR" "Database tests failed for ARM64"
            docker compose --env-file .env.test -f docker-compose.yml -f docker-compose.arm64.yml down
            exit 1
        fi
        
        if ! run_api_tests; then
            log "ERROR" "API tests failed for ARM64"
            docker compose --env-file .env.test -f docker-compose.yml -f docker-compose.arm64.yml down
            exit 1
        fi
        
        docker compose --env-file .env.test -f docker-compose.yml -f docker-compose.arm64.yml down
        
        # Clean up test environment file
        rm .env.test
        
        log "SUCCESS" "All tests passed successfully!"
    fi

elif [ "$PUSH" = true ]; then
    log "INFO" "Building and pushing multi-architecture image..."
    # Build and push with version tag
    if ! docker buildx build --platform linux/amd64,linux/arm64 -f Dockerfile.prod \
        -t "$REGISTRY/$REPOSITORY:v$VERSION" \
        -t "$REGISTRY/$REPOSITORY:latest" --push .; then
        log "ERROR" "Failed to build and push multi-arch images"
        exit 1
    fi
    log "SUCCESS" "Images pushed with tags: latest, v$VERSION"

else
    log "ERROR" "Must specify either --local or --push"
    exit 1
fi

log "SUCCESS" "Build process completed successfully!"
