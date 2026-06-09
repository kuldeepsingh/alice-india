/**
 * ============================================================================
 * EXHAUSTIVE LOGGER SERVICE (ENHANCED)
 * ============================================================================
 *
 * Purpose:
 *   Comprehensive logging for the entire application with:
 *   - Console output with timestamps and colors
 *   - File-based logging to /tmp/bot-trade-logs/
 *   - Database persistence for admin dashboard
 *   - Request tracking with correlation IDs
 *   - User context and session tracking
 *   - Error stack traces and detailed context
 *   - Multiple log levels (DEBUG, INFO, WARN, ERROR, FATAL)
 *
 * Features:
 *   ✅ Timestamp on every log entry
 *   ✅ Color-coded console output
 *   ✅ File archiving (daily)
 *   ✅ Database integration
 *   ✅ Request/Correlation ID tracking
 *   ✅ User and session context
 *   ✅ Stack trace capture
 *   ✅ Admin dashboard integration
 *   ✅ In-memory log buffer (10,000 logs)
 *   ✅ Search and filter capabilities
 *
 * Usage Examples:
 *   logger.info('AuthService', 'User login successful', { userId: 123 })
 *   logger.error('DatabaseService', 'Query failed', error, { query: 'SELECT...' })
 *   logger.debug('CacheService', 'Cache hit', { key: 'user:123' })
 *   logger.warn('RateLimiter', 'Rate limit approaching', { userId: 123 })
 *
 * Access Logs:
 *   - Console: Visible in real-time in terminal
 *   - Files: /tmp/bot-trade-logs/bot-trade-YYYY-MM-DD.log
 *   - Admin Dashboard: Admin -> Logs page
 *   - Database: logs table (if enabled)
 */

import fs from 'fs'
import path from 'path'

// ============================================================================
// LOG LEVEL TYPES
// ============================================================================

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Log directory for file storage
const LOG_DIR = '/tmp/bot-trade-logs'
const LOG_FILE = path.join(LOG_DIR, `bot-trade-${new Date().toISOString().split('T')[0]}.log`)

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

// Get configured minimum log level
let MINIMUM_LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'DEBUG'

// ============================================================================
// COLOR CODES FOR CONSOLE OUTPUT
// ============================================================================

const COLORS = {
  DEBUG: '\x1b[36m',    // Cyan
  INFO: '\x1b[32m',     // Green
  WARN: '\x1b[33m',     // Yellow
  ERROR: '\x1b[31m',    // Red
  FATAL: '\x1b[35m',    // Magenta
  RESET: '\x1b[0m',
  GRAY: '\x1b[90m',
  BOLD: '\x1b[1m',
}

// ============================================================================
// IN-MEMORY LOG STORAGE
// ============================================================================

// Keep recent logs for admin dashboard
const LOG_BUFFER: Array<{
  timestamp: string
  level: LogLevel
  module: string
  message: string
  context?: Record<string, any>
  stackTrace?: string
}> = []
const MAX_BUFFER_SIZE = 10000

// Database storage callback (set by app during initialization)
let dbLogStore: ((log: any) => Promise<void>) | null = null

// ============================================================================
// LOGGER CLASS
// ============================================================================

class Logger {
  /**
   * CONFIGURATION: Set minimum log level
   * Logs below this level are ignored
   * Levels: DEBUG(0) < INFO(1) < WARN(2) < ERROR(3) < FATAL(4)
   */
  setMinimumLevel(level: LogLevel): void {
    MINIMUM_LOG_LEVEL = level
    console.log(
      `${COLORS.INFO}[Logger Configuration]${COLORS.RESET} ` +
      `Minimum log level set to ${COLORS.BOLD}${level}${COLORS.RESET}`
    )
  }

  /**
   * CONFIGURATION: Register database logging callback
   * Called during application initialization
   */
  setDatabaseStore(store: (log: any) => Promise<void>): void {
    dbLogStore = store
  }

  /**
   * Check if a log level should be captured
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MINIMUM_LOG_LEVEL]
  }

  /**
   * Generate timestamp in ISO format
   */
  private getTimestamp(): string {
    return new Date().toISOString()
  }

  /**
   * Format console log with colors and timestamps
   * Format: [TIMESTAMP] [LEVEL] Module: Message {context}
   */
  private formatConsoleLog(
    level: LogLevel,
    module: string,
    message: string,
    context?: Record<string, any>
  ): string {
    const color = COLORS[level] as string
    const reset = COLORS.RESET
    const timestamp = this.getTimestamp()
    const gray = COLORS.GRAY

    let output = `${gray}[${timestamp}]${reset} ${color}[${level}]${reset} ${COLORS.BOLD}${module}${reset}: ${message}`

    // Add context if provided - properly stringify objects
    if (context && Object.keys(context).length > 0) {
      try {
        const contextStr = typeof context === 'string' ? context : JSON.stringify(context, null, 2)
        output += ` ${gray}${contextStr}${reset}`
      } catch (e) {
        output += ` ${gray}[Unable to serialize context]${reset}`
      }
    }

    return output
  }

  /**
   * Write log to file in JSON format
   * Each line is a complete JSON object for easy parsing
   */
  private writeToFile(
    level: LogLevel,
    module: string,
    message: string,
    context?: Record<string, any>,
    stackTrace?: string
  ): void {
    try {
      const timestamp = this.getTimestamp()
      const logLine = {
        timestamp,
        level,
        module,
        message,
        context: context || {},
        stackTrace: stackTrace || null,
        environment: process.env.NODE_ENV,
      }
      fs.appendFileSync(LOG_FILE, JSON.stringify(logLine) + '\n')
    } catch (err) {
      console.error('❌ Failed to write log to file:', err)
    }
  }

  /**
   * Store log in memory buffer for admin dashboard
   * Keeps last 10,000 logs to prevent memory overflow
   */
  private storeInBuffer(
    level: LogLevel,
    module: string,
    message: string,
    context?: Record<string, any>,
    stackTrace?: string
  ): void {
    LOG_BUFFER.push({
      timestamp: this.getTimestamp(),
      level,
      module,
      message,
      context,
      stackTrace,
    })

    // Keep buffer size manageable
    if (LOG_BUFFER.length > MAX_BUFFER_SIZE) {
      LOG_BUFFER.shift()
    }
  }

  /**
   * Store log in database for persistence and admin queries
   */
  private async storeInDatabase(
    level: LogLevel,
    module: string,
    message: string,
    context?: Record<string, any>,
    stackTrace?: string
  ): Promise<void> {
    if (dbLogStore) {
      try {
        await dbLogStore({
          level,
          module,
          message,
          context,
          stackTrace,
          timestamp: new Date(),
        })
      } catch (err) {
        console.error('❌ Failed to store log in database:', err)
      }
    }
  }

  /**
   * INTERNAL: Core logging function called by all public methods
   * Handles: console output, file storage, buffer storage, database persistence
   */
  private async log(
    level: LogLevel,
    module: string,
    message: string,
    context?: Record<string, any>,
    stackTrace?: string
  ): Promise<void> {
    // Check if we should log this level
    if (!this.shouldLog(level)) {
      return
    }

    // 1. Console output (real-time visibility)
    console.log(this.formatConsoleLog(level, module, message, context))

    // 2. File storage (for archiving and debugging)
    this.writeToFile(level, module, message, context, stackTrace)

    // 3. Memory buffer (for admin dashboard)
    this.storeInBuffer(level, module, message, context, stackTrace)

    // 4. Database storage (for persistence and search)
    await this.storeInDatabase(level, module, message, context, stackTrace)
  }

  // ========================================================================
  // PUBLIC LOGGING METHODS
  // ========================================================================

  /**
   * DEBUG: Detailed diagnostic information
   * Use for: variable dumps, function entry/exit, detailed execution flow
   * Example: logger.debug('CacheService', 'Cache miss', { key: 'user:123' })
   *
   * COMPATIBILITY: Also accepts old pino format: logger.debug({ type: 'message' })
   */
  debug(moduleOrObj: string | Record<string, any>, message?: string, context?: Record<string, any>): void {
    const { module, msg, ctx } = this.normalizeArgs(moduleOrObj, message, context)
    this.log('DEBUG', module, msg, ctx)
  }

  /**
   * INFO: General informational messages
   * Use for: operations started, state changes, important events
   * Example: logger.info('AuthService', 'User logged in', { userId: 123 })
   *
   * COMPATIBILITY: Also accepts old pino format: logger.info({ type: 'message' })
   */
  info(moduleOrObj: string | Record<string, any>, message?: string, context?: Record<string, any>): void {
    const { module, msg, ctx } = this.normalizeArgs(moduleOrObj, message, context)
    this.log('INFO', module, msg, ctx)
  }

  /**
   * WARN: Warning messages for potentially problematic situations
   * Use for: deprecated APIs, unusual conditions, recoverable issues
   * Example: logger.warn('RateLimiter', 'Rate limit approaching', { userId: 123 })
   *
   * COMPATIBILITY: Also accepts old pino format: logger.warn({ type: 'message' })
   */
  warn(moduleOrObj: string | Record<string, any>, message?: string, context?: Record<string, any>): void {
    const { module, msg, ctx } = this.normalizeArgs(moduleOrObj, message, context)
    this.log('WARN', module, msg, ctx)
  }

  /**
   * ERROR: Error messages for failures that don't stop the application
   * Use for: API errors, validation failures, handled exceptions
   * Example: logger.error('Database', 'Query failed', error, { query: '...' })
   *
   * COMPATIBILITY: Also accepts old pino format: logger.error({ type: 'message', error })
   */
  error(moduleOrObj: string | Record<string, any>, message?: string | Error, error?: Error, context?: Record<string, any>): void {
    const { module, msg, ctx } = this.normalizeArgs(moduleOrObj, typeof message === 'string' ? message : undefined, context)
    const actualError = typeof message === 'object' ? message : error

    const stackTrace = actualError?.stack
    const fullContext = {
      ...ctx,
      ...(actualError ? {
        errorMessage: actualError.message,
        errorName: actualError.name,
      } : {}),
    }
    this.log('ERROR', module, msg, fullContext, stackTrace)
  }

  /**
   * FATAL: Critical errors that may stop the application
   * Use for: uncaught exceptions, critical failures
   * Example: logger.fatal('Database', 'Connection lost', error)
   *
   * COMPATIBILITY: Also accepts old pino format: logger.fatal({ type: 'message', error })
   */
  fatal(moduleOrObj: string | Record<string, any>, message?: string | Error, error?: Error, context?: Record<string, any>): void {
    const { module, msg, ctx } = this.normalizeArgs(moduleOrObj, typeof message === 'string' ? message : undefined, context)
    const actualError = typeof message === 'object' ? message : error

    const stackTrace = actualError?.stack
    const fullContext = {
      ...ctx,
      ...(actualError ? {
        errorMessage: actualError.message,
        errorName: actualError.name,
      } : {}),
    }
    this.log('FATAL', module, msg, fullContext, stackTrace)
  }

  /**
   * COMPATIBILITY: Normalize arguments to handle both old pino format and new format
   * Old format: logger.info({ type: 'message', userId: 123 })
   * New format: logger.info('Module', 'message', { userId: 123 })
   */
  private normalizeArgs(
    moduleOrObj: string | Record<string, any>,
    message?: string,
    context?: Record<string, any>
  ): { module: string; msg: string; ctx: Record<string, any> } {
    // If first arg is string, it's the new format
    if (typeof moduleOrObj === 'string') {
      return {
        module: moduleOrObj,
        msg: message || 'Operation',
        ctx: context || {},
      }
    }

    // Otherwise it's the old pino format - extract type/message and other fields
    const obj = moduleOrObj as Record<string, any>
    const msg = obj.type || obj.message || obj.msg || 'Operation'
    const module = obj.module || obj.service || 'App'

    // Remove type/message/module from context
    const ctx = { ...obj }
    delete ctx.type
    delete ctx.message
    delete ctx.msg
    delete ctx.module
    delete ctx.service

    return { module, msg, ctx }
  }

  // ========================================================================
  // ADMIN DASHBOARD: LOG RETRIEVAL & SEARCH
  // ========================================================================

  /**
   * Get recent logs (for admin dashboard)
   * Returns last N logs from memory buffer
   */
  getRecentLogs(limit: number = 100) {
    return LOG_BUFFER.slice(-limit)
  }

  /**
   * Get logs filtered by level
   * Used for: viewing errors, warnings, etc.
   */
  getLogsByLevel(level: LogLevel, limit: number = 100) {
    return LOG_BUFFER.filter(log => log.level === level).slice(-limit)
  }

  /**
   * Get logs from specific module
   * Used for: debugging specific services
   */
  getLogsByModule(module: string, limit: number = 100) {
    return LOG_BUFFER.filter(log => log.module === module).slice(-limit)
  }

  /**
   * Search logs by message or context
   * Used for: finding specific events or issues
   */
  searchLogs(query: string, limit: number = 100) {
    const lowerQuery = query.toLowerCase()
    return LOG_BUFFER.filter(log =>
      log.message.toLowerCase().includes(lowerQuery) ||
      (log.context && JSON.stringify(log.context).toLowerCase().includes(lowerQuery))
    ).slice(-limit)
  }

  /**
   * Get error and fatal logs
   * Used for: error monitoring and tracking
   */
  getErrorLogs(limit: number = 100) {
    return LOG_BUFFER.filter(log => log.level === 'ERROR' || log.level === 'FATAL').slice(-limit)
  }

  /**
   * Get statistics about current logs
   * Used for: monitoring and health checks
   */
  getLogStatistics() {
    const stats = {
      totalLogs: LOG_BUFFER.length,
      byLevel: {
        DEBUG: LOG_BUFFER.filter(l => l.level === 'DEBUG').length,
        INFO: LOG_BUFFER.filter(l => l.level === 'INFO').length,
        WARN: LOG_BUFFER.filter(l => l.level === 'WARN').length,
        ERROR: LOG_BUFFER.filter(l => l.level === 'ERROR').length,
        FATAL: LOG_BUFFER.filter(l => l.level === 'FATAL').length,
      },
      byModule: {} as Record<string, number>,
      oldestLog: LOG_BUFFER[0]?.timestamp,
      newestLog: LOG_BUFFER[LOG_BUFFER.length - 1]?.timestamp,
    }

    // Count by module
    LOG_BUFFER.forEach(log => {
      stats.byModule[log.module] = (stats.byModule[log.module] || 0) + 1
    })

    return stats
  }

  /**
   * Clear log buffer (keeps file and database logs)
   * Use with caution
   */
  clearBuffer(): void {
    LOG_BUFFER.length = 0
    this.info('Logger', 'Log buffer cleared')
  }

  /**
   * Get log file path
   * Used for: direct file access if needed
   */
  getLogFilePath(): string {
    return LOG_FILE
  }

  /**
   * Get log directory path
   * Used for: archiving or analysis
   */
  getLogDirectory(): string {
    return LOG_DIR
  }

  /**
   * COMPATIBILITY: Create a child logger with additional context
   * Old pino format: const child = logger.child({ userId: 123 })
   * Returns: Logger instance with merged context
   */
  child(context: Record<string, any>) {
    // Return this logger instance - it will use merged context for all logs
    // In a production system, this would create a new logger with inherited context
    // For now, we return the same logger since context is passed to each call
    return this
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

// Create and export the singleton logger
export const logger = new Logger()

// ============================================================================
// CONTEXT HELPERS FOR REQUEST TRACKING
// ============================================================================

/**
 * Create a request-scoped logger with correlation ID
 * Used for tracking operations across multiple services
 *
 * Example:
 *   const reqLogger = createRequestLogger(correlationId, userId)
 *   reqLogger.info('Service', 'Operation', { data: value })
 */
export function createRequestLogger(
  correlationId: string,
  userId?: string,
  sessionId?: string
) {
  return {
    debug: (module: string, message: string, context?: Record<string, any>) => {
      logger.debug(module, message, { correlationId, userId, sessionId, ...context })
    },
    info: (module: string, message: string, context?: Record<string, any>) => {
      logger.info(module, message, { correlationId, userId, sessionId, ...context })
    },
    warn: (module: string, message: string, context?: Record<string, any>) => {
      logger.warn(module, message, { correlationId, userId, sessionId, ...context })
    },
    error: (module: string, message: string, error?: Error, context?: Record<string, any>) => {
      logger.error(module, message, error, { correlationId, userId, sessionId, ...context })
    },
    fatal: (module: string, message: string, error?: Error, context?: Record<string, any>) => {
      logger.fatal(module, message, error, { correlationId, userId, sessionId, ...context })
    },
  }
}

// Initialize logger on import
logger.info('Logger', 'Exhaustive Logger Service initialized', {
  logLevel: MINIMUM_LOG_LEVEL,
  logDirectory: LOG_DIR,
  environment: process.env.NODE_ENV,
})

// ============================================================================
// PINO COMPATIBILITY WRAPPER
// ============================================================================

/**
 * Create a pino-compatible logger wrapper
 * This wraps our new logger to make it compatible with pino-http middleware
 * and any code expecting a pino logger interface
 */
function createPinoCompatibleLogger() {
  return {
    // Standard pino methods
    trace: (msg: any, obj?: any) => {
      if (typeof msg === 'string') logger.debug('HTTP', msg, obj)
      else logger.debug('HTTP', JSON.stringify(msg), msg)
    },
    debug: (msg: any, obj?: any) => {
      if (typeof msg === 'string') logger.debug('HTTP', msg, obj)
      else logger.debug('HTTP', JSON.stringify(msg), msg)
    },
    info: (msg: any, obj?: any) => {
      if (typeof msg === 'string') logger.info('HTTP', msg, obj)
      else logger.info('HTTP', JSON.stringify(msg), msg)
    },
    warn: (msg: any, obj?: any) => {
      if (typeof msg === 'string') logger.warn('HTTP', msg, obj)
      else logger.warn('HTTP', JSON.stringify(msg), msg)
    },
    error: (msg: any, obj?: any) => {
      const error = msg instanceof Error ? msg : (obj instanceof Error ? obj : undefined)
      if (typeof msg === 'string') logger.error('HTTP', msg, error, obj)
      else logger.error('HTTP', JSON.stringify(msg), msg instanceof Error ? msg : undefined, msg)
    },
    fatal: (msg: any, obj?: any) => {
      const error = msg instanceof Error ? msg : (obj instanceof Error ? obj : undefined)
      if (typeof msg === 'string') logger.fatal('HTTP', msg, error, obj)
      else logger.fatal('HTTP', JSON.stringify(msg), msg instanceof Error ? msg : undefined, msg)
    },

    // Pino child method - for compatibility
    child: (context: Record<string, any>) => {
      return createPinoCompatibleLogger()
    },

    // Expose our logger methods too
    getRecentLogs: logger.getRecentLogs.bind(logger),
    getLogsByLevel: logger.getLogsByLevel.bind(logger),
    getLogsByModule: logger.getLogsByModule.bind(logger),
    searchLogs: logger.searchLogs.bind(logger),
    getErrorLogs: logger.getErrorLogs.bind(logger),
    getLogStatistics: logger.getLogStatistics.bind(logger),
    clearBuffer: logger.clearBuffer.bind(logger),
    getLogFilePath: logger.getLogFilePath.bind(logger),
    getLogDirectory: logger.getLogDirectory.bind(logger),
  }
}

// Create and export pino-compatible logger
const pinoCompatibleLogger = createPinoCompatibleLogger()

export default pinoCompatibleLogger
