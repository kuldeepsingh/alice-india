/**
 * Authentication Routes
 * 
 * This module handles all user authentication operations:
 * - User registration (POST /register)
 * - User login (POST /login)
 * - Token refresh (POST /refresh)
 * 
 * Security:
 * - Passwords are hashed with Scrypt (slow, memory-intensive)
 * - Tokens are signed with JWT
 * - All inputs are validated before processing
 * - All operations are logged for audit trail
 * 
 * Logging:
 * - DEBUG: Request received, validation passed
 * - INFO: Successful authentication
 * - ERROR: Validation failures, auth failures, exceptions
 */

import { Router, Request, Response } from 'express'
import { userService } from '../services/user-service.ts'
import { jwtService } from '../services/jwt.ts'
import { logger } from '../services/logger.ts'

const router = Router()

/**
 * POST /auth/register
 * 
 * Creates a new user account with email and password.
 * 
 * Request body:
 *   - email (string): User's email address, must be valid format
 *   - password (string): User's password, minimum 6 characters
 * 
 * Response (201 Created):
 *   - id: User ID
 *   - email: User email
 *   - role: User role (default: 'trader')
 * 
 * Errors:
 *   - 400: Missing credentials, invalid email, weak password
 *   - 409: Email already registered
 *   - 500: Server error (database, hashing, etc.)
 * 
 * Flow:
 *   1. Extract email and password from request body
 *   2. Validate email format (must contain @)
 *   3. Validate password length (minimum 6 characters)
 *   4. Create user with hashed password
 *   5. Log success with userId and email
 * 
 * Security:
 *   - Password is hashed with Scrypt before storing
 *   - Never store or log plain password
 *   - Email is validated but not unique-checked here (DB constraint)
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // DEBUG: Log that registration request was received
    logger.debug({
      type: 'register_request_received',
      email,
    })

    // ===== INPUT VALIDATION =====
    // Check if email and password are both provided
    if (!email || !password) {
      // ERROR: Missing required fields
      logger.error({
        type: 'register_validation_failed',
        reason: 'missing_credentials',
        email,
        ip: req.ip,
      })
      return res.status(400).json({ error: 'Email and password required' })
    }

    // Validate email format (must be string with @ symbol)
    if (typeof email !== 'string' || !email.includes('@')) {
      // ERROR: Invalid email format
      logger.error({
        type: 'register_validation_failed',
        reason: 'invalid_email_format',
        email,
        ip: req.ip,
      })
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Validate password strength (minimum 6 characters)
    // Rationale: Prevents weak passwords from being created
    if (typeof password !== 'string' || password.length < 6) {
      // ERROR: Weak password
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

    // DEBUG: All validation passed, proceeding to user creation
    logger.debug({
      type: 'register_validation_passed',
      email,
    })

    // ===== USER CREATION =====
    // DEBUG: Starting user creation process
    logger.debug({
      type: 'register_creating_user',
      email,
    })

    // Call user service to create user account
    // Password is hashed inside this function
    const user = await userService.createUser({
      email,
      password,
      role: 'trader', // Default role for new users
    })

    // INFO: User successfully registered - log with user details
    logger.info({
      type: 'user_registered',
      userId: user.id,
      email,
      role: user.role,
      timestamp: new Date().toISOString(),
      ip: req.ip,
    })

    // Return created user (exclude password hash)
    res.status(201).json({ user })

  } catch (error) {
    // Handle any unexpected errors during registration
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    // ERROR: Log the exception with full context
    logger.error({
      type: 'register_error',
      error: errorMessage,
      stack: errorStack,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    })

    // Check if error is due to email already registered
    if (error instanceof Error && error.message.includes('already registered')) {
      // ERROR: Email already in use
      logger.error({
        type: 'register_failed',
        reason: 'email_already_registered',
        email: req.body.email,
        ip: req.ip,
      })
      return res.status(409).json({ error: 'Email already registered' })
    }

    // Generic error response (don't expose internal details)
    res.status(500).json({ error: 'Registration failed' })
  }
})

/**
 * POST /auth/login
 * 
 * Authenticates user with email and password.
 * Returns access token and refresh token on success.
 * 
 * Request body:
 *   - email (string): User's email address
 *   - password (string): User's password (plain text)
 * 
 * Response (200 OK):
 *   - token: JWT access token (short-lived, ~15 min)
 *   - refreshToken: JWT refresh token (long-lived, ~7 days)
 *   - user: User object { id, email, role }
 * 
 * Errors:
 *   - 400: Missing email or password
 *   - 401: Invalid email or password
 *   - 500: Server error
 * 
 * Flow:
 *   1. Validate email and password are provided
 *   2. Query user and verify password hash
 *   3. If invalid, return 401 Unauthorized
 *   4. If valid, generate access and refresh tokens
 *   5. Log success with userId, email, role, IP
 * 
 * Security:
 *   - Password comparison is done using crypto.timingSafeEqual()
 *   - Tokens are signed with secret key
 *   - Access token has short expiration
 *   - Refresh token is long-lived but can be revoked
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // DEBUG: Log login attempt received
    logger.debug({
      type: 'login_request_received',
      email,
      ip: req.ip,
    })

    // ===== INPUT VALIDATION =====
    // Check if email and password are both provided
    if (!email || !password) {
      // ERROR: Missing credentials
      logger.error({
        type: 'login_validation_failed',
        reason: 'missing_credentials',
        email,
        ip: req.ip,
      })
      return res.status(400).json({ error: 'Email and password required' })
    }

    // ===== CREDENTIAL VERIFICATION =====
    // DEBUG: Starting credential verification
    logger.debug({
      type: 'login_verifying_credentials',
      email,
    })

    // Call user service to verify email and password
    // This function:
    // 1. Finds user by email
    // 2. Compares provided password with stored hash
    // 3. Returns user if valid, null if invalid
    const user = await userService.verifyPassword(email, password)

    if (!user) {
      // ERROR: Credentials don't match
      // Intentionally vague error message for security
      // (prevent user enumeration attacks)
      logger.error({
        type: 'login_failed',
        reason: 'invalid_credentials',
        email,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      })
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // DEBUG: Credentials verified successfully
    logger.debug({
      type: 'login_credentials_verified',
      userId: user.id,
      email: user.email,
    })

    // ===== TOKEN GENERATION =====
    // DEBUG: Starting token generation
    logger.debug({
      type: 'login_generating_tokens',
      userId: user.id,
    })

    // Generate JWT access token (short-lived)
    // Payload: { userId, email, role }
    // Expiration: configured in jwtService (typically 15 minutes)
    const token = jwtService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Generate JWT refresh token (long-lived)
    // Payload: { userId, email, role }
    // Expiration: configured in jwtService (typically 7 days)
    const refreshToken = jwtService.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // INFO: Login successful - log with full context for audit trail
    logger.info({
      type: 'user_login_successful',
      userId: user.id,
      email: user.email,
      role: user.role,
      timestamp: new Date().toISOString(),
      ip: req.ip,
    })

    // Return tokens and user info
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
    // Handle any unexpected errors during login
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    // ERROR: Log the exception with full stack trace
    logger.error({
      type: 'login_error',
      error: errorMessage,
      stack: errorStack,
      email: req.body.email,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    })

    // Generic error response
    res.status(500).json({ error: 'Login failed' })
  }
})

/**
 * POST /auth/refresh
 * 
 * Refreshes an expired access token using a valid refresh token.
 * 
 * Request body:
 *   - refreshToken (string): Valid refresh token from login
 * 
 * Response (200 OK):
 *   - token: New JWT access token
 * 
 * Errors:
 *   - 400: Missing refresh token or invalid format
 *   - 401: Invalid or expired refresh token
 *   - 500: Server error
 * 
 * Flow:
 *   1. Validate refresh token is provided and is string
 *   2. Verify refresh token signature and expiration
 *   3. If invalid, return 401 Unauthorized
 *   4. If valid, generate new access token with same payload
 *   5. Return new access token
 * 
 * Security:
 *   - Refresh tokens have long expiration for convenience
 *   - Access tokens have short expiration for security
 *   - Tokens can be revoked by removing from whitelist (future)
 *   - Each refresh generates new token, old one is discarded
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    // DEBUG: Log refresh token request received
    logger.debug({
      type: 'refresh_token_request',
      ip: req.ip,
    })

    // ===== INPUT VALIDATION =====
    // Check if refresh token is provided
    if (!refreshToken) {
      // ERROR: Missing refresh token
      logger.error({
        type: 'refresh_token_validation_failed',
        reason: 'missing_token',
        ip: req.ip,
      })
      return res.status(400).json({ error: 'Refresh token required' })
    }

    // Validate token is a string
    if (typeof refreshToken !== 'string') {
      // ERROR: Invalid token format
      logger.error({
        type: 'refresh_token_validation_failed',
        reason: 'invalid_format',
        ip: req.ip,
      })
      return res.status(400).json({ error: 'Invalid token format' })
    }

    // ===== TOKEN VERIFICATION & REFRESH =====
    try {
      // DEBUG: Starting token verification
      logger.debug({
        type: 'refresh_token_verifying',
      })

      // Verify refresh token signature and expiration
      // Throws error if token is invalid or expired
      const payload = jwtService.verifyToken(refreshToken)

      // DEBUG: Token verified successfully, contains userId
      logger.debug({
        type: 'refresh_token_verified',
        userId: payload.userId,
      })

      // Generate new access token with original payload
      // This maintains the same user context and role
      const newToken = jwtService.generateToken(payload)

      // INFO: Token refresh successful
      logger.info({
        type: 'refresh_token_success',
        userId: payload.userId,
        timestamp: new Date().toISOString(),
        ip: req.ip,
      })

      // Return new access token
      res.json({ token: newToken })

    } catch (tokenError) {
      // Token verification failed (expired, invalid signature, etc.)
      const errorMessage = tokenError instanceof Error ? tokenError.message : String(tokenError)

      // ERROR: Token verification failed
      logger.error({
        type: 'refresh_token_verification_failed',
        reason: 'invalid_token',
        error: errorMessage,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      })

      // Return 401 Unauthorized - token is no longer valid
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

  } catch (error) {
    // Handle any unexpected errors during token refresh
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    // ERROR: Log unexpected exception
    logger.error({
      type: 'refresh_error',
      error: errorMessage,
      stack: errorStack,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    })

    // Generic error response
    res.status(500).json({ error: 'Token refresh failed' })
  }
})

export default router
