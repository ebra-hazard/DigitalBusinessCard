#!/bin/bash

# Quick script to update configuration for network changes
# Usage: ./update-network.sh <new-ip>

if [ -z "$1" ]; then
    echo "Usage: ./update-network.sh <new-ip>"
    echo ""
    echo "Example: ./update-network.sh 192.168.100.50"
    echo ""
    echo "To find your IP address:"
    echo "  macOS:  ifconfig | grep 'inet ' | grep -v 127.0.0.1"
    echo "  Linux:  hostname -I"
    exit 1
fi

NEW_IP=$1
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🔄 Updating network configuration to use IP: $NEW_IP"

# Update .env.development
echo "📝 Updating .env.development..."
sed -i.bak "s/API_HOST=.*/API_HOST=$NEW_IP/g" "$SCRIPT_DIR/.env.development"
sed -i.bak "s/FRONTEND_HOST=.*/FRONTEND_HOST=$NEW_IP/g" "$SCRIPT_DIR/.env.development"

# Update .env if it exists and is not a symlink
if [ -f "$SCRIPT_DIR/.env" ] && [ ! -L "$SCRIPT_DIR/.env" ]; then
    echo "📝 Updating .env..."
    sed -i.bak "s/API_HOST=.*/API_HOST=$NEW_IP/g" "$SCRIPT_DIR/.env"
    sed -i.bak "s/FRONTEND_HOST=.*/FRONTEND_HOST=$NEW_IP/g" "$SCRIPT_DIR/.env"
fi

# Restart services
echo "🔄 Restarting Docker services..."
cd "$SCRIPT_DIR"
docker-compose restart backend frontend

# Wait for services to start
sleep 3

# Verify configuration
echo ""
echo "✅ Configuration updated!"
echo ""
echo "📋 Current configuration:"
docker-compose exec -T backend python3 -c \
  "import os; \
   print(f'  API_HOST: {os.getenv(\"API_HOST\")}'); \
   print(f'  API_PORT: {os.getenv(\"API_PORT\")}'); \
   print(f'  FRONTEND_HOST: {os.getenv(\"FRONTEND_HOST\")}'); \
   print(f'  ENVIRONMENT: {os.getenv(\"ENVIRONMENT\")}')"

echo ""
echo "🌐 Access the application at:"
echo "  http://$NEW_IP:3000"
echo ""
echo "💡 To regenerate test cards with new IP:"
echo "  python3 seed_test_data.py"
