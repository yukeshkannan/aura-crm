#!/bin/bash

# Company CRM - Deployment Script
# This script deploys the application to EC2 instance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Company CRM - Deployment Script"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create .env file with required environment variables"
    exit 1
fi

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main || git pull origin master

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down

# Remove old images (optional - uncomment if needed)
# echo -e "${YELLOW}🗑️  Removing old images...${NC}"
# docker-compose down --rmi all

# Build new images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker-compose build --no-cache

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose up -d

# Wait for services to start
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 10

# Check service health
echo ""
echo -e "${YELLOW}🏥 Checking service health...${NC}"
echo ""

check_service() {
    local service=$1
    local port=$2
    
    if curl -s http://localhost:$port > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service is running (port $port)${NC}"
    else
        echo -e "${RED}❌ $service is not responding (port $port)${NC}"
    fi
}

check_service "Gateway" 5000
check_service "Frontend" 3000

# Show running containers
echo ""
echo -e "${YELLOW}📊 Running containers:${NC}"
docker-compose ps

# Show logs
echo ""
echo -e "${YELLOW}📝 Recent logs:${NC}"
docker-compose logs --tail=50

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Access your application:"
echo "  Frontend: http://$(curl -s ifconfig.me):3000"
echo "  API Gateway: http://$(curl -s ifconfig.me):5000"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Restart: docker-compose restart"
echo "  Stop: docker-compose down"
echo ""
