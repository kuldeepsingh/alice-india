# 🚀 Production Deployment Guide

Complete step-by-step guide to deploy your autonomous trading bot to production

---

## Pre-Deployment Checklist

### Environment Setup
- [ ] Get CLAUDE_API_KEY from https://console.anthropic.com/
- [ ] Have PostgreSQL database ready (or create new instance)
- [ ] Have Node.js 18+ installed
- [ ] Have git access
- [ ] Domain name ready (for frontend)
- [ ] SSL certificate (for HTTPS)

### Code Preparation
- [ ] All tests passing locally
- [ ] No uncommitted changes
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Build successful locally

---

## Phase 1: Local Testing (30 Minutes)

### Step 1.1: Backend Setup
```bash
cd /Users/kuldeep/projects/openalice-india

# Install dependencies
npm install

# Create .env file
cp .env.claude.example .env

# Edit .env with your settings
nano .env
# Add:
# CLAUDE_API_KEY=sk-ant-xxx
# DATABASE_URL=postgresql://user:pass@localhost:5432/trading_bot
# NODE_ENV=development
# PORT=3000
```

### Step 1.2: Database Setup
```bash
# Create database
createdb trading_bot

# Run migrations
npm run migrate

# Verify migrations
psql trading_bot -c "\dt"
# Should show: subscriptions, claude_decisions, order_claude_decisions, claude_usage_analytics
```

### Step 1.3: Start Backend
```bash
npm run dev

# Should see:
# ✅ Server running on http://localhost:3000
# ✅ Monitoring server running on :3000
# ✅ Metrics: http://localhost:3000/api/v1/monitoring/health
```

### Step 1.4: Test API
```bash
# Health check
curl http://localhost:3000/api/v1/monitoring/health \
  -H "Authorization: Bearer test-token"

# Should return healthy status
```

### Step 1.5: Frontend Setup
```bash
# In a new terminal, navigate to your frontend project
cd /path/to/your/frontend

# Copy components
cp /Users/kuldeep/projects/openalice-india/frontend-integration-guide.md .

# Install dependencies
npm install axios react-query recharts socket.io-client

# Create .env
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env.local

# Start frontend
npm run dev

# Should see frontend on http://localhost:5173
```

### Step 1.6: Test Integration
```bash
# Open http://localhost:5173 in browser
# Test these flows:
# 1. Login with test user
# 2. Create order with Claude validation
# 3. Check notifications
# 4. View health dashboard
# 5. Check analytics
```

---

## Phase 2: Production Deployment (1-2 Hours)

### Option A: AWS Deployment

#### Backend Deployment (EC2 + RDS)

**1. Create EC2 Instance**
```bash
# In AWS Console:
# 1. Launch EC2 instance (Ubuntu 22.04 LTS)
# 2. Security group: Open ports 22 (SSH), 3000 (API)
# 3. Create and download key pair
# 4. Get elastic IP
```

**2. Connect and Setup**
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-elastic-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y nodejs npm postgresql-client

# Clone repository
git clone https://github.com/yourusername/alice-india.git
cd alice-india

# Install Node dependencies
npm install

# Create .env
sudo nano .env
# Add production settings
```

**3. Create RDS Database**
```bash
# In AWS Console:
# 1. Create RDS PostgreSQL instance
# 2. Security group: Allow inbound on port 5432 from EC2 SG
# 3. Set master password
# 4. Get endpoint: your-db-instance.xxx.amazonaws.com
```

**4. Run Database Migrations**
```bash
# From EC2 instance
export DATABASE_URL="postgresql://admin:password@your-db-instance.xxx.amazonaws.com:5432/trading_bot"

npm run migrate

# Verify
psql $DATABASE_URL -c "\dt"
```

**5. Setup PM2 for Process Management**
```bash
# Install PM2
sudo npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'trading-bot-api',
    script: './src/index.ts',
    interpreter: './node_modules/.bin/ts-node',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js

# Setup auto-restart on reboot
pm2 startup
pm2 save
```

**6. Setup Nginx Reverse Proxy**
```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/trading-bot

# Add this:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /monitoring/health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/trading-bot /etc/nginx/sites-enabled/

# Test and start
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
```

**7. Setup SSL with Let's Encrypt**
```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

#### Frontend Deployment (Vercel/Netlify)

**1. Build Frontend**
```bash
cd /path/to/frontend

# Create production build
npm run build

# Test build locally
npm run preview
```

**2. Deploy to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# VITE_API_URL=https://your-domain.com/api/v1
```

OR **Deploy to Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

### Option B: Docker + Docker Compose

**1. Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
```

**2. Create docker-compose.yml**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: trading_bot
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: .
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/trading_bot
      CLAUDE_API_KEY: ${CLAUDE_API_KEY}
      NODE_ENV: production
    ports:
      - "3000:3000"
    volumes:
      - ./logs:/app/logs

volumes:
  postgres_data:
```

**3. Deploy with Docker**
```bash
# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f api

# Run migrations
docker-compose exec api npm run migrate
```

---

## Phase 3: Verification (30 Minutes)

### Backend Verification

```bash
# 1. Health Check
curl https://your-domain.com/api/v1/monitoring/health \
  -H "Authorization: Bearer test-token"

# Expected: { "status": "healthy", "healthScore": 90+ }

# 2. Database Connection
# Should respond with database metrics

# 3. Claude API
# Test signal validation endpoint

# 4. SSL Certificate
# Visit https://your-domain.com in browser
# Should show green lock icon
```

### Frontend Verification

```bash
# 1. Visit https://your-domain.com
# 2. Test login
# 3. Create test order with Claude validation
# 4. Check notifications
# 5. View health dashboard
# 6. Test WebSocket (real-time updates)
```

### Monitoring Setup

```bash
# 1. Login to your-domain.com/monitoring
# 2. View system health dashboard
# 3. Check for any alerts
# 4. Review analytics
# 5. Test notification system
```

---

## Phase 4: Post-Deployment (Ongoing)

### Daily Monitoring

**Morning Checklist (5 minutes)**
```bash
# Check health
curl https://your-domain.com/api/v1/monitoring/health

# Verify no critical alerts
# Check error logs
# Confirm all services running
# Review user metrics
```

**Health Metrics to Watch**
```
Health Score:     Should be > 80
API Error Rate:   Should be < 1%
Response Time:    Should be < 200ms
Claude API:       Should be > 99% success
Uptime:          Should be > 99.9%
Daily Cost:      Should be < $10
```

### Weekly Review (30 minutes)

```
1. Review error logs
2. Check resource usage
3. Analyze user metrics
4. Review costs
5. Check for updates
6. Plan capacity improvements
```

### Monitoring Dashboard

Access daily at: `https://your-domain.com/monitoring`

Check:
- System health score
- Active users
- API performance
- Claude API usage
- Cost breakdown
- Recent alerts

---

## Troubleshooting

### Backend Issues

**High CPU Usage**
```bash
# Check processes
top

# Check Node memory
node -e "console.log(process.memoryUsage())"

# Increase memory if needed
NODE_OPTIONS="--max-old-space-size=4096"
```

**Database Connection Issues**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
ps aux | grep postgres
```

**Claude API Errors**
```bash
# Check API key
echo $CLAUDE_API_KEY

# Check rate limits
curl https://api.anthropic.com/api/status \
  -H "Authorization: Bearer $CLAUDE_API_KEY"
```

### Frontend Issues

**WebSocket Connection Failed**
```
Check:
1. WebSocket URL in env
2. CORS settings on backend
3. Firewall rules
4. Browser console for errors
```

**Slow Performance**
```
Check:
1. Network tab in DevTools
2. API response times
3. Bundle size
4. Cache settings
```

---

## Security Checklist

- [ ] HTTPS enabled with valid certificate
- [ ] Strong database passwords set
- [ ] API keys stored in environment variables only
- [ ] Firewall rules configured (allow only necessary ports)
- [ ] Regular backups scheduled
- [ ] Logs monitored for suspicious activity
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] SQL injection protection enabled
- [ ] XSS protection enabled

---

## Scaling Guide

### When to Scale Up

```
When Health Score < 80:
1. Check error rates
2. Monitor resource usage
3. Increase instance size or add instances

When Response Time > 500ms:
1. Check database performance
2. Check Claude API latency
3. Add caching layer or CDN

When Daily Cost > $25:
1. Review Claude API usage
2. Optimize prompts
3. Increase cache TTL
4. Consider rate limiting
```

### Scaling Options

**Vertical Scaling (increase resources)**
```bash
# Upgrade EC2 instance type
# Increase database memory
# Increase cache size
```

**Horizontal Scaling (add instances)**
```bash
# Add more EC2 instances
# Setup load balancer (AWS ELB)
# Update RDS for Multi-AZ
```

**Caching Layer**
```bash
# Add Redis for session caching
# Setup CDN for static assets
# Increase API response caching
```

---

## Cost Optimization

### Current Costs (Monthly Estimate)

```
AWS EC2 (t3.medium):        $32
AWS RDS (db.t3.micro):      $15
Claude API (500 req/user):  $0.40 per user
Domain & SSL:               Free (Let's Encrypt)
Bandwidth:                  Minimal (within free tier)

TOTAL PER USER:             ~$8-10/month
REVENUE PER USER:           ₹1,999 (~$24)
PROFIT MARGIN:              98%+
```

### Cost Reduction Tips

```
1. Use spot instances for non-critical workloads
2. Setup auto-scaling based on load
3. Cache Claude responses aggressively
4. Use CDN for static files
5. Archive old logs
6. Clean up unused resources
```

---

## Production Deployment Checklist

```
BACKEND ✅
- [ ] Environment configured
- [ ] Database setup and migrated
- [ ] SSL certificate installed
- [ ] Reverse proxy configured
- [ ] Process manager setup (PM2)
- [ ] Logs configured
- [ ] Health check endpoint working
- [ ] Monitoring dashboard accessible
- [ ] Backups scheduled
- [ ] Alerts configured

FRONTEND ✅
- [ ] Build successful
- [ ] Environment variables set
- [ ] Deployed to CDN
- [ ] SSL working
- [ ] API connection working
- [ ] WebSocket connection working
- [ ] Notifications working
- [ ] Performance optimized
- [ ] Error tracking enabled

MONITORING ✅
- [ ] Health checks running
- [ ] Metrics being collected
- [ ] Alerts configured
- [ ] Logs being streamed
- [ ] Uptime monitoring active
- [ ] Cost tracking enabled
- [ ] Analytics enabled

SECURITY ✅
- [ ] HTTPS enabled
- [ ] Firewall configured
- [ ] API keys secured
- [ ] Database backed up
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] Input validation
- [ ] Error handling

TEAM ✅
- [ ] Deployment runbook documented
- [ ] Team trained on operations
- [ ] On-call schedule established
- [ ] Incident procedures documented
- [ ] Rollback procedures tested
```

---

## Success! 🎉

Your system is now live in production!

**What's Running:**
- ✅ Autonomous trading bot with Claude AI
- ✅ Real-time monitoring dashboard
- ✅ Notification system
- ✅ Premium tier monetization
- ✅ Analytics and reporting

**Next Steps:**
1. Monitor for 24 hours
2. Invite beta users
3. Collect feedback
4. Optimize based on usage
5. Scale as needed

---

## Support

For issues, check:
1. Health endpoint: `/api/v1/monitoring/health`
2. Logs: Check application logs
3. Database: Verify connection
4. Claude API: Check service status
5. Documentation: Review guides

**You're live!** 🚀

