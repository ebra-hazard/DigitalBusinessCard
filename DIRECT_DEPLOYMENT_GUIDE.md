# Direct Deployment Guide - No Docker

This guide explains how to deploy the Digital Business Cards application directly on your DigitalOcean droplet without using Docker.

## Prerequisites
- DigitalOcean droplet (Ubuntu 20.04 or 22.04)
- Domain: digitalbc.sword-academy.net
- SSH access to droplet: 174.138.12.114

## Step-by-Step Deployment

### Phase 1: Initial Server Setup (15 min)

```bash
# SSH into droplet
ssh root@174.138.12.114

# Update system packages
apt update && apt upgrade -y

# Install Node.js (v20 LTS)
curl -sL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Python 3.10+
apt install -y python3 python3-pip python3-venv

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Nginx
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2

# Create app user (optional but recommended)
useradd -m -s /bin/bash appuser
su - appuser
```

### Phase 2: Database Setup (10 min)

```bash
# Switch to postgres user
sudo -i -u postgres

# Create database and user
psql << EOF
CREATE DATABASE digital_cards;
CREATE USER dc_user WITH ENCRYPTED PASSWORD 'change_this_password_123!';
ALTER ROLE dc_user SET client_encoding TO 'utf8';
ALTER ROLE dc_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE dc_user SET default_transaction_deferrable TO off;
ALTER ROLE dc_user SET default_transaction_read_only TO off;
ALTER ROLE dc_user SET statement_timeout TO 0;
GRANT ALL PRIVILEGES ON DATABASE digital_cards TO dc_user;
\q
EOF

# Enable PostgreSQL on startup
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### Phase 3: Clone and Setup Backend (20 min)

```bash
# Back to root or appuser
exit

# Create app directory
mkdir -p /var/www/digital-cards
cd /var/www/digital-cards

# Clone repository
git clone https://github.com/ebra-hazard/DigitalBusinessCard.git .

# Create virtual environment for backend
python3 -m venv backend_venv
source backend_venv/bin/activate

# Install Python dependencies
cd backend
pip install --upgrade pip
pip install -r requirements.txt  # Create if doesn't exist (see below)

# Create .env for backend
cat > .env << 'EOF'
DATABASE_URL=postgresql+asyncpg://dc_user:change_this_password_123!@localhost:5432/digital_cards
JWT_SECRET=your_very_secure_jwt_secret_change_this_12345678
SECRET_KEY=your_very_secure_secret_key_change_this_87654321
ALLOWED_HOSTS=174.138.12.114,digitalbc.sword-academy.net,www.digitalbc.sword-academy.net,localhost,127.0.0.1
CORS_ORIGINS=https://174.138.12.114,https://digitalbc.sword-academy.net,https://www.digitalbc.sword-academy.net
ENVIRONMENT=production
SMTP_SERVER=smtp.hostinger.com
SMTP_PORT=465
SMTP_USERNAME=info@sword-academy.net
SMTP_PASSWORD=zZtFaK@3
SMTP_FROM=noreply@sword-academy.net
EOF

# Run database migrations
python3 -c "import asyncio; from migrations import main; asyncio.run(main())"

# Exit virtual environment
deactivate
```

### Phase 4: Setup Frontend (20 min)

```bash
# Go back to app directory
cd /var/www/digital-cards

# Setup frontend
cd frontend
npm install

# Create .env.production
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_HOST=174.138.12.114
NEXT_PUBLIC_API_PORT=443
NEXT_PUBLIC_API_URL=https://digitalbc.sword-academy.net/api
EOF

# Build frontend for production
npm run build

# Navigate back
cd ..
```

### Phase 5: Configure PM2 (15 min)

```bash
# Create ecosystem.config.js for PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'fastapi-backend',
      script: 'backend_venv/bin/python',
      args: '-m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4',
      cwd: '/var/www/digital-cards',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1'
      },
      error_file: '/var/log/pm2/backend_error.log',
      out_file: '/var/log/pm2/backend_out.log',
      log_file: '/var/log/pm2/backend.log',
      time: true
    },
    {
      name: 'nextjs-frontend',
      script: 'npm',
      args: 'run start',
      cwd: '/var/www/digital-cards/frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: '3000'
      },
      error_file: '/var/log/pm2/frontend_error.log',
      out_file: '/var/log/pm2/frontend_out.log',
      log_file: '/var/log/pm2/frontend.log',
      time: true
    }
  ]
};
EOF

# Create log directory
mkdir -p /var/log/pm2

# Start applications with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd -u root --hp /root
# Then run the command it outputs
```

### Phase 6: Configure Nginx (20 min)

```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/digital-cards << 'EOF'
# Upstream definitions
upstream backend {
    server 127.0.0.1:8000;
}

upstream frontend {
    server 127.0.0.1:3000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name 174.138.12.114 digitalbc.sword-academy.net www.digitalbc.sword-academy.net;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name 174.138.12.114 digitalbc.sword-academy.net www.digitalbc.sword-academy.net;

    # SSL certificates (generated with Certbot)
    ssl_certificate /etc/letsencrypt/live/digitalbc.sword-academy.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/digitalbc.sword-academy.net/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logging
    access_log /var/log/nginx/digital-cards_access.log;
    error_log /var/log/nginx/digital-cards_error.log;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;

    # Max upload size
    client_max_body_size 50M;

    # Frontend - default route
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API routes - proxy to frontend first (for auth/proxy routes)
    location /api/ {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://backend;
        proxy_http_version 1.1;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/digital-cards /etc/nginx/sites-enabled/

# Disable default site if exists
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start/reload Nginx
systemctl enable nginx
systemctl restart nginx
```

### Phase 7: Setup SSL with Certbot (10 min)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
certbot certonly --nginx -d digitalbc.sword-academy.net -d www.digitalbc.sword-academy.net

# Auto-renewal is automatic with certbot. Verify:
systemctl enable certbot.timer
systemctl start certbot.timer
```

### Phase 8: Verification & Testing (10 min)

```bash
# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs

# Check Nginx status
systemctl status nginx

# Test connectivity
curl http://localhost:8000/health
curl http://localhost:3000

# Test from outside
# Open browser to: https://digitalbc.sword-academy.net

# Test API
curl https://digitalbc.sword-academy.net/api/health
```

## Monitoring & Maintenance

### View Logs
```bash
# Backend logs
pm2 logs fastapi-backend

# Frontend logs
pm2 logs nextjs-frontend

# Nginx access logs
tail -f /var/log/nginx/digital-cards_access.log

# Nginx error logs
tail -f /var/log/nginx/digital-cards_error.log
```

### Restart Services
```bash
# Restart backend
pm2 restart fastapi-backend

# Restart frontend
pm2 restart nextjs-frontend

# Restart Nginx
systemctl restart nginx

# Restart all
pm2 restart all
```

### Update Application
```bash
cd /var/www/digital-cards
git pull origin main

# If backend changes:
source backend_venv/bin/activate
pip install -r backend/requirements.txt
pm2 restart fastapi-backend

# If frontend changes:
cd frontend
npm install
npm run build
pm2 restart nextjs-frontend
```

## Troubleshooting

### Backend won't start
```bash
pm2 logs fastapi-backend
# Check database connection
psql -U dc_user -d digital_cards -c "SELECT 1"
```

### Frontend shows 502 error
```bash
pm2 logs nextjs-frontend
# Check if port 3000 is open
netstat -tlnp | grep 3000
```

### SSL certificate issues
```bash
# Renew certificate
certbot renew

# Check certificate expiration
certbot certificates
```

### Database issues
```bash
# Connect to database
psql -U dc_user -d digital_cards

# Run migrations manually
python3 -c "import asyncio; from backend.migrations import main; asyncio.run(main())"
```

## Environment Variables Checklist

Update these in backend/.env:
- DATABASE_URL
- JWT_SECRET
- SECRET_KEY
- SMTP credentials
- ALLOWED_HOSTS
- CORS_ORIGINS

Update these in frontend/.env.production:
- NEXT_PUBLIC_API_HOST
- NEXT_PUBLIC_API_PORT
- NEXT_PUBLIC_API_URL

## Performance Tips

1. Enable Nginx caching for static files
2. Use PM2 cluster mode for production
3. Enable database connection pooling
4. Set up monitoring alerts
5. Regular backups of PostgreSQL database

## Security Checklist

- [ ] SSL/TLS certificates installed
- [ ] Firewall configured (only 80, 443, 22 open)
- [ ] Strong database passwords set
- [ ] JWT secrets are cryptographically random
- [ ] CORS_ORIGINS restricted to your domain
- [ ] ALLOWED_HOSTS configured correctly
- [ ] Regular updates applied
- [ ] Backups scheduled

---

**Estimated total deployment time: ~2-3 hours**

For issues or questions, check the logs mentioned above or consult the application documentation.
