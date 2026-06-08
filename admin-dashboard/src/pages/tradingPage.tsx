import React, { useState } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, TextField, Button, Chip } from '@mui/material'
import { SendToMobile } from '@mui/icons-material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, SHADOWS_PRO } from '../theme-pro'

export function tradingPage() {
  const [symbol, setSymbol] = useState('INFY')
  const [quantity, setQuantity] = useState('100')
  const [price, setPrice] = useState('1850')

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            📈 Trading
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>Place and manage your trades</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Order Form */}
          <Box>
            <Card sx={{ p: SPACING_PRO.xxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, boxShadow: SHADOWS_PRO.md }}>
              <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
                Place New Order
              </Typography>
              
              <Box sx={{ display: 'flex', gap: SPACING_PRO.sm, mb: SPACING_PRO.lg }}>
                <Button variant={true ? 'contained' : 'outlined'} sx={{ flex: 1, backgroundColor: THEME_PRO.success, color: '#fff', textTransform: 'none' }}>Buy</Button>
                <Button variant="outlined" sx={{ flex: 1, color: THEME_PRO.error, borderColor: THEME_PRO.error, textTransform: 'none' }}>Sell</Button>
              </Box>

              <TextField fullWidth label="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} margin="normal" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: THEME_PRO.bgTertiary } }} />
              <TextField fullWidth label="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} margin="normal" type="number" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: THEME_PRO.bgTertiary } }} />
              <TextField fullWidth label="Price" value={price} onChange={(e) => setPrice(e.target.value)} margin="normal" type="number" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: THEME_PRO.bgTertiary } }} />

              <Button fullWidth variant="contained" startIcon={<SendToMobile />} sx={{ mt: SPACING_PRO.lg, backgroundColor: THEME_PRO.primary, color: '#fff', textTransform: 'none', fontWeight: 600 }}>
                Place Order
              </Button>
            </Card>
          </Box>

          {/* Market Watch */}
          <Box>
            <Card sx={{ p: SPACING_PRO.xxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, boxShadow: SHADOWS_PRO.md }}>
              <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
                Market Watch
              </Typography>

              {[
                { symbol: 'INFY', price: '1,850', change: '+2.5%', trend: '📈' },
                { symbol: 'TCS', price: '3,450', change: '-1.2%', trend: '📉' },
                { symbol: 'RELIANCE', price: '2,890', change: '+3.1%', trend: '📈' },
              ].map((stock) => (
                <Box key={stock.symbol} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: SPACING_PRO.md, backgroundColor: THEME_PRO.bgTertiary, borderRadius: RADIUS_PRO.md, mb: SPACING_PRO.sm }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>{stock.symbol}</Typography>
                    <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary }}>₹{stock.price}</Typography>
                  </Box>
                  <Chip label={`${stock.trend} ${stock.change}`} sx={{ backgroundColor: stock.change.includes('+') ? THEME_PRO.successLight : THEME_PRO.errorLight, color: stock.change.includes('+') ? THEME_PRO.success : THEME_PRO.error }} />
                </Box>
              ))}
            </Card>
          </Box>
        </Box>
      </Box>
    </LayoutPro>
  )
}
