import React, { useState } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Button, Divider, Alert, Select, MenuItem } from '@mui/material'
import { Save } from '@mui/icons-material'
import { useAuthStore } from '../state/store'
import { THEME_PRO, getTheme, SPACING_PRO, RADIUS_PRO, SHADOWS_PRO } from '../theme-pro'
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '../content/currencies'
import { ApiKeySettings } from '../components/ApiKeySettings'

export function settingsPage() {
  const { currency, setCurrency, darkMode } = useAuthStore()
  const theme = getTheme(darkMode)
  const [savedMessage, setSavedMessage] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState(currency)

  const handleSaveSettings = () => {
    setCurrency(selectedCurrency)
    setSavedMessage('✅ Settings saved successfully!')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handleResetSettings = () => {
    setSelectedCurrency(DEFAULT_CURRENCY.code)
    setCurrency(DEFAULT_CURRENCY.code)
    setSavedMessage('🔄 Settings reset to defaults')
    setTimeout(() => setSavedMessage(''), 2000)
  }

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: theme.bgPrimary, minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: theme.textPrimary, mb: SPACING_PRO.md }}>
            ⚙️ Settings
          </Typography>
          <Typography sx={{ color: theme.textSecondary }}>
            Configure your trading platform preferences and API credentials
          </Typography>
        </Box>

        {/* Success Message */}
        {savedMessage && (
          <Alert sx={{ mb: SPACING_PRO.lg, backgroundColor: theme.successLight, color: theme.success, border: `1px solid ${theme.success}` }}>
            {savedMessage}
          </Alert>
        )}

        {/* Settings Sections */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: SPACING_PRO.xxxl }}>
          {/* Currency Settings */}
          <Card sx={{ p: SPACING_PRO.xxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, boxShadow: SHADOWS_PRO.md }}>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
              💱 Currency Settings
            </Typography>

            <Box>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: THEME_PRO.textTertiary, mb: SPACING_PRO.sm, textTransform: 'uppercase' }}>
                Default Currency
              </Typography>
              <Typography sx={{ color: THEME_PRO.textSecondary, fontSize: '13px', mb: SPACING_PRO.md }}>
                Select your preferred currency for displaying prices and values
              </Typography>

              <Select
                fullWidth
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                sx={{
                  backgroundColor: THEME_PRO.bgTertiary,
                  color: THEME_PRO.textPrimary,
                  borderRadius: RADIUS_PRO.md,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: THEME_PRO.border,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: THEME_PRO.primary,
                  },
                  '& .MuiSvgIcon-root': {
                    color: THEME_PRO.textSecondary,
                  },
                }}
              >
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <MenuItem key={curr.code} value={curr.code}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
                      <Typography sx={{ fontWeight: 600 }}>{curr.symbol}</Typography>
                      <Typography sx={{ fontWeight: 600 }}>{curr.code}</Typography>
                      <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary, ml: 'auto' }}>
                        {curr.name}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>

              <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary, mt: SPACING_PRO.md }}>
                Current selection: {SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency)?.symbol} {selectedCurrency}
              </Typography>
            </Box>
          </Card>
        </Box>

        {/* API Keys Configuration */}
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h5" sx={{ fontSize: '24px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
            🔑 API Keys Configuration
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary, mb: SPACING_PRO.xl }}>
            Configure your Claude and Zerodha API keys for trading and AI features
          </Typography>
          <ApiKeySettings userId="default-user" />
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
