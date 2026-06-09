import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, TextField, Button, Grid, Paper, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress } from '@mui/material'
import { TrendingUp, TrendingDown, Search, Info } from '@mui/icons-material'
import { frontendLogger } from '../services/logging-client'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: string
}

interface Index {
  name: string
  value: number
  change: number
  changePercent: number
  chart: string
}

interface SectorData {
  name: string
  advancing: number
  declining: number
  neutral: number
  breadth: number
}

interface NewsItem {
  id: string
  time: string
  title: string
}

const indices: Index[] = [
  { name: 'NIFTY 50', value: 24752.15, change: 180.45, changePercent: 0.73, chart: '📈' },
  { name: 'SENSEX', value: 81193.72, change: 620.18, changePercent: 0.77, chart: '📈' },
  { name: 'NIFTY BANK', value: 55168.90, change: 512.35, changePercent: 0.94, chart: '📈' },
  { name: 'NIFTY IT', value: 37865.40, change: -120.60, changePercent: -0.32, chart: '📉' },
  { name: 'ADVANCES', value: 1682, change: 0, changePercent: 0, chart: '📈' },
  { name: 'DECLINES', value: 894, change: 0, changePercent: -35, chart: '📉' },
]

const heatmapStocks: Stock[] = [
  { symbol: 'RELIANCE', name: 'Reliance', price: 2850.50, change: 45.20, changePercent: 1.62, volume: '1.2M' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1650.75, change: 21.10, changePercent: 1.28, volume: '2.1M' },
  { symbol: 'ICICBANK', name: 'ICICI Bank', price: 1125.45, change: -15.60, changePercent: -1.37, volume: '3.2M' },
  { symbol: 'TCS', name: 'TCS', price: 3512.30, change: -17.20, changePercent: -0.49, volume: '0.8M' },
  { symbol: 'INFY', name: 'Infosys', price: 1892.10, change: -6.15, changePercent: -0.32, volume: '2.5M' },
  { symbol: 'HINDUNILVR', name: 'HUL', price: 2425.60, change: 21.20, changePercent: 0.88, volume: '0.5M' },
  { symbol: 'ITC', name: 'ITC', price: 445.20, change: 1.35, changePercent: 0.31, volume: '4.2M' },
  { symbol: 'SBIN', name: 'SBI', price: 892.15, change: 9.20, changePercent: 1.05, volume: '3.8M' },
  { symbol: 'BHARTIARTL', name: 'Airtel', price: 1425.80, change: 10.50, changePercent: 0.74, volume: '2.3M' },
  { symbol: 'KOTAKBANK', name: 'Kotak', price: 1856.45, change: 20.50, changePercent: 1.11, volume: '1.1M' },
  { symbol: 'LT', name: 'L&T', price: 3245.30, change: 31.20, changePercent: 0.97, volume: '0.6M' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Fin', price: 7462.30, change: 118.90, changePercent: 1.63, volume: '0.2M' },
  { symbol: 'ASIANPAINT', name: 'Asian Paint', price: 2842.50, change: 12.15, changePercent: 0.43, volume: '0.4M' },
  { symbol: 'MARUTI', name: 'Maruti', price: 9820.15, change: 160.25, changePercent: 1.65, volume: '0.1M' },
  { symbol: 'TITAN', name: 'Titan', price: 3125.60, change: -1.20, changePercent: -0.04, volume: '0.7M' },
  { symbol: 'AXISBANK', name: 'Axis Bank', price: 1156.20, change: 9.80, changePercent: 0.86, volume: '2.8M' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharma', price: 1635.45, change: -5.75, changePercent: -0.35, volume: '1.5M' },
  { symbol: 'ULTRACEMCO', name: 'UltraCem', price: 9542.10, change: 26.85, changePercent: 0.28, volume: '0.3M' },
  { symbol: 'WIPRO', name: 'Wipro', price: 498.60, change: -1.20, changePercent: -0.24, volume: '3.5M' },
  { symbol: 'NTPC', name: 'NTPC', price: 325.80, change: 1.50, changePercent: 0.46, volume: '8.2M' },
]

const topGainers = heatmapStocks.filter(s => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
const topLosers = heatmapStocks.filter(s => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)

const sectors: SectorData[] = [
  { name: 'Nifty Bank', advancing: 11, declining: 3, neutral: 1, breadth: 79 },
  { name: 'Nifty IT', advancing: 5, declining: 6, neutral: 0, breadth: 45 },
  { name: 'Nifty FMCG', advancing: 8, declining: 2, neutral: 2, breadth: 73 },
  { name: 'Nifty Pharma', advancing: 7, declining: 3, neutral: 1, breadth: 64 },
  { name: 'Nifty Auto', advancing: 5, declining: 4, neutral: 2, breadth: 50 },
  { name: 'Nifty Metal', advancing: 4, declining: 5, neutral: 0, breadth: 44 },
]

const newsItems: NewsItem[] = [
  { id: '1', time: '10:15 AM', title: 'Banking stocks extend morning gains on strong buying' },
  { id: '2', time: '09:48 AM', title: 'IT stocks under pressure as global cues turn mixed' },
  { id: '3', time: '09:30 AM', title: 'Market opens higher; NIFTY above 24,700' },
  { id: '4', time: 'Yesterday', title: 'FII inflows continue for third consecutive session' },
]

export function marketDashboard() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)

  const handleStockClick = (stock: Stock) => {
    const operationId = `stock-click-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    frontendLogger.info('MarketDashboard', 'Stock clicked for trading', {
      operationId,
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changePercent,
      timestamp: new Date().toISOString(),
    })

    setSelectedStock(stock)
    // Navigate to trading page with stock symbol
    setTimeout(() => {
      navigate('/trading', { state: { symbol: stock.symbol, price: stock.price } })
    }, 300)
  }

  const handleSearch = (term: string) => {
    if (term.trim()) {
      frontendLogger.debug('MarketDashboard', 'Stock search performed', {
        searchTerm: term,
        resultsCount: heatmapStocks.filter(s =>
          s.symbol.includes(term.toUpperCase()) || s.name.toLowerCase().includes(term.toLowerCase())
        ).length,
        timestamp: new Date().toISOString(),
      })
    }
    setSearchTerm(term)
  }

  const filteredStocks = heatmapStocks.filter(s =>
    s.symbol.includes(searchTerm.toUpperCase()) || s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ mb: SPACING_PRO.xxxl, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
              📊 Market Dashboard
            </Typography>
            <Typography sx={{ color: THEME_PRO.textSecondary }}>Real-time market data and analysis</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: SPACING_PRO.md, alignItems: 'center' }}>
            <TextField
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              sx={{
                width: '250px',
                '& .MuiOutlinedInput-root': {
                  color: THEME_PRO.textPrimary,
                  '& fieldset': { borderColor: THEME_PRO.border },
                },
              }}
              InputProps={{
                startAdornment: <Search sx={{ mr: SPACING_PRO.sm, color: THEME_PRO.textSecondary }} />,
              }}
            />
            <Button variant="contained" sx={{ backgroundColor: THEME_PRO.primary, color: '#fff' }}>
              🔄 Refresh
            </Button>
          </Box>
        </Box>

        {/* Top Indices */}
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Grid container spacing={SPACING_PRO.lg}>
            {indices.map((idx, i) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
                <Card sx={{
                  p: SPACING_PRO.lg,
                  borderRadius: RADIUS_PRO.lg,
                  border: `1px solid ${THEME_PRO.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    border: `1px solid ${THEME_PRO.primary}`,
                    boxShadow: `0 0 12px ${THEME_PRO.primary}40`,
                  }
                }}>
                  <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary, mb: SPACING_PRO.sm }}>
                    {idx.name}
                  </Typography>
                  <Typography sx={{ fontSize: '20px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.sm }}>
                    {idx.value.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING_PRO.sm }}>
                    {idx.changePercent >= 0 ? (
                      <TrendingUp sx={{ color: THEME_PRO.success, fontSize: '16px' }} />
                    ) : (
                      <TrendingDown sx={{ color: THEME_PRO.error, fontSize: '16px' }} />
                    )}
                    <Typography sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: idx.changePercent >= 0 ? THEME_PRO.success : THEME_PRO.error
                    }}>
                      {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent}% ({idx.change > 0 ? '+' : ''}{idx.change})
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Main Grid */}
        <Grid container spacing={SPACING_PRO.lg} sx={{ mb: SPACING_PRO.xxxl }}>
          {/* Market Heatmap */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ p: SPACING_PRO.lg, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING_PRO.lg }}>
                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary }}>
                  Market Heatmap
                </Typography>
                <Info sx={{ color: THEME_PRO.textSecondary, cursor: 'help' }} />
              </Box>

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: SPACING_PRO.md,
              }}>
                {filteredStocks.map((stock, idx) => (
                  <Paper
                    key={idx}
                    onClick={() => handleStockClick(stock)}
                    sx={{
                      p: SPACING_PRO.md,
                      borderRadius: RADIUS_PRO.md,
                      backgroundColor: stock.changePercent >= 0 ? '#1a3a1a' : '#3a1a1a',
                      border: `2px solid ${stock.changePercent >= 0 ? THEME_PRO.success : THEME_PRO.error}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 16px ${stock.changePercent >= 0 ? THEME_PRO.success : THEME_PRO.error}30`,
                      }
                    }}
                  >
                    <Typography sx={{ fontSize: '13px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.xs }}>
                      {stock.symbol}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: THEME_PRO.textSecondary, mb: SPACING_PRO.sm }}>
                      ₹{stock.price.toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {stock.changePercent >= 0 ? (
                        <TrendingUp sx={{ fontSize: '14px', color: THEME_PRO.success }} />
                      ) : (
                        <TrendingDown sx={{ fontSize: '14px', color: THEME_PRO.error }} />
                      )}
                      <Typography sx={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: stock.changePercent >= 0 ? THEME_PRO.success : THEME_PRO.error
                      }}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
              <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary, mt: SPACING_PRO.lg, textAlign: 'center' }}>
                Showing {filteredStocks.length} of {heatmapStocks.length} stocks
              </Typography>
            </Card>
          </Grid>

          {/* Top Gainers & Losers */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={SPACING_PRO.lg}>
              {/* Top Gainers */}
              <Grid item xs={12}>
                <Card sx={{ p: SPACING_PRO.lg, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING_PRO.lg }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: THEME_PRO.textPrimary }}>
                      Top Gainers
                    </Typography>
                    <Button size="small" sx={{ color: THEME_PRO.primary }}>View all</Button>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: THEME_PRO.textSecondary, borderColor: THEME_PRO.border }}>Stock</TableCell>
                          <TableCell align="right" sx={{ color: THEME_PRO.textSecondary, borderColor: THEME_PRO.border }}>Price</TableCell>
                          <TableCell align="right" sx={{ color: THEME_PRO.textSecondary, borderColor: THEME_PRO.border }}>Change</TableCell>
                          <TableCell align="right" sx={{ color: THEME_PRO.textSecondary, borderColor: THEME_PRO.border }}>%</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topGainers.map((stock, idx) => (
                          <TableRow
                            key={idx}
                            onClick={() => handleStockClick(stock)}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: THEME_PRO.bgPrimary },
                              borderColor: THEME_PRO.border
                            }}
                          >
                            <TableCell sx={{ color: THEME_PRO.textPrimary, borderColor: THEME_PRO.border, fontWeight: 600 }}>
                              {stock.symbol}
                            </TableCell>
                            <TableCell align="right" sx={{ color: THEME_PRO.textPrimary, borderColor: THEME_PRO.border }}>
                              ₹{stock.price.toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ color: THEME_PRO.success, borderColor: THEME_PRO.border, fontWeight: 600 }}>
                              +{stock.change.toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ color: THEME_PRO.success, borderColor: THEME_PRO.border, fontWeight: 600 }}>
                              +{stock.changePercent.toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>

              {/* Top Losers */}
              <Grid item xs={12}>
                <Card sx={{ p: SPACING_PRO.lg, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING_PRO.lg }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: THEME_PRO.textPrimary }}>
                      Top Losers
                    </Typography>
                    <Button size="small" sx={{ color: THEME_PRO.primary }}>View all</Button>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: THEME_PRO.textSecondary, borderColor: THEME_PRO.border }}>Stock</TableCell>
                          <TableCell align="right" sx={{ color: THEME_PRO.textSecondary, borderColor: THEME_PRO.border }}>Price</TableCell>
                          <TableCell align="right" sx={{ color: THEME_PRO.textSecondary, borderColor: THEME_PRO.border }}>Change</TableCell>
                          <TableCell align="right" sx={{ color: THEME_PRO.textSecondary, borderColor: THEME_PRO.border }}>%</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topLosers.map((stock, idx) => (
                          <TableRow
                            key={idx}
                            onClick={() => handleStockClick(stock)}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: THEME_PRO.bgPrimary },
                              borderColor: THEME_PRO.border
                            }}
                          >
                            <TableCell sx={{ color: THEME_PRO.textPrimary, borderColor: THEME_PRO.border, fontWeight: 600 }}>
                              {stock.symbol}
                            </TableCell>
                            <TableCell align="right" sx={{ color: THEME_PRO.textPrimary, borderColor: THEME_PRO.border }}>
                              ₹{stock.price.toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ color: THEME_PRO.error, borderColor: THEME_PRO.border, fontWeight: 600 }}>
                              {stock.change.toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ color: THEME_PRO.error, borderColor: THEME_PRO.border, fontWeight: 600 }}>
                              {stock.changePercent.toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Bottom Grid */}
        <Grid container spacing={SPACING_PRO.lg}>
          {/* Sector Breadth */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: SPACING_PRO.lg, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING_PRO.lg }}>
                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary }}>
                  Sector Breadth
                </Typography>
                <Button size="small" sx={{ color: THEME_PRO.primary }}>View all</Button>
              </Box>
              {sectors.map((sector, idx) => (
                <Box key={idx} sx={{ mb: SPACING_PRO.lg }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: SPACING_PRO.sm }}>
                    <Typography sx={{ fontSize: '14px', color: THEME_PRO.textPrimary, fontWeight: 600 }}>
                      {sector.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: SPACING_PRO.sm, fontSize: '12px' }}>
                      <Typography sx={{ color: THEME_PRO.success }}>↑ {sector.advancing}</Typography>
                      <Typography sx={{ color: THEME_PRO.error }}>↓ {sector.declining}</Typography>
                      <Typography sx={{ color: THEME_PRO.textSecondary }}>→ {sector.neutral}</Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={sector.breadth}
                    sx={{
                      height: '8px',
                      borderRadius: RADIUS_PRO.sm,
                      backgroundColor: THEME_PRO.border,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: sector.breadth > 50 ? THEME_PRO.success : THEME_PRO.error,
                      }
                    }}
                  />
                </Box>
              ))}
            </Card>
          </Grid>

          {/* Market News */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: SPACING_PRO.lg, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING_PRO.lg }}>
                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary }}>
                  Market News
                </Typography>
                <Button size="small" sx={{ color: THEME_PRO.primary }}>View all</Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: SPACING_PRO.md }}>
                {newsItems.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      pb: SPACING_PRO.md,
                      borderBottom: `1px solid ${THEME_PRO.border}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        color: THEME_PRO.primary,
                      },
                      '&:last-child': {
                        borderBottom: 'none',
                      }
                    }}
                  >
                    <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary, mb: SPACING_PRO.xs }}>
                      {item.time}
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: THEME_PRO.textPrimary, lineHeight: 1.4 }}>
                      {item.title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </LayoutPro>
  )
}
