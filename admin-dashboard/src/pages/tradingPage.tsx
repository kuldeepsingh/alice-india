import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, TextField, Button, Chip, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { SendToMobile, CheckCircle } from '@mui/icons-material'
import { TradingBot } from '../components/TradingBot'
import { frontendLogger } from '../services/logging-client'
import { ordersAPI } from '../services/api-services'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, SHADOWS_PRO } from '../theme-pro'

interface ExecutedOrder {
  id: string
  symbol: string
  type: 'Buy' | 'Sell'
  quantity: number
  price: number
  total: number
  status: 'Filled' | 'Pending'
  timestamp: string
}

export function tradingPage() {
  const location = useLocation()
  const [orderType, setOrderType] = useState<'Buy' | 'Sell'>('Buy')
  const [symbol, setSymbol] = useState('INFY')
  const [quantity, setQuantity] = useState('100')
  const [price, setPrice] = useState('1850')
  const [stopLoss, setStopLoss] = useState('')
  const [executedOrders, setExecutedOrders] = useState<ExecutedOrder[]>([])
  const [orderMessage, setOrderMessage] = useState('')
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [backendConnected, setBackendConnected] = useState(false)

  // Load orders from localStorage and check backend health
  React.useEffect(() => {
    // Load orders from localStorage
    const savedOrders = localStorage.getItem('executedOrders')
    if (savedOrders) {
      try {
        setExecutedOrders(JSON.parse(savedOrders))
        frontendLogger.debug('Trading', 'Loaded orders from localStorage', {
          count: JSON.parse(savedOrders).length
        })
      } catch (e) {
        frontendLogger.error('Trading', 'Failed to load orders from localStorage', e as Error)
      }
    }

    // Check backend health
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:3000/health/live')
        setBackendConnected(response.ok)
      } catch {
        setBackendConnected(false)
      }
    }
    checkBackend()
  }, [])

  // Load selected stock from market dashboard
  useEffect(() => {
    const state = location.state as { symbol?: string; price?: number } | null
    if (state?.symbol) {
      const operationId = `trading-load-${Date.now()}`
      frontendLogger.info('Trading', 'Stock selected from market dashboard', {
        operationId,
        symbol: state.symbol,
        price: state.price,
        timestamp: new Date().toISOString(),
      })
      setSymbol(state.symbol.toUpperCase())
      if (state.price) {
        setPrice(state.price.toString())
      }
    }
  }, [location.state])

  const handlePlaceOrder = () => {
    frontendLogger.debug('Trading', 'Order placement started', {
      symbol,
      quantity,
      price,
      type: orderType,
    })

    // Validation
    if (!symbol || !quantity || !price) {
      frontendLogger.error('Trading', 'Order validation failed - missing fields', new Error('Missing fields'), {
        symbol,
        quantity,
        price,
      })
      setOrderMessage('❌ Please fill all fields')
      return
    }

    const qty = parseFloat(quantity)
    const prc = parseFloat(price)

    if (qty <= 0 || prc <= 0) {
      frontendLogger.error('Trading', 'Order validation failed - invalid amounts', new Error('Invalid amounts'), {
        quantity: qty,
        price: prc,
      })
      setOrderMessage('❌ Quantity and price must be greater than 0')
      return
    }

    frontendLogger.debug('Trading', 'Order validation passed, opening confirmation', {
      symbol,
      quantity: qty,
      price: prc,
      type: orderType,
    })

    setConfirmDialogOpen(true)
  }

  const handleConfirmOrder = async () => {
    const qty = parseFloat(quantity)
    const prc = parseFloat(price)
    const total = qty * prc

    frontendLogger.debug('Trading', 'Order confirmation started', {
      symbol,
      type: orderType,
      quantity: qty,
      price: prc,
      total,
    })

    const newOrder: ExecutedOrder = {
      id: `ORD${Date.now()}`,
      symbol: symbol.toUpperCase(),
      type: orderType,
      quantity: qty,
      price: prc,
      total: total,
      status: 'Filled',
      timestamp: new Date().toLocaleString(),
    }

    const updatedOrders = [newOrder, ...executedOrders]
    setExecutedOrders(updatedOrders)

    // Save to localStorage for persistence
    localStorage.setItem('executedOrders', JSON.stringify(updatedOrders))
    frontendLogger.debug('Trading', 'Order saved to localStorage', {
      orderId: newOrder.id,
      count: updatedOrders.length
    })

    frontendLogger.info('Trading', 'Order executed successfully', {
      orderId: newOrder.id,
      symbol: newOrder.symbol,
      type: orderType,
      quantity: qty,
      price: prc,
      total,
    })

    setOrderMessage(`✅ ${orderType} order for ${qty} ${symbol.toUpperCase()} @ ${prc} executed successfully!`)
    setConfirmDialogOpen(false)
    setSymbol('INFY')
    setQuantity('100')
    setPrice('1850')
    setStopLoss('')

    setTimeout(() => setOrderMessage(''), 4000)
  }

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        {/* Header with Backend Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING_PRO.xxxl }}>
          <Box>
            <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
              📈 Trading
            </Typography>
            <Typography sx={{ color: THEME_PRO.textSecondary }}>Place and manage your trades</Typography>
          </Box>

          {/* Inline Backend Status Badge */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACING_PRO.md,
            px: SPACING_PRO.lg,
            py: SPACING_PRO.md,
            borderRadius: RADIUS_PRO.md,
            backgroundColor: backendConnected ? THEME_PRO.successLight : THEME_PRO.errorLight,
            border: `1px solid ${backendConnected ? THEME_PRO.success : THEME_PRO.error}`,
          }}>
            <Box sx={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: backendConnected ? THEME_PRO.success : THEME_PRO.error,
              animation: backendConnected ? 'pulse 2s ease-in-out infinite' : 'none',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 }
              }
            }} />
            <Box>
              <Typography sx={{
                fontSize: '12px',
                fontWeight: 700,
                color: backendConnected ? THEME_PRO.success : THEME_PRO.error,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {backendConnected ? 'Backend Ready' : 'Backend Offline'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* THREE COLUMN LAYOUT: Order Form (1/3) + Bot (2/3) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: SPACING_PRO.lg, mb: SPACING_PRO.xxxl }}>

          {/* COLUMN 1: Elegant Compact Order Form */}
          <Card sx={{
            p: SPACING_PRO.lg,
            borderRadius: RADIUS_PRO.lg,
            border: `1px solid ${THEME_PRO.border}`,
            boxShadow: SHADOWS_PRO.md,
            backgroundColor: THEME_PRO.bgSecondary,
          }}>
            {/* Header */}
            <Box sx={{ mb: SPACING_PRO.lg }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: '8px' }}>
                📊 {symbol}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: THEME_PRO.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Manual Trade
              </Typography>
            </Box>

            {/* Alert Message */}
            {orderMessage && (
              <Alert
                sx={{
                  mb: SPACING_PRO.md,
                  py: '6px',
                  px: SPACING_PRO.md,
                  backgroundColor: orderMessage.includes('✅') ? THEME_PRO.successLight : THEME_PRO.errorLight,
                  color: orderMessage.includes('✅') ? THEME_PRO.success : THEME_PRO.error,
                  border: `1px solid ${orderMessage.includes('✅') ? THEME_PRO.success : THEME_PRO.error}`,
                  fontSize: '12px',
                }}
              >
                {orderMessage}
              </Alert>
            )}

            {/* Buy/Sell Toggle - Compact */}
            <Box sx={{ display: 'flex', gap: '6px', mb: SPACING_PRO.md }}>
              <Button
                variant={orderType === 'Buy' ? 'contained' : 'outlined'}
                onClick={() => setOrderType('Buy')}
                size="small"
                sx={{
                  flex: 1,
                  height: '32px',
                  backgroundColor: orderType === 'Buy' ? THEME_PRO.success : 'transparent',
                  color: orderType === 'Buy' ? '#fff' : THEME_PRO.success,
                  borderColor: THEME_PRO.success,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                Buy
              </Button>
              <Button
                variant={orderType === 'Sell' ? 'contained' : 'outlined'}
                onClick={() => setOrderType('Sell')}
                size="small"
                sx={{
                  flex: 1,
                  height: '32px',
                  backgroundColor: orderType === 'Sell' ? THEME_PRO.error : 'transparent',
                  color: orderType === 'Sell' ? '#fff' : THEME_PRO.error,
                  borderColor: THEME_PRO.error,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                Sell
              </Button>
            </Box>

            {/* Quantity & Price */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', mb: SPACING_PRO.md }}>
              <TextField
                label="Qty"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: THEME_PRO.bgTertiary,
                    color: THEME_PRO.textPrimary,
                    height: '36px',
                    fontSize: '12px',
                    '& fieldset': { borderColor: THEME_PRO.border },
                  },
                  '& .MuiInputBase-input': { color: THEME_PRO.textPrimary, padding: '8px' },
                  '& .MuiFormLabel-root': { fontSize: '12px', color: THEME_PRO.textSecondary },
                }}
              />
              <TextField
                label="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: THEME_PRO.bgTertiary,
                    color: THEME_PRO.textPrimary,
                    height: '36px',
                    fontSize: '12px',
                    '& fieldset': { borderColor: THEME_PRO.border },
                  },
                  '& .MuiInputBase-input': { color: THEME_PRO.textPrimary, padding: '8px' },
                  '& .MuiFormLabel-root': { fontSize: '12px', color: THEME_PRO.textSecondary },
                }}
              />
            </Box>

            {/* Stop Loss */}
            <TextField
              fullWidth
              label="Stop Loss"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              type="number"
              placeholder="Optional"
              size="small"
              sx={{
                mb: SPACING_PRO.md,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: THEME_PRO.bgTertiary,
                  color: THEME_PRO.textPrimary,
                  height: '36px',
                  fontSize: '12px',
                  '& fieldset': { borderColor: THEME_PRO.border },
                },
                '& .MuiInputBase-input': { color: THEME_PRO.textPrimary, padding: '8px' },
                '& .MuiFormLabel-root': { fontSize: '12px', color: THEME_PRO.textSecondary },
              }}
            />

            {/* Order Summary */}
            <Box sx={{
              p: '10px',
              backgroundColor: THEME_PRO.bgTertiary,
              borderRadius: RADIUS_PRO.md,
              mb: SPACING_PRO.md,
              border: `1px solid ${THEME_PRO.border}`
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: SPACING_PRO.sm }}>
                <Typography sx={{ fontSize: '11px', color: THEME_PRO.textSecondary, fontWeight: 600 }}>
                  Total:
                </Typography>
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: THEME_PRO.primary }}>
                  ₹{quantity && price ? (parseFloat(quantity) * parseFloat(price)).toLocaleString() : '0'}
                </Typography>
              </Box>
            </Box>

            {/* Place Order Button */}
            <Button
              fullWidth
              variant="contained"
              onClick={handlePlaceOrder}
              size="small"
              sx={{
                backgroundColor: orderType === 'Buy' ? THEME_PRO.success : THEME_PRO.error,
                color: '#fff',
                textTransform: 'uppercase',
                fontWeight: 700,
                fontSize: '12px',
                height: '38px',
                letterSpacing: '0.5px',
              }}
            >
              {orderType === 'Buy' ? '▲' : '▼'} {orderType}
            </Button>
          </Card>

          {/* COLUMN 2: Bot Create Order */}
          <TradingBot />

        </Box>

        {/* Order History */}
        {executedOrders.length > 0 && (
          <Box sx={{ mt: SPACING_PRO.xxxl }}>
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
              📋 Recent Orders
            </Typography>
            <Card sx={{ borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, overflow: 'hidden', backgroundColor: THEME_PRO.bgSecondary }}>
              <TableContainer sx={{ backgroundColor: THEME_PRO.bgSecondary }}>
                <Table>
                  <TableHead sx={{ backgroundColor: THEME_PRO.bgTertiary }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Order ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Symbol</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Qty</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Price</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {executedOrders.map((order) => (
                      <TableRow key={order.id} sx={{ borderBottom: `1px solid ${THEME_PRO.border}` }}>
                        <TableCell sx={{ color: THEME_PRO.primary, fontWeight: 700 }}>{order.id}</TableCell>
                        <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 600 }}>{order.symbol}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.type}
                            sx={{
                              backgroundColor: order.type === 'Buy' ? THEME_PRO.successLight : THEME_PRO.errorLight,
                              color: order.type === 'Buy' ? THEME_PRO.success : THEME_PRO.error,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: THEME_PRO.textSecondary }}>{order.quantity}</TableCell>
                        <TableCell sx={{ color: THEME_PRO.textSecondary }}>₹{order.price.toLocaleString()}</TableCell>
                        <TableCell sx={{ color: THEME_PRO.primary, fontWeight: 600 }}>₹{order.total.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip label={order.status} sx={{ backgroundColor: THEME_PRO.successLight, color: THEME_PRO.success }} />
                        </TableCell>
                        <TableCell sx={{ color: THEME_PRO.textSecondary, fontSize: '13px' }}>{order.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        )}
      </Box>

      {/* Order Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: RADIUS_PRO.lg,
              backgroundColor: THEME_PRO.bgSecondary,
              border: `1px solid ${THEME_PRO.border}`,
            },
          },
        }}
      >
        <DialogTitle sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }}>
          Confirm {orderType} Order
        </DialogTitle>
        <DialogContent sx={{ pt: SPACING_PRO.lg }}>
          <Typography sx={{ color: THEME_PRO.textSecondary, fontSize: '13px', mb: SPACING_PRO.lg }}>
            Please review your order details before confirming:
          </Typography>

          <Box sx={{ p: SPACING_PRO.lg, backgroundColor: THEME_PRO.bgTertiary, borderRadius: RADIUS_PRO.md, mb: SPACING_PRO.lg }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: SPACING_PRO.md }}>
              <Typography sx={{ color: THEME_PRO.textSecondary }}>Symbol:</Typography>
              <Typography sx={{ fontWeight: 600, color: THEME_PRO.textPrimary }}>{symbol.toUpperCase()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: SPACING_PRO.md }}>
              <Typography sx={{ color: THEME_PRO.textSecondary }}>Order Type:</Typography>
              <Chip
                label={orderType}
                sx={{
                  backgroundColor: orderType === 'Buy' ? THEME_PRO.successLight : THEME_PRO.errorLight,
                  color: orderType === 'Buy' ? THEME_PRO.success : THEME_PRO.error,
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: SPACING_PRO.md }}>
              <Typography sx={{ color: THEME_PRO.textSecondary }}>Quantity:</Typography>
              <Typography sx={{ fontWeight: 600, color: THEME_PRO.textPrimary }}>{quantity}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: SPACING_PRO.md }}>
              <Typography sx={{ color: THEME_PRO.textSecondary }}>Price:</Typography>
              <Typography sx={{ fontWeight: 600, color: THEME_PRO.textPrimary }}>₹{parseFloat(price).toLocaleString()}</Typography>
            </Box>
            <Box sx={{ borderTop: `1px solid ${THEME_PRO.border}`, pt: SPACING_PRO.md, display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ color: THEME_PRO.textSecondary, fontWeight: 600 }}>Total Value:</Typography>
              <Typography sx={{ fontWeight: 700, color: THEME_PRO.primary }}>
                ₹{(parseFloat(quantity) * parseFloat(price)).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: SPACING_PRO.lg, gap: SPACING_PRO.sm }}>
          <Button onClick={() => setConfirmDialogOpen(false)} sx={{ color: THEME_PRO.textSecondary, textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmOrder}
            variant="contained"
            startIcon={<CheckCircle />}
            sx={{
              backgroundColor: orderType === 'Buy' ? THEME_PRO.success : THEME_PRO.error,
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { opacity: 0.9 },
            }}
          >
            Confirm {orderType}
          </Button>
        </DialogActions>
      </Dialog>
    </LayoutPro>
  )
}
