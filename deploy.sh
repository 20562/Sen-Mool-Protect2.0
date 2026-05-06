#!/bin/bash
# SEN-MOOL PROTECT 2.0 - One-Command Deployment Script
# Run this to start the entire system

set -e

echo "🚀 SEN-MOOL PROTECT 2.0 - System Startup"
echo "=========================================="

# Check prerequisites
echo "✓ Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed. Install from https://www.docker.com"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not installed."
    exit 1
fi

# Check environment
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "📝 Please update .env with your configuration"
    exit 1
fi

# Start services
echo "🔧 Starting services..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to become healthy..."
sleep 10

# Check status
echo ""
echo "📊 Service Status:"
docker-compose ps

# Show logs
echo ""
echo "📋 Recent Logs:"
echo "(Press Ctrl+C to exit logs)"
docker-compose logs --tail=50 -f backend

