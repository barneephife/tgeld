#!/bin/bash

# Ensure script fails on any error
set -e

# Default values
REGISTRY="docker.io"
REPOSITORY="barneephife/tgeld"
TAG="latest"
PUSH=false
LOCAL=false

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
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Ensure BuildKit is enabled
export DOCKER_BUILDKIT=1

# Create and use multi-architecture builder if it doesn't exist
if ! docker buildx inspect multiarch >/dev/null 2>&1; then
  echo "Creating multi-architecture builder..."
  docker buildx create --name multiarch --driver docker-container --use
fi

# Ensure builder is ready
docker buildx inspect --bootstrap

if [ "$LOCAL" = true ]; then
  echo "Building images locally for both architectures..."
  
  # Build AMD64
  echo "Building AMD64 image..."
  docker buildx build --platform linux/amd64 -f Dockerfile.prod \
    -t $REGISTRY/$REPOSITORY:$TAG-amd64 --load .
  
  # Build ARM64
  echo "Building ARM64 image..."
  docker buildx build --platform linux/arm64 -f Dockerfile.prod \
    -t $REGISTRY/$REPOSITORY:$TAG-arm64 --load .
  
  echo "Local builds complete!"
  echo "Use these images with their specific tags:"
  echo "  $REGISTRY/$REPOSITORY:$TAG-amd64"
  echo "  $REGISTRY/$REPOSITORY:$TAG-arm64"
  
  echo "Testing builds..."
  
  # Test AMD64 build
  echo "Testing AMD64 build..."
  docker tag $REGISTRY/$REPOSITORY:$TAG-amd64 $REGISTRY/$REPOSITORY:$TAG
  docker compose -f docker-compose.yml -f docker-compose.amd64.yml up -d
  sleep 10
  docker compose -f docker-compose.yml -f docker-compose.amd64.yml down
  
  # Test ARM64 build
  echo "Testing ARM64 build..."
  docker tag $REGISTRY/$REPOSITORY:$TAG-arm64 $REGISTRY/$REPOSITORY:$TAG
  docker compose -f docker-compose.yml -f docker-compose.arm64.yml up -d
  sleep 10
  docker compose -f docker-compose.yml -f docker-compose.arm64.yml down

elif [ "$PUSH" = true ]; then
  echo "Building and pushing multi-architecture image..."
  docker buildx build --platform linux/amd64,linux/arm64 -f Dockerfile.prod \
    -t $REGISTRY/$REPOSITORY:$TAG --push .
  echo "Image pushed to $REGISTRY/$REPOSITORY:$TAG"

else
  echo "Error: Must specify either --local or --push"
  exit 1
fi
