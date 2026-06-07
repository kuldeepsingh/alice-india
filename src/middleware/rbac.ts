/**
 * RBAC Middleware
 * Role-based access control for protected endpoints
 */

import { Request, Response, NextFunction } from 'express'
import { logger } from '../services/logger.ts'
import { Roles, Permissions } from '../config/security.ts'
import { AuditService } from '../services/audit-service.ts'

/**
 * Extend Express Request to include user info
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: string
      }
    }
  }
}

/**
 * Require admin role
 */
export function requireAdmin() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
        correlationId: req.correlationId,
      })
    }

    if (req.user.role !== Roles.ADMIN) {
      logger.warn({
        type: 'unauthorized_access',
        userId: req.user.id,
        requiredRole: Roles.ADMIN,
        userRole: req.user.role,
        path: req.path,
      })

      // Log to audit trail
      AuditService.createAuditLog({
        userId: req.user.id,
        action: 'unauthorized_access',
        resourceType: 'api',
        status: 'failure',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
      }).catch((error) => {
        logger.error({
          type: 'audit_log_failed',
          error: error instanceof Error ? error.message : String(error),
        })
      })

      return res.status(403).json({
        status: 'error',
        message: 'Admin access required',
        correlationId: req.correlationId,
      })
    }

    next()
  }
}

/**
 * Require developer or senior developer role
 */
export function requireDeveloper() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
        correlationId: req.correlationId,
      })
    }

    const allowedRoles = [Roles.ADMIN, 'senior_dev']
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn({
        type: 'unauthorized_access',
        userId: req.user.id,
        requiredRoles: allowedRoles,
        userRole: req.user.role,
        path: req.path,
      })

      return res.status(403).json({
        status: 'error',
        message: 'Developer access required',
        correlationId: req.correlationId,
      })
    }

    next()
  }
}

/**
 * Check specific permission
 */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
        correlationId: req.correlationId,
      })
    }

    const rolePermissions = Permissions[req.user.role as keyof typeof Permissions]

    if (!rolePermissions || !rolePermissions.includes(permission)) {
      logger.warn({
        type: 'permission_denied',
        userId: req.user.id,
        requiredPermission: permission,
        userRole: req.user.role,
        path: req.path,
      })

      AuditService.createAuditLog({
        userId: req.user.id,
        action: 'permission_denied',
        resourceType: 'api',
        newValue: { permission, path: req.path },
        status: 'failure',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
      }).catch((error) => {
        logger.error({
          type: 'audit_log_failed',
          error: error instanceof Error ? error.message : String(error),
        })
      })

      return res.status(403).json({
        status: 'error',
        message: 'Permission denied',
        correlationId: req.correlationId,
      })
    }

    next()
  }
}

/**
 * Verify user owns the resource (for user-specific data)
 */
export function verifyOwnership(resourceOwnerField: string = 'userId') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
        correlationId: req.correlationId,
      })
    }

    // Get resource owner ID from various sources
    let resourceOwnerId: string | undefined

    // Check route params
    if (req.params[resourceOwnerField]) {
      resourceOwnerId = req.params[resourceOwnerField]
    }

    // Check query params
    if (req.query[resourceOwnerField]) {
      resourceOwnerId = req.query[resourceOwnerField] as string
    }

    // Check request body
    if (req.body && req.body[resourceOwnerField]) {
      resourceOwnerId = req.body[resourceOwnerField]
    }

    // Admin can access any resource
    if (req.user.role === Roles.ADMIN) {
      return next()
    }

    // User must own the resource
    if (resourceOwnerId && resourceOwnerId !== req.user.id) {
      logger.warn({
        type: 'ownership_violation',
        userId: req.user.id,
        resourceOwnerId,
        path: req.path,
      })

      AuditService.createAuditLog({
        userId: req.user.id,
        action: 'ownership_violation',
        resourceType: 'resource',
        resourceId: resourceOwnerId,
        status: 'failure',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
      }).catch((error) => {
        logger.error({
          type: 'audit_log_failed',
          error: error instanceof Error ? error.message : String(error),
        })
      })

      return res.status(403).json({
        status: 'error',
        message: 'Cannot access resource owned by another user',
        correlationId: req.correlationId,
      })
    }

    next()
  }
}
