import { Request, Response, NextFunction } from 'express'
import { jwtService } from '../services/jwt.ts'
import { logger } from '../services/logger.ts'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
    role: string
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    // Log auth attempt
    logger.debug('Auth', 'Auth middleware checking token', {
      hasAuthHeader: !!authHeader,
      ip: req.ip,
      path: req.path,
      method: req.method,
    })

    if (!authHeader) {
      const errorMsg = 'Missing authorization header'
      logger.warn('Auth', `Auth failed - ${errorMsg}`, {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('user-agent'),
        reason: 'missing_header',
        errorMessage: errorMsg,
      })
      return res.status(401).json({
        status: 'error',
        error: errorMsg,
        message: 'Authorization header is required. Format: Bearer <token>',
        reason: 'missing_header',
      })
    }

    if (!authHeader.startsWith('Bearer ')) {
      const errorMsg = 'Invalid authorization format'
      logger.warn('Auth', `Auth failed - ${errorMsg}`, {
        ip: req.ip,
        path: req.path,
        method: req.method,
        authHeaderFormat: authHeader.substring(0, 20) + '...',
        reason: 'invalid_format',
        errorMessage: errorMsg,
      })
      return res.status(401).json({
        status: 'error',
        error: errorMsg,
        message: 'Authorization header must start with "Bearer "',
        reason: 'invalid_format',
      })
    }

    const token = authHeader.slice(7)

    logger.debug('Auth', 'Verifying JWT token', {
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20),
    })

    const payload = jwtService.verifyToken(token)

    if (!payload || !payload.userId) {
      logger.warn('Auth', 'Auth failed - invalid token payload', {
        ip: req.ip,
        path: req.path,
        hasPayload: !!payload,
        hasUserId: payload && 'userId' in payload,
      })
      return res.status(401).json({
        status: 'error',
        error: 'Invalid token',
        message: 'Token payload is invalid'
      })
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    }

    logger.debug('Auth', 'Token verified successfully', {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      path: req.path,
    })

    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorType = error?.constructor?.name || 'UnknownError'

    // Determine the reason for token verification failure
    let reason = 'token_verification_failed'
    if (errorMessage.includes('expired')) reason = 'token_expired'
    if (errorMessage.includes('malformed')) reason = 'token_malformed'
    if (errorMessage.includes('invalid')) reason = 'token_invalid'
    if (errorMessage.includes('signature')) reason = 'token_signature_invalid'

    logger.error('Auth', `Token verification failed: ${errorMessage}`, error, {
      errorMessage,
      errorType,
      reason,
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('user-agent'),
    })

    res.status(401).json({
      status: 'error',
      error: 'Invalid token',
      message: errorMessage,
      reason,
    })
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn('Auth', 'Authorization failed - user not authenticated', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        requiredRoles: roles,
      })
      return res.status(401).json({
        status: 'error',
        error: 'Unauthorized',
        message: 'User is not authenticated'
      })
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Auth', 'Authorization failed - insufficient role permissions', {
        userId: req.user.userId,
        userEmail: req.user.email,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
        method: req.method,
      })
      return res.status(403).json({
        status: 'error',
        error: 'Forbidden',
        message: `User role '${req.user.role}' is not allowed for this operation. Required roles: ${roles.join(', ')}`
      })
    }

    logger.debug('Auth', 'Authorization check passed', {
      userId: req.user.userId,
      userRole: req.user.role,
      requiredRoles: roles,
      path: req.path,
    })

    next()
  }
}
