import React from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'

const mockAccounts = [
  { id: 1, accountNumber: 'ACC-2026-00001', owner: 'Rajesh Kumar', type: 'Live', balance: '₹125,450', equity: '₹118,900', openPositions: 5, status: 'Active' },
  { id: 2, accountNumber: 'ACC-2026-00002', owner: 'Priya Sharma', type: 'Demo', balance: '₹50,000', equity: '₹48,500', openPositions: 2, status: 'Active' },
  { id: 3, accountNumber: 'ACC-2026-00003', owner: 'Amit Patel', type: 'Live', balance: '₹75,300', equity: '₹72,100', openPositions: 0, status: 'Inactive' },
]

export function AccountsPage() {
  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            💼 Trading Accounts
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>View all trading accounts linked to users</Typography>
        </Box>

        <Card sx={{ borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, overflow: 'hidden', backgroundColor: THEME_PRO.bgSecondary }}>
          <TableContainer sx={{ backgroundColor: THEME_PRO.bgSecondary }}>
            <Table>
              <TableHead sx={{ backgroundColor: THEME_PRO.bgTertiary }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Account Number</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Owner</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Balance</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Equity</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Open Positions</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockAccounts.map((acc) => (
                  <TableRow key={acc.id} sx={{ borderBottom: `1px solid ${THEME_PRO.border}`, backgroundColor: THEME_PRO.bgSecondary }}>
                    <TableCell sx={{ color: THEME_PRO.primary, fontWeight: 700 }}>{acc.accountNumber}</TableCell>
                    <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 600 }}>{acc.owner}</TableCell>
                    <TableCell><Chip label={acc.type} sx={{ backgroundColor: acc.type === 'Live' ? THEME_PRO.errorLight : THEME_PRO.successLight, color: acc.type === 'Live' ? THEME_PRO.error : THEME_PRO.success, fontWeight: 600 }} /></TableCell>
                    <TableCell sx={{ color: THEME_PRO.primary, fontWeight: 600 }}>{acc.balance}</TableCell>
                    <TableCell sx={{ color: THEME_PRO.textSecondary }}>{acc.equity}</TableCell>
                    <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 600 }}>{acc.openPositions}</TableCell>
                    <TableCell><Chip label={acc.status} sx={{ backgroundColor: acc.status === 'Active' ? THEME_PRO.successLight : THEME_PRO.bgTertiary, color: acc.status === 'Active' ? THEME_PRO.success : THEME_PRO.textSecondary, fontWeight: 600 }} /></TableCell>
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
