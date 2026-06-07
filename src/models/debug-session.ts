/**
 * Debug Session Model
 * Represents a debug session for a user with elevated log level
 */

import { LogLevel } from './log.ts'

export interface DebugSession {
  id: string
  userId: string
  enabledByAdminId: string
  startedAt: Date
  expiresAt: Date
  reason?: string
  logLevel: LogLevel
  createdAt: Date
}

export interface CreateDebugSessionInput {
  userId: string
  duration: number // in minutes
  reason?: string
  logLevel?: LogLevel
}

export interface DebugSessionResponse {
  id: string
  userId: string
  expiresAt: Date
  reason?: string
  logLevel: LogLevel
  remainingMinutes: number
}

export interface ActiveDebugSession extends DebugSession {
  isActive: boolean
  remainingMinutes: number
}

/**
 * Debug session duration presets (in minutes)
 */
export const DEBUG_DURATION_PRESETS = {
  ONE_HOUR: 60,
  FOUR_HOURS: 240,
  EIGHT_HOURS: 480,
  TWENTY_FOUR_HOURS: 1440,
} as const

export type DebugDuration = typeof DEBUG_DURATION_PRESETS[keyof typeof DEBUG_DURATION_PRESETS]

/**
 * Validate debug session duration
 */
export function isValidDebugDuration(duration: number): boolean {
  const validDurations = Object.values(DEBUG_DURATION_PRESETS)
  return validDurations.includes(duration as DebugDuration)
}

/**
 * Calculate remaining time in debug session
 */
export function getDebugSessionRemainingTime(expiresAt: Date): number {
  const now = new Date()
  const diffMs = expiresAt.getTime() - now.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60))) // Return minutes
}

/**
 * Check if debug session is still active
 */
export function isDebugSessionActive(expiresAt: Date): boolean {
  return new Date() < expiresAt
}

/**
 * Format debug session for API response
 */
export function formatDebugSessionResponse(session: DebugSession): DebugSessionResponse {
  return {
    id: session.id,
    userId: session.userId,
    expiresAt: session.expiresAt,
    reason: session.reason,
    logLevel: session.logLevel,
    remainingMinutes: getDebugSessionRemainingTime(session.expiresAt),
  }
}

/**
 * Debug session statistics
 */
export interface DebugSessionStats {
  totalSessions: number
  activeSessions: number
  totalUsers: number
  averageDuration: number
  commonReasons: Record<string, number>
}
