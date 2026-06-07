# 🚀 Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] Code coverage > 80%
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] No console.logs in production code
- [ ] No hardcoded credentials

### Configuration
- [ ] `.env` file configured for production
- [ ] Database migrations ready
- [ ] Redis instance available
- [ ] SSL/TLS certificates obtained

### Security
- [ ] Security audit completed
- [ ] Dependencies updated
- [ ] Secrets configured in environment
- [ ] CORS properly configured
- [ ] Rate limiting configured

### Performance
- [ ] Frontend build optimized
- [ ] Backend code optimized
- [ ] Caching strategy implemented
- [ ] Database indexes created
- [ ] Load testing completed

## Environment Setup

### Production Environment Variables

Create `.env.production`:

```bash
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgres://user:password@prod-db.example.com:5432/bot_trade
DATABASE_POOL_MAX=20
DATABASE_POOL_IDLE_TIMEOUT=30000

# Cache
REDIS_URL=redis://prod-redis.example.com:6379

# JWT
JWT_SECRET=your-very-secret-key-here

# API
API_BASE_URL=https://api.bot-trade.com
CORS_ORIGINS=https://bot-trade.com,https://www.bot-trade.com

# Logging
LOG_LEVEL=info

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=notifications@bot-trade.com
SMTP_PASSWORD=smtp-password
```

### Database Setup

```bash
# Create production database
createdb bot_trade_prod

# Run migrations
DATABASE_URL=postgres://... npm run migrate

# Verify tables created
psql $DATABASE_URL -c "\dt"
```

### Redis Setup

**Option 1: Docker**
```bash
docker run -d \
  --name redis-prod \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7-alpine \
  redis-server --appendonly yes
```

**Option 2: Redis Cloud**
- Sign up at [redis.com](https://redis.com)
- Create production instance
- Note connection URL

## Deployment Strategies

### Strategy 1: Traditional VPS (Recommended for Small Scale)

#### Prerequisites
- Ubuntu 20.04+ or CentOS 8+
- 2GB+ RAM
- Node.js 18+
- PostgreSQL 13+

#### Steps

1. **SSH into server**
```bash
ssh root@your-server-ip
```

2. **Install dependencies**
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Redis
apt install -y redis-server
```

3. **Clone repository**
```bash
cd /opt
git clone https://github.com/kuldeepsingh/alice-india.git
cd alice-india
```

4. **Install dependencies**
```bash
npm install
cd admin-dashboard && npm install && cd ..
```

5. **Configure environment**
```bash
cp .env.example .env.production
nano .env.production  # Edit with production values
```

6. **Build frontend**
```bash
cd admin-dashboard
npm run build
cd ..
```

7. **Setup PM2 (Process Manager)**
```bash
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'bot-trade-api',
      script: './src/index.ts',
      interpreter: 'npx ts-node',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      time: true
    }
  ]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

8. **Setup Nginx (Reverse Proxy)**
```bash
apt install -y nginx

# Create Nginx config
cat > /etc/nginx/sites-available/bot-trade << 'EOF'
server {
    listen 80;
    server_name bot-trade.com www.bot-trade.com;

    # Frontend
    location / {
        root /opt/alice-india/admin-dashboard/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/bot-trade /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

9. **Setup SSL/TLS (Let's Encrypt)**
```bash
apt install -y certbot python3-certbot-nginx

certbot --nginx -d bot-trade.com -d www.bot-trade.com

# Auto-renew
certbot renew --dry-run
```

10. **Start services**
```bash
pm2 restart all
systemctl restart nginx
systemctl restart redis-server
systemctl restart postgresql
```

### Strategy 2: Docker Deployment

#### Prerequisites
- Docker & Docker Compose installed
- Docker Hub account (optional)

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: bot_trade
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@postgres:5432/bot_trade
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./logs:/app/logs

volumes:
  postgres_data:
  redis_data:
```

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
```

Deploy:

```bash
docker-compose up -d
```

### Strategy 3: Heroku Deployment

#### Prerequisites
- Heroku CLI installed
- Heroku account

#### Steps

```bash
# Login to Heroku
heroku login

# Create app
heroku create bot-trade-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0 -a bot-trade-api

# Add Redis
heroku addons:create heroku-redis:premium-0 -a bot-trade-api

# Set environment variables
heroku config:set NODE_ENV=production -a bot-trade-api
heroku config:set JWT_SECRET=your-secret-key -a bot-trade-api

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate -a bot-trade-api

# View logs
heroku logs --tail -a bot-trade-api
```

## Post-Deployment

### Verification

```bash
# Check API health
curl https://api.bot-trade.com/health/live

# Check database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# Check Redis
redis-cli ping

# Check logs
tail -f logs/out.log
```

### Monitoring

#### PM2 Monitoring
```bash
pm2 monit
pm2 logs
```

#### System Monitoring
```bash
# CPU & Memory
top

# Disk space
df -h

# Network
netstat -an
```

#### Application Monitoring

Setup application performance monitoring:

```bash
npm install --save newrelic
```

Configure `newrelic.js` and set `NEW_RELIC_LICENSE_KEY` environment variable.

## Scaling

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Upgrade database instance
- Increase Redis memory

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Run multiple API instances
- Database read replicas
- Redis clustering

## Backup & Recovery

### Database Backup

```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql

# Automated backup (daily)
0 2 * * * pg_dump $DATABASE_URL | gzip > backups/backup-$(date +\%Y\%m\%d).sql.gz
```

### Redis Backup

```bash
# Manual backup
redis-cli BGSAVE

# Configuration for AOF
# In redis.conf: appendonly yes
```

## Troubleshooting

### Common Issues

**API not responding:**
```bash
# Check if running
pm2 list

# Check logs
pm2 logs

# Restart
pm2 restart all
```

**Database connection failed:**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check environment variable
echo $DATABASE_URL

# Check credentials
psql -h host -U user -d database -c "SELECT 1;"
```

**High memory usage:**
```bash
# Monitor
pm2 monit

# Increase allowed memory
NODE_OPTIONS=--max-old-space-size=4096 pm2 start app.js
```

**Redis connection issues:**
```bash
# Test connection
redis-cli -u $REDIS_URL ping

# Check logs
redis-cli -u $REDIS_URL INFO server
```

## Performance Tuning

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Analyze table
ANALYZE users;
```

### Frontend Optimization

```bash
cd admin-dashboard

# Check bundle size
npm run build -- --analyze

# Optimize images
npx imagemin src/assets/images/*.{jpg,png} -o src/assets/images/
```

### Node.js Optimization

```bash
# Production flags
NODE_ENV=production node --max-http-header-size=16384 src/index.ts

# Use native modules where possible
npm install bcryptjs node-gyp
```

## Security Hardening

### Firewall Rules

```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Block everything else
ufw default deny incoming
ufw enable
```

### SSL/TLS Configuration

```nginx
# Nginx SSL config
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
```

### Rate Limiting

```bash
# Install fail2ban
apt install -y fail2ban

# Configure
systemctl enable fail2ban
systemctl start fail2ban
```

## Maintenance

### Regular Tasks

- [ ] Monitor error logs daily
- [ ] Check disk space weekly
- [ ] Review security logs weekly
- [ ] Update dependencies monthly
- [ ] Database maintenance monthly
- [ ] Security audit quarterly

### Backup Schedule

- Hourly: Redis snapshots
- Daily: Database backups
- Weekly: Full system backups
- Monthly: Off-site backups

## Support

For deployment issues, check:
- Application logs: `pm2 logs`
- System logs: `journalctl -xe`
- Database logs: `psql ... -c "SELECT * FROM pg_stat_statements;"`
- Redis logs: `redis-cli INFO`

See [README.md](../README.md) for additional resources.
