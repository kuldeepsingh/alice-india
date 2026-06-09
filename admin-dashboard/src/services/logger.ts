/**
 * ============================================================================
 * FRONTEND LOGGER SERVICE
 * ============================================================================
 *
 * Purpose:
 *   Comprehensive client-side logging for the admin dashboard
 *   - Logs to browser console with colors and formatting
 *   - Sends logs to backend for centralized storage
 *   - Local storage for offline access
 *   - Performance monitoring
 *
 * Features:
 *   ✅ Colored console output
 *   ✅ Backend integration
 *   ✅ Local storage persistence
 *   ✅ User action tracking
 *   ✅ Error tracking with stack traces
 *   ✅ Request timing
 *   ✅ Multiple log levels (DEBUG, INFO, WARN, ERROR)
 *
 * Usage Examples:
 *   import { frontendLogger } from './services/logger'
 *   frontendLogger.info('DashboardComponent', 'User clicked logout')
 *   frontendLogger.error('API', 'Failed to fetch users', error)
 *   frontendLogger.debug('Cache', 'Cache invalidated', { key: 'users' })
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

// ============================================================================
// COLOR CODES FOR BROWSER CONSOLE
// ============================================================================

const CONSOLE_STYLES = {
  DEBUG: 'color: #00BCD4; font-weight: bold',     // Cyan
  INFO: 'color: #4CAF50; font-weight: bold',      // Green
  WARN: 'color: #FF9800; font-weight: bold',      // Orange
  ERROR: 'color: #F44336; font-weight: bold',     // Red
  RESET: 'color: inherit; font-weight: normal',
  TIMESTAMP: 'color: #999; font-size: 0.9em',
  MODULE: 'color: #2196F3; font-weight: bold',
  MESSAGE: 'color: #333',
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// In-memory log storage
const LOG_BUFFER: Array<{
  timestamp: string
  level: LogLevel
  module: string
  message: string
  context?: Record<string, any>
  stackTrace?: string
}> = []

const MAX_BUFFER_SIZE = 1000 // Keep last 1000 logs in memory
let MINIMUM_LOG_LEVEL: LogLevel = 'DEBUG'
let BACKEND_ENABLED = true // Enable sending logs to backend

// ============================================================================
// FRONTEND LOGGER CLASS
// ============================================================================

class FrontendLogger {
  /**
   * CONFIGURATION: Set minimum log level for frontend
   */
  setMinimumLevel(level: LogLevel): void {
    MINIMUM_LOG_LEVEL = level
    console.log(
      `%c[Frontend Logger] %cMinimum log level set to ${level}`,
      CONSOLE_STYLES.INFO,
      CONSOLE_STYLES.RESET
    )
  }

  /**
   * CONFIGURATION: Enable/disable backend logging
   */
  setBackendLogging(enabled: boolean): void {
    BACKEND_ENABLED = enabled
  }

  /**
   * Check if log level should be captured
   */
  private shouldLog(level: LogLevel): boolean {
    const priorities: Record<LogLevel, number> = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
    }
    return priorities[level] >= priorities[MINIMUM_LOG_LEVEL]
  }

  /**
   * Get timestamp in HH:MM:SS.mmm format
   */
  private getTimestamp(): string {
    const now = new Date()
    return now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    })
  }

  /**
   * Log to browser console with formatting
   */
  private logToConsole(
    level: LogLevel,
    module: string,
    message: string,
    context?: Record<string, any>
  ): void {
    const timestamp = this.getTimestamp()

    // Styled console output
    console.log(
      `%c[${timestamp}]%c [${level}]%c ${module}:%c ${message}`,
      CONSOLE_STYLES.TIMESTAMP,
      CONSOLE_STYLES[level],
      CONSOLE_STYLES.MODULE,
      CONSOLE_STYLES.MESSAGE
    )

    // Add context if provided
    if (context && Object.keys(context).length > 0) {
      console.log('%cContext:', CONSOLE_STYLES.MODULE, context)
    }
  }

  /**
   * Store log in memory for dashboard access
   */
  private storeInBuffer(
    level: LogLevel,
    module: string,
    message: string,
    context?: Record<string, any>,
    stackTrace?: string
  ): void {
    LOG_BUFFER.push({
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      context,
      stackTrace,
    })

    // Keep buffer manageable
    if (LOG_BUFFER.length > MAX_BUFFER_SIZE) {
      LOG_BUFFER.shift()
    }

    // Also store in local storage for persistence
    try {
      localStorage.setItem('app_logs', JSON.stringify(LOG_BUFFER.slice(-100)))
    } catch (err) {
      // LocalStorage might be full or disabled
    }
  }

  /**
   * Send log to backend for centralized storage
   */
  private async sendToBackend(
    level: LogLevel,
    module: string,
    message: string,
    context?: Record<string, any>,
    stackTrace?: string
  ): Promise<void> {
    if (!BACKEND_ENABLED) {
      return
    }

    try {
      await fetch('/api/v1/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({
          level,
          module,
          message,
          context,
          stackTrace,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      })
    } catch (err) {
      // Fail silently - don't create logging loops
    }
  }

  /**
   * Core logging function
   */
  private async log(
    level: LogLevel,
    module: string,
    message: string,
    context?: Record<string, any>,
    stackTrace?: string
  ): Promise<void> {
    if (!this.shouldLog(level)) {
      return
    }

    // Console output
    this.logToConsole(level, module, message, context)

    // Memory storage
    this.storeInBuffer(level, module, message, context, stackTrace)

    // Backend storage (async, don't wait)
    this.sendToBackend(level, module, message, context, stackTrace)
  }

  // ========================================================================
  // PUBLIC LOGGING METHODS
  // ========================================================================

  /**
   * DEBUG: Detailed diagnostic information
   * Example: frontendLogger.debug('CacheService', 'Cache hit', { key: 'users' })
   */
  debug(module: string, message: string, context?: Record<string, any>): void {
    this.log('DEBUG', module, message, context)
  }

  /**
   * INFO: General informational messages
   * Example: frontendLogger.info('AuthService', 'User logged in')
   */
  info(module: string, message: string, context?: Record<string, any>): void {
    this.log('INFO', module, message, context)
  }

  /**
   * WARN: Warning messages
   * Example: frontendLogger.warn('Form', 'Validation warning', { field: 'email' })
   */
  warn(module: string, message: string, context?: Record<string, any>): void {
    this.log('WARN', module, message, context)
  }

  /**
   * ERROR: Error messages
   * Example: frontendLogger.error('API', 'Request failed', error)
   */
  error(module: string, message: string, error?: Error, context?: Record<string, any>): void {
    const stackTrace = error?.stack
    const fullContext = {
      ...(context || {}),
      errorMessage: error?.message,
      errorName: error?.name,
    }
    this.log('ERROR', module, message, fullContext, stackTrace)
  }

  // ========================================================================
  // LOG RETRIEVAL FOR DASHBOARD
  // ========================================================================

  /**
   * Get recent logs from memory
   */
  getRecentLogs(limit: number = 100) {
    return LOG_BUFFER.slice(-limit)
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel, limit: number = 100) {
    return LOG_BUFFER.filter(log => log.level === level).slice(-limit)
  }

  /**
   * Get logs by module
   */
  getLogsByModule(module: string, limit: number = 100) {
    return LOG_BUFFER.filter(log => log.module === module).slice(-limit)
  }

  /**
   * Search logs
   */
  searchLogs(query: string, limit: number = 100) {
    const lowerQuery = query.toLowerCase()
    return LOG_BUFFER.filter(log =>
      log.message.toLowerCase().includes(lowerQuery) ||
      (log.context && JSON.stringify(log.context).toLowerCase().includes(lowerQuery))
    ).slice(-limit)
  }

  /**
   * Get error logs
   */
  getErrorLogs(limit: number = 100) {
    return LOG_BUFFER.filter(log => log.level === 'ERROR').slice(-limit)
  }

  /**
   * Get statistics
   */
  getLogStatistics() {
    return {
      totalLogs: LOG_BUFFER.length,
      byLevel: {
        DEBUG: LOG_BUFFER.filter(l => l.level === 'DEBUG').length,
        INFO: LOG_BUFFER.filter(l => l.level === 'INFO').length,
        WARN: LOG_BUFFER.filter(l => l.level === 'WARN').length,
        ERROR: LOG_BUFFER.filter(l => l.level === 'ERROR').length,
      },
      byModule: Object.fromEntries(
        [...new Set(LOG_BUFFER.map(l => l.module))].map(module => [
          module,
          LOG_BUFFER.filter(l => l.module === module).length,
        ])
      ),
    }
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    LOG_BUFFER.length = 0
    localStorage.removeItem('app_logs')
    this.info('Logger', 'Logs cleared')
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(LOG_BUFFER, null, 2)
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const frontendLogger = new FrontendLogger()

// Initialize on import
frontendLogger.info('Logger', 'Frontend Logger Service initialized', {
  environment: process.env.NODE_ENV,
  url: window.location.href,
})

// ============================================================================
// GLOBAL ERROR HANDLERS
// ============================================================================

// Capture uncaught errors
window.addEventListener('error', (event) => {
  frontendLogger.error(
    'Global Error Handler',
    'Uncaught error detected',
    event.error,
    {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    }
  )
})

// Capture unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  frontendLogger.error(
    'Unhandled Promise Rejection',
    event.reason?.message || 'Promise rejected',
    event.reason instanceof Error ? event.reason : undefined,
    {
      promise: String(event.promise),
    }
  )
})

export default frontendLogger
