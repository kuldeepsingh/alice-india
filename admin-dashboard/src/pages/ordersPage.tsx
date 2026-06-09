import React, { useState, useEffect } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert } from '@mui/material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, SHADOWS_PRO, TRANSITIONS_PRO } from '../theme-pro'
import { ordersAPI } from '../services/api-services'

export function ordersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch orders from backend and localStorage on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError('')

        // Fetch from backend API
        let backendOrders = []
        try {
          backendOrders = await ordersAPI.getAll()
          console.log('Backend orders:', backendOrders)
        } catch (apiErr) {
          console.log('Backend orders unavailable:', apiErr)
          backendOrders = []
        }

        // Also load from localStorage (from Trading page)
        const savedOrders = localStorage.getItem('executedOrders')
        let localOrders = []
        if (savedOrders) {
          try {
            localOrders = JSON.parse(savedOrders)
            console.log('localStorage orders:', localOrders)
          } catch (parseErr) {
            console.error('Failed to parse localStorage:', parseErr)
            localOrders = []
          }
        }

        // Combine both sources (localStorage first, then backend)
        const allOrders = [...localOrders, ...backendOrders]
        console.log('Combined orders:', allOrders)

        setOrders(allOrders)

        if (allOrders.length === 0) {
          setError('No orders found. Place orders from Trading page.')
        }
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
          <Card sx={{ backgroundColor: THEME_PRO.bgSecondary, p: SPACING_PRO.xxxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, boxShadow: SHADOWS_PRO.md }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ color: THEME_PRO.textSecondary }}>No orders found</Typography>
            </Box>
          </Card>
        ) : (
          <Card sx={{ backgroundColor: THEME_PRO.bgSecondary, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, overflow: 'hidden', boxShadow: SHADOWS_PRO.md, transition: TRANSITIONS_PRO.normal, '&:hover': { boxShadow: SHADOWS_PRO.lg } }}>
            <TableContainer sx={{ backgroundColor: THEME_PRO.bgSecondary }}>
              <Table>
                <TableHead sx={{ backgroundColor: THEME_PRO.bgTertiary, height: '48px' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Symbol</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qty</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date & Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} sx={{ borderBottom: `1px solid ${THEME_PRO.border}`, backgroundColor: THEME_PRO.bgSecondary, '&:hover': { backgroundColor: THEME_PRO.bgTertiary }, height: '56px' }}>
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
