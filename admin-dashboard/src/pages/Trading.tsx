/**
 * Trading Dashboard
 * Live trading interface with orders, portfolio, and market data
 */

import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
} from '@mui/material'
import { styled } from '@mui/material/styles'

const GainCell = styled(TableCell)(({ theme }) => ({
  color: '#4caf50',
  fontWeight: '500',
}))

const LossCell = styled(TableCell)(({ theme }) => ({
  color: '#f44336',
  fontWeight: '500',
}))

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
}))

const PositiveChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#4caf50',
  color: 'white',
  fontWeight: '500',
}))

const NegativeChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#f44336',
  color: 'white',
  fontWeight: '500',
}))

interface Position {
  symbol: string
  quantity: number
  avgPrice: number
  lastPrice: number
  pnl: number
  pnlPercent: number
}

interface PortfolioStats {
  totalPositions: number
  netPnL: number
  dayPnL: number
  marginUsed: number
  marginAvailable: number
  marginUtilization: number
}

export default function Trading() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [stats, setStats] = useState<PortfolioStats | null>(null)
  const [gainers, setGainers] = useState<Position[]>([])
  const [losers, setLosers] = useState<Position[]>([])
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [orderForm, setOrderForm] = useState({
    symbol: '',
    quantity: 1,
    price: 0,
    orderType: 'BUY',
    validity: 'DAY',
    product: 'MIS',
  })

  useEffect(() => {
    fetchTradingData()
    const interval = setInterval(fetchTradingData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchTradingData = async () => {
    try {
      setLoading(true)

      const [posRes, gainRes, loseRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/trading/positions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('http://localhost:3000/api/v1/trading/portfolio/gainers', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('http://localhost:3000/api/v1/trading/portfolio/losers', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ])

      if (!posRes.ok || !gainRes.ok || !loseRes.ok) {
        throw new Error('Failed to fetch trading data')
      }

      const posData = await posRes.json()
      const gainData = await gainRes.json()
      const loseData = await loseRes.json()

      setPositions(posData.data || [])
      setGainers(gainData.data || [])
      setLosers(loseData.data || [])

      // Calculate stats
      const netPnL = posData.data?.reduce((sum: number, p: Position) => sum + p.pnl, 0) || 0
      setStats({
        totalPositions: posData.data?.length || 0,
        netPnL,
        dayPnL: netPnL,
        marginUsed: 500000,
        marginAvailable: 500000,
        marginUtilization: 50,
      })

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/trading/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(orderForm),
      })

      if (!response.ok) throw new Error('Order placement failed')

      setOrderDialogOpen(false)
      fetchTradingData()
      alert('Order placed successfully!')
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          📈 Trading Dashboard
        </Typography>
        <Button
          variant="contained"
          color="success"
          onClick={() => setOrderDialogOpen(true)}
        >
          + Place Order
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Statistics Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Net P&L
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      color: stats?.netPnL && stats.netPnL >= 0 ? '#4caf50' : '#f44336',
                    }}
                  >
                    ₹{stats?.netPnL?.toLocaleString('en-IN')}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Open Positions
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.totalPositions || 0}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Margin Used
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ₹{stats?.marginUsed?.toLocaleString('en-IN')}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stats?.marginUtilization || 0}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Available
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ₹{stats?.marginAvailable?.toLocaleString('en-IN')}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>
          </Grid>

          {/* Positions Table */}
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                📊 Open Positions
              </Typography>

              {positions.length > 0 ? (
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Symbol</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        Qty
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        Avg Price
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        Last Price
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        P&L
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        %
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {positions.map((pos) => (
                      <TableRow key={pos.symbol} hover>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {pos.symbol}
                        </TableCell>
                        <TableCell align="right">{pos.quantity}</TableCell>
                        <TableCell align="right">
                          ₹{pos.avgPrice?.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          ₹{pos.lastPrice?.toFixed(2)}
                        </TableCell>
                        {pos.pnl >= 0 ? (
                          <>
                            <GainCell align="right">
                              +₹{pos.pnl?.toFixed(2)}
                            </GainCell>
                            <GainCell align="right">
                              +{pos.pnlPercent?.toFixed(2)}%
                            </GainCell>
                          </>
                        ) : (
                          <>
                            <LossCell align="right">
                              -₹{Math.abs(pos.pnl || 0)?.toFixed(2)}
                            </LossCell>
                            <LossCell align="right">
                              {pos.pnlPercent?.toFixed(2)}%
                            </LossCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography color="textSecondary" sx={{ py: 2 }}>
                  No open positions
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Gainers & Losers */}
          <Grid container spacing={2}>
            {/* Top Gainers */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  📈 Top Gainers
                </Typography>
                {gainers.length > 0 ? (
                  <Table size="small">
                    <TableBody>
                      {gainers.map((pos) => (
                        <TableRow key={pos.symbol} hover>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            {pos.symbol}
                          </TableCell>
                          <TableCell align="right">
                            <PositiveChip
                              label={`+₹${pos.pnl?.toFixed(0)}`}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <PositiveChip
                              label={`+${pos.pnlPercent?.toFixed(2)}%`}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography color="textSecondary">No gainers</Typography>
                )}
              </Paper>
            </Grid>

            {/* Top Losers */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  📉 Top Losers
                </Typography>
                {losers.length > 0 ? (
                  <Table size="small">
                    <TableBody>
                      {losers.map((pos) => (
                        <TableRow key={pos.symbol} hover>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            {pos.symbol}
                          </TableCell>
                          <TableCell align="right">
                            <NegativeChip
                              label={`-₹${Math.abs(pos.pnl || 0)?.toFixed(0)}`}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <NegativeChip
                              label={`${pos.pnlPercent?.toFixed(2)}%`}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography color="textSecondary">No losers</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* Order Placement Dialog */}
      <Dialog
        open={orderDialogOpen}
        onClose={() => setOrderDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Place Order</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Symbol"
            value={orderForm.symbol}
            onChange={(e) =>
              setOrderForm({ ...orderForm, symbol: e.target.value.toUpperCase() })
            }
            placeholder="e.g., SBIN, INFY"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="number"
            label="Quantity"
            value={orderForm.quantity}
            onChange={(e) =>
              setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="number"
            label="Price"
            value={orderForm.price}
            onChange={(e) =>
              setOrderForm({ ...orderForm, price: parseFloat(e.target.value) })
            }
            placeholder="0.00"
            sx={{ mb: 2 }}
            step="0.01"
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={orderForm.orderType}
              label="Type"
              onChange={(e) =>
                setOrderForm({ ...orderForm, orderType: e.target.value })
              }
            >
              <MenuItem value="BUY">Buy</MenuItem>
              <MenuItem value="SELL">Sell</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Product</InputLabel>
            <Select
              value={orderForm.product}
              label="Product"
              onChange={(e) =>
                setOrderForm({ ...orderForm, product: e.target.value })
              }
            >
              <MenuItem value="MIS">MIS (Intraday)</MenuItem>
              <MenuItem value="CNC">CNC (Delivery)</MenuItem>
              <MenuItem value="NRML">NRML (Normal)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Validity</InputLabel>
            <Select
              value={orderForm.validity}
              label="Validity"
              onChange={(e) =>
                setOrderForm({ ...orderForm, validity: e.target.value })
              }
            >
              <MenuItem value="DAY">Day</MenuItem>
              <MenuItem value="IOC">IOC (Immediate or Cancel)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePlaceOrder}
            variant="contained"
            color={orderForm.orderType === 'BUY' ? 'success' : 'error'}
          >
            {orderForm.orderType === 'BUY' ? 'Buy' : 'Sell'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
