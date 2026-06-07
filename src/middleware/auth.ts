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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.slice(7)
    const payload = jwtService.verifyToken(token)

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    }

    next()
  } catch (error) {
    logger.error({
      type: 'auth_middleware_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}
