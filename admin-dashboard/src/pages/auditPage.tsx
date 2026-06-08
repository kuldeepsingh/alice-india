import React from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'

const auditLogs = [
  { time: '2024-06-08 14:32', action: 'API Key Updated', user: 'admin@example.com', details: 'Zerodha API key changed' },
  { time: '2024-06-08 13:15', action: 'Order Placed', user: 'trader@example.com', details: 'INFY buy order for 100 shares' },
  { time: '2024-06-08 12:45', action: 'Settings Modified', user: 'admin@example.com', details: 'Auto-refresh enabled' },
  { time: '2024-06-08 11:30', action: 'Login', user: 'admin@example.com', details: 'Successful login' },
]

export function auditPage() {
  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            📄 Audit Trail
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>View user actions and system events</Typography>
        </Box>

        <Card sx={{ borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: THEME_PRO.bgTertiary }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map((log, idx) => (
                  <TableRow key={idx} sx={{ borderBottom: `1px solid ${THEME_PRO.border}` }}>
                    <TableCell sx={{ color: THEME_PRO.textSecondary, fontSize: '13px' }}>{log.time}</TableCell>
                    <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 600 }}>{log.action}</TableCell>
                    <TableCell sx={{ color: THEME_PRO.primary }}>{log.user}</TableCell>
                    <TableCell sx={{ color: THEME_PRO.textSecondary }}>{log.details}</TableCell>
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
