#!/bin/bash
# build-and-deploy.sh
set -e

# Docker registry variable
DOCKER_REGISTRY="thornberry"

# Check if Docker is running
echo "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
  echo "Docker not running or not accessible"
  exit 1
fi

# Test Docker login with a simple command that requires authentication
echo "Verifying Docker authentication..."
if ! docker pull hello-world:latest > /dev/null 2>&1; then
  echo "Not logged in to Docker or network issue. Please run 'docker login' first."
  exit 1
fi

echo "Ensuring content is up to date..."
cd content  # Follow your symlink
git checkout main   # Switch to main branch
git pull origin main
cd ..               # Back to garden2 root

echo "Building site..."
npx quartz build

echo "Pulling amd64 base image..."
docker pull --platform linux/amd64 nginx:alpine

echo "Building and pushing container..."
docker buildx build --platform linux/amd64 -t ${DOCKER_REGISTRY}/garden:latest --push .

echo "🐋 Deployment complete! Railway will auto-redeploy shortly."