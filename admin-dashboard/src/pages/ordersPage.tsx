import React from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'

const mockOrders = [
  { id: 'ORD001', symbol: 'INFY', quantity: 100, price: '1,850', status: 'Filled', type: 'Buy', timestamp: '2026-06-09 09:30 AM' },
  { id: 'ORD002', symbol: 'TCS', quantity: 50, price: '3,450', status: 'Pending', type: 'Sell', timestamp: '2026-06-09 10:15 AM' },
  { id: 'ORD003', symbol: 'RELIANCE', quantity: 25, price: '2,890', status: 'Filled', type: 'Buy', timestamp: '2026-06-09 11:45 AM' },
  { id: 'ORD004', symbol: 'WIPRO', quantity: 200, price: '380', status: 'Cancelled', type: 'Sell', timestamp: '2026-06-08 02:30 PM' },
]

export function ordersPage() {
  const getStatusColor = (status: string) => {
    const colors: {[key: string]: string} = { 'Filled': THEME_PRO.success, 'Pending': THEME_PRO.warning, 'Cancelled': THEME_PRO.error }
    return colors[status] || THEME_PRO.info
  }

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            📊 Orders
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>View and manage your trading orders</Typography>
        </Box>

        <Card sx={{ borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, overflow: 'hidden', backgroundColor: THEME_PRO.bgSecondary }}>
          <TableContainer sx={{ backgroundColor: THEME_PRO.bgSecondary }}>
            <Table>
              <TableHead sx={{ backgroundColor: THEME_PRO.bgTertiary }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Symbol</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Qty</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Date & Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockOrders.map((order) => (
                  <TableRow key={order.id} sx={{ borderBottom: `1px solid ${THEME_PRO.border}`, backgroundColor: THEME_PRO.bgSecondary }}>
                    <TableCell sx={{ color: THEME_PRO.primary, fontWeight: 700 }}>{order.id}</TableCell>
                    <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }}>{order.symbol}</TableCell>
                    <TableCell sx={{ color: THEME_PRO.textSecondary }}>{order.quantity}</TableCell>
                    <TableCell sx={{ color: THEME_PRO.textSecondary }}>₹{order.price}</TableCell>
                    <TableCell><Chip label={order.type} sx={{ backgroundColor: order.type === 'Buy' ? THEME_PRO.successLight : THEME_PRO.errorLight, color: order.type === 'Buy' ? THEME_PRO.success : THEME_PRO.error, fontWeight: 600 }} /></TableCell>
                    <TableCell><Chip label={order.status} sx={{ backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status), fontWeight: 600 }} /></TableCell>
                    <TableCell sx={{ color: THEME_PRO.textSecondary, fontSize: '13px' }}>{order.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </LayoutPro>
  )
}
