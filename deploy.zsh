#!/bin/bash
set -e

echo "Starting deployment..."
echo "Prerequisites: Make sure you're logged into Docker and Railway:"
echo "   docker login"
echo "   railway login"
echo ""

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

DOCKER_REGISTRY="thornberry"
RAILWAY_SERVICE_ID="702cff9a-b864-46c8-87e4-cf46ee39c694"

# Get the next version number - faster local approach
get_next_version() {
    # Try to get from git tags first (much faster than API calls)
    LATEST_TAG=$(git tag -l "${DOCKER_REGISTRY}/garden-*" 2>/dev/null | sort -V | tail -1 | grep -o '[0-9]*$' || echo "0")
    echo $((LATEST_TAG + 1))
}

VERSION=$(get_next_version)

echo "Updating content..."
cd content
git checkout main
git pull origin main
cd ..

echo "Building site..."
rm -rf public
npx quartz build

echo "Building and pushing Docker image (version ${VERSION})..."
# Skip the explicit pull - buildx will handle it, and Docker caches layers anyway
docker buildx build --platform linux/amd64 -t ${DOCKER_REGISTRY}/garden:${VERSION} -t ${DOCKER_REGISTRY}/garden:latest --push .

echo "Triggering Railway redeploy..."
railway redeploy --service ${RAILWAY_SERVICE_ID} --yes

echo "Deployment complete! Version ${VERSION} deployed."