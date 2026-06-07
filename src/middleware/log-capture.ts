/**
 * Log Capture Middleware
 * Captures all HTTP requests and responses, creates structured logs
 */

import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { LoggingService } from '../services/logging-service.ts'
import { DebugService } from '../services/debug-service.ts'
import { logger } from '../services/logger.ts'

/**
 * Extend Express Request to include custom properties
 */
declare global {
  namespace Express {
    interface Request {
      correlationId?: string
      logLevel?: string
      startTime?: number
    }
  }
}

/**
 * Log capture middleware - logs all requests and responses
 */
export function logCaptureMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Generate correlation ID for request tracing
    req.correlationId = req.headers['x-correlation-id'] as string || uuidv4()

    // Get user ID from JWT token (if available)
    const userId = (req as any).user?.id

    // Get user's log level from debug sessions
    if (userId) {
      req.logLevel = await DebugService.getUserLogLevel(userId)
    } else {
      req.logLevel = 'INFO'
    }

    // Get IP address (behind proxy-safe)
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown'

    // Record request start time
    req.startTime = Date.now()

    // Log request
    const logInput = {
      level: 'DEBUG' as const,
      message: `${req.method} ${req.path}`,
      userId,
      correlationId: req.correlationId,
      module: 'http',
      context: {
        method: req.method,
        path: req.path,
        query: req.query,
        headers: {
          'user-agent': req.headers['user-agent'],
          'content-type': req.headers['content-type'],
        },
        ip: ipAddress,
      },
      ipAddress,
      requestId: req.correlationId,
    }

    try {
      // Store log entry
      await LoggingService.storeLog(logInput)
    } catch (error) {
      logger.error({
        type: 'request_log_failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }

    // Intercept response to log response data
    const originalSend = res.send
    let responseLogged = false

    res.send = function (data: any) {
      if (!responseLogged) {
        responseLogged = true

        const duration = Date.now() - (req.startTime || Date.now())

        // Log response
        const responseLogInput = {
          level: res.statusCode >= 400 ? ('ERROR' as const) : ('DEBUG' as const),
          message: `${req.method} ${req.path} - ${res.statusCode}`,
          userId,
          correlationId: req.correlationId,
          module: 'http-response',
          context: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            durationMs: `${duration}ms`,
            responseSize: typeof data === 'string' ? data.length : JSON.stringify(data).length,
          },
          ipAddress,
          requestId: req.correlationId,
        }

        LoggingService.storeLog(responseLogInput).catch((error) => {
          logger.error({
            type: 'response_log_failed',
            error: error instanceof Error ? error.message : String(error),
          })
        })

        // Log slow requests (> 1 second)
        if (duration > 1000) {
          logger.warn({
            type: 'slow_request',
            method: req.method,
            path: req.path,
            duration,
            correlationId: req.correlationId,
          })
        }

        // Log errors
        if (res.statusCode >= 500) {
          logger.error({
            type: 'api_error',
            statusCode: res.statusCode,
            method: req.method,
            path: req.path,
            correlationId: req.correlationId,
          })
        }
      }

      return originalSend.call(this, data)
    }

    // Add correlation ID to response headers
    res.setHeader('X-Correlation-ID', req.correlationId)

    next()
  }
}

/**
 * Error logging middleware - logs unhandled errors
 */
export function errorLoggingMiddleware() {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id
    const correlationId = req.correlationId || uuidv4()
    const duration = req.startTime ? Date.now() - req.startTime : 0

    const errorContext = {
      method: req.method,
      path: req.path,
      statusCode: err.statusCode || 500,
      message: err.message,
      stack: err.stack,
      duration,
      correlationId,
    }

    logger.error({
      type: 'unhandled_error',
      error: err.message,
      context: errorContext,
    })

    // Try to log to database
    LoggingService.storeLog({
      level: 'ERROR',
      message: `Error: ${err.message}`,
      userId,
      correlationId,
      module: 'error-handler',
      context: errorContext,
      stackTrace: err.stack,
      requestId: correlationId,
    }).catch((dbError) => {
      logger.error({
        type: 'error_log_failed',
        error: dbError instanceof Error ? dbError.message : String(dbError),
      })
    })

    res.setHeader('X-Correlation-ID', correlationId)
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message,
      correlationId,
      timestamp: new Date().toISOString(),
    })
  }
}
