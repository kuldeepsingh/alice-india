import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import pinoHttp from 'pino-http'
import { logger } from './services/logger.ts'  // Use named import for actual Logger instance
import authRouter from './routes/auth.ts'
import accountsRouter from './routes/accounts.ts'
import ordersRouter from './routes/orders.ts'
import marketDataRouter from './routes/market-data.ts'
import logsRouter from './routes/logs.ts'
import zerodhaRouter from './routes/zerodha.ts'
import auditRouter from './routes/audit.ts'
// import errorsRouter from './routes/errors.ts'  // TODO: Fix ErrorService import
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

  // Logging middleware
  // Note: pinoHttp requires strict pino logger interface
  // Since we have our own comprehensive logging (src/services/logger.ts),
  // we use custom HTTP request logging instead
  // Uncomment below if you want to use pinoHttp with a real pino logger
  // app.use(pinoHttp({ logger } as any))

  // Custom HTTP request logging middleware - Log all API calls with comprehensive details
  app.use((req, res, next) => {
    const start = Date.now()
    const requestId = `http-${Date.now()}`
    let responseBody: any = null

    // Intercept res.json to capture response body
    const originalJson = res.json.bind(res)
    res.json = function (data: any) {
      responseBody = data
      return originalJson(data)
    }

    // Also intercept res.send for edge cases
    const originalSend = res.send.bind(res)
    res.send = function (data: any) {
      if (typeof data === 'string') {
        try {
          responseBody = JSON.parse(data)
        } catch (e) {
          responseBody = { message: data }
        }
      }
      return originalSend(data)
    }

    res.on('finish', () => {
      const duration = Date.now() - start
      const isError = res.statusCode >= 400
      const isWarn = res.statusCode >= 300 && res.statusCode < 400
      const logLevel = isError ? 'error' : isWarn ? 'warn' : 'info'


      // Build comprehensive context
      // Use originalUrl to get full path (req.path might be relative in nested routers)
      const fullPath = req.originalUrl?.split('?')[0] || req.path
      const context: any = {
        requestId,
        method: req.method,
        path: fullPath,
        statusCode: res.statusCode,
        duration,
        durationMs: `${duration}ms`,
        userAgent: req.get('user-agent') || 'unknown',
        ip: req.ip,
      }

      // Add auth info if available
      if ((req as any).user) {
        context.userId = (req as any).user.id
        context.userEmail = (req as any).user.email
        context.userRole = (req as any).user.role
      }

      // Add error details if error response
      if (isError && responseBody) {
        context.errorMessage = responseBody.message || responseBody.error || responseBody.errorMessage
        context.reason = responseBody.reason
        context.errorStatus = responseBody.status
        if (responseBody.correlationId) {
          context.correlationId = responseBody.correlationId
        }
      }

      // Add query params if present
      if (Object.keys(req.query).length > 0) {
        context.query = req.query
      }

      // Add body for POST/PUT (sanitized)
      if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
        const sanitized = { ...req.body }
        delete sanitized.password
        delete sanitized.token
        delete sanitized.secret
        if (Object.keys(sanitized).length > 0) {
          context.bodyParams = Object.keys(sanitized)
        }
      }

      // Construct meaningful message
      let message = `${req.method} ${fullPath} → ${res.statusCode}`
      if (context.errorMessage) {
        message += ` - ${context.errorMessage}`
      }

// Log appropriately based on level
      if (logLevel === 'error') {
        logger.error('HTTPServer', message, undefined, context)
      } else if (logLevel === 'warn') {
        logger.warn('HTTPServer', message, context)
      } else {
        logger.info('HTTPServer', message, context)
      }
    })
    next()
  })

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
  v1.use('/accounts', accountsRouter as any)

  // Zerodha integration routes (protected)
  v1.use('/zerodha', authMiddleware as any, zerodhaRouter as any)

  // Order routes (protected)
  v1.use('/orders', ordersRouter as any)

  // Market data routes (some protected, some public)
  v1.use('/market', marketDataRouter as any)

  // Debugging & Monitoring routes
  // Note: Individual endpoints have their own auth/RBAC via requireAdmin(), requireDeveloper(), etc.
  v1.use('/logs', logsRouter as any)  // Logs API - displays all application logs
  v1.use('/audit', auditRouter as any)  // Audit Trail API - immutable audit logs
  // v1.use('/errors', errorsRouter)  // TODO: Fix imports
  // v1.use('/debug', debugRouter)  // TODO: Fix imports

  // Team Coordination routes (protected)
  // v1.use('/incidents', incidentsRouter)  // TODO: Fix imports
  // v1.use('/notifications', notificationsRouter)  // TODO: Fix imports
  v1.use('/team', teamRouter as any)

  // Metrics & Monitoring routes
  // v1.use('/metrics', metricsRouter)  // TODO: Fix imports

  // Trading routes - requires authentication
  v1.use('/trading', authMiddleware as any, tradingRouter as any)

  // Market analysis routes (Claude AI analysis) - requires authentication
  v1.use('/market-analysis', authMiddleware as any, marketAnalysisRouter as any)

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
