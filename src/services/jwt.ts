import jwt from 'jsonwebtoken'
import { logger } from './logger.ts'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRY = '24h'
const JWT_REFRESH_EXPIRY = '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export const jwtService = {
  generateToken(payload: JWTPayload): string {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY })
    } catch (error) {
      logger.error({ type: 'jwt_sign_error', error })
      throw error
    }
  },

  generateRefreshToken(payload: JWTPayload): string {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRY })
    } catch (error) {
      logger.error({ type: 'jwt_refresh_sign_error', error })
      throw error
    }
  },

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      logger.error({ type: 'jwt_verify_error', error })
      throw error
    }
  },

  decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload | null
    } catch (error) {
      logger.error({ type: 'jwt_decode_error', error })
      return null
    }
  },
}
