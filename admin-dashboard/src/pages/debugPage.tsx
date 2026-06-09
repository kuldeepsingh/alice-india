import React from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Chip } from '@mui/material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'

const sessions = [
  { id: 'DBG001', timestamp: '2024-06-08 14:30', endpoint: '/api/orders', status: 'success', responseTime: '145ms' },
  { id: 'DBG002', timestamp: '2024-06-08 14:25', endpoint: '/api/accounts', status: 'success', responseTime: '89ms' },
  { id: 'DBG003', timestamp: '2024-06-08 14:20', endpoint: '/api/trades', status: 'error', responseTime: '2500ms' },
]

export function debugPage() {
  return (
    <LayoutPro>
      <Box sx={{ backgroundColor: THEME_PRO.bgSecondary, p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            🐛 Debug Sessions
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>Monitor API requests and responses</Typography>
        </Box>

        <Box sx={{ backgroundColor: THEME_PRO.bgSecondary, display: 'grid', gap: 2 }}>
          {sessions.map((session) => (
            <Card key={session.id} sx={{ backgroundColor: THEME_PRO.bgSecondary, p: SPACING_PRO.lg, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: SPACING_PRO.lg, alignItems: 'center' }}>
              <Typography sx={{ fontSize: '20px' }}>{'📡'}</Typography>
              <Box>
                <Typography sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>{session.endpoint}</Typography>
                <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary }}>ID: {session.id} • {session.timestamp} • Response: {session.responseTime}</Typography>
              </Box>
              <Chip label={session.status} sx={{ backgroundColor: session.status === 'success' ? THEME_PRO.successLight : THEME_PRO.errorLight, color: session.status === 'success' ? THEME_PRO.success : THEME_PRO.error }} />
            </Card>
          ))}
        </Box>
      </Box>
    </LayoutPro>
  )
}
