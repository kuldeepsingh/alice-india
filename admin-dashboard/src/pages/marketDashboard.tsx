import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, TextField, Button } from '@mui/material'
import { Search, Info } from '@mui/icons-material'
import { frontendLogger } from '../services/logging-client'

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

const indices: Index[] = [
  { name: 'NIFTY 50', value: 24752.15, change: 180.45, changePercent: 0.73 },
  { name: 'SENSEX', value: 81193.72, change: 620.18, changePercent: 0.77 },
  { name: 'NIFTY BANK', value: 55168.90, change: 512.35, changePercent: 0.94 },
  { name: 'NIFTY IT', value: 37865.40, change: -120.60, changePercent: -0.32 },
  { name: 'ADVANCES', value: 1682, change: 0, changePercent: 0 },
  { name: 'DECLINES', value: 894, change: 0, changePercent: -35 },
]

// FIXED 5 COLUMNS × 4 ROWS = 20 STOCKS
const heatmapStocks: Stock[] = [
  // Row 1
  { symbol: 'RELIANCE', name: 'Reliance', price: 2850.50, change: 45.20, changePercent: 1.62, volume: '1.2M' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1650.75, change: 21.10, changePercent: 1.28, volume: '2.1M' },
  { symbol: 'ICICBANK', name: 'ICICI Bank', price: 1125.45, change: -15.60, changePercent: -1.37, volume: '3.2M' },
  { symbol: 'TCS', name: 'TCS', price: 3512.30, change: -17.20, changePercent: -0.49, volume: '0.8M' },
  { symbol: 'INFY', name: 'Infosys', price: 1892.10, change: -6.15, changePercent: -0.32, volume: '2.5M' },
  // Row 2
  { symbol: 'HINDUNILVR', name: 'HUL', price: 2425.60, change: 21.20, changePercent: 0.88, volume: '0.5M' },
  { symbol: 'ITC', name: 'ITC', price: 445.20, change: 1.35, changePercent: 0.31, volume: '4.2M' },
  { symbol: 'SBIN', name: 'SBI', price: 892.15, change: 9.20, changePercent: 1.05, volume: '3.8M' },
  { symbol: 'BHARTIARTL', name: 'Airtel', price: 1425.80, change: 10.50, changePercent: 0.74, volume: '2.3M' },
  { symbol: 'KOTAKBANK', name: 'Kotak', price: 1856.45, change: 20.50, changePercent: 1.11, volume: '1.1M' },
  // Row 3
  { symbol: 'LT', name: 'L&T', price: 3245.30, change: 31.20, changePercent: 0.97, volume: '0.6M' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Fin', price: 7462.30, change: 118.90, changePercent: 1.63, volume: '0.2M' },
  { symbol: 'ASIANPAINT', name: 'Asian Paint', price: 2842.50, change: 12.15, changePercent: 0.43, volume: '0.4M' },
  { symbol: 'MARUTI', name: 'Maruti', price: 9820.15, change: 160.25, changePercent: 1.65, volume: '0.1M' },
  { symbol: 'TITAN', name: 'Titan', price: 3125.60, change: -1.20, changePercent: -0.04, volume: '0.7M' },
  // Row 4
  { symbol: 'AXISBANK', name: 'Axis Bank', price: 1156.20, change: 9.80, changePercent: 0.86, volume: '2.8M' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharma', price: 1635.45, change: -5.75, changePercent: -0.35, volume: '1.5M' },
  { symbol: 'ULTRACEMCO', name: 'UltraCem', price: 9542.10, change: 26.85, changePercent: 0.28, volume: '0.3M' },
  { symbol: 'NTPC', name: 'NTPC', price: 325.80, change: 1.50, changePercent: 0.46, volume: '8.2M' },
  { symbol: 'WIPRO', name: 'Wipro', price: 498.60, change: -1.20, changePercent: -0.24, volume: '3.5M' },
]

const topGainers = heatmapStocks.filter(s => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
const topLosers = heatmapStocks.filter(s => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)

const sectors = [
  { name: 'Nifty Bank', advancing: 11, declining: 3, neutral: 1, breadth: 79 },
  { name: 'Nifty IT', advancing: 5, declining: 6, neutral: 0, breadth: 45 },
  { name: 'Nifty FMCG', advancing: 8, declining: 2, neutral: 2, breadth: 73 },
  { name: 'Nifty Pharma', advancing: 7, declining: 3, neutral: 1, breadth: 64 },
  { name: 'Nifty Auto', advancing: 5, declining: 4, neutral: 2, breadth: 50 },
  { name: 'Nifty Metal', advancing: 4, declining: 5, neutral: 0, breadth: 44 },
]

const newsItems = [
  { id: '1', time: '10:15 AM', title: 'Banking stocks extend morning gains on strong buying' },
  { id: '2', time: '09:48 AM', title: 'IT stocks under pressure as global cues turn mixed' },
  { id: '3', time: '09:30 AM', title: 'Market opens higher; NIFTY above 24,700' },
  { id: '4', time: 'Yesterday', title: 'FII inflows continue for third consecutive session' },
]

const indicesData = [
  { name: 'NIFTY 50', value: 24752.15, change: 180.45, changePercent: 0.73 },
  { name: 'SENSEX', value: 81193.72, change: 620.18, changePercent: 0.77 },
  { name: 'NIFTY BANK', value: 55168.90, change: 512.35, changePercent: 0.94 },
  { name: 'NIFTY IT', value: 37865.40, change: -120.60, changePercent: -0.32 },
  { name: 'NIFTY MIDCAP 100', value: 57482.30, change: 210.85, changePercent: 0.37 },
  { name: 'NIFTY SMALLCAP 100', value: 18765.40, change: 85.30, changePercent: 0.35 },
]

// Sparkline SVG Component
function Sparkline({ isPositive }: { isPositive: boolean }) {
  return (
    <svg width="100%" height="30" viewBox="0 0 100 30" style={{ marginTop: '4px' }}>
      <polyline
        points="0,24 15,18 30,20 45,14 60,16 75,8 90,10 100,6"
        fill="none"
        stroke={isPositive ? '#4caf50' : '#f44336'}
        strokeWidth="2"
      />
    </svg>
  )
}

// Pie Chart SVG Component
function PieChart({ advancingPercent }: { advancingPercent: number }) {
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (advancingPercent / 100) * circumference

  return (
    <svg width="140" height="140" style={{ margin: '0 auto', display: 'block' }}>
      <circle cx="70" cy="70" r="45" fill="none" stroke="#2a2a2a" strokeWidth="20" />
      <circle
        cx="70"
        cy="70"
        r="45"
        fill="none"
        stroke="#4caf50"
        strokeWidth="20"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="75" textAnchor="middle" fontSize="24" fontWeight="700" fill="#4caf50">
        {advancingPercent}%
      </text>
      <text x="70" y="92" textAnchor="middle" fontSize="12" fill="#888">
        Advancing
      </text>
    </svg>
  )
}

export function marketDashboard() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const handleStockClick = (stock: Stock) => {
    const operationId = `stock-click-${Date.now()}`
    frontendLogger.info('MarketDashboard', 'Stock clicked - navigating to trading', {
      operationId,
      symbol: stock.symbol,
      price: stock.price,
      changePercent: stock.changePercent,
      timestamp: new Date().toISOString(),
    })
    setTimeout(() => {
      navigate('/trading', {
        state: {
          symbol: stock.symbol,
          price: stock.price,
        }
      })
    }, 300)
  }

  return (
    <LayoutPro>
      <Box sx={{ p: '20px 24px', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>

        {/* HEADER */}
        <Box sx={{ mb: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>Market Dashboard</Typography>
            <Typography sx={{ fontSize: '13px', color: '#888' }}>Real-time market data and analysis</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: '12px' }}>
            <TextField placeholder="Search stocks..." size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ width: '250px', '& .MuiOutlinedInput-root': { backgroundColor: '#1a1a1a', color: '#fff', '& fieldset': { borderColor: '#333' } } }} InputProps={{ startAdornment: <Search sx={{ mr: '8px', color: '#666' }} /> }} />
            <Button variant="contained" sx={{ backgroundColor: '#1976d2', color: '#fff' }}>● Live</Button>
          </Box>
        </Box>

        {/* INDICES ROW - 6 CARDS (COMPACT) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', mb: '24px' }}>
          {indices.map((idx, i) => (
            <Card key={i} sx={{ p: '10px 8px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', minHeight: 'auto' }}>
              <Typography sx={{ fontSize: '9px', color: '#888', fontWeight: 600, textTransform: 'uppercase', mb: '3px', lineHeight: 1 }}>{idx.name}</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#fff', mb: '2px', lineHeight: 1 }}>{idx.value.toLocaleString()}</Typography>
              <Typography sx={{ fontSize: '10px', color: idx.changePercent >= 0 ? '#4caf50' : '#f44336', fontWeight: 600, lineHeight: 1 }}>
                {idx.changePercent >= 0 ? '▲' : '▼'} {Math.abs(idx.changePercent).toFixed(2)}%
              </Typography>
            </Card>
          ))}
        </Box>

        {/* MAIN GRID - HEATMAP (60%) + GAINERS/LOSERS (40%) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: '16px', mb: '24px' }}>

          {/* HEATMAP - FIXED 5 COLUMNS × 4 ROWS */}
          <Card sx={{ p: '16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '12px' }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Market Heatmap</Typography>
              <Info sx={{ color: '#666', fontSize: '18px' }} />
            </Box>

            {/* FIXED 5-COLUMN GRID */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {heatmapStocks.map((stock, idx) => (
                <Box
                  key={idx}
                  onClick={() => handleStockClick(stock)}
                  sx={{
                    p: '8px',
                    height: '80px',
                    borderRadius: '6px',
                    backgroundColor: stock.changePercent >= 0 ? '#0d3a0d' : '#3a0d0d',
                    border: `1px solid ${stock.changePercent >= 0 ? '#4caf50' : '#f44336'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }
                  }}
                >
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#fff', mb: '4px' }}>{stock.symbol}</Typography>
                  <Typography sx={{ fontSize: '12px', fontWeight: 700, color: stock.changePercent >= 0 ? '#4caf50' : '#f44336' }}>
                    {stock.changePercent >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>

          {/* GAINERS & LOSERS - STACKED */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* TOP GAINERS */}
            <Card sx={{ p: '12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '8px' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Top Gainers</Typography>
                <Button size="small" sx={{ color: '#1976d2', fontSize: '10px' }}>View all</Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#666', borderColor: '#2a2a2a', fontSize: '10px', fontWeight: 600, p: '4px' }}>Stock</TableCell>
                      <TableCell align="right" sx={{ color: '#666', borderColor: '#2a2a2a', fontSize: '10px', fontWeight: 600, p: '4px' }}>Price</TableCell>
                      <TableCell align="right" sx={{ color: '#666', borderColor: '#2a2a2a', fontSize: '10px', fontWeight: 600, p: '4px' }}>Change</TableCell>
                      <TableCell align="right" sx={{ color: '#666', borderColor: '#2a2a2a', fontSize: '10px', fontWeight: 600, p: '4px' }}>%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topGainers.map((stock) => (
                      <TableRow key={stock.symbol} onClick={() => handleStockClick(stock)} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#222' } }}>
                        <TableCell sx={{ color: '#fff', borderColor: '#2a2a2a', fontSize: '11px', fontWeight: 600, p: '4px' }}>{stock.symbol}</TableCell>
                        <TableCell align="right" sx={{ color: '#aaa', borderColor: '#2a2a2a', fontSize: '11px', p: '4px' }}>₹{stock.price.toFixed(0)}</TableCell>
                        <TableCell align="right" sx={{ color: '#4caf50', borderColor: '#2a2a2a', fontSize: '11px', fontWeight: 600, p: '4px' }}>+{stock.change.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ color: '#4caf50', borderColor: '#2a2a2a', fontSize: '11px', fontWeight: 600, p: '4px' }}>+{stock.changePercent.toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>

            {/* TOP LOSERS */}
            <Card sx={{ p: '12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '8px' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Top Losers</Typography>
                <Button size="small" sx={{ color: '#1976d2', fontSize: '10px' }}>View all</Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#666', borderColor: '#2a2a2a', fontSize: '10px', fontWeight: 600, p: '4px' }}>Stock</TableCell>
                      <TableCell align="right" sx={{ color: '#666', borderColor: '#2a2a2a', fontSize: '10px', fontWeight: 600, p: '4px' }}>Price</TableCell>
                      <TableCell align="right" sx={{ color: '#666', borderColor: '#2a2a2a', fontSize: '10px', fontWeight: 600, p: '4px' }}>Change</TableCell>
                      <TableCell align="right" sx={{ color: '#666', borderColor: '#2a2a2a', fontSize: '10px', fontWeight: 600, p: '4px' }}>%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topLosers.map((stock) => (
                      <TableRow key={stock.symbol} onClick={() => handleStockClick(stock)} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#222' } }}>
                        <TableCell sx={{ color: '#fff', borderColor: '#2a2a2a', fontSize: '11px', fontWeight: 600, p: '4px' }}>{stock.symbol}</TableCell>
                        <TableCell align="right" sx={{ color: '#aaa', borderColor: '#2a2a2a', fontSize: '11px', p: '4px' }}>₹{stock.price.toFixed(0)}</TableCell>
                        <TableCell align="right" sx={{ color: '#f44336', borderColor: '#2a2a2a', fontSize: '11px', fontWeight: 600, p: '4px' }}>{stock.change.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ color: '#f44336', borderColor: '#2a2a2a', fontSize: '11px', fontWeight: 600, p: '4px' }}>{stock.changePercent.toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        </Box>

        {/* BOTTOM GRID - 3 COLUMNS: SECTOR (30%) + INDICES (30%) + NEWS (40%) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '30% 30% 40%', gap: '16px' }}>

          {/* SECTOR BREADTH WITH PIE CHART */}
          <Card sx={{ p: '16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '12px' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Sector Breadth</Typography>
              <Button size="small" sx={{ color: '#1976d2', fontSize: '10px' }}>View all</Button>
            </Box>
            <PieChart advancingPercent={65} />
            <Box sx={{ mt: '12px' }}>
              {sectors.map((sector) => (
                <Box key={sector.name} sx={{ mb: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <Typography sx={{ color: '#fff' }}>{sector.name}</Typography>
                  <Box sx={{ display: 'flex', gap: '8px', color: '#888' }}>
                    <Typography sx={{ color: '#4caf50' }}>↑ {sector.advancing}</Typography>
                    <Typography sx={{ color: '#f44336' }}>↓ {sector.declining}</Typography>
                    <Typography>→ {sector.neutral}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>

          {/* INDICES TABLE */}
          <Card sx={{ p: '12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '8px' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Indices</Typography>
              <Button size="small" sx={{ color: '#1976d2', fontSize: '10px' }}>View all</Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#666', borderColor: '#2a2a2a', fontSize: '9px', fontWeight: 600, p: '3px' }}>Index</TableCell>
                    <TableCell align="right" sx={{ color: '#666', borderColor: '#2a2a2a', fontSize: '9px', fontWeight: 600, p: '3px' }}>Value</TableCell>
                    <TableCell align="right" sx={{ color: '#666', borderColor: '#2a2a2a', fontSize: '9px', fontWeight: 600, p: '3px' }}>%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {indicesData.map((idx) => (
                    <TableRow key={idx.name}>
                      <TableCell sx={{ color: '#fff', borderColor: '#2a2a2a', fontSize: '10px', fontWeight: 600, p: '3px' }}>{idx.name}</TableCell>
                      <TableCell align="right" sx={{ color: '#aaa', borderColor: '#2a2a2a', fontSize: '10px', p: '3px' }}>{idx.value.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ color: idx.changePercent >= 0 ? '#4caf50' : '#f44336', borderColor: '#2a2a2a', fontSize: '10px', fontWeight: 600, p: '3px' }}>
                        {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* MARKET NEWS */}
          <Card sx={{ p: '16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '12px' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Market News</Typography>
              <Button size="small" sx={{ color: '#1976d2', fontSize: '10px' }}>View all</Button>
            </Box>
            {newsItems.map((item, i) => (
              <Box key={item.id} sx={{ pb: i < newsItems.length - 1 ? '10px' : 0, mb: i < newsItems.length - 1 ? '10px' : 0, borderBottom: i < newsItems.length - 1 ? '1px solid #2a2a2a' : 'none', cursor: 'pointer', '&:hover': { color: '#1976d2' } }}>
                <Typography sx={{ fontSize: '10px', color: '#666', fontWeight: 600, textTransform: 'uppercase', mb: '2px' }}>{item.time}</Typography>
                <Typography sx={{ fontSize: '11px', color: '#ccc', lineHeight: 1.3 }}>{item.title}</Typography>
              </Box>
            ))}
          </Card>
        </Box>
      </Box>
    </LayoutPro>
  )
}
