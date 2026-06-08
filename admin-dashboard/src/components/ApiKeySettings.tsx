/**
 * API Key Settings Component
 *
 * Allows users to configure their Claude and Zerodha API keys via secure backend.
 * - Keys are encrypted server-side
 * - Never stored locally
 * - Supports partial key configuration
 */

import { useState, useEffect } from 'react'
import { Box, Card, TextField, Button, Alert, Chip, Typography, CircularProgress } from '@mui/material'
import { CheckCircle, HighlightOff, Refresh } from '@mui/icons-material'
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

  const handleSaveKeys = async () => {
    // Validate at least one key is provided
    if (!claudeKey && !zerodhaKey && !zerodhaSecret) {
      setMessage('⚠️ Please provide at least one API key')
      setMessageType('error')
      return
    }

    // Validate Zerodha pair
    if ((zerodhaKey && !zerodhaSecret) || (!zerodhaKey && zerodhaSecret)) {
      setMessage('⚠️ Both Zerodha key and secret are required together')
      setMessageType('error')
      return
    }

    setLoading(true)
    try {
      await apiKeyService.saveKeys(claudeKey, zerodhaKey, zerodhaSecret, userId)

      setMessage('✅ API keys saved securely!')
      setMessageType('success')

      // Clear form
      setClaudeKey('')
      setZerodhaKey('')
      setZerodhaSecret('')

      // Check status
      await checkStatus()

      if (onKeysUpdated) {
        onKeysUpdated({ configured: true })
      }

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`❌ ${error instanceof Error ? error.message : 'Failed to save keys'}`)
      setMessageType('error')
    } finally {
      setLoading(false)
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
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: THEME_PRO.bgTertiary,
            },
          }}
        />

        <Button
          size="small"
          onClick={() => setShowClaude(!showClaude)}
          disabled={loading}
          sx={{
            mt: SPACING_PRO.sm,
            color: THEME_PRO.primary,
            textTransform: 'none',
          }}
        >
          {showClaude ? '🙈 Hide' : '👁️ Show'}
        </Button>
      </Card>

      {/* Zerodha API Keys */}
      <Card
        sx={{
          p: SPACING_PRO.xxl,
          borderRadius: RADIUS_PRO.lg,
          border: `1px solid ${THEME_PRO.border}`,
          boxShadow: SHADOWS_PRO.md,
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
          disabled={loading}
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
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: THEME_PRO.bgTertiary,
            },
          }}
        />

        <Button
          size="small"
          onClick={() => setShowZerodha(!showZerodha)}
          disabled={loading}
          sx={{
            mt: SPACING_PRO.sm,
            color: THEME_PRO.primary,
            textTransform: 'none',
          }}
        >
          {showZerodha ? '🙈 Hide' : '👁️ Show'}
        </Button>
      </Card>

      {/* Full Width Actions */}
      <Box sx={{ gridColumn: { xs: '1fr', md: '1 / -1' }, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: SPACING_PRO.lg }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSaveKeys}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
          sx={{
            backgroundColor: THEME_PRO.success,
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            py: SPACING_PRO.md,
            fontSize: '15px',
            '&:hover': {
              backgroundColor: THEME_PRO.success,
              opacity: 0.9,
            },
            '&:disabled': {
              backgroundColor: THEME_PRO.textTertiary,
            },
          }}
        >
          💾 Save API Keys
        </Button>

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
            fontSize: '15px',
          }}
        >
          🔄 Refresh
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
            fontSize: '15px',
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
