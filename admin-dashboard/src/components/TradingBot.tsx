/**
 * Trading Bot Component
 *
 * Main trading bot interface for creating orders and testing Claude AI features.
 * API keys are now configured from the Settings page only (stored securely on backend).
 *
 * This component is part of the autonomous trading bot system.
 */

import { useState, useEffect } from 'react'
import { Box, Card, Typography, TextField, Button, Alert, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { CheckCircle, HighlightOff, SendToMobile, SmartToy } from '@mui/icons-material'
import { useAuthStore } from '../state/store'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, SHADOWS_PRO } from '../theme-pro'

export const TradingBot = () => {
  const { user } = useAuthStore()
  const userId = user?.id || 'default-user'

  const [backendStatus, setBackendStatus] = useState('checking...')
  const [backendConnected, setBackendConnected] = useState(false)
  const [keyStatus, setKeyStatus] = useState({ claude: false, zerodha: false })
  const [symbol, setSymbol] = useState('RELIANCE')
  const [quantity, setQuantity] = useState('10')
  const [price, setPrice] = useState('2850')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [resultDialog, setResultDialog] = useState(false)

  // Check backend health and key status
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:3000/health/live')
        if (response.ok) {
          setBackendStatus('Connected')
          setBackendConnected(true)
          // Check key status from backend
          await checkKeyStatus()
        } else {
          setBackendStatus('Cannot reach backend')
          setBackendConnected(false)
        }
      } catch (error) {
        setBackendStatus('Cannot reach backend')
        setBackendConnected(false)
      }
    }

    // Initial check
    checkHealth()

    // Poll for key status changes every 2 seconds
    const statusInterval = setInterval(() => {
      checkKeyStatus()
    }, 2000)

    return () => clearInterval(statusInterval)
  }, [userId])

  const checkKeyStatus = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('http://localhost:3000/api/v1/user/api-keys/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.status === 'success') {
        setKeyStatus({
          claude: data.data.claude.configured,
          zerodha: data.data.zerodha.configured,
        })
      }
    } catch (error) {
      console.error('Error checking key status:', error)
    }
  }

  const handleCreateOrder = async () => {
    if (!keyStatus.zerodha) {
      setResult({
        status: 'error',
        data: { error: 'Zerodha API keys not configured. Please configure in Settings page.' },
      })
      setResultDialog(true)
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('http://localhost:3000/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol,
          quantity: parseInt(quantity),
          price: parseFloat(price),
          type: 'BUY',
        }),
      })

      const data = await response.json()
      setResult({
        status: response.ok ? 'success' : 'error',
        data,
      })
      setResultDialog(true)
    } catch (error) {
      setResult({
        status: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      })
      setResultDialog(true)
    } finally {
      setLoading(false)
    }
  }

  const handleTestClaude = async () => {
    if (!keyStatus.claude) {
      setResult({
        status: 'error',
        data: { error: 'Claude API key not configured. Please configure in Settings page.' },
      })
      setResultDialog(true)
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('http://localhost:3000/api/v1/market-analysis/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: symbol,
          marketData: 'Sample market data for testing',
        }),
      })

      const data = await response.json()
      setResult({
        status: response.ok ? 'success' : 'error',
        data,
      })
      setResultDialog(true)
    } catch (error) {
      setResult({
        status: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      })
      setResultDialog(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: SPACING_PRO.lg }}>
      {/* Trading Interface */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: SPACING_PRO.xxl,
        }}
      >
        {/* Order Creation */}
        <Box>
          <Card
            sx={{
              p: SPACING_PRO.xxl,
              borderRadius: RADIUS_PRO.lg,
              border: `1px solid ${THEME_PRO.border}`,
              boxShadow: SHADOWS_PRO.md,
              backgroundColor: THEME_PRO.bgSecondary,
            }}
          >
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
              📝 Create Order
            </Typography>

            {!keyStatus.zerodha && (
              <Alert
                sx={{
                  mb: SPACING_PRO.lg,
                  backgroundColor: THEME_PRO.warningLight,
                  color: THEME_PRO.warning,
                  border: `1px solid ${THEME_PRO.warning}`,
                }}
              >
                ⚠️ Zerodha API keys not configured. Go to Settings page to configure.
              </Alert>
            )}

            <TextField
              fullWidth
              label="Symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="RELIANCE"
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: THEME_PRO.bgTertiary,
                  color: THEME_PRO.textPrimary,
                  '& fieldset': { borderColor: THEME_PRO.border },
                  '&:hover fieldset': { borderColor: THEME_PRO.primary },
                },
                '& .MuiInputBase-input': { color: THEME_PRO.textPrimary },
                '& .MuiFormLabel-root': { color: THEME_PRO.textSecondary },
              }}
            />

            <TextField
              fullWidth
              label="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              type="number"
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: THEME_PRO.bgTertiary,
                  color: THEME_PRO.textPrimary,
                  '& fieldset': { borderColor: THEME_PRO.border },
                  '&:hover fieldset': { borderColor: THEME_PRO.primary },
                },
                '& .MuiInputBase-input': { color: THEME_PRO.textPrimary },
                '& .MuiFormLabel-root': { color: THEME_PRO.textSecondary },
              }}
            />

            <TextField
              fullWidth
              label="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: THEME_PRO.bgTertiary,
                  color: THEME_PRO.textPrimary,
                  '& fieldset': { borderColor: THEME_PRO.border },
                  '&:hover fieldset': { borderColor: THEME_PRO.primary },
                },
                '& .MuiInputBase-input': { color: THEME_PRO.textPrimary },
                '& .MuiFormLabel-root': { color: THEME_PRO.textSecondary },
              }}
            />

            {/* Order Summary */}
            <Box sx={{ mt: SPACING_PRO.lg, p: SPACING_PRO.lg, backgroundColor: THEME_PRO.bgTertiary, borderRadius: RADIUS_PRO.md }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: THEME_PRO.textSecondary, mb: SPACING_PRO.sm }}>
                💰 Order Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '13px', color: THEME_PRO.textSecondary }}>Total Value:</Typography>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: THEME_PRO.primary }}>
                  ₹{quantity && price ? (parseFloat(quantity) * parseFloat(price)).toLocaleString('en-IN') : '0'}
                </Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendToMobile />}
              onClick={handleCreateOrder}
              disabled={loading || !keyStatus.zerodha || !backendConnected}
              sx={{
                mt: SPACING_PRO.lg,
                backgroundColor: keyStatus.zerodha ? THEME_PRO.success : THEME_PRO.textTertiary,
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                py: SPACING_PRO.md,
              }}
            >
              {loading ? 'Creating Order...' : 'Create Order'}
            </Button>
          </Card>
        </Box>

        {/* Claude AI Test */}
        <Box>
          <Card
            sx={{
              p: SPACING_PRO.xxl,
              borderRadius: RADIUS_PRO.lg,
              border: `1px solid ${THEME_PRO.border}`,
              boxShadow: SHADOWS_PRO.md,
              backgroundColor: THEME_PRO.bgSecondary,
            }}
          >
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
              🧠 Claude AI Analysis
            </Typography>

            {!keyStatus.claude && (
              <Alert
                sx={{
                  mb: SPACING_PRO.lg,
                  backgroundColor: THEME_PRO.warningLight,
                  color: THEME_PRO.warning,
                  border: `1px solid ${THEME_PRO.warning}`,
                }}
              >
                ⚠️ Claude API key not configured. Go to Settings page to configure.
              </Alert>
            )}

            <Box sx={{ p: SPACING_PRO.lg, backgroundColor: THEME_PRO.bgTertiary, borderRadius: RADIUS_PRO.md, mb: SPACING_PRO.lg }}>
              <Typography sx={{ fontSize: '13px', color: THEME_PRO.textSecondary }}>
                📊 Analyzing: <strong>{symbol}</strong>
              </Typography>
              <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary, mt: SPACING_PRO.sm }}>
                Test Claude AI's market analysis, sentiment detection, and risk assessment capabilities.
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SmartToy />}
              onClick={handleTestClaude}
              disabled={loading || !keyStatus.claude || !backendConnected}
              sx={{
                backgroundColor: keyStatus.claude ? THEME_PRO.primary : THEME_PRO.textTertiary,
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                py: SPACING_PRO.md,
                '&:hover': {
                  backgroundColor: keyStatus.claude ? THEME_PRO.primaryDark : THEME_PRO.textTertiary,
                }
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze with Claude'}
            </Button>

            {/* API Key Status */}
            <Box sx={{ mt: SPACING_PRO.lg, pt: SPACING_PRO.lg, borderTop: `1px solid ${THEME_PRO.border}` }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: THEME_PRO.textSecondary, mb: SPACING_PRO.md }}>
                🔑 API Status
              </Typography>
              <Box sx={{ display: 'flex', gap: SPACING_PRO.sm }}>
                <Chip
                  icon={keyStatus.claude ? <CheckCircle /> : <HighlightOff />}
                  label="Claude"
                  size="small"
                  sx={{
                    backgroundColor: keyStatus.claude ? THEME_PRO.successLight : THEME_PRO.errorLight,
                    color: keyStatus.claude ? THEME_PRO.success : THEME_PRO.error,
                    fontWeight: 600,
                  }}
                />
                <Chip
                  icon={keyStatus.zerodha ? <CheckCircle /> : <HighlightOff />}
                  label="Zerodha"
                  size="small"
                  sx={{
                    backgroundColor: keyStatus.zerodha ? THEME_PRO.successLight : THEME_PRO.errorLight,
                    color: keyStatus.zerodha ? THEME_PRO.success : THEME_PRO.error,
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Result Dialog */}
      <Dialog
        open={resultDialog}
        onClose={() => setResultDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: RADIUS_PRO.lg,
            backgroundColor: THEME_PRO.bgPrimary,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: result?.status === 'success' ? THEME_PRO.success : THEME_PRO.error }}>
          {result?.status === 'success' ? '✅ Success' : '❌ Error'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: SPACING_PRO.lg, p: SPACING_PRO.lg, backgroundColor: THEME_PRO.bgTertiary, borderRadius: RADIUS_PRO.md }}>
            <Typography component="pre" sx={{ fontSize: '12px', color: THEME_PRO.textSecondary, overflow: 'auto', maxHeight: '300px' }}>
              {JSON.stringify(result?.data, null, 2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultDialog(false)} variant="contained" sx={{ backgroundColor: THEME_PRO.primary }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
