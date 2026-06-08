import React, { useState } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material'
import { Add } from '@mui/icons-material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, SHADOWS_PRO } from '../theme-pro'

const mockAccounts = [
  { id: 1, name: 'Primary Trading Account', type: 'Live', balance: '$125,450', equity: '$118,900', openPositions: 5, status: 'Active' },
  { id: 2, name: 'Demo Account', type: 'Demo', balance: '$50,000', equity: '$48,500', openPositions: 2, status: 'Active' },
  { id: 3, name: 'Backup Account', type: 'Live', balance: '$75,300', equity: '$72,100', openPositions: 0, status: 'Inactive' },
]

export function AccountsPage() {
  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        <Box sx={{ mb: SPACING_PRO.xxxl, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
              💼 Trading Accounts
            </Typography>
            <Typography sx={{ color: THEME_PRO.textSecondary }}>Manage your trading accounts</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} sx={{ backgroundColor: THEME_PRO.primary, color: '#fff' }}>Add Account</Button>
        </Box>

        <Card sx={{ borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: THEME_PRO.bgTertiary }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Account</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Balance</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Equity</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Open Positions</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockAccounts.map((acc) => (
                  <TableRow key={acc.id} sx={{ borderBottom: `1px solid ${THEME_PRO.border}` }}>
                    <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 600 }}>{acc.name}</TableCell>
                    <TableCell><Chip label={acc.type} sx={{ backgroundColor: acc.type === 'Live' ? THEME_PRO.errorLight : THEME_PRO.successLight, color: acc.type === 'Live' ? THEME_PRO.error : THEME_PRO.success }} /></TableCell>
                    <TableCell sx={{ color: THEME_PRO.primary, fontWeight: 600 }}>{acc.balance}</TableCell>
                    <TableCell sx={{ color: THEME_PRO.textSecondary }}>{acc.equity}</TableCell>
                    <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 600 }}>{acc.openPositions}</TableCell>
                    <TableCell><Chip label={acc.status} sx={{ backgroundColor: acc.status === 'Active' ? THEME_PRO.successLight : THEME_PRO.bgTertiary, color: acc.status === 'Active' ? THEME_PRO.success : THEME_PRO.textSecondary }} /></TableCell>
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
