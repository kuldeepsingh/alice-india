import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import pinoHttp from 'pino-http'
import logger from './services/logger.ts'
import authRouter from './routes/auth.ts'
import accountsRouter from './routes/accounts.ts'
import ordersRouter from './routes/orders.ts'
import marketDataRouter from './routes/market-data.ts'
// import logsRouter from './routes/logs.ts'  // TODO: Fix LoggingService import
// import errorsRouter from './routes/errors.ts'  // TODO: Fix ErrorService import
// import auditRouter from './routes/audit.ts'  // TODO: Fix AuditService import
// import debugRouter from './routes/debug.ts'  // TODO: Fix DebugService import
// import incidentsRouter from './routes/incidents.ts'  // TODO: Fix IncidentService import
// import notificationsRouter from './routes/notifications.ts'  // TODO: Fix imports
import teamRouter from './routes/team.ts'
// import metricsRouter from './routes/metrics.ts'  // TODO: Check imports
import tradingRouter from './routes/trading.ts'
import credentialsRouter from './routes/credentials.ts'
import marketAnalysisRouter from './routes/market-analysis.ts'
// import testingRouter from './routes/testing.ts'  // TODO: Check imports
import configRouter, { attachUserApiKeys } from './routes/config.ts'
import apiKeysRouter from './routes/api-keys.ts'
import { authMiddleware } from './middleware/auth.ts'
import {
  cacheResponseMiddleware,
  performanceTrackingMiddleware,
  cacheInvalidationMiddleware,
  cacheStatsMiddleware,
} from './middleware/cache-middleware.ts'

export function createApp() {
  const app = express()

  // Security
  app.use(helmet())

  // CORS Configuration - Allow specific origins
  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173,http://localhost:5174').split(',')
  app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID'],
  }))

  // Logging - Use compatible logger for pinoHttp middleware
  app.use(pinoHttp({ logger } as any))

  // Body parsing
  app.use(express.json())

  // Log capture middleware (must be early in chain)
  // app.use(logCaptureMiddleware())  // TODO: Fix log-capture middleware imports

  // Performance & Caching middleware
  app.use(performanceTrackingMiddleware())
  app.use(cacheStatsMiddleware())
  app.use(cacheResponseMiddleware(300)) // 5 minute cache for GET requests
  app.use(cacheInvalidationMiddleware())

  // Attach user API keys to request
  app.use(attachUserApiKeys)

  // Health check endpoints
  app.get('/health/live', (_req, res) => {
    res.json({ status: 'alive', timestamp: new Date().toISOString() })
  })

  app.get('/health/ready', (_req, res) => {
    res.json({ status: 'ready', timestamp: new Date().toISOString() })
  })

  // API v1 routes
  const v1 = express.Router()

  // Configuration routes (comes first - needed by other routes)
  v1.use('/config', configRouter)

  // User API Keys routes
  // Internal routes (backend-to-backend) - no auth required
  // Public routes - auth required via middleware in the router itself
  v1.use('/user/api-keys', apiKeysRouter)

  // Authentication routes
  v1.use('/auth', authRouter)

  // Account routes (protected)
  v1.use('/accounts', accountsRouter)

  // Order routes (protected)
  v1.use('/orders', ordersRouter)

  // Market data routes (some protected, some public)
  v1.use('/market', marketDataRouter)

  // Debugging & Monitoring routes (protected)
  // v1.use('/logs', logsRouter)  // TODO: Fix imports
  // v1.use('/errors', errorsRouter)  // TODO: Fix imports
  // v1.use('/audit', auditRouter)  // TODO: Fix imports
  // v1.use('/debug', debugRouter)  // TODO: Fix imports

  // Team Coordination routes (protected)
  // v1.use('/incidents', incidentsRouter)  // TODO: Fix imports
  // v1.use('/notifications', notificationsRouter)  // TODO: Fix imports
  v1.use('/team', teamRouter)

  // Metrics & Monitoring routes
  // v1.use('/metrics', metricsRouter)  // TODO: Fix imports

  // Trading routes - requires authentication
  v1.use('/trading', authMiddleware, tradingRouter)

  // Market analysis routes (Claude AI analysis) - requires authentication
  v1.use('/market-analysis', authMiddleware, marketAnalysisRouter)

  // Credentials routes
  v1.use('/credentials', credentialsRouter)

  // Testing routes
  // v1.use('/testing', testingRouter)  // TODO: Fix imports

  // Mount v1 API
  app.use('/api/v1', v1)

  // User registration (backward compatibility)
  app.post('/users/register', (req, res) => {
    res.status(201).json({
      id: 'uuid-placeholder',
      email: req.body?.email,
      role: 'trader',
      created_at: new Date().toISOString(),
    })
  })

  // Error logging middleware (must be last)
  // app.use(errorLoggingMiddleware())  // TODO: Fix log-capture middleware imports

  // Not found handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' })
  })

  return app
}
