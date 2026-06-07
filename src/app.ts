import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import pinoHttp from 'pino-http'
import { logger } from './services/logger.ts'
import authRouter from './routes/auth.ts'
import accountsRouter from './routes/accounts.ts'
import ordersRouter from './routes/orders.ts'
import marketDataRouter from './routes/market-data.ts'
import logsRouter from './routes/logs.ts'
import errorsRouter from './routes/errors.ts'
import auditRouter from './routes/audit.ts'
import debugRouter from './routes/debug.ts'
import incidentsRouter from './routes/incidents.ts'
import notificationsRouter from './routes/notifications.ts'
import teamRouter from './routes/team.ts'
import metricsRouter from './routes/metrics.ts'
import { logCaptureMiddleware, errorLoggingMiddleware } from './middleware/log-capture.ts'
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
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))

  // Logging
  app.use(pinoHttp({ logger }))

  // Body parsing
  app.use(express.json())

  // Log capture middleware (must be early in chain)
  app.use(logCaptureMiddleware())

  // Performance & Caching middleware
  app.use(performanceTrackingMiddleware())
  app.use(cacheStatsMiddleware())
  app.use(cacheResponseMiddleware(300)) // 5 minute cache for GET requests
  app.use(cacheInvalidationMiddleware())

  // Health check endpoints
  app.get('/health/live', (_req, res) => {
    res.json({ status: 'alive', timestamp: new Date().toISOString() })
  })

  app.get('/health/ready', (_req, res) => {
    res.json({ status: 'ready', timestamp: new Date().toISOString() })
  })

  // API v1 routes
  const v1 = express.Router()

  // Authentication routes
  v1.use('/auth', authRouter)

  // Account routes (protected)
  v1.use('/accounts', accountsRouter)

  // Order routes (protected)
  v1.use('/orders', ordersRouter)

  // Market data routes (some protected, some public)
  v1.use('/market', marketDataRouter)

  // Debugging & Monitoring routes (protected)
  v1.use('/logs', logsRouter)
  v1.use('/errors', errorsRouter)
  v1.use('/audit', auditRouter)
  v1.use('/debug', debugRouter)

  // Team Coordination routes (protected)
  v1.use('/incidents', incidentsRouter)
  v1.use('/notifications', notificationsRouter)
  v1.use('/team', teamRouter)

  // Metrics & Monitoring routes
  v1.use('/metrics', metricsRouter)

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
  app.use(errorLoggingMiddleware())

  // Not found handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' })
  })

  return app
}
