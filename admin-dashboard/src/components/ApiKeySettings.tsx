/**
 * API Key Settings Component
 *
 * Allows users to configure their Claude and Zerodha API keys via secure backend.
 * - Keys are encrypted server-side
 * - Never stored locally
 * - Supports partial key configuration
 * - Individual Save/Update/Delete buttons for each key
 */

import { useState, useEffect } from 'react'
import { Box, Card, TextField, Button, Alert, Chip, Typography, CircularProgress } from '@mui/material'
import { CheckCircle, HighlightOff, Save, Edit, Delete, X } from '@mui/icons-material'
import { useAuthStore } from '../state/store'
import { apiKeyService } from '../services/api-key-service'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, SHADOWS_PRO } from '../theme-pro'

interface Props {
  onKeysUpdated?: (keys: { configured: boolean }) => void
}

export const ApiKeySettings = ({ onKeysUpdated }: Props) => {
  const { user } = useAuthStore()
  const userId = user?.id || 'default-user'

  const [claudeKey, setClaudeKey] = useState('')
  const [zerodhaKey, setZerodhaKey] = useState('')
  const [zerodhaSecret, setZerodhaSecret] = useState('')
  const [showClaude, setShowClaude] = useState(false)
  const [showZerodha, setShowZerodha] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [loading, setLoading] = useState(false)
  const [claudeLoading, setClaudeLoading] = useState(false)
  const [zerodhaLoading, setZerodhaLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Edit mode toggles
  const [claudeEditMode, setClaudeEditMode] = useState(false)
  const [zerodhaEditMode, setZerodhaEditMode] = useState(false)

  const [hasClaudeKey, setHasClaudeKey] = useState(false)
  const [hasZerodhaKey, setHasZerodhaKey] = useState(false)
  const [claudeUpdatedAt, setClaudeUpdatedAt] = useState<string | null>(null)
  const [zerodhaUpdatedAt, setZerodhaUpdatedAt] = useState<string | null>(null)

  // Load initial status when userId changes
  useEffect(() => {
    if (userId) {
      checkStatus()
    }
  }, [userId])

  const checkStatus = async () => {
    setChecking(true)
    try {
      const result = await fetch(`http://localhost:3000/api/v1/user/api-keys/status`, {
        headers: {
          'X-User-ID': userId,
        },
      })
      const data = await result.json()

      if (data.status === 'success') {
        setHasClaudeKey(data.data.claude.configured)
        setHasZerodhaKey(data.data.zerodha.configured)
        setClaudeUpdatedAt(data.data.claude.updatedAt)
        setZerodhaUpdatedAt(data.data.zerodha.updatedAt)
      }
    } catch (error) {
      console.error('Error checking status:', error)
    } finally {
      setChecking(false)
    }
  }

  const handleSaveClaudeKey = async () => {
    if (!claudeKey) {
      setMessage('⚠️ Please enter your Claude API key')
      setMessageType('error')
      return
    }

    setClaudeLoading(true)
    try {
      const response = await fetch(`http://localhost:3000/api/v1/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId,
        },
        body: JSON.stringify({
          claudeApiKey: claudeKey,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      // Verify save was successful
      if (data.results?.claude?.stored !== true) {
        throw new Error('Key was not stored - please try again')
      }

      setMessage('✅ Claude API key saved securely!')
      setMessageType('success')
      setClaudeKey('')
      setClaudeEditMode(false)

      // Small delay to ensure database transaction is complete
      await new Promise(resolve => setTimeout(resolve, 500))

      // Refresh status
      await checkStatus()

      if (onKeysUpdated) {
        onKeysUpdated({ configured: true })
      }

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`❌ ${error instanceof Error ? error.message : 'Failed to save Claude key'}`)
      setMessageType('error')
    } finally {
      setClaudeLoading(false)
    }
  }

  const handleSaveZerodhaKeys = async () => {
    if (!zerodhaKey || !zerodhaSecret) {
      setMessage('⚠️ Both Zerodha key and secret are required')
      setMessageType('error')
      return
    }

    setZerodhaLoading(true)
    try {
      const response = await fetch(`http://localhost:3000/api/v1/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId,
        },
        body: JSON.stringify({
          zerodhaApiKey: zerodhaKey,
          zerodhaApiSecret: zerodhaSecret,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      // Verify save was successful
      if (data.results?.zerodha?.stored !== true) {
        throw new Error('Keys were not stored - please try again')
      }

      setMessage('✅ Zerodha API keys saved securely!')
      setMessageType('success')
      setZerodhaKey('')
      setZerodhaSecret('')
      setZerodhaEditMode(false)

      // Small delay to ensure database transaction is complete
      await new Promise(resolve => setTimeout(resolve, 500))

      // Refresh status
      await checkStatus()

      if (onKeysUpdated) {
        onKeysUpdated({ configured: true })
      }

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`❌ ${error instanceof Error ? error.message : 'Failed to save Zerodha keys'}`)
      setMessageType('error')
    } finally {
      setZerodhaLoading(false)
    }
  }

  const handleDeleteClaudeKey = async () => {
    if (window.confirm('Are you sure you want to delete your Claude API key?')) {
      setClaudeLoading(true)
      try {
        const response = await fetch(`http://localhost:3000/api/v1/user/api-keys/claude`, {
          method: 'DELETE',
          headers: {
            'X-User-ID': userId,
          },
        })

        if (!response.ok) throw new Error('Failed to delete')

        setMessage('🗑️ Claude API key deleted')
        setMessageType('success')
        setClaudeKey('')
        setClaudeEditMode(false)
        await checkStatus()
        setTimeout(() => setMessage(''), 3000)
      } catch (error) {
        setMessage('❌ Failed to delete Claude key')
        setMessageType('error')
      } finally {
        setClaudeLoading(false)
      }
    }
  }

  const handleDeleteZerodhaKey = async () => {
    if (window.confirm('Are you sure you want to delete your Zerodha API keys?')) {
      setZerodhaLoading(true)
      try {
        const response = await fetch(`http://localhost:3000/api/v1/user/api-keys/zerodha`, {
          method: 'DELETE',
          headers: {
            'X-User-ID': userId,
          },
        })

        if (!response.ok) throw new Error('Failed to delete')

        setMessage('🗑️ Zerodha API keys deleted')
        setMessageType('success')
        setZerodhaKey('')
        setZerodhaSecret('')
        setZerodhaEditMode(false)
        await checkStatus()
        setTimeout(() => setMessage(''), 3000)
      } catch (error) {
        setMessage('❌ Failed to delete Zerodha keys')
        setMessageType('error')
      } finally {
        setZerodhaLoading(false)
      }
    }
  }

  if (checking) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: SPACING_PRO.xxxl }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: SPACING_PRO.xxl }}>
      {/* Claude API Key */}
      <Card
        sx={{
          p: SPACING_PRO.xxl,
          borderRadius: RADIUS_PRO.lg,
          border: `1px solid ${THEME_PRO.border}`,
          boxShadow: SHADOWS_PRO.md,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING_PRO.lg }}>
          <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary }}>
            🤖 Claude API Key
          </Typography>
          {hasClaudeKey && (
            <Chip
              icon={<CheckCircle />}
              label="Configured"
              sx={{
                backgroundColor: THEME_PRO.successLight,
                color: THEME_PRO.success,
                fontWeight: 600,
              }}
            />
          )}
          {!hasClaudeKey && (
            <Chip
              icon={<HighlightOff />}
              label="Not Set"
              sx={{
                backgroundColor: THEME_PRO.errorLight,
                color: THEME_PRO.error,
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary, mb: SPACING_PRO.md }}>
          Get your API key from:{' '}
          <a
            href="https://console.anthropic.com/account/keys"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: THEME_PRO.primary, textDecoration: 'none' }}
          >
            console.anthropic.com/account/keys
          </a>
        </Typography>

        {hasClaudeKey && !claudeEditMode && (
          <Box sx={{ mb: SPACING_PRO.lg, p: SPACING_PRO.lg, backgroundColor: THEME_PRO.successLight, borderRadius: RADIUS_PRO.md }}>
            <Typography sx={{ fontSize: '13px', color: THEME_PRO.success, fontWeight: 600, mb: SPACING_PRO.sm }}>
              ✅ Key is configured and secure
            </Typography>
            {claudeUpdatedAt && (
              <Typography sx={{ fontSize: '12px', color: THEME_PRO.success }}>
                Updated: {new Date(claudeUpdatedAt).toLocaleString()}
              </Typography>
            )}
          </Box>
        )}

        {claudeEditMode && (
          <TextField
            fullWidth
            label="Claude API Key"
            type={showClaude ? 'text' : 'password'}
            value={claudeKey}
            onChange={(e) => setClaudeKey(e.target.value)}
            placeholder="sk-ant-xxxxxxxxxxxxx"
            margin="normal"
            disabled={claudeLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: THEME_PRO.bgTertiary,
              },
            }}
          />
        )}

        {claudeEditMode && (
          <Button
            size="small"
            onClick={() => setShowClaude(!showClaude)}
            disabled={claudeLoading}
            sx={{
              mt: SPACING_PRO.sm,
              mb: SPACING_PRO.lg,
              color: THEME_PRO.primary,
              textTransform: 'none',
            }}
          >
            {showClaude ? '🙈 Hide' : '👁️ Show'}
          </Button>
        )}

        <Box sx={{ display: 'flex', gap: SPACING_PRO.sm, mt: 'auto' }}>
          {!claudeEditMode ? (
            <>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setClaudeEditMode(true)}
                disabled={claudeLoading}
                startIcon={<Edit />}
                sx={{
                  backgroundColor: THEME_PRO.primary,
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: SPACING_PRO.md,
                  fontSize: '14px',
                }}
              >
                {hasClaudeKey ? '✏️ Update' : '➕ Add Key'}
              </Button>
              {hasClaudeKey && (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleDeleteClaudeKey}
                  disabled={claudeLoading}
                  startIcon={<Delete />}
                  sx={{
                    borderColor: THEME_PRO.error,
                    color: THEME_PRO.error,
                    textTransform: 'none',
                    fontWeight: 600,
                    py: SPACING_PRO.md,
                    fontSize: '14px',
                  }}
                >
                  Delete
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSaveClaudeKey}
                disabled={claudeLoading || !claudeKey}
                startIcon={claudeLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                sx={{
                  backgroundColor: THEME_PRO.success,
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: SPACING_PRO.md,
                  fontSize: '14px',
                }}
              >
                {claudeLoading ? 'Saving...' : '💾 Save'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setClaudeEditMode(false)
                  setClaudeKey('')
                }}
                disabled={claudeLoading}
                startIcon={<X />}
                sx={{
                  borderColor: THEME_PRO.textTertiary,
                  color: THEME_PRO.textSecondary,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: SPACING_PRO.md,
                  fontSize: '14px',
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Card>

      {/* Zerodha API Keys */}
      <Card
        sx={{
          p: SPACING_PRO.xxl,
          borderRadius: RADIUS_PRO.lg,
          border: `1px solid ${THEME_PRO.border}`,
          boxShadow: SHADOWS_PRO.md,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING_PRO.lg }}>
          <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary }}>
            📈 Zerodha API Keys
          </Typography>
          {hasZerodhaKey && (
            <Chip
              icon={<CheckCircle />}
              label="Configured"
              sx={{
                backgroundColor: THEME_PRO.successLight,
                color: THEME_PRO.success,
                fontWeight: 600,
              }}
            />
          )}
          {!hasZerodhaKey && (
            <Chip
              icon={<HighlightOff />}
              label="Not Set"
              sx={{
                backgroundColor: THEME_PRO.errorLight,
                color: THEME_PRO.error,
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary, mb: SPACING_PRO.md }}>
          Get your credentials from:{' '}
          <a
            href="https://kite.zerodha.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: THEME_PRO.primary, textDecoration: 'none' }}
          >
            kite.zerodha.com
          </a>
        </Typography>

        {hasZerodhaKey && !zerodhaEditMode && (
          <Box sx={{ mb: SPACING_PRO.lg, p: SPACING_PRO.lg, backgroundColor: THEME_PRO.successLight, borderRadius: RADIUS_PRO.md }}>
            <Typography sx={{ fontSize: '13px', color: THEME_PRO.success, fontWeight: 600, mb: SPACING_PRO.sm }}>
              ✅ Keys are configured and secure
            </Typography>
            {zerodhaUpdatedAt && (
              <Typography sx={{ fontSize: '12px', color: THEME_PRO.success }}>
                Updated: {new Date(zerodhaUpdatedAt).toLocaleString()}
              </Typography>
            )}
          </Box>
        )}

        {zerodhaEditMode && (
          <>
            <TextField
              fullWidth
              label="Zerodha API Key"
              type={showZerodha ? 'text' : 'password'}
              value={zerodhaKey}
              onChange={(e) => setZerodhaKey(e.target.value)}
              placeholder="Your API Key"
              margin="normal"
              disabled={zerodhaLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: THEME_PRO.bgTertiary,
                },
              }}
            />

            <TextField
              fullWidth
              label="Zerodha API Secret"
              type={showZerodha ? 'text' : 'password'}
              value={zerodhaSecret}
              onChange={(e) => setZerodhaSecret(e.target.value)}
              placeholder="Your API Secret"
              margin="normal"
              disabled={zerodhaLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: THEME_PRO.bgTertiary,
                },
              }}
            />
          </>
        )}

        {zerodhaEditMode && (
          <Button
            size="small"
            onClick={() => setShowZerodha(!showZerodha)}
            disabled={zerodhaLoading}
            sx={{
              mt: SPACING_PRO.sm,
              mb: SPACING_PRO.lg,
              color: THEME_PRO.primary,
              textTransform: 'none',
            }}
          >
            {showZerodha ? '🙈 Hide' : '👁️ Show'}
          </Button>
        )}

        <Box sx={{ display: 'flex', gap: SPACING_PRO.sm, mt: 'auto' }}>
          {!zerodhaEditMode ? (
            <>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setZerodhaEditMode(true)}
                disabled={zerodhaLoading}
                startIcon={<Edit />}
                sx={{
                  backgroundColor: THEME_PRO.primary,
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: SPACING_PRO.md,
                  fontSize: '14px',
                }}
              >
                {hasZerodhaKey ? '✏️ Update' : '➕ Add Keys'}
              </Button>
              {hasZerodhaKey && (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleDeleteZerodhaKey}
                  disabled={zerodhaLoading}
                  startIcon={<Delete />}
                  sx={{
                    borderColor: THEME_PRO.error,
                    color: THEME_PRO.error,
                    textTransform: 'none',
                    fontWeight: 600,
                    py: SPACING_PRO.md,
                    fontSize: '14px',
                  }}
                >
                  Delete
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSaveZerodhaKeys}
                disabled={zerodhaLoading || !zerodhaKey || !zerodhaSecret}
                startIcon={zerodhaLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                sx={{
                  backgroundColor: THEME_PRO.success,
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: SPACING_PRO.md,
                  fontSize: '14px',
                }}
              >
                {zerodhaLoading ? 'Saving...' : '💾 Save'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setZerodhaEditMode(false)
                  setZerodhaKey('')
                  setZerodhaSecret('')
                }}
                disabled={zerodhaLoading}
                startIcon={<X />}
                sx={{
                  borderColor: THEME_PRO.textTertiary,
                  color: THEME_PRO.textSecondary,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: SPACING_PRO.md,
                  fontSize: '14px',
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Card>

      {/* Message */}
      {message && (
        <Alert
          sx={{
            gridColumn: { xs: '1fr', md: '1 / -1' },
            backgroundColor: messageType === 'success' ? THEME_PRO.successLight : THEME_PRO.errorLight,
            color: messageType === 'success' ? THEME_PRO.success : THEME_PRO.error,
            border: `1px solid ${messageType === 'success' ? THEME_PRO.success : THEME_PRO.error}`,
          }}
        >
          {message}
        </Alert>
      )}
    </Box>
  )
}
