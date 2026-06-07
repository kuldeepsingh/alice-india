/**
 * Database Optimization Service
 * Connection pooling, query optimization, and performance tracking
 */

import { query } from './database.ts'
import { CacheService } from './cache-service.ts'

export interface QueryMetrics {
  query: string
  duration: number
  rows: number
  timestamp: Date
  cached: boolean
}

export class DatabaseOptimization {
  private static queryMetrics: QueryMetrics[] = []
  private static readonly MAX_METRICS = 1000

  /**
   * Track query performance
   */
  static trackQuery(metrics: Omit<QueryMetrics, 'timestamp'>): void {
    this.queryMetrics.push({
      ...metrics,
      timestamp: new Date(),
    })

    // Keep only latest metrics
    if (this.queryMetrics.length > this.MAX_METRICS) {
      this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS)
    }
  }

  /**
   * Execute query with automatic caching
   */
  static async queryWithCache<T = any>(
    sql: string,
    params: any[],
    cacheKey?: string,
    cacheTtl: number = 5 * 60
  ): Promise<T[]> {
    const startTime = Date.now()

    // Try cache if key provided
    if (cacheKey) {
      const cached = await CacheService.get<T[]>(cacheKey)
      if (cached) {
        const duration = Date.now() - startTime
        this.trackQuery({
          query: sql,
          duration,
          rows: cached.length,
          cached: true,
        })
        return cached
      }
    }

    // Execute query
    const result = await query(sql, params)
    const duration = Date.now() - startTime
    const rows = result.rows

    // Cache result if key provided
    if (cacheKey && rows.length > 0) {
      await CacheService.set(cacheKey, rows, { ttl: cacheTtl })
    }

    this.trackQuery({
      query: sql,
      duration,
      rows: rows.length,
      cached: false,
    })

    return rows as T[]
  }

  /**
   * Get slow queries (over 100ms)
   */
  static getSlowQueries(thresholdMs: number = 100): QueryMetrics[] {
    return this.queryMetrics.filter((m) => m.duration > thresholdMs)
  }

  /**
   * Get query statistics
   */
  static getQueryStats() {
    const stats = {
      totalQueries: this.queryMetrics.length,
      avgDuration: 0,
      maxDuration: 0,
      minDuration: Infinity,
      totalRows: 0,
      cachedQueries: 0,
      slowQueries: 0,
    }

    for (const metric of this.queryMetrics) {
      stats.avgDuration += metric.duration
      stats.maxDuration = Math.max(stats.maxDuration, metric.duration)
      stats.minDuration = Math.min(stats.minDuration, metric.duration)
      stats.totalRows += metric.rows
      if (metric.cached) stats.cachedQueries++
      if (metric.duration > 100) stats.slowQueries++
    }

    if (this.queryMetrics.length > 0) {
      stats.avgDuration = Math.round(stats.avgDuration / this.queryMetrics.length)
    }

    return stats
  }

  /**
   * Get top slow queries
   */
  static getTopSlowQueries(limit: number = 5): QueryMetrics[] {
    return this.queryMetrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }

  /**
   * Optimized incident query with joins
   */
  static async getIncidentsOptimized(
    status?: string,
    severity?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const cacheKey = CacheService.getIncidentsKey(status)

    let sql = `
      SELECT
        i.*,
        json_build_object(
          'id', ub.id,
          'email', ub.email,
          'role', ub.role
        ) as created_by_user,
        json_build_object(
          'id', ua.id,
          'email', ua.email,
          'role', ua.role
        ) as assigned_to_user
      FROM incidents i
      LEFT JOIN users ub ON i.created_by = ub.id
      LEFT JOIN users ua ON i.assigned_to = ua.id
      WHERE 1=1
    `

    const values: any[] = []
    let paramCount = 1

    if (status) {
      sql += ` AND i.status = $${paramCount++}`
      values.push(status)
    }

    if (severity) {
      sql += ` AND i.severity = $${paramCount++}`
      values.push(severity)
    }

    sql += ` ORDER BY i.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`
    values.push(limit, offset)

    return this.queryWithCache(sql, values, cacheKey, 5 * 60)
  }

  /**
   * Optimized notification query
   */
  static async getNotificationsOptimized(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const cacheKey = CacheService.getNotificationsKey(userId)

    const sql = `
      SELECT
        n.*,
        json_build_object(
          'id', i.id,
          'title', i.title,
          'status', i.status
        ) as incident
      FROM notifications n
      LEFT JOIN incidents i ON n.related_incident_id = i.id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3
    `

    return this.queryWithCache(sql, [userId, limit, offset], cacheKey, 5 * 60)
  }

  /**
   * Optimized on-call schedule query
   */
  static async getOnCallOptimized(startDate: Date, endDate: Date): Promise<any[]> {
    const cacheKey = CacheService.getTeamScheduleKey(startDate.toISOString().split('T')[0])

    const sql = `
      SELECT
        o.*,
        json_build_object(
          'id', u.id,
          'email', u.email,
          'role', u.role
        ) as user_info
      FROM on_call_schedule o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.start_date <= $2
        AND o.end_date >= $1
      ORDER BY o.start_date ASC
    `

    return this.queryWithCache(sql, [startDate, endDate], cacheKey, 30 * 60)
  }

  /**
   * Batch insert optimization
   */
  static async batchInsert(
    tableName: string,
    columns: string[],
    rows: any[][]
  ): Promise<number> {
    if (rows.length === 0) return 0

    const placeholders = rows
      .map((_, idx) => {
        const colPlaceholders = columns
          .map((_, colIdx) => `$${idx * columns.length + colIdx + 1}`)
          .join(', ')
        return `(${colPlaceholders})`
      })
      .join(', ')

    const flatValues = rows.flat()

    const sql = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES ${placeholders}
      ON CONFLICT DO NOTHING
    `

    const result = await query(sql, flatValues)
    return result.rowCount || 0
  }

  /**
   * Aggregate incidents by status
   */
  static async getIncidentStats(): Promise<any> {
    const cacheKey = CacheService.getStatsKey('incidents')

    const sql = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'open') as open_count,
        COUNT(*) FILTER (WHERE status = 'investigating') as investigating_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical_count
      FROM incidents
    `

    const result = await this.queryWithCache(sql, [], cacheKey, 10 * 60)
    return result[0] || {}
  }

  /**
   * Clear all tracking data
   */
  static clearMetrics(): void {
    this.queryMetrics = []
  }

  /**
   * Get memory usage of metrics
   */
  static getMetricsSize(): string {
    const bytes = JSON.stringify(this.queryMetrics).length
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }
}
