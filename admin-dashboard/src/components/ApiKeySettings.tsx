/**
 * API Key Settings Component
 *
 * Allows users to configure their Claude and Zerodha API keys via secure backend.
 * - Keys are encrypted server-side
 * - Never stored locally
 * - Supports partial key configuration
 * - Each key has its own individual Save button
 */

import { useState, useEffect } from 'react'
import { Box, Card, TextField, Button, Alert, Chip, Typography, CircularProgress } from '@mui/material'
import { CheckCircle, HighlightOff, Refresh, Save } from '@mui/icons-material'
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

  const [hasClaudeKey, setHasClaudeKey] = useState(false)
  const [hasZerodhaKey, setHasZerodhaKey] = useState(false)

  // Load initial status
  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setChecking(true)
    try {
      const status = await apiKeyService.getStatus(userId)
      setHasClaudeKey(status.claude)
      setHasZerodhaKey(status.zerodha)
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
      await apiKeyService.saveKeys(claudeKey, undefined, undefined, userId)

      setMessage('✅ Claude API key saved securely!')
      setMessageType('success')
      setClaudeKey('')
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
      await apiKeyService.saveKeys(undefined, zerodhaKey, zerodhaSecret, userId)

      setMessage('✅ Zerodha API keys saved securely!')
      setMessageType('success')
      setZerodhaKey('')
      setZerodhaSecret('')
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

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all API keys?')) {
      setLoading(true)
      try {
        await apiKeyService.deleteAllKeys(userId)
        setMessage('🗑️ All API keys cleared')
        setMessageType('success')
        setClaudeKey('')
        setZerodhaKey('')
        setZerodhaSecret('')
        await checkStatus()
        setTimeout(() => setMessage(''), 3000)
      } catch (error) {
        setMessage('❌ Failed to clear keys')
        setMessageType('error')
      } finally {
        setLoading(false)
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
            '&:hover': {
              backgroundColor: THEME_PRO.success,
              opacity: 0.9,
            },
            '&:disabled': {
              backgroundColor: THEME_PRO.textTertiary,
            },
          }}
        >
          {claudeLoading ? 'Saving...' : '💾 Save Key'}
        </Button>
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
            '&:hover': {
              backgroundColor: THEME_PRO.success,
              opacity: 0.9,
            },
            '&:disabled': {
              backgroundColor: THEME_PRO.textTertiary,
            },
          }}
        >
          {zerodhaLoading ? 'Saving...' : '💾 Save Keys'}
        </Button>
      </Card>

      {/* Actions */}
      <Box sx={{ gridColumn: { xs: '1fr', md: '1 / -1' }, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING_PRO.lg }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={checkStatus}
          disabled={loading}
          startIcon={<Refresh />}
          sx={{
            borderColor: THEME_PRO.primary,
            color: THEME_PRO.primary,
            textTransform: 'none',
            fontWeight: 600,
            py: SPACING_PRO.md,
            fontSize: '14px',
          }}
        >
          🔄 Refresh Status
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleClearAll}
          disabled={loading || (!hasClaudeKey && !hasZerodhaKey)}
          sx={{
            borderColor: THEME_PRO.error,
            color: THEME_PRO.error,
            textTransform: 'none',
            fontWeight: 600,
            py: SPACING_PRO.md,
            fontSize: '14px',
          }}
        >
          🗑️ Clear All
        </Button>
      </Box>

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

      {/* Security Notice */}
      <Alert
        sx={{
          gridColumn: { xs: '1fr', md: '1 / -1' },
          backgroundColor: THEME_PRO.warningLight,
          color: THEME_PRO.warning,
          border: `1px solid ${THEME_PRO.warning}`,
          fontSize: '13px',
        }}
      >
        🔐 <strong>Security:</strong> Your API keys are encrypted and stored securely on our server. They are never stored in your browser. Only you can manage your keys.
      </Alert>
    </Box>
  )
}
