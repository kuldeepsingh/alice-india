/**
 * API Key Settings Component
 *
 * Allows users to configure their Claude and Zerodha API keys.
 * Keys are stored securely in browser localStorage.
 * Supports partial entry - users can configure Claude only, Zerodha only, or both.
 */

import { useState, useEffect } from 'react'
import { Box, Card, TextField, Button, Alert, Chip, Typography } from '@mui/material'
import { CheckCircle, HighlightOff } from '@mui/icons-material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, SHADOWS_PRO } from '../theme-pro'

interface Props {
  onKeysUpdated?: (keys: {
    claudeApiKey: string
    zerodhaApiKey: string
    zerodhaApiSecret: string
  }) => void
}

export const ApiKeySettings = ({ onKeysUpdated }: Props) => {
  const [claudeKey, setClaudeKey] = useState('')
  const [zerodhaKey, setZerodhaKey] = useState('')
  const [zerodhaSecret, setZerodhaSecret] = useState('')
  const [showClaude, setShowClaude] = useState(false)
  const [showZerodha, setShowZerodha] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    // Load keys from localStorage
    const savedClaude = localStorage.getItem('claudeApiKey') || ''
    const savedZerodha = localStorage.getItem('zerodhaApiKey') || ''
    const savedSecret = localStorage.getItem('zerodhaApiSecret') || ''

    setClaudeKey(savedClaude)
    setZerodhaKey(savedZerodha)
    setZerodhaSecret(savedSecret)
  }, [])

  const handleSaveKeys = () => {
    // Allow saving if at least one key is provided
    if (!claudeKey && !zerodhaKey && !zerodhaSecret) {
      setMessage('⚠️ Please provide at least one API key')
      setMessageType('error')
      return
    }

    // If Zerodha key is provided, secret is also required (and vice versa)
    if ((zerodhaKey && !zerodhaSecret) || (!zerodhaKey && zerodhaSecret)) {
      setMessage('⚠️ Both Zerodha key and secret are required together')
      setMessageType('error')
      return
    }

    // Save to localStorage
    if (claudeKey) localStorage.setItem('claudeApiKey', claudeKey)
    if (zerodhaKey) localStorage.setItem('zerodhaApiKey', zerodhaKey)
    if (zerodhaSecret) localStorage.setItem('zerodhaApiSecret', zerodhaSecret)

    setMessage('✅ API keys saved successfully!')
    setMessageType('success')
    setTimeout(() => setMessage(''), 3000)

    if (onKeysUpdated) {
      onKeysUpdated({
        claudeApiKey: claudeKey,
        zerodhaApiKey: zerodhaKey,
        zerodhaApiSecret: zerodhaSecret,
      })
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all API keys?')) {
      localStorage.removeItem('claudeApiKey')
      localStorage.removeItem('zerodhaApiKey')
      localStorage.removeItem('zerodhaApiSecret')
      setClaudeKey('')
      setZerodhaKey('')
      setZerodhaSecret('')
      setMessage('🗑️ All API keys cleared')
      setMessageType('success')
      setTimeout(() => setMessage(''), 3000)
    }
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
          {claudeKey && (
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
          {!claudeKey && (
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
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: THEME_PRO.bgTertiary,
            },
          }}
        />

        <Button
          size="small"
          onClick={() => setShowClaude(!showClaude)}
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
          {zerodhaKey && zerodhaSecret && (
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
          {(!zerodhaKey || !zerodhaSecret) && (
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
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: THEME_PRO.bgTertiary,
            },
          }}
        />

        <Button
          size="small"
          onClick={() => setShowZerodha(!showZerodha)}
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
      <Box sx={{ gridColumn: { xs: '1fr', md: '1 / -1' }, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING_PRO.lg }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSaveKeys}
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
          }}
        >
          💾 Save API Keys
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleClearAll}
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
        🔐 <strong>Security Notice:</strong> Your API keys are stored locally in your browser (localStorage) only. They are never sent to our servers
        unless you make an actual API call. You can clear them anytime in your browser settings.
      </Alert>
    </Box>
  )
}
