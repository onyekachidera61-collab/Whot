# Deployment Guide

## Prerequisites

- Node.js >= 18.0.0
- MySQL >= 5.7
- Docker & Docker Compose (optional)
- Git

## Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/onyekachidera61-collab/whot.git
cd whot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Setup Database
```bash
# Create database
mysql -u root -p < database/schema.sql

# Run migrations
npm run migrate

# Seed sample data (optional)
npm run seed
```

### 5. Start Development Server
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Serve frontend
python -m http.server 8000 --directory frontend
```

Access application at `http://localhost:8000`

## Production Deployment

### Option 1: Docker Deployment

#### Build Docker Image
```bash
docker build -t 9jawin-whot:latest .
```

#### Run with Docker Compose
```bash
# Create .env file with production settings
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

#### Stop Services
```bash
docker-compose down
```

### Option 2: Manual VPS Deployment

#### 1. Connect to Server
```bash
ssh user@your-server-ip
```

#### 2. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 3. Install MySQL
```bash
sudo apt-get install -y mysql-server
```

#### 4. Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/onyekachidera61-collab/whot.git
cd whot
sudo chown -R $USER:$USER .
```

#### 5. Install Dependencies
```bash
npm install --production
```

#### 6. Configure Environment
```bash
cp .env.example .env
# Edit with production settings
nano .env
```

#### 7. Setup Database
```bash
mysql -u root -p < database/schema.sql
npm run migrate
```

#### 8. Setup PM2 Process Manager
```bash
sudo npm install -g pm2
pm2 start server.js --name "9jawin"
pm2 startup
pm2 save
```

#### 9. Setup Nginx Reverse Proxy
```bash
sudo apt-get install -y nginx
```

Create `/etc/nginx/sites-available/9jawin`:
```nginx
upstream app {
    server localhost:5000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io {
        proxy_pass http://app/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable configuration:
```bash
sudo ln -s /etc/nginx/sites-available/9jawin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 10. Setup SSL Certificate (Let's Encrypt)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com
```

#### 11. Backup Strategy
```bash
# Daily database backup
0 2 * * * /usr/bin/mysqldump -u root -p'password' whot_game | gzip > /backups/whot_$(date +\%Y\%m\%d).sql.gz
```

## Performance Optimization

### Frontend
- Enable gzip compression
- Minify CSS and JavaScript
- Use CDN for static assets
- Lazy load images

### Backend
- Enable caching with Redis
- Database query optimization
- Connection pooling
- Load balancing

### Database
- Regular backups
- Index optimization
- Query optimization
- Replication for redundancy

## Monitoring & Maintenance

### Monitoring Tools
- PM2 Plus for process monitoring
- New Relic for APM
- DataDog for infrastructure

### Health Checks
```bash
# Check API health
curl http://localhost:5000/health

# Check database connection
npm run test:db

# Check Redis connection
npm run test:redis
```

### Log Rotation
```bash
sudo apt-get install -y logrotate
```

### Scaling

#### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Increase connection pool size

#### Horizontal Scaling
- Deploy multiple app instances
- Use load balancer (nginx, HAProxy)
- Share session with Redis
- Database replication

## Troubleshooting

### Database Connection Error
```bash
# Check MySQL is running
sudo systemctl status mysql

# Check credentials in .env
# Verify database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### Port Already in Use
```bash
# Find process using port
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

### Socket.IO Connection Failed
```bash
# Check socket server is running
netstat -an | grep 5001

# Verify CORS settings in .env
# Check firewall rules
```

### High Memory Usage
```bash
# Monitor memory
free -m

# Restart application
pm2 restart 9jawin

# Check for memory leaks
pm2 monit
```

## Updating Application

```bash
# Pull latest code
git pull origin main

# Install new dependencies
npm install

# Run migrations
npm run migrate

# Restart application
pm2 restart 9jawin
```

## Rollback

```bash
# Revert to previous version
git revert HEAD

# Restart application
pm2 restart 9jawin
```