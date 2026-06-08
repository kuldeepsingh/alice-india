# 🚀 Production Monitoring & Alerts Setup

Complete guide for setting up monitoring, alerts, and production infrastructure

---

## Overview

Your production system includes:
✅ Real-time analytics tracking  
✅ System health monitoring  
✅ Notification system  
✅ Alert management  
✅ Performance metrics  
✅ Cost tracking  
✅ User engagement analytics  

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Production System                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Backend (Node.js + Express)                            │
│  ├─ Analytics Service (track metrics)                    │
│  ├─ Notification Service (send alerts)                   │
│  ├─ Monitoring Routes (expose metrics)                   │
│  └─ WebSocket Server (real-time updates)                │
│                                                           │
│  Frontend (React)                                        │
│  ├─ System Health Dashboard                             │
│  ├─ Analytics Dashboard                                 │
│  ├─ Notification Center                                 │
│  └─ Alert Panel                                         │
│                                                           │
│  External Services (Optional)                            │
│  ├─ Prometheus (metrics collection)                      │
│  ├─ Grafana (visualization)                              │
│  └─ PagerDuty (incident management)                      │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Backend Setup

### 1. Install Dependencies

```bash
npm install socket.io         # For real-time notifications
npm install prometheus-client # For metrics export (optional)
npm install winston           # Enhanced logging
```

### 2. Configure Monitoring Services

```typescript
// src/index.ts

import { Server } from 'socket.io'
import { analyticsService } from './services/analytics-service'
import { notificationService } from './services/notification-service'
import monitoringRouter, { setupWebSocketMonitoring } from './routes/monitoring'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL }
})

// Setup WebSocket monitoring
setupWebSocketMonitoring(io)

// Setup monitoring routes
app.use('/api/v1/monitoring', monitoringRouter)

// Start server
httpServer.listen(3000, () => {
  console.log('✅ Monitoring server running on :3000')
  console.log('📊 Metrics: http://localhost:3000/api/v1/monitoring/health')
  console.log('🔔 WebSocket: ws://localhost:3000')
})
```

### 3. Integrate Analytics Recording

```typescript
// In your API routes

import { analyticsService } from '../services/analytics-service'

app.use((req, res, next) => {
  const startTime = Date.now()
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime
    analyticsService.recordAPICall(
      req.path,
      res.statusCode,
      responseTime,
      res.statusCode < 400
    )
  })
  
  next()
})
```

### 4. Send Notifications from Claude Calls

```typescript
// In claude-service.ts

import { notificationService } from './notification-service'

async validateSignal(userId, request) {
  try {
    const response = await claudeAPI.call(...)
    
    // Record analytics
    analyticsService.recordClaudeCall(
      'signal_validation',
      true,
      cost,
      responseTime,
      userId
    )
    
    return response
  } catch (error) {
    // Send alert notification
    notificationService.sendAnomalyAlert(
      userId,
      request.symbol,
      'Claude API Error',
      'critical'
    )
    
    throw error
  }
}
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
npm install socket.io-client  # WebSocket client
npm install recharts          # Charts
```

### 2. Create Production Dashboard

```typescript
// src/pages/ProductionDashboard.tsx

import { useEffect } from 'react'
import { SystemHealthDashboard } from '../components/monitoring/SystemHealthDashboard'
import { AnalyticsDashboard } from '../components/monitoring/AnalyticsDashboard'
import { NotificationCenter } from '../components/monitoring/NotificationCenter'
import { AlertPanel } from '../components/monitoring/AlertPanel'

export const ProductionDashboard = () => {
  useEffect(() => {
    // Real-time updates every 30 seconds
    const interval = setInterval(() => {
      // Dashboards auto-refresh
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="production-dashboard">
      <header>
        <h1>🔧 Production Monitoring</h1>
        <NotificationCenter />
      </header>

      <main>
        <div className="dashboard-grid">
          <aside>
            <SystemHealthDashboard />
            <AlertPanel />
          </aside>

          <section>
            <AnalyticsDashboard />
          </section>
        </div>
      </main>
    </div>
  )
}
```

### 3. Setup Real-time Notifications

```typescript
// src/hooks/useRealTimeMonitoring.ts

import { useEffect } from 'react'
import io from 'socket.io-client'

export const useRealTimeMonitoring = () => {
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
      query: {
        userId: localStorage.getItem('userId'),
      },
      auth: {
        token: localStorage.getItem('authToken'),
      },
    })

    // Listen for notifications
    socket.on('notification', (notification) => {
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/trading-bot.png',
        })
      }

      // Play sound for critical alerts
      if (notification.severity === 'critical') {
        playAlertSound()
      }

      // Update local state
      updateNotificationBadge()
    })

    // Listen for system alerts
    socket.on('system_alert', (alert) => {
      // Show system-wide banner
      showSystemAlert(alert)
    })

    return () => socket.disconnect()
  }, [])
}
```

---

## Monitoring Endpoints

### Health Check

```bash
curl http://localhost:3000/api/v1/monitoring/health \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "status": "healthy",
  "healthScore": 92,
  "metrics": {
    "activeUsers": 42,
    "premiumUsers": 8,
    "ordersCreated": 234,
    "tradesExecuted": 189,
    "avgResponseTime": 145,
    "claudeCallsTotal": 520,
    "claudeCostUSD": "0.40"
  }
}
```

### System Analytics

```bash
curl http://localhost:3000/api/v1/monitoring/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Notifications

```bash
# Get notifications
curl http://localhost:3000/api/v1/monitoring/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mark as read
curl -X POST http://localhost:3000/api/v1/monitoring/notifications/{id}/read \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mark all as read
curl -X POST http://localhost:3000/api/v1/monitoring/notifications/read-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Alerts

```bash
curl http://localhost:3000/api/v1/monitoring/alerts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Alert Thresholds

Configure these in your environment:

```env
# API Metrics
ALERT_API_ERROR_RATE_WARNING=0.1      # 10% error rate
ALERT_API_ERROR_RATE_CRITICAL=0.2     # 20% error rate
ALERT_RESPONSE_TIME_WARNING=5000       # 5 seconds
ALERT_RESPONSE_TIME_CRITICAL=10000     # 10 seconds

# Claude Metrics
ALERT_CLAUDE_DAILY_COST_WARNING=50     # $50/day
ALERT_CLAUDE_DAILY_COST_CRITICAL=100   # $100/day

# System Health
ALERT_HEALTH_SCORE_WARNING=60          # Score < 60
ALERT_HEALTH_SCORE_CRITICAL=40         # Score < 40
```

---

## Optional: Prometheus Integration

### 1. Install Prometheus Client

```bash
npm install prom-client
```

### 2. Export Metrics

```typescript
// src/services/prometheus-service.ts

import prometheus from 'prom-client'

export const metricsRegistry = new prometheus.Registry()

export const apiCallDuration = new prometheus.Histogram({
  name: 'api_call_duration_ms',
  help: 'API call duration in milliseconds',
  buckets: [10, 50, 100, 250, 500, 1000, 2000],
  registers: [metricsRegistry],
})

export const claudeApiCalls = new prometheus.Counter({
  name: 'claude_api_calls_total',
  help: 'Total Claude API calls',
  registers: [metricsRegistry],
})

export const activeUsers = new prometheus.Gauge({
  name: 'active_users',
  help: 'Number of active users',
  registers: [metricsRegistry],
})
```

### 3. Expose Metrics Endpoint

```typescript
// In your Express app

import { metricsRegistry } from './services/prometheus-service'

app.get('/metrics', (_req, res) => {
  res.set('Content-Type', metricsRegistry.contentType)
  res.end(metricsRegistry.metrics())
})
```

### 4. Configure Prometheus

```yaml
# prometheus.yml

global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'trading-bot'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

### 5. Configure Grafana

```bash
# Add Prometheus as data source
# Create dashboards for:
# - API Performance
# - Claude API Usage
# - System Health
# - User Activity
# - Cost Tracking
```

---

## Notification Types

### Order Notifications

```typescript
notificationService.sendOrderNotification(userId, orderId, 'created')
notificationService.sendOrderNotification(userId, orderId, 'executed')
notificationService.sendOrderNotification(userId, orderId, 'failed')
```

### Analysis Alerts

```typescript
notificationService.sendAnalysisReady(
  userId,
  'Strategy Review',
  resultId
)
```

### Risk Warnings

```typescript
notificationService.sendRiskWarning(
  userId,
  'High position concentration detected',
  'Consider reducing position size'
)
```

### Anomaly Alerts

```typescript
notificationService.sendAnomalyAlert(
  userId,
  'RELIANCE',
  'Price gap of 5%',
  'critical'
)
```

### Usage Warnings

```typescript
notificationService.sendUsageWarning(
  userId,
  creditsRemaining,
  monthlyLimit
)
```

---

## Logging Strategy

### Log Levels

```
DEBUG:   Detailed metrics, API calls
INFO:    Order creation, trade execution, analysis complete
WARNING: High error rate, cost spikes, quota warnings
ERROR:   API failures, data inconsistencies
CRITICAL: System outages, security issues
```

### Log Examples

```typescript
logger.info({
  type: 'order_created',
  userId: 'user-123',
  symbol: 'RELIANCE',
  quantity: 100,
  price: 2850,
  claudeValidationScore: 0.85,
  timestamp: new Date(),
})

logger.warn({
  type: 'high_api_error_rate',
  errorRate: 0.15,
  threshold: 0.10,
  action: 'ALERT_SENT',
  timestamp: new Date(),
})

logger.error({
  type: 'claude_api_failure',
  userId: 'user-456',
  useCase: 'signal_validation',
  error: 'API timeout',
  retryCount: 2,
  timestamp: new Date(),
})
```

---

## Deployment Checklist

```
BACKEND ✅
- [ ] Install all dependencies
- [ ] Configure environment variables
- [ ] Setup analytics service
- [ ] Setup notification service
- [ ] Configure WebSocket server
- [ ] Setup monitoring routes
- [ ] Add API metrics recording
- [ ] Configure alert thresholds
- [ ] Setup logging
- [ ] Test health endpoint

FRONTEND ✅
- [ ] Install monitoring components
- [ ] Setup real-time notifications
- [ ] Configure WebSocket client
- [ ] Add notification UI
- [ ] Create production dashboard
- [ ] Configure refresh intervals
- [ ] Add error boundaries
- [ ] Test all components

MONITORING (Optional) ✅
- [ ] Install Prometheus client
- [ ] Setup metrics endpoints
- [ ] Configure Prometheus
- [ ] Setup Grafana dashboards
- [ ] Configure alert rules
- [ ] Setup PagerDuty (if using)
- [ ] Test metric collection

PRODUCTION ✅
- [ ] Run health checks
- [ ] Monitor for 24 hours
- [ ] Setup backup alerting
- [ ] Document runbooks
- [ ] Schedule daily reviews
- [ ] Plan scaling strategy
- [ ] Monitor costs daily
```

---

## Daily Operations

### Morning Checklist

```
1. Check system health score (should be > 80)
2. Review overnight alerts
3. Check API error rates
4. Verify Claude API costs
5. Review user engagement metrics
6. Check for any anomalies
```

### Weekly Review

```
1. Analyze usage trends
2. Review cost projections
3. Check premium conversion rate
4. Review alert patterns
5. Plan capacity improvements
6. Update monitoring thresholds
```

### Monthly Review

```
1. Full system audit
2. Performance trend analysis
3. Cost optimization review
4. User feedback review
5. Security audit
6. Plan for next month
```

---

## Troubleshooting

### High API Error Rate

```
1. Check API logs for errors
2. Verify database connectivity
3. Check Claude API status
4. Review recent code changes
5. Check infrastructure resources
```

### High Claude Costs

```
1. Review token usage
2. Check for cached response rates
3. Optimize prompts
4. Review failed requests
5. Consider rate limiting
```

### Low User Engagement

```
1. Check onboarding flow
2. Review notification delivery
3. Verify premium features work
4. Check for bugs in UI
5. Survey users for feedback
```

---

## Success Metrics

Track these daily:

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Health Score | > 90 | 80-90 | < 80 |
| API Error Rate | < 1% | 1-5% | > 5% |
| Response Time | < 200ms | 200-500ms | > 500ms |
| Claude Success Rate | > 99% | 95-99% | < 95% |
| System Uptime | > 99.9% | 99-99.9% | < 99% |
| Daily Cost | < $10 | $10-25 | > $25 |
| User Growth | > 10% MoM | 5-10% | < 5% |
| Premium Conversion | > 25% | 15-25% | < 15% |

---

## Conclusion

You now have enterprise-grade production monitoring with:
✅ Real-time dashboards  
✅ Alert system  
✅ Analytics tracking  
✅ Notification management  
✅ Performance metrics  
✅ Cost transparency  

**System is production-ready!** 🚀

