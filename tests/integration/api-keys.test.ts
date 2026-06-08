/**
 * API Keys Route Tests
 *
 * Comprehensive unit tests for API key management endpoints
 * Tests: Save, Retrieve, Update, Delete, and Status check
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import fetch from 'node-fetch'

const API_BASE = 'http://localhost:3000/api/v1'
const TEST_USER = 'test-api-keys-unit'
const TEST_CLAUDE_KEY = 'sk-ant-test-key-12345'
const TEST_ZERODHA_KEY = 'test-zerodha-key'
const TEST_ZERODHA_SECRET = 'test-zerodha-secret'

describe('API Keys Routes', () => {
  beforeEach(async () => {
    // Clean up before each test
    await fetch(`${API_BASE}/user/api-keys/claude`, {
      method: 'DELETE',
      headers: { 'X-User-ID': TEST_USER },
    })
    await fetch(`${API_BASE}/user/api-keys/zerodha`, {
      method: 'DELETE',
      headers: { 'X-User-ID': TEST_USER },
    })
  })

  describe('POST /user/api-keys - Save API Keys', () => {
    it('should save Claude API key successfully', async () => {
      const response = await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': TEST_USER,
        },
        body: JSON.stringify({
          claudeApiKey: TEST_CLAUDE_KEY,
        }),
      })

      const data = await response.json()
      expect(response.ok).toBe(true)
      expect(data.status).toBe('success')
      expect(data.results.claude).toBeDefined()
      expect(data.results.claude.stored).toBe(true)
    })

    it('should save Zerodha API keys successfully', async () => {
      const response = await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': TEST_USER,
        },
        body: JSON.stringify({
          zerodhaApiKey: TEST_ZERODHA_KEY,
          zerodhaApiSecret: TEST_ZERODHA_SECRET,
        }),
      })

      const data = await response.json()
      expect(response.ok).toBe(true)
      expect(data.status).toBe('success')
      expect(data.results.zerodha).toBeDefined()
      expect(data.results.zerodha.stored).toBe(true)
    })

    it('should save both Claude and Zerodha keys together', async () => {
      const response = await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': TEST_USER,
        },
        body: JSON.stringify({
          claudeApiKey: TEST_CLAUDE_KEY,
          zerodhaApiKey: TEST_ZERODHA_KEY,
          zerodhaApiSecret: TEST_ZERODHA_SECRET,
        }),
      })

      const data = await response.json()
      expect(response.ok).toBe(true)
      expect(data.results.claude.stored).toBe(true)
      expect(data.results.zerodha.stored).toBe(true)
    })

    it('should return error if no keys provided', async () => {
      const response = await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': TEST_USER,
        },
        body: JSON.stringify({}),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('At least one API key')
    })

    it('should return error if Zerodha key without secret', async () => {
      const response = await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': TEST_USER,
        },
        body: JSON.stringify({
          zerodhaApiKey: TEST_ZERODHA_KEY,
        }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Zerodha requires both')
    })

    it('should return error if Zerodha secret without key', async () => {
      const response = await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': TEST_USER,
        },
        body: JSON.stringify({
          zerodhaApiSecret: TEST_ZERODHA_SECRET,
        }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Zerodha requires both')
    })

    it('should return error if User ID is missing', async () => {
      const response = await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claudeApiKey: TEST_CLAUDE_KEY,
        }),
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toContain('User ID required')
    })
  })

  describe('GET /user/api-keys/status - Check Key Status', () => {
    it('should return not configured when no keys are set', async () => {
      const response = await fetch(`${API_BASE}/user/api-keys/status`, {
        headers: {
          'X-User-ID': `${TEST_USER}-empty`,
        },
      })

      const data = await response.json()
      expect(response.ok).toBe(true)
      expect(data.data.claude.configured).toBe(false)
      expect(data.data.zerodha.configured).toBe(false)
    })

    it('should return configured=true after saving Claude key', async () => {
      // Save key first
      await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': TEST_USER,
        },
        body: JSON.stringify({
          claudeApiKey: TEST_CLAUDE_KEY,
        }),
      })

      // Check status
      const response = await fetch(`${API_BASE}/user/api-keys/status`, {
        headers: {
          'X-User-ID': TEST_USER,
        },
      })

      const data = await response.json()
      expect(response.ok).toBe(true)
      expect(data.data.claude.configured).toBe(true)
      expect(data.data.claude.updatedAt).toBeDefined()
    })

    it('should return configured=true after saving Zerodha keys', async () => {
      // Save keys first
      await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': TEST_USER,
        },
        body: JSON.stringify({
          zerodhaApiKey: TEST_ZERODHA_KEY,
          zerodhaApiSecret: TEST_ZERODHA_SECRET,
        }),
      })

      // Check status
      const response = await fetch(`${API_BASE}/user/api-keys/status`, {
        headers: {
          'X-User-ID': TEST_USER,
        },
      })

      const data = await response.json()
      expect(response.ok).toBe(true)
      expect(data.data.zerodha.configured).toBe(true)
      expect(data.data.zerodha.updatedAt).toBeDefined()
    })

    it('should return timestamp when key was updated', async () => {
      // Save key
      await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': TEST_USER,
        },
        body: JSON.stringify({
          claudeApiKey: TEST_CLAUDE_KEY,
        }),
      })

      // Get status
      const response = await fetch(`${API_BASE}/user/api-keys/status`, {
        headers: {
          'X-User-ID': TEST_USER,
        },
      })

      const data = await response.json()
      expect(data.data.claude.updatedAt).toBeDefined()
      const timestamp = new Date(data.data.claude.updatedAt)
      expect(timestamp).toBeInstanceOf(Date)
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('DELETE /user/api-keys/{keyType} - Delete Keys', () => {
    it('should delete Claude key', async () => {
      // Save key first
      await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': TEST_USER,
        },
        body: JSON.stringify({
          claudeApiKey: TEST_CLAUDE_KEY,
        }),
      })

      // Verify it's saved
      let statusResponse = await fetch(`${API_BASE}/user/api-keys/status`, {
        headers: { 'X-User-ID': TEST_USER },
      })
      let data = await statusResponse.json()
      expect(data.data.claude.configured).toBe(true)

      // Delete it
      const deleteResponse = await fetch(`${API_BASE}/user/api-keys/claude`, {
        method: 'DELETE',
        headers: { 'X-User-ID': TEST_USER },
      })
      expect(deleteResponse.ok).toBe(true)

      // Verify it's deleted
      statusResponse = await fetch(`${API_BASE}/user/api-keys/status`, {
        headers: { 'X-User-ID': TEST_USER },
      })
      data = await statusResponse.json()
      expect(data.data.claude.configured).toBe(false)
    })

    it('should delete Zerodha keys', async () => {
      // Save keys first
      await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': TEST_USER,
        },
        body: JSON.stringify({
          zerodhaApiKey: TEST_ZERODHA_KEY,
          zerodhaApiSecret: TEST_ZERODHA_SECRET,
        }),
      })

      // Verify they're saved
      let statusResponse = await fetch(`${API_BASE}/user/api-keys/status`, {
        headers: { 'X-User-ID': TEST_USER },
      })
      let data = await statusResponse.json()
      expect(data.data.zerodha.configured).toBe(true)

      // Delete them
      const deleteResponse = await fetch(`${API_BASE}/user/api-keys/zerodha`, {
        method: 'DELETE',
        headers: { 'X-User-ID': TEST_USER },
      })
      expect(deleteResponse.ok).toBe(true)

      // Verify they're deleted
      statusResponse = await fetch(`${API_BASE}/user/api-keys/status`, {
        headers: { 'X-User-ID': TEST_USER },
      })
      data = await statusResponse.json()
      expect(data.data.zerodha.configured).toBe(false)
    })
  })

  describe('Update Scenarios', () => {
    it('should update Claude key on second save', async () => {
      const key1 = 'sk-ant-key-version-1'
      const key2 = 'sk-ant-key-version-2'

      // Save first version
      await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': TEST_USER,
        },
        body: JSON.stringify({ claudeApiKey: key1 }),
      })

      // Get first timestamp
      let statusResponse = await fetch(`${API_BASE}/user/api-keys/status`, {
        headers: { 'X-User-ID': TEST_USER },
      })
      let data = await statusResponse.json()
      const timestamp1 = data.data.claude.updatedAt

      // Wait a tiny bit
      await new Promise(resolve => setTimeout(resolve, 100))

      // Save second version
      await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': TEST_USER,
        },
        body: JSON.stringify({ claudeApiKey: key2 }),
      })

      // Get second timestamp
      statusResponse = await fetch(`${API_BASE}/user/api-keys/status`, {
        headers: { 'X-User-ID': TEST_USER },
      })
      data = await statusResponse.json()
      const timestamp2 = data.data.claude.updatedAt

      expect(data.data.claude.configured).toBe(true)
      expect(timestamp2).not.toBe(timestamp1) // Timestamp should be updated
      expect(new Date(timestamp2).getTime()).toBeGreaterThanOrEqual(new Date(timestamp1).getTime())
    })

    it('should keep both keys when updating one', async () => {
      // Save Claude
      await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': TEST_USER,
        },
        body: JSON.stringify({ claudeApiKey: TEST_CLAUDE_KEY }),
      })

      // Save Zerodha
      await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': TEST_USER,
        },
        body: JSON.stringify({
          zerodhaApiKey: TEST_ZERODHA_KEY,
          zerodhaApiSecret: TEST_ZERODHA_SECRET,
        }),
      })

      // Check both are configured
      let statusResponse = await fetch(`${API_BASE}/user/api-keys/status`, {
        headers: { 'X-User-ID': TEST_USER },
      })
      let data = await statusResponse.json()
      expect(data.data.claude.configured).toBe(true)
      expect(data.data.zerodha.configured).toBe(true)

      // Update Claude
      await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': TEST_USER,
        },
        body: JSON.stringify({ claudeApiKey: 'sk-ant-updated-key' }),
      })

      // Verify both still exist
      statusResponse = await fetch(`${API_BASE}/user/api-keys/status`, {
        headers: { 'X-User-ID': TEST_USER },
      })
      data = await statusResponse.json()
      expect(data.data.claude.configured).toBe(true)
      expect(data.data.zerodha.configured).toBe(true)
    })
  })
})
