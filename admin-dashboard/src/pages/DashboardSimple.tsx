import React from 'react'
import { Layout } from '../components/Layout'
import { Box, Typography, Paper } from '@mui/material'
import { COLORS, SPACING, BORDER_RADIUS } from '../theme'

export function DashboardSimple() {
  return (
    <Layout>
      <Box sx={{ p: SPACING.xl }}>
        <Typography variant="h4" sx={{ color: COLORS.primary, mb: SPACING.lg, fontWeight: 'bold' }}>
          📊 Dashboard
        </Typography>

        <Paper
          sx={{
            p: SPACING.xl,
            backgroundColor: COLORS.bgMedium,
            borderLeft: `4px solid ${COLORS.primary}`,
            borderRadius: BORDER_RADIUS.lg,
          }}
        >
          <Typography variant="h6" sx={{ color: COLORS.primary, mb: SPACING.md }}>
            Welcome to Bot-Trade Dashboard
          </Typography>
          <Typography sx={{ color: COLORS.textSecondary, lineHeight: 1.8 }}>
            Your professional trading platform is ready. Navigate using the sidebar to access:
            <br/>
            • <strong>Users</strong> - Manage user accounts
            <br/>
            • <strong>Accounts</strong> - Trading accounts
            <br/>
            • <strong>Orders</strong> - View and manage orders
            <br/>
            • <strong>Settings</strong> - Configure your Zerodha API credentials
            <br/>
            • <strong>Diagnostics</strong> - Run system tests
            <br/>
            • <strong>Logs</strong> - View application logs
            <br/>
            <br/>
            ✅ All systems operational
          </Typography>
        </Paper>
      </Box>
    </Layout>
  )
}
