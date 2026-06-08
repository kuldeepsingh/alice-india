/**
 * Trading Bot Component
 *
 * Main trading bot interface with two tabs:
 * 1. Settings - Configure API keys
 * 2. Trading - Create orders and test Claude AI features
 *
 * This component is part of the autonomous trading bot system.
 */

import { useState, useEffect } from 'react'
import { Box, Tabs, Tab, Card, Typography, TextField, Button, Alert, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { CheckCircle, HighlightOff, SendToMobile, SmartToy } from '@mui/icons-material'
import { ApiKeySettings } from './ApiKeySettings'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, SHADOWS_PRO } from '../theme-pro'

interface ApiKeys {
  claudeApiKey: string
  zerodhaApiKey: string
  zerodhaApiSecret: string
}

export const TradingBot = () => {
  const [backendStatus, setBackendStatus] = useState('checking...')
  const [backendConnected, setBackendConnected] = useState(false)
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    claudeApiKey: localStorage.getItem('claudeApiKey') || '',
    zerodhaApiKey: localStorage.getItem('zerodhaApiKey') || '',
    zerodhaApiSecret: localStorage.getItem('zerodhaApiSecret') || '',
  })
  const [tabIndex, setTabIndex] = useState(0)
  const [symbol, setSymbol] = useState('RELIANCE')
  const [quantity, setQuantity] = useState('10')
  const [price, setPrice] = useState('2850')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [resultDialog, setResultDialog] = useState(false)

  // Check backend health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:3000/health/live')
        if (response.ok) {
          setBackendStatus('Connected')
          setBackendConnected(true)
        } else {
          setBackendStatus('Cannot reach backend')
          setBackendConnected(false)
        }
      } catch (error) {
        setBackendStatus('Cannot reach backend')
        setBackendConnected(false)
      }
    }
    checkHealth()
  }, [])

  const handleKeysUpdated = (newKeys: ApiKeys) => {
    setApiKeys(newKeys)
  }

  const handleCreateOrder = async () => {
    if (!apiKeys.zerodhaApiKey) {
      setResult({
        status: 'error',
        data: { error: 'Zerodha API key not configured. Please configure in Settings tab.' },
      })
      setResultDialog(true)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeys.zerodhaApiKey}`,
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
    if (!apiKeys.claudeApiKey) {
      setResult({
        status: 'error',
        data: { error: 'Claude API key not configured. Please configure in Settings tab.' },
      })
      setResultDialog(true)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/v1/market-analysis/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeys.claudeApiKey}`,
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
      {/* Status Bar */}
      <Card
        sx={{
          p: SPACING_PRO.lg,
          borderRadius: RADIUS_PRO.lg,
          border: `1px solid ${THEME_PRO.border}`,
          boxShadow: SHADOWS_PRO.sm,
          backgroundColor: backendConnected ? THEME_PRO.successLight : THEME_PRO.errorLight,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING_PRO.md }}>
          {backendConnected ? (
            <CheckCircle sx={{ color: THEME_PRO.success, fontSize: '20px' }} />
          ) : (
            <HighlightOff sx={{ color: THEME_PRO.error, fontSize: '20px' }} />
          )}
          <Box>
            <Typography sx={{ fontWeight: 600, color: backendConnected ? THEME_PRO.success : THEME_PRO.error }}>
              Backend Status: {backendStatus}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: backendConnected ? THEME_PRO.success : THEME_PRO.error }}>
              {backendConnected
                ? 'All systems connected and ready'
                : 'Unable to connect to backend. Make sure the backend server is running on port 3000.'}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Tabs */}
      <Card
        sx={{
          borderRadius: RADIUS_PRO.lg,
          border: `1px solid ${THEME_PRO.border}`,
          overflow: 'hidden',
          boxShadow: SHADOWS_PRO.md,
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          sx={{
            backgroundColor: THEME_PRO.bgTertiary,
            borderBottom: `1px solid ${THEME_PRO.border}`,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '15px',
              color: THEME_PRO.textSecondary,
              '&.Mui-selected': {
                color: THEME_PRO.primary,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: THEME_PRO.primary,
              height: '3px',
            },
          }}
        >
          <Tab label="⚙️ Settings" />
          <Tab label="📊 Trading" />
        </Tabs>

        <Box sx={{ p: SPACING_PRO.xxl }}>
          {/* Settings Tab */}
          {tabIndex === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: SPACING_PRO.lg }}>
              <Box>
                <Typography sx={{ fontSize: '20px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.sm }}>
                  Configure API Keys
                </Typography>
                <Typography sx={{ fontSize: '14px', color: THEME_PRO.textSecondary }}>
                  Set up your Claude and Zerodha API credentials. You can configure one or both keys as needed.
                </Typography>
              </Box>
              <ApiKeySettings onKeysUpdated={handleKeysUpdated} />
            </Box>
          )}

          {/* Trading Tab */}
          {tabIndex === 1 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: SPACING_PRO.xxl }}>
              {/* Order Creation */}
              <Box>
                <Card
                  sx={{
                    p: SPACING_PRO.xxl,
                    borderRadius: RADIUS_PRO.lg,
                    border: `1px solid ${THEME_PRO.border}`,
                    boxShadow: SHADOWS_PRO.md,
                  }}
                >
                  <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
                    📝 Create Order
                  </Typography>

                  {!apiKeys.zerodhaApiKey && (
                    <Alert
                      sx={{
                        mb: SPACING_PRO.lg,
                        backgroundColor: THEME_PRO.warningLight,
                        color: THEME_PRO.warning,
                        border: `1px solid ${THEME_PRO.warning}`,
                      }}
                    >
                      ⚠️ Zerodha API key not configured. Go to Settings tab to configure.
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
                      },
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
                      },
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
                      },
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
                    disabled={loading || !apiKeys.zerodhaApiKey || !backendConnected}
                    sx={{
                      mt: SPACING_PRO.lg,
                      backgroundColor: apiKeys.zerodhaApiKey ? THEME_PRO.success : THEME_PRO.textTertiary,
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
                  }}
                >
                  <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
                    🧠 Claude AI Analysis
                  </Typography>

                  {!apiKeys.claudeApiKey && (
                    <Alert
                      sx={{
                        mb: SPACING_PRO.lg,
                        backgroundColor: THEME_PRO.warningLight,
                        color: THEME_PRO.warning,
                        border: `1px solid ${THEME_PRO.warning}`,
                      }}
                    >
                      ⚠️ Claude API key not configured. Go to Settings tab to configure.
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
                    disabled={loading || !apiKeys.claudeApiKey || !backendConnected}
                    sx={{
                      backgroundColor: apiKeys.claudeApiKey ? THEME_PRO.primary : THEME_PRO.textTertiary,
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: SPACING_PRO.md,
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
                        icon={apiKeys.claudeApiKey ? <CheckCircle /> : <HighlightOff />}
                        label="Claude"
                        size="small"
                        sx={{
                          backgroundColor: apiKeys.claudeApiKey ? THEME_PRO.successLight : THEME_PRO.errorLight,
                          color: apiKeys.claudeApiKey ? THEME_PRO.success : THEME_PRO.error,
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        icon={apiKeys.zerodhaApiKey ? <CheckCircle /> : <HighlightOff />}
                        label="Zerodha"
                        size="small"
                        sx={{
                          backgroundColor: apiKeys.zerodhaApiKey ? THEME_PRO.successLight : THEME_PRO.errorLight,
                          color: apiKeys.zerodhaApiKey ? THEME_PRO.success : THEME_PRO.error,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>
                </Card>
              </Box>
            </Box>
          )}
        </Box>
      </Card>

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
