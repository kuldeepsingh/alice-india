import React, { useState, useEffect } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert } from '@mui/material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'
import { ordersAPI } from '../services/api-services'

export function ordersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch orders from backend on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await ordersAPI.getAll()
        setOrders(data)
      } catch (err) {
        setError('Failed to load orders. Please try again.')
        console.error('Error fetching orders:', err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

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

        {error && (
          <Alert sx={{ mb: SPACING_PRO.lg, backgroundColor: THEME_PRO.errorLight, color: THEME_PRO.error, border: `1px solid ${THEME_PRO.error}` }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: SPACING_PRO.xxxl }}>
            <CircularProgress sx={{ color: THEME_PRO.primary }} />
          </Box>
        ) : orders.length === 0 ? (
          <Card sx={{ p: SPACING_PRO.xxxl, borderRadius: RADIUS_PRO.lg, backgroundColor: THEME_PRO.bgSecondary, border: `1px solid ${THEME_PRO.border}` }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ color: THEME_PRO.textSecondary }}>No orders found</Typography>
            </Box>
          </Card>
        ) : (
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
                  {orders.map((order) => (
                    <TableRow key={order.id} sx={{ borderBottom: `1px solid ${THEME_PRO.border}`, backgroundColor: THEME_PRO.bgSecondary }}>
                      <TableCell sx={{ color: THEME_PRO.primary, fontWeight: 700 }}>{order.id}</TableCell>
                      <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }}>{order.symbol}</TableCell>
                      <TableCell sx={{ color: THEME_PRO.textSecondary }}>{order.quantity}</TableCell>
                      <TableCell sx={{ color: THEME_PRO.textSecondary }}>₹{order.price?.toLocaleString?.() || order.price}</TableCell>
                      <TableCell><Chip label={order.type} sx={{ backgroundColor: order.type === 'Buy' ? THEME_PRO.successLight : THEME_PRO.errorLight, color: order.type === 'Buy' ? THEME_PRO.success : THEME_PRO.error, fontWeight: 600 }} /></TableCell>
                      <TableCell><Chip label={order.status} sx={{ backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status), fontWeight: 600 }} /></TableCell>
                      <TableCell sx={{ color: THEME_PRO.textSecondary, fontSize: '13px' }}>{order.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Box>
    </LayoutPro>
  )
}
