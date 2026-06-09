import fs from 'fs'
import path from 'path'
import os from 'os'

// Match the log directory used by the main Logger service
const LOG_DIR = process.env.LOG_DIR || path.join(os.tmpdir(), 'bot-trade-logs')
const MAX_LOG_SIZE = 10 * 1024 * 1024 // 10MB per file
const MAX_FILES = 10

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  service: string
  message: string
  data?: any
  error?: string
  stack?: string
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

class LoggingService {
  private currentLogFile: string

  constructor() {
    this.currentLogFile = this.getLogFilePath()
    this.initializeLogFile()
  }

  private getLogFilePath(): string {
    const date = formatDate(new Date())
    return path.join(LOG_DIR, `application-${date}.log`)
  }

  private initializeLogFile(): void {
    if (!fs.existsSync(this.currentLogFile)) {
      fs.writeFileSync(this.currentLogFile, '')
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    let logLine = `[${entry.timestamp}] [${entry.level}] [${entry.service}] ${entry.message}`

    if (entry.data) {
      logLine += ` | Data: ${JSON.stringify(entry.data)}`
    }

    if (entry.error) {
      logLine += ` | Error: ${entry.error}`
    }

    if (entry.stack) {
      logLine += `\n${entry.stack}`
    }

    return logLine
  }

  private writeLog(entry: LogEntry): void {
    try {
      const logLine = this.formatLogEntry(entry)
      fs.appendFileSync(this.currentLogFile, logLine + '\n')
    } catch (e) {
      console.error('Failed to write log:', e)
    }
  }

  log(level: LogLevel, service: string, message: string, data?: any, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      data,
      error: error?.message,
      stack: error?.stack,
    }

    this.writeLog(entry)
  }

  debug(service: string, message: string, data?: any): void {
    this.log('DEBUG', service, message, data)
  }

  info(service: string, message: string, data?: any): void {
    this.log('INFO', service, message, data)
  }

  warn(service: string, message: string, data?: any): void {
    this.log('WARN', service, message, data)
  }

  error(service: string, message: string, error?: Error, data?: any): void {
    this.log('ERROR', service, message, data, error)
  }

  fatal(service: string, message: string, error?: Error, data?: any): void {
    this.log('FATAL', service, message, data, error)
  }

  // Read logs from file
  readLogs(options: {
    limit?: number
    offset?: number
    level?: LogLevel
    service?: string
    search?: string
  } = {}): { logs: LogEntry[]; total: number } {
    try {
      const { limit = 100, offset = 0, level, service, search } = options
      let logs: LogEntry[] = []

      // Get all log files
      const files = fs.readdirSync(LOG_DIR).filter((f) => f.endsWith('.log')).sort().reverse()

      if (files.length === 0) {
        console.log('[LoggingService] No log files found in', LOG_DIR)
        return { logs: [], total: 0 }
      }

      // Read all log files
      for (const file of files) {
        const filePath = path.join(LOG_DIR, file)
        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n').filter((l) => l.trim())

        for (const line of lines.reverse()) {
          const logEntry = this.parseLogLine(line)
          if (!logEntry) {
            // Silently skip unparseable lines
            continue
          }

          if (level && logEntry.level !== level) continue
          if (service && !logEntry.service.includes(service)) continue
          if (search && !line.toLowerCase().includes(search.toLowerCase())) continue

          logs.push(logEntry)

          if (logs.length >= limit + offset) break
        }

        if (logs.length >= limit + offset) break
      }

      return {
        logs: logs.slice(offset, offset + limit),
        total: logs.length,
      }
    } catch (e) {
      console.error('[LoggingService] Error reading logs:', e)
      return { logs: [], total: 0 }
    }
  }

  private parseLogLine(line: string): LogEntry | null {
    try {
      // Try to parse as JSON (current format)
      const json = JSON.parse(line)

      // Ensure module/service is a string, not an object
      let module = json.module
      if (typeof module === 'object' && module !== null) {
        // If module is an object, try to extract the type or service field
        module = module.type || module.service || 'Unknown'
      }
      if (!module) {
        module = json.service || 'Unknown'
      }

      return {
        timestamp: json.timestamp,
        level: json.level as LogLevel,
        service: String(module),
        message: json.message,
        data: json.context,
      }
    } catch (e) {
      // If JSON parsing fails, it's not a valid log line
      return null
    }
  }

  // Get log file stats
  getLogStats(): {
    files: Array<{ name: string; size: number; modified: string }>
    totalSize: number
  } {
    try {
      const files = fs.readdirSync(LOG_DIR).filter((f) => f.endsWith('.log'))

      const stats = files.map((f) => {
        const filePath = path.join(LOG_DIR, f)
        const stat = fs.statSync(filePath)
        return {
          name: f,
          size: stat.size,
          modified: formatDateTime(stat.mtime),
        }
      })

      const totalSize = stats.reduce((sum, s) => sum + s.size, 0)

      return {
        files: stats.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime()),
        totalSize,
      }
    } catch (e) {
      return { files: [], totalSize: 0 }
    }
  }

  // Download log file
  getLogFileContent(filename: string): string | null {
    try {
      const filePath = path.join(LOG_DIR, filename)

      if (!filePath.startsWith(LOG_DIR)) {
        return null
      }

      if (!fs.existsSync(filePath)) {
        return null
      }

      return fs.readFileSync(filePath, 'utf-8')
    } catch (e) {
      return null
    }
  }

  // Clear old logs
  clearOldLogs(daysToKeep: number = 30): number {
    try {
      const files = fs.readdirSync(LOG_DIR).filter((f) => f.endsWith('.log'))
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      let deletedCount = 0

      files.forEach((f) => {
        const filePath = path.join(LOG_DIR, f)
        const stat = fs.statSync(filePath)

        if (stat.mtime < cutoffDate) {
          fs.unlinkSync(filePath)
          deletedCount++
        }
      })

      return deletedCount
    } catch (e) {
      return 0
    }
  }

  /**
   * Store a log entry (static method for compatibility)
   * Used by log-capture middleware
   */
  async storeLog(logData: {
    level: LogLevel
    message: string
    module?: string
    context?: any
    stackTrace?: string
  }): Promise<void> {
    this.log(
      logData.level,
      logData.module || 'HTTP',
      logData.message,
      logData.context,
      logData.stackTrace ? new Error(logData.stackTrace) : undefined
    )
  }

  /**
   * Static storeLog method for compatibility with middleware
   */
  static async storeLog(logData: {
    level: LogLevel
    message: string
    module?: string
    context?: any
    stackTrace?: string
  }): Promise<void> {
    return loggingService.storeLog(logData)
  }

  /**
   * Get logs with filtering (static method for API)
   */
  static getLogs(filter: any = {}) {
    const result = loggingService.readLogs({
      limit: filter.limit || 100,
      offset: filter.offset || 0,
      level: filter.level,
      service: filter.module, // 'service' field in LogEntry, 'module' in filter
      search: filter.search,
    })

    return {
      data: result.logs,
      total: result.total,
      page: Math.floor((filter.offset || 0) / (filter.limit || 100)) + 1,
      pageSize: filter.limit || 100,
    }
  }

  /**
   * Get logs by correlation ID (for request tracing)
   */
  static getLogsByCorrelationId(correlationId: string) {
    const result = loggingService.readLogs({
      limit: 10000,
      search: correlationId,
    })

    return result.logs.filter(log =>
      log.data && typeof log.data === 'object' && 'correlationId' in log.data &&
      log.data.correlationId === correlationId
    )
  }
}

export { LoggingService }; export const loggingService = new LoggingService()
