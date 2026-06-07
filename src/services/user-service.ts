import { v4 as uuidv4 } from 'uuid'
import { passwordService } from './password.ts'
import { logger } from './logger.ts'

export interface User {
  id: string
  email: string
  password_hash: string
  role: 'admin' | 'trader' | 'viewer'
  created_at: string
  updated_at: string
}

export interface CreateUserRequest {
  email: string
  password: string
  role?: 'admin' | 'trader' | 'viewer'
}

export interface LoginRequest {
  email: string
  password: string
}

// In-memory storage for demo (will be replaced with database)
const users: Map<string, User> = new Map()

export const userService = {
  async createUser(request: CreateUserRequest): Promise<Omit<User, 'password_hash'>> {
    logger.info({
      type: 'user_creation_start',
      email: request.email,
    })

    // Check if user exists
    const existingUser = Array.from(users.values()).find(u => u.email === request.email)
    if (existingUser) {
      throw new Error('Email already registered')
    }

    const id = uuidv4()
    const passwordHash = await passwordService.hash(request.password)
    const now = new Date().toISOString()

    const user: User = {
      id,
      email: request.email,
      password_hash: passwordHash,
      role: request.role || 'trader',
      created_at: now,
      updated_at: now,
    }

    users.set(id, user)

    logger.info({
      type: 'user_created',
      userId: id,
      email: request.email,
    })

    const { password_hash, ...userWithoutHash } = user
    return userWithoutHash as Omit<User, 'password_hash'>
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const user = Array.from(users.values()).find(u => u.email === email)
    return user || null
  },

  async getUserById(id: string): Promise<User | null> {
    return users.get(id) || null
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
