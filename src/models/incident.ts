/**
 * Incident Model
 * Represents an incident for team coordination and error management
 */

export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed'
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface Incident {
  id: string
  title: string
  description?: string
  status: IncidentStatus
  severity: IncidentSeverity
  createdBy: string
  assignedTo?: string
  relatedErrorId?: string
  resolutionNotes?: string
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IncidentWithUser extends Incident {
  createdByUser?: {
    id: string
    email: string
    role: string
  }
  assignedToUser?: {
    id: string
    email: string
    role: string
  }
}

export interface CreateIncidentInput {
  title: string
  description?: string
  severity: IncidentSeverity
  relatedErrorId?: string
}

export interface UpdateIncidentInput {
  title?: string
  description?: string
  status?: IncidentStatus
  severity?: IncidentSeverity
  resolutionNotes?: string
}

export interface AssignIncidentInput {
  assignedTo: string
}

export interface IncidentFilter {
  status?: IncidentStatus
  severity?: IncidentSeverity
  assignedTo?: string
  createdBy?: string
  limit?: number
  offset?: number
}

export interface IncidentQueryResult {
  data: IncidentWithUser[]
  total: number
  page: number
  pageSize: number
}

/**
 * Severity levels for prioritization
 */
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export const SEVERITY_PRIORITY = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
}

/**
 * Status workflow
 */
export const STATUS_WORKFLOW = {
  OPEN: 'open',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const

/**
 * Get next valid status transitions
 */
export function getValidNextStatuses(currentStatus: IncidentStatus): IncidentStatus[] {
  const transitions: Record<IncidentStatus, IncidentStatus[]> = {
    open: ['investigating', 'resolved', 'closed'],
    investigating: ['resolved', 'closed'],
    resolved: ['closed'],
    closed: [],
  }
  return transitions[currentStatus]
}
