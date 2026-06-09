/**
 * Audit Log Model
 * Represents an immutable audit trail entry for compliance and security
 */

export type AuditAction =
  | 'login'
  | 'logout'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'permission_changed'
  | 'order_created'
  | 'order_updated'
  | 'order_deleted'
  | 'debug_enabled'
  | 'debug_disabled'
  | 'password_changed'
  | 'account_created'
  | 'account_updated'
  | 'account_deleted'
  | 'unauthorized_access'
  | 'permission_denied'
  | 'ownership_violation'

export type AuditStatus = 'success' | 'failure'

export interface AuditLog {
  id: string
  userId: string
  action: AuditAction
  resourceType?: string
  resourceId?: string
  oldValue?: Record<string, any>
  newValue?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  status: AuditStatus
  createdAt: Date
  immutable: boolean
}

export interface CreateAuditLogInput {
  userId: string
  action: AuditAction
  resourceType?: string
  resourceId?: string
  oldValue?: Record<string, any>
  newValue?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  status: AuditStatus
}

export interface AuditFilter {
  userId?: string
  action?: AuditAction
  resourceType?: string
  startDate?: Date
  endDate?: Date
  status?: AuditStatus
  limit?: number
  offset?: number
}

export interface AuditQueryResult {
  data: AuditLog[]
  total: number
  page: number
  pageSize: number
}

export interface AuditExportData {
  id: string
  userId: string
  action: string
  resourceType: string | null
  resourceId: string | null
  oldValue: string | null
  newValue: string | null
  ipAddress: string | null
  userAgent: string | null
  status: string
  createdAt: string
}

/**
 * Format audit log for CSV export
 */
export function formatAuditForCSV(logs: AuditLog[]): string {
  const headers = [
    'ID',
    'User ID',
    'Action',
    'Resource Type',
    'Resource ID',
    'Old Value',
    'New Value',
    'IP Address',
    'User Agent',
    'Status',
    'Created At',
  ]

  const rows = logs.map((log) => [
    log.id,
    log.userId,
    log.action,
    log.resourceType || '',
    log.resourceId || '',
    JSON.stringify(log.oldValue || {}),
    JSON.stringify(log.newValue || {}),
    log.ipAddress || '',
    log.userAgent || '',
    log.status,
    log.createdAt.toISOString(),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape cells containing commas or quotes
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
            return `"${cell.replace(/"/g, '""')}"`
          }
          return cell
        })
        .join(',')
    ),
  ].join('\n')

  return csvContent
}

/**
 * Format audit log for JSON export
 */
export function formatAuditForJSON(logs: AuditLog[]): string {
  return JSON.stringify(logs, null, 2)
}

/**
 * User activity summary for timeline view
 */
export interface UserActivitySummary {
  totalActions: number
  actionTypes: Record<AuditAction, number>
  lastActivity: Date
  recentActions: AuditLog[]
}
