import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, TextField, Button, Grid, Paper, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress } from '@mui/material'
import { TrendingUp, TrendingDown, Search, Info, Refresh } from '@mui/icons-material'
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
  { name: 'NIFTY 50', value: 24752.15, change: 180.45, changePercent: 0.73 },
  { name: 'SENSEX', value: 81193.72, change: 620.18, changePercent: 0.77 },
  { name: 'NIFTY BANK', value: 55168.90, change: 512.35, changePercent: 0.94 },
  { name: 'NIFTY IT', value: 37865.40, change: -120.60, changePercent: -0.32 },
  { name: 'ADVANCES', value: 1682, change: 0, changePercent: 0 },
  { name: 'DECLINES', value: 894, change: 0, changePercent: -35 },
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
      <Box sx={{ p: '40px 60px', backgroundColor: '#0f0f0f', minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ mb: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '12px' }}>
              <Box sx={{ fontSize: '28px' }}>📊</Box>
              <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>
                Market Dashboard
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '14px', color: '#888' }}>Real-time market data and analysis</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <TextField
              placeholder="Search stocks, indices, sectors..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              sx={{
                width: '280px',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  fontSize: '13px',
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#555' },
                },
                '& .MuiOutlinedInput-input::placeholder': { color: '#666', opacity: 1 },
              }}
              InputProps={{
                startAdornment: <Search sx={{ mr: '8px', color: '#666', fontSize: '20px' }} />,
              }}
            />
            <Button variant="contained" sx={{
              backgroundColor: '#1e88e5',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              py: '10px',
              px: '20px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              '&:hover': { backgroundColor: '#1565c0' }
            }}>
              🔄 Live
            </Button>
          </Box>
        </Box>

        {/* Market Indices */}
        <Grid container spacing={2} sx={{ mb: '50px' }}>
          {indices.map((idx, i) => (
            <Grid item xs={12} sm={6} md={2} key={i}>
              <Paper sx={{
                p: '16px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: '#555',
                  backgroundColor: '#222',
                }
              }}>
                <Typography sx={{ fontSize: '11px', color: '#888', mb: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {idx.name}
                </Typography>
                <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#fff', mb: '8px' }}>
                  {idx.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Box sx={{ fontSize: '12px', color: idx.changePercent >= 0 ? '#4caf50' : '#f44336' }}>
                    {idx.changePercent >= 0 ? '▲' : '▼'}
                  </Box>
                  <Typography sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: idx.changePercent >= 0 ? '#4caf50' : '#f44336'
                  }}>
                    {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent}% ({idx.change > 0 ? '+' : ''}{idx.change.toFixed(2)})
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={3} sx={{ mb: '50px' }}>
          {/* Market Heatmap */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: '28px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '24px' }}>
                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                  Market Heatmap
                </Typography>
                <Info sx={{ color: '#666', cursor: 'help', fontSize: '20px' }} />
              </Box>

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '12px',
                mb: '16px'
              }}>
                {filteredStocks.map((stock, idx) => (
                  <Paper
                    key={idx}
                    onClick={() => handleStockClick(stock)}
                    sx={{
                      p: '12px',
                      borderRadius: '8px',
                      backgroundColor: stock.changePercent >= 0 ? '#0d3a0d' : '#3a0d0d',
                      border: `2px solid ${stock.changePercent >= 0 ? '#4caf50' : '#f44336'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: `0 6px 16px ${stock.changePercent >= 0 ? '#4caf5040' : '#f4433640'}`,
                        backgroundColor: stock.changePercent >= 0 ? '#0f4a0f' : '#4a0f0f',
                      }
                    }}
                  >
                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#fff', mb: '4px' }}>
                      {stock.symbol}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: '#aaa', mb: '6px' }}>
                      ₹{stock.price.toFixed(0)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                      <Box sx={{
                        fontSize: '11px',
                        color: stock.changePercent >= 0 ? '#4caf50' : '#f44336',
                        fontWeight: 600
                      }}>
                        {stock.changePercent >= 0 ? '▲' : '▼'}
                      </Box>
                      <Typography sx={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: stock.changePercent >= 0 ? '#4caf50' : '#f44336'
                      }}>
                        {Math.abs(stock.changePercent).toFixed(2)}%
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
              <Typography sx={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                Showing {filteredStocks.length} of {heatmapStocks.length} stocks
              </Typography>
            </Paper>
          </Grid>

          {/* Top Gainers & Losers */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              {/* Top Gainers */}
              <Grid item xs={12}>
                <Paper sx={{ p: '20px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '16px' }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                      Top Gainers
                    </Typography>
                    <Button size="small" sx={{ color: '#1e88e5', fontSize: '12px', textTransform: 'uppercase' }}>View all</Button>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: '#666', borderColor: '#333', fontSize: '11px', fontWeight: 600 }}>Stock</TableCell>
                          <TableCell align="right" sx={{ color: '#666', borderColor: '#333', fontSize: '11px', fontWeight: 600 }}>Price</TableCell>
                          <TableCell align="right" sx={{ color: '#666', borderColor: '#333', fontSize: '11px', fontWeight: 600 }}>Change</TableCell>
                          <TableCell align="right" sx={{ color: '#666', borderColor: '#333', fontSize: '11px', fontWeight: 600 }}>%</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topGainers.map((stock, idx) => (
                          <TableRow
                            key={idx}
                            onClick={() => handleStockClick(stock)}
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: 'transparent',
                              '&:hover': { backgroundColor: '#222' },
                              borderColor: '#2a2a2a'
                            }}
                          >
                            <TableCell sx={{ color: '#fff', borderColor: '#2a2a2a', fontWeight: 700, fontSize: '13px' }}>
                              {stock.symbol}
                            </TableCell>
                            <TableCell align="right" sx={{ color: '#aaa', borderColor: '#2a2a2a', fontSize: '13px' }}>
                              ₹{stock.price.toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ color: '#4caf50', borderColor: '#2a2a2a', fontWeight: 700, fontSize: '13px' }}>
                              +{stock.change.toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ color: '#4caf50', borderColor: '#2a2a2a', fontWeight: 700, fontSize: '13px' }}>
                              +{stock.changePercent.toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Top Losers */}
              <Grid item xs={12}>
                <Paper sx={{ p: '20px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '16px' }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                      Top Losers
                    </Typography>
                    <Button size="small" sx={{ color: '#1e88e5', fontSize: '12px', textTransform: 'uppercase' }}>View all</Button>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: '#666', borderColor: '#333', fontSize: '11px', fontWeight: 600 }}>Stock</TableCell>
                          <TableCell align="right" sx={{ color: '#666', borderColor: '#333', fontSize: '11px', fontWeight: 600 }}>Price</TableCell>
                          <TableCell align="right" sx={{ color: '#666', borderColor: '#333', fontSize: '11px', fontWeight: 600 }}>Change</TableCell>
                          <TableCell align="right" sx={{ color: '#666', borderColor: '#333', fontSize: '11px', fontWeight: 600 }}>%</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topLosers.map((stock, idx) => (
                          <TableRow
                            key={idx}
                            onClick={() => handleStockClick(stock)}
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: 'transparent',
                              '&:hover': { backgroundColor: '#222' },
                              borderColor: '#2a2a2a'
                            }}
                          >
                            <TableCell sx={{ color: '#fff', borderColor: '#2a2a2a', fontWeight: 700, fontSize: '13px' }}>
                              {stock.symbol}
                            </TableCell>
                            <TableCell align="right" sx={{ color: '#aaa', borderColor: '#2a2a2a', fontSize: '13px' }}>
                              ₹{stock.price.toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ color: '#f44336', borderColor: '#2a2a2a', fontWeight: 700, fontSize: '13px' }}>
                              {stock.change.toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ color: '#f44336', borderColor: '#2a2a2a', fontWeight: 700, fontSize: '13px' }}>
                              {stock.changePercent.toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Bottom Grid */}
        <Grid container spacing={3}>
          {/* Sector Breadth */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: '28px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '24px' }}>
                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                  Sector Breadth
                </Typography>
                <Button size="small" sx={{ color: '#1e88e5', fontSize: '12px', textTransform: 'uppercase' }}>View all</Button>
              </Box>
              {sectors.map((sector, idx) => (
                <Box key={idx} sx={{ mb: '20px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '8px' }}>
                    <Typography sx={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>
                      {sector.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                      <Typography sx={{ color: '#4caf50' }}>↑ {sector.advancing}</Typography>
                      <Typography sx={{ color: '#f44336' }}>↓ {sector.declining}</Typography>
                      <Typography sx={{ color: '#888' }}>→ {sector.neutral}</Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={sector.breadth}
                    sx={{
                      height: '6px',
                      borderRadius: '3px',
                      backgroundColor: '#2a2a2a',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: sector.breadth > 50 ? '#4caf50' : '#f44336',
                        borderRadius: '3px',
                      }
                    }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Market News */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: '28px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '24px' }}>
                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                  Market News
                </Typography>
                <Button size="small" sx={{ color: '#1e88e5', fontSize: '12px', textTransform: 'uppercase' }}>View all</Button>
              </Box>
              {newsItems.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    pb: '16px',
                    borderBottom: '1px solid #2a2a2a',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      color: '#1e88e5',
                    },
                    '&:last-child': {
                      borderBottom: 'none',
                    }
                  }}
                >
                  <Typography sx={{ fontSize: '11px', color: '#666', mb: '6px', textTransform: 'uppercase' }}>
                    {item.time}
                  </Typography>
                  <Typography sx={{ fontSize: '13px', color: '#ccc', lineHeight: 1.5 }}>
                    {item.title}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </LayoutPro>
  )
}
