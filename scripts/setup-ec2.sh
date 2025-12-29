#!/bin/bash

# Company CRM - EC2 Instance Setup Script
# This script installs Docker, Docker Compose, and prepares the instance

set -e

echo "=========================================="
echo "Company CRM - EC2 Instance Setup"
echo "=========================================="
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential tools
echo "🔧 Installing essential tools..."
sudo apt install -y git curl wget nano htop

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

# Add current user to docker group
echo "👤 Adding user to docker group..."
sudo usermod -aG docker $USER

# Install Docker Compose
echo "🐙 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
echo ""
echo "✅ Verifying installations..."
docker --version
docker-compose --version

# Configure firewall (UFW)
echo ""
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5000/tcp  # API Gateway
sudo ufw allow 3000/tcp  # Frontend
echo "y" | sudo ufw enable

# Increase file limits for Docker
echo ""
echo "📈 Increasing system limits..."
sudo tee -a /etc/security/limits.conf > /dev/null <<EOF
* soft nofile 65536
* hard nofile 65536
EOF

# Configure swap space (4GB)
echo ""
echo "💾 Setting up swap space..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap space created: 4GB"
else
    echo "Swap file already exists"
fi

# Create project directory
echo ""
echo "📁 Creating project directory..."
mkdir -p ~/company-crm
cd ~/company-crm

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Logout and login again for Docker group changes to take effect"
echo "2. Clone your repository: git clone <your-repo-url>"
echo "3. Configure environment variables"
echo "4. Run: docker-compose up -d"
echo ""
echo "To logout: exit"
echo ""
