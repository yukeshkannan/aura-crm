# AWS Deployment Guide - Company CRM

## Available Instances
- **t3.micro** (2 vCPU, 1GB RAM)
- **t3.small** (2 vCPU, 2GB RAM)
- **c7i-flex.large** (2 vCPU, 4GB RAM) - Compute optimized
- **m7i-flex.large** (2 vCPU, 8GB RAM) - Memory optimized

---

## Deployment Strategy

### Option 1: Single Instance (Recommended for Start)
Deploy all services on **1x m7i-flex.large** instance
- **Cost-effective** for testing/small scale
- **Easy to manage**
- **Good for MVP/Demo**

### Option 2: Multi-Instance (Production)
Distribute services across multiple instances
- **Better performance**
- **Fault tolerance**
- **Scalable**

---

## Step-by-Step Deployment (Single Instance)

### Step 1: Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Launch Instance

2. **Configure Instance:**
   - **Name:** `company-crm-server`
   - **AMI:** Ubuntu Server 22.04 LTS
   - **Instance Type:** `m7i-flex.large`
   - **Key Pair:** Create new or select existing
   - **Network Settings:**
     - Allow SSH (port 22) from your IP
     - Allow HTTP (port 80) from anywhere
     - Allow HTTPS (port 443) from anywhere
     - Allow Custom TCP (port 5000) from anywhere (for API Gateway)
     - Allow Custom TCP (port 3000) from anywhere (for Frontend)
   - **Storage:** 30 GB gp3

3. **Launch Instance** and wait for it to be running

4. **Note down:**
   - Public IP address
   - Private key file location (.pem file)

---

### Step 2: Connect to EC2 Instance

```bash
# Set correct permissions for key file
chmod 400 your-key.pem

# SSH into instance
ssh -i your-key.pem ubuntu@YOUR_PUBLIC_IP
```

---

### Step 3: Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Logout and login again for group changes
exit
```

```bash
# SSH back in
ssh -i your-key.pem ubuntu@YOUR_PUBLIC_IP
```

---

### Step 4: Install Git & Clone Repository

```bash
# Install Git
sudo apt install git -y

# Configure Git (optional)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Clone your repository
git clone https://github.com/YOUR_USERNAME/Company-CRM.git
cd Company-CRM
```

> **Note:** If your repository is private, you'll need to set up SSH keys or use a personal access token.

---

### Step 5: Configure Environment Variables

```bash
# Create .env file in root
nano .env
```

Add the following:
```env
# MongoDB
MONGO_URI=mongodb+srv://yukesh:yukesh1234@yukesh.5dylhhw.mongodb.net/companycrm?appName=Yukesh

# JWT
JWT_SECRET=supersecretkey123

# AWS (for document service)
STORAGE_TYPE=local
AWS_REGION=ap-south-1

# Email (for notification service)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

Save and exit (Ctrl+X, then Y, then Enter)

---

### Step 6: Update MongoDB Atlas IP Whitelist

1. Go to **MongoDB Atlas** → Your Cluster → Network Access
2. Click **Add IP Address**
3. Add your EC2 instance's **Public IP**
4. Or add `0.0.0.0/0` to allow from anywhere (less secure but easier)

---

### Step 7: Build and Run Docker Containers

```bash
# Build all images (this will take 10-15 minutes)
docker-compose build

# Start all services
docker-compose up -d

# Check if all containers are running
docker-compose ps

# View logs
docker-compose logs -f
```

---

### Step 8: Verify Deployment

```bash
# Check if services are responding
curl http://localhost:5000/health  # Gateway
curl http://localhost:3000         # Frontend

# Check from your local machine
curl http://YOUR_PUBLIC_IP:5000/health
curl http://YOUR_PUBLIC_IP:3000
```

Open browser and go to: `http://YOUR_PUBLIC_IP:3000`

---

### Step 9: Set Up Nginx (Optional - For Production)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/company-crm
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name YOUR_PUBLIC_IP;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Gateway
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/company-crm /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

Now access your app at: `http://YOUR_PUBLIC_IP`

---

## Multi-Instance Deployment (Advanced)

### Instance Allocation

| Instance Type | Services | Reason |
|--------------|----------|--------|
| **t3.small** | Gateway + Client | Entry point, moderate traffic |
| **t3.micro** | Auth, Contact, Product, Invoice | Lightweight CRUD services |
| **c7i-flex.large** | Analytics, Search, HR | Compute-intensive operations |
| **m7i-flex.large** | Document, Notification, Opportunity, Task, Ticket | Memory-intensive, file handling |

### Setup Steps

1. **Launch 4 EC2 instances** with above specifications
2. **Install Docker** on each instance (Steps 2-3)
3. **Configure Security Groups** to allow inter-instance communication
4. **Update docker-compose.yml** to split services across instances
5. **Set up Load Balancer** (Application Load Balancer)
6. **Configure DNS** to point to Load Balancer

---

## Useful Commands

### Docker Management
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart [service-name]

# Stop all services
docker-compose down

# Start all services
docker-compose up -d

# Rebuild a specific service
docker-compose build [service-name]
docker-compose up -d [service-name]

# Remove all containers and volumes
docker-compose down -v
```

### System Monitoring
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check Docker stats
docker stats

# Check system logs
sudo journalctl -u docker -f
```

### Updates & Maintenance
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Clean up old images
docker system prune -a
```

---

## Troubleshooting

### Services not starting
```bash
# Check logs
docker-compose logs [service-name]

# Check if port is already in use
sudo netstat -tulpn | grep [PORT]

# Restart Docker
sudo systemctl restart docker
```

### MongoDB connection issues
- Verify MongoDB Atlas IP whitelist includes EC2 IP
- Check connection string in .env file
- Test connection: `docker-compose logs auth-service`

### Out of memory
```bash
# Check memory
free -h

# Increase swap space
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Port conflicts
```bash
# Find process using port
sudo lsof -i :5000

# Kill process
sudo kill -9 [PID]
```

---

## Security Checklist

- [ ] Change default MongoDB credentials
- [ ] Use strong JWT secret
- [ ] Enable firewall (UFW)
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Restrict SSH to your IP only
- [ ] Use AWS Secrets Manager for sensitive data
- [ ] Enable CloudWatch monitoring
- [ ] Set up automated backups
- [ ] Keep system updated

---

## Cost Optimization

1. **Use Reserved Instances** for long-term (1-3 years) - Save up to 72%
2. **Stop instances** when not in use (dev/test environments)
3. **Use Spot Instances** for non-critical workloads - Save up to 90%
4. **Monitor usage** with AWS Cost Explorer
5. **Set up billing alerts**

---

## Next Steps

1. **Set up domain name** and configure DNS
2. **Install SSL certificate** (Let's Encrypt)
3. **Configure CI/CD** with GitHub Actions
4. **Set up monitoring** with CloudWatch
5. **Create backup strategy**
6. **Load testing** to verify performance
7. **Set up staging environment**

---

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review MongoDB Atlas connection
- Verify security group settings
- Check EC2 instance status in AWS Console
