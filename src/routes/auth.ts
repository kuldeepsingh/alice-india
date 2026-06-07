import { Router, Request, Response } from 'express'
import { userService } from '../services/user-service.ts'
import { jwtService } from '../services/jwt.ts'
import { logger } from '../services/logger.ts'

const router = Router()

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Create user
    const user = await userService.createUser({
      email,
      password,
      role: 'trader',
    })

    logger.info({
      type: 'user_registered',
      email,
    })

    res.status(201).json(user)
  } catch (error) {
    logger.error({
      type: 'register_error',
      error: error instanceof Error ? error.message : String(error),
    })

    if (error instanceof Error && error.message.includes('already registered')) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    // Verify credentials
    const user = await userService.verifyPassword(email, password)
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate tokens
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
      type: 'user_login',
      userId: user.id,
      email: user.email,
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
    logger.error({
      type: 'login_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Login failed' })
  }
})

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' })
    }

    if (typeof refreshToken !== 'string') {
      return res.status(400).json({ error: 'Invalid token format' })
    }

    try {
      const payload = jwtService.verifyToken(refreshToken)
      const newToken = jwtService.generateToken(payload)

      res.json({ token: newToken })
    } catch (tokenError) {
      logger.error({
        type: 'refresh_token_verification_error',
        error: tokenError instanceof Error ? tokenError.message : String(tokenError),
      })
      return res.status(401).json({ error: 'Invalid refresh token' })
    }
  } catch (error) {
    logger.error({
      type: 'refresh_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Token refresh failed' })
  }
})

export default router
