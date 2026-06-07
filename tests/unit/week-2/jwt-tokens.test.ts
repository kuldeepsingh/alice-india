import { describe, it, expect } from 'vitest'
import { jwtService } from '@/services/jwt'

describe('JWT Token Service', () => {
  const payload = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'trader',
  }

  it('should generate valid token', () => {
    const token = jwtService.generateToken(payload)

    expect(token).toBeDefined()
    expect(token.length).toBeGreaterThan(20)
  })

  it('should verify valid token', () => {
    const token = jwtService.generateToken(payload)
    const decoded = jwtService.verifyToken(token)

    expect(decoded.userId).toBe(payload.userId)
    expect(decoded.email).toBe(payload.email)
    expect(decoded.role).toBe(payload.role)
  })

  it('should reject invalid token', () => {
    expect(() => {
      jwtService.verifyToken('invalid.token.here')
    }).toThrow()
  })

  it('should generate refresh token', () => {
    const refreshToken = jwtService.generateRefreshToken(payload)

    expect(refreshToken).toBeDefined()
    expect(refreshToken).not.toBe(jwtService.generateToken(payload))
  })

  it('should decode token without verification', () => {
    const token = jwtService.generateToken(payload)
    const decoded = jwtService.decodeToken(token)

    expect(decoded).not.toBeNull()
    expect(decoded?.userId).toBe(payload.userId)
  })
})
