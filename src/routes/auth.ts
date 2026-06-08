import { Router, Request, Response } from 'express'
import { userService } from '../services/user-service.ts'
import { jwtService } from '../services/jwt.ts'
import { logger } from '../services/logger.ts'

const router = Router()

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    logger.debug({
      type: 'register_request_received',
      email,
    })

    // Validation
    if (!email || !password) {
      logger.error({
        type: 'register_validation_failed',
        reason: 'missing_credentials',
        email,
        ip: req.ip,
      })
      return res.status(400).json({ error: 'Email and password required' })
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      logger.error({
        type: 'register_validation_failed',
        reason: 'invalid_email_format',
        email,
        ip: req.ip,
      })
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (typeof password !== 'string' || password.length < 6) {
      logger.error({
        type: 'register_validation_failed',
        reason: 'weak_password',
        email,
        passwordLength: password.length,
        minRequired: 6,
        ip: req.ip,
      })
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    logger.debug({
      type: 'register_validation_passed',
      email,
    })

    // Create user
    logger.debug({
      type: 'register_creating_user',
      email,
    })

    const user = await userService.createUser({
      email,
      password,
      role: 'trader',
    })

    logger.info({
      type: 'user_registered',
      userId: user.id,
      email,
      role: user.role,
      timestamp: new Date().toISOString(),
      ip: req.ip,
    })

    res.status(201).json(user)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    logger.error({
      type: 'register_error',
      error: errorMessage,
      stack: errorStack,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    })

    if (error instanceof Error && error.message.includes('already registered')) {
      logger.error({
        type: 'register_failed',
        reason: 'email_already_registered',
        email: req.body.email,
        ip: req.ip,
      })
      return res.status(409).json({ error: 'Email already registered' })
    }

    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    logger.debug({
      type: 'login_request_received',
      email,
      ip: req.ip,
    })

    if (!email || !password) {
      logger.error({
        type: 'login_validation_failed',
        reason: 'missing_credentials',
        email,
        ip: req.ip,
      })
      return res.status(400).json({ error: 'Email and password required' })
    }

    // Verify credentials
    logger.debug({
      type: 'login_verifying_credentials',
      email,
    })

    const user = await userService.verifyPassword(email, password)
    if (!user) {
      logger.error({
        type: 'login_failed',
        reason: 'invalid_credentials',
        email,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      })
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    logger.debug({
      type: 'login_credentials_verified',
      userId: user.id,
      email: user.email,
    })

    // Generate tokens
    logger.debug({
      type: 'login_generating_tokens',
      userId: user.id,
    })

    const token = jwtService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = jwtService.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    logger.info({
      type: 'user_login_successful',
      userId: user.id,
      email: user.email,
      role: user.role,
      timestamp: new Date().toISOString(),
      ip: req.ip,
    })

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    logger.error({
      type: 'login_error',
      error: errorMessage,
      stack: errorStack,
      email: req.body.email,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    })
    res.status(500).json({ error: 'Login failed' })
  }
})

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    logger.debug({
      type: 'refresh_token_request',
      ip: req.ip,
    })

    if (!refreshToken) {
      logger.error({
        type: 'refresh_token_validation_failed',
        reason: 'missing_token',
        ip: req.ip,
      })
      return res.status(400).json({ error: 'Refresh token required' })
    }

    if (typeof refreshToken !== 'string') {
      logger.error({
        type: 'refresh_token_validation_failed',
        reason: 'invalid_format',
        ip: req.ip,
      })
      return res.status(400).json({ error: 'Invalid token format' })
    }

    try {
      logger.debug({
        type: 'refresh_token_verifying',
      })

      const payload = jwtService.verifyToken(refreshToken)

      logger.debug({
        type: 'refresh_token_verified',
        userId: payload.userId,
      })

      const newToken = jwtService.generateToken(payload)

      logger.info({
        type: 'refresh_token_success',
        userId: payload.userId,
        timestamp: new Date().toISOString(),
        ip: req.ip,
      })

      res.json({ token: newToken })
    } catch (tokenError) {
      const errorMessage = tokenError instanceof Error ? tokenError.message : String(tokenError)

      logger.error({
        type: 'refresh_token_verification_failed',
        reason: 'invalid_token',
        error: errorMessage,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      })
      return res.status(401).json({ error: 'Invalid refresh token' })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    logger.error({
      type: 'refresh_error',
      error: errorMessage,
      stack: errorStack,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    })
    res.status(500).json({ error: 'Token refresh failed' })
  }
})

export default router
