import { v4 as uuidv4 } from 'uuid'
import { passwordService } from './password.ts'
import { logger } from './logger.ts'
import { query } from './database.ts'

export interface User {
  id: string
  email: string
  password_hash: string
  name?: string
  role: 'admin' | 'trader' | 'viewer'
  created_at: string
}

export interface CreateUserRequest {
  email: string
  password: string
  role?: 'admin' | 'trader' | 'viewer'
}

export const userService = {
  async createUser(request: CreateUserRequest): Promise<Omit<User, 'password_hash'>> {
    logger.info({
      type: 'user_creation_start',
      email: request.email,
    })

    // Check if user exists
    const existingResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [request.email]
    )

    if (existingResult.rows.length > 0) {
      throw new Error('Email already registered')
    }

    const id = uuidv4()
    const passwordHash = await passwordService.hash(request.password)
    const role = request.role || 'trader'
    const now = new Date().toISOString()

    const result = await query(
      'INSERT INTO users (id, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, created_at',
      [id, request.email, passwordHash, role, now]
    )

    logger.info({
      type: 'user_created',
      userId: id,
      email: request.email,
    })

    return result.rows[0]
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT id, email, password_hash, name, role, created_at FROM users WHERE email = $1',
      [email]
    )

    return result.rows[0] || null
  },

  async getUserById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT id, email, password_hash, name, role, created_at FROM users WHERE id = $1',
      [id]
    )

    return result.rows[0] || null
  },

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email)
    if (!user) {
      return null
    }

    const isValid = await passwordService.verify(password, user.password_hash)
    return isValid ? user : null
  },
}
