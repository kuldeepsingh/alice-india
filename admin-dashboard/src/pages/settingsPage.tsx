import React, { useState, useEffect } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Button, TextField, Switch, FormControlLabel, Divider, Alert } from '@mui/material'
import { Save, Visibility, VisibilityOff } from '@mui/icons-material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, SHADOWS_PRO } from '../theme-pro'

export function settingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      setApiKey(settings.apiKey || '')
      setDarkMode(settings.darkMode || false)
      setNotifications(settings.notifications !== false)
      setAutoRefresh(settings.autoRefresh !== false)
    }
  }, [])

  const handleSaveSettings = () => {
    const settings = {
      apiKey,
      darkMode,
      notifications,
      autoRefresh,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem('appSettings', JSON.stringify(settings))
    setSavedMessage('✅ Settings saved successfully!')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setSavedMessage('📋 API Key copied to clipboard!')
    setTimeout(() => setSavedMessage(''), 2000)
  }

  const handleResetSettings = () => {
    setApiKey('')
    setDarkMode(false)
    setNotifications(true)
    setAutoRefresh(true)
    localStorage.removeItem('appSettings')
    setSavedMessage('🔄 Settings reset to defaults')
    setTimeout(() => setSavedMessage(''), 2000)
  }

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            ⚙️ Settings
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>
            Configure your trading platform preferences and API credentials
          </Typography>
        </Box>

        {/* Success Message */}
        {savedMessage && (
          <Alert sx={{ mb: SPACING_PRO.lg, backgroundColor: THEME_PRO.successLight, color: '#059669', border: `1px solid #10B981` }}>
            {savedMessage}
          </Alert>
        )}

        {/* Settings Sections */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: SPACING_PRO.xxxl }}>
          {/* API Configuration */}
          <Card sx={{ p: SPACING_PRO.xxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, boxShadow: SHADOWS_PRO.md }}>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
              🔑 API Configuration
            </Typography>
            <Typography sx={{ color: THEME_PRO.textSecondary, fontSize: '13px', mb: SPACING_PRO.lg }}>
              Add your Zerodha or trading API key for automated trading
            </Typography>

            <Box sx={{ mb: SPACING_PRO.lg }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: THEME_PRO.textTertiary, mb: SPACING_PRO.sm, textTransform: 'uppercase' }}>
                API Key
              </Typography>
              <Box sx={{ display: 'flex', gap: SPACING_PRO.sm }}>
                <TextField
                  fullWidth
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: THEME_PRO.bgTertiary,
                      '& fieldset': { borderColor: THEME_PRO.border },
                      '&:hover fieldset': { borderColor: THEME_PRO.primary },
                    },
                  }}
                  size="small"
                />
                <Button
                  onClick={() => setShowApiKey(!showApiKey)}
                  sx={{
                    minWidth: '44px',
                    color: THEME_PRO.primary,
                    border: `1px solid ${THEME_PRO.border}`,
                    borderRadius: RADIUS_PRO.md,
                  }}
                >
                  {showApiKey ? <VisibilityOff /> : <Visibility />}
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: SPACING_PRO.sm }}>
              <Button
                onClick={handleCopyApiKey}
                disabled={!apiKey}
                variant="outlined"
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  color: THEME_PRO.primary,
                  borderColor: THEME_PRO.border,
                  '&:hover': { backgroundColor: THEME_PRO.primaryLight },
                }}
              >
                Copy Key
              </Button>
              <Button
                onClick={handleSaveSettings}
                variant="contained"
                startIcon={<Save />}
                sx={{
                  flex: 1,
                  backgroundColor: THEME_PRO.primary,
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: THEME_PRO.primaryDark },
                }}
              >
                Save
              </Button>
            </Box>
          </Card>

          {/* Theme & Display */}
          <Card sx={{ p: SPACING_PRO.xxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, boxShadow: SHADOWS_PRO.md }}>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
              🎨 Theme & Display
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: SPACING_PRO.lg }}>
              <FormControlLabel
                control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: THEME_PRO.textPrimary }}>
                      Dark Mode
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary }}>
                      {darkMode ? 'Enabled' : 'Currently using light mode'}
                    </Typography>
                  </Box>
                }
                sx={{ width: '100%', m: 0 }}
              />

              <Divider sx={{ borderColor: THEME_PRO.border }} />

              <FormControlLabel
                control={<Switch checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />}
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: THEME_PRO.textPrimary }}>
                      Notifications
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary }}>
                      {notifications ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </Box>
                }
                sx={{ width: '100%', m: 0 }}
              />

              <Divider sx={{ borderColor: THEME_PRO.border }} />

              <FormControlLabel
                control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />}
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: THEME_PRO.textPrimary }}>
                      Auto Refresh
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary }}>
                      {autoRefresh ? 'Every 30 seconds' : 'Disabled'}
                    </Typography>
                  </Box>
                }
                sx={{ width: '100%', m: 0 }}
              />
            </Box>
          </Card>
        </Box>

        {/* Account & Security */}
        <Card sx={{ p: SPACING_PRO.xxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, boxShadow: SHADOWS_PRO.md, mb: SPACING_PRO.xxxl }}>
          <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
            🔐 Account & Security
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: SPACING_PRO.lg }}>
            <Box sx={{ p: SPACING_PRO.lg, backgroundColor: THEME_PRO.bgTertiary, borderRadius: RADIUS_PRO.md }}>
              <Typography sx={{ fontSize: '12px', color: THEME_PRO.textTertiary, textTransform: 'uppercase', fontWeight: 600, mb: SPACING_PRO.sm }}>
                Account Status
              </Typography>
              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: THEME_PRO.success }}>
                ✓ Active
              </Typography>
            </Box>
            <Box sx={{ p: SPACING_PRO.lg, backgroundColor: THEME_PRO.bgTertiary, borderRadius: RADIUS_PRO.md }}>
              <Typography sx={{ fontSize: '12px', color: THEME_PRO.textTertiary, textTransform: 'uppercase', fontWeight: 600, mb: SPACING_PRO.sm }}>
                Last Updated
              </Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: THEME_PRO.textPrimary }}>
                {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: THEME_PRO.border, my: SPACING_PRO.lg }} />

          <Box sx={{ display: 'flex', gap: SPACING_PRO.sm }}>
            <Button
              onClick={handleSaveSettings}
              variant="contained"
              startIcon={<Save />}
              sx={{
                backgroundColor: THEME_PRO.primary,
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                px: SPACING_PRO.xxl,
                '&:hover': { backgroundColor: THEME_PRO.primaryDark },
              }}
            >
              Save All Settings
            </Button>
            <Button
              onClick={handleResetSettings}
              variant="outlined"
              sx={{
                color: THEME_PRO.error,
                borderColor: THEME_PRO.error,
                textTransform: 'none',
                fontWeight: 600,
                px: SPACING_PRO.xxl,
                '&:hover': { backgroundColor: THEME_PRO.errorLight },
              }}
            >
              Reset to Defaults
            </Button>
          </Box>
        </Card>
      </Box>
    </LayoutPro>
  )
}
