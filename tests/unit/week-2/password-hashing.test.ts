import { describe, it, expect } from 'vitest'
import { passwordService } from '@/services/password'

describe('Password Hashing', () => {
  it('should hash password correctly', async () => {
    const password = 'test123'
    const hash = await passwordService.hash(password)

    expect(hash).not.toBe(password)
    expect(hash.length).toBeGreaterThan(20)
  })

  it('should verify correct password', async () => {
    const password = 'test123'
    const hash = await passwordService.hash(password)
    const isValid = await passwordService.verify(password, hash)

    expect(isValid).toBe(true)
  })

  it('should reject incorrect password', async () => {
    const hash = await passwordService.hash('test123')
    const isValid = await passwordService.verify('wrongpassword', hash)

    expect(isValid).toBe(false)
  })

  it('should handle empty password', async () => {
    const hash = await passwordService.hash('')
    const isValid = await passwordService.verify('', hash)

    expect(isValid).toBe(true)
  })
})
