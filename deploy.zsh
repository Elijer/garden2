#!/bin/bash
# build-and-deploy.sh
set -e

echo "🚀 Starting deployment..."
echo "Prerequisites: Make sure you're logged into Docker and Railway:"
echo "   docker login"
echo "   railway login"
echo ""

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Docker registry variable
DOCKER_REGISTRY="thornberry"
RAILWAY_SERVICE_ID="702cff9a-b864-46c8-87e4-cf46ee39c694"

# Get the next version number
get_next_version() {
    TAGS=$(curl -s "https://registry.hub.docker.com/v2/repositories/${DOCKER_REGISTRY}/garden/tags?page_size=100" | grep -o '"name":"[0-9]*"' | grep -o '[0-9]*' | sort -n | tail -1)
    
    if [ -z "$TAGS" ]; then
        echo "1"
    else
        echo $((TAGS + 1))
    fi
}

VERSION=$(get_next_version)

echo "📝 Updating content..."
cd content
git checkout main
git pull origin main
cd ..

echo "🏗️  Building site..."
npx quartz build

echo "🐳 Building and pushing Docker image (version ${VERSION})..."
docker pull --platform linux/amd64 nginx:alpine
docker buildx build --platform linux/amd64 -t ${DOCKER_REGISTRY}/garden:${VERSION} -t ${DOCKER_REGISTRY}/garden:latest --push .

echo "🚂 Triggering Railway redeploy..."
railway redeploy --service ${RAILWAY_SERVICE_ID} --yes

echo "✅ Deployment complete! Version ${VERSION} deployed."