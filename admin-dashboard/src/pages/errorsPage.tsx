import React from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Chip } from '@mui/material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'

const errors = [
  { code: 'ERR_001', type: 'Authentication', severity: 'high', count: 3, lastOccurrence: '2 hours ago' },
  { code: 'ERR_002', type: 'Database Connection', severity: 'critical', count: 1, lastOccurrence: '1 hour ago' },
  { code: 'ERR_003', type: 'API Timeout', severity: 'medium', count: 5, lastOccurrence: '30 minutes ago' },
  { code: 'ERR_004', type: 'Permission Denied', severity: 'low', count: 2, lastOccurrence: '15 minutes ago' },
]

export function errorsPage() {
  const getSeverityColor = (sev: string) => {
    const colors: {[key: string]: string} = { 'critical': THEME_PRO.error, 'high': THEME_PRO.error, 'medium': THEME_PRO.warning, 'low': THEME_PRO.info }
    return colors[sev] || THEME_PRO.textSecondary
  }

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            🚨 Error Tracking
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>Monitor system errors and issues</Typography>
        </Box>

        <Box sx={{ display: 'grid', gap: 2 }}>
          {errors.map((error, idx) => (
            <Card key={idx} sx={{ p: SPACING_PRO.lg, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: SPACING_PRO.lg, alignItems: 'center' }}>
                <Box sx={{ fontSize: '24px' }}>
                  {error.severity === 'critical' ? '🔴' : error.severity === 'high' ? '🟠' : error.severity === 'medium' ? '🟡' : '🟢'}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>{error.type}</Typography>
                  <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary }}>Code: {error.code} • Occurrences: {error.count} • Last: {error.lastOccurrence}</Typography>
                </Box>
                <Chip label={error.severity} sx={{ color: getSeverityColor(error.severity), backgroundColor: getSeverityColor(error.severity) + '20' }} />
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
    </LayoutPro>
  )
}
